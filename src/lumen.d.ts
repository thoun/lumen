/**
 * Your game interfaces
 */

interface ICard {
    id: number;
    type: number;
    subType: number;
    location: string;
    locationArg: number;
}

interface Card extends ICard {
    played: boolean;
    playerId: number;
}

interface DiscoverTile extends ICard {
    visible: boolean;
}

interface ObjectiveToken {
    id: number;
    lumens: number;
    location: string;
    locationArg: number;
    visible: boolean;
}

interface Circle {
    circleId: number;
    value: number | null;
    zone: number;
}

interface Link {
    index1: number;
    index2: number;
}

interface LumenPlayer extends Player {
    playerNo: number;
    checks: number;
    reserve: Card[];
    highCommand: Card[];
    operations: { [type: number]: number };
    circles: Circle[];
    links: Link[];
    discoverTiles: DiscoverTile[];
    objectiveTokens: ObjectiveToken[];
}

interface LumenGamedatas {
    current_player_id: string;
    decision: {decision_type: string};
    game_result_neutralized: string;
    gamestate: Gamestate;
    gamestates: { [gamestateId: number]: Gamestate };
    neutralized_player_id: string;
    notifications: {last_packet_id: string, move_nbr: string}
    playerorder: (string | number)[];
    players: { [playerId: number]: LumenPlayer };
    tablespeed: string;

    // Add here variables you set up in getAllDatas
    scenario: number;
    fightersOnTerritories: Card[];
    discoverTilesOnTerritories: DiscoverTile[];
    initiativeMarkerTerritory: number;
    firstPlayer: number;
    firstPlayerOperation: number;
    die1: number;
    die2: number;
    realizedObjectives: string[];
    remainingCardsInBag: { [playerId: number]: number };
}

interface LumenGame extends Game {
    cardsManager: CardsManager;
    discoverTilesManager: DiscoverTilesManager;
    scenario: Scenario;

    getPlayerId(): number;
    getPlayerColor(playerId: number): string;

    setTooltip(id: string, html: string): void;   
    getChooseFighterSelectableCards(): Card[];

    operationClick(operation: number): void;
    cellClick(cell: number): void; 
    chooseFightersClick(card: Card): void;   

    playFighter(id: number): void;
    moveFighter(id: number): void;
    activateFighter(id: number): void;

    territoryClick(id: number): void;
}
interface EnteringChooseOperationArgs {
    operations: { [operation: number]: {
        currentNumber: number;
        value: number;
        possible: boolean;
    } };
}

interface EnteringChooseCellArgs {
    possibleCircles: number[];
    value: number;
}

interface EnteringChooseCellLinkArgs {
    cellId: number;
    possibleLinkCirclesIds: number[];
}

interface EnteringChooseCellJammingArgs {
    possibleCircles: number[];
    opponentId: number;
}

interface EnteringChooseFighterArgs {
    canCancel: boolean;
    canUseCoupFourre: boolean;
    move: number;
    remainingPlays?: number;
    remainingMoves?: number;
    possibleTerritoryFighters: Card[];
    possibleFightersToPlace?: Card[];
    possibleActions?: Card[];
    possibleFightersToMove?: Card[];
    possibleFightersToActivate?: Card[];
    selectionSize: number;
}

interface EnteringChooseTerritoryArgs {
    canCancel: boolean;
    move: number;
    selectedFighter: Card;
    territoriesIds: number[];
}

interface NotifDiceRollArgs {
    die1: number;
    die2: number;
}

interface NotifSetPlayedOperationArgs {
    playerId: number;
    type: number;
    number: number;
    firstPlayer: boolean;
}

interface NotifSetCircleValueArgs {
    playerId: number;
    circleId: number;
    value: number;
}

interface NotifAddCheckArgs {
    playerId: number;
    checks: number;
}

interface NotifAddHighCommandCardArgs {
    playerId: number;
    card: Card;
}

interface NotifZoneArgs {
    playerId: number;
    circlesIds: number[];
    zoneId: number;
}

interface NotifLinkArgs {
    playerId: number;
    index1: number;
    index2: number;
}

interface NotifNewFirstPlayerArgs {
    playerId: number;
}

interface NotifTakeObjectiveTokensArgs {
    playerId: number;
    value: number;
    tokens: ObjectiveToken[];
    letterId?: string;
}

interface NotifTakeMissionObjectiveTokensArgs extends NotifTakeObjectiveTokensArgs {
    highlightCard: Card;
}

interface NotifMoveFighterArgs {
    fighter: Card;
    territoryId: number;
    fromBag: boolean;
}

interface NotifRefillReserveArgs {
    playerId: number;
    fighter: Card | null;
    slot: number;
}

interface NotifMoveDiscoverTileToPlayerArgs {
    playerId: number;
    discoverTile: DiscoverTile;
}

interface NotifDiscardDiscoverTileArgs {
    discoverTile: DiscoverTile;
}

interface NotifRevealDiscoverTileArgs {
    discoverTile: DiscoverTile;
}

interface NotifMoveInitiativeMarkerArgs {
    territoryId: number;
}

interface NotifPutBackInBagArgs {
    fighters: Card[];
}

interface NotifSetFightersActivatedArgs {
    fighters: Card[];
}

interface NotifScoreArgs {
    playerId: number;
    newScore: number;
    incScore: number;
}

interface NotifEndControlTerritoryArgs extends NotifScoreArgs {
    territoryId: number;
}
