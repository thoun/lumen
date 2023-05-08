declare const define;
declare const ebg;
declare const $;
declare const dojo: Dojo;
declare const _;
declare const g_gamethemeurl;

type LumenDisplay = 'scroll-100' | 'scroll-75' | 'scroll-50' | 'fit-map-to-screen' | 'fit-map-and-board-to-screen' | 'fit-map-and-board-to-screen-bis';

const ANIMATION_MS = 500;
const ACTION_TIMER_DURATION = 5;

const LOCAL_STORAGE_DISPLAY_KEY = 'Lumen-display';

class Lumen implements LumenGame {
    public mapZoom: number = 1;
    public zoom: number = 1;
    public animationManager: AnimationManager;
    public cardsManager: CardsManager;
    public discoverTilesManager: DiscoverTilesManager;
    public objectiveTokensManager: ObjectiveTokensManager;
    public scenario: Scenario;

    private gamedatas: LumenGamedatas;
    private tableCenter: TableCenter;
    private playersTables: PlayerTable[] = [];
    private selectedPlanificationDice: { [color: string]: number } = {};
    private chosenFighters: number[] = [];
    private bags: VoidStock<Card>[] = [];
    private bagCounters: Counter[] = [];
    private hiddenScoreCounter: Counter;
    private display: LumenDisplay = 'fit-map-and-board-to-screen';
    private roundNumberCounter: Counter;
    private controlCounters: { [playerId: number]: { [lumens: number]: Counter } } = {};
    
    private TOOLTIP_DELAY = document.body.classList.contains('touch-device') ? 1500 : undefined;

    constructor() {
        const displayStr = localStorage.getItem(LOCAL_STORAGE_DISPLAY_KEY);
        if (displayStr && ['scroll', 'fit-map-to-screen', 'fit-map-and-board-to-screen'].includes(displayStr)) {
            this.display = displayStr as LumenDisplay;
        }
    }
    
    /*
        setup:

        This method must set up the game user interface according to current game situation specified
        in parameters.

        The method is called each time the game interface is displayed to a player, ie:
        _ when the game starts
        _ when a player refreshes the game page (F5)

        "gamedatas" argument contains all datas retrieved by your "getAllDatas" PHP method.
    */

    public setup(gamedatas: LumenGamedatas) {
        log( "Starting game setup" );
        
        this.gamedatas = gamedatas;

        log('gamedatas', gamedatas);

        this.animationManager = new AnimationManager(this);
        this.cardsManager = new CardsManager(this);
        this.discoverTilesManager = new DiscoverTilesManager(this);
        this.objectiveTokensManager = new ObjectiveTokensManager(this);
        //this.scenario = new Scenario(0);
        this.scenario = new Scenario(gamedatas.scenario);
        this.tableCenter = new TableCenter(this, this.gamedatas);
        this.setScenarioInformations();
        this.createPlayerPanels(gamedatas);
        this.createPlayerTables(gamedatas);

        this.notif_diceChange({
            args: {
                die1: gamedatas.die1,
                die2: gamedatas.die2,
            }
        } as any);

        this.setupNotifications();
        this.setupPreferences();
        this.addHelp();

        if (Number(gamedatas.gamestate.id) >= 90) { // score or end
            this.onEnteringEndScore(true);
        }

        this.setActiveDisplayButton();
        [/*100, */75/*, 50*/].forEach((zoomFactor : 100 | 75 | 50) => {
            const btnMapScroll = document.getElementById(`display-map-scroll-${zoomFactor}`);
            this.setTooltip(btnMapScroll.id, _('Scroll in map'));
            btnMapScroll.addEventListener('click', () => this.setMapScroll(zoomFactor));
        });
        const btnFitMap = document.getElementById('display-fit-map');
        const btnFitMapAndBoard = document.getElementById('display-fit-map-and-board');
        //const btnFitMapAndBoardBis = document.getElementById('display-fit-map-and-board-bis');
        this.setTooltip(btnFitMap.id, _('Fit map to screen'));
        this.setTooltip(btnFitMapAndBoard.id, _('Fit map and board to screen'));
        //this.setTooltip(btnFitMapAndBoardBis.id, _('Fit map and board to screen'));
        btnFitMap.addEventListener('click', () => this.setFitMap());
        btnFitMapAndBoard.addEventListener('click', () => this.setFitMapAndBoard(false));
        //btnFitMapAndBoardBis.addEventListener('click', () => this.setFitMapAndBoard(true));
        ['left', 'right', 'top', 'bottom'].forEach(direction => document.getElementById(`scroll-${direction}`).addEventListener('click', () => this.scroll(direction as any)));
        document.getElementById('map-frame').addEventListener('scroll', () => this.onMapFrameScroll());

        (this as any).onScreenWidthChange = () => {
            this.updateDisplay();
        };

        [500, 1000, 2000].forEach(timer => setTimeout(() => this.updateDisplay(), timer));

        log( "Ending game setup" );
    }

    ///////////////////////////////////////////////////
    //// Game & client states
    
    private setGamestateDescription(property: string = '') {
        const originalState = this.gamedatas.gamestates[this.gamedatas.gamestate.id];
        this.gamedatas.gamestate.description = `${originalState['description' + property]}`; 
        this.gamedatas.gamestate.descriptionmyturn = `${originalState['descriptionmyturn' + property]}`;
        (this as any).updatePageTitle();
    }

    // onEnteringState: this method is called each time we are entering into a new game state.
    //                  You can use this method to perform some user interface changes at this moment.
    //
    public onEnteringState(stateName: string, args: any) {
        log('Entering state: ' + stateName, args.args);

        switch (stateName) {
            case 'newRound':
                this.onEnteringNewRound(args.args);
                break;
            case 'chooseOperation':
                this.onEnteringChooseOperation(args.args);
                break;
            case 'chooseCell':
                this.onEnteringChooseCell(args.args);
                break;
            case 'chooseCellLink':
                this.onEnteringChooseCellLink(args.args);
                break;
            case 'chooseCellInterference':
                this.onEnteringChooseCellInterference(args.args);
                break;
            case 'confirmCell':
                this.onEnteringConfirmCell(args.args);
                break;   
            case 'chooseFighter':
                this.onEnteringChooseFighter(args.args);
                break;   
            case 'chooseTerritory':
                this.onEnteringChooseTerritory(args.args);
                break;      
            case 'endScore':  
                this.onEnteringEndScore();
                break;              
        }
    }

    private onEnteringNewRound(args: EnteringNewRoundArgs) {
        this.playersTables.forEach(playerTable => playerTable.removeFirstPlayerToken());
        this.roundNumberCounter.toValue(args.roundNumber);
    }

    private onEnteringPlanificationChooseFaces() {

        (this as any).addActionButton(`confirmSelectedPlanificationFaces-button`, _("Confirm"), () => this.chooseDiceFaces());
        dojo.addClass(`confirmSelectedPlanificationFaces-button`, 'disabled');
        const confirmButton = document.getElementById(`confirmSelectedPlanificationFaces-button`);

        ['white', 'black'].forEach((color, dieIndex) => {
            const facesWrapper = document.createElement('div');

            [0, 1, 2, 3, 4, 5].forEach(dieValueIndex => {
                const dieValue = dieIndex + dieValueIndex;
                const html = `<div class="die-icon" data-color="${color}">${dieValue}</div>`;

                (this as any).addActionButton(`select-${color}-die-${dieValue}-button`, html, () => this.onPlanificationDiceSelection(color, dieValue), null, null, 'gray');
                facesWrapper.appendChild(document.getElementById(`select-${color}-die-${dieValue}-button`));
                
            });

            confirmButton.parentElement.insertBefore(facesWrapper, confirmButton);
        });
    }
    
    private onEnteringChooseOperation(args: EnteringChooseOperationArgs) {
        if ((this as any).isCurrentPlayerActive()) {
            this.getCurrentPlayerTable()?.setPossibleOperations(args.operations);
        }
    }
    
    private onEnteringChooseCell(args: EnteringChooseCellArgs) {
        if ((this as any).isCurrentPlayerActive()) {
            this.getCurrentPlayerTable()?.setPossibleCells(args.possibleCircles, args.value);
        }
    }
    
    private onEnteringChooseCellLink(args: EnteringChooseCellLinkArgs) {
        if ((this as any).isCurrentPlayerActive()) {
            this.getCurrentPlayerTable()?.setPossibleCellLinks(args.possibleLinkCirclesIds, args.cellId);
        }
    }
    
