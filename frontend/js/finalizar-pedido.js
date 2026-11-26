const botaoConfirmar = document.getElementById("confirmarPedido");
const mensagemPedido = document.getElementById("mensagemPedido");

// Também mantém o bloqueio se esta aba for atualizada durante o envio.
const CHAVE_PENDENTE = "laricafePedidoPendente";
let envioBloqueado = false;

function bloquearControles(bloquear) {
  envioBloqueado = bloquear;
  botaoConfirmar.disabled = bloquear;

  document.querySelectorAll("#listaCarrinho button").forEach((botao) => {
    botao.disabled = bloquear;
  });
}

function avisarConfirmacaoIncerta() {
  bloquearControles(true);
  botaoConfirmar.textContent = "Aguardando conferência";

  mensagemPedido.textContent =
    "Não foi possível confirmar o resultado do envio.\n" +
    "Seu pedido pode ter sido registrado. Confira com o atendimento " +
    "antes de enviar novamente.";
}

try {
  if (sessionStorage.getItem(CHAVE_PENDENTE)) {
    avisarConfirmacaoIncerta();
  }
} catch {
  bloquearControles(true);
  mensagemPedido.textContent =
    "O navegador não permitiu preparar a confirmação do pedido.";
}

botaoConfirmar.addEventListener("click", async () => {
  if (envioBloqueado) {
    return;
  }

  if (!Array.isArray(carrinho) || carrinho.length === 0) {
    mensagemPedido.textContent = "Adicione um produto antes de confirmar.";
    return;
  }

  const itens = carrinho.map((produto) => ({
    id_produto: produto.id_produto,
    quantidade: produto.quantidade,
    opcoes: produto.opcoes ?? [],
  }));

  const itensValidos = itens.every((item) =>
    Number.isInteger(item.id_produto) &&
    item.id_produto > 0 &&
    Number.isInteger(item.quantidade) &&
    item.quantidade >= 1 &&
    item.quantidade <= 99 &&
    Array.isArray(item.opcoes) &&
    item.opcoes.every((opcao) =>
      Number.isInteger(opcao) && opcao > 0
    )
  );

  if (!itensValidos) {
    mensagemPedido.textContent =
      "Há itens inválidos ou antigos no carrinho. " +
      "Remova-os e adicione os produtos novamente pelo cardápio.";
    return;
  }

  // Guarda a versão enviada para não apagar mudanças feitas em outra aba.
  let carrinhoSalvo;

  try {
    carrinhoSalvo = localStorage.getItem("laricafeCarrinho");

    if (JSON.stringify(JSON.parse(carrinhoSalvo || "[]")) !==
        JSON.stringify(carrinho)) {
      mensagemPedido.textContent =
        "O carrinho foi alterado em outra página. Atualize antes de confirmar.";
      return;
    }

    sessionStorage.setItem(CHAVE_PENDENTE, JSON.stringify({
      itens,
      iniciadoEm: new Date().toISOString(),
    }));
  } catch {
    mensagemPedido.textContent =
      "Não foi possível preparar o envio. Nenhum pedido foi enviado.";
    return;
  }

  bloquearControles(true);
  botaoConfirmar.textContent = "Enviando...";
  mensagemPedido.textContent = "Registrando seu pedido...";

  const controle = new AbortController();
  const tempoLimite = setTimeout(() => controle.abort(), 20000);

  let pedidoConfirmado = null;

  try {
    const resposta = await fetch("../../backend/public/pedidos.php", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ itens }),
      signal: controle.signal,
    });

    const dados = await resposta.json();

    // Esses códigos representam rejeições conhecidas do endpoint atual.
    if ([400, 405, 409, 413, 415].includes(resposta.status)) {
      sessionStorage.removeItem(CHAVE_PENDENTE);

      mensagemPedido.textContent =
        typeof dados.erro === "string"
          ? dados.erro
          : "O pedido foi recusado. Revise o carrinho.";

      bloquearControles(false);
      botaoConfirmar.textContent = "Confirmar pedido";
      return;
    }

    const pedido = dados.pedido;

    if (
      resposta.status !== 201 ||
      !Number.isInteger(pedido?.id_pedido) ||
      pedido.id_pedido <= 0 ||
      typeof pedido.valor_total !== "string" ||
      !/^\d+\.\d{2}$/.test(pedido.valor_total)
    ) {
      throw new Error("Resposta sem confirmação válida.");
    }

    pedidoConfirmado = pedido;
  } catch (erro) {
    console.error("Falha ao confirmar pedido:", erro);
    avisarConfirmacaoIncerta();
    return;
  } finally {
    clearTimeout(tempoLimite);
  }

  // Daqui em diante sabemos que o pedido foi criado.
  // Uma falha no navegador não pode ser apresentada como falha da compra.
  const total = Number(pedidoConfirmado.valor_total).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });

  mensagemPedido.textContent =
    `Pedido nº ${pedidoConfirmado.id_pedido} registrado!\n` +
    `Total confirmado: ${total}.\n` +
    "O pagamento ainda não foi confirmado.";

  botaoConfirmar.textContent = "Pedido registrado";

  try {
    if (localStorage.getItem("laricafeCarrinho") === carrinhoSalvo) {
      localStorage.removeItem("laricafeCarrinho");
      carrinho = [];
      atualizarCarrinho();
      sessionStorage.removeItem(CHAVE_PENDENTE);
    } else {
      mensagemPedido.textContent +=
        "\nO carrinho mudou em outra aba e foi preservado. " +
        "Confira os itens antes de fazer outro pedido.";
    }
  } catch (erro) {
    console.error("Falha ao atualizar o carrinho:", erro);
    mensagemPedido.textContent +=
      "\nNão foi possível limpar o carrinho. Não reenvie este pedido.";
  }
});