const painelPagamento = document.getElementById("painelPagamento");
const mensagemCarregamento = document.getElementById("mensagemCarregamento");
const numeroPedido = document.getElementById("numeroPedido");
const totalPedido = document.getElementById("totalPedido");
const instrucaoPagamento = document.getElementById("instrucaoPagamento");
const estadoPagamento = document.getElementById("estadoPagamento");
const botoesMetodo = document.querySelectorAll("[data-metodo]");

let pedidoAtual = null;
let metodoSelecionado = null;

const instrucoes = {
    credito: "Aproxime ou insira o cartão de crédito na maquininha.",
    debito: "Aproxime ou insira o cartão de débito na maquininha.",
    pix: "Escaneie o QR Code exibido na maquininha.",
};

function selecionarMetodo(metodo) {
    if (!pedidoAtual || !Object.hasOwn(instrucoes, metodo)) {
        return;
    }

    metodoSelecionado = metodo;

    botoesMetodo.forEach((botao) => {
        botao.setAttribute(
            "aria-pressed",
            String(botao.dataset.metodo === metodoSelecionado)
        );
    });

    instrucaoPagamento.textContent = instrucoes[metodoSelecionado];
    estadoPagamento.textContent = "Nenhum pagamento foi confirmado.";
}

botoesMetodo.forEach((botao) => {
    botao.addEventListener("click", () => {
        selecionarMetodo(botao.dataset.metodo);
    });
});

async function carregarPedido() {
    const idTexto = new URLSearchParams(window.location.search).get("id");

    if (
        !idTexto ||
        !/^[1-9][0-9]{0,9}$/.test(idTexto) ||
        Number(idTexto) > 2147483647
    ) {
        mensagemCarregamento.textContent =
            "Número de pedido inválido. Abra o pagamento a partir do pedido criado.";
        return;
    }

    const controle = new AbortController();
    const tempoLimite = setTimeout(() => controle.abort(), 15000);

    try {
        const resposta = await fetch(
            `../../backend/public/pedido.php?id=${encodeURIComponent(idTexto)}`,
            {
                cache: "no-store",
                signal: controle.signal,
            }
        );

        if (!resposta.ok) {
            throw new Error(
                resposta.status === 404
                    ? "Pedido não encontrado."
                    : "Não foi possível consultar o pedido."
            );
        }

        const dados = await resposta.json();
        const pedido = dados.pedido;

        if (
            !Number.isInteger(pedido?.id_pedido) ||
            pedido.id_pedido !== Number(idTexto) ||
            typeof pedido.valor_total !== "string" ||
            !/^\d+\.\d{2}$/.test(pedido.valor_total)
        ) {
            throw new Error("O servidor retornou dados de pedido inválidos.");
        }

        pedidoAtual = pedido;

        // Recupera também pedidos existentes abertos diretamente pela URL.
        // Não substitui uma referência diferente já registrada nesta aba.
        try {
            const chave = "laricafePedidoEmPagamento";
            const existente = sessionStorage.getItem(chave);

            if (existente === null || existente === String(pedido.id_pedido)) {
                sessionStorage.setItem(chave, String(pedido.id_pedido));
            }
        } catch (erro) {
            console.error("Não foi possível guardar a referência do pedido:", erro);
        }

        numeroPedido.textContent = `Pedido nº ${pedido.id_pedido}`;

        totalPedido.textContent =
            "Total: " +
            Number(pedido.valor_total).toLocaleString("pt-BR", {
                style: "currency",
                currency: "BRL",
            });

        mensagemCarregamento.hidden = true;
        painelPagamento.hidden = false;
    } catch (erro) {
        console.error("Falha ao carregar pagamento:", erro);

        mensagemCarregamento.textContent =
            erro.name === "AbortError"
                ? "A consulta demorou demais. Atualize a página para tentar novamente."
                : erro instanceof TypeError
                    ? "Não foi possível conectar ao servidor. Tente atualizar a página."
                    : erro.message;
    } finally {
        clearTimeout(tempoLimite);
    }
}

carregarPedido();