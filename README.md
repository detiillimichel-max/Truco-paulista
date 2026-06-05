# 🃏 Truco Paulista

Jogo de Truco completo desenvolvido em JavaScript puro. Jogue contra o computador!

## 🎮 Como Jogar

1. **Clique em uma carta** para selecioná-la
2. **Clique em "Jogar"** para jogar a carta selecionada
3. **Peça Truco** para aumentar a aposta
4. Vença 2 das 3 rodadas para ganhar a mão
5. Primeiro a chegar em **12 pontos** vence!

## 📊 Hierarquia das Cartas

| Posição | Carta |
|---------|-------|
| 1º | 3 |
| 2º | 2 |
| 3º | A |
| 4º | K |
| 5º | J |
| 6º | Q |
| 7º | 7 |
| 8º | 6 |
| 9º | 5 |
| 10º | 4 |

## 🎯 Valores do Truco

- **Truco**: 3 pontos
- **Seis**: 6 pontos
- **Nove**: 9 pontos
- **Doze**: 12 pontos

## 🚀 Instalação

```bash
git clone https://github.com/seu-usuario/truco-game.git
cd truco-game
# Use qualquer servidor HTTP
python -m http.server 8000
