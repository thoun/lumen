const isDebug = window.location.host == 'studio.boardgamearena.com' || window.location.hash.indexOf('debug') > -1;
const log = isDebug ? console.log.bind(window.console) : function () { };

const CIRCLE_WIDTH = 49.7;
const CIRCLES = [];

[1, 2, 3].forEach(index => CIRCLES[index] = [0, 145 + CIRCLE_WIDTH * (index == 3 ? 3 : index - 1)]);
[4, 5, 6, 7, 8].forEach(index => CIRCLES[index] = [42, 120 + CIRCLE_WIDTH * (index - 4)]);
[9, 10, 11, 12, 13, 14].forEach(index => CIRCLES[index] = [86, 45 + CIRCLE_WIDTH * (index - 9)]);
CIRCLES[15] = [111, 0];
[16, 17, 18].forEach(index => CIRCLES[index] = [136, 45 + CIRCLE_WIDTH * (index - 16)]);
[19, 20].forEach(index => CIRCLES[index] = [180, 70 + CIRCLE_WIDTH * (index - 19)]);

class PlayerTable {
    public playerId: number;

    private reserve: SlotStock<Card>;
    private highCommand: SlotStock<Card>;

    private currentPlayer: boolean;

    constructor(private game: LumenGame, player: LumenPlayer, firstPlayerOperation: number) {
        this.playerId = Number(player.id);
        this.currentPlayer = this.playerId == this.game.getPlayerId();

        let html = `
        <div id="player-table-${this.playerId}" class="player-table">
            <div class="background" data-color="${player.color}"></div>
            <div id="player-table-${this.playerId}-hand-cards" class="hand cards" data-player-id="${this.playerId}" data-current-player="${this.currentPlayer.toString()}" data-my-hand="${this.currentPlayer.toString()}"></div>
            <div class="name-wrapper">
                <span class="name" style="color: #${player.color};">${player.name}</span>
            </div>
            <div id="player-table-${this.playerId}-checks" class="checks">`;
        for (let i=1; i<=7; i++) {
            html += `<div id="player-table-${this.playerId}-check${i}" class="check" data-number="${i}">${player.checks >= i ? `<img src="${g_gamethemeurl}img/mul.gif"/>` : ''}</div>`;
        }
        html += `    
            </div>
            <div id="player-table-${this.playerId}-operations" class="operations">
                <div id="player-table-${this.playerId}-first-player-token" class="first-player-token" data-operation="${firstPlayerOperation}" data-visible="${(firstPlayerOperation > 0).toString()}"></div>
            </div>
            <div id="player-table-${this.playerId}-circles" class="circles">
            </div>
            <div id="player-table-${this.playerId}-reserve" class="reserve">
            </div>
            <div id="player-table-${this.playerId}-highCommand" class="highCommand">
            </div>
        </div>
        `;
        dojo.place(html, document.getElementById('tables'));

        [1, 2, 3, 4, 5].forEach(operation => {
            (operation > 3 ? [1, 2, 3, 4] : [1, 2, 3]).forEach(number => {
                const div = document.createElement('div');
                div.id = `player-table-${this.playerId}-operation${operation}-number${number}`;
                div.classList.add('operation-number');
                div.dataset.operation = ''+operation;
                div.dataset.number = ''+number;
                div.innerHTML = `${player.operations[operation] >= number ? `<img src="${g_gamethemeurl}img/mul.gif"/>` : ''}`;
                div.addEventListener('click', () => this.game.operationClick(operation));
                document.getElementById(`player-table-${this.playerId}-operations`).appendChild(div);
            });
        })

        player.circles.forEach(circle => {
            const div = document.createElement('div');
            div.id = `player-table-${this.playerId}-circle${circle.circleId}`;
            div.dataset.circle = `${circle.circleId}`;
            div.classList.add('circle');
            div.innerHTML = `${circle.value ?? ''}`;
            document.getElementById(`player-table-${this.playerId}-circles`).appendChild(div);
            div.addEventListener('click', () => this.game.cellClick(circle.circleId));
        });

        player.links.forEach(link => this.setLink(Number(link.index1), Number(link.index2)));

        this.reserve = new SlotStock<Card>(this.game.cardsManager, document.getElementById(`player-table-${this.playerId}-reserve`), {
            slotsIds: [1, 2, 3],
            mapCardToSlot: card => card.locationArg
        });
        this.reserve.onCardClick = card => this.cardClick(card);
        this.reserve.addCards(player.reserve);

        this.highCommand = new SlotStock<Card>(this.game.cardsManager, document.getElementById(`player-table-${this.playerId}-highCommand`), {
            slotsIds: [1, 2, 3, 4, 5],
            mapCardToSlot: card => card.locationArg
        });
        this.highCommand.onCardClick = card => this.cardClick(card);
        this.highCommand.addCards(player.highCommand);

    }

