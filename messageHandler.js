const { inserirFicha, buscarFicha, atualizarPv, inserirItem, deletarItem, atualizarAtributo } = require('./db');
const rolar2d6 = require('./dado');

const handleMessage = (args, jogador, canal) => {
  switch (args[0]) {
    case 'ajuda':
      return ajuda();
    case 'ficha':
      return criarFicha(args, jogador, canal);
    case 'faf':
      return forcaAtaquePerto(args, jogador, canal);
    case 'fap':
      return forcaAtaqueLonge(args, jogador, canal);
    case 'fd':
      return forcaDefesa(args, jogador, canal);
    case 'dm':
      return dungeonMaster(args, jogador, canal);
    case 'ini':
      return iniciativa(jogador, canal);
    case 'test':
      return teste(args, jogador, canal);
    case 'dano':
      return dano(args, jogador, canal);
    case 'cura':
      return cura(args, jogador, canal);
    case 'stats':
      return stats(jogador, canal);
    case 'add':
      return addItem(args, jogador, canal);
    case 'rm':
      return removeItem(args, jogador, canal);
    case 'set':
      return setAtributo(args, jogador, canal);
    default:
      return '';
  }
};

const ajuda = () => `
  __Criar uma ficha__
  \t\t*ficha nomePersonagem força,habilidade,resistência,armadura,poderdefogo*
  \t\tExemplo: ***ficha ivanOGrande 5,5,5,5,5***
  \t\tCada jogador só pode ter uma ficha por canal
  \t\tSe você já tiver uma ficha e criar outra, a primeira ficha será substituída pela segunda
  __Mostrar sua ficha__
  \t\t*stats*
  __Atualizar atributo__
  \t\t*set atributo novoValor*
  \t\tExemplo: ***set f 3***
  \t\tPossíveis valores para atributo: f/h/a/r/p
  __Atacar__
  \t\t- Usando força:
  \t\t\t\t*faf ae*
  \t\t- Usando Poder de Fogo:
  \t\t\t\t*fap ae*
  \t\t*ae* é um parâmetro opcional indicando que é um ataque especial, só é usado se você tiver esse item
  __Defender__
  \t\t*fd sh*
  \t\t*sh* é um parâmetro opcional para defender sem habilidade
  __Testar atributo__
  \t\t*test atributo modificador*
  \t\t*modificador* é um parâmetro opcional que será somado ao resultado
  \t\tExemplo: ***test h 3*** => teste de habilidade +3
  \t\tPossíveis valores para atributo: f/h/a/r/p
  __Adicionar item/vantagem__ (serão tratados da mesma forma)
  \t\t*add nome atributo valor*
  \t\tExemplo: ***add Arco fap 1***
  \t\tPossíveis valores para atributo:
  \t\t\t\t- faf: bônus em força de ataque para força
  \t\t\t\t- fap: bônus em força de ataque para pdf
  \t\t\t\t- fd: bônus em força de defesa
  \t\t\t\t- ini: bônus de iniciativa
  \t\t\t\t- f/h/a/r/p: bônus no atributo (conta para ataque, defesa e testes)
  \t\t\t\t- aef: ataque especial de força (nesse caso o *valor* indica o aumento de força, não o nível da vantagem)
  \t\t\t\t- aep: ataque especial de pdf (idem)
  __Remover item/vantagem__
  \t\t*rm nome*
  \t\tSe você tiver vários itens com o mesmo nome, todos serão removidos
  __Rolagem do mestre (DM)__
  \t\t*dm atributoCritavel atributoNaoCritavel modificador*
  \t\t*atributoCritavel* indica qual valor será dobrado/triplicado em caso de crítico, normalmente F, A, ou PdF
  \t\t*modificador* é um parâmetro opcional que será somado ao resultado
  \t\tExemplo: ***dm 2 3*** => 2d6 + Atr(2) + H(3) - usado para ataque e defesa
  \t\tExemplo: ***dm 0 3*** => 2d6 + H(3) - iniciativa, defender sem A
  \t\tExemplo: ***dm 3 0*** => 2d6 + Atr(3) - teste de atributo, defender sem H
  \t\tExemplo: ***dm 2 1 3*** => 2d6 + Atr(2) + H(1) + Mod(3)
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

const dungeonMaster = async (args) => {
  if (args.length >= 3) {
    const atributo = Number(args[1]);
    const habilidade = Number(args[2]);
    const modificador = Number(args[3] || 0);
    const { primeiraRolagem, segundaRolagem, multiplicadorCritico } = rolar2d6();

    const total = primeiraRolagem + segundaRolagem + habilidade + (atributo * multiplicadorCritico) + modificador;
    const resultadoDado = construirResultadoDado(primeiraRolagem, segundaRolagem, total, multiplicadorCritico, habilidade, atributo, 'Atr', modificador);

    return `Rolagem do Monstro - ${resultadoDado}`;
  }
};

const forcaAtaquePerto = async (args, jogador, canal) => {
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
    const bonusAtaqueEspecial = args[1] === 'ae' && itens
      .filter(({ atributoBonus }) => atributoBonus === 'aef')
      .reduce((acc, { atributoValor }) => { return acc + atributoValor; }, 0);

    const { primeiraRolagem, segundaRolagem, multiplicadorCritico } = rolar2d6();
    const forcaTotal = forca + bonusForca + bonusAtaqueEspecial;
    const habilidadeTotal = habilidade + bonusHabilidade;
    const total = primeiraRolagem + segundaRolagem + habilidadeTotal + (forcaTotal * multiplicadorCritico) + bonusFa;

    const resultadoDado = construirResultadoDado(primeiraRolagem, segundaRolagem, total, multiplicadorCritico, habilidadeTotal, forcaTotal, 'F', bonusFa);
    return `Força de Ataque (Força) - ${resultadoDado}`;
  } catch (e) {
    return 'Você não tem personagem';
  }
};

const forcaAtaqueLonge = async (args, jogador, canal) => {
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
    const bonusAtaqueEspecial = args[1] === 'ae' && itens
      .filter(({ atributoBonus }) => atributoBonus === 'aep')
      .reduce((acc, { atributoValor }) => { return acc + atributoValor; }, 0);

    const { primeiraRolagem, segundaRolagem, multiplicadorCritico } = rolar2d6();
    const totalPdF = poderDeFogo + bonusPdF + bonusAtaqueEspecial;
    const habilidadeTotal = habilidade + bonusHabilidade;
    const total = primeiraRolagem + segundaRolagem + habilidadeTotal + (totalPdF * multiplicadorCritico) + bonusFa;

    const resultadoDado = construirResultadoDado(primeiraRolagem, segundaRolagem, total, multiplicadorCritico, habilidadeTotal, totalPdF, 'PdF', bonusFa);
    return `Força de Ataque (Poder de Fogo) - ${resultadoDado}`;
  } catch (e) {
    return 'Você não tem personagem';
  }
};

const forcaDefesa = async (args, jogador, canal) => {
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
    const multiplicadorHabilidade = args[1] === 'sh' ? 0 : 1;

    const { primeiraRolagem, segundaRolagem, multiplicadorCritico } = rolar2d6();
    const totalArmadura = armadura + bonusArmadura;
    const habilidadeTotal = (habilidade + bonusHabilidade) * multiplicadorHabilidade;
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
    const bonusAtributo = ficha.itens
      .filter(({ atributoBonus }) => atributoBonus === args[1])
      .reduce((acc, { atributoValor }) => { return acc + atributoValor; }, 0);

    const { primeiraRolagem, segundaRolagem, multiplicadorCritico } = rolar2d6();
    const totalAtributo = ficha[atributo.nome] + bonusAtributo;
    const total = primeiraRolagem + segundaRolagem + (totalAtributo * multiplicadorCritico) + modificador;

    const resultadoDado = construirResultadoDado(primeiraRolagem, segundaRolagem, total, multiplicadorCritico, -1, totalAtributo, atributo.descricao[0], modificador);
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
      return `${nomeItem} adicionado`;
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
      return `${args[1]} removido`;
    } catch (e) {
      return 'Você não tem personagem';
    }
  }
  return;
};

const setAtributo = async (args, jogador, canal) => {
  if (args.length === 3) {
    const atributo = dicionarioAtributo[args[1]];
    if (!atributo) {
      return 'Atributo inválido';
    }
    try {
      const { value } = await atualizarAtributo(jogador, canal, atributo.nome, Number(args[2]));
      return `${atributo.descricao} modificado: ***${value[atributo.nome]} => ${args[2]}***`;
    } catch (e) {
      return 'Você não tem personagem';
    }
  }
  return;
};

module.exports = handleMessage;