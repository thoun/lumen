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

        player.circles.forEach(circle => {
            dojo.place(`<div id="player-table-${this.playerId}-circle${circle.circleId}" class="circle">${circle.value ?? ''}</div>`, document.getElementById(`player-table-${this.playerId}-circles`));
            const div = document.getElementById(`player-table-${this.playerId}-circle${circle.circleId}`);
            div.addEventListener('click', () => {
                if (div.classList.contains('ghost')) {
                    this.game.chooseCell(circle.circleId);
                }
            });
        });
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

    public setPossibleOperations(operations: { [operation: number]: { value: number; possible: boolean; }; }) {
        // TODO throw new Error("Method not implemented.");
    }
}