use cafeteria;

alter table produtos
add constraint chk_proibe_negativo_preco check(preco >= 0);

alter table produtos
add constraint chk_proibe_negativo_estoque check(estoque >= 0);

alter table pedidos
add constraint chk_proibe_valor_negativo check(vl_total >= 0);

alter table categorias
add constraint chk_proibe_estoque_negativo check(quantidade_estoque >= 0);

alter table grupos_personalizacao
add constraint chk_proibe_quantidade_negativa check(qt_personalizacoes >= 0);

alter table itens
add constraint itens_chk_proibe_quantidade_negativa check(quantidade > 0);

alter table itens
add constraint itens_chk_proibe_valor_negativo check(preco_unitario >= 0);
desc opcoes_personalizacao;

alter table opcoes_personalizacao
add constraint op_chk_proibe_valor_negativo check(valor >= 0);

alter table pagamentos
add constraint p_proibe_valor_negativo check (valor >= 0);

alter table personalizacoes_escolhidas
add constraint pe_es_chk_proibe_valor_negativo check(valor_momento_personalizacao >= 0);