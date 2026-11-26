(() => {
  let painel, temporizador;
  window.notificarTotem = ({tipo = 'aviso', titulo, mensagem, acao, destino, duracao = 0}) => {
    clearTimeout(temporizador);
    if (!painel) {
      painel = document.createElement('section');
      painel.className = 'totem-aviso';
      document.querySelector('header').after(painel);
    }
    painel.dataset.tipo = tipo;
    const icone = document.createElement('span');
    icone.setAttribute('aria-hidden', 'true');
    icone.textContent = tipo === 'sucesso' ? '✓' : tipo === 'erro' ? '!' : '◷';
    const corpo = document.createElement('div');
    corpo.className = 'totem-aviso-corpo';
    const texto = document.createElement('div');
    texto.setAttribute('role', tipo === 'erro' ? 'alert' : 'status');
    const cabecalho = document.createElement('strong');
    cabecalho.textContent = titulo;
    const p = document.createElement('p');
    p.textContent = mensagem;
    texto.append(cabecalho, p);
    corpo.append(texto);
    if (acao && destino) {
      const link = document.createElement('a');
      link.href = destino;
      link.textContent = acao;
      corpo.append(link);
    }
    const fechar = document.createElement('button');
    fechar.type = 'button';
    fechar.textContent = '×';
    fechar.setAttribute('aria-label', 'Fechar aviso');
    fechar.onclick = () => { painel.hidden = true; clearTimeout(temporizador); };
    painel.replaceChildren(icone, corpo, fechar);
    painel.hidden = false;
    if (duracao > 0) temporizador = setTimeout(() => { painel.hidden = true; }, duracao);
  };
})();
