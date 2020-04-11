const {
  inserirFicha,
  removerFicha,
  buscarFicha,
  incrementarAtributo,
  inserirItem,
  deletarItem,
  atualizarAtributo
} = require('./db');
const rolar2d6 = require('./dado');

const handleMessage = (args, jogador, canal) => {
  switch (args[0].split('*')[0]) {
    case 'ajuda':
      return ajuda();
    case 'ficha':
      return criarFicha(args, jogador, canal);
    case 'faf':
      return forcaAtaquePerto(args, jogador, canal);
    case 'fap':
      return forcaAtaqueLonge(args, jogador, canal);
    case 'am':
      return ataqueMagico(args, jogador, canal);
    case 'fd':
      return forcaDefesa(args, jogador, canal);
    case 'dm':
      return dungeonMaster(args, jogador, canal);
    case 'ini':
      return iniciativa(jogador, canal);
    case 'test':
      return teste(args, jogador, canal);
    case 'inc':
      return incAtributo(args, jogador, canal);
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

const ajuda = () => 'Para a lista completa de comandos, acesse https://github.com/RenanCostaNascimento/3dt-bot#como-usar';

const criarFicha = async (args, jogador, canal) => {
  if (args.length === 2) {
    const caracteristicas = args[1].split(',').map(parseFloat);
    const ficha = {
      jogador, canal,
      forca: caracteristicas[0],
      habilidade: caracteristicas[1],
      resistencia: caracteristicas[2],
      armadura: caracteristicas[3],
      poderDeFogo: caracteristicas[4],
      pv: caracteristicas[2] * 5,
      pm: caracteristicas[2] * 5,
      po: 0,
      ph: 3,
      itens: [
        { nome: 'Ataque Especial Básico - Força', atributoBonus: 'aef', atributoValor: 1 },
        { nome: 'Ataque Especial Básico - PdF', atributoBonus: 'aep', atributoValor: 1 }
      ]
    };
    await inserirFicha(ficha);
    return 'Sua ficha foi criada';
  }
};

const dungeonMaster = async (args) => {
  if (args.length >= 3) {
    const atributo = Number(args[1]);
    const habilidade = Number(args[2]);
    const modificador = Number(args[3] || 0);

    const criticoAutomatico = args[0].match(/\*/gi);
    const quantidadeCriticos = criticoAutomatico ? criticoAutomatico.length : 0;

    const { primeiraRolagem, segundaRolagem, multiplicadorCritico } = rolar2d6(quantidadeCriticos);

    const total = primeiraRolagem + segundaRolagem + habilidade + (atributo * multiplicadorCritico) + modificador;
    const resultadoDado = construirResultadoDado(primeiraRolagem, segundaRolagem, total, multiplicadorCritico, habilidade, atributo, 'Atr', modificador);

    return `Rolagem do Mestre - ${resultadoDado}`;
  }
};

const somarAtributosItens = (itens, atributo) => itens
  .filter(({ atributoBonus }) => atributoBonus === atributo)
  .reduce((acc, { atributoValor }) => { return acc + atributoValor; }, 0);

const forcaAtaquePerto = async (args, jogador, canal) => {
  try {
    const { forca, habilidade, itens, pm, ph } = await buscarFicha(jogador, canal);

    const ehAtaqueEspecial = args[1] === 'ae';
    if (ehAtaqueEspecial && pm === 0) {
      return 'Você não tem PM suficiente para esse ataque';
    }

    const criticoAutomatico = args[0].match(/\*/gi);
    const quantidadeCriticos = criticoAutomatico ? criticoAutomatico.length : 0;
    if (quantidadeCriticos > ph) {
      return 'Você não tem PH suficiente para esse ataque';
    }

    const bonusFa = somarAtributosItens(itens, 'faf');
    const bonusForca = somarAtributosItens(itens, 'f');
    const bonusHabilidade = somarAtributosItens(itens, 'h');
    const bonusAtaqueEspecial = ehAtaqueEspecial && somarAtributosItens(itens, 'aef');

    let pmsRestantes = '';
    if (ehAtaqueEspecial) {
      const { value } = await incrementarAtributo(jogador, canal, -1, 'pm');
      pmsRestantes = `\nPMs restantes: ${value.pm}`;
    }

    let phsRestantes = '';
    if (quantidadeCriticos > 0) {
      const { value } = await incrementarAtributo(jogador, canal, -quantidadeCriticos, 'ph');
      phsRestantes = `\nPHs restantes: ${value.ph}`;
    }

    const { primeiraRolagem, segundaRolagem, multiplicadorCritico } = rolar2d6(quantidadeCriticos);
    const forcaTotal = forca + bonusForca + bonusAtaqueEspecial;
    const habilidadeTotal = habilidade + bonusHabilidade;
    const total = primeiraRolagem + segundaRolagem + habilidadeTotal + (forcaTotal * multiplicadorCritico) + bonusFa;

    const resultadoDado = construirResultadoDado(primeiraRolagem, segundaRolagem, total, multiplicadorCritico, habilidadeTotal, forcaTotal, 'F', bonusFa);
    return `Força de Ataque (Força) - ${resultadoDado}${pmsRestantes}${phsRestantes}`;
  } catch (e) {
    return 'Você não tem personagem';
  }
};

const forcaAtaqueLonge = async (args, jogador, canal) => {
  try {
    const { poderDeFogo, habilidade, itens, pm, ph } = await buscarFicha(jogador, canal);

    const ehAtaqueEspecial = args[1] === 'ae';
    if (ehAtaqueEspecial && pm === 0) {
      return 'Você não tem PM suficiente para esse ataque';
    }

    const criticoAutomatico = args[0].match(/\*/gi);
    const quantidadeCriticos = criticoAutomatico ? criticoAutomatico.length : 0;
    if (quantidadeCriticos > ph) {
      return 'Você não tem PH suficiente para esse ataque';
    }

    const bonusFa = somarAtributosItens(itens, 'fap');
    const bonusPdF = somarAtributosItens(itens, 'p');
    const bonusHabilidade = somarAtributosItens(itens, 'h');
    const bonusAtaqueEspecial = ehAtaqueEspecial && somarAtributosItens(itens, 'aep');

    let pmsRestantes = '';
    if (ehAtaqueEspecial) {
      const { value } = await incrementarAtributo(jogador, canal, -1, 'pm');
      pmsRestantes = `\nPMs restantes: ${value.pm}`;
    }

    let phsRestantes = '';
    if (quantidadeCriticos > 0) {
      const { value } = await incrementarAtributo(jogador, canal, -quantidadeCriticos, 'ph');
      phsRestantes = `\nPHs restantes: ${value.ph}`;
    }

    const { primeiraRolagem, segundaRolagem, multiplicadorCritico } = rolar2d6(quantidadeCriticos);
    const totalPdF = poderDeFogo + bonusPdF + bonusAtaqueEspecial;
    const habilidadeTotal = habilidade + bonusHabilidade;
    const total = primeiraRolagem + segundaRolagem + habilidadeTotal + (totalPdF * multiplicadorCritico) + bonusFa;

    const resultadoDado = construirResultadoDado(primeiraRolagem, segundaRolagem, total, multiplicadorCritico, habilidadeTotal, totalPdF, 'PdF', bonusFa);
    return `Força de Ataque (Poder de Fogo) - ${resultadoDado}${pmsRestantes}${phsRestantes}`;
  } catch (e) {
    return 'Você não tem personagem';
  }
};

const checkVariocoesDefesa = (args) => {
  /**
   * sh = sem habilidade
   * sa = sem armadura
   * ae = armadura extra
   */
  const possiveisVariacoes = ['sh', 'sa', 'ae'];
  const variacoes = {};
  args.forEach(arg => {
    if (possiveisVariacoes.some((variacao) => variacao === arg)) {
      variacoes[arg] = true;
    }
  });

  return variacoes;
};


const forcaDefesa = async (args, jogador, canal) => {
  const [comando, ...rest] = args;

  try {
    const { armadura, habilidade, itens, ph } = await buscarFicha(jogador, canal);

    const criticoAutomatico = comando.match(/\*/gi);
    const quantidadeCriticos = criticoAutomatico ? criticoAutomatico.length : 0;
    if (quantidadeCriticos > ph) {
      return 'Você não tem PH suficiente para esse movimento';
    }

    const bonusFd = somarAtributosItens(itens, 'fd');
    const bonusArmadura = somarAtributosItens(itens, 'a');
    const bonusHabilidade = somarAtributosItens(itens, 'h');

    const { sh: semHabilidade, sa: semArmadura, ae: armaduraExtra } = checkVariocoesDefesa(rest);
    const multiplicadorHabilidade = semHabilidade ? 0 : 1;
    const multiplicadorArmadura = semArmadura ? 0 : 1;
    const multiplicadorArmaduraExtra = armaduraExtra ? 2 : 1;

    let phsRestantes = '';
    if (quantidadeCriticos > 0) {
      const { value } = await incrementarAtributo(jogador, canal, -quantidadeCriticos, 'ph');
      phsRestantes = `\nPHs restantes: ${value.ph}`;
    }

    const { primeiraRolagem, segundaRolagem, multiplicadorCritico } = rolar2d6(quantidadeCriticos);
    const totalArmadura = (armadura + bonusArmadura) * multiplicadorArmadura * multiplicadorArmaduraExtra;
    const habilidadeTotal = (habilidade + bonusHabilidade) * multiplicadorHabilidade;
    const total = primeiraRolagem + segundaRolagem + habilidadeTotal + (totalArmadura * multiplicadorCritico) + bonusFd;

    const resultadoDado = construirResultadoDado(primeiraRolagem, segundaRolagem, total, multiplicadorCritico, habilidadeTotal, totalArmadura, 'A', bonusFd);
    return `Força de Defesa - ${resultadoDado}${phsRestantes}`;
  } catch (e) {
    return 'Você não tem personagem';
  }
};

const ataqueMagico = async (args, jogador, canal) => {
  if (args.length === 2) {
    try {
      const pmsGastos = Number(args[1]) || 0;
      const { pm, itens, habilidade, ph } = await buscarFicha(jogador, canal);

      if (pmsGastos === 0 || pmsGastos > pm) {
        return `Seus PMs atuais (${pm}) são insuficientes pra conjurar essa magia`;
      }

      const criticoAutomatico = args[0].match(/\*/gi);
      const quantidadeCriticos = criticoAutomatico ? criticoAutomatico.length : 0;
      if (quantidadeCriticos > ph) {
        return 'Você não tem PH suficiente para esse ataque';
      }

      const bonusHabilidade = somarAtributosItens(itens, 'h');
      const habilidadeTotal = habilidade + bonusHabilidade;
      const limiteMagico = habilidadeTotal === 0 ? 3 : habilidadeTotal * 5;

      if (pmsGastos > limiteMagico) {
        return `Seu limite de PMs gastos em uma única magia é de ${limiteMagico}`;
      }

      let phsRestantes = '';
      if (quantidadeCriticos > 0) {
        const { value } = await incrementarAtributo(jogador, canal, -quantidadeCriticos, 'ph');
        phsRestantes = `\nPHs restantes: ${value.ph}`;
      }

      const { value: { pm: pmsRestantes } } = await incrementarAtributo(jogador, canal, -pmsGastos, 'pm');

      const { primeiraRolagem, segundaRolagem } = rolar2d6(quantidadeCriticos);
      const total = primeiraRolagem + segundaRolagem + habilidadeTotal + pmsGastos;
      const resultadoDado = construirResultadoDado(primeiraRolagem, segundaRolagem, total, 0, habilidadeTotal, 0, undefined, pmsGastos);

      return `Ataque Mágico - ${resultadoDado}\nPMs restantes: ${pmsRestantes}${phsRestantes}`;
    } catch (e) {
      return 'Você não tem personagem';
    }
  }
  return;
};

const iniciativa = async (jogador, canal) => {
  try {
    const { habilidade, itens } = await buscarFicha(jogador, canal);

    const bonusIniciativa = somarAtributosItens(itens, 'ini');
    const bonusHabilidade = somarAtributosItens(itens, 'h');

    const { primeiraRolagem, segundaRolagem } = rolar2d6();
    const habilidadeTotal = habilidade + bonusHabilidade;
    const total = primeiraRolagem + segundaRolagem + habilidadeTotal + bonusIniciativa;

    const resultadoDado = construirResultadoDado(primeiraRolagem, segundaRolagem, total, 0, habilidadeTotal, -1, undefined, bonusIniciativa);
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
  p: { nome: 'poderDeFogo', descricao: 'Poder de Fogo' },
  pv: { nome: 'pv', descricao: 'PV' },
  pm: { nome: 'pm', descricao: 'PM' },
  po: { nome: 'po', descricao: 'PO' },
  ph: { nome: 'ph', descricao: 'PH' }
};

const teste = async (args, jogador, canal) => {
  const atributo = dicionarioAtributo[args[1]];
  if (!atributo) {
    return 'Atributo inválido';
  }

  try {
    const modificador = Number(args[2] || 0);
    const ficha = await buscarFicha(jogador, canal);

    const criticoAutomatico = args[0].match(/\*/gi);
    const quantidadeCriticos = criticoAutomatico ? criticoAutomatico.length : 0;
    if (quantidadeCriticos > ficha.ph) {
      return 'Você não tem PH suficiente para esse ataque';
    }

    const bonusAtributo = somarAtributosItens(ficha.itens, args[1]);

    const { primeiraRolagem, segundaRolagem, multiplicadorCritico } = rolar2d6(quantidadeCriticos);
    const totalAtributo = ficha[atributo.nome] + bonusAtributo;
    const total = primeiraRolagem + segundaRolagem + (totalAtributo * multiplicadorCritico) + modificador;

    let phsRestantes = '';
    if (quantidadeCriticos > 0) {
      const { value } = await incrementarAtributo(jogador, canal, -quantidadeCriticos, 'ph');
      phsRestantes = `\nPHs restantes: ${value.ph}`;
    }

    const resultadoDado = construirResultadoDado(primeiraRolagem, segundaRolagem, total, multiplicadorCritico, -1, totalAtributo, atributo.descricao[0], modificador);
    return `Teste de ${atributo.descricao} - ${resultadoDado}${phsRestantes}`;
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

const incAtributo = async (args, jogador, canal) => {
  try {
    const atributo = dicionarioAtributo[args[1]];
    if (!atributo) {
      return 'Atributo inválido';
    }

    const incremento = Number(args[2] || 0);
    if (incremento !== 0) {
      const { value } = await incrementarAtributo(jogador, canal, incremento, atributo.nome);
      const novoValor = value[atributo.nome] + incremento;
      if (atributo.nome === 'pv' && novoValor <= -10) {
        await removerFicha(jogador, canal);
        return 'GAME OVER';
      }
      return `${atributo.descricao} modificado: ***${value[atributo.nome]} => ${novoValor}***`;
    }
  } catch (e) {
    return 'Você não tem personagem';
  }
};

const stats = async (jogador, canal) => {
  try {
    const { forca, habilidade, resistencia, armadura, poderDeFogo, pv, pm, po, ph, itens } = await buscarFicha(jogador, canal);
    const listagemItens = itens.map(({ nome, atributoBonus, atributoValor }) => `\n\t\t- ${nome} (${atributoBonus}): ${atributoValor}`);

    return `
    Força: ${forca}
    Habilidade: ${habilidade}
    Resistencia: ${resistencia}
    Armadura: ${armadura}
    Poder de Fogo: ${poderDeFogo}
    PV: ${pv}
    PM: ${pm}
    PO: ${po}
    PH: ${ph}
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