    private onEnteringChooseCellInterference(args: EnteringChooseCellJammingArgs) {
        if ((this as any).isCurrentPlayerActive()) {
            this.getPlayerTable(args.opponentId)?.setPossibleCells(args.possibleCircles, -1);
            document.getElementById(`player-table-${args.opponentId}`).scrollIntoView({ behavior: 'smooth' });
        }
    }

    public getChooseFighterSelectableMoveActivateCards(args?: EnteringChooseFighterArgs): Card[] {
        if (this.gamedatas.gamestate.name !== 'chooseFighter') {
            return [];
        }

        args = args ?? this.gamedatas.gamestate.args as EnteringChooseFighterArgs;
        return args.move ? 
            args.possibleTerritoryFighters : 
            [...args.possibleFightersToMove, ...args.possibleFightersToActivate];
    }
    
    private onEnteringConfirmCell(args: EnteringConfirmCellArgs) {
        const subTitle = document.createElement('span');
        subTitle.classList.add('subtitle');

        subTitle.innerHTML = `${args.move} <div class="action move"></div>, ${args.place} <div class="action place"></div>, ${args.check ? _('1 new check') : _('No new check')}`;

        document.getElementById(`pagemaintitletext`).appendChild(document.createElement('br'));
        document.getElementById(`pagemaintitletext`).appendChild(subTitle);

        this.getPlayerTable(args.playerId).setConfirmCell(args.circleId);
    }
    
    private onEnteringChooseFighter(args: EnteringChooseFighterArgs) {
        if (!args.move) {
            const onlyFoolPlay = args.remainingActions.actions.map(action => action.remaining).reduce((a, b) => a + b, 0) == 0;
            if (onlyFoolPlay) {
                this.setGamestateDescription('OnlyFoolPlay');
            } else {
                this.setGamestateDescription(args.currentAction.type);
            }

            if (!onlyFoolPlay) {
                const subTitle = document.createElement('span');
                subTitle.classList.add('subtitle');
                if (args.usingFoolPlay) {
                    subTitle.innerHTML = `(${_('${tileFoolPlay} extra action').replace('${tileFoolPlay}', '<div class="tile-foul-play"></div>')})`;
                } else {
                    let texts = args.remainingActions.actions.filter(action => action.initial > 0).map(action => 
                        `${action.initial - action.remaining}/${action.initial} <div class="action ${action.type.toLowerCase()}"></div>`
                    );
                    subTitle.innerHTML = `(${texts.length > 1 ? _('${action1} then ${action2}').replace('${action1}', texts[0]).replace('${action2}', texts[1]) : texts.join('')})`;
                }
                document.getElementById(`pagemaintitletext`).appendChild(document.createElement('br'));
                document.getElementById(`pagemaintitletext`).appendChild(subTitle);
            }
        } else {
            this.setGamestateDescription(''+args.move);
        }

        if ((this as any).isCurrentPlayerActive()) {
            this.chosenFighters = [];
            if (args.currentAction?.type == 'PLACE') {
                this.getCurrentPlayerTable().setSelectablePlayCards(args.possibleFightersToPlace);
            } else {
                const selectableCards = this.getChooseFighterSelectableMoveActivateCards(args);
                this.getCurrentPlayerTable().setSelectableMoveActivateCards(selectableCards);
                this.tableCenter.setSelectableCards(selectableCards, args.selectionSize > 1 || args.selectionSize == -1);
            }
        }
    }

    private onEnteringChooseTerritory(args: EnteringChooseTerritoryArgs) {
        this.setGamestateDescription(''+args.move);
        if (args.selectedFighter) {
            this.cardsManager.getCardElement(args.selectedFighter)?.classList.add('selected');
        }
        if ((this as any).isCurrentPlayerActive()) {
            this.tableCenter.setSelectableTerritories(args.territoriesIds);
        }
    }

    private onEnteringEndScore(fromReload: boolean = false) {
        document.querySelectorAll('span.hidden-score').forEach(elem => elem.remove()); // remove the (+?)
    
        document.getElementById('score').style.display = 'flex';

        const players = Object.values(this.gamedatas.players);

        const headers = document.getElementById('scoretr');
        if (!headers.childElementCount) {
            let html = `<th></th>`;
            players.forEach(player => html += `<td style="background: #${player.color};">${player.name}</td>`);
            dojo.place(html, headers);
        }
        
        const scoreTerritories = document.getElementById('score-territories');
        if (!scoreTerritories.childElementCount) {
            let html = `<th>${_('Controlled territories')}</th>`;
            players.forEach(player => {
                html += `<td style="background: #${player.color};">
                    <div id="score-controlled-territories-${player.id}">${
                        fromReload ? [1,3,5,7].map(lumens => player.controlCounters[lumens] * lumens).reduce((a, b) => a + b, 0) : '0'
                    }</div>
                    <div class="counters-wrapper">(`;
                
                [1,3,5,7].forEach(lumens => 
                    html += `<div class="counter-wrapper" id="counter-wrapper-${player.id}-${lumens}" data-hidden="${(!this.scenario.battlefields.some(battlefield => BATTLEFIELDS[battlefield.battlefieldId].territories.some(territory => territory.id % 10 == lumens))).toString()}">
                        <div class="territory-img" data-lumens="${lumens}"></div><span id="score-controlled-territories-${player.id}-${lumens}">${fromReload ? player.controlCounters[lumens] * lumens : '0'}</span>
                    </div>`
                );

                html += `)</div></td>`;
            });
            dojo.place(html, scoreTerritories);
        }
        
        const scoreDiscoverTiles = document.getElementById('score-discover-tiles');
        if (!scoreDiscoverTiles.childElementCount) {
            let html = `<th>${_('Discover tiles')}</th>`;
            players.forEach(player => html += `<td style="background: #${player.color};" id="score-discover-tiles-${player.id}">${fromReload ? player.discoverTilesPoints : '0'}</td>`);
            dojo.place(html, scoreDiscoverTiles);
        }
        
        const scoreObjectiveTokens = document.getElementById('score-objective-tokens');
        if (!scoreObjectiveTokens.childElementCount) {
            let html = `<th>${_('Objective tokens')}</th>`;
            players.forEach(player => html += `<td style="background: #${player.color};" id="score-objective-tokens-${player.id}">${fromReload ? player.objectiveTokensPoints : '0'}</td>`);
            dojo.place(html, scoreObjectiveTokens);
        }

        const footers = document.getElementById('scorefoot');
        if (!footers.childElementCount) {
            let html = `<th>${_('Final score')}</th>`;
            players.forEach(player => html += `<td style="background: #${player.color};" id="score-final-${player.id}">${fromReload ? player.score : '0'}</td>`);
            dojo.place(html, footers);
        }
    }

    public onLeavingState(stateName: string) {
        log( 'Leaving state: '+stateName );

        switch (stateName) {
            case 'planificationChooseFaces':
                this.onLeavingPlanificationChooseFaces();
                break;
            case 'chooseOperation':
                this.onLeavingGhostMark('operation-number');
                this.getCurrentPlayerTable()?.clearPossibleOperations();
                break;
            case 'chooseCell':
                this.onLeavingGhostMark('circle');
                break;
            case 'chooseCellLink':
                this.onLeavingChooseCellLink();
                break;
            case 'chooseCellInterference':
                this.onLeavingChooseCellInterference();
                break;
            case 'confirmCell':
                this.onLeavingConfirmCell();
                break;
            case 'chooseFighter':
                this.onLeavingChooseFighter();
                break;
            case 'chooseTerritory':
                this.onLeavingChooseTerritory();
                break;
        }
    }

    private onLeavingPlanificationChooseFaces() {
        this.selectedPlanificationDice = {};
    }

    private onLeavingGhostMark(className: string) {
        (Array.from(document.querySelectorAll(`.${className}.ghost`)) as HTMLElement[]).forEach(elem => {
            elem.classList.remove('ghost');
            elem.innerHTML = '';
        });
    }
    
    private onLeavingChooseFighter() {
        this.getCurrentPlayerTable().setSelectableMoveActivateCards([]);
        this.tableCenter.setSelectableCards([]);
    }

    private onLeavingChooseTerritory() {
        document.querySelectorAll('.fighter.selectable').forEach(elem => elem.classList.remove('selectable'));
        document.querySelectorAll('.territory-mask.selectable').forEach(elem => elem.classList.remove('selectable'));
        document.querySelectorAll('#river.selectable').forEach(elem => elem.classList.remove('selectable'));
    }

    private onLeavingChooseCellLink() {
        document.querySelectorAll('.link.selectable').forEach(elem => elem.remove());
    }

    private onLeavingChooseCellInterference() {
        document.querySelectorAll('[data-jamming="true"].ghost').forEach((elem: HTMLElement) => {
            elem.classList.remove('selectable');
            elem.dataset.jamming = 'false';
        });
    }

