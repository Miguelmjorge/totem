# Regras de disponibilidade e quantidade dos pedidos

**Status:** proposta inicial — pendente de alinhamento com a equipe.  
**Responsável pela proposta:** Leonardo.

## Objetivo

Definir as validações de disponibilidade e quantidade que o backend deve executar antes de aceitar um pedido no totem.

## 1. Disponibilidade do produto

Um produto pode ser oferecido para compra quando todas estas condições forem atendidas:

- O produto estiver marcado como disponível.
- A categoria do produto estiver disponível.
- O estoque do produto for maior que zero.

A interface pode mostrar produtos indisponíveis como esgotados, mas não deve permitir sua compra. A apresentação será alinhada com a equipe de frontend.

## 2. Quantidade solicitada

A quantidade deve ser um número inteiro, maior que zero e menor ou igual ao estoque disponível.

Se o mesmo produto aparecer em vários itens com personalizações diferentes, o backend deve considerar a soma das quantidades desse produto ao conferir seu estoque.

## 3. Validação no backend

O backend deve verificar novamente a disponibilidade e o estoque antes de registrar o pedido, mesmo que a tela já tenha feito essa verificação.

Essa validação é necessária porque:

- Outra compra pode alterar o estoque após a abertura do cardápio.
- Os dados enviados pela tela podem ser alterados ou estar incorretos.

A conferência e a atualização do estoque precisam ser coordenadas para impedir que pedidos simultâneos comprem as mesmas unidades disponíveis.

## 4. Mensagens ao cliente

As mensagens devem identificar o produto e usar a quantidade disponível no momento da validação.

- **Estoque insuficiente:** “Temos apenas 2 unidades de Espresso disponíveis. Ajuste a quantidade para continuar.”
- **Estoque zerado:** “O Espresso está esgotado no momento.”
- **Produto ou categoria desativados:** “O Espresso está indisponível no momento.”
- **Quantidade inválida:** “Informe uma quantidade inteira maior que zero.”

O sistema não deve reduzir a quantidade solicitada silenciosamente. O cliente deve revisar sua escolha.

## 5. Exemplos de teste

Nos casos de quantidade, considerar produto e categoria disponíveis, salvo indicação contrária.

| Situação | Resultado esperado |
|---|---|
| Estoque de 2 unidades; cliente solicita 1 | Aceitar a quantidade |
| Estoque de 2 unidades; cliente solicita 2 | Aceitar a quantidade |
| Estoque de 2 unidades; cliente solicita 3 | Recusar e informar o estoque disponível |
| Estoque zerado; cliente solicita 1 | Recusar e informar que o produto está esgotado |
| Produto desativado, com estoque | Recusar a compra do produto |
| Categoria desativada, com produto disponível e estoque | Recusar a compra do produto |
| Quantidade igual a zero | Recusar a quantidade |
| Quantidade negativa | Recusar a quantidade |
| Quantidade fracionada, como 1,5 | Recusar a quantidade |
| Mesmo produto em dois itens de 2 unidades cada; estoque total de 3 | Recusar: a quantidade total solicitada é 4 |
| Estoque diminui antes da confirmação | Validar novamente e recusar se não houver quantidade suficiente |

## 6. Pontos para alinhar com a equipe

- Em qual etapa o estoque será reservado ou descontado.
- Como liberar ou devolver estoque após cancelamento ou falha no pagamento.
- Como o frontend apresentará produtos indisponíveis.
- Como o pedido será revisado quando algum item não puder ser comprado.

Este documento cobre disponibilidade e quantidade. Preços, personalizações e pagamentos terão regras próprias.