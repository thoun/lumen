declare const define;
declare const ebg;
declare const $;
declare const dojo: Dojo;
declare const _;
declare const g_gamethemeurl;

const ANIMATION_MS = 500;
const ACTION_TIMER_DURATION = 5;

const ZOOM_LEVELS = [0.5, 0.625, 0.75, 0.875, 1];
const ZOOM_LEVELS_MARGIN = [-100, -60, -33, -14, 0];
const LOCAL_STORAGE_ZOOM_KEY = 'Lumen-zoom';

class Lumen implements LumenGame {
    public zoom: number = 1;
    public cards: CardsManager;
    public discoverTiles: DiscoverTilesManager;

    private gamedatas: LumenGamedatas;
    private tableCenter: TableCenter;
    private playersTables: PlayerTable[] = [];
    private selectedPlanificationDice: { [color: string]: number } = {};
    
    private TOOLTIP_DELAY = document.body.classList.contains('touch-device') ? 1500 : undefined;

    constructor() {
        const zoomStr = localStorage.getItem(LOCAL_STORAGE_ZOOM_KEY);
        if (zoomStr) {
            this.zoom = Number(zoomStr);
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

        this.cards = new CardsManager(this);
        this.discoverTiles = new DiscoverTilesManager(this);
        this.tableCenter = new TableCenter(this, this.gamedatas);
        this.createPlayerPanels(gamedatas);
        this.createPlayerTables(gamedatas);

        this.setupNotifications();
        this.setupPreferences();
        this.addHelp();

        document.getElementById('zoom-out').addEventListener('click', () => this.zoomOut());
        document.getElementById('zoom-in').addEventListener('click', () => this.zoomIn());
        if (this.zoom !== 1) {
            this.setZoom(this.zoom);
        }

        (this as any).onScreenWidthChange = () => {
            this.updateTableHeight();
        };

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
            case 'chooseOperation':
                this.onEnteringChooseOperation(args.args);
                break;
            case 'chooseCell':
                this.onEnteringChooseCell(args.args);
                break;
            case 'chooseCellLink':
                this.onEnteringChooseCellLink(args.args);
                break;
            case 'chooseFighter':
                this.onEnteringChooseFighter(args.args);
                break;   
            case 'chooseTerritory':
                this.onEnteringChooseTerritory(args.args);
                break;                
        }
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
    
    private onEnteringChooseFighter(args: EnteringChooseFighterArgs) {
        if (!args.move) {
            if (!args.remainingMoves) {
                this.setGamestateDescription('OnlyPlay');
            } else if (!args.remainingPlays) {
                this.setGamestateDescription('OnlyMoveActivate');
            }

            const subTitle = document.createElement('span');
            let texts = [];
            if (args.remainingPlays) {
                texts.push(_('${remainingPlays} fighters to add').replace('${remainingPlays}', args.remainingPlays));
            }
            if (args.remainingMoves) {
                texts.push(_('${remainingMoves} moves/activations').replace('${remainingMoves}', args.remainingMoves));
            }
            if (args.remainingBonusMoves) {
                texts.push(_('${remainingBonusMoves} moves/activations with Coup fourré').replace('${remainingBonusMoves}', args.remainingBonusMoves)); // TODO translate
            }
            subTitle.classList.add('subtitle');
            subTitle.innerHTML = '(' + texts.join(', ') + ')';
            document.getElementById(`pagemaintitletext`).appendChild(document.createElement('br'));
            document.getElementById(`pagemaintitletext`).appendChild(subTitle);
        }
    }

    private onEnteringChooseTerritory(args: EnteringChooseTerritoryArgs) {
        this.setGamestateDescription(''+args.move);
    }

    public onLeavingState(stateName: string) {
        log( 'Leaving state: '+stateName );

        switch (stateName) {
            case 'planificationChooseFaces':
                this.onLeavingPlanificationChooseFaces();
                break;
            case 'chooseOperation':
                this.onLeavingGhostMark('operation-number');
                break;
            case 'chooseCell':
                this.onLeavingGhostMark('circle');
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

    // onUpdateActionButtons: in this method you can manage "action buttons" that are displayed in the
    //                        action status bar (ie: the HTML links in the status bar).
    //
    public onUpdateActionButtons(stateName: string, args: any) {
        if ((this as any).isCurrentPlayerActive()) {
            switch (stateName) {
                case 'askActivatePlanification':
                    (this as any).addActionButton(`activatePlanification_button`, _('Activate'), () => this.activatePlanification());
                    (this as any).addActionButton(`passPlanification_button`, _('Pass'), () => this.passPlanification());
                    break;
                case 'planificationChooseFaces':
                    this.onEnteringPlanificationChooseFaces();
                    break;
                case 'chooseOperation':
                    const chooseOperationArgs = args as EnteringChooseOperationArgs;
                    Object.keys(chooseOperationArgs.operations).forEach((type: any) => {
                        const operation = chooseOperationArgs.operations[type];
                        (this as any).addActionButton(`chooseOperation${type}_button`, `<div class="operation-icon" data-type="${type}"></div> ${operation.value}`, () => this.chooseOperation(type), null, null, 'gray');
                        if (!operation.possible) {
                            document.getElementById(`chooseOperation${type}_button`).classList.add('disabled');
                        }    
                    });
                    break;
                case 'chooseCell':
                    (this as any).addActionButton(`cancelOperation_button`, _('Cancel'), () => this.cancelOperation(), null, null, 'gray');
                    break;
                case 'chooseFighter':
                    const chooseFighterArgs = args as EnteringChooseFighterArgs;
                    if (!chooseFighterArgs.move) {
                        const shouldntPass = chooseFighterArgs.remainingPlays > 0 || chooseFighterArgs.remainingMoves > 0;
                        (this as any).addActionButton(`cancelOperation_button`, _('Pass'), () => this.pass(shouldntPass), null, null, shouldntPass ? 'gray' : undefined);
                    }
                    break;
                /*case 'chooseTerritory':
                    // TODO TEMP
                    const chooseTerritoryArgs = args as EnteringChooseTerritoryArgs;
                    chooseTerritoryArgs.territoriesIds.forEach(territoryId => 
                    (this as any).addActionButton(`chooseTerritory${territoryId}_button`, `territory ${territoryId}`, () => this.chooseTerritory(territoryId))
                    )
                    break;*/
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

    private getPlayer(playerId: number): LumenPlayer {
        return Object.values(this.gamedatas.players).find(player => Number(player.id) == playerId);
    }

    private getPlayerTable(playerId: number): PlayerTable {
        return this.playersTables.find(playerTable => playerTable.playerId === playerId);
    }

    private getCurrentPlayerTable(): PlayerTable | null {
        return this.playersTables.find(playerTable => playerTable.playerId === this.getPlayerId());
    }

    private setZoom(zoom: number = 1) {
        this.zoom = zoom;
        localStorage.setItem(LOCAL_STORAGE_ZOOM_KEY, ''+this.zoom);
        const newIndex = ZOOM_LEVELS.indexOf(this.zoom);
        dojo.toggleClass('zoom-in', 'disabled', newIndex === ZOOM_LEVELS.length - 1);
        dojo.toggleClass('zoom-out', 'disabled', newIndex === 0);

        const div = document.getElementById('full-table');
        if (zoom === 1) {
            div.style.transform = '';
            div.style.margin = '';
        } else {
            div.style.transform = `scale(${zoom})`;
            div.style.marginRight = `${ZOOM_LEVELS_MARGIN[newIndex]}%`;
        }

        this.updateTableHeight();
    }

    public zoomIn() {
        if (this.zoom === ZOOM_LEVELS[ZOOM_LEVELS.length - 1]) {
            return;
        }
        const newIndex = ZOOM_LEVELS.indexOf(this.zoom) + 1;
        this.setZoom(ZOOM_LEVELS[newIndex]);
    }

    public zoomOut() {
        if (this.zoom === ZOOM_LEVELS[0]) {
            return;
        }
        const newIndex = ZOOM_LEVELS.indexOf(this.zoom) - 1;
        this.setZoom(ZOOM_LEVELS[newIndex]);
    }

    public updateTableHeight() {
        setTimeout(() => document.getElementById('zoom-wrapper').style.height = `${document.getElementById('full-table').getBoundingClientRect().height}px`, 600);
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
    }
      
    private onPreferenceChange(prefId: number, prefValue: number) {
        switch (prefId) {
            case 200: 
                (document.getElementsByTagName('html')[0] as HTMLHtmlElement).dataset.fillingPattern = (prefValue == 2).toString();
                break;
        }
    }

    private getOrderedPlayers(gamedatas: LumenGamedatas) {
        const players = Object.values(gamedatas.players).sort((a, b) => a.playerNo - b.playerNo);
        const playerIndex = players.findIndex(player => Number(player.id) === Number((this as any).player_id));
        const orderedPlayers = playerIndex > 0 ? [...players.slice(playerIndex), ...players.slice(0, playerIndex)] : players;
        return orderedPlayers;
    }

    private createPlayerPanels(gamedatas: LumenGamedatas) {

        Object.values(gamedatas.players).forEach(player => {
            const playerId = Number(player.id);   

            document.getElementById(`overall_player_board_${playerId}`).style.background = `#${player.color}`;

            /*// hand cards counter
            dojo.place(`<div class="counters">
                <div id="playerhand-counter-wrapper-${player.id}" class="playerhand-counter">
                    <div class="player-hand-card"></div> 
                    <span id="playerhand-counter-${player.id}"></span>
                </div>
            </div>`, `player_board_${player.id}`);

            const handCounter = new ebg.counter();
            handCounter.create(`playerhand-counter-${playerId}`);
            //handCounter.setValue(player.handCards.length);
            this.handCounters[playerId] = handCounter;*/

            dojo.place(`<div id="first-player-token-wrapper-${player.id}" class="first-player-token-wrapper"></div>`, `player_board_${player.id}`);
            if (gamedatas.firstPlayer == playerId) {
                dojo.place(`<div id="first-player-token"></div>`, `first-player-token-wrapper-${player.id}`);
            }
        });

        //this.setTooltipToClass('playerhand-counter', _('Number of cards in hand'));
    }

    private createPlayerTables(gamedatas: LumenGamedatas) {
        const orderedPlayers = this.getOrderedPlayers(gamedatas);

        orderedPlayers.forEach(player => 
            this.createPlayerTable(gamedatas, Number(player.id))
        );
    }

    private createPlayerTable(gamedatas: LumenGamedatas, playerId: number) {
        const table = new PlayerTable(this, gamedatas.players[playerId]);
        this.playersTables.push(table);
    }
    
    public onCardClick(card: Card): void {
        const cardDiv = document.getElementById(`card-${card.id}`);
        const parentDiv = cardDiv.parentElement;

        if (cardDiv.classList.contains('disabled')) {
            return;
        }

        switch (this.gamedatas.gamestate.name) {
            /*case 'takeCards':
                if (parentDiv.dataset.discard) {
                    this.takeCardFromDiscard(Number(parentDiv.dataset.discard));
                }
                break;
            case 'chooseCard':
                if (parentDiv.id == 'pick') {
                    this.chooseCard(card.id);
                }
                break;
            case 'playCards':
                if (parentDiv.dataset.myHand == `true`) {
                    if (this.selectedCards.includes(card.id)) {
                        this.selectedCards.splice(this.selectedCards.indexOf(card.id), 1);
                        cardDiv.classList.remove('selected');
                    } else {
                        this.selectedCards.push(card.id);
                        cardDiv.classList.add('selected');
                    }
                    this.updateDisabledPlayCards();
                }
                break;
            case 'chooseDiscardCard':
                if (parentDiv.id == 'discard-pick') {
                    this.chooseDiscardCard(card.id);
                }
                break;
            case 'chooseOpponent':
                const chooseOpponentArgs = this.gamedatas.gamestate.args as EnteringChooseOpponentArgs;
                if (parentDiv.dataset.currentPlayer == 'false') {
                    const stealPlayerId = Number(parentDiv.dataset.playerId);
                    if (chooseOpponentArgs.playersIds.includes(stealPlayerId)) {
                        this.chooseOpponent(stealPlayerId);
                    }
                }
                break;*/
        }
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

        const duoCards = [1, 2, 3].map(family => `
        <div class="help-section">
            <div id="help-pair-${family}"></div>
            <div>${this.cards.getTooltip(2, family)}</div>
        </div>
        `).join('');

        const duoSection = `
        ${duoCards}
        <div class="help-section">
            <div id="help-pair-4"></div>
            <div id="help-pair-5"></div>
            <div>${this.cards.getTooltip(2, 4)}</div>
        </div>
        ${_("Note: The points for duo cards count whether the cards have been played or not. However, the effect is only applied when the player places the two cards in front of them.")}`;

        const mermaidSection = `
        <div class="help-section">
            <div id="help-mermaid"></div>
            <div>${this.cards.getTooltip(1)}</div>
        </div>`;

        const collectorSection = [1, 2, 3, 4].map(family => `
        <div class="help-section">
            <div id="help-collector-${family}"></div>
            <div>${this.cards.getTooltip(3, family)}</div>
        </div>
        `).join('');

        const multiplierSection = [1, 2, 3, 4].map(family => `
        <div class="help-section">
            <div id="help-multiplier-${family}"></div>
            <div>${this.cards.getTooltip(4, family)}</div>
        </div>
        `).join('');
        
        let html = `
        <div id="help-popin">
            ${_("<strong>Important:</strong> When it is said that the player counts or scores the points on their cards, it means both those in their hand and those in front of them.")}

            <h1>${_("Duo cards")}</h1>
            ${duoSection}
            <h1>${_("Mermaid cards")}</h1>
            ${mermaidSection}
            <h1>${_("Collector cards")}</h1>
            ${collectorSection}
            <h1>${_("Point Multiplier cards")}</h1>
            ${multiplierSection}
        </div>
        `;
        
        // Show the dialog
        helpDialog.setContent(html);

        helpDialog.show();

        // pair
        [[1, 1], [2, 2], [3, 3], [4, 4], [5, 5]].forEach(([family, color]) => this.cards.createMoveOrUpdateCard({id: 1020 + family, category: 2, family, color, index: 0 } as any, `help-pair-${family}`));
        // mermaid
        this.cards.createMoveOrUpdateCard({id: 1010, category: 1 } as any, `help-mermaid`);
        // collector
        [[1, 1], [2, 2], [3, 6], [4, 9]].forEach(([family, color]) => this.cards.createMoveOrUpdateCard({id: 1030 + family, category: 3, family, color, index: 0 } as any, `help-collector-${family}`));
        // multiplier
        [1, 2, 3, 4].forEach(family => this.cards.createMoveOrUpdateCard({id: 1040 + family, category: 4, family } as any, `help-multiplier-${family}`));
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

    public cellClick(cell: number) {
        switch (this.gamedatas.gamestate.name) {
            case 'chooseCell':
                this.chooseCell(cell);
                break;
            case 'chooseCellLink':
                this.chooseCellLink(cell);
                break;
            case 'chooseCellBrouillage':
                this.chooseCellBrouillage(cell);
                break;
        }
    }

    public  territoryClick(id: number): void {
        switch (this.gamedatas.gamestate.name) {
            case 'chooseTerritory':
                this.chooseTerritory(id);
                break;
        }
    }

    public activatePlanification() {
        if(!(this as any).checkAction('activatePlanification')) {
            return;
        }

        this.takeAction('activatePlanification');
    }

    public passPlanification() {
        if(!(this as any).checkAction('passPlanification')) {
            return;
        }

        this.takeAction('passPlanification');
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

    private chooseCellBrouillage(cell: number) {
        if(!(this as any).checkAction('chooseCellBrouillage')) {
            return;
        }

        this.takeAction('chooseCellBrouillage', {
            cell
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

    public chooseFighters(ids: number[]) {
        if(!(this as any).checkAction('chooseFighters')) {
            return;
        }

        this.takeAction('chooseFighters', {
            ids: ids.join(',')
        });
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
            ['takeObjectiveToken', ANIMATION_MS],
            ['moveFighter', ANIMATION_MS],
            ['refillReserve', ANIMATION_MS],
            ['moveDiscoverTileToPlayer', ANIMATION_MS],
            ['discardDiscoverTile', ANIMATION_MS],
            ['revealDiscoverTile', ANIMATION_MS],
            ['moveInitiativeMarker', ANIMATION_MS],
            ['putBackInBag', ANIMATION_MS],
            ['setFightersActivated', ANIMATION_MS],
            ['setFightersUnactivated', ANIMATION_MS],
            ['exchangedFighters', ANIMATION_MS],
        ];
    
        notifs.forEach((notif) => {
            dojo.subscribe(notif[0], this, `notif_${notif[0]}`);
            (this as any).notifqueue.setSynchronous(notif[0], notif[1]);
        });
        
        (this as any).notifqueue.setIgnoreNotificationCheck('takeObjectiveToken', (notif: Notif<NotifTakeObjectiveTokenArgs>) => 
            notif.args.playerId == this.getPlayerId() && !notif.args.value
        );
    }

    notif_diceRoll(notif: Notif<NotifDiceRollArgs>) {
        [1, 2].forEach(number => {
            var element = document.getElementById(`c_die_${number}`);
                        
            if (element != null) {
                element.className = "";
                void element.offsetWidth;
                element.classList.add("cube");  
                element.classList.add("show"+notif.args[`die${number}`]);        	 
            }
            
            var element = document.getElementById(`d_die_${number}`);
            if (element != null) {
                element.classList.remove("roll0", "roll1","roll2", "roll3");
                void element.offsetWidth;
                element.classList.add("roll"+Math.floor(Math.random() * 4));     
            }
        });
    }

    notif_diceChange(notif: Notif<NotifDiceRollArgs>) {
        [1, 2].forEach(number => {
            var element = document.getElementById(`c_die_${number}`);
                        
            if (element != null) {
                element.className = "";
                void element.offsetWidth;
                element.classList.add("cube");  
                element.classList.add("show"+notif.args[`die${number}`]);        	 
            }
        });
    }

    notif_setPlayedOperation(notif: Notif<NotifSetPlayedOperationArgs>) {
        this.getPlayerTable(notif.args.playerId).setPlayedOperation(notif.args.type, notif.args.number, notif.args.firstPlayer);
    } 

    notif_setCancelledOperation(notif: Notif<NotifSetPlayedOperationArgs>) {
        this.getPlayerTable(notif.args.playerId).setCancelledOperation(notif.args.type, notif.args.number);
    } 

    notif_setCircleValue(notif: Notif<NotifSetCircleValueArgs>) {
        this.getPlayerTable(notif.args.playerId).setCircleValue(notif.args.circleId, notif.args.value);
    } 

    notif_addCheck(notif: Notif<NotifAddCheckArgs>) {
        this.getPlayerTable(notif.args.playerId).addCheck(notif.args.checks);
    } 

    notif_addHighCommandCard(notif: Notif<NotifAddHighCommandCardArgs>) {
        this.getPlayerTable(notif.args.playerId).addHighCommandCard(notif.args.card);
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
            document.getElementById(destinationId).appendChild(firstPlayerToken);
            stockSlideAnimation({
                element: firstPlayerToken,
                fromElement: document.getElementById(originId),
            });
        }
    } 

    notif_takeObjectiveToken(notif: Notif<NotifTakeObjectiveTokenArgs>) {
        // TODO check if value
    }

    notif_moveFighter(notif: Notif<NotifMoveFighterArgs>) {
        this.tableCenter.moveFighter(notif.args.fighter, notif.args.territoryId);
    }

    notif_refillReserve(notif: Notif<NotifRefillReserveArgs>) {
        this.getPlayerTable(notif.args.playerId).refillReserve(notif.args.fighter, notif.args.slot);
    }

    notif_moveDiscoverTileToPlayer(notif: Notif<NotifMoveDiscoverTileToPlayerArgs>) {
        // TODO
    }

    notif_discardDiscoverTile(notif: Notif<NotifDiscardDiscoverTileArgs>) {
        // TODO
    }

    notif_revealDiscoverTile(notif: Notif<NotifRevealDiscoverTileArgs>) {
        // TODO
    }

    notif_moveInitiativeMarker(notif: Notif<NotifMoveInitiativeMarkerArgs>) {
        // TODO
    }

    notif_putBackInBag(notif: Notif<NotifPutBackInBagArgs>) {
        // TODO
    }

    notif_setFightersActivated(notif: Notif<NotifSetFightersActivatedArgs>) {
        // TODO
    }

    notif_setFightersUnactivated(notif: Notif<NotifSetFightersActivatedArgs>) {
        // TODO
    }

    notif_exchangedFighters(notif: Notif<NotifSetFightersActivatedArgs>) {
        // TODO
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

                /*['discardNumber', 'roundPoints', 'cardsPoints', 'colorBonus', 'cardName', 'cardName1', 'cardName2', 'cardColor', 'cardColor1', 'cardColor2', 'points', 'result'].forEach(field => {
                    if (args[field] !== null && args[field] !== undefined && args[field][0] != '<') {
                        args[field] = `<strong>${_(args[field])}</strong>`;
                    }
                });*/

            }
        } catch (e) {
            console.error(log,args,"Exception thrown", e.stack);
        }
        return (this as any).inherited(arguments);
    }
}