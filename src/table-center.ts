class TableCenter {
    private territoriesStocks: TerritoryStock[] = [];
    private initiativeMarker: HTMLDivElement;

    constructor(private game: LumenGame, gamedatas: LumenGamedatas) {
        const scenario = game.scenario;

        if (gamedatas.scenario == 3) {
            this.addRiver();
        }
        this.addBattlefields(scenario.battlefields);
        this.addObjectiveTokens(scenario.objectiveTokens, gamedatas.realizedObjectives);
        this.addInitiativeMarker(gamedatas.initiativeMarkerTerritory);
        
        gamedatas.fightersOnTerritories.forEach(card => this.territoriesStocks[card.locationArg].addCard(card, undefined, {visible: !card.played}));
        gamedatas.discoverTilesOnTerritories.forEach(discoverTile => this.territoriesStocks[discoverTile.locationArg].discoverTileStock.addCard(discoverTile, undefined, {visible: discoverTile.visible}));

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
            background.dataset.id = `${battlefieldInfos.battlefieldId}`;
            background.classList.add('battlefield-background');
            background.style.setProperty('--x', `${battlefieldInfos.x}px`);
            background.style.setProperty('--y', `${battlefieldInfos.y}px`);
            background.style.setProperty('--rotation', `${battlefieldInfos.rotation}deg`);
            map.appendChild(background);
            map.appendChild(battlefield);
            this.addTerritories(BATTLEFIELDS[battlefieldInfos.battlefieldId].territories, battlefield, battlefieldInfos.rotation);

            if ([90, 270].includes(battlefieldInfos.rotation)) {
                battlefield.style.marginBottom = `-143px`;
                background.style.marginBottom = `-143px`;
            }
        });
    }
    
    private addTerritories(territories: Territory[], battlefield: HTMLDivElement, rotation: 0 | 90 | 180 | 270) {
        territories.forEach(territoryInfos => {
            const territory = document.createElement('div');
            territory.id = `territory-${territoryInfos.id}`;
            territory.dataset.id = ''+territoryInfos.id;
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
            `;
            battlefield.appendChild(territory);

            const territoryMask = document.createElement('div');
            territoryMask.id = `territory-mask-${territoryInfos.id}`;
            territoryMask.dataset.id = ''+territoryInfos.id;
            territoryMask.classList.add('territory-mask');
            battlefield.prepend(territoryMask);
            territoryMask.addEventListener('click', () => this.game.territoryClick(territoryInfos.id));

            this.territoriesStocks[territoryInfos.id] = new TerritoryStock(this.game.cardsManager, document.getElementById(`territory-${territoryInfos.id}-fighters`), territoryInfos.curve, rotation, territoryInfos.id);
            this.territoriesStocks[territoryInfos.id].onCardClick = card => {
                const selectableCards = this.game.getChooseFighterSelectableMoveActivateCards();
                const canClick = selectableCards?.some(fighter => fighter.id == card.id);
                if (canClick) {
                    this.territoryFighterClick(card);
                } else {
                    this.territoriesStocks[territoryInfos.id].unselectCard(card);
                }
            }     
            
            this.territoriesStocks[territoryInfos.id].onAnyClick = () => {
                if ((this.game as any).gamedatas.gamestate.name == 'chooseTerritory') {
                    this.game.territoryClick(territoryInfos.id);
                }
            };

            /*// TODO TEMP
            this.territoriesStocks[territoryInfos.id].addCards([
                { id: 1000 * territoryInfos.id + 1, type: 1, subType: 3, played: false, playerId: 2343492, location: 'territory', locationArg : territoryInfos.id },
                { id: 1000 * territoryInfos.id + 2, type: 1, subType: 1, played: false, playerId: 2343492, location: 'territory', locationArg : territoryInfos.id },
                { id: 1000 * territoryInfos.id + 3, type: 1, subType: 2, played: false, playerId: 2343492, location: 'territory', locationArg : territoryInfos.id },
            ])*/
        });
    }

    private addObjectiveTokens(objectiveTokens: ObjectiveTokenPosition[], realizedObjectives: string[]) {
        const map = document.getElementById(`map`);
        objectiveTokens.filter(objectiveTokenInfos => !realizedObjectives.includes(objectiveTokenInfos.letter)).forEach(objectiveTokenInfos => {
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
        this.territoriesStocks[initiativeMarkerTerritory].addInitiativeMarker();
    }
    
    public moveInitiativeMarker(territoryId: number) {
        const previousTerritory = this.initiativeMarker.parentElement.parentElement;
        const territory = document.getElementById(`territory-${territoryId}`);
        territory.appendChild(this.initiativeMarker);
        stockSlideAnimation({
            element: this.initiativeMarker,
            fromElement: previousTerritory,
        });
        this.territoriesStocks[Number(previousTerritory.dataset.id)].initiativeMarkerRemoved();
        this.territoriesStocks[territoryId].addInitiativeMarker();
    }
    
    public moveFighter(fighter: Card, territoryId: number, fromBag: boolean = false) {
        this.territoriesStocks[territoryId].addCard(
            fighter, 
            fromBag ? { fromElement: document.getElementById(`bag-${fighter.playerId}`) } : undefined, 
            {visible: !fighter.played}
        );
    }
    
    public revealDiscoverTile(discoverTile: DiscoverTile) {
        this.game.discoverTilesManager.setupFrontDiv(discoverTile);
        this.game.discoverTilesManager.getCardElement(discoverTile).dataset.side = 'front';
    }
    
    public highlightDiscoverTile(discoverTile: DiscoverTile) {
        this.game.discoverTilesManager.getCardElement(discoverTile)?.classList.add('highlight');
    }

    private cancelFighterChoice() {
        const oldChoice = document.getElementById(`fighter-choice`);
        if (oldChoice) {
            oldChoice.closest('.battlefield').classList.remove('temp-z-index');
            oldChoice.parentElement.removeChild(oldChoice);
        }
    }

    private createFighterChoice(card: Card) {
        const element = this.game.cardsManager.getCardElement(card);
        element.closest('.battlefield').classList.add('temp-z-index');

        const canMove = ((this.game as any).gamedatas.gamestate.args as EnteringChooseFighterArgs).possibleFightersToMove.some(moveFighter => moveFighter.id == card.id);
        const canActivate = ((this.game as any).gamedatas.gamestate.args as EnteringChooseFighterArgs).possibleFightersToActivate.some(activateFighter => activateFighter.id == card.id);

        dojo.place(`<div id="fighter-choice">
            <button id="fighter-choice-move" ${canMove ? '' : ' disabled="disabled"'}>${_('Move')}</button>
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
        this.territoriesStocks.forEach(stock => {
            stock.setSelectionMode(selectableCards.length ? (multiple ? 'multiple' : 'single') : 'none');
            stock.getCards().forEach(card => stock.getCardElement(card).classList.toggle('selectable', selectableCards.some(c => c.id == card.id)));
        });
    }
    
    public setSelectableTerritories(territoriesIds: number[]) {
        territoriesIds.forEach(territoryId => 
            document.getElementById(territoryId ? `territory-mask-${territoryId}` : 'river')?.classList.add('selectable')
        );
    }
    
    private setMapSize(battlefields: BattlefieldPosition[]) {
        let maxRight = 0;
        let maxBottom = 0;
        battlefields.forEach(battlefield => {
            const horizontal = [90, 270].includes(battlefield.rotation);
            const right = battlefield.x + (horizontal ? 708 : 566);
            const bottom = battlefield.y + (horizontal ? 566 : 708);
            if (right > maxRight) {
                maxRight = right;
            }
            if (bottom > maxBottom) {
                maxBottom = bottom;
            }
        });

        const map = document.getElementById('map');
        //map.style.width = `${maxRight}px`;
        //map.style.height = `${maxBottom + 10}px`;
        map.dataset.width = `${maxRight}`;
        map.dataset.height = `${maxBottom + 10}`;
    }
}