    private onLeavingConfirmCell() {
        document.querySelectorAll('.circle.to-confirm').forEach(elem => elem.classList.remove('to-confirm'));
    }

    private replacePlaceAndMove(text: string, args: EnteringChooseActionArgs) {
        return text
            .replace('${place}', `<div class="action place"></div>`)
            .replace('${move}', `<div class="action move"></div>`)
            .replace('${placeNumber}', ''+args.remainingPlays)
            .replace('${placeMove}', ''+args.remainingMoves);
    }

    // onUpdateActionButtons: in this method you can manage "action buttons" that are displayed in the
    //                        action status bar (ie: the HTML links in the status bar).
    //
    public onUpdateActionButtons(stateName: string, args: any) {
        if ((this as any).isCurrentPlayerActive()) {
            switch (stateName) {
                case 'askActivatePlanning':
                    (this as any).addActionButton(`activatePlanning_button`, _('Activate'), () => this.activatePlanning());
                    (this as any).addActionButton(`passPlanification_button`, _('Pass'), () => this.passPlanning());
                    break;
                case 'planificationChooseFaces':
                    this.onEnteringPlanificationChooseFaces();
                    break;
                case 'chooseOperation':
                    const chooseOperationArgs = args as EnteringChooseOperationArgs;
                    Object.keys(chooseOperationArgs.operations).forEach((type: any) => {
                        const operation = chooseOperationArgs.operations[type];
                        (this as any).addActionButton(`chooseOperation${type}_button`, `<div class="operation-icon" data-type="${type}"></div> ${operation.value}`, () => this.chooseOperation(type), null, null, 'gray');
                        if (operation.disabled) {
                            const button = document.getElementById(`chooseOperation${type}_button`);
                            button.classList.add('disabled');
                            if (operation.disabled == 'first-player') {
                                button.insertAdjacentHTML('beforeend', `<div class="first-player-token"></div>`);
                            }
                        }    
                    });
                    break;
                case 'chooseCell':
                    (this as any).addActionButton(`cancelOperation_button`, _('Cancel'), () => this.cancelOperation(), null, null, 'gray');
                    break;
                case 'confirmCell':
                    (this as any).addActionButton(`confirmCell_button`, _('Confirm'), () => this.confirmCell());
                    (this as any).addActionButton(`cancelCell_button`, _('Cancel'), () => this.cancelCell(), null, null, 'gray');
                    break;
                case 'chooseAction':
                    const chooseActionArgs = args as EnteringChooseActionArgs;
                    (this as any).addActionButton(`startWithActionPlay_button`, this.replacePlaceAndMove(_('Start with ${placeNumber} ${place} then ${placeMove} ${move}'), chooseActionArgs), () => this.startWithAction(1));
                    (this as any).addActionButton(`startWithActionMove_button`, this.replacePlaceAndMove(_('Start with ${placeMove} ${move} then ${placeNumber} ${place}'), chooseActionArgs), () => this.startWithAction(2));

                    if (chooseActionArgs.canUseFoulPlay) {
                        (this as any).addActionButton(`useFoulPlay_button`, _('Use ${card}').replace('${card}', this.discoverTilesManager.getName(2, 5)), () => this.useFoulPlay());
                    }
                    break;
                case 'chooseFighter':
                    const chooseFighterArgs = args as EnteringChooseFighterArgs;
                    if (!chooseFighterArgs.move) {
                        if (chooseFighterArgs.couldUseFoulPlay && !chooseFighterArgs.usingFoolPlay) {
                            (this as any).addActionButton(`useFoulPlay_button`, _('Use ${card}').replace('${card}', this.discoverTilesManager.getName(2, 5)), () => this.useFoulPlay());
                            if (!chooseFighterArgs.canPlayFoolPlay) {
                                document.getElementById(`useFoulPlay_button`).classList.add('disabled');
                            }
                        }
                        if (chooseFighterArgs.usingFoolPlay) {
                            (this as any).addActionButton(`cancelFoulPlay_button`, _('Cancel'), () => this.cancelFoulPlay(), null, null, 'gray');
                        } else {
                            const shouldntPass = chooseFighterArgs.remainingActions.actions.map(action => action.remaining).reduce((a, b) => a + b, 0) > 0;
                            (this as any).addActionButton(`cancelOperation_button`, _('Pass'), () => this.pass(shouldntPass), null, null, shouldntPass ? 'gray' : undefined);
                        }
                    } else {
                        switch (chooseFighterArgs.move) {
                            case 5:
                                if (!chooseFighterArgs.possibleTerritoryFighters.length) {
                                    (this as any).addActionButton(`passAssassin_button`, _('Pass (no possible fighter to assassinate)'), () => this.passChooseFighters());
                                }
                                break;
                            case 9:
                                if (chooseFighterArgs.selectionSize == -1) {
                                    (this as any).addActionButton(`chooseFighters_button`, _('Disable selected fighters'), () => this.chooseFighters(this.chosenFighters));
                                }
                                break;
                            case 21:
                                (this as any).addActionButton(`chooseFighters_button`, _('Remove selected fighters'), () => this.chooseFighters(this.chosenFighters));
                                break;
                            case 23:
                                (this as any).addActionButton(`chooseFighters_button`, _('Swap selected fighters'), () => this.chooseFighters(this.chosenFighters));
                                document.getElementById(`chooseFighters_button`).classList.add('disabled');
                                break;
                        }
                    }
                    if (chooseFighterArgs.canCancel) { 
                        (this as any).addActionButton(`cancelChooseFighters_button`, _('Cancel'), () => this.cancelChooseFighters(), null, null, 'gray');
                    }
                    break;
                case 'chooseTerritory':
                    const chooseTerritoryArgs = args as EnteringChooseTerritoryArgs;
                    if (chooseTerritoryArgs.canCancel) { 
                        (this as any).addActionButton(`cancelChooseTerritory_button`, _('Cancel'), () => this.cancelChooseTerritory(), null, null, 'gray');
                    }
                    break;
            }
        }
    }

    ///////////////////////////////////////////////////
    //// Utility methods


    ///////////////////////////////////////////////////

    public setTooltip(id: string, html: string) {
        (this as any).addTooltipHtml(id, html, this.TOOLTIP_DELAY);
    }
    public setTooltipToClass(className: string, html: string) {
        (this as any).addTooltipHtmlToClass(className, html, this.TOOLTIP_DELAY);
    }

    public getPlayerId(): number {
        return Number((this as any).player_id);
    }

    public getPlayerColor(playerId: number): string {
        return this.gamedatas.players[playerId].color;
    }

    public getPlayerIdByColor(color: string): number {
        return Number(Object.values(this.gamedatas.players).find(player => player.color == color).id);
    }

    private getPlayer(playerId: number): LumenPlayer {
        return Object.values(this.gamedatas.players).find(player => Number(player.id) == playerId);
    }

    private getPlayerTable(playerId: number): PlayerTable {
        return this.playersTables.find(playerTable => playerTable.playerId === playerId);
    }

    private getCurrentPlayerTable(): PlayerTable | null {
        return this.playersTables.find(playerTable => playerTable.playerId === this.getPlayerId());
    }

    private toggleZoomNotice(visible: boolean) {
        const elem = document.getElementById('zoom-notice');
        if (visible) {
            if (!elem) {
                dojo.place(`
                <div id="zoom-notice">
                    ${_("Use map controls to adapt map size !")}
                    <div style="text-align: center; margin-top: 10px;"><a id="hide-zoom-notice">${_("Dismiss")}</a></div>
                    <div class="arrow-right"></div>
                </div>
                `, 'map-controls');

                document.getElementById('hide-zoom-notice').addEventListener('click', () => {
                    const select = document.getElementById('preference_control_299') as HTMLSelectElement;
                    select.value = '2';
    
                    var event = new Event('change');
                    select.dispatchEvent(event);
                });
            }
        } else if (elem) {
            elem.parentElement.removeChild(elem);
        }
    }

    private setFitMap() {
        this.display = 'fit-map-to-screen';
        localStorage.setItem(LOCAL_STORAGE_DISPLAY_KEY, this.display);
        this.setActiveDisplayButton();
        this.updateDisplay();
    }

    private setFitMapAndBoard(sameScale: boolean) {
        this.display = 'fit-map-and-board-to-screen' + (sameScale ? '-bis' : '') as any;
        localStorage.setItem(LOCAL_STORAGE_DISPLAY_KEY, this.display);
        this.setActiveDisplayButton();
        this.updateDisplay();
    }

