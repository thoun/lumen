<?php

trait ArgsTrait {
    
//////////////////////////////////////////////////////////////////////////////
//////////// Game state arguments
////////////

    /*
        Here, you can create methods defined as "game state arguments" (see "args" property in states.inc.php).
        These methods function is to return some additional information that is specific to the current
        game state.
    */
   
    function argChooseOperation() {
        $playerId = intval($this->getActivePlayerId());

        $die1 = intval($this->getGameStateValue(DIE1));
        $die2 = intval($this->getGameStateValue(DIE2));

        $operations = [];

        $possibleOperationsCount = 0;
        for ($type=1; $type<=5; $type++) {
            $max = $this->getOpMax($type);
            $current = intval(self::getUniqueValueFromDB( "SELECT nb from operation where player_id = $playerId and operation = $type"));

            $possible = $current < $max;
            if ($possible) {
                $possibleOperationsCount++;
            }

            $operations[$type] = [
                'currentNumber' => $current,
                'value' => $this->getValue($die1, $die2, $type),
                'possible' => $possible,
            ];
        }

        if ($possibleOperationsCount > 1) {
            $firstPlayer = intval($this->getGameStateValue(FIRST_PLAYER));
            if ($playerId != $firstPlayer) {
                $firstPlayerOperation = intval($this->getGameStateValue(FIRST_PLAYER_OPERATION));
                $operations[$firstPlayerOperation]['possible'] = false;
            }
        }
    
        return [
           'operations' => $operations,
        ];
    }

    function getPossibleCircles(int $playerId/*, /_* int | null*_/ $ignoreCircleId = null*/) {
        $circles = $this->getCircles($playerId);
        $allEmpty = $this->array_every($circles, fn($circle) => $circle->value === null || $circle->value === -1);

        $possibleCircles = [];
        if ($allEmpty) {
            $possibleCircles = array_map(fn($circle) => $circle->circleId, $circles);
        } else {
            foreach ($circles as $circle) {
                if ($circle->value !== null && $circle->value !== -1/* && $circle->circleId !== $ignoreCircleId*/) {
                    foreach ($circle->neighbours as $neighbourId) {
                        $neighbour = $this->array_find($circles, fn($c) => $c->circleId === $neighbourId);
                        if ($neighbour->value === null && !in_array($neighbourId, $possibleCircles)) {
                            $possibleCircles[] = $neighbourId;
                        }
                    }
                }
            }
        }

        return $possibleCircles;
    }

    function argChooseCell() {        
        $playerId = intval($this->getActivePlayerId());

        $number = intval($this->getGameStateValue(PLAYER_NUMBER));

        $possibleCircles = $this->getPossibleCircles($playerId);
    
        return [
            'possibleCircles' => $possibleCircles,
            'value' => $number,
            'number' => $number, // for title bar
        ];
    }

    function argChooseCellLink() {
        $playerId = intval($this->getActivePlayerId());

        $cellId = intval($this->getGameStateValue(PLAYER_CELL));
        $value = intval($this->getGameStateValue(PLAYER_NUMBER));
        $links = $this->getLinks($playerId);
        $possibleUpperLinkCirclesIds = $this->getPossibleLinkCirclesIds($playerId, $links, $cellId, $value, 1);
        $possibleLowerLinkCirclesIds = $this->getPossibleLinkCirclesIds($playerId, $links, $cellId, $value, -1);

        return [
            'possibleLinkCirclesIds' => count($possibleUpperLinkCirclesIds) > 1 ? $possibleUpperLinkCirclesIds : $possibleLowerLinkCirclesIds,
            'cellId' => $cellId,
        ];
    }

    function argChooseFighter() {
        $playerId = intval($this->getActivePlayerId());

        $remainingPlays = intval($this->getGameStateValue(REMAINING_FIGHTERS_TO_PLACE));
        $remainingMoves = intval($this->getGameStateValue(REMAINING_FIGHTERS_TO_MOVE_OR_ACTIVATE));

        return [
            'remainingPlays' => $remainingPlays,
            'remainingMoves' => $remainingMoves,
        ];
    }

    function argChooseTerritory() {
        $playerId = intval($this->getActivePlayerId());

        $selectedFighterId = intval($this->getGameStateValue(PLAYER_SELECTED_FIGHTER));
        $selectedFighter = $this->getCardById($selectedFighterId);

        $move = intval($this->getGameStateValue(PLAYER_CURRENT_MOVE));

        $territoriesIds = [];
        switch ($move) {
            case MOVE_PLAY:
                // territories with already placed fighters
                $fighters = $this->getCardsByLocation('territory', null, $playerId);
                $territoriesIds = array_values(array_unique(array_map(fn($fighter) => $fighter->locationArg, $fighters)));
                break;
            case MOVE_MOVE:
                // territories neighbours to current fighter
                $territoriesIds = $this->getTerritoryNeighboursIds($selectedFighter->locationArg);
                break;
        }

        return [
            'selectedFighter' => $selectedFighter,
            'move' => $move,
            'territoriesIds' => $territoriesIds,
        ];
    }

    function argChooseCellBrouillage() {
        $playerId = intval($this->getActivePlayerId());
        $opponentId = $this->getOpponentId($playerId);

        $circles = $this->getCircles($opponentId);
        $emptyCircles = array_values(array_filter($circles, fn($circle) => $circle->value === null || $circle->value === -1));

        $possibleCircles = array_map(fn($circle) => $circle->circleId, $emptyCircles);
        /* TODO Restriction : vous ne pouvez
        pas éliminer une cellule qui
        empêcherait votre adversaire
        d’accéder à une partie des cellules
        de sa fiche de commandement.*/

        return [
            'possibleCircles' => $possibleCircles,
        ];
    }
} 
