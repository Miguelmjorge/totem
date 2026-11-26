<?php

if (PHP_SAPI !== 'cli') {
    http_response_code(404);
    exit;
}

require_once __DIR__ . '/../src/simulacao_pagamento.php';

$casos = [
    ['Opção ausente', [], false],
    ['Desativado', ['pagamento_simulado_habilitado' => false], false],
    ['Texto não habilita', ['pagamento_simulado_habilitado' => 'true'], false],
    ['Número não habilita', ['pagamento_simulado_habilitado' => 1], false],
    ['Habilitado', ['pagamento_simulado_habilitado' => true], true],
];

$falhas = 0;

foreach ($casos as [$nome, $config, $devePermitir]) {
    try {
        exigirPagamentoSimuladoHabilitado($config);
        $permitiu = true;
    } catch (RuntimeException $erro) {
        $permitiu = false;
    }

    $passou = $permitiu === $devePermitir;

    echo ($passou ? 'PASSOU' : 'FALHOU') . ": {$nome}" . PHP_EOL;

    if (!$passou) {
        $falhas++;
    }
}

echo PHP_EOL . "Falhas: {$falhas}" . PHP_EOL;
exit($falhas === 0 ? 0 : 1);