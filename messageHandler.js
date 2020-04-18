const {
  inserirFicha,
  removerFicha,
  buscarFicha,
  incrementarAtributo,
  inserirItem,
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
      return construirForcaAtaque(args, jogador, canal);
    case 'fap':
      return construirForcaAtaque(args, jogador, canal);
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
      return add(args, jogador, canal);
    case 'rm':
      return removeItem(args, jogador, canal);
    case 'ls':
      return ls(args, jogador, canal);
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
    const pvPm = caracteristicas[2] * 5;
    const ficha = {
      jogador, canal,
      forca: caracteristicas[0],
      habilidade: caracteristicas[1],
      resistencia: caracteristicas[2],
      armadura: caracteristicas[3],
      poderDeFogo: caracteristicas[4],
      pv: pvPm,
      pvmax: pvPm,
      pm: pvPm,
      pmmax: pvPm,
      po: 0,
      ph: 3,
      itens: [],
      vantagens: []
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

const somarAtributosVantagens = (vantagens, atributo) => vantagens
  .filter(({ atributo: atributoVantagem }) => atributoVantagem === atributo)
  .reduce((acc, { bonus }) => { return acc + bonus; }, 0);

const construirForcaAtaque = (args, jogador, canal) => {
  let bonusFa, bonusAtributo, atributo, descricao, atributoRolagem;

  if (args[0].startsWith('faf')) {
    bonusFa = 'faf';
    bonusAtributo = 'f';
    atributo = 'forca';
    atributoRolagem = 'F';
    descricao = 'Força';
  } else {
    bonusFa = 'fap';
    bonusAtributo = 'p';
    atributo = 'poderDeFogo';
    atributoRolagem = 'PdF';
    descricao = 'Poder de Fogo';
  }

  return forcaAtaque(args, jogador, canal, bonusFa, bonusAtributo, atributo, descricao, atributoRolagem);
};

const forcaAtaque = async (args, jogador, canal, nomeFa, nomeAtributo, atributo, descricao, atributoRolagem) => {
  try {
    const ficha = await buscarFicha(jogador, canal);
    const { habilidade, vantagens, pm, ph } = ficha;
    const [comando, ...rest] = args;

    /**
     * ae = ataque especial
     * aepe = ataque especial perigoso
     */
    const variacoesAtaqueEspecial = ['ae', 'aepe'];
    const ataquesEspeciais = checkVariocoesArgs(rest, variacoesAtaqueEspecial);

    const custoAtaqueEspecial = Object.getOwnPropertyNames(ataquesEspeciais).reduce((acc, atual) => {
      const ataqueAtual = vantagens.find(({ atributo }) => atributo === atual);
      if (ataqueAtual) {
        return ataqueAtual.custo + acc;
      }
      return acc;
    }, 0);

    if (custoAtaqueEspecial > pm) {
      return 'Você não tem PM suficiente para esse ataque';
    }

    const criticoAutomatico = comando.match(/\*/gi);
    const quantidadeCriticos = criticoAutomatico ? criticoAutomatico.length : 0;
    if (quantidadeCriticos > ph) {
      return 'Você não tem PH suficiente para esse ataque';
    }

    const bonusFa = somarAtributosVantagens(vantagens, nomeFa);
    const bonusAtributo = somarAtributosVantagens(vantagens, nomeAtributo);
    const bonusHabilidade = somarAtributosVantagens(vantagens, 'h');
    const bonusAtaqueEspecial = (ataquesEspeciais.ae && somarAtributosVantagens(vantagens, 'ae')) || 0;

    let pmsRestantes = '';
    if (custoAtaqueEspecial > 0) {
      const { value } = await incrementarAtributo(jogador, canal, -custoAtaqueEspecial, 'pm');
      pmsRestantes = `\nPMs restantes: ${value.pm - custoAtaqueEspecial}`;
    }

    let phsRestantes = '';
    if (quantidadeCriticos > 0) {
      const { value } = await incrementarAtributo(jogador, canal, -quantidadeCriticos, 'ph');
      phsRestantes = `\nPHs restantes: ${value.ph - quantidadeCriticos}`;
    }

    const valorCritico = (ataquesEspeciais.aepe && somarAtributosVantagens(vantagens, 'aepe')) || 6;
    const { primeiraRolagem, segundaRolagem, multiplicadorCritico } = rolar2d6(quantidadeCriticos, valorCritico);
    const atributoTotal = ficha[atributo] + bonusAtributo + bonusAtaqueEspecial;
    const habilidadeTotal = habilidade + bonusHabilidade;
    const total = primeiraRolagem + segundaRolagem + habilidadeTotal + (atributoTotal * multiplicadorCritico) + bonusFa;

    const resultadoDado = construirResultadoDado(primeiraRolagem, segundaRolagem, total, multiplicadorCritico, habilidadeTotal, atributoTotal, atributoRolagem, bonusFa);
    return `Força de Ataque (${descricao}) - ${resultadoDado}${pmsRestantes}${phsRestantes}`;
  } catch (e) {
    console.log(e);
    return 'Você não tem personagem';
  }
};

const checkVariocoesArgs = (args, possiveisVariacoes) => {
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
    const { armadura, habilidade, vantagens, ph } = await buscarFicha(jogador, canal);

    const criticoAutomatico = comando.match(/\*/gi);
    const quantidadeCriticos = criticoAutomatico ? criticoAutomatico.length : 0;
    if (quantidadeCriticos > ph) {
      return 'Você não tem PH suficiente para esse movimento';
    }

    const bonusFd = somarAtributosVantagens(vantagens, 'fd');
    const bonusArmadura = somarAtributosVantagens(vantagens, 'a');
    const bonusHabilidade = somarAtributosVantagens(vantagens, 'h');

    /**
    * sh = sem habilidade
    * sa = sem armadura
    * ae = armadura extra
    */
    const possiveisVariacoes = ['sh', 'sa', 'ae'];
    const { sh: semHabilidade, sa: semArmadura, ae: armaduraExtra } = checkVariocoesArgs(rest, possiveisVariacoes);
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
      const { pm, vantagens, habilidade, ph } = await buscarFicha(jogador, canal);

      if (pmsGastos === 0 || pmsGastos > pm) {
        return `Seus PMs atuais (${pm}) são insuficientes pra conjurar essa magia`;
      }

      const criticoAutomatico = args[0].match(/\*/gi);
      const quantidadeCriticos = criticoAutomatico ? criticoAutomatico.length : 0;
      if (quantidadeCriticos > ph) {
        return 'Você não tem PH suficiente para esse ataque';
      }

      const bonusHabilidade = somarAtributosVantagens(vantagens, 'h');
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
    const { habilidade, vantagens } = await buscarFicha(jogador, canal);

    const bonusIniciativa = somarAtributosVantagens(vantagens, 'ini');
    const bonusHabilidade = somarAtributosVantagens(vantagens, 'h');

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
  maxpv: { nome: 'pvmax', descricao: 'Máx PV' },
  pvmax: { nome: 'pvmax', descricao: 'Máx PV' },
  pm: { nome: 'pm', descricao: 'PM' },
  maxpm: { nome: 'pmmax', descricao: 'Máx PM' },
  pmmax: { nome: 'pmmax', descricao: 'Máx PM' },
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

    const bonusAtributo = somarAtributosVantagens(ficha.itens, args[1]);

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

    let incremento = Number(args[2] || 0);
    if (incremento !== 0) {
      const { nome, descricao } = atributo;
      if (nome === 'pv' || nome === 'pm') {
        const ficha = await buscarFicha(jogador, canal);
        const novoValorPossivel = incremento + ficha[nome];
        const nomeMaxAtributo = `${nome}max`;
        incremento = novoValorPossivel <= ficha[nomeMaxAtributo] ? incremento : ficha[nomeMaxAtributo] - ficha[nome];
      }

      const { value } = await incrementarAtributo(jogador, canal, incremento, nome);
      const novoValor = value[nome] + incremento;

      if (nome === 'pv' && novoValor <= -10) {
        await removerFicha(jogador, canal);
        return 'GAME OVER';
      }

      return `${descricao} modificado: ***${value[nome]} => ${novoValor}***`;
    }
  } catch (e) {
    return 'Você não tem personagem';
  }
};

const stats = async (jogador, canal) => {
  try {
    const { forca, habilidade, resistencia, armadura, poderDeFogo, pv, pvmax, pm, pmmax, po, ph } = await buscarFicha(jogador, canal);

    return `
    Força: ${forca}
    Habilidade: ${habilidade}
    Resistencia: ${resistencia}
    Armadura: ${armadura}
    Poder de Fogo: ${poderDeFogo}
    PV: ${pv} / ${pvmax}
    PM: ${pm} / ${pmmax}
    PO: ${po}
    PH: ${ph}
    `;
  } catch (e) {
    return 'Você não tem personagem';
  }
};

const dicionarioLista = {
  i: { nome: 'itens', descricao: 'Itens' },
  v: { nome: 'vantagens', descricao: 'Vantagens' }
};

const add = async (args, jogador, canal) => {
  const lista = dicionarioLista[args[1]];
  if (!lista) {
    return 'Lista Inválida';
  }
  const { nome, descricao } = lista;

  try {
    if (nome === 'itens') {
      const [, , ...rest] = args;
      const nomeItem = rest.toString().replace(/,/g, ' ');
      await inserirItem(jogador, canal, nome, nomeItem);
      return `${nomeItem} adicionado (${descricao})`;
    }

    const [, , atributo, bonus, custo, ...rest] = args;
    const nomeItem = rest.toString().replace(/,/g, ' ');
    const item = {
      nome: nomeItem,
      atributo,
      bonus: Number(bonus),
      custo: Number(custo)
    };
    await inserirItem(jogador, canal, nome, item);
    return `${nomeItem} adicionado em ${descricao}`;
  } catch (e) {
    return 'Você não tem personagem';
  }
};

const removeItem = async (args, jogador, canal) => {
  const lista = dicionarioLista[args[1]];
  if (!lista) {
    return 'Lista Inválida';
  }
  const { nome, descricao } = lista;

  try {
    const ficha = await buscarFicha(jogador, canal);
    const listaAtual = ficha[nome];
    const indexElemento = args[2] - 1;
    const elemento = nome === 'itens' ? listaAtual[indexElemento] : listaAtual[indexElemento].nome;

    listaAtual.splice(indexElemento, 1);
    await atualizarAtributo(jogador, canal, nome, listaAtual);

    return `${elemento} removido de ${descricao}`;
  } catch (e) {
    return 'Erro ao remover elemento da lista';
  }
};

const ls = async (args, jogador, canal) => {
  const lista = dicionarioLista[args[1]];
  if (!lista) {
    return 'Lista Inválida';
  }

  try {
    const ficha = await buscarFicha(jogador, canal);
    const { nome, descricao } = lista;
    let print;
    if (nome === 'itens') {
      print = ficha[nome].map((item, index) => `\n${index + 1} - ${item}`);
    } else {
      print = ficha[nome].map(({ nome: nomeItem, bonus, atributo, custo }, index) => {
        const sinal = bonus > 0 ? '+' : '';
        return `\n${index + 1} - ${nomeItem} (${custo} PM) => ${atributo} ${sinal}${bonus}`;
      });
    }
    if (print.length > 0) {
      return `Listando ${descricao}:${print.toString()}`;
    } else {
      return 'Lista vazia';
    }
  } catch (e) {
    return 'Erro ao listar elementos';
  }
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