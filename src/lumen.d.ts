/**
 * Your game interfaces
 */

interface Card {
    id: number;
    category: number;
    family: number;
    color: number;
    index: number;
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
    firstPlayer: number;
}

interface LumenGame extends Game {
    cards: Cards;

    getPlayerId(): number;
    getPlayerColor(playerId: number): string;

    setTooltip(id: string, html: string): void;
    chooseCell(cell: number): void;
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

interface NotifSetPlayedOperationArgs {
    playerId: number;
    type: number;
    number: number;
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

interface NotifNewFirstPlayerArgs {
    playerId: number;
}