    private cardClick(card: Card) {
        if (card.type < 20) {
            this.game.playFighter(card.id);
        } else if (card.type < 30) {
            this.game.activateFighter(card.id);
        }
    }

    public setPossibleOperations(operations: { [operation: number]: { currentNumber: number; value: number; possible: boolean; }; }) {
        Object.keys(operations).forEach(key => {
            const operation = operations[key];
            if (operation.possible) {
                const operationNumberDiv = document.getElementById(`player-table-${this.playerId}-operation${key}-number${operation.currentNumber + 1}`);
                operationNumberDiv.classList.add('ghost');
                operationNumberDiv.innerHTML = `<img src="${g_gamethemeurl}img/mul.gif"/>`;
            }
        })
    }
    
    public setPlayedOperation(type: number, number: number, firstPlayer: boolean) {
        const circleDiv = document.getElementById(`player-table-${this.playerId}-operation${type}-number${number}`);
        circleDiv.classList.remove('ghost');
        circleDiv.innerHTML = `<img src="${g_gamethemeurl}img/mul.gif"/>`;

        if (firstPlayer) {
            const fpDiv = document.getElementById(`player-table-${this.playerId}-first-player-token`);
            fpDiv.dataset.operation = ''+type;
            fpDiv.dataset.visible = 'true';
        }
    }
    
    public removeFirstPlayerToken() {
        const fpDiv = document.getElementById(`player-table-${this.playerId}-first-player-token`);
        fpDiv.dataset.visible = 'false';
    }
    
    setCancelledOperation(type: number, number: number) {
        const circleDiv = document.getElementById(`player-table-${this.playerId}-operation${type}-number${number+1}`);
        circleDiv.innerHTML = '';
    }

    public setPossibleCells(possibleCircles: number[], value: number) {
        possibleCircles.forEach(circleId => {
            const circleDiv = document.getElementById(`player-table-${this.playerId}-circle${circleId}`);
            circleDiv.classList.add('ghost');
            circleDiv.innerHTML = ''+value;
        });
    }
    
    public setCircleValue(circleId: number, value: number) {
        const circleDiv = document.getElementById(`player-table-${this.playerId}-circle${circleId}`);
        circleDiv.classList.remove('ghost');
        circleDiv.innerHTML = value === -1 ? 'X' /* TODO Brouillage*/ : ''+value;
    }

    public setPossibleCellLinks(possibleLinkCirclesIds: number[], cellId: number) {
        // TODO throw new Error("Method not implemented.");
    }

    public addCheck(checks: number) {
        const div = document.getElementById(`player-table-${this.playerId}-check${checks}`);
        div.innerHTML = `<img src="${g_gamethemeurl}img/mul.gif"/>`;
    }
    
    public refillReserve(fighter: Card, slot: number) {
        this.reserve.addCard(fighter, {
            fromElement: document.getElementById(`bag-${this.playerId}`)
        }, {
            slot
        });
    }

    public addHighCommandCard(card: Card) {
        this.highCommand.addCard(card, {
            fromElement: document.getElementById(`bag-0`)
        });
    }
    
    public setZone(circlesIds: number[], zoneId: number) {
        circlesIds.forEach(circleId => document.getElementById(`player-table-${this.playerId}-circle${circleId}`).dataset.zone = ''+zoneId);
    }
    
    public setLink(index1: number, index2: number) {
        const circle1 = CIRCLES[index1];
        const circle2 = CIRCLES[index2];

        const angle = Math.atan2(circle2[0] - circle1[0], circle2[1] - circle1[1]) * 180 / Math.PI - 90;
	    const left = circle1[1] + CIRCLE_WIDTH/2 - 5;
        const top = circle1[0] + CIRCLE_WIDTH/2 + 3;
        const html = `<div id="link_${this.playerId}_${index1}_${index2}" class="link chiffres" style="left:${left}px; top:${top}px; transform: rotate(${angle}deg);">
            <img src="${g_gamethemeurl}img/num1.gif" />
        </div>`;
        dojo.place(html, `player-table-${this.playerId}-circles`);
        console.log(html);
    }
    
    public setSelectableCards(selectableCards: Card[]) {
        [this.reserve, this.highCommand].forEach(stock => {
            stock.setSelectionMode(selectableCards.length ? 'single' : 'none');
            stock.getCards().forEach(card => stock.getCardElement(card).classList.toggle('selectable', selectableCards.some(c => c.id == card.id)));
        });
    }
}