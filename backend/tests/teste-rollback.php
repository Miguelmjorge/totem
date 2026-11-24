<?php

// Este arquivo só pode ser executado pelo terminal.
if (PHP_SAPI !== 'cli') {
    http_response_code(404);
    exit;
}

require_once __DIR__ . '/../src/conexao.php';
require_once __DIR__ . '/../src/criar_pedido.php';

class FalhaPlanejada extends RuntimeException
{
}

// Usa consultas reais, mas provoca uma falha após inserir um item.
class StatementComFalha extends PDOStatement
{
    public static ?array $durante = null;

    protected function __construct(private PDO $pdo)
    {
    }

    public function execute(?array $params = null): bool
    {
        $resultado = parent::execute($params);

        if (preg_match('/^\s*INSERT\s+INTO\s+itens\b/i', $this->queryString)) {
            self::$durante = capturarEstado($this->pdo);

            throw new FalhaPlanejada(
                'Falha proposital após gravar o primeiro item.'
            );
        }

        return $resultado;
    }
}

function capturarEstado(PDO $pdo): array
{
    return [
        'pedidos' => (int) $pdo->query(
            'SELECT COUNT(*) FROM pedidos'
        )->fetchColumn(),

        'itens' => (int) $pdo->query(
            'SELECT COUNT(*) FROM itens'
        )->fetchColumn(),

        'estoque' => (int) $pdo->query(
            'SELECT estoque FROM produtos WHERE id_produto = 1'
        )->fetchColumn(),
    ];
}

$pdo = null;
$codigoSaida = 1;

try {
    $pdo = conectarBanco();

    // Aplica a simulação apenas à conexão deste teste.
    $pdo->setAttribute(
        PDO::ATTR_STATEMENT_CLASS,
        [StatementComFalha::class, [$pdo]]
    );

    $antes = capturarEstado($pdo);

    if ($antes['estoque'] < 1) {
        throw new RuntimeException(
            'O produto 1 precisa ter pelo menos uma unidade em estoque.'
        );
    }

    $falhaAconteceu = false;

    try {
        criarPedido($pdo, [
            [
                'id_produto' => 1,
                'quantidade' => 1,
                'opcoes' => [],
            ],
        ]);
    } catch (FalhaPlanejada $erro) {
        $falhaAconteceu = true;
    }

    // Conferimos antes de qualquer limpeza feita pelo próprio teste.
    $transacaoFechada = !$pdo->inTransaction();
    $depois = capturarEstado($pdo);
    $durante = StatementComFalha::$durante;

    echo json_encode(
        [
            'antes' => $antes,
            'durante' => $durante,
            'depois' => $depois,
            'transacao_fechada' => $transacaoFechada,
        ],
        JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_THROW_ON_ERROR
    ) . PHP_EOL;

    $gravouAntesDaFalha =
        $durante !== null
        && $durante['pedidos'] === $antes['pedidos'] + 1
        && $durante['itens'] === $antes['itens'] + 1
        && $durante['estoque'] === $antes['estoque'] - 1;

    if (
        !$falhaAconteceu
        || !$gravouAntesDaFalha
        || !$transacaoFechada
        || $antes !== $depois
    ) {
        throw new RuntimeException(
            'O teste não comprovou todas as condições do rollback.'
        );
    }

    echo "PASSOU: pedido, item e baixa de estoque foram desfeitos."
        . PHP_EOL;

    $codigoSaida = 0;
} catch (Throwable $erro) {
    // Evita exibir detalhes de conexão ou credenciais.
    $mensagem = $erro instanceof PDOException
        ? 'Falha de banco. Confira conexão, permissões e estrutura.'
        : $erro->getMessage();

    fwrite(STDERR, "FALHOU: {$mensagem}" . PHP_EOL);
} finally {
    // Proteção adicional: não deixa uma transação aberta se o teste falhar.
    if ($pdo instanceof PDO && $pdo->inTransaction()) {
        $pdo->rollBack();
    }
}

exit($codigoSaida);