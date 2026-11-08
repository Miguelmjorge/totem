use cafeteria;

delimiter $$
create trigger trg_baixar_estoque_item
before insert on itens
for each row
begin
	update produtos
	set estoque = estoque - new.quantidade
    where id_produto = new.id_produto and estoque >= new.quantidade;
	if row_count() = 0 then
		signal sqlstate '45000'
			set message_text = 'Estoque insuficiente para a quantidade desejada de itens.';
	end if;

end $$

delimiter ;
show triggers;
delimiter $$
create trigger trg_aumentar_estoque_item
after delete on itens
for each row
begin update produtos
	set estoque = estoque + old.quantidade
    where id_produto = old.id_produto;
end $$
delimiter ;

delimiter $$
create trigger trg_atualizar_estoque_item
after update on itens
for each row
begin
	if new.quantidade > old.quantidade then
		update produtos
		set estoque = estoque - (new.quantidade - old.quantidade)
        where id_produto = new.id_produto and estoque >= (new.quantidade - old.quantidade);
		if row_count() = 0 then
			signal sqlstate '45000'
			set message_text = 'Quantidade indisponível em estoque';
		end if;
	elseif new.quantidade < old.quantidade then
		update produtos
		set estoque = estoque + (old.quantidade - new.quantidade)
        where id_produto = new.id_produto;
	end if;
end $$
delimiter ;