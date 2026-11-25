<?php

function validarPagamentoSimulado(mixed $dados): array
{
    if (!$dados instanceof stdClass) {
        throw new InvalidArgumentException(
            'O pagamento deve ser um objeto JSON.'
        );
    }

    // O navegador não pode escolher o valor da cobrança.
    $camposPermitidos = ['id_pedido', 'metodo', 'resultado'];

    foreach (array_keys(get_object_vars($dados)) as $campo) {
        if (!in_array($campo, $camposPermitidos, true)) {
            throw new InvalidArgumentException(
                "Campo não permitido: {$campo}."
            );
        }
    }

    $idPedido = $dados->id_pedido ?? null;
    $metodo = $dados->metodo ?? null;
    $resultado = $dados->resultado ?? null;

    if (!is_int($idPedido) || $idPedido <= 0) {
        throw new InvalidArgumentException(
            'O identificador do pedido deve ser um inteiro positivo.'
        );
    }

    if (!in_array($metodo, ['credito', 'debito', 'pix'], true)) {
        throw new InvalidArgumentException(
            'Escolha crédito, débito ou Pix.'
        );
    }

    if (!in_array($resultado, ['aprovado', 'recusado'], true)) {
        throw new InvalidArgumentException(
            'O resultado simulado deve ser aprovado ou recusado.'
        );
    }

    return [
        'id_pedido' => $idPedido,
        'metodo' => $metodo,
        'resultado' => $resultado,
    ];
}