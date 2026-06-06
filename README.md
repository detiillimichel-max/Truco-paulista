# 🃏 Truco Paulista

Jogo de Truco Paulista contra o computador, feito em HTML, CSS e JavaScript puro.

## Baralho e distribuição

- Baralho de 40 cartas. Naipes: ♥ ♦ ♠ ♣
- Ordem de força base, da mais fraca para a mais forte:
  4 < 5 < 6 < 7 < Q < J < K < A < 2 < 3
- São distribuídas 3 cartas para você e 3 para o computador
- 1 carta é virada como Vira. A carta seguinte a Vira vira Manilha

## Manilhas

- As 4 cartas do valor da manilha são as mais fortes do jogo, acima do 3
- Entre as manilhas o desempate é por naipe:
  Paus ♣ > Copas ♥ > Espadas ♠ > Ouros ♦
- No jogo elas aparecem com ⭐ na carta

Exemplo: Vira = 6 ♠ → Manilha = 7. Então 7♣ é a carta mais forte do baralho.

## Como se ganha uma mão

A mão é melhor de 3 rodadas:

1. 2 rodadas vencidas = ganha a mão
2. Vantagem da primeira: quem vence a 1ª rodada tem vantagem. Se a 2ª empatar, quem venceu a 1ª leva a mão
3. 1ª rodada empata: quem vencer a 2ª leva a mão
4. 3ª rodada: se cada um venceu uma, a 3ª decide. Se empatar a 3ª, a mão empata e ninguém pontua

## Valores do Truco

- Mão normal = 1 ponto
- Truco aceito = 3 pontos
- Seis = 6 pontos
- Nove = 9 pontos
- Doze = 12 pontos

No jogo atual só está implementado o pedido de Truco na 1ª rodada. O computador aceita com 60% de chance. Se recusar, quem pediu ganha os pontos da mão atual.

## Fim de jogo

Primeiro a fazer 12 pontos vence a partida.

## Jogabilidade

1. Clique em uma das suas 3 cartas para selecionar
2. Clique em Jogar
3. O computador joga automaticamente
4. Use Truco! na 1ª rodada se quiser aumentar a aposta
5. Nova Partida zera placar e começa do zero

## Tecnologias

- HTML5
- CSS3
- JavaScript ES6+

## Como jogar

Abra o `index.html` no navegador ou acesse via GitHub Pages.

---
Desenvolvido para jogar Truco Paulista no celular e desktop.
