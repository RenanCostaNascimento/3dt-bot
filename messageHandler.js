const { inserirFicha, buscarFicha, atualizarPv, inserirItem, deletarItem } = require('./db');
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
    case 'rm':
      return rolagemMonstro(args, jogador, canal);
    case 'ini':
      return iniciativa(jogador, canal);
    case 't':
      return teste(args, jogador, canal);
    case 'dano':
      return dano(args, jogador, canal);
    case 'cura':
      return cura(args, jogador, canal);
    case 'stats':
      return stats(jogador, canal);
    case 'addItem':
      return addItem(args, jogador, canal);
    case 'removeItem':
      return removeItem(args, jogador, canal);
    default:
      return '';
  }
};

const ajuda = () => `
  Versão de 08/04/2020 do 3D&Bot
  Módulo de RPG:
      * criar uma ficha:
        f nomePersonagem força,habilidade,resistência,armadura,poderdefogo
      * mostrar sua ficha:
        stats
      * atacar:
          * usando força:
              faf
          * usando Poder de Fogo:
              fap
      * defender:
        fd
      * testes:
          t caracteristica modificador
          ***t h 3*** => teste de habilidade +3
      * adicionar item/vantagem (serão tratados da mesma forma):
        addItem nome atributo valor
        ***addItem Arco fap 1***
        Possíveis valores para atributo:
          - faf: bônus em força de ataque para força
          - fap: bônus em força de ataque para pdf
          - fd: bônus em força de defesa
          - forca/armadura/pdf: bônus no atributo
      * remover item/vantagem
        removeItem nome
        Se você tiver vários itens com o mesmo nome, todos serão removidos
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
      pv: caracteristicas[2] * 5,
      itens: []
    };
    await inserirFicha(ficha);
    return `A ficha do personagem ${args[1]} foi criada`;
  }
};

const rolagemMonstro = async (args) => {
  const atributo = Number(args[1]);
  const habilidade = Number(args[2]);
  const { primeiraRolagem, segundaRolagem, multiplicadorCritico } = rolar2d6();

  const total = primeiraRolagem + segundaRolagem + habilidade + (atributo * multiplicadorCritico);
  const resultadoDado = construirResultadoDado(primeiraRolagem, segundaRolagem, total, multiplicadorCritico, habilidade, atributo, 'Atr');

  return `Rolagem do Monstro - ${resultadoDado}`;
};

const forcaAtaquePerto = async (jogador, canal) => {
  try {
    const { forca, habilidade, itens } = await buscarFicha(jogador, canal);
    const bonusFa = itens
      .filter(({ atributoBonus }) => atributoBonus === 'faf')
      .reduce((acc, { atributoValor }) => { return acc + atributoValor; }, 0);
    const bonusForca = itens
      .filter(({ atributoBonus }) => atributoBonus === 'f')
      .reduce((acc, { atributoValor }) => { return acc + atributoValor; }, 0);
    const bonusHabilidade = itens
      .filter(({ atributoBonus }) => atributoBonus === 'h')
      .reduce((acc, { atributoValor }) => { return acc + atributoValor; }, 0);

    const { primeiraRolagem, segundaRolagem, multiplicadorCritico } = rolar2d6();
    const forcaTotal = forca + bonusForca;
    const habilidadeTotal = habilidade + bonusHabilidade;
    const total = primeiraRolagem + segundaRolagem + habilidadeTotal + (forcaTotal * multiplicadorCritico) + bonusFa;

    const resultadoDado = construirResultadoDado(primeiraRolagem, segundaRolagem, total, multiplicadorCritico, habilidadeTotal, forcaTotal, 'F', bonusFa);
    return `Força de Ataque (Força) - ${resultadoDado}`;
  } catch (e) {
    return 'Você não tem personagem';
  }
};

const forcaAtaqueLonge = async (jogador, canal) => {
  try {
    const { poderDeFogo, habilidade, itens } = await buscarFicha(jogador, canal);
    const bonusFa = itens
      .filter(({ atributoBonus }) => atributoBonus === 'fap')
      .reduce((acc, { atributoValor }) => { return acc + atributoValor; }, 0);
    const bonusPdF = itens
      .filter(({ atributoBonus }) => atributoBonus === 'p')
      .reduce((acc, { atributoValor }) => { return acc + atributoValor; }, 0);
    const bonusHabilidade = itens
      .filter(({ atributoBonus }) => atributoBonus === 'h')
      .reduce((acc, { atributoValor }) => { return acc + atributoValor; }, 0);

    const { primeiraRolagem, segundaRolagem, multiplicadorCritico } = rolar2d6();
    const totalPdF = poderDeFogo + bonusPdF;
    const habilidadeTotal = habilidade + bonusHabilidade;
    const total = primeiraRolagem + segundaRolagem + habilidadeTotal + (totalPdF * multiplicadorCritico) + bonusFa;

    const resultadoDado = construirResultadoDado(primeiraRolagem, segundaRolagem, total, multiplicadorCritico, habilidadeTotal, totalPdF, 'PdF', bonusFa);
    return `Força de Ataque (Poder de Fogo) - ${resultadoDado}`;
  } catch (e) {
    return 'Você não tem personagem';
  }
};

const forcaDefesa = async (jogador, canal) => {
  try {
    const { armadura, habilidade, itens } = await buscarFicha(jogador, canal);
    const bonusFd = itens
      .filter(({ atributoBonus }) => atributoBonus === 'fd')
      .reduce((acc, { atributoValor }) => { return acc + atributoValor; }, 0);
    const bonusArmadura = itens
      .filter(({ atributoBonus }) => atributoBonus === 'a')
      .reduce((acc, { atributoValor }) => { return acc + atributoValor; }, 0);
    const bonusHabilidade = itens
      .filter(({ atributoBonus }) => atributoBonus === 'h')
      .reduce((acc, { atributoValor }) => { return acc + atributoValor; }, 0);

    const { primeiraRolagem, segundaRolagem, multiplicadorCritico } = rolar2d6();
    const totalArmadura = armadura + bonusArmadura;
    const habilidadeTotal = habilidade + bonusHabilidade;
    const total = primeiraRolagem + segundaRolagem + habilidadeTotal + (totalArmadura * multiplicadorCritico) + bonusFd;

    const resultadoDado = construirResultadoDado(primeiraRolagem, segundaRolagem, total, multiplicadorCritico, habilidadeTotal, totalArmadura, 'A', bonusFd);
    return `Força de Defesa - ${resultadoDado}`;
  } catch (e) {
    return 'Você não tem personagem';
  }
};

const iniciativa = async (jogador, canal) => {
  try {
    const { habilidade, itens } = await buscarFicha(jogador, canal);
    const bonusIni = itens
      .filter(({ atributoBonus }) => atributoBonus === 'ini')
      .reduce((acc, { atributoValor }) => { return acc + atributoValor; }, 0);
    const bonusHabilidade = itens
      .filter(({ atributoBonus }) => atributoBonus === 'h')
      .reduce((acc, { atributoValor }) => { return acc + atributoValor; }, 0);

    const { primeiraRolagem, segundaRolagem } = rolar2d6();
    const habilidadeTotal = habilidade + bonusHabilidade;
    const total = primeiraRolagem + segundaRolagem + habilidadeTotal + bonusIni;

    const resultadoDado = construirResultadoDado(primeiraRolagem, segundaRolagem, total, 0, habilidadeTotal, -1, undefined, bonusIni);
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

  return `${resultadoDado}${somarAtributo}${somarHabilidade}${somarModificador} = ${exibirTotal}${exibirCritico}`;
};

const dano = async (args, jogador, canal) => {
  try {
    const dano = args[1] || 0;
    const { value: { pv } } = await atualizarPv(jogador, canal, -Number(dano));
    return `Tomou ***${dano}*** de dano, novo PV é ***${pv}***`;
  } catch (e) {
    return 'Você não tem personagem';
  }
};

const cura = async (args, jogador, canal) => {
  try {
    const cura = args[1] || 0;
    const { value: { pv } } = await atualizarPv(jogador, canal, Number(cura));
    return `Curou ***${cura}***, novo PV é ***${pv}***`;
  } catch (e) {
    return 'Você não tem personagem';
  }
};

const stats = async (jogador, canal) => {
  try {
    const { nome, forca, habilidade, resistencia, armadura, poderDeFogo, pv, itens } = await buscarFicha(jogador, canal);
    const listagemItens = itens.map(({ nome, atributoBonus, atributoValor }) => `\n\t\t- ${nome} (${atributoBonus}): ${atributoValor}`);

    return `
    Nome: ${nome}
    Força: ${forca}
    Habilidade: ${habilidade}
    Resistencia: ${resistencia}
    Armadura: ${armadura}
    Poder de Fogo: ${poderDeFogo}
    PV: ${pv}
    Itens: ${listagemItens.toString()}
    `;
  } catch (e) {
    return 'Você não tem personagem';
  }
};

const addItem = async (args, jogador, canal) => {
  if (args.length === 4) {
    const [, nomeItem, atributoBonus, atributoValor] = args;
    try {
      const item = {
        nome: nomeItem,
        atributoBonus,
        atributoValor: Number(atributoValor)
      };
      await inserirItem(jogador, canal, item);
      return 'Item adicionado';
    } catch (e) {
      return 'Você não tem personagem';
    }
  }
  return;
};

const removeItem = async (args, jogador, canal) => {
  if (args.length === 2) {
    try {
      await deletarItem(jogador, canal, args[1]);
      return 'Item removido';
    } catch (e) {
      return 'Você não tem personagem';
    }
  }
  return;
};

module.exports = handleMessage;