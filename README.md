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

### Mostrar ficha
**Descrição**: Mostra a ficha do jogador que executou o comando.
**Comando**: *stats*

### Listar Itens/Vantagens
**Descrição**: Exibe os elementos de uma lista
- *lista* indica qual lista você quer saber o conteúdo, valor possíveis:
 - *i* de item
 - *v* de vantagem

**Comando**: *ls lista*

### Atualizar atributo
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

### Incrementar atributo
**Descrição**: Incrementa um atributo em um determinado valor, podendo ser positivo ou negativo.
Observação 1: não é possível incrementar pv e pm acima do seu máximo
Observação 2: se seu PV ficar igual à -10, GAME OVER
- *atributo* indica o nome do atributo que será incrementado
- *valor* indica em quanto determinado atributo será incrementado
- Não é necessário adicionar  o sinal de adição no comando *valor* quando quiser incrementar positivamente.

**Comando**: *inc atributo valor*

**Exemplos**:
- *inc pv 3* => cura 3 PVs
- *inc po -50* => gasta 50 POs
- *inc f 1* => aumenta 1 de Força

### Definir atributo
**Descrição**: Define um atributo para um determinado valor, podendo ser positivo ou negativo.
Observação: esse comando ignora qualquer regra de limite
- *atributo* indica o nome do atributo que será incrementado
- *valor* indica para qual valor determinado atributo será definido
- Não é necessário adicionar  o sinal de adição no comando *valor* quando quiser definir positivamente.

**Comando**: *set atributo valor*

**Exemplos**:
- *set pv 3* => define PV para
- *set po -50* => define PO para -50
- *set f 1* => define força para 1

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

### Adicionar item
**Descrição**: Adiciona um item ao seu inventário. Item é qualquer coisa que não afete suas rolagens de maneira automática. Por exemplo: potions, uma vantagem (vigoroso), um pergaminho, etc.
- *i* identifica o nome da lista (i de item).
- *nome do item* é o nome que você vai dar pro item, pode ter espaço entre o nome. Se quiser pode até adicionar a descrição inteira da vantagem.

**Comando**: *add i nome do item*
**Exemplos**:
- *add i potion que cura 2d6 + 1 => adiciona item com o nome "potion que cura 2d6 + 1"

### Adicionar vantagem
**Descrição**: Adiciona uma vantagem ao seu personagem. Vantagem é qualquer coisa que afete suas rolagens de maneira automática. Por exemplo: uma arma que dá fa+1, uma vantagem de ataque especial, um buff temporário, etc.
- *v* identifica o nome da lista (v de vantagem).
- *nomeAtributo* identifica o atributo que será impactado na rolagem. Atributos possíveis:
 - faf: bônus em força de ataque para força
 - fap: bônus em força de ataque para poder de fogo
 - fd: bônus em força de defesa
 - ini: bônus de iniciativa
 - f/h/a/r/p: bônus no atributo (conta para ataque, defesa e testes)
 - ae: ataque especial (nesse caso o *valorAtributo* indica o aumento do atributo, não o nível da vantagem, funciona tanto pra F como PdF)
 - aepe: ataque especial perigoso (nesse caso o *valorAtributo* indica o valor mínimo de crítico, não o nível da vantagem, funciona tanto pra F como PdF)
- *valorAtributo* indica em quanto o atributo irá se afetado, aceita número negativos
- *custoEmPm* quantos PMs custa usar a vantagem, o sistema só vai usar esse campo de forma automática se for um ataque especial
- *nome do item* é o nome que você vai dar pro item, pode ter espaço entre o nome

**Comando**: *add v nomeAtributo valorAtributo custoEmPm nome da vantagem*
**Exemplos**:
- *add v fap 1 0 Arco de Treinamento* => adiciona um "Arco de Treinamento" que dá FA+1 para poder de fogo e custa 0 PM
- *add v a 3 0 proteção mágica* => adiciona o buff "proteção mágica" que dá A+3 e custa 0 PM
- *add v ini 1 0 aceleração* => adiciona a vantagem "aceleração" que dá +1 em iniciativa e custa 0 PM
- *add v ae 2 2 ataque especial* => adiciona a vantagem de "ataque especial" que dá F+2 (ou PdF+2) e custa 2 PMs quando usada
- *add v aepe 5 3 ataque especial perigoso* => adicionar a vantagem "ataque especial perigoso" que consegue um acerto crítico com um resultado 5 ou 6 no dado e custa 3 PMs quando usada
  
### Remover item/vantagem
**Descrição**: Remove um item do inventário. Se você tiver vários itens com o mesmo nome, todos serão removidos.
- *lista* indica de qual lista o elemento será removido, valores possíveis:
 - *i*: remove da lista de Itens
 - *v*: remove da lista de Vantagens
- *posicao* indica a posição do elemento na lista

**Comando**: *rm lista posicao*
**Exemplos**: 
- *rm i 2* => remove o segundo elemento da lista de Itens
- *rm v 3* => remove o terceiro elemento da lista de Vantagens

### Rolagem do mestre (DM)
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
