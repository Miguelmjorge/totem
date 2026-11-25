<?php

function exigirPagamentoSimuladoHabilitado(array $config): void
{
    if (($config['pagamento_simulado_habilitado'] ?? false) !== true) {
        throw new RuntimeException(
            'O pagamento simulado está desabilitado neste ambiente.'
        );
    }
}