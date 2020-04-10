# 3D&amp;Bot
Um bot de discord para jogar 3D&T. Esse bot usa a regra de combate alternativa descrita nesse PDF. As modificações de regras foram escritas por Ivan, O Grande.
# Como usar
### Pontos Importantes
- Cada jogador só pode ter uma ficha por canal do Discord;
- É preciso ter uma ficha criada para executar a maioria dos comandos;
- A maioria dos comandos são executados levando em conta o contexto do jogador que rodou o comando. Exemplo: usar o comando *faf* irá rolar um ataque com os atributos da ficha do jogador que escreveu o comando.

### Criar uma ficha
**Descrição**: Cria uma ficha. Se você já tiver uma ficha e criar outra, a primeira ficha será substituída pela segunda.
**Comando**: *ficha força,habilidade,resistência,armadura,poderdefogo*
**Exemplo**: *ficha 5,5,5,5,5*
###Mostrar ficha
**Descrição**: Mostra a ficha do jogador que executou o comando.
**Comando**: *stats*
###Atualizar atributo
**Descrição**: Atualiza um atributo para o valor especificado. 
- Possíveis valores para atributo:
 - f (força)
 - h (habilidade)
 - a (armadura)
 - r (resistência)
 - p (poder de fogo)

**Comando**: *set atributo novoValor*
**Exemplo**: *set f 3* => atualiza força para 3
### Atacar
**Descrição**: Realiza um ataque (força de ataque), podendo ser baseado em força, poder de fogo ou magia (Ataque Mágico).
- *ae* é um parâmetro opcional indicando que é um ataque especial, só é usado se você tiver esse item no inventário. Além disso, você deve ter ao menos 1 PM para usa esse movimento.
- *quantidadePms* indica quantos PMs serão usados na magia. Você deve ter PMs suficientes para usar esse movimento.

**Comandos**:
- Usando força:
*faf ae*
- Usando Poder de Fogo:
*fap ae*
- Usando Ataque Mágico:
*am quantidadePms*

### Defender
**Descrição**: Realiza uma defesa (força de defesa).
- *sh* é um parâmetro opcional para defender sem habilidade
- *sa* é um parâmetro opcional para defender sem armadura
- *ae* é um parâmetro opcional para defender com armadura extra
- Os parâmetros opcionais podem ser passados em qualquer ordem

**Comando**: *fd sh sa ae*
**Exemplos**:
- *fd sh* => defender sem habilidade, pois errou na esquiva
- *fd ae sh* => defender com armadura extre e sem habilidade, pois está indefeso

### Iniciativa
**Descrição**: Rola iniciativa.
**Comando**: *ini*

### Curar ou tomar dano (PV)
**Descrição**: Aumenta ou diminuiu os PVs atuais. Se ao tomar dano seu novo PV chegar à -10, é game over, seu personagem será excluído.
- *valor* pode ser positivo (cura) ou negativo (dano)
- Não é necessário adicionar  o sinal de adição no comando*valor*  quando quiser curar.

**Comando**: *pv valor*
**Exemplos**: 
- *pv 3* => cura 3 de vida
- *pv -5* => toma 5 de dano

### Recuperar ou gastar mana (PM)
**Descrição**: Aumenta ou diminuiu os PMs atuais.
- *valor* pode ser positivo (recuperar) ou negativo (gastar)
- Não é necessário adicionar  o sinal de adição no comando*valor*  quando quiser recuperar.

**Comando**:*pm valor*

### Gastar ou ganhar dinheiro (PO)
**Descrição**: Aumenta ou diminuiu as POs atuais.
- *valor* pode ser positivo (ganhar) ou negativo (gastar)
- Não é necessário adicionar  o sinal de adição no comando*valor*  quando quiser ganhar.

**Comando**: *pm valor*

### Gastar ou ganhar ponto heróico (PH)
**Descrição**: Aumenta ou diminuiu os PHs atuais. Há duas formas de modificar seus PHs, diretamente ou durante as rolagens.
 - Diretamente: nesse caso o comando funciona semelhante aos de PV, PM e PO.
 	- *valor* pode ser positivo (ganhar) ou negativo (gastar)
 	- Não é necessário adicionar  o sinal de adição no comando*valor*  quando quiser ganhar.

	**Comando**: *ph valor*

