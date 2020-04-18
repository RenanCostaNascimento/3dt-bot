const rolar2d6 = (quantidadeCriticos = 0, valorCritico = 6) => {
  const rolagens = [];
  let multiplicadorCritico = 1;

  for (let index = 0; index < 2; index++) {
    if (quantidadeCriticos > 0) {
      quantidadeCriticos--;
      multiplicadorCritico++;
      rolagens.push(6);
    } else {
      const rolagem = Math.floor((Math.random() * 6) + 1);
      if (rolagem >= valorCritico) {
        multiplicadorCritico++;
      }
      rolagens.push(rolagem);
    }
  }

  return { primeiraRolagem: rolagens[0], segundaRolagem: rolagens[1], multiplicadorCritico };
};

module.exports = rolar2d6;