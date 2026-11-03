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

// Estrutura inicial. As listas serão preenchidas pelo MySQL.
$cardapio = [
    'categorias' => [],
    'produtos' => [],
];

echo json_encode(
    $cardapio,
    JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT
);