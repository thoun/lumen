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

class CompressedLineStock<T> extends ManualPositionStock<T> {

    constructor(
        protected manager: CardManager<T>, 
        protected element: HTMLElement, 
        protected cardWidth: number
    ) {
        super(manager, element, (element: HTMLElement, cards: T[]) => this.manualPosition(element, cards));
    }

    private manualPosition(element: HTMLElement, cards: T[]) {
        const halfClientWidth = element.clientWidth / 2;
        const MARGIN = 8;
        const CARD_WIDTH = 100;
        let cardDistance = CARD_WIDTH + MARGIN;
        const containerWidth = element.clientWidth;
        const uncompressedWidth = (cards.length * CARD_WIDTH) + ((cards.length - 1) * MARGIN);
        if (uncompressedWidth > containerWidth) {
            cardDistance = Math.floor(CARD_WIDTH * containerWidth / ((cards.length + 2) * CARD_WIDTH));
        }

        cards.forEach((card, index) => {
            const cardDiv = this.getCardElement(card);
            const cardLeft = halfClientWidth + cardDistance * (index - (cards.length - 1) / 2);

            cardDiv.style.left = `${ cardLeft - CARD_WIDTH / 2 }px`;
        });
    }
}

class PlayerTable {
    public playerId: number;

    private reserve: SlotStock<Card>;
    private highCommand: SlotStock<Card>;
    private objectiveTokens: CompressedLineStock<ObjectiveToken>;
    private discoverTiles: CompressedLineStock<DiscoverTile>;

    private currentPlayer: boolean;

