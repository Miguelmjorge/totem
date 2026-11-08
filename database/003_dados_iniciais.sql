USE cafeteria;

START TRANSACTION;

INSERT INTO categorias (id_categoria, nome_categoria, descricao, disponibilidade, quantidade_estoque) VALUES
(1, 'Cafés Quentes', NULL, 1, NULL),
(2, 'Cafés Gelados', NULL, 1, NULL),
(3, 'Outras Bebidas', NULL, 1, NULL),
(4, 'Pães e Omeletes', NULL, 1, NULL),
(5, 'Salgados', NULL, 1, NULL),
(6, 'Bolos e Doces', NULL, 1, NULL);

INSERT INTO produtos (id_produto, nome, descricao, preco, disponivel, estoque, imagem, id_categoria) VALUES
(1, 'Espresso Tradicional', 'Café curto, encorpado e aromático', 6.00, 0, 0, 'https://images.rawpixel.com/image_800/cHJpdmF0ZS9sci9pbWFnZXMvd2Vic2l0ZS8yMDIzLTEyL3Jhd3BpeGVsb2ZmaWNlN19waG90b19vZl9jb2ZmZWVfY3VwX29mX2FtZXJpY2Fub19uYXR1cmFsX2xpZ2h0X19mMjZkZDE3Yy1mYTBkLTQ0NzAtOThmYS1iYmFiNGI3ZWM5NmFfMS5qcGc.jpg', 1),
(2, 'Espresso Duplo', 'Dose em dobro para quem ama um café forte', 8.50, 0, 0, 'https://t4.ftcdn.net/jpg/00/06/86/53/360_F_6865318_1vv4kgFXbpAe0CGWzRa3msKRnc0Nr5pj.jpg', 1),
(3, 'Cappuccino Cremoso', 'Espresso, leite vaporizado, cacau e um toque de canela', 10.00, 0, 0, 'https://tse2.mm.bing.net/th/id/OIP.j49o--LsgMdl3E1-ezRpkgHaEK?r=0&rs=1&pid=ImgDetMain&o=7&rm=3', 1),
(4, 'Café com Leite', 'A clássica combinação da casa com um leite quentinho', 7.00, 0, 0, 'https://www.maquinascafeexpresso.com/wp-content/uploads/2019/07/quais-sao-caracteristicas-cafe-leite-2.jpg', 1),
(5, 'Latte Macchiato', 'Leite vaporizado com uma mancha de espresso', 10.50, 0, 0, 'https://snapcalorie-webflow-website.s3.us-east-2.amazonaws.com/media/food_pics_v2/latte_macchiato.jpg', 1),
(6, 'Mocha', 'Espresso, calda de chocolate, leite vaporizado e chantilly', 12.00, 0, 0, 'https://i.pinimg.com/736x/71/53/9a/71539aff0387ab8c23476269d357624e.jpg', 1),
(7, 'Café Coado', 'Café filtrado na hora, leve e muito aromático', 6.50, 0, 0, 'https://tudodelicious.com/wp-content/uploads/2026/04/Cafe-coado-perfeito.png', 1),
(8, 'Iced Latte', 'Espresso, leite gelado e cubos de gelo', 11.00, 0, 0, 'https://www.forkinthekitchen.com/wp-content/uploads/2022/07/220629.iced_.latte_.vanilla-8882.jpg', 2),
(9, 'Iced Mocha', 'Café gelado com calda de chocolate, leite e gelo', 14.00, 0, 0, 'https://www.everyday-delicious.com/wp-content/uploads/2022/07/iced-mocha-everyday-delicious-1.jpg', 2),
(10, 'Frappé de Café', 'Café batido com gelo, leite e cobertura de chantilly.', 14.00, 0, 0, 'https://editorialtelevisa.brightspotcdn.com/dims4/default/5a6ee05/2147483647/strip/true/crop/1200x675+0+13/resize/1440x810!/quality/90/?url=https:%2F%2Fk2-prod-editorial-televisa.s3.us-east-1.amazonaws.com%2Fbrightspot%2Fb1%2Fa7%2Fc1ff8bd04c80a69f2354235e4cfd%2Ffrappe-de-cafe.jpg', 2),
(11, 'Cold Brew', 'Café extraído a frio por 12 horas, super refrescante.', 12.00, 0, 0, 'https://tse4.mm.bing.net/th/id/OIP.l2mhvIVQBPtcOIl3HWDfPAHaJQ?r=0&rs=1&pid=ImgDetMain&o=7&rm=3', 2),
(12, 'Suco Natural de Laranja', 'Feito na hora, 100% fruta e refrescante.', 8.00, 0, 0, 'https://chefpvshow.com.br/wp-content/uploads/2026/03/suco-de-laranja-do-chef-pv-show-1-1024x683.png', 3),
(13, 'Suco Natural de Maracujá', 'Feito na hora, 100% fruta e refrescante.', 8.00, 0, 0, 'https://www.estadao.com.br/resizer/v2/C3ZO473O5FHL7JY53KXPYALU54.jpeg?quality=80&auth=39e4a319f3c0bd9a4fb20e29095316cdd4a582ae6d4e2cab5008382ee2f1d96e&width=1200', 3),
(14, 'Suco Natural de Limão', 'Feito na hora, 100% fruta e refrescante.', 8.00, 0, 0, 'https://tse1.mm.bing.net/th/id/OIP.o15KSiHGwDZZQrNkx08mOgHaEK?r=0&rs=1&pid=ImgDetMain&o=7&rm=3', 3),
(15, 'Suco Natural de Morango', 'Feito na hora, 100% fruta e refrescante.', 8.00, 0, 0, 'https://vitat.com.br/receitas/images/recipeshandler.jpg?id=48368&tipo=r&default=s&ims=fit-in/414x275/filters:quality(60)', 3),
(16, 'Suco Natural de Abacaxi', 'Feito na hora, 100% fruta e refrescante.', 8.00, 0, 0, 'https://tse2.mm.bing.net/th/id/OIP._mmQlDxNDGaX93Pb_ObvgQHaFT?r=0&rs=1&pid=ImgDetMain&o=7&rm=3', 3),
(17, 'Suco Natural de Abacaxi com Hortelã', 'Feito na hora, 100% fruta e refrescante.', 10.00, 0, 0, 'https://tse2.mm.bing.net/th/id/OIP.AmyCi1KEzSbkTsK59z7t-AHaE8?r=0&rs=1&pid=ImgDetMain&o=7&rm=3', 3),
(18, 'Suco Verde Detox', 'Couve, limão, abacaxi e gengibre batidos na hora.', 10.00, 0, 0, '../img/suco-verde.jpg', 3),
(19, 'Suco de Frutas Vermelhas', 'Morango, framboesa e amora batidos com água ou leite.', 11.00, 0, 0, '../img/suco-vermelhas.jpg', 3),
(20, 'Refrigerante Lata (350ml)', 'Diversos sabores (Coca-Cola, Guaraná, Sprite, etc.).', 6.00, 0, 0, '../img/refrigerante.jpg', 3),
(21, 'Pão de Queijo Tradicional', 'Quentinho, crocante por fora e macio por dentro.', 5.00, 0, 0, '../img/pao-queijo.jpg', 4),
(22, 'Pão de Queijo Recheado com Requeijão', 'Aquela delícia mineira recheada com muito requeijão cremoso.', 7.50, 0, 0, '../img/pao-queijo-recheado.jpg', 4),
(23, 'Pão Doce Caseiro', 'Pão doce macio com cobertura de açúcar cristal.', 6.00, 0, 0, '../img/pao-doce.jpg', 4),
(24, 'Pão na Chapa com Manteiga', 'Pão francês fresquinho tostado na chapa com manteiga.', 4.50, 0, 0, '../img/pao-chapa.jpg', 4),
(25, 'Omelete Completa', 'Ovos, queijo derretido, presunto e tomate fresco picadinho.', 14.00, 0, 0, '../img/omelete.jpg', 4),
(26, 'Coxinha de Frango com Catupiry', 'Massa crocante e recheio cremoso de frango desfiado.', 8.50, 0, 0, '../img/coxinha.jpg', 5),
(27, 'Kibe Frito', 'Kibe crocante temperado com especiarias e carne selecionada.', 8.00, 0, 0, '../img/kibe.jpg', 5),
(28, 'Esfiha de Carne', 'Massa assada macia com recheio suculento de carne.', 8.00, 0, 0, '../img/esfiha.jpg', 5),
(29, 'Empadão de Frango', 'Fatia de empadão amanteigado recheado com frango e azeitona.', 9.50, 0, 0, '../img/empadao.jpg', 5),
(30, 'Fatia de Bolo de Chocolate', 'Bolo fofinho com cobertura generosa de chocolate cremosa.', 10.00, 0, 0, '../img/bolo-chocolate.jpg', 6),
(31, 'Fatia de Bolo de Cenoura com Chocolate', 'O clássico bolo de cenoura com casquinha crocante de chocolate.', 9.50, 0, 0, '../img/bolo-cenoura.jpg', 6),
(32, 'Bolo de Fubá Cremoso', 'Fatia de bolo caseiro de fubá com aquela textura cremosa.', 8.00, 0, 0, '../img/bolo-fuba.jpg', 6),
(33, 'Salada de Frutas', 'Mix de frutas frescas da estação picadas (com opção de leite condensado ou mel).', 10.00, 0, 0, '../img/salada-frutas.jpg', 6),
(34, 'Tortinha de Limão', 'Massa crocante, recheio cítrico e cobertura de suspiro leve.', 11.00, 0, 0, '../img/tortinha-limao.jpg', 6);

COMMIT;