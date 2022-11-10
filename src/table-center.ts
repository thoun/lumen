class TableCenter {
    private fightersStocks: LineStock<Card>[] = [];
    private discoverTilesStocks: LineStock<DiscoverTile>[] = [];

    constructor(private game: LumenGame, gamedatas: LumenGamedatas) {
        const scenario = SCENARIOS[gamedatas.scenario];

        this.addBattlefields(scenario.battlefields);
        
        gamedatas.fightersOnTerritories.forEach(card => this.fightersStocks[card.locationArg].addCard(card, undefined, {visible: !card.played}));
        gamedatas.discoverTilesOnTerritories.forEach(discoverTile => this.discoverTilesStocks[discoverTile.locationArg].addCard(discoverTile, undefined, {visible: discoverTile.visible}));
    }
    
    private addBattlefields(battlefields: BattlefieldPosition[]) {
        const map = document.getElementById(`map`);
        battlefields.forEach(battlefieldInfos => {
            const battlefield = document.createElement('div');
            battlefield.id = `battlefield-${battlefieldInfos.battlefieldId}`;
            battlefield.classList.add('battlefield');
            battlefield.innerHTML = `battlefield-${battlefieldInfos.battlefieldId}`;
            map.appendChild(battlefield);
            this.addTerritories(BATTLEFIELDS[battlefieldInfos.battlefieldId].territories, battlefield);
        });
    }
    
    private addTerritories(territories: Territory[], battlefield: HTMLDivElement) {
        territories.forEach(territoryInfos => {
            const territory = document.createElement('div');
            territory.id = `territory-${territoryInfos.id}`;
            territory.classList.add('territory');
            territory.innerHTML = `
            territory-${territoryInfos.id}
            <div id="territory-${territoryInfos.id}-fighters"></div>
            <div id="territory-${territoryInfos.id}-discover-tiles"></div>
            `;
            battlefield.appendChild(territory);
            territory.addEventListener('click', () => this.game.territoryClick(territoryInfos.id));

            this.fightersStocks[territoryInfos.id] = new LineStock<Card>(this.game.cards, document.getElementById(`territory-${territoryInfos.id}-fighters`));
            this.discoverTilesStocks[territoryInfos.id] = new LineStock<DiscoverTile>(this.game.discoverTiles, document.getElementById(`territory-${territoryInfos.id}-discover-tiles`));
        });
    }
    
    public moveFighter(fighter: Card, territoryId: number) {
        // TODO
        document.getElementById(`territory-${territoryId}`).appendChild(document.getElementById(`card-${fighter.id}`));
    }
}