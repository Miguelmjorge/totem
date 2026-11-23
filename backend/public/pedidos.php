<?php

header('Content-Type: application/json; charset=utf-8');

function responderPedido(int $status, array $dados): never
{
    http_response_code($status);

    echo json_encode(
        $dados,
        JSON_UNESCAPED_UNICODE | JSON_THROW_ON_ERROR
    );

    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    header('Allow: POST');

    responderPedido(405, [
        'erro' => 'Método não permitido. Use POST.',
    ]);
}

$tipoConteudo = strtolower(
    trim(explode(';', $_SERVER['CONTENT_TYPE'] ?? '')[0])
);

if ($tipoConteudo !== 'application/json') {
    responderPedido(415, [
        'erro' => 'Envie o pedido com Content-Type application/json.',
    ]);
}

try {
    require_once __DIR__ . '/../src/validacao_pedido.php';
    require_once __DIR__ . '/../src/conexao.php';
    require_once __DIR__ . '/../src/criar_pedido.php';

    // Lê até 64 KiB mais um byte para identificar excesso.
    $corpo = file_get_contents('php://input', false, null, 0, 65537);

    if ($corpo === false) {
        throw new RuntimeException('Não foi possível ler a requisição.');
    }

    if (strlen($corpo) > 65536) {
        responderPedido(413, [
            'erro' => 'O conteúdo do pedido excede o tamanho permitido.',
        ]);
    }

    $objeto = json_decode(
        $corpo,
        false,
        64,
        JSON_THROW_ON_ERROR
    );

    if (!$objeto instanceof stdClass) {
        throw new InvalidArgumentException(
            'O pedido deve ser um objeto JSON.'
        );
    }

    $dados = json_decode(
        $corpo,
        true,
        64,
        JSON_THROW_ON_ERROR
    );

    $itens = validarPedido($dados);

    // Será substituído pela gravação transacional na próxima etapa.
    $pdo = conectarBanco();
$pedido = criarPedido($pdo, $itens);

responderPedido(201, [
    'mensagem' => 'Pedido criado.',
    'pedido' => $pedido,
]);
} catch (JsonException $erro) {
    responderPedido(400, [
        'erro' => 'O corpo da requisição contém JSON inválido.',
    ]);
} catch (InvalidArgumentException $erro) {
    responderPedido(400, [
        'erro' => $erro->getMessage(),
    ]);
    } catch (DomainException $erro) {
    responderPedido(409, [
        'erro' => $erro->getMessage(),
    ]);
} catch (PDOException $erro) {
    $codigoMySQL = (int) ($erro->errorInfo[1] ?? 0);

    if (
        $erro->getCode() === '45000'
        || in_array($codigoMySQL, [1205, 1213], true)
    ) {
        responderPedido(409, [
            'erro' => 'Não foi possível concluir o pedido devido ao estoque ou a uma compra simultânea. Revise o carrinho.',
        ]);
    }

    error_log('Falha de banco ao criar pedido. Código: ' . $codigoMySQL);

    responderPedido(500, [
        'erro' => 'Não foi possível registrar o pedido.',
    ]); 
} catch (Throwable $erro) {
    error_log('Falha no endpoint de pedidos: ' . get_class($erro));

    responderPedido(500, [
        'erro' => 'Não foi possível processar o pedido.',
    ]);
}