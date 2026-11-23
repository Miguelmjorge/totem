async function carregarProdutos() {
  const resposta = await fetch("../../backend/public/cardapio.php");
  const dados = await resposta.json();

  const secoes = dados.categorias.map((categoria) => {
    const produtos_categoria = dados.produtos.filter(
      (produto) => produto.id_categoria === categoria.id_categoria,
    );

    const cards = produtos_categoria.map(
      (produto) => `
      <div class="item-cardapio">
        <img src="${produto.imagem}" alt="${produto.nome}" class="foto-produto">
        <div class="info-produto">
          <h3>${produto.nome}</h3>
          <p>${produto.descricao}</p> 
          <span>R$ ${Number(produto.preco).toFixed(2).replace(".", ",")}</span>
        </div>
        <button type="button">Adicionar</button>
      </div>
  `,
    ).join("");

    return `
    <section class="categoria">
      <h2>${categoria.nome_categoria}</h2>
      ${cards}
    </section>
    `;
  });

  const html = secoes.join("");
  const cardapio = document.querySelector("#cardapio");
  cardapio.innerHTML = html;
}
carregarProdutos();
