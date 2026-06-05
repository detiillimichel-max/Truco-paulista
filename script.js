class TrucoGame {
    constructor() {
        this.deck = [];
        this.playerHand = [];
        this.computerHand = [];
        this.vira = null;
        this.manilhas = [];
        this.playerCard = null;
        this.computerCard = null;
        this.playerScore = 0;
        this.computerScore = 0;
        this.currentRound = 1;
        this.playerRoundWins = 0;
        this.computerRoundWins = 0;
        this.trucoRequested = false;
        this.trucoValue = 1;
        this.waitingTrucoResponse = false;
        this.gameActive = true;
        this.selectedCardIndex = null;

        this.rankOrder = ['4','5','6','7','Q','J','K','A','2','3'];
        this.suits = ['♥','♦','♠','♣'];

        this.init();
        this.setupEventListeners();
    }

    init() {
        this.createDeck();
        this.shuffleDeck();
        this.distributeCards();
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
        this.playerHand = this.deck.splice(0, 3);
        this.computerHand = this.deck.splice(0, 3);
        this.vira = this.deck.shift();
        this.sortHand(this.playerHand);
        this.sortHand(this.computerHand);
        this.calculateManilhas();
    }

    sortHand(hand) {
        hand.sort((a, b) => this.getCardValue(b) - this.getCardValue(a));
    }

    calculateManilhas() {
        const viraIndex = this.rankOrder.indexOf(this.vira.rank);
        const manilhaRank = this.rankOrder[(viraIndex + 1) % this.rankOrder.length];
        this.manilhas = this.suits.map(suit => ({ rank: manilhaRank, suit }));
    }

    getCardValue(card) {
        const isManilha = this.manilhas.some(m => m.rank === card.rank);
        if (isManilha) {
            const suitOrder = { '♣':4, '♥':3, '♠':2, '♦':1 };
            return 100 + suitOrder[card.suit];
        }
        return this.rankOrder.indexOf(card.rank);
    }

    compareCards(a, b) {
        const va = this.getCardValue(a);
        const vb = this.getCardValue(b);
        if (va > vb) return 'player';
        if (vb > va) return 'computer';
        return 'draw';
    }

    playRound(playerCard, computerCard) {
        const result = this.compareCards(playerCard, computerCard);
        const pStr = `${playerCard.rank}${playerCard.suit}`;
        const cStr = `${computerCard.rank}${computerCard.suit}`;

        if (result === 'player') {
            this.playerRoundWins++;
            this.updateStatus(`✅ Você venceu a rodada ${this.currentRound}! (${pStr} > ${cStr})`);
        } else if (result === 'computer') {
            this.computerRoundWins++;
            this.updateStatus(`❌ Computador venceu a rodada ${this.currentRound}! (${cStr} > ${pStr})`);
        } else {
            this.updateStatus(`⚖️ Empate na rodada ${this.currentRound}! (${pStr} = ${cStr})`);
        }

        this.render();
        const winner = this.checkHandWinner();
        if (winner!== null) {
            setTimeout(() => this.endHand(winner), 1500);
            return;
        }

        this.currentRound++;
        this.playerCard = null;
        this.computerCard = null;
        this.selectedCardIndex = null;
        this.render();
        this.updateStatus(`Rodada ${this.currentRound}! Selecione sua carta.`);
    }

    checkHandWinner() {
        if (this.playerRoundWins === 2) return 'player';
        if (this.computerRoundWins === 2) return 'computer';

        if (this.currentRound === 2) {
            if (this.playerRoundWins === 1 && this.computerRoundWins === 0) return 'player';
            if (this.computerRoundWins === 1 && this.playerRoundWins === 0) return 'computer';
        }

        if (this.currentRound === 3) {
            if (this.playerRoundWins > this.computerRoundWins) return 'player';
            if (this.computerRoundWins > this.playerRoundWins) return 'computer';
            return 'draw';
        }
        return null;
    }

    endHand(winner) {
        if (winner === 'draw') {
            this.updateStatus(`⚖️ Mão empatada! Ninguém pontua.`);
        } else {
            const points = this.trucoValue;
            if (winner === 'player') {
                this.playerScore += points;
                this.updateStatus(`🎉 Você ganhou a mão! +${points} ponto(s).`);
            } else {
                this.computerScore += points;
                this.updateStatus(`🤖 Computador ganhou a mão! +${points} ponto(s).`);
            }
        }
        this.updateScores();

        if (this.playerScore >= 12 || this.computerScore >= 12) {
            const finalWinner = this.playerScore >= 12? 'Jogador' : 'Computador';
            setTimeout(() => alert(`🏆 FIM DE JOGO! ${finalWinner} venceu! 🏆`), 500);
            setTimeout(() => this.resetGame(), 1000);
        } else {
            setTimeout(() => this.resetHand(), 2000);
        }
    }

    resetHand() {
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
        this.render();
        this.updateStatus('Nova mão! Selecione uma carta.');
    }

    resetGame() {
        this.playerScore = 0;
        this.computerScore = 0;
        this.resetHand();
        this.updateScores();
    }

    playerPlay(cardIndex) {
        if (!this.gameActive || this.waitingTrucoResponse || this.playerCard!== null) return;
        this.selectedCardIndex = cardIndex;
        this.playerCard = this.playerHand[cardIndex];
        this.playerHand.splice(cardIndex, 1);
        this.updateStatus(`Você jogou ${this.playerCard.rank}${this.playerCard.suit}`);
        this.render();
        setTimeout(() => this.computerPlay(), 800);
    }

    computerPlay() {
        if (!this.gameActive || this.waitingTrucoResponse || this.computerCard!== null) return;
        let bestIdx = 0, bestVal = -1;
        for (let i = 0; i < this.computerHand.length; i++) {
            const v = this.getCardValue(this.computerHand[i]);
            if (v > bestVal) { bestVal = v; bestIdx = i; }
        }
        this.computerCard = this.computerHand[bestIdx];
        this.computerHand.splice(bestIdx, 1);
        this.updateStatus(`Computador jogou ${this.computerCard.rank}${this.computerCard.suit}`);
        this.render();
        setTimeout(() => this.playRound(this.playerCard, this.computerCard), 800);
    }

    requestTruco() {
        if (!this.gameActive || this.waitingTrucoResponse || this.trucoRequested || this.currentRound > 1) return;
        this.trucoRequested = true;
        this.waitingTrucoResponse = true;
        this.gameActive = false;
        this.updateStatus('Você pediu TRUCO! Aguardando resposta...');
        this.render();
        setTimeout(() => {
            Math.random() < 0.6? this.acceptTruco() : this.rejectTruco();
        }, 1500);
    }

    acceptTruco() {
        this.trucoValue = this.trucoValue === 1? 3 : this.trucoValue === 3? 6 : this.trucoValue === 6? 9 : 12;
        this.waitingTrucoResponse = false;
        this.gameActive = true;
        this.updateStatus(`✅ Truco aceito! Mão vale ${this.trucoValue} pontos.`);
        this.updateScores();
        this.render();
    }

    rejectTruco() {
        this.playerScore += this.trucoValue;
        this.updateStatus(`❌ Computador correu! Você ganha ${this.trucoValue} ponto(s).`);
        this.updateScores();
        setTimeout(() => this.resetHand(), 2000);
    }

    updateStatus(msg) {
        document.getElementById('status-message').textContent = msg;
    }

    updateScores() {
        document.getElementById('player-score').textContent = this.playerScore;
        document.getElementById('computer-score').textContent = this.computerScore;
        document.getElementById('round-number').textContent = this.currentRound;
        document.getElementById('round-points').textContent = this.trucoValue;
    }

    getCardDisplay(card, faceDown = false, isManilha = false) {
        if (faceDown) {
            return `<div class="card card-back"><div class="card-suit">?</div><div class="card-rank">?</div></div>`;
        }
        const suitClass = (card.suit === '♥' || card.suit === '♦')? 'hearts' : 'spades';
        const star = isManilha? ' ⭐' : '';
        return `<div class="card ${suitClass}"><div class="card-rank">${card.rank}${star}</div><div class="card-suit">${card.suit}</div></div>`;
    }

    render() {
        const playerDiv = document.getElementById('player-cards');
        playerDiv.innerHTML = '';
        this.playerHand.forEach((card, idx) => {
            const isManilha = this.manilhas.some(m => m.rank === card.rank);
            const html = this.getCardDisplay(card, false, isManilha);
            const wrap = document.createElement('div');
            wrap.innerHTML = html;
            const node = wrap.firstChild;
            if (idx === this.selectedCardIndex) node.classList.add('selected');
            node.addEventListener('click', () => {
                if (this.playerCard === null && this.gameActive &&!this.waitingTrucoResponse) {
                    document.querySelectorAll('#player-cards.card').forEach(c => c.classList.remove('selected'));
                    node.classList.add('selected');
                    this.selectedCardIndex = idx;
                    document.getElementById('play-hand').disabled = false;
                    this.updateStatus(`Carta ${card.rank}${card.suit} selecionada. Clique em Jogar.`);
                }
            });
            if (this.playerCard!== null ||!this.gameActive || this.waitingTrucoResponse) {
                node.style.opacity = '0.5';
                node.style.cursor = 'not-allowed';
            }
            playerDiv.appendChild(node);
        });

        const compDiv = document.getElementById('computer-cards');
        compDiv.innerHTML = '';
        for (let i = 0; i < this.computerHand.length; i++) {
            const div = document.createElement('div');
            div.innerHTML = this.getCardDisplay(null, true);
            compDiv.appendChild(div.firstChild);
        }

        document.getElementById('vira-card').innerHTML = this.getCardDisplay(this.vira);

        const pTable = document.getElementById('player-table-card');
        const cTable = document.getElementById('computer-table-card');
        pTable.innerHTML = this.playerCard? this.getCardDisplay(this.playerCard, false, this.manilhas.some(m => m.rank === this.playerCard.rank)) : '<div class="card" style="opacity:0.3;display:flex;align-items:center;justify-content:center;">?</div>';
        cTable.innerHTML = this.computerCard? this.getCardDisplay(this.computerCard, false, this.manilhas.some(m => m.rank === this.computerCard.rank)) : '<div class="card" style="opacity:0.3;display:flex;align-items:center;justify-content:center;">?</div>';

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
            playBtn.disabled = (this.playerCard!== null ||!this.gameActive || this.selectedCardIndex === null);
            trucoBtn.disabled = (this.trucoRequested ||!this.gameActive || this.playerCard!== null || this.currentRound > 1);
            acceptBtn.classList.add('hidden');
            rejectBtn.classList.add('hidden');
        }
    }

    setupEventListeners() {
        document.getElementById('play-hand').addEventListener('click', () => {
            if (this.selectedCardIndex!== null && this.playerCard === null) {
                this.playerPlay(this.selectedCardIndex);
            }
        });
        document.getElementById('truco-btn').addEventListener('click', () => this.requestTruco());
        document.getElementById('accept-truco').addEventListener('click', () => this.acceptTruco());
        document.getElementById('reject-truco').addEventListener('click', () => this.rejectTruco());
        document.getElementById('new-game').addEventListener('click', () => this.resetGame());
    }
}

window.addEventListener('DOMContentLoaded', () => {
    window.game = new TrucoGame();
});
