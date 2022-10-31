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

interface ScoreDetails {
    cardsPoints: number | null;
    colorBonus: number | null;
}

interface LumenPlayer extends Player {
    playerNo: number;
    checks: number;
    reserve: Card[];
    highCommand: Card[];
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
    fightersOnTerritories: Card[];
    firstPlayer: number;
}

interface LumenGame extends Game {
    cards: Cards;

    getPlayerId(): number;
    getPlayerColor(playerId: number): string;

    updateTableHeight(): void;
    setTooltip(id: string, html: string): void;
    takeCardsFromDeck(): void;
    onCardClick(card: Card): void;
    onDiscardPileClick(discardNumber: number): void;
}

interface EnteringTakeCardsArgs {
    canTakeFromDeck: boolean;
    canTakeFromDiscard: number[];
}

interface EnteringChooseCardArgs {
    _private?: {
        cards: Card[];
    }
    cards: Card[];
    discardNumber?: number;
    remainingCardsInDeck: number;
}

interface EnteringChooseOperationArgs {
    operations: { [operation: number]: {
        value: number;
        possible: boolean;
    } };
}

interface EnteringChooseOpponentArgs {
    playersIds: number[];
}

interface NotifAddCheckArgs {
    playerId: number;
    checks: number;
}

interface NotifAddHighCommandCardArgs {
    playerId: number;
    card: Card;
}

interface NotifNewFirstPlayerArgs {
    playerId: number;
}
