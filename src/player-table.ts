const isDebug = window.location.host == 'studio.boardgamearena.com' || window.location.hash.indexOf('debug') > -1;;
const log = isDebug ? console.log.bind(window.console) : function () { };

class PlayerTable {
    public playerId: number;

    private currentPlayer: boolean;
    private cardsPointsCounter: Counter;

    constructor(private game: LumenGame, player: LumenPlayer) {
        this.playerId = Number(player.id);
        this.currentPlayer = this.playerId == this.game.getPlayerId();

        let html = `
        <div id="player-table-${this.playerId}" class="player-table">
            <div id="player-table-${this.playerId}-hand-cards" class="hand cards" data-player-id="${this.playerId}" data-current-player="${this.currentPlayer.toString()}" data-my-hand="${this.currentPlayer.toString()}"></div>
            <div class="name-wrapper">
                <span class="name" style="color: #${player.color};">${player.name}</span>
                <div class="bubble-wrapper">
                    <div id="player-table-${this.playerId}-discussion-bubble" class="discussion_bubble" data-visible="false"></div>
                </div>
        `;
        if (this.currentPlayer) {
            html += `<span class="counter">
                    (${_('Cards points:')}&nbsp;<span id="cards-points-counter"></span>)
                </span>`;
        }
        html += `</div>
            <div id="player-table-${this.playerId}-table-cards" class="table cards">
            </div>
        </div>
        `;
        dojo.place(html, document.getElementById('tables'));

        if (this.currentPlayer) {
            this.cardsPointsCounter = new ebg.counter();
            this.cardsPointsCounter.create(`cards-points-counter`);
            this.cardsPointsCounter.setValue(player.cardsPoints);
        }
    }
}