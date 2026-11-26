const botaoConfirmar = document.getElementById("confirmarPedido");
const mensagemPedido = document.getElementById("mensagemPedido");

// Envio cujo resultado ainda não foi confirmado.
const CHAVE_PENDENTE = "laricafePedidoPendente";

// Pedido já criado que precisa ter seu pagamento retomado.
const CHAVE_PAGAMENTO = "laricafePedidoEmPagamento";

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

function atualizarRetomadaPagamento() {
  const painel = document.getElementById("retomarPagamento");
  const texto = document.getElementById("textoRetomarPagamento");
  const link = document.getElementById("linkRetomarPagamento");

  painel.hidden = true;

  try {
    const salvo = sessionStorage.getItem(CHAVE_PAGAMENTO);

    if (salvo !== null) {
      const id = Number(salvo);

      if (
        !/^[1-9][0-9]*$/.test(salvo) ||
        !Number.isInteger(id) ||
        id > 2147483647
      ) {
        throw new Error("Referência de pedido inválida.");
      }

      texto.textContent =
        `O pedido nº ${id} já foi criado. ` +
        "Retome o pagamento antes de iniciar outra compra.";

      link.href = `pagamento.html?id=${encodeURIComponent(id)}`;
      painel.hidden = false;

      bloquearControles(true);
      botaoConfirmar.textContent = "Continue o pagamento existente";
      return;
    }

    if (sessionStorage.getItem(CHAVE_PENDENTE)) {
      avisarConfirmacaoIncerta();
      return;
    }

    bloquearControles(false);
    botaoConfirmar.textContent = "Confirmar pedido";
  } catch (erro) {
    console.error("Falha ao recuperar pedido:", erro);

    bloquearControles(true);
    mensagemPedido.textContent =
      "Não foi possível recuperar o pedido desta aba. " +
      "Confira com o atendimento antes de enviar novamente.";
  }
}

botaoConfirmar.addEventListener("click", async () => {
  if (envioBloqueado) {
    return;
  }

  // Verifica novamente antes de permitir uma nova compra.
  atualizarRetomadaPagamento();

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

  let carrinhoSalvo;

  try {
    carrinhoSalvo = localStorage.getItem("laricafeCarrinho");

    if (
      JSON.stringify(JSON.parse(carrinhoSalvo || "[]")) !==
      JSON.stringify(carrinho)
    ) {
      mensagemPedido.textContent =
        "O carrinho foi alterado em outra página. " +
        "Atualize antes de confirmar.";
      return;
    }

    sessionStorage.setItem(
      CHAVE_PENDENTE,
      JSON.stringify({
        itens,
        iniciadoEm: new Date().toISOString(),
      })
    );
  } catch (erro) {
    console.error("Falha ao preparar envio:", erro);

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

    // Rejeições conhecidas do endpoint atual: preserva o carrinho.
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

  // O backend confirmou que o pedido foi criado.
  const total = Number(pedidoConfirmado.valor_total).toLocaleString(
    "pt-BR",
    {
      style: "currency",
      currency: "BRL",
    }
  );

  mensagemPedido.textContent =
    `Pedido nº ${pedidoConfirmado.id_pedido} registrado!\n` +
    `Total confirmado: ${total}.\n` +
    "O pagamento ainda não foi confirmado.";

  botaoConfirmar.textContent = "Pedido registrado";

  try {
    // Guarda o ID antes de limpar o carrinho ou mudar de página.
    sessionStorage.setItem(
      CHAVE_PAGAMENTO,
      String(pedidoConfirmado.id_pedido)
    );

    atualizarRetomadaPagamento();

    if (localStorage.getItem("laricafeCarrinho") === carrinhoSalvo) {
      // Mantém os itens visíveis; o pedido existente bloqueia novo envio e edição.

      sessionStorage.removeItem(CHAVE_PENDENTE);

      window.location.assign(
        `pagamento.html?id=${encodeURIComponent(pedidoConfirmado.id_pedido)}`
      );
    } else {
      mensagemPedido.textContent +=
        "\nO carrinho mudou em outra aba e foi preservado. " +
        "Confira os itens antes de fazer outro pedido.";
    }
  } catch (erro) {
    console.error("Falha ao atualizar o carrinho:", erro);

    mensagemPedido.textContent +=
      "\nNão foi possível atualizar o carrinho. Não reenvie este pedido.";
  }
}); 

atualizarRetomadaPagamento();

window.addEventListener("pageshow", (evento) => {
  if (evento.persisted) {
    try {
      const salvo = JSON.parse(
        localStorage.getItem("laricafeCarrinho") || "[]"
      );

      if (!Array.isArray(salvo)) {
        throw new Error("Carrinho inválido.");
      }

      carrinho = salvo;
      atualizarCarrinho();
    } catch (erro) {
      console.error("Falha ao atualizar carrinho:", erro);

      bloquearControles(true);
      mensagemPedido.textContent =
        "Não foi possível atualizar o carrinho. Recarregue a página.";
      return;
    }
  }

  atualizarRetomadaPagamento();
});