- Nas rolagens: nesse caso você nunca ganha PH, apenas usa. Para adicionar sucessos automáticos nas suas rolagens basta colocar um ou dois asteriscos depois do comando de rolagem. Funciona com os seguintes comando:
	- faf
	- fap
	- am
	- fd
	- dm
	- test

	**Exemplos**:
	- *fd&ast;* => defesa com sucesso decisivo
	- *faf&ast;&ast; ae* => força de ataque corpo-a-corpo com sucesso devastador e ataque especial

### Testar atributo
**Descrição**: Faz um teste da um atributo qualquer. Normalmente usado para perícia, esquiva, etc.
- *modificador* é um parâmetro opcional que será somado ao resultado
- Possíveis valores para atributo: 
 - f (força)
 - h (habilidade)
 - a (armadura)
 - r (resistência)
 - p (poder de fogo)
- *modificador* pode ser positivo (ganhar) ou negativo (gastar)
- Não é necessário adicionar  o sinal de adição no comando *modificador* .

**Comando**: *test atributo modificador*
**Exemplo**: *test h 3* => teste de habilidade +3

### Adicionar item/vantagem
**Descrição**: Adiciona um item ao seu inventário. Vantagens e itens são tratados da mesma forma. Pense no item como um buff que irá aumentar/diminuir algum atributo em algum valor.
- *nome* pode ser qualquer coisa, é o identificador do item. Não tem nenhum impacto no gameplay.
- *atributo* indica que caractística será afetada por esse item. Terá impacto durante suas rolagens. Possíveis valores para atributo:
 - faf: bônus em força de ataque para força
 - fap: bônus em força de ataque para poder de fogo
 - fd: bônus em força de defesa
 - ini: bônus de iniciativa
 - f/h/a/r/p: bônus no atributo (conta para ataque, defesa e testes)
  - aef: ataque especial de força (nesse caso o *valor* indica o aumento de força, não o nível da vantagem)
  - aep: ataque especial de pdf (idem)
- *valor* indica em quanto o atributo impactará nas rolagens

**Comando**: *add nome atributo valor*
**Exemplos**:
- *add Arco fap 1* => adiciona um arco que dá FA+1 para poder de fogo
- *add protecaoMagica a 3* => adiciona o buff proteção mágica que dá A+3
- *add aceleracao ini 1* => adiciona a vantagem aceleração que dá +1 em iniciativa
- *add ataqueEspecial aef 4* => adiciona a vantagem de ataque especial que dá F+4 quando usada
- *add potion qtd 1* => adicionar um potion no inventário, apenas para registro
  
### Remover item/vantagem
**Descrição**: Remove um item do inventário. Se você tiver vários itens com o mesmo nome, todos serão removidos.
**Comando**: *rm nome*
**Exemplo**: *rm espelhoMagico*

###Rolagem do mestre (DM)
**Descrição**: Comando para auxiliar o mestre. É um comando de rolagem bem genérico, podendo ser utilizado para muitos fins. Esse comando não precisa de uma ficha criada para funcionar, e mesmo que o jogador que o execute tenha um ficha, ela não será usada para calcular os valores.
- *atributoCritavel* indica qual valor será dobrado/triplicado em caso de crítico, normalmente F, A, R ou PdF
- *modificador* é um parâmetro opcional que será somado ao resultado
**Comando**: *dm atributoCritavel atributoNaoCritavel modificador*

**Exemplos**: 
- *dm 2 3* => 2d6 + Atr(2) + H(3) - usado para ataque e defesa
- *dm 0 3* => 2d6 + H(3) - iniciativa, defender sem A
- *dm 3 0* => 2d6 + Atr(3) - teste de atributo, defender sem H
- *dm 2 1 3* => 2d6 + Atr(2) + H(1) + Mod(3)

# Repositório Original
Fiz um fork desse repositório https://github.com/endarthur/3dt-bot