    private setMapScroll(zoomFactor: 100 | 75 | 50) {
        this.display = `scroll-${zoomFactor}`;
        localStorage.setItem(LOCAL_STORAGE_DISPLAY_KEY, this.display);
        this.setActiveDisplayButton();  
        this.updateDisplay();
    }

    private setActiveDisplayButton() {
        document.querySelectorAll('#map-controls button').forEach((elem: HTMLButtonElement) => elem.classList.toggle('active', elem.dataset.display == this.display));
    }

    public updateDisplay() {
        //document.getElementById('zoom-wrapper').style.height = `${document.getElementById('full-table').getBoundingClientRect().height}px`;
        
        const map = document.getElementById('map');
        const mapFrame = document.getElementById('map-frame');
        const mapFrameBR = mapFrame.getBoundingClientRect();
        const fullTable = document.getElementById('full-table');
        const scroll = this.display.startsWith('scroll');
       
        let spaceBeforeMap = mapFrameBR.top - document.body.getBoundingClientRect().top;
        let bgaZoom = 1;
        const bgaZoomStr = (document.getElementById('page-content').style as any).zoom;
        if (bgaZoomStr && bgaZoomStr !== '' && bgaZoomStr !== '1') {
            bgaZoom = Number(bgaZoomStr);
            spaceBeforeMap = document.getElementById('page-content').getBoundingClientRect().top * bgaZoom - document.body.getBoundingClientRect().top;
        }
        const playAreaViewportHeight = (window.innerHeight - spaceBeforeMap) / bgaZoom;
        mapFrame.style.maxHeight = `${playAreaViewportHeight}px`;
        document.getElementById('scroll-buttons').dataset.scroll = scroll.toString();
        fullTable.style.margin = '';
        fullTable.style.height = '';
        let zoom = 1;

        const mapWidth = Number(map.dataset.width);
        const mapHeight = Number(map.dataset.height);

        if (scroll) {
            fullTable.style.transform = '';
            const zoomFactor = Number(this.display.split('-')[1]);
            if (zoomFactor < 100) {
                this.mapZoom = zoomFactor / 100;
                const newMapWidth = mapWidth * this.mapZoom;
                const newMapHeight = Math.min(playAreaViewportHeight, mapHeight * this.mapZoom);
                map.style.transform = `scale(${this.mapZoom})`;
                map.style.maxHeight = `${newMapHeight}px`;
                map.style.width = `${newMapWidth}px`;
                map.style.height = `${newMapHeight}px`;
            } else {
                this.mapZoom = 1;
                map.style.transform = ``;
                map.style.maxHeight = ``;
                map.style.width = `${map.dataset.width}px`;
                map.style.height = `${map.dataset.height}px`;
            }
            mapFrame.style.height = ``;
            this.onMapFrameScroll();
        } else if (this.display === 'fit-map-and-board-to-screen-bis') {
            mapFrame.style.maxHeight = `${map.dataset.height}px`;

            this.mapZoom = 1;
            map.style.transform = ``;
            map.style.maxHeight = ``;
            map.style.width = `${map.dataset.width}px`;
            map.style.height = `${map.dataset.height}px`;

            zoom = Math.min(1, playAreaViewportHeight / (mapHeight + 20 + document.getElementsByClassName('player-table')[0].clientHeight),
                    mapFrame.clientWidth / mapWidth
                    );
        } else {

            const xScale = mapFrame.clientWidth / mapWidth;
            const yScale = playAreaViewportHeight / mapHeight;
            this.mapZoom = /*Math.max(0.1, */Math.min(1, Math.min(xScale, yScale))/*)*/;

            const newMapWidth = mapWidth * this.mapZoom;
            const newMapHeight = Math.min(playAreaViewportHeight, mapHeight * this.mapZoom);
            map.style.transform = `scale(${this.mapZoom})`;
            map.style.maxHeight = `${newMapHeight}px`;
            map.style.width = `${newMapWidth}px`;
            map.style.height = `${newMapHeight}px`;

            if (this.display === 'fit-map-and-board-to-screen') {
                zoom = Math.min(1, playAreaViewportHeight / (newMapHeight + 20 + document.getElementsByClassName('player-table')[0].clientHeight));
            }
        }
        
        if (zoom === 1) {
            fullTable.style.transform = '';
        } else {
            fullTable.style.transform = `scale(${zoom})`;
            fullTable.style.marginRight = `${-(fullTable.clientWidth / zoom - fullTable.clientWidth)}px`;
        }
        fullTable.style.height = `${fullTable.getBoundingClientRect().height}px`;

        document.documentElement.style.setProperty('--cumulative-scale', '' + this.mapZoom * this.zoom);
    }

    private scroll(direction: 'left' | 'right' | 'top' | 'bottom') {
        const scrollBy = 200;
        const mapFrame = document.getElementById('map-frame');
        const options: ScrollToOptions = {
            behavior: 'smooth',
        };
        switch(direction) {
            case 'left': options.left = -scrollBy; break;
            case 'right': options.left = scrollBy; break;
            case 'top': options.top = -scrollBy; break;
            case 'bottom': options.top = scrollBy; break;
        }
        mapFrame.scrollBy(options);
    }

    private onMapFrameScroll() {
        const mapFrame = document.getElementById('map-frame');
        document.getElementById(`scroll-left`).style.visibility = mapFrame.scrollLeft <= 0 ? 'hidden' : 'visible';
        document.getElementById(`scroll-right`).style.visibility = mapFrame.scrollLeft + mapFrame.clientWidth >= mapFrame.scrollWidth ? 'hidden' : 'visible';
        document.getElementById(`scroll-top`).style.visibility = mapFrame.scrollTop <= 0 ? 'hidden' : 'visible';
        document.getElementById(`scroll-bottom`).style.visibility = mapFrame.scrollTop + mapFrame.clientHeight >= mapFrame.scrollHeight ? 'hidden' : 'visible';
    }

    private setupPreferences() {
        // Extract the ID and value from the UI control
        const onchange = (e) => {
          var match = e.target.id.match(/^preference_[cf]ontrol_(\d+)$/);
          if (!match) {
            return;
          }
          var prefId = +match[1];
          var prefValue = +e.target.value;
          (this as any).prefs[prefId].value = prefValue;
          this.onPreferenceChange(prefId, prefValue);
        }
        
        // Call onPreferenceChange() when any value changes
        dojo.query(".preference_control").connect("onchange", onchange);
        
        // Call onPreferenceChange() now
        dojo.forEach(
          dojo.query("#ingame_menu_content .preference_control"),
          el => onchange({ target: el })
        );

        try {
            (document.getElementById('preference_control_299').closest(".preference_choice") as HTMLDivElement).style.display = 'none';
        } catch (e) {}
    }
      
    private onPreferenceChange(prefId: number, prefValue: number) {
        switch (prefId) {
            case 201: 
                (document.getElementsByTagName('html')[0] as HTMLHtmlElement).dataset.fillingPattern = (prefValue == 2).toString();
                break;
            case 299: 
                this.toggleZoomNotice(prefValue == 1);
                break;
        }
    }

    private getOrderedPlayers(gamedatas: LumenGamedatas) {
        const players = Object.values(gamedatas.players).sort((a, b) => a.playerNo - b.playerNo);
        const playerIndex = players.findIndex(player => Number(player.id) === Number((this as any).player_id));
        const orderedPlayers = playerIndex > 0 ? [...players.slice(playerIndex), ...players.slice(0, playerIndex)] : players;
        return orderedPlayers;
    }

    private getSeasonName(lumens: number) {
        switch (lumens) {
            case 1: return _('Winter');
            case 3: return _('Autumn');
            case 5: return _('Summer');
            case 7: return _('Spring');
        }
    }

    public getTerritoryTooltip(lumens: number) {
        return _('The ${season} Territories score ${lumens} Lumen. = ${lumens} VP per Territory you control.')
        .replace('${season}', this.getSeasonName(lumens))
        .replace(/\${lumens}/g, lumens);
    }

