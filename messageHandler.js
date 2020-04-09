const { inserirFicha, buscarFicha, atualizarPv } = require('./db');
const rolar2d6 = require('./dado');

const handleMessage = (args, jogador, canal) => {
  switch (args[0]) {
    case 'ajuda':
      return ajuda();
    case 'f':
      return criarFicha(args, jogador, canal);
    case 'faf':
      return forcaAtaquePerto(jogador, canal);
    case 'fap':
      return forcaAtaqueLonge(jogador, canal);
    case 'fd':
      return forcaDefesa(jogador, canal);
    case 'i':
      return iniciativa(jogador, canal);
    case 't':
      return teste(args, jogador, canal);
    case 'dano':
      return dano(args, jogador, canal);
    case 'cura':
      return cura(args, jogador, canal);
    default:
      return '';
  }
};

const ajuda = () => `
  Versão de 08/04/2020 do 3D&Bot
  Módulo de RPG:
      * criar uma ficha:
        f nomePersonagem força,habilidade,resistência,armadura,poderdefogo
      * atacar:
          * usando força:
              faf
          * usando Poder de Fogo:
              fap
      * defender:
        fd
      * testes:
          t caracteristica modificador
          exemplo t h 3 => teste de habilidade +3
`;

const criarFicha = async (args, jogador, canal) => {
  if (args.length === 3) {
    const caracteristicas = args[2].split(',').map(parseFloat);
    const ficha = {
      jogador, canal,
      nome: args[1],
      forca: caracteristicas[0],
      habilidade: caracteristicas[1],
      resistencia: caracteristicas[2],
      armadura: caracteristicas[3],
      poderDeFogo: caracteristicas[4],
      pv: caracteristicas[2] * 5
    };
    await inserirFicha(ficha);
    return `A ficha do personagem ${args[1]} foi criada`;
  }
};

const forcaAtaquePerto = async (jogador, canal) => {
  try {
    const { forca, habilidade } = await buscarFicha(jogador, canal);
    const { primeiraRolagem, segundaRolagem, multiplicadorCritico } = rolar2d6();

    const total = primeiraRolagem + segundaRolagem + habilidade + (forca * multiplicadorCritico);
    const resultadoDado = construirResultadoDado(primeiraRolagem, segundaRolagem, total, multiplicadorCritico, habilidade, forca, 'F');

    return `Força de Ataque (Força) - ${resultadoDado}`;
  } catch (e) {
    return 'Você não tem personagem';
  }
};

const forcaAtaqueLonge = async (jogador, canal) => {
  try {
    const { poderDeFogo, habilidade } = await buscarFicha(jogador, canal);
    const { primeiraRolagem, segundaRolagem, multiplicadorCritico } = rolar2d6();

    const total = primeiraRolagem + segundaRolagem + habilidade + (poderDeFogo * multiplicadorCritico);
    const resultadoDado = construirResultadoDado(primeiraRolagem, segundaRolagem, total, multiplicadorCritico, habilidade, poderDeFogo, 'PdF');

    return `Força de Ataque (Poder de Fogo) - ${resultadoDado}`;
  } catch (e) {
    return 'Você não tem personagem';
  }
};

const forcaDefesa = async (jogador, canal) => {
  try {
    const { armadura, habilidade } = await buscarFicha(jogador, canal);
    const { primeiraRolagem, segundaRolagem, multiplicadorCritico } = rolar2d6();

    const total = primeiraRolagem + segundaRolagem + habilidade + (armadura * multiplicadorCritico);
    const resultadoDado = construirResultadoDado(primeiraRolagem, segundaRolagem, total, multiplicadorCritico, habilidade, armadura, 'A');

    return `Força de Defesa - ${resultadoDado}`;
  } catch (e) {
    return 'Você não tem personagem';
  }
};

const iniciativa = async (jogador, canal) => {
  try {
    const { habilidade } = await buscarFicha(jogador, canal);
    const { primeiraRolagem, segundaRolagem } = rolar2d6();

    const total = primeiraRolagem + segundaRolagem + habilidade;
    const resultadoDado = construirResultadoDado(primeiraRolagem, segundaRolagem, total, 0, habilidade);

    return `Iniciativa - ${resultadoDado}`;
  } catch (e) {
    return 'Você não tem personagem';
  }
};

const dicionarioAtributo = {
  f: { nome: 'forca', descricao: 'Força' },
  h: { nome: 'habilidade', descricao: 'Habilidade' },
  r: { nome: 'resistencia', descricao: 'Resistência' },
  a: { nome: 'armadura', descricao: 'Armadura' },
  p: { nome: 'poderDeFogo', descricao: 'Poder de Fogo' }
};

const teste = async (args, jogador, canal) => {
  const atributo = dicionarioAtributo[args[1]];
  if (!atributo) {
    return 'Atributo inválido';
  }

  try {
    const modificador = Number(args[2] || 0);
    const ficha = await buscarFicha(jogador, canal);
    const { primeiraRolagem, segundaRolagem, multiplicadorCritico } = rolar2d6();

    const total = primeiraRolagem + segundaRolagem + (ficha[atributo.nome] * multiplicadorCritico) + modificador;
    const resultadoDado = construirResultadoDado(primeiraRolagem, segundaRolagem, total, multiplicadorCritico, -1, ficha[atributo.nome], atributo.descricao[0], modificador);

    return `Teste de ${atributo.descricao} - ${resultadoDado}`;
  } catch (e) {
    return 'Você não tem personagem';
  }
};

const construirResultadoDado = (primeiraRolagem, segundaRolagem, total, multiplicadorCritico, habilidade, atributo = 0, nomeAtributo = undefined, modificador = undefined) => {
  const resultadoDado = `2d6 (${primeiraRolagem} + ${segundaRolagem})`;
  const somarHabilidade = habilidade > 0 ? ` + H (${habilidade})` : '';
  const somarAtributo = nomeAtributo ? ` + ${nomeAtributo} (${atributo})` : '';
  const somarModificador = modificador ? ` + Mod (${modificador})` : '';
  const exibirTotal = `***${total === 13 ? 'É 13, porra!' : total}***`;
  const exibirCritico = multiplicadorCritico > 1 ? `\nCrítico! (x${multiplicadorCritico})` : '';

  return `${resultadoDado}${somarHabilidade}${somarAtributo}${somarModificador} = ${exibirTotal}${exibirCritico}`;
};

const dano = async (args, jogador, canal) => {
  try {
    const { value: { pv } } = await atualizarPv(jogador, canal, -Number(args[1]));
    return `Tomou ***${args[1]}*** de dano, novo PV é ***${pv}***`;
  } catch (e) {
    return 'Você não tem personagem';
  }
};

const cura = async (args, jogador, canal) => {
  try {
    const { value: { pv } } = await atualizarPv(jogador, canal, Number(args[1]));
    return `Curou ***${args[1]}***, novo PV é ***${pv}***`;
  } catch (e) {
    return 'Você não tem personagem';
  }
};

module.exports = handleMessage;