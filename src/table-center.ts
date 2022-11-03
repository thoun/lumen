class TableCenter {
    constructor(private game: LumenGame, gamedatas: LumenGamedatas) {
        
        // TODO TEMP
        gamedatas.fightersOnTerritories.forEach(card => {
            dojo.place(`<div><button id="card-${card.id}-move">move ${card.id}</button><button id="card-${card.id}-activate">activate ${card.id}</button></div>`, `map`);
            document.getElementById(`card-${card.id}-move`).addEventListener('click', () => this.game.moveFighter(card.id));
            document.getElementById(`card-${card.id}-activate`).addEventListener('click', () => this.game.activateFighter(card.id));
        });
    }
    
    public moveFighter(fighter: Card, territoryId: number) {
        // TODO throw new Error("Method not implemented.");
    }
}