const rolar2d6 = () => {
  const primeiraRolagem = Math.floor((Math.random() * 6) + 1);
  const segundaRolagem = Math.floor((Math.random() * 6) + 1);
  let multiplicadorCritico = 1;
  if (primeiraRolagem === 6) {
    multiplicadorCritico++;
  }
  if (segundaRolagem === 6) {
    multiplicadorCritico++;
  }

  return { primeiraRolagem, segundaRolagem, multiplicadorCritico };
};

module.exports = rolar2d6;