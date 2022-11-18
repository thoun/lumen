class TableCenter {
    private fightersStocks: LineStock<Card>[] = [];
    private discoverTilesStocks: LineStock<DiscoverTile>[] = [];
    private initiativeMarker: HTMLDivElement;

    constructor(private game: LumenGame, gamedatas: LumenGamedatas) {
        const scenario = game.scenario;

        this.addBattlefields(scenario.battlefields);
        this.addObjectiveTokens(scenario.objectiveTokens);
        this.addInitiativeMarker(gamedatas.initiativeMarkerTerritory);
        
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

            this.fightersStocks[territoryInfos.id] = new LineStock<Card>(this.game.cardsManager, document.getElementById(`territory-${territoryInfos.id}-fighters`));
            this.fightersStocks[territoryInfos.id].onCardClick = card => this.territoryFighterClick(card);
            this.discoverTilesStocks[territoryInfos.id] = new LineStock<DiscoverTile>(this.game.discoverTilesManager, document.getElementById(`territory-${territoryInfos.id}-discover-tiles`));
        });
    }

    private addObjectiveTokens(objectiveTokens: ObjectiveTokenPosition[]) {
        const map = document.getElementById(`map`);
        objectiveTokens.forEach(objectiveTokenInfos => {
            const objectiveToken = document.createElement('div');
            objectiveToken.id = `objective-token-${objectiveTokenInfos.letter}`;
            objectiveToken.classList.add('objective-token');
            objectiveToken.style.left = `${objectiveTokenInfos.x}px`;
            objectiveToken.style.top = `${objectiveTokenInfos.y}px`;
            map.appendChild(objectiveToken);
        });
    }

    private addInitiativeMarker(initiativeMarkerTerritory: number) {
        const territory = document.getElementById(`territory-${initiativeMarkerTerritory}`);
        this.initiativeMarker = document.createElement('div');
        this.initiativeMarker.id = `initiative-marker`;
        territory.appendChild(this.initiativeMarker);
    }
    
    public moveInitiativeMarker(territoryId: number) {
        const previousTerritory = this.initiativeMarker.parentElement;
        const territory = document.getElementById(`territory-${territoryId}`);
        territory.appendChild(this.initiativeMarker);
        stockSlideAnimation({
            element: this.initiativeMarker,
            fromElement: previousTerritory,
        });
    }
    
    public moveFighter(fighter: Card, territoryId: number) {
        this.fightersStocks[territoryId].addCard(fighter);
    }
    
    public revealDiscoverTile(discoverTile: DiscoverTile) {
        this.game.discoverTilesManager.setupFrontDiv(discoverTile);
        this.game.discoverTilesManager.getCardElement(discoverTile).dataset.side = 'front';
    }

    private cancelFighterChoice() {
        const oldChoice = document.getElementById(`fighter-choice`);
        oldChoice?.parentElement.removeChild(oldChoice);
    }

    private createFighterChoice(card: Card) {
        const element = this.game.cardsManager.getCardElement(card);

        dojo.place(`<div id="fighter-choice">
            <button id="fighter-choice-move">${_('Move')}</button>
            <button id="fighter-choice-cancel">✖</button>
            <button id="fighter-choice-activate">${_('Activate')}</button>
        </div>`, element);

        document.getElementById(`fighter-choice-move`).addEventListener('click', () => {
            this.game.moveFighter(card.id);
            this.cancelFighterChoice();
        });
        document.getElementById(`fighter-choice-cancel`).addEventListener('click', () => this.cancelFighterChoice());
        document.getElementById(`fighter-choice-activate`).addEventListener('click', () => {
            this.game.activateFighter(card.id);
            this.cancelFighterChoice();
        });
    }

    private territoryFighterClick(card: Card): void {
        this.cancelFighterChoice();

        if ((this.game as any).gamedatas.gamestate.name !== 'chooseFighter') {
            return;
        }

        if ((this.game as any).gamedatas.gamestate.args.move) {
            this.game.chooseFightersClick(card);
        } else {
            this.createFighterChoice(card);
        }
    }
    
    public setSelectableCards(selectableCards: Card[], multiple: boolean = false) {
        this.fightersStocks.forEach(stock => {
            stock.setSelectionMode(selectableCards.length ? (multiple ? 'multiple' : 'single') : 'none');
            stock.getCards().forEach(card => stock.getCardElement(card).classList.toggle('selectable', selectableCards.some(c => c.id == card.id)));
        });
    }
    
    public setSelectableTerritories(territoriesIds: number[]) {
        territoriesIds.forEach(territoryId => document.getElementById(`territory-${territoryId}`).classList.add('selectable'));
    }
}