class TableCenter {
    private fightersStocks: LineStock<Card>[] = [];
    private discoverTilesStocks: LineStock<DiscoverTile>[] = [];
    private initiativeMarker: HTMLDivElement;

    constructor(private game: LumenGame, gamedatas: LumenGamedatas) {
        const scenario = game.scenario;

        if (gamedatas.scenario == 3) {
            this.addRiver();
        }
        this.addBattlefields(scenario.battlefields);
        this.addObjectiveTokens(scenario.objectiveTokens);
        this.addInitiativeMarker(gamedatas.initiativeMarkerTerritory);
        
        gamedatas.fightersOnTerritories.forEach(card => this.fightersStocks[card.locationArg].addCard(card, undefined, {visible: !card.played}));
        gamedatas.discoverTilesOnTerritories.forEach(discoverTile => this.discoverTilesStocks[discoverTile.locationArg].addCard(discoverTile, undefined, {visible: discoverTile.visible}));

        this.setMapSize(scenario.battlefields);
    }
    
    private addRiver() {
        const map = document.getElementById(`map`);
        const river = document.createElement('div');
        river.id = `river`;
        river.addEventListener('click', () => this.game.territoryClick(0));
        map.appendChild(river);
    }
    
    private addBattlefields(battlefields: BattlefieldPosition[]) {
        const map = document.getElementById(`map`);
        battlefields.forEach(battlefieldInfos => {
            const battlefield = document.createElement('div');
            battlefield.id = `battlefield-${battlefieldInfos.battlefieldId}`;
            battlefield.dataset.id = `${battlefieldInfos.battlefieldId}`;
            battlefield.classList.add('battlefield');
            battlefield.style.setProperty('--x', `${battlefieldInfos.x}px`);
            battlefield.style.setProperty('--y', `${battlefieldInfos.y}px`);
            battlefield.style.setProperty('--rotation', `${battlefieldInfos.rotation}deg`);
            const background = document.createElement('div');
            background.classList.add('background');
            battlefield.appendChild(background);
            map.appendChild(battlefield);
            this.addTerritories(BATTLEFIELDS[battlefieldInfos.battlefieldId].territories, battlefield, battlefieldInfos.rotation);
        });
    }
    
    private addTerritories(territories: Territory[], battlefield: HTMLDivElement, rotation: number) {
        territories.forEach(territoryInfos => {
            const territory = document.createElement('div');
            territory.id = `territory-${territoryInfos.id}`;
            territory.dataset.lumens = ''+(territoryInfos.id % 10);
            territory.classList.add('territory');
            const angle90 = rotation % 180 == 90;
            let deltaX = 0;
            let deltaY = 0;
            if (angle90) {
                const diff = (territoryInfos.height - territoryInfos.width) / 2;
                deltaX = -diff;
                deltaY = diff;
            }
            territory.style.setProperty('--x', `${territoryInfos.x + deltaX}px`);
            territory.style.setProperty('--y', `${territoryInfos.y + deltaY}px`);
            territory.style.setProperty('--width', `${angle90 ? territoryInfos.height : territoryInfos.width}px`);
            territory.style.setProperty('--height', `${angle90 ? territoryInfos.width : territoryInfos.height}px`);
            let vertical = territoryInfos.height > territoryInfos.width;
            if (angle90) {
                vertical = !vertical;
            }
            territory.dataset.vertical = vertical.toString();
            territory.innerHTML = `
            <div id="territory-${territoryInfos.id}-fighters"></div>
            <div id="territory-${territoryInfos.id}-discover-tiles"></div>
            `;
            battlefield.appendChild(territory);

            const territoryMask = document.createElement('div');
            territoryMask.dataset.id = ''+territoryInfos.id;
            territoryMask.classList.add('territory-mask');
            battlefield.appendChild(territoryMask);
            territoryMask.addEventListener('click', () => this.game.territoryClick(territoryInfos.id));

            this.fightersStocks[territoryInfos.id] = new LineStock<Card>(this.game.cardsManager, document.getElementById(`territory-${territoryInfos.id}-fighters`));
            this.fightersStocks[territoryInfos.id].onCardClick = card => {
                const canClick = ((this.game as any).gamedatas.gamestate.args as EnteringChooseFighterArgs).possibleTerritoryFighters?.some(fighter => fighter.id == card.id);
                if (canClick) {
                    this.territoryFighterClick(card);
                } else {
                    this.fightersStocks[territoryInfos.id].unselectCard(card);
                }
            }
            this.discoverTilesStocks[territoryInfos.id] = new LineStock<DiscoverTile>(this.game.discoverTilesManager, document.getElementById(`territory-${territoryInfos.id}-discover-tiles`));
        });
    }

    private addObjectiveTokens(objectiveTokens: ObjectiveTokenPosition[]) {
        const map = document.getElementById(`map`);
        objectiveTokens.forEach(objectiveTokenInfos => {
            const objectiveToken = document.createElement('div');
            objectiveToken.id = `objective-token-${objectiveTokenInfos.letter}`;
            objectiveToken.classList.add('objective-token', 'token-with-letter');
            objectiveToken.style.left = `${objectiveTokenInfos.x}px`;
            objectiveToken.style.top = `${objectiveTokenInfos.y}px`;
            objectiveToken.innerHTML = objectiveTokenInfos.letter.substring(0, 1);
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

        const canActivate = ((this.game as any).gamedatas.gamestate.args as EnteringChooseFighterArgs).possibleFightersToActivate.some(activateFighter => activateFighter.id == card.id);

        dojo.place(`<div id="fighter-choice">
            <button id="fighter-choice-move">${_('Move')}</button>
            <button id="fighter-choice-cancel">✖</button>
            <button id="fighter-choice-activate" ${canActivate ? '' : ' disabled="disabled"'}>${_('Activate')}</button>
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
    
    private setMapSize(battlefields: BattlefieldPosition[]) {
        let maxRight = 0;
        let maxBottom = 0;
        battlefields.forEach(battlefield => {
            const right = battlefield.x + 708;
            const bottom = battlefield.y + 708;
            if (right > maxRight) {
                maxRight = right;
            }
            if (bottom > maxBottom) {
                maxBottom = bottom;
            }
        });

        const map = document.getElementById('map');
        map.style.width = `${maxRight}px`;
        map.style.height = `${maxBottom}px`;
    }
}