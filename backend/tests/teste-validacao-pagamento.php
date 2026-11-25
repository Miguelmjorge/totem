<?php

if (PHP_SAPI !== 'cli') {
    http_response_code(404);
    exit;
}

require_once __DIR__ . '/../src/validacao_pagamento.php';

$casos = [
    ['Crédito aprovado',
        '{"id_pedido":10,"metodo":"credito","resultado":"aprovado"}', true],

    ['Débito recusado',
        '{"id_pedido":10,"metodo":"debito","resultado":"recusado"}', true],

    ['Pix aprovado',
        '{"id_pedido":10,"metodo":"pix","resultado":"aprovado"}', true],

    ['Pedido como texto',
        '{"id_pedido":"10","metodo":"pix","resultado":"aprovado"}', false],

    ['Pedido negativo',
        '{"id_pedido":-1,"metodo":"pix","resultado":"aprovado"}', false],

    ['Método desconhecido',
        '{"id_pedido":10,"metodo":"boleto","resultado":"aprovado"}', false],

    ['Resultado ausente',
        '{"id_pedido":10,"metodo":"pix"}', false],

    ['Valor enviado pelo navegador',
        '{"id_pedido":10,"metodo":"pix","resultado":"aprovado","valor":0.01}',
        false],

    ['Lista no lugar de objeto', '[]', false],
];

$falhas = 0;

foreach ($casos as [$nome, $json, $deveAceitar]) {
    try {
        $dados = json_decode($json, false, 64, JSON_THROW_ON_ERROR);
        validarPagamentoSimulado($dados);
        $aceitou = true;
    } catch (InvalidArgumentException | JsonException $erro) {
        $aceitou = false;
    }

    $passou = $aceitou === $deveAceitar;

    echo ($passou ? 'PASSOU' : 'FALHOU') . ": {$nome}" . PHP_EOL;

    if (!$passou) {
        $falhas++;
    }
}

echo PHP_EOL . "Falhas: {$falhas}" . PHP_EOL;

exit($falhas === 0 ? 0 : 1);