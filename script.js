class TrucoGame {
    constructor() {
        this.deck = [];
        this.playerHand = [];
        this.computerHand = [];
        this.vira = null;          // carta que define a manilha
        this.manilhas = [];        // lista de cartas manilha (4 cartas, mesmo valor)
        this.playerCard = null;
        this.computerCard = null;
        this.playerScore = 0;
        this.computerScore = 0;
        this.currentRound = 1;      // 1, 2 ou 3
        this.playerRoundWins = 0;   // quantas rodadas o jogador venceu nesta mão
        this.computerRoundWins = 0;
        this.trucoRequested = false;
        this.trucoValue = 1;        // 1,3,6,9,12
        this.waitingTrucoResponse = false;
        this.gameActive = true;
        this.selectedCardIndex = null;
        this.firstRoundWinner = null; // 'player', 'computer' ou null (para vantagem no empate)
        
        // Ordem das cartas (da mais fraca para a mais forte, sem considerar manilhas)
        this.rankOrder = ['4', '5', '6', '7', 'Q', 'J', 'K', 'A', '2', '3'];
        this.suits = ['♥', '♦', '♠', '♣'];
        
        this.init();
        this.setupEventListeners();
    }
    
    // ================== INICIALIZAÇÃO ==================
    init() {
        this.createDeck();
        this.shuffleDeck();
        this.distributeCards();  // distribui 3 para cada e define vira
        this.render();
        this.updateStatus('Sua vez! Selecione uma carta e clique em Jogar.');
    }
    
    createDeck() {
        this.deck = [];
        for (let suit of this.suits) {
            for (let rank of this.rankOrder) {
                this.deck.push({ rank, suit });
            }
        }
    }
    
    shuffleDeck() {
        for (let i = this.deck.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.deck[i], this.deck[j]] = [this.deck[j], this.deck[i]];
        }
    }
    
    distributeCards() {
        // Distribui 3 cartas para o jogador, 3 para o computador e 1 vira
        this.playerHand = this.deck.splice(0, 3);
        this.computerHand = this.deck.splice(0, 3);
        this.vira = this.deck.shift();  // a próxima carta é a vira
        // O restante do baralho não será usado (truco não tem compra)
        
        // Ordena as mãos (opcional)
        this.sortHand(this.playerHand);
        this.sortHand(this.computerHand);
        
        // Calcula as manilhas baseado na vira
        this.calculateManilhas();
    }
    
    sortHand(hand) {
        // Ordena por força (mais forte primeiro)
        hand.sort((a, b) => this.getCardValue(b) - this.getCardValue(a));
    }
    
    calculateManilhas() {
        const viraRank = this.vira.rank;
        const viraIndex = this.rankOrder.indexOf(viraRank);
        // A manilha é a carta seguinte na ordem (circular)
        let manilhaRankIndex = (viraIndex + 1) % this.rankOrder.length;
        const manilhaRank = this.rankOrder[manilhaRankIndex];
        
        // As 4 cartas deste valor são manilhas
        this.manilhas = [];
        for (let suit of this.suits) {
            this.manilhas.push({ rank: manilhaRank, suit });
        }
    }
    
    // ================== LÓGICA DE VALORES ==================
    getCardValue(card) {
        // Verifica se é manilha
        const isManilha = this.manilhas.some(m => m.rank === card.rank && m.suit === card.suit);
        if (isManilha) {
            // Entre manilhas, a ordem é 7 > 6 > 5 > 4 (a mais forte é 7)
            const manilhaStrength = { '7': 4, '6': 3, '5': 2, '4': 1 };
            return 100 + (manilhaStrength[card.rank] || 0);
        }
        
        // Valor normal baseado na posição na ordem (índice)
        const rankIndex = this.rankOrder.indexOf(card.rank);
        return rankIndex;  // 0=4 (mais fraca), 9=3 (mais forte)
    }
    
    // ================== COMPARAÇÃO DAS CARTAS ==================
    compareCards(cardA, cardB) {
        const valA = this.getCardValue(cardA);
        const valB = this.getCardValue(cardB);
        if (valA > valB) return 'player';
        if (valB > valA) return 'computer';
        return 'draw';
    }
    
    // ================== LÓGICA DA MÃO (VITÓRIA DAS RODADAS) ==================
    playRound(playerCard, computerCard) {
        const result = this.compareCards(playerCard, computerCard);
        const playerCardStr = `${playerCard.rank}${playerCard.suit}`;
        const computerCardStr = `${computerCard.rank}${computerCard.suit}`;
        
        // Atualiza contadores
        if (result === 'player') {
            this.playerRoundWins++;
            this.updateStatus(`✅ Você venceu a rodada ${this.currentRound}! (${playerCardStr} > ${computerCardStr})`);
        } else if (result === 'computer') {
            this.computerRoundWins++;
            this.updateStatus(`❌ Computador venceu a rodada ${this.currentRound}! (${computerCardStr} > ${playerCardStr})`);
        } else {
            this.updateStatus(`⚖️ Empate na rodada ${this.currentRound}! (${playerCardStr} = ${computerCardStr})`);
        }
        
        this.render();
        
        // Verifica se a mão já terminou
        const handWinner = this.checkHandWinner();
        if (handWinner) {
            setTimeout(() => this.endHand(handWinner), 1500);
            return;
        }
        
        // Prepara próxima rodada
        this.currentRound++;
        this.playerCard = null;
        this.computerCard = null;
        this.selectedCardIndex = null;
        
        // Se não acabou, e é a vez do computador? Na verdade, após o jogador jogar, o computador já jogou.
        // Agora é a vez do jogador novamente.
        this.render();
        this.updateStatus(`Rodada ${this.currentRound}! Selecione sua carta.`);
    }
    
    // Retorna 'player', 'computer' ou null se a mão não terminou
    checkHandWinner() {
        // Caso 1: Alguém venceu as duas primeiras rodadas
        if (this.playerRoundWins === 2) return 'player';
        if (this.computerRoundWins === 2) return 'computer';
        
        // Caso 2: Após a segunda rodada, se há um vencedor e um empate? 
        // A regra de vantagem: quem venceu a primeira, se empatar a segunda, vence a mão.
        if (this.currentRound === 2) {
            // Jogamos a segunda rodada e houve empate?
            // Precisamos saber se o resultado da segunda rodada foi empate.
            // Para isso, podemos verificar se as duas rodadas já foram jogadas e o número de vitórias não mudou.
            // Mas como estamos chamando esta função logo após o playRound, já temos os contadores atualizados.
            // Se após a segunda rodada, um dos jogadores tem 1 vitória e o outro 0, e a segunda foi empate? Na verdade, se empatou a segunda, os contadores continuam 1x0.
            // Então, se (playerRoundWins === 1 && computerRoundWins === 0) ou inverso, e a rodada atual é 2 (já jogou a segunda), significa que a segunda foi empate.
            // Porém a função é chamada após a segunda rodada. Vamos usar uma lógica mais clara:
            // Se estamos na rodada 2 (após jogar), e os placares são 1x0, significa que a primeira foi vencida por alguém e a segunda empatou.
            if (this.playerRoundWins === 1 && this.computerRoundWins === 0) return 'player';
            if (this.computerRoundWins === 1 && this.playerRoundWins === 0) return 'computer';
        }
        
        // Caso 3: Terceira rodada decidiu (quando ambos têm 1 vitória)
        if (this.currentRound === 3 && (this.playerRoundWins === 2 || this.computerRoundWins === 2)) {
            return this.playerRoundWins === 2 ? 'player' : 'computer';
        }
        
        // Caso 4: Se após a terceira rodada houver empate (1x1 com empate na terceira?) Improvável, mas se empatar a terceira, ninguém ganha? Regra: se empatar a terceira, a mão é empatada e ninguém pontua.
        if (this.currentRound === 3 && this.playerRoundWins === 1 && this.computerRoundWins === 1) {
            return null; // mão empatada
        }
        
        return null;
    }
    
    endHand(winner) {
        let points = this.trucoValue;
        if (winner === 'player') {
            this.playerScore += points;
            this.updateStatus(`🎉 Você ganhou a mão! +${points} ponto(s). Placar: ${this.playerScore} x ${this.computerScore} 🎉`);
        } else if (winner === 'computer') {
            this.computerScore += points;
            this.updateStatus(`🤖 Computador ganhou a mão! +${points} ponto(s). Placar: ${this.playerScore} x ${this.computerScore} 🤖`);
        } else {
            this.updateStatus(`⚖️ Mão empatada! Ninguém pontua. ⚖️`);
        }
        
        this.updateScores();
        
        if (this.playerScore >= 12 || this.computerScore >= 12) {
            const finalWinner = this.playerScore >= 12 ? 'Jogador' : 'Computador';
            alert(`🏆 FIM DE JOGO! ${finalWinner} venceu a partida! 🏆`);
            this.resetGame();
        } else {
            setTimeout(() => this.resetHand(), 2000);
        }
    }
    
    resetHand() {
        // Reinicia a mão atual: novas cartas, nova vira, zera contadores
        this.createDeck();
        this.shuffleDeck();
        this.distributeCards();
        this.playerCard = null;
        this.computerCard = null;
        this.currentRound = 1;
        this.playerRoundWins = 0;
        this.computerRoundWins = 0;
        this.trucoRequested = false;
        this.trucoValue = 1;
        this.waitingTrucoResponse = false;
        this.gameActive = true;
        this.selectedCardIndex = null;
        this.firstRoundWinner = null;
        this.render();
        this.updateStatus('Nova mão! Selecione uma carta.');
    }
    
    resetGame() {
        this.playerScore = 0;
        this.computerScore = 0;
        this.resetHand();
        this.updateScores();
    }
    
    // ================== AÇÕES DO JOGADOR E COMPUTADOR ==================
    playerPlay(cardIndex) {
        if (!this.gameActive || this.waitingTrucoResponse) {
            this.updateStatus('Aguarde...');
            return;
        }
        if (this.playerCard !== null) {
            this.updateStatus('Você já jogou esta rodada!');
            return;
        }
        if (cardIndex >= this.playerHand.length) return;
        
        this.selectedCardIndex = cardIndex;
        this.playerCard = this.playerHand[cardIndex];
        this.playerHand.splice(cardIndex, 1);
        
        this.updateStatus(`Você jogou ${this.playerCard.rank}${this.playerCard.suit}`);
        this.render();
        
        // O computador joga em seguida
        setTimeout(() => this.computerPlay(), 800);
    }
    
    computerPlay() {
        if (!this.gameActive || this.waitingTrucoResponse) return;
        if (this.computerCard !== null) return;
        
        // Escolhe a melhor carta (maior valor)
        let bestIndex = 0;
        let bestValue = -1;
        for (let i = 0; i < this.computerHand.length; i++) {
            const val = this.getCardValue(this.computerHand[i]);
            if (val > bestValue) {
                bestValue = val;
                bestIndex = i;
            }
        }
        this.computerCard = this.computerHand[bestIndex];
        this.computerHand.splice(bestIndex, 1);
        
        this.updateStatus(`Computador jogou ${this.computerCard.rank}${this.computerCard.suit}`);
        this.render();
        
        setTimeout(() => {
            this.playRound(this.playerCard, this.computerCard);
        }, 800);
    }
    
    // ================== TRUCO ==================
    requestTruco() {
        if (!this.gameActive || this.waitingTrucoResponse) {
            this.updateStatus('Não é possível pedir truco agora.');
            return;
        }
        if (this.trucoRequested) {
            this.updateStatus('Truco já foi pedido nesta mão!');
            return;
        }
        if (this.currentRound > 1) {
            this.updateStatus('Só é possível pedir truco na primeira rodada!');
            return;
        }
        
        this.trucoRequested = true;
        this.waitingTrucoResponse = true;
        this.gameActive = false;
        
        this.updateStatus('Você pediu TRUCO! Aguardando resposta...');
        this.render();
        
        // Decisão do computador (aceita com 60% de chance)
        setTimeout(() => {
            const accept = Math.random() < 0.6;
            if (accept) this.acceptTruco();
            else this.rejectTruco();
        }, 1500);
    }
    
    acceptTruco() {
        if (this.trucoValue === 1) this.trucoValue = 3;
        else if (this.trucoValue === 3) this.trucoValue = 6;
        else if (this.trucoValue === 6) this.trucoValue = 9;
        else if (this.trucoValue === 9) this.trucoValue = 12;
        
        this.waitingTrucoResponse = false;
        this.gameActive = true;
        this.updateStatus(`✅ Truco aceito! Agora a mão vale ${this.trucoValue} pontos. ✅`);
        this.updateScores();
        this.render();
    }
    
    rejectTruco() {
        const points = this.trucoValue;
        // Quem pediu truco ganha os pontos atuais
        this.playerScore += points;
        this.updateStatus(`❌ Computador recusou o truco! Você ganha ${points} ponto(s). ❌`);
        this.updateScores();
        
        if (this.playerScore >= 12 || this.computerScore >= 12) {
            const finalWinner = this.playerScore >= 12 ? 'Jogador' : 'Computador';
            alert(`🏆 FIM DE JOGO! ${finalWinner} venceu a partida! 🏆`);
            this.resetGame();
        } else {
            setTimeout(() => this.resetHand(), 2000);
        }
    }
    
    // ================== INTERFACE E RENDERIZAÇÃO ==================
    updateStatus(message) {
        const statusDiv = document.getElementById('status-message');
        if (statusDiv) statusDiv.textContent = message;
    }
    
    updateScores() {
        document.getElementById('player-score').textContent = this.playerScore;
        document.getElementById('computer-score').textContent = this.computerScore;
        document.getElementById('round-number').textContent = this.currentRound;
        document.getElementById('round-points').textContent = this.trucoValue;
    }
    
    getCardDisplay(card, isFaceDown = false, showManilhaStar = false) {
        if (isFaceDown) {
            return `<div class="card card-back">
                        <div class="card-suit">?</div>
                        <div class="card-rank">?</div>
                    </div>`;
        }
        const suitClass = (card.suit === '♥' || card.suit === '♦') ? 'hearts' : 'spades';
        const star = showManilhaStar ? ' ⭐' : '';
        return `<div class="card ${suitClass}">
                    <div class="card-rank">${card.rank}${star}</div>
                    <div class="card-suit">${card.suit}</div>
                </div>`;
    }
    
    render() {
        // Mão do jogador
        const playerDiv = document.getElementById('player-cards');
        playerDiv.innerHTML = '';
        this.playerHand.forEach((card, idx) => {
            const isManilha = this.manilhas.some(m => m.rank === card.rank && m.suit === card.suit);
            const cardHTML = this.getCardDisplay(card, false, isManilha);
            const cardElement = document.createElement('div');
            cardElement.innerHTML = cardHTML;
            const cardNode = cardElement.firstChild;
            cardNode.addEventListener('click', () => {
                if (this.playerCard === null && this.gameActive && !this.waitingTrucoResponse) {
                    // Remove seleção anterior
                    document.querySelectorAll('#player-cards .card').forEach(c => c.classList.remove('selected'));
                    cardNode.classList.add('selected');
                    this.selectedCardIndex = idx;
                    this.updateStatus(`Carta ${card.rank}${card.suit} selecionada. Clique em Jogar.`);
                }
            });
            if (this.playerCard !== null || !this.gameActive || this.waitingTrucoResponse) {
                cardNode.style.opacity = '0.5';
                cardNode.style.cursor = 'not-allowed';
            }
            playerDiv.appendChild(cardNode);
        });
        
        // Mão do computador (face para baixo)
        const computerDiv = document.getElementById('computer-cards');
        computerDiv.innerHTML = '';
        for (let i = 0; i < this.computerHand.length; i++) {
            const cardBack = this.getCardDisplay(null, true);
            const div = document.createElement('div');
            div.innerHTML = cardBack;
            computerDiv.appendChild(div.firstChild);
        }
        
        // Vira
        const viraDiv = document.getElementById('vira-card');
        if (viraDiv && this.vira) {
            viraDiv.innerHTML = this.getCardDisplay(this.vira, false);
        }
        
        // Cartas na mesa
        const playerTableDiv = document.getElementById('player-table-card');
        const computerTableDiv = document.getElementById('computer-table-card');
        if (this.playerCard) {
            const isManilha = this.manilhas.some(m => m.rank === this.playerCard.rank && m.suit === this.playerCard.suit);
            playerTableDiv.innerHTML = this.getCardDisplay(this.playerCard, false, isManilha);
        } else {
            playerTableDiv.innerHTML = '<div class="card" style="opacity:0.3; display:flex; align-items:center; justify-content:center;">?</div>';
        }
        if (this.computerCard) {
            const isManilha = this.manilhas.some(m => m.rank === this.computerCard.rank && m.suit === this.computerCard.suit);
            computerTableDiv.innerHTML = this.getCardDisplay(this.computerCard, false, isManilha);
        } else {
            computerTableDiv.innerHTML = '<div class="card" style="opacity:0.3; display:flex; align-items:center; justify-content:center;">?</div>';
        }
        
        // Botões
        const playBtn = document.getElementById('play-hand');
        const trucoBtn = document.getElementById('truco-btn');
        const acceptBtn = document.getElementById('accept-truco');
        const rejectBtn = document.getElementById('reject-truco');
        
        if (this.waitingTrucoResponse) {
            playBtn.disabled = true;
            trucoBtn.disabled = true;
            acceptBtn.classList.remove('hidden');
            rejectBtn.classList.remove('hidden');
        } else {
            playBtn.disabled = (this.playerCard !== null || !this.gameActive || this.selectedCardIndex === null);
            trucoBtn.disabled = (this.trucoRequested || !this.gameActive || this.playerCard !== null || this.currentRound > 1);
            acceptBtn.classList.add('hidden');
            rejectBtn.classList.add('hidden');
        }
    }
    
    setupEventListeners() {
        document.getElementById('play-hand').addEventListener('click', () => {
            if (this.selectedCardIndex !== null && this.playerCard === null) {
                this.playerPlay(this.selectedCardIndex);
            } else if (this.selectedCardIndex === null) {
                this.updateStatus('Selecione uma carta primeiro!');
            }
        });
        document.getElementById('truco-btn').addEventListener('click', () => this.requestTruco());
        document.getElementById('accept-truco').addEventListener('click', () => this.acceptTruco());
        document.getElementById('reject-truco').addEventListener('click', () => this.rejectTruco());
        document.getElementById('new-game').addEventListener('click', () => this.resetGame());
    }
}

// Inicializa o jogo
window.addEventListener('DOMContentLoaded', () => {
    window.game = new TrucoGame();
});
