<?php

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');

function responderConsultaPedido(int $status, array $dados): never
{
    http_response_code($status);

    echo json_encode(
        $dados,
        JSON_UNESCAPED_UNICODE | JSON_THROW_ON_ERROR
    );

    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    header('Allow: GET');

    responderConsultaPedido(405, [
        'erro' => 'Método não permitido. Use GET.',
    ]);
}

$idRecebido = $_GET['id'] ?? null;

// Parâmetros de URL chegam como texto.
// Também rejeitamos arrays como ?id[]=10.
if (
    !is_string($idRecebido)
    || !preg_match('/^[1-9][0-9]{0,9}$/D', $idRecebido)
) {
    responderConsultaPedido(400, [
        'erro' => 'Informe um número de pedido válido.',
    ]);
}

$idPedido = filter_var(
    $idRecebido,
    FILTER_VALIDATE_INT,
    [
        'options' => [
            'min_range' => 1,
            'max_range' => 2147483647,
        ],
    ]
);

if ($idPedido === false) {
    responderConsultaPedido(400, [
        'erro' => 'Informe um número de pedido válido.',
    ]);
}

try {
    require_once __DIR__ . '/../src/conexao.php';

    $pdo = conectarBanco();

    $consulta = $pdo->prepare(
        'SELECT id_pedido, vl_total
         FROM pedidos
         WHERE id_pedido = ?'
    );

    $consulta->execute([$idPedido]);
    $pedido = $consulta->fetch();

    if (!$pedido) {
        responderConsultaPedido(404, [
            'erro' => 'Pedido não encontrado.',
        ]);
    }

    responderConsultaPedido(200, [
        'pedido' => [
            'id_pedido' => (int) $pedido['id_pedido'],
            'valor_total' => (string) $pedido['vl_total'],
        ],
    ]);
} catch (Throwable $erro) {
    error_log(
        'Falha ao consultar pedido. Classe: ' . get_class($erro)
    );

    responderConsultaPedido(500, [
        'erro' => 'Não foi possível consultar o pedido.',
    ]);
}