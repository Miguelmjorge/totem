<?php

header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    header('Allow: GET');

    echo json_encode(
        ['erro' => 'Método não permitido. Use GET.'],
        JSON_UNESCAPED_UNICODE
    );

    exit;
}

try {
    require_once __DIR__ . '/../src/conexao.php';

    $pdo = conectarBanco();

    $consultaCategorias = $pdo->query(
        'SELECT id_categoria, nome_categoria, descricao
         FROM categorias
         WHERE disponibilidade = 1
         ORDER BY id_categoria'
    );

    $consultaProdutos = $pdo->query(
        'SELECT
             p.id_produto,
             p.id_categoria,
             p.nome,
             p.descricao,
             p.preco,
             p.imagem
         FROM produtos AS p
         INNER JOIN categorias AS c
             ON c.id_categoria = p.id_categoria
         WHERE p.disponivel = 1
           AND p.estoque > 0
           AND c.disponibilidade = 1
         ORDER BY p.id_produto'
    );

    $cardapio = [
        'categorias' => $consultaCategorias->fetchAll(),
        'produtos' => $consultaProdutos->fetchAll(),
    ];

    echo json_encode(
        $cardapio,
        JSON_UNESCAPED_UNICODE
        | JSON_PRETTY_PRINT
        | JSON_THROW_ON_ERROR
    );
} catch (Throwable $erro) {
    error_log(
    'Falha ao carregar o cardápio: '
    . get_class($erro)
    . ' | ' . $erro->getMessage()
    . ' | Arquivo: ' . $erro->getFile()
    . ' | Linha: ' . $erro->getLine()
);

    http_response_code(503);

    echo json_encode(
        ['erro' => 'Cardápio temporariamente indisponível.'],
        JSON_UNESCAPED_UNICODE
    );
}