    constructor(private game: LumenGame, player: LumenPlayer, firstPlayerOperation: number) {
        this.playerId = Number(player.id);
        this.currentPlayer = this.playerId == this.game.getPlayerId();

        let html = `
        <div id="player-table-${this.playerId}" class="player-table">
            <div class="background" data-color="${player.color}"></div>
            <div id="player-table-${this.playerId}-hand-cards" class="hand cards" data-player-id="${this.playerId}" data-current-player="${this.currentPlayer.toString()}" data-my-hand="${this.currentPlayer.toString()}"></div>
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
            <div class="name-and-tiles">
                <div class="name-wrapper">
                    <span class="name" style="color: #${player.color};">${player.name}</span>
                </div>
                <div id="player-table-${this.playerId}-objective-tokens" class="objective-tokens"></div>
                <div id="player-table-${this.playerId}-discover-tiles" class="discover-tiles"></div>
            </div>
            <div id="player-table-${this.playerId}-zone-legend" class="zone legend"></div>
            <div id="player-table-${this.playerId}-link-legend" class="link legend"></div>
            <div id="player-table-${this.playerId}-check-legend" class="check-legend"></div>
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
                if (this.currentPlayer) {
                    div.addEventListener('click', () => this.game.operationClick(operation));
                }
                document.getElementById(`player-table-${this.playerId}-operations`).appendChild(div);
            });

            const bubble = document.createElement('div');
            bubble.id = `player-table-${this.playerId}-operation${operation}-bubble`;
            bubble.classList.add('operation-bubble');
            bubble.dataset.operation = ''+operation;
            if (this.currentPlayer) {
                bubble.addEventListener('click', () => this.game.operationClick(operation));
            }
            document.getElementById(`player-table-${this.playerId}-operations`).appendChild(bubble);
        })

        player.circles.forEach(circle => {
            const div = document.createElement('div');
            div.id = `player-table-${this.playerId}-circle${circle.circleId}`;
            div.dataset.circle = `${circle.circleId}`;
            div.classList.add('circle');
            div.dataset.zone = ''+circle.zone;
            div.dataset.value = ''+circle.value;
            div.innerHTML = `${circle.value !== null && circle.value !== -1 ? circle.value : ''}`;
            if (circle.value === -1) {
                div.dataset.jamming = 'true';
            }
            document.getElementById(`player-table-${this.playerId}-circles`).appendChild(div);
            div.addEventListener('click', () => {
                if (div.classList.contains('ghost')) {
                    this.game.cellClick(circle.circleId);
                }
            });
        });

        player.links.forEach(link => this.setLink(link.index1, link.index2));

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

        this.objectiveTokens = new CompressedLineStock<ObjectiveToken>(this.game.objectiveTokensManager, document.getElementById(`player-table-${this.playerId}-objective-tokens`), 100);
        this.objectiveTokens.addCards(player.objectiveTokens, undefined, { visible: Boolean(player.objectiveTokens[0]?.lumens) });

        this.discoverTiles = new CompressedLineStock<DiscoverTile>(this.game.discoverTilesManager, document.getElementById(`player-table-${this.playerId}-discover-tiles`), 100);
        player.discoverTiles.forEach(discoverTile => this.discoverTiles.addCard(discoverTile, undefined, { visible: Boolean(discoverTile?.type) }));

        this.game.setTooltip(`player-table-${this.playerId}-zone-legend`, _('TODO'));
        this.game.setTooltip(`player-table-${this.playerId}-link-legend`, _('TODO'));
        this.game.setTooltip(`player-table-${this.playerId}-check-legend`, _('TODO'));
    }

    private cardClick(card: Card) {
        if (this.game.cardsManager.getCardElement(card).classList.contains('selectable')) {
            if (card.type < 20) {
                    this.game.playFighter(card.id);
            } else if (card.type < 30) {
                this.game.activateFighter(card.id);
            }
        } else {
            this.game.cardsManager.getCardStock(card).unselectCard(card);
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

            const bubble = document.getElementById(`player-table-${this.playerId}-operation${key}-bubble`);
            bubble.innerHTML = operation.possible ? `<span>${operation.value}</span>` : `<img src="${g_gamethemeurl}img/mul.gif"/>`;
            bubble.dataset.visible = 'true';
        });
    }

    public clearPossibleOperations() {
        (Array.from(document.querySelectorAll(`.operation-bubble`)) as HTMLElement[]).forEach(elem => elem.dataset.visible = 'false');
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
            circleDiv.dataset.value = ''+value;
            circleDiv.classList.add('ghost');
            if (value === -1) {
                circleDiv.dataset.jamming = 'true';
            } else {
                circleDiv.innerHTML = ''+value;
            }
        });
    }
    
    public setCircleValue(circleId: number, value: number) {
        const circleDiv = document.getElementById(`player-table-${this.playerId}-circle${circleId}`);
        circleDiv.classList.remove('ghost');
        circleDiv.dataset.value = ''+value;
        circleDiv.innerHTML = value === -1 ? '' : ''+value;
        if (value === -1) {
            circleDiv.dataset.jamming = 'true';
        }
    }

    public setPossibleCellLinks(possibleLinkCirclesIds: number[], cellId: number) {
        possibleLinkCirclesIds.forEach(destId => this.setLink(cellId, destId, true));
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
    
    public setLink(index1: number, index2: number, selectable: boolean = false) {
        const circle1 = CIRCLES[index1];
        const circle2 = CIRCLES[index2];

        const angle = Math.atan2(circle2[0] - circle1[0], circle2[1] - circle1[1]) * 180 / Math.PI - 90;
	    const left = circle1[1] + CIRCLE_WIDTH/2 - 5;
        const top = circle1[0] + CIRCLE_WIDTH/2 + 3;
        const link = document.createElement('div');
        link.id = `link_${this.playerId}_${index1}_${index2}`;
        link.classList.add('link', 'chiffres');
        if (selectable) {
            link.classList.add('selectable');
        }
        link.style.left = `${left}px`;
        link.style.top = `${top}px`;
        link.style.transform = `rotate(${angle}deg)`;
        link.innerHTML = `<img src="${g_gamethemeurl}img/num1.gif" />`;
        document.getElementById(`player-table-${this.playerId}-circles`).appendChild(link);
        
        if (selectable) {
            link.addEventListener('click', () => this.game.cellClick(index2));
        }
    }
    
    public setSelectableMoveActivateCards(selectableCards: Card[]) {
        [this.reserve, this.highCommand].forEach(stock => {
            stock.setSelectionMode(selectableCards.length ? 'single' : 'none');
            stock.getCards().forEach(card => stock.getCardElement(card).classList.toggle('selectable', selectableCards.some(c => c.id == card.id)));
        });
    }

    public setSelectablePlayCards(selectableCards: Card[]) {
        [this.reserve, this.highCommand].forEach(stock => {
            stock.setSelectionMode(selectableCards.length ? 'single' : 'none');
            stock.getCards().forEach(card => stock.getCardElement(card).classList.toggle('selectable', selectableCards.some(c => c.id == card.id)));
        });
    }
    
    public addObjectiveTokens(tokens: ObjectiveToken[]) {        
        this.objectiveTokens.addCards(tokens, undefined, { visible: Boolean(tokens[0]?.lumens) });
    }
    
    public addDiscoverTile(discoverTile: DiscoverTile) {        
        this.discoverTiles.addCard(discoverTile);
    }
    
    public revealObjectiveTokens(tokens: ObjectiveToken[]) {
        this.objectiveTokens.addCards(tokens);
        tokens.forEach(card => {
            const elem = this.objectiveTokens.getCardElement(card);
            this.game.objectiveTokensManager.setupFrontDiv(card);
            elem.dataset.side = 'front';
        });
    }
}