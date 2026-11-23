<?php

function criarPedido(PDO $pdo, array $itens): array
{
    $pdo->beginTransaction();

    try {
        $buscarProduto = $pdo->prepare(
            'SELECT p.id_produto, p.nome, p.descricao, p.preco,
                    p.disponivel, p.estoque,
                    c.disponibilidade AS categoria_disponivel
             FROM produtos p
             INNER JOIN categorias c
                 ON c.id_categoria = p.id_categoria
             WHERE p.id_produto = ?'
        );

        $buscarGrupos = $pdo->prepare(
            'SELECT COUNT(*)
             FROM grupos_personalizacao
             WHERE id_produto = ?'
        );

        $itensPreparados = [];
        $quantidadesPorProduto = [];
        $totalCentavos = 0;

        foreach ($itens as $item) {
            if ($item['opcoes'] !== []) {
                throw new DomainException(
                    'Pedidos com personalizações ainda não estão disponíveis.'
                );
            }

            $buscarProduto->execute([$item['id_produto']]);
            $produto = $buscarProduto->fetch();

            if (!$produto) {
                throw new DomainException('Produto não encontrado.');
            }

            if (
                (int) $produto['disponivel'] !== 1
                || (int) $produto['categoria_disponivel'] !== 1
            ) {
                throw new DomainException(
                    "O produto {$produto['nome']} está indisponível."
                );
            }

            $buscarGrupos->execute([$item['id_produto']]);

            if ((int) $buscarGrupos->fetchColumn() > 0) {
                throw new DomainException(
                    "O produto {$produto['nome']} exige o fluxo de personalizações, ainda não implementado."
                );
            }

            $idProduto = (int) $produto['id_produto'];

            $quantidadesPorProduto[$idProduto] =
                ($quantidadesPorProduto[$idProduto] ?? 0)
                + $item['quantidade'];

            if (
                $quantidadesPorProduto[$idProduto]
                > (int) $produto['estoque']
            ) {
                throw new DomainException(
                    "Estoque insuficiente para {$produto['nome']}."
                );
            }

            // O MySQL retorna DECIMAL com duas casas: "6.00".
            $preco = (string) $produto['preco'];

            if (!preg_match('/^\d+\.\d{2}$/', $preco)) {
                throw new RuntimeException('Preço inválido no cadastro.');
            }

            $precoCentavos = (int) str_replace('.', '', $preco);

            $totalCentavos += $precoCentavos * $item['quantidade'];

            // Limite da coluna DECIMAL(8,2): 999999.99.
            if ($totalCentavos > 99999999) {
                throw new DomainException(
                    'O valor do pedido excede o limite permitido.'
                );
            }

            $itensPreparados[] = [
                'id_produto' => $idProduto,
                'nome' => $produto['nome'],
                'descricao' => $produto['descricao'],
                'quantidade' => $item['quantidade'],
                'preco' => $preco,
            ];
        }

        $total = intdiv($totalCentavos, 100)
            . '.'
            . str_pad(
                (string) ($totalCentavos % 100),
                2,
                '0',
                STR_PAD_LEFT
            );

        $inserirPedido = $pdo->prepare(
            'INSERT INTO pedidos (dt_pedido, vl_total, situacao)
             VALUES (NOW(), ?, NULL)'
        );

        // NULL: situação ainda não definida pela equipe.
        // Não representa pagamento aprovado.
        $inserirPedido->execute([$total]);

        $idPedido = (int) $pdo->lastInsertId();

        $inserirItem = $pdo->prepare(
            'INSERT INTO itens (
                id_pedido, id_produto, nome_item,
                descricao_item, quantidade, preco_unitario
             ) VALUES (?, ?, ?, ?, ?, ?)'
        );

        // Ordem consistente reduz a chance de bloqueios cruzados.
        usort(
            $itensPreparados,
            fn(array $a, array $b): int =>
                $a['id_produto'] <=> $b['id_produto']
        );

        foreach ($itensPreparados as $item) {
            $inserirItem->execute([
                $idPedido,
                $item['id_produto'],
                $item['nome'],
                $item['descricao'],
                $item['quantidade'],
                $item['preco'],
            ]);
        }

        $pdo->commit();

        return [
            'id_pedido' => $idPedido,
            'valor_total' => $total,
        ];
    } catch (Throwable $erro) {
        if ($pdo->inTransaction()) {
            $pdo->rollBack();
        }

        throw $erro;
    }
}