    private createPlayerPanels(gamedatas: LumenGamedatas) {

        Object.values(gamedatas.players).forEach(player => {
            const playerId = Number(player.id);   

            document.getElementById(`overall_player_board_${playerId}`).style.background = `#${player.color}`;  

            if (!gamedatas.isEnd) {
                // set hidden score
                const currentPlayer = playerId == this.getPlayerId();
                dojo.place(`<span class="hidden-score"> (+ ${currentPlayer ? `<span id="hidden-score-counter"></span>` : '?'})</span>`, `player_score_${playerId}`, 'after');
                if (currentPlayer) {
                    this.hiddenScoreCounter = new ebg.counter();
                    this.hiddenScoreCounter.create(`hidden-score-counter`);
                    this.hiddenScoreCounter.setValue(player.hiddenScore);
                }
            }

            let html = `
            <div class="counters">
                <div class="counters-title">${_('Controlled territories')}</div>
                <div class="counters-wrapper">`;
            [1,3,5,7].forEach(lumens => 
                html += `<div class="counter-wrapper" id="counter-wrapper-${player.id}-${lumens}" data-hidden="${(!this.scenario.battlefields.some(battlefield => BATTLEFIELDS[battlefield.battlefieldId].territories.some(territory => territory.id % 10 == lumens))).toString()}">
                    <div class="territory-img" data-lumens="${lumens}"></div><div id="controlled-territories-${player.id}-${lumens}" class="counter"></div>
                </div>`
            );
            html += `</div></div>
            <div class="grid">
                <div id="first-player-token-wrapper-${player.id}" class="first-player-token-wrapper"></div>
                <div id="bag-${player.id}" class="bag" data-color="${player.color}"><span id="bag-${player.id}-counter"></span></div>
            </div>
            `;
            dojo.place(html, `player_board_${player.id}`);
            if (gamedatas.firstPlayer == playerId) {
                dojo.place(`<div id="first-player-token" class="first-player-token"></div>`, `first-player-token-wrapper-${player.id}`);
            }

            this.bags[playerId] = new VoidStock<Card>(this.cardsManager, document.getElementById(`bag-${player.id}`));
            this.bagCounters[playerId] = new ebg.counter();
            this.bagCounters[playerId].create(`bag-${player.id}-counter`);
            this.bagCounters[playerId].setValue(gamedatas.remainingCardsInBag[playerId]);

            this.controlCounters[playerId] = {};
            [1,3,5,7].forEach(lumens => {
                this.controlCounters[playerId][lumens] = new ebg.counter();
                this.controlCounters[playerId][lumens].create(`controlled-territories-${player.id}-${lumens}`);
                this.controlCounters[playerId][lumens].setValue(player.controlCounters[lumens]);
            });

            [1,3,5,7].forEach(lumens => 
                this.setTooltip(`counter-wrapper-${player.id}-${lumens}`, this.getTerritoryTooltip(lumens))
            );
        });

        this.setTooltipToClass('bag', _('Bag of fighters (the number indicates the remaining card count)'));

        dojo.place(`
        <div id="overall_player_board_0" class="player-board current-player-board">					
            <div class="player_board_inner" id="player_board_inner_982fff">

            <div class="grid">
                <div></div>
                <div id="bag-0" class="bag"><span id="bag-0-counter"></span></div>
            </div>
               
            </div>
        </div>`, `player_boards`, 'first');
        this.bags[0] = new VoidStock<Card>(this.cardsManager, document.getElementById(`bag-0`));
        this.bagCounters[0] = new ebg.counter();
        this.bagCounters[0].create(`bag-${0}-counter`);
        this.bagCounters[0].setValue(gamedatas.remainingCardsInBag[0]);
    }

    private createPlayerTables(gamedatas: LumenGamedatas) {
        const orderedPlayers = this.getOrderedPlayers(gamedatas);

        orderedPlayers.forEach(player => 
            this.createPlayerTable(gamedatas, Number(player.id))
        );
    }

    private createPlayerTable(gamedatas: LumenGamedatas, playerId: number) {
        const table = new PlayerTable(this, gamedatas.players[playerId], gamedatas.firstPlayer == playerId ? gamedatas.firstPlayerOperation : 0);
        this.playersTables.push(table);
    }

    private setScenarioInformations() {
        const scenarioName = document.getElementById(`scenario-name`);
        const scenarioSynopsis = document.getElementById(`scenario-synopsis`);
        const scenarioSpecialRules = document.getElementById(`scenario-special-rules`);
        const scenarioObjectives = document.getElementById(`scenario-objectives`);
        scenarioName.innerHTML = `
            <div class="title">${this.scenario.title}</div>
            <div class="round">${_('Round:')} <span id="round-number-counter"></span>/17</div>
        `;
        this.roundNumberCounter = new ebg.counter();
        this.roundNumberCounter.create(`round-number-counter`);
        this.roundNumberCounter.setValue(this.gamedatas.roundNumber);

        scenarioSynopsis.innerHTML = this.scenario.synopsis;

        scenarioSpecialRules.innerHTML = `<div class="title">${_('Special rules')}</div>${this.scenario.specialRules.length ? 
            `<ul>${this.scenario.specialRules.map(text => `<li>${text}</li>`).join('')}</ul>` : 
            _('None')}`;

        scenarioObjectives.innerHTML = `<ul>${this.scenario.objectives.map(description => 
            `<li>
                <span id="objective-tokens-legend-${description.letters[0][0]}" class="objective-tokens-legend-wrapper">
                    ${description.visibleLetters.map(letter => `<div class="objective-description-token token-with-letter">${letter}
                        <div id="objective-tokens-legend-${letter == '' ? description.letters[0][0] : letter}-f28700" class="objective-tokens-legend" data-color="f28700"></div>
                        <div id="objective-tokens-legend-${letter == '' ? description.letters[0][0] : letter}-1f3067" class="objective-tokens-legend" data-color="1f3067"></div>
                    </div>`).join('')}
                    ${!description.visibleLetters.length || (description.visibleLetters.length === 1 && description.visibleLetters[0] === '') ? `
                        <div id="objective-tokens-legend-${description.letters[0][0]}-f28700" class="objective-tokens-legend" data-color="f28700"></div>
                        <div id="objective-tokens-legend-${description.letters[0][0]}-1f3067" class="objective-tokens-legend" data-color="1f3067"></div>
                    ` : ''}
                    
                </span>
                <strong>${description.timing ?? ''}</strong>
                <strong>${description.type ?? ''}</strong>
                ${description.text}
            </li>`
            ).join('')}</ul>`;
        if (this.gamedatas.scenario == 4) {
            scenarioObjectives.innerHTML = `<strong>${_('At the end of the game, check each island:')}</strong>` + scenarioObjectives.innerHTML;
            document.querySelector('.objective-description-token.token-with-letter:not(:empty)').classList.add('plus-one');
        }

        this.gamedatas.realizedObjectives.forEach(realizedObjective => this.markRealizedObjective(realizedObjective.letter, Number(realizedObjective.realizedBy)));
        

        document.getElementById(`dice`).style.left = `${this.scenario.diceLeft}px`;

        this.setTooltip(scenarioName.id, scenarioSynopsis.outerHTML + scenarioSpecialRules.outerHTML +  scenarioObjectives.outerHTML);
    }

    private addHelp() {
        dojo.place(`
            <button id="lumen-help-button">?</button>
        `, 'left-side');
        document.getElementById('lumen-help-button').addEventListener('click', () => this.showHelp());
    }

