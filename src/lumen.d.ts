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
}

interface DiscoverTile extends ICard {
    visible: boolean;
}

interface Circle {
    circleId: number;
    value: number | null;
    zone: number;
}

interface LumenPlayer extends Player {
    playerNo: number;
    checks: number;
    reserve: Card[];
    highCommand: Card[];
    operations: { [type: number]: number };
    circles: Circle[];
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
}

interface LumenGame extends Game {
    cards: Cards;

    getPlayerId(): number;
    getPlayerColor(playerId: number): string;

    setTooltip(id: string, html: string): void;
    cellClick(cell: number): void;

    playFighter(id: number): void;
    moveFighter(id: number): void;
    activateFighter(id: number): void;
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

interface EnteringChooseFighterArgs {
    move: number;
    remainingPlays?: number;
    remainingMoves?: number;
    remainingBonusMoves?: number;
    possibleTerritoryFighters: Card[];
    possibleFightersToPlace?: Card[];
    possibleActions?: Card[];
    possibleFightersToActivate?: Card[];
    selectionSize: number;
}

interface EnteringChooseTerritoryArgs {
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

interface NotifTakeObjectiveTokenArgs {
    playerId: number;
    value: number;
}

interface NotifMoveFighterArgs {
    fighter: Card;
    territoryId: number;
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