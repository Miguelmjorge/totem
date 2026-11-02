create database cafeteria;
use cafeteria;

create table pedidos(
id_pedido int not null auto_increment,
dt_pedido datetime not null,
vl_total decimal(8,2) not null,
situacao int,
constraint pk_pedidos
	primary key(id_pedido)
);

create table categoria(
id_categoria int not null,
nome_categoria varchar(30) not null,
descricao varchar(150),
disponibilidade boolean,
quantidade_estoque int,
constraint pk_categoria
	primary key(id_categoria)
);
rename table categoria to categorias;
create table pagamentos(
id_pagamento int not null auto_increment,
metodo int not null,
valor decimal(8,2) not null,
status_preparacao int,
dt_pagamento datetime not null,
id_pedido int not null,
constraint pk_pagamentos
	primary key(id_pagamento),
constraint fk_pagamento_pedido
	foreign key(id_pedido)
		references pedidos(id_pedido));
        
create table produtos(
id_produto int not null,
nome varchar(100) not null,
descricao varchar(150),
preco decimal(8,2) not null,
disponivel boolean,
estoque int not null,
imagem varchar(2048),
id_categoria int not null,
constraint pk_produtos
	primary key(id_produto),
constraint fk_produto_categoria
	foreign key (id_categoria)
		references categorias(id_categoria)
);

create table itens(
id_item int not null auto_increment,
id_pedido int not null,
id_produto int not null,
nome_item varchar(100) not null,
descricao_item varchar(150),
quantidade int not null,
preco_unitario decimal(8,2),
constraint pk_item
	primary key(id_item),
constraint fk_item_produto
	foreign key(id_pedido)
		references produtos(id_produto),
constraint fk_item_pedido
	foreign key(id_produto)
		references produtos(id_produto)
);

create table grupos_personalizacao(
id_grupo int not null auto_increment,
id_produto int not null,
nome_crupo varchar(45) not null,
qt_personalizacoes int,
constraint pk_grupo
	primary key(id_grupo),
constraint fk_grupo_produto
	foreign key(id_produto)
		references produtos(id_produto)
);

create table opcoes_personalizacao(
id_opcao int not null,
id_grupo int not null,
nome varchar(100),
valor decimal(8,2),
constraint pk_opcoes
	primary key(id_opcao),
constraint fk_grupo_opcao_personalizacao
	foreign key(id_grupo)
		references grupos_personalizacao(id_grupo)
);

create table personalizacoes_escolhidas(
id_personalizacao_escolhida int not null auto_increment,
id_opcao int not null,
id_item int not null,
valor_momento_personalizacao decimal(8,2) not null,
constraint pk_personalizacao_escolhida
	primary key(id_personalizacao_escolhida),
constraint fk_opcao_personalizacao_escolhida
	foreign key(id_opcao)
		references opcoes_personalizacao(id_opcao),
constraint fk_item_personalizacao_escolhida
	foreign key(id_item)
		references itens(id_item)
);




-- Remover a chave estrangeira temporariamente
ALTER TABLE produtos
DROP FOREIGN KEY fk_produto_categoria;

-- Adicionar AUTO_INCREMENT
ALTER TABLE categorias
MODIFY COLUMN id_categoria INT NOT NULL AUTO_INCREMENT;

-- Recriar o relacionamento
ALTER TABLE produtos
ADD CONSTRAINT fk_produto_categoria
FOREIGN KEY (id_categoria)
REFERENCES categorias(id_categoria);

-- Remover relacionamentos da tabela itens
ALTER TABLE itens
DROP FOREIGN KEY fk_item_produto,
DROP FOREIGN KEY fk_item_pedido;

-- Remover relacionamento dos grupos
ALTER TABLE grupos_personalizacao
DROP FOREIGN KEY fk_grupo_produto;

-- Adicionar AUTO_INCREMENT
ALTER TABLE produtos
MODIFY COLUMN id_produto INT NOT NULL AUTO_INCREMENT;

-- Recriar relacionamento com os grupos
ALTER TABLE grupos_personalizacao
ADD CONSTRAINT fk_grupo_produto
FOREIGN KEY (id_produto)
REFERENCES produtos(id_produto);

-- Recriar os relacionamentos de itens
-- Corrigindo também a inversão do SQL original
ALTER TABLE itens
ADD CONSTRAINT fk_item_produto
FOREIGN KEY (id_produto)
REFERENCES produtos(id_produto),
ADD CONSTRAINT fk_item_pedido
FOREIGN KEY (id_pedido)
REFERENCES pedidos(id_pedido);

-- Remover relacionamento temporariamente
ALTER TABLE personalizacoes_escolhidas
DROP FOREIGN KEY fk_opcao_personalizacao_escolhida;

-- Adicionar AUTO_INCREMENT
ALTER TABLE opcoes_personalizacao
MODIFY COLUMN id_opcao INT NOT NULL AUTO_INCREMENT;

-- Recriar relacionamento
ALTER TABLE personalizacoes_escolhidas
ADD CONSTRAINT fk_opcao_personalizacao_escolhida
FOREIGN KEY (id_opcao)
REFERENCES opcoes_personalizacao(id_opcao);

SHOW COLUMNS FROM categorias;
SHOW COLUMNS FROM produtos;
SHOW COLUMNS FROM opcoes_personalizacao;

SHOW CREATE TABLE itens;
SHOW CREATE TABLE grupos_personalizacao;
SHOW CREATE TABLE personalizacoes_escolhidas;