    private showHelp() {
        const helpDialog = new ebg.popindialog();
        helpDialog.create('lumenHelpDialog');
        helpDialog.setTitle(_("Card details").toUpperCase());

        const baseFighters = [1, 2, 3, 4, 5, 6].map(subType => `
        <div class="help-section">
            <div id="help-base-${subType}"></div>
            <div>${this.cardsManager.getTooltip(subType)}</div>
        </div>
        `).join('');

        const mercenaries = [11, 12, 13, 14, 15, 16, 17, 18].map(subType => `
        <div class="help-section">
            <div id="help-mercenaries-${subType}"></div>
            <div>${this.cardsManager.getTooltip(subType)}</div>
        </div>
        `).join('');

        const actions = [21, 22, 23].map(subType => `
        <div class="help-section">
            <div id="help-actions-${subType}"></div>
            <div>${this.cardsManager.getTooltip(subType)}</div>
        </div>
        `).join('');

        const missions = [31, 32, 33].map(subType => `
        <div class="help-section">
            <div id="help-missions-${subType}"></div>
            <div>${this.cardsManager.getTooltip(subType)}</div>
        </div>
        `).join('');

        const discoverTiles = `
        <div class="help-section">
            <div id="help-discover-tiles-1-1"></div>
            <div>${this.discoverTilesManager.getTooltip(1, 1)}</div>
        </div>
        ` + [1, 2, 3, 4, 5].map(subType => `
        <div class="help-section">
            <div id="help-discover-tiles-2-${subType}"></div>
            <div>${this.discoverTilesManager.getTooltip(2, subType)}</div>
        </div>
        `).join('');
        
        let html = `
        <div id="help-popin">
            <h1>${_("BASIC FIGHTERS")}</h1>
            ${baseFighters}
            <h1>${_("MERCENARY FIGHTERS")}</h1>
            <div>${_("When you receive a Mercenary Fighter during phase 2 Planning Orders, place it in the slot of your High Command area you just crossed off. This Mercenary Fighter is now part of your clan, and may be deployed during phase 3 Issuing Orders of the current turn or any future turn. When you deploy it to the Battlefield, a Clan marker is placed on it to indicate it belongs to you.")}</div>
            ${mercenaries}
            <h1>${_("GLOW ACTIONS")}</h1>
            <div>${_("When you receive a Glow Action token during phase 2 Planning Orders, place it in the slot of your High Command area you just crossed off. This token can now be used during phase 3 Issuing Orders of the current turn or any future turn.")}</div>
            ${actions}
            <h1>${_("SECRET MISSIONS")}</h1>
            <div>${_("When you receive a Secret Mission token during phase 2 Planning Orders, place it in the slot of your High Command area you just crossed off. At the end of the game, before final scoring, receive a number of Objective tokens based on the success of your Secret Missions.")}</div>
            ${missions}
            <h1>${_("DISCOVERY TOKENS")}</h1>
            <div>${_("When 1 of your Fighters moves into a Territory containing a face-down Discovery token, flip the token face up and apply its effects.")}</div>
            ${discoverTiles}
        </div>
        `;
        
        // Show the dialog
        helpDialog.setContent(html);

        helpDialog.show();

        const player1id = Number(Object.values(this.gamedatas.players).find(player => player.playerNo == 1).id);
        const player2id = Number(Object.values(this.gamedatas.players).find(player => player.playerNo == 2).id);

        // base
        [1, 2, 3, 4, 5, 6].forEach(subType => 
            new LineStock<Card>(this.cardsManager, document.getElementById(`help-base-${subType}`)).addCards([
                {id: 1000 + subType, type: 1, subType, playerId: player1id } as Card,
                {id: 2000 + subType, type: 1, subType, playerId: player2id } as Card,
            ])
        );
        // mercenaries
        [11, 12, 13, 14, 15, 16, 17, 18].forEach(subType => 
            new LineStock<Card>(this.cardsManager, document.getElementById(`help-mercenaries-${subType}`)).addCard(
                {id: 1000 + subType, type: 1, subType } as Card,
            )
        );
        // actions
        [21, 22, 23].forEach(subType => 
            new LineStock<Card>(this.cardsManager, document.getElementById(`help-actions-${subType}`)).addCard(
                {id: 1000 + subType, type: 1, subType } as Card,
            )
        );
        // missions
        [31, 32, 33].forEach(subType => 
            new LineStock<Card>(this.cardsManager, document.getElementById(`help-missions-${subType}`)).addCard(
                {id: 1000 + subType, type: 1, subType } as Card,
            )
        );
        // discover tiles
        new LineStock<DiscoverTile>(this.discoverTilesManager, document.getElementById(`help-discover-tiles-1-1`)).addCards([
            {id: 1003, type: 1, subType: 3 } as DiscoverTile,
            {id: 1004, type: 1, subType: 4 } as DiscoverTile,
            {id: 1005, type: 1, subType: 5 } as DiscoverTile,
        ]);
        
        [1, 2, 3, 4, 5].forEach(subType => 
            new LineStock<DiscoverTile>(this.discoverTilesManager, document.getElementById(`help-discover-tiles-2-${subType}`)).addCard(
                {id: 2000 + subType, type: 2, subType } as DiscoverTile,
            )
        );
    }

    private onPlanificationDiceSelection(color: string, value: number) {
        const oldSelectedButton = document.getElementById(`select-${color}-die-${this.selectedPlanificationDice[color]}-button`);
        const newSelectedButton = document.getElementById(`select-${color}-die-${value}-button`);
        this.selectedPlanificationDice[color] = value;

        oldSelectedButton?.classList.add('bgabutton_gray');
        oldSelectedButton?.classList.remove('bgabutton_blue');
        newSelectedButton?.classList.add('bgabutton_blue');
        newSelectedButton?.classList.remove('bgabutton_gray');

        dojo.toggleClass(`confirmSelectedPlanificationFaces-button`, 'disabled', isNaN(this.selectedPlanificationDice['white']) || isNaN(this.selectedPlanificationDice['black']));
    } 
    
    public operationClick(operation: number): void {
        switch (this.gamedatas.gamestate.name) {
            case 'chooseOperation':
                this.chooseOperation(operation);
                break;
        }
    }

    public cellClick(cell: number): void {
        switch (this.gamedatas.gamestate.name) {
            case 'chooseCell':
                this.chooseCell(cell);
                break;
            case 'chooseCellLink':
                this.chooseCellLink(cell);
                break;
            case 'chooseCellInterference':
                this.chooseCellInterference(cell);
                break;
        }
    }

    public territoryClick(id: number): void {
        switch (this.gamedatas.gamestate.name) {
            case 'chooseTerritory':
                this.chooseTerritory(id);
                break;
        }
    }
    
    public chooseFightersClick(card: Card): void {
        const args: EnteringChooseFighterArgs = this.gamedatas.gamestate.args;
        if (args.selectionSize == 1) {
            this.chooseFighters([card.id]);
        } else {
            const index = this.chosenFighters.indexOf(card.id);
            if (index == -1) {
                this.chosenFighters.push(card.id);
            } else {
                this.chosenFighters.splice(index, 1);
            }

            if (args.move == 21) {
                document.getElementById(`chooseFighters_button`).classList.toggle('disabled', this.chosenFighters.length > args.selectionSize);
            } else if (args.move == 23) {
                document.getElementById(`chooseFighters_button`).classList.toggle('disabled', this.chosenFighters.length !== args.selectionSize);
            }
        }
    }

    public activatePlanning() {
        if(!(this as any).checkAction('activatePlanning')) {
            return;
        }

        this.takeAction('activatePlanning');
    }

    public passPlanning() {
        if(!(this as any).checkAction('passPlanning')) {
            return;
        }

        this.takeAction('passPlanning');
    }

    
    public chooseDiceFaces() {
        if(!(this as any).checkAction('chooseDiceFaces')) {
            return;
        }

        this.takeAction('chooseDiceFaces', this.selectedPlanificationDice);
    }

    public chooseOperation(operation: number) {
        if(!(this as any).checkAction('chooseOperation')) {
            return;
        }

        this.takeAction('chooseOperation', {
            operation
        });
    }

    private cancelOperation() {
        if(!(this as any).checkAction('cancelOperation')) {
            return;
        }

        this.takeAction('cancelOperation');
    }

    private chooseCell(cell: number) {
        if(!(this as any).checkAction('chooseCell')) {
            return;
        }

        this.takeAction('chooseCell', {
            cell
        });
    }

    private chooseCellLink(cell: number) {
        if(!(this as any).checkAction('chooseCellLink')) {
            return;
        }

        this.takeAction('chooseCellLink', {
            cell
        });
    }

    private chooseCellInterference(cell: number) {
        if(!(this as any).checkAction('chooseCellInterference')) {
            return;
        }

        this.takeAction('chooseCellInterference', {
            cell
        });
    }

    private confirmCell() {
        if(!(this as any).checkAction('confirmCell')) {
            return;
        }

        this.takeAction('confirmCell');
    }

    private cancelCell() {
        if(!(this as any).checkAction('cancelCell')) {
            return;
        }

        this.takeAction('cancelCell');
    }

    public startWithAction(id: number) {
        if(!(this as any).checkAction('startWithAction')) {
            return;
        }

        this.takeAction('startWithAction', {
            id
        });
    }

    public playFighter(id: number) {
        if(!(this as any).checkAction('playFighter')) {
            return;
        }

        this.takeAction('playFighter', {
            id
        });
    }

    public moveFighter(id: number) {
        if(!(this as any).checkAction('moveFighter')) {
            return;
        }

        this.takeAction('moveFighter', {
            id
        });
    }

    public activateFighter(id: number) {
        if(!(this as any).checkAction('activateFighter')) {
            return;
        }

        this.takeAction('activateFighter', {
            id
        });
    }

    public chooseFighters(ids: number[], confirmed: boolean = false) {
        if(!(this as any).checkAction('chooseFighters')) {
            return;
        }

        const args: EnteringChooseFighterArgs = this.gamedatas.gamestate.args;
        if (!confirmed && args.move == 21 && this.chosenFighters.length < args.selectionSize) {
            (this as any).confirmationDialog(
                _("Are you sure you choose only ${selected} fighter(s) (max : ${max}) ?").replace('${selected}', this.chosenFighters.length).replace('${max}', args.selectionSize), 
                () => this.chooseFighters(ids, true)
            );
            return;
        }

        this.takeAction('chooseFighters', {
            ids: ids.join(',')
        });
    }

