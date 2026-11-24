<?php

function validarPedido(mixed $dados): array
{
    if (!is_array($dados)) {
        throw new InvalidArgumentException(
            'O pedido deve ser um objeto JSON.'
        );
    }

    $itens = $dados['itens'] ?? null;

    if (
        !is_array($itens)
        || !array_is_list($itens)
        || count($itens) === 0
        || count($itens) > 50
    ) {
        throw new InvalidArgumentException(
            'O pedido deve conter uma lista de 1 a 50 itens.'
        );
    }

    $itensValidados = [];

    foreach ($itens as $indice => $item) {
        $posicao = $indice + 1;

        if (!is_array($item)) {
            throw new InvalidArgumentException(
                "O item {$posicao} deve ser um objeto."
            );
        }

        $idProduto = $item['id_produto'] ?? null;
        $quantidade = $item['quantidade'] ?? null;
        $opcoes = $item['opcoes'] ?? [];

        if (!is_int($idProduto) || $idProduto <= 0) {
            throw new InvalidArgumentException(
                "O item {$posicao} deve informar um id_produto inteiro positivo."
            );
        }

        if (
            !is_int($quantidade)
            || $quantidade < 1
            || $quantidade > 99
        ) {
            throw new InvalidArgumentException(
                "A quantidade do item {$posicao} deve ser um inteiro de 1 a 99."
            );
        }

        if (
            !is_array($opcoes)
            || !array_is_list($opcoes)
            || count($opcoes) > 30
        ) {
            throw new InvalidArgumentException(
                "As opções do item {$posicao} devem ser uma lista de até 30 IDs."
            );
        }

        $opcoesValidadas = [];

        foreach ($opcoes as $idOpcao) {
            if (!is_int($idOpcao) || $idOpcao <= 0) {
                throw new InvalidArgumentException(
                    "As opções do item {$posicao} devem conter IDs inteiros positivos."
                );
            }

            if (in_array($idOpcao, $opcoesValidadas, true)) {
                throw new InvalidArgumentException(
                    "O item {$posicao} contém uma opção repetida."
                );
            }

            $opcoesValidadas[] = $idOpcao;
        }

        $itensValidados[] = [
            'id_produto' => $idProduto,
            'quantidade' => $quantidade,
            'opcoes' => $opcoesValidadas,
        ];
    }

    return $itensValidados;
}