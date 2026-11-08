INSERT INTO pedidos
(id_pedido, dt_pedido, vl_total, situacao)
VALUES
(201, NOW(), 6.00, 1),
(202, NOW(), 8.50, 1),
(203, NOW(), 12.00, 1),
(204, NOW(), 8.50, 1),
(205, NOW(), 12.50, 1);

INSERT INTO grupos_personalizacao
(id_grupo, id_produto, nome_crupo, qt_personalizacoes)
VALUES
(201, 1, 'Acucar', 1),
(202, 2, 'Acucar', 1),
(203, 3, 'Tipo de leite', 1),
(204, 4, 'Tipo de leite', 1),
(205, 5, 'Calda extra', 1);

INSERT INTO opcoes_personalizacao
(id_opcao, id_grupo, nome, valor)
VALUES
(201, 201, 'Sem acucar', 0.00),
(202, 202, 'Com acucar', 0.00),
(203, 203, 'Leite vegetal', 2.00),
(204, 204, 'Leite sem lactose', 1.50),
(205, 205, 'Calda de caramelo', 2.00);

INSERT INTO itens
(id_item, id_pedido, id_produto, nome_item,
 descricao_item, quantidade, preco_unitario)
VALUES
(201, 201, 1, 'Espresso Tradicional',
 'Cafe curto e encorpado', 1, 6.00),
(202, 202, 2, 'Espresso Duplo',
 'Dose dupla de espresso', 1, 8.50),

(203, 203, 3, 'Cappuccino Cremoso',
 'Espresso com leite e cacau', 1, 10.00),

(204, 204, 4, 'Cafe com Leite',
 'Cafe com leite vaporizado', 1, 7.00),

(205, 205, 5, 'Latte Macchiato',
 'Leite vaporizado com espresso', 1, 10.50);

INSERT INTO personalizacoes_escolhidas
(id_opcao, id_item, valor_momento_personalizacao)
VALUES
(201, 201, 0.00),
(202, 202, 0.00),
(203, 203, 2.00),
(204, 204, 1.50),
(205, 205, 2.00);

INSERT INTO pagamentos
(metodo, valor, status_preparacao, dt_pagamento, id_pedido)
VALUES
(1, 6.00, 1, NOW(), 201),
(2, 8.50, 1, NOW(), 202),
(1, 12.00, 1, NOW(), 203),
(3, 8.50, 1, NOW(), 204),
(2, 12.50, 1, NOW(), 205);