    public cancelChooseFighters() {
        if(!(this as any).checkAction('cancelChooseFighters')) {
            return;
        }

        this.takeAction('cancelChooseFighters');
    }

    public pass(shouldntPass: boolean) {
        if(!(this as any).checkAction('pass')) {
            return;
        }

        if (shouldntPass) {
            (this as any).confirmationDialog(
                _("Are you sure you want to pass? You have remaining action(s)"), 
                () => this.pass(false)
            );
            return;
        }

        this.takeAction('pass');
    }

    public chooseTerritory(id: number) {
        if(!(this as any).checkAction('chooseTerritory')) {
            return;
        }

        this.takeAction('chooseTerritory', {
            id
        });
    }

    public cancelChooseTerritory() {
        if(!(this as any).checkAction('cancelChooseTerritory')) {
            return;
        }

        this.takeAction('cancelChooseTerritory');
    }

    public passChooseFighters() {
        if(!(this as any).checkAction('passChooseFighters')) {
            return;
        }

        this.takeAction('passChooseFighters');
    }

    public useFoulPlay() {
        if(!(this as any).checkAction('useFoulPlay')) {
            return;
        }

        this.takeAction('useFoulPlay');
    }

    public cancelFoulPlay() {
        if(!(this as any).checkAction('cancelFoulPlay')) {
            return;
        }

        this.takeAction('cancelFoulPlay');
    }

    public takeAction(action: string, data?: any) {
        data = data || {};
        data.lock = true;
        (this as any).ajaxcall(`/lumen/lumen/${action}.html`, data, this, () => {});
    }

    ///////////////////////////////////////////////////
    //// Reaction to cometD notifications

    /*
        setupNotifications:

        In this method, you associate each of your game notifications with your local method to handle it.

        Note: game notification names correspond to "notifyAllPlayers" and "notifyPlayer" calls in
                your pylos.game.php file.

    */
    setupNotifications() {
        //log( 'notifications subscriptions setup' );

        const notifs = [
            ['diceRoll', 2000],
            ['diceChange', ANIMATION_MS],
            ['setPlayedOperation', ANIMATION_MS],
            ['setCancelledOperation', 1],
            ['setCircleValue', ANIMATION_MS],
            ['addCheck', 1],
            ['addHighCommandCard', ANIMATION_MS],
            ['zone', 1],
            ['link', 1],
            ['newFirstPlayer', ANIMATION_MS],
            ['takeObjectiveTokens', ANIMATION_MS],
            ['takeMissionObjectiveTokens', ANIMATION_MS * 2],
            ['moveFighter', ANIMATION_MS],
            ['refillReserve', ANIMATION_MS],
            ['moveDiscoverTileToPlayer', ANIMATION_MS],
            ['discardDiscoverTile', ANIMATION_MS],
            ['revealDiscoverTile', ANIMATION_MS],
            ['highlightDiscoverTile', ANIMATION_MS * 4],
            ['moveInitiativeMarker', ANIMATION_MS],
            ['putBackInBag', ANIMATION_MS],
            ['setFightersActivated', ANIMATION_MS],
            ['setFightersUnactivated', ANIMATION_MS],
            ['swappedFighters', ANIMATION_MS],
            ['score', 1],
            ['revealObjectiveTokens', ANIMATION_MS],
            ['endControlTerritory', 1 /*ANIMATION_MS * 2*/],
            ['updateControlCounters', 1],
            ['updateVisibleScore', 1],
            ['updateHiddenScore', 1],
            ['setRealizedObjective', 1],
            ['elimination', 1],
            ['doubleElimination', 1],
            ['resetBoard', 1],
        ];
    
        notifs.forEach((notif) => {
            dojo.subscribe(notif[0], this, `notif_${notif[0]}`);
            (this as any).notifqueue.setSynchronous(notif[0], notif[1]);
        });
        
        (this as any).notifqueue.setIgnoreNotificationCheck('takeObjectiveTokens', (notif: Notif<NotifObjectiveTokensArgs>) => {
            return notif.args.playerId == this.getPlayerId() && !notif.args.tokens[0].lumens;
        });
        (this as any).notifqueue.setIgnoreNotificationCheck('takeMissionObjectiveTokens', (notif: Notif<NotifTakeMissionObjectiveTokensArgs>) => {
            return notif.args.playerId == this.getPlayerId() && !notif.args.tokens[0].lumens;
        });
    }

    notif_diceRoll(notif: Notif<NotifDiceRollArgs>) {
        [1, 2].forEach(number => {
            let element = document.getElementById(`c_die_${number}`);
                        
            if (element != null) {
                element.className = "";
                void element.offsetWidth;
                element.classList.add("cube");  
                element.classList.add("show"+notif.args[`die${number}`]);        	 
            }
            
            element = document.getElementById(`d_die_${number}`);
            if (element != null) {
                element.classList.remove("roll0", "roll1","roll2", "roll3");
                void element.offsetWidth;
                element.classList.add("roll"+Math.floor(Math.random() * 4));     
            }
        });
    }

    notif_diceChange(notif: Notif<NotifDiceRollArgs>) {
        [1, 2].forEach(number => {
            const element = document.getElementById(`c_die_${number}`);
                        
            if (element != null) {
                element.className = "";
                void element.offsetWidth;
                element.classList.add("cube");  
                element.classList.add("show"+notif.args[`die${number}`]);        	 
            }
        });
    }

    notif_setPlayedOperation(notif: Notif<NotifSetPlayedOperationArgs>) {
        this.getPlayerTable(notif.args.playerId).setPlayedOperation(notif.args.type, notif.args.operationsNumber, notif.args.firstPlayer);
    } 

    notif_setCancelledOperation(notif: Notif<NotifSetPlayedOperationArgs>) {
        this.getPlayerTable(notif.args.playerId).setCancelledOperation(notif.args.type, notif.args.operationsNumber, notif.args.firstPlayer);
    } 

    notif_setCircleValue(notif: Notif<NotifSetCircleValueArgs>) {
        this.getPlayerTable(notif.args.playerId).setCircleValue(notif.args.circleId, notif.args.value);
    } 

    notif_addCheck(notif: Notif<NotifAddCheckArgs>) {
        this.getPlayerTable(notif.args.playerId).addCheck(notif.args.checks);
    } 

    notif_addHighCommandCard(notif: Notif<NotifAddHighCommandCardArgs>) {
        this.getPlayerTable(notif.args.playerId).addHighCommandCard(notif.args.card);      
        this.bagCounters[0].incValue(-1);
    }

    notif_zone(notif: Notif<NotifZoneArgs>) {
        this.getPlayerTable(notif.args.playerId).setZone(notif.args.circlesIds, notif.args.zoneId);
    }

    notif_link(notif: Notif<NotifLinkArgs>) {
        this.getPlayerTable(notif.args.playerId).setLink(notif.args.index1, notif.args.index2);
    }

    notif_newFirstPlayer(notif: Notif<NotifNewFirstPlayerArgs>) {
        const firstPlayerToken = document.getElementById('first-player-token');
        const destinationId = `first-player-token-wrapper-${notif.args.playerId}`;
        const originId = firstPlayerToken.parentElement.id;
        if (destinationId !== originId) {
            this.animationManager.attachWithSlideAnimation(
                firstPlayerToken,
                document.getElementById(destinationId),
                { zoom: 1 },
            );
        }
    } 

    notif_takeObjectiveTokens(notif: Notif<NotifObjectiveTokensArgs>) {

        const playerId = notif.args.playerId;

        this.getPlayerTable(playerId).addObjectiveTokens(notif.args.tokens);

        if (notif.args.letterId) {
            document.getElementById(`objective-token-${notif.args.letterId}`)?.remove();
        }
    }

    notif_takeMissionObjectiveTokens(notif: Notif<NotifTakeMissionObjectiveTokensArgs>) {
        this.cardsManager.getCardElement(notif.args.highlightCard)?.classList.add('highlight');
        this.notif_takeObjectiveTokens(notif);
    }

    notif_moveFighter(notif: Notif<NotifMoveFighterArgs>) {
        this.tableCenter.moveFighter(notif.args.fighter, notif.args.territoryId, notif.args.fromBag);
    }

    notif_refillReserve(notif: Notif<NotifRefillReserveArgs>) {
        const card = notif.args.fighter;
        const playerId = notif.args.playerId;
        this.getPlayerTable(playerId).refillReserve(card, notif.args.slot);        
        this.bagCounters[playerId].incValue(-1);
    }

    notif_moveDiscoverTileToPlayer(notif: Notif<NotifMoveDiscoverTileToPlayerArgs>) {
        this.getPlayerTable(notif.args.playerId).addDiscoverTile(notif.args.discoverTile);
    }

