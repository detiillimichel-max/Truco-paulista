class TrucoGame {
    constructor() {
        this.deck = [];
        this.playerHand = [];
        this.computerHand = [];
        this.playerCard = null;
        this.computerCard = null;
        this.playerScore = 0;
        this.computerScore = 0;
        this.currentRound = 1;
        this.playerWins = 0;
        this.computerWins = 0;
        this.trucoRequested = false;
        this.trucoValue = 1;
        this.gameActive = true;
        this.waitingForTrucoResponse = false;
        this.selectedCardIndex = null;
        
        this.cardValues = {
            '4': 1, '5': 2, '6': 3, '7': 4, 'Q': 5, 'J': 6, 'K': 7,
            'A': 8, '2': 9, '3': 10
        };
        
        this.suits = ['♥', '♦', '♠', '♣'];
        this.ranks = ['4', '5', '6', '7', 'Q', 'J', 'K', 'A', '2', '3'];
        
        this.init();
        this.setupEventListeners();
    }
    
    init() {
        this.createDeck();
        this.shuffleDeck();
        this.dealCards();
        this.render();
        this.updateStatus('Sua vez! Escolha uma carta para jogar');
    }
    
    createDeck() {
        this.deck = [];
        for (let suit of this.suits) {
            for (let rank of this.ranks) {
                this.deck.push({ rank, suit, value: this.cardValues[rank] });
            }
        }
    }
    
    shuffleDeck() {
        for (let i = this.deck.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.deck[i], this.deck[j]] = [this.deck[j], this.deck[i]];
        }
    }
    
    dealCards() {
        this.playerHand = this.deck.splice(0, 3);
        this.computerHand = this.deck.splice(0, 3);
        this.sortHand(this.playerHand);
        this.sortHand(this.computerHand);
    }
    
    sortHand(hand) {
        hand.sort((a, b) => b.value - a.value);
    }
    
    getCardDisplay(card, isFaceDown = false) {
        if (isFaceDown) {
            return `<div class="card card-back">
                        <div class="card-suit">?</div>
                        <div class="card-rank">?</div>
                    </div>`;
        }
        
        const suitClass = (card.suit === '♥' || card.suit === '♦') ? 'hearts' : 'spades';
        return `<div class="card ${suitClass}">
                    <div class="card-rank">${card.rank}</div>
                    <div class="card-suit">${card.suit}</div>
                </div>`;
    }
    
    compareCards(card1, card2) {
        if (card1.value > card2.value) return 'player';
        if (card2.value > card1.value) return 'computer';
        return 'draw';
    }
    
    playRound(playerCard, computerCard) {
        const result = this.compareCards(playerCard, computerCard);
        
        if (result === 'player') {
            this.playerWins++;
            this.updateStatus(`Você venceu a rodada! ${playerCard.rank}${playerCard.suit} > ${computerCard.rank}${computerCard.suit}`);
        } else if (result === 'computer') {
            this.computerWins++;
            this.updateStatus(`Computador venceu a rodada! ${computerCard.rank}${computerCard.suit} > ${playerCard.rank}${playerCard.suit}`);
        } else {
            this.updateStatus(`Empate! Ambos jogaram ${playerCard.rank}${playerCard.suit}`);
        }
        
        if (this.playerWins === 2 || this.computerWins === 2 || 
            (this.playerWins === 1 && this.computerWins === 1 && this.currentRound === 3)) {
            this.endHand();
        } else {
            this.currentRound++;
            this.playerCard = null;
            this.computerCard = null;
            this.render();
            if (this.gameActive && !this.waitingForTrucoResponse) {
                setTimeout(() => this.computerPlay(), 500);
            }
        }
    }
    
    endHand() {
        let winner = null;
        let points = this.trucoValue;
        
        if (this.playerWins > this.computerWins) {
            winner = 'player';
            this.playerScore += points;
            this.updateStatus(`🎉 Você ganhou a mão! +${points} ponto(s)! 🎉`);
        } else if (this.computerWins > this.playerWins) {
            winner = 'computer';
            this.computerScore += points;
            this.updateStatus(`🤖 Computador ganhou a mão! +${points} ponto(s)! 🤖`);
        } else {
            this.updateStatus(`⚖️ Empate na mão! ⚖️`);
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
        this.createDeck();
        this.shuffleDeck();
        this.dealCards();
        this.playerCard = null;
        this.computerCard = null;
        this.currentRound = 1;
        this.playerWins = 0;
        this.computerWins = 0;
        this.trucoRequested = false;
        this.trucoValue = 1;
        this.waitingForTrucoResponse = false;
        this.selectedCardIndex = null;
        this.gameActive = true;
        this.render();
        this.updateStatus('Nova mão! Escolha uma carta');
    }
    
    resetGame() {
        this.playerScore = 0;
        this.computerScore = 0;
        this.resetHand();
        this.updateScores();
    }
    
    playerPlay(cardIndex) {
        if (!this.gameActive || this.waitingForTrucoResponse) return;
        if (this.playerCard !== null) {
            this.updateStatus('Você já jogou esta rodada!');
            return;
        }
        
        this.selectedCardIndex = cardIndex;
        this.playerCard = this.playerHand[cardIndex];
        this.updateStatus(`Você jogou ${this.playerCard.rank}${this.playerCard.suit}`);
        this.render();
        
        setTimeout(() => this.computerPlay(), 500);
    }
    
    computerPlay() {
        if (!this.gameActive || this.waitingForTrucoResponse) return;
        if (this.computerCard !== null) return;
        
        // Lógica simples do computador: joga a carta mais forte
        const sortedHand = [...this.computerHand].sort((a, b) => b.value - a.value);
        this.computerCard = sortedHand[0];
        const cardIndex = this.computerHand.findIndex(c => c === this.computerCard);
        this.computerHand.splice(cardIndex, 1);
        
        this.updateStatus(`Computador jogou ${this.computerCard.rank}${this.computerCard.suit}`);
        this.render();
        
        setTimeout(() => {
            this.playRound(this.playerCard, this.computerCard);
            this.playerCard = null;
            this.computerCard = null;
            this.render();
        }, 1000);
    }
    
    requestTruco() {
        if (!this.gameActive || this.waitingForTrucoResponse) return;
        if (this.trucoRequested) {
            this.updateStatus('Truco já foi pedido nesta mão!');
            return;
        }
        
        this.trucoRequested = true;
        this.waitingForTrucoResponse = true;
        this.gameActive = false;
        
        // Decisão do computador (70% de chance de aceitar se estiver ganhando)
        const computerWinning = this.computerWins > this.playerWins;
        const willAccept = computerWinning ? Math.random() > 0.3 : Math.random() > 0.5;
        
        setTimeout(() => {
            if (willAccept) {
                this.acceptTruco();
            } else {
                this.rejectTruco();
            }
        }, 1000);
        
        this.updateStatus('Você pediu TRUCO! Aguardando resposta...');
        this.render();
    }
    
    acceptTruco() {
        this.trucoValue = this.trucoValue === 1 ? 3 : (this.trucoValue === 3 ? 6 : (this.trucoValue === 6 ? 9 : 12));
        this.waitingForTrucoResponse = false;
        this.gameActive = true;
        this.updateStatus(`TRUCO ACEITO! Agora a mão vale ${this.trucoValue} pontos!`);
        this.render();
    }
    
    rejectTruco() {
        const points = this.trucoValue;
        if (this.trucoRequested) {
            this.playerScore += points;
            this.updateStatus(`Computador recusou o truco! Você ganha ${points} ponto(s)!`);
        } else {
            this.computerScore += points;
            this.updateStatus(`Você recusou o truco! Computador ganha ${points} ponto(s)!`);
        }
        this.updateScores();
        setTimeout(() => this.resetHand(), 2000);
    }
    
    updateStatus(message) {
        const statusDiv = document.getElementById('status-message');
        if (statusDiv) {
            statusDiv.textContent = message;
        }
    }
    
    updateScores() {
        document.getElementById('player-score').textContent = this.playerScore;
        document.getElementById('computer-score').textContent = this.computerScore;
        document.getElementById('round-number').textContent = this.currentRound;
        document.getElementById('round-points').textContent = this.trucoValue;
    }
    
    render() {
        // Renderizar mão do jogador
        const playerCardsDiv = document.getElementById('player-cards');
        playerCardsDiv.innerHTML = '';
        this.playerHand.forEach((card, index) => {
            const cardDiv = document.createElement('div');
            cardDiv.innerHTML = this.getCardDisplay(card, false);
            cardDiv.firstChild.addEventListener('click', () => this.playerPlay(index));
            if (this.playerCard !== null || !this.gameActive || this.waitingForTrucoResponse) {
                cardDiv.firstChild.classList.add('disabled');
            }
            if (this.selectedCardIndex === index) {
                cardDiv.firstChild.classList.add('selected');
            }
            playerCardsDiv.appendChild(cardDiv.firstChild);
        });
        
        // Renderizar mão do computador (face para baixo)
        const computerCardsDiv = document.getElementById('computer-cards');
        computerCardsDiv.innerHTML = '';
        this.computerHand.forEach(() => {
            const cardDiv = document.createElement('div');
            cardDiv.innerHTML = this.getCardDisplay(null, true);
            computerCardsDiv.appendChild(cardDiv.firstChild);
        });
        
        // Renderizar cartas na mesa
        const playerTableDiv = document.getElementById('player-table-card');
        const computerTableDiv = document.getElementById('computer-table-card');
        
        if (this.playerCard) {
            playerTableDiv.innerHTML = this.getCardDisplay(this.playerCard, false);
        } else {
            playerTableDiv.innerHTML = '<div class="card" style="opacity:0.3">?</div>';
        }
        
        if (this.computerCard) {
            computerTableDiv.innerHTML = this.getCardDisplay(this.computerCard, false);
        } else {
            computerTableDiv.innerHTML = '<div class="card" style="opacity:0.3">?</div>';
        }
        
        // Atualizar botões
        const playBtn = document.getElementById('play-hand');
        const trucoBtn = document.getElementById('truco-btn');
        const acceptBtn = document.getElementById('accept-truco');
        const rejectBtn = document.getElementById('reject-truco');
        
        if (this.waitingForTrucoResponse) {
            playBtn.disabled = true;
            trucoBtn.disabled = true;
            acceptBtn.classList.remove('hidden');
            rejectBtn.classList.remove('hidden');
        } else {
            playBtn.disabled = this.playerCard !== null || !this.gameActive;
            trucoBtn.disabled = this.trucoRequested || !this.gameActive || this.playerCard !== null;
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

// Inicializar o jogo
const game = new TrucoGame();
