const CHAVE_CARRINHO = "laricafeCarrinho";
const cardapio = document.querySelector("#cardapio");

function lerCarrinho() {
  const carrinho = JSON.parse(
    localStorage.getItem(CHAVE_CARRINHO) || "[]"
  );

  if (
    !Array.isArray(carrinho) ||
    !carrinho.every((item) =>
      item !== null &&
      typeof item === "object" &&
      Number.isInteger(item.id_produto) &&
      item.id_produto > 0 &&
      Number.isInteger(item.quantidade) &&
      item.quantidade >= 1 &&
      item.quantidade <= 99
    )
  ) {
    throw new Error(
      "O carrinho salvo é de uma versão antiga ou está inválido. " +
      "Remova seus itens na página do carrinho e tente novamente."
    );
  }

  return carrinho;
}

function adicionarProduto(produto) {
  const pedidoEmPagamento = sessionStorage.getItem(
    "laricafePedidoEmPagamento"
  );

  if (pedidoEmPagamento !== null) {
    throw new Error(
      "Você já possui um pedido em andamento. " +
      "Abra Meu pedido para continuar o pagamento."
    );
  }

  if (sessionStorage.getItem("laricafePedidoPendente") !== null) {
    throw new Error(
      "A confirmação do pedido anterior está pendente de conferência. " +
      "Abra Meu pedido antes de iniciar outra compra."
    );
  }
  const carrinho = lerCarrinho();
  const id = Number(produto.id_produto);

  const existente = carrinho.find((item) =>
    item.id_produto === id &&
    (item.opcoes ?? []).length === 0
  );

  if (existente) {
    if (existente.quantidade >= 99) {
      throw new Error("O limite por item é de 99 unidades.");
    }

    existente.quantidade++;
  } else {
    carrinho.push({
      id_produto: id,
      nome: produto.nome,
      descricao: produto.descricao || "",
      preco: Number(produto.preco),
      imagem: produto.imagem || "",
      quantidade: 1,
      opcoes: [],
    });
  }

  localStorage.setItem(CHAVE_CARRINHO, JSON.stringify(carrinho));
}

function criarCard(produto) {
  const card = document.createElement("div");
  card.className = "item-cardapio";

  const imagem = document.createElement("img");
  imagem.className = "foto-produto";
  imagem.alt = produto.nome;

  if (produto.imagem) {
    imagem.src = produto.imagem;
  }

  const informacoes = document.createElement("div");
  informacoes.className = "info-produto";

  const nome = document.createElement("h3");
  nome.textContent = produto.nome;

  const descricao = document.createElement("p");
  descricao.textContent = produto.descricao || "";

  const preco = document.createElement("span");
  preco.textContent = Number(produto.preco).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });

  const botao = document.createElement("button");
  botao.type = "button";
  botao.textContent = "Adicionar";

  // O botão é conectado ao produto no momento em que é criado.
  botao.addEventListener("click", () => {
    try {
      adicionarProduto(produto);

      botao.textContent = "Adicionado!";
      botao.disabled = true;

      setTimeout(() => {
        botao.textContent = "Adicionar";
        botao.disabled = false;
      }, 700);
    } catch (erro) {
      console.error(erro);
      alert(
        erro instanceof SyntaxError
          ? "O carrinho salvo contém dados inválidos."
          : erro.message
      );
    }
  });

  informacoes.append(nome, descricao, preco);
  card.append(imagem, informacoes, botao);

  return card;
}

async function carregarProdutos() {
  cardapio.textContent = "Carregando cardápio...";

  try {
    let dados;
    let demonstracao = false;
    try {
      const resposta = await fetch("../../backend/public/cardapio.php", {cache: "no-store"});
      if (!resposta.ok) throw new Error("Não foi possível carregar o cardápio.");
      dados = await resposta.json();
    } catch (erro) {
      if (!['localhost', '127.0.0.1', '[::1]'].includes(location.hostname)) throw erro;
      const resposta = await fetch('../js/cardapio-preview.json');
      if (!resposta.ok) throw erro;
      dados = await resposta.json();
      demonstracao = true;
    }

    if (
      !Array.isArray(dados.categorias) ||
      !Array.isArray(dados.produtos)
    ) {
      throw new Error("O servidor retornou um cardápio inválido.");
    }

    const conteudo = document.createDocumentFragment();

    // IDs das categorias cadastradas, associados aos links da página.
    const ancoras = {
      1: "quentes",
      2: "gelados",
      3: "bebidas",
      4: "paes",
      5: "salgados",
      6: "doces",
    };

    for (const categoria of dados.categorias) {
      const secao = document.createElement("section");
      secao.className = "categoria";
      secao.id = ancoras[categoria.id_categoria]
        || `categoria-${categoria.id_categoria}`;

      const titulo = document.createElement("h2");
      titulo.textContent = categoria.nome_categoria;
      secao.append(titulo);

      const produtos = dados.produtos.filter(
        (produto) =>
          Number(produto.id_categoria) === Number(categoria.id_categoria)
      );

      if (produtos.length === 0) {
        const aviso = document.createElement("p");
        aviso.textContent = "Sem produtos disponíveis nesta categoria.";
        secao.append(aviso);
      }

      for (const produto of produtos) {
        secao.append(criarCard(produto));
      }

      conteudo.append(secao);
    }

    cardapio.replaceChildren(conteudo);
    if (demonstracao) {
      const aviso = document.createElement('p');
      aviso.textContent = 'Prévia local: catálogo de demonstração. Para registrar pedidos, inicie o servidor PHP e o banco de dados.';
      aviso.setAttribute('role', 'status');
      cardapio.prepend(aviso);
    }
    const alvo = document.getElementById(location.hash.slice(1));
    if (alvo) alvo.scrollIntoView({block: 'start'});
  } catch (erro) {
    console.error(erro);
    cardapio.textContent =
      "Não foi possível carregar o cardápio. Tente atualizar a página.";
  }
}

carregarProdutos();
window.addEventListener('pageshow', (evento) => {
  if (evento.persisted) carregarProdutos();
});