const isDebug = window.location.host == 'studio.boardgamearena.com' || window.location.hash.indexOf('debug') > -1;
const log = isDebug ? console.log.bind(window.console) : function () { };

class PlayerTable {
    public playerId: number;

    private currentPlayer: boolean;

    constructor(private game: LumenGame, player: LumenPlayer) {
        this.playerId = Number(player.id);
        this.currentPlayer = this.playerId == this.game.getPlayerId();

        let html = `
        <div id="player-table-${this.playerId}" class="player-table">
            <div id="player-table-${this.playerId}-hand-cards" class="hand cards" data-player-id="${this.playerId}" data-current-player="${this.currentPlayer.toString()}" data-my-hand="${this.currentPlayer.toString()}"></div>
            <div class="name-wrapper">
                <span class="name" style="color: #${player.color};">${player.name}</span>
            </div>
            <div id="player-table-${this.playerId}-operations" class="operations">
            </div>
            <div id="player-table-${this.playerId}-circles" class="circles">
            </div>
        </div>
        `;
        dojo.place(html, document.getElementById('tables'));

        [1, 2, 3, 4, 5].forEach(operation => {
            (operation > 3 ? [1, 2, 3, 4] : [1, 2, 3]).forEach(number => {
                const div = document.createElement('div');
                div.id = `player-table-${this.playerId}-operation${operation}-number${number}`;
                div.classList.add('operation-number');
                div.innerHTML = `${player.operations[operation] >= number ? 'X' : ''}`;
                document.getElementById(`player-table-${this.playerId}-operations`).appendChild(div);
            });
        })

        player.circles.forEach(circle => {
            const div = document.createElement('div');
            div.id = `player-table-${this.playerId}-circle${circle.circleId}`;
            div.classList.add('circle');
            div.innerHTML = `${circle.value ?? ''}`;
            document.getElementById(`player-table-${this.playerId}-circles`).appendChild(div);
            div.addEventListener('click', () => {
                if (div.classList.contains('ghost')) {
                    this.game.chooseCell(circle.circleId);
                }
            });
        });
    }

    public setPossibleOperations(operations: { [operation: number]: { currentNumber: number; value: number; possible: boolean; }; }) {
        Object.keys(operations).forEach(key => {
            const operation = operations[key];
            if (operation.possible) {
                const operationNumberDiv = document.getElementById(`player-table-${this.playerId}-operation${key}-number${operation.currentNumber + 1}`);
                operationNumberDiv.classList.add('ghost');
                operationNumberDiv.innerHTML = 'X';
            }
        })
    }
    
    public setPlayedOperation(type: number, number: number) {
        const circleDiv = document.getElementById(`player-table-${this.playerId}-operation${type}-number${number}`);
        circleDiv.classList.remove('ghost');
        circleDiv.innerHTML = 'X';
    }

    public setPossibleCells(possibleCircles: number[], value: number) {
        possibleCircles.forEach(circleId => {
            const circleDiv = document.getElementById(`player-table-${this.playerId}-circle${circleId}`);
            circleDiv.classList.add('ghost');
            circleDiv.innerHTML = ''+value;
        })
    }
    
    public setCircleValue(circleId: number, value: number) {
        const circleDiv = document.getElementById(`player-table-${this.playerId}-circle${circleId}`);
        circleDiv.classList.remove('ghost');
        circleDiv.innerHTML = ''+value;
    }

    public addHighCommandCard(card: Card) {
        // TODO throw new Error("Method not implemented.");
    }

    public addCheck(checks: number) {
        // TODO throw new Error("Method not implemented.");
    }
}