    notif_discardDiscoverTile(notif: Notif<NotifDiscardDiscoverTileArgs>) {
        const stock = this.discoverTilesManager.getCardStock(notif.args.discoverTile);

        if (stock) {
            stock.removeCard(notif.args.discoverTile);
        } else {
            const element = this.discoverTilesManager.getCardElement(notif.args.discoverTile);
            element.remove();
        }
    }

    notif_revealDiscoverTile(notif: Notif<NotifRevealDiscoverTileArgs>) {
        this.tableCenter.revealDiscoverTile(notif.args.discoverTile);
    }

    notif_highlightDiscoverTile(notif: Notif<NotifRevealDiscoverTileArgs>) {
        this.tableCenter.highlightDiscoverTile(notif.args.discoverTile);
    }

    notif_moveInitiativeMarker(notif: Notif<NotifMoveInitiativeMarkerArgs>) {
        this.tableCenter.moveInitiativeMarker(notif.args.territoryId);
    }

    notif_putBackInBag(notif: Notif<NotifPutBackInBagArgs>) {
        notif.args.fighters.forEach(card => {
            this.bags[card.type == 1 ? card.playerId : 0].addCard(card);
            this.bagCounters[card.type == 1 ? card.playerId : 0].incValue(1);
        });
    }
    
    private setFightersActivated(fighters: Card[], activated: boolean) {
        fighters.forEach(card => this.tableCenter.setFightersActivated(card, activated));
    }

    notif_setFightersActivated(notif: Notif<NotifSetFightersActivatedArgs>) {
        this.setFightersActivated(notif.args.fighters, true);        
    }

    notif_setFightersUnactivated(notif: Notif<NotifSetFightersActivatedArgs>) {
        this.setFightersActivated(notif.args.fighters, false);
    }

    notif_swappedFighters(notif: Notif<NotifSetFightersActivatedArgs>) {
        const card0 = notif.args.fighters[0];
        const card1 = notif.args.fighters[1];
        const stock0 = this.cardsManager.getCardStock(card0);
        const stock1 = this.cardsManager.getCardStock(card1);
        stock1.addCard(card0);
        stock0.addCard(card1);
    }

    private incFinalScore(playerId: number, incScore: number) {
        const scoreDiv = document.getElementById(`score-final-${playerId}`);
        scoreDiv.innerHTML = `${Number(scoreDiv.innerHTML) + incScore}`;
    }

    notif_score(notif: Notif<NotifScoreArgs>) {
        const playerId = notif.args.playerId;
        const incScore = notif.args.incScore;
        (this as any).scoreCtrl[playerId]?.toValue(notif.args.newScore);
        if (Number(this.gamedatas.gamestate.id) >= 90) { // score or end
            if (notif.args.scoreType === 'endControlTerritory') {
                const scoreDiv = document.getElementById(`score-controlled-territories-${playerId}`);
                const scoreTerritoryDiv = document.getElementById(`score-controlled-territories-${playerId}-${notif.args.lumens}`);

                scoreDiv.innerHTML = `${Number(scoreDiv.innerHTML) + incScore}`;
                scoreTerritoryDiv.innerHTML = `${Number(scoreTerritoryDiv.innerHTML) + incScore}`;
                this.incFinalScore(playerId, incScore);
            } else if (notif.args.scoreType === 'discoverTiles') {
                const scoreDiv = document.getElementById(`score-discover-tiles-${playerId}`);
                scoreDiv.innerHTML = `${Number(scoreDiv.innerHTML) + incScore}`;
                this.incFinalScore(playerId, incScore);
            } else if (notif.args.scoreType === 'objectiveTokens') {
                const scoreDiv = document.getElementById(`score-objective-tokens-${playerId}`);
                scoreDiv.innerHTML = `${Number(scoreDiv.innerHTML) + incScore}`;
                this.incFinalScore(playerId, incScore);
            }
        }
    }

    notif_endControlTerritory(notif: Notif<NotifEndControlTerritoryArgs>) {
        const playerId = notif.args.playerId;
        const incScore = notif.args.incScore;
        //document.getElementById(`territory-mask-${notif.args.territoryId}`)?.classList.add('highlight');
        if (playerId) {
            (this as any).displayScoring(`territory-${notif.args.territoryId}`, this.getPlayerColor(playerId), incScore, ANIMATION_MS * 2);
        }
        this.notif_score(notif);
    }

    notif_revealObjectiveTokens(notif: Notif<NotifObjectiveTokensArgs>) {
        this.getPlayerTable(notif.args.playerId).revealObjectiveTokens(notif.args.tokens);
    }

    notif_updateControlCounters(notif: Notif<NotifUpdateControlCountersArgs>) {
        Object.keys(notif.args.counters).forEach(key => {
            const playerCounters = notif.args.counters[key];
            [1, 3, 5, 7].forEach(lumens => this.controlCounters[key][lumens].toValue(playerCounters[lumens]))
        });
    }

    notif_updateVisibleScore(notif: Notif<NotifUpdateScoreArgs>) {
        (this as any).scoreCtrl[notif.args.playerId]?.toValue(notif.args.score);
    }

    notif_updateHiddenScore(notif: Notif<NotifUpdateScoreArgs>) {
        this.hiddenScoreCounter.toValue(notif.args.score);
    }

    notif_setRealizedObjective(notif: Notif<NotifSetRealizedObjectiveArgs>) {
        this.markRealizedObjective(notif.args.letter, notif.args.realizedBy);
    }

    notif_elimination(notif: Notif<any>) {
        (this as any).scoreCtrl[notif.args.playerId]?.toValue(0);
        (this as any).scoreCtrl[notif.args.opponentId]?.toValue(1);
    }

    notif_doubleElimination() {
        Object.keys(this.gamedatas.players).forEach(playerId => (this as any).scoreCtrl[playerId]?.toValue(0));
    }

    notif_resetBoard(notif: Notif<NotifResetBoardArgs>) {
        this.getPlayerTable(notif.args.playerId).resetBoard(notif.args.circles, notif.args.links);
    }

    private markRealizedObjective(letter: string, realizedBy: number) {
        const color = this.getPlayerColor(realizedBy);
        const div = document.getElementById(`objective-tokens-legend-${letter[0]}-${color}`);
        if (div) {
            div.insertAdjacentHTML('beforeend', `
                <div class="player-token" data-color="${color}"></div>
            `);
        } else {
            console.warn('no objective marker for', letter[0], color);
        }
    }

    private seasonToLumens(season: string) {        
        switch (season) {
            case 'Winter': return 1;
            case 'Autumn': return 3;
            case 'Summer': return 5;
            case 'Spring': return 7;
        }
    }

    /* This enable to inject translatable styled things to logs or action bar */
    /* @Override */
    public format_string_recursive(log: string, args: any) {
        try {
            if (log && args && !args.processed) {
                if (args.whiteDieFace !== undefined && args.whiteDieFace[0] != '<') {
                    args.whiteDieFace = `<div class="die-icon" data-color="white">${args.whiteDieFace}</div>`;
                }
                if (args.blackDieFace !== undefined && args.blackDieFace[0] != '<') {
                    args.blackDieFace = `<div class="die-icon" data-color="black">${args.blackDieFace}</div>`;
                }
                if (args.operation && args.operation[0] != '<') {
                    args.operation = `<div class="operation-icon" data-type="${args.operation}"></div>`;
                }

                if (args.discover_tile == '' && args.discoverTile) {
                    args.discover_tile = `<div class="discover-tile" data-type="${args.discoverTile.type}" data-sub-type="${args.discoverTile.subType}"></div>`;
                }

                ['season', 'originSeason'].forEach(field => {
                    if (args[field] !== null && args[field] !== undefined && args[field][0] != '<') {
                        args[field] = `<div class="territory-img" data-lumens="${this.seasonToLumens(args[field])}"></div> ${_(args[field])}`;
                    }
                });

                ['fighterType', 'fighterType2', 'fighterType3'].forEach(field => {
                    const fighter: Card = args[field.replace('Type', '')];
                    if (args[field] !== null && args[field] !== undefined && args[field][0] != '<' && fighter !== null) {
                        args[field] = `<div class="fighter" data-color="${this.getPlayerColor(fighter.playerId)}" data-sub-type="${fighter.subType}"></div>`;
                    }
                });

                ['cardinalDirection'].forEach(field => {
                    if (args[field] !== null && args[field] !== undefined && args[field][0] != '<') {
                        args[field] = `<strong>${_(args[field])}</strong>`;
                    }
                });

            }
        } catch (e) {
            console.error(log,args,"Exception thrown", e.stack);
        }
        return (this as any).inherited(arguments);
    }
}