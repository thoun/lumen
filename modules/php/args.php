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
                $firstPlayerOperation = intval($this->getGameStateValue(PLAYER_OPERATION));
                $operations[$firstPlayerOperation]['possible'] = false;
            }
        }
    
        return [
           'operations' => $operations,
        ];
    }

    function argChooseCell() {        
        $playerId = intval($this->getActivePlayerId());

        $number = intval($this->getGameStateValue(PLAYER_NUMBER));

        $circles = $this->getCircles($playerId);
        $allEmpty = $this->array_every($circles, fn($circle) => $circle->value === null || $circle->value === -1);

        $possibleCircles = [];
        if ($allEmpty) {
            $possibleCircles = array_map(fn($circle) => $circle->circleId, $circles);
        } else {
            foreach ($circles as $circle) {
                if ($circle->value !== null && $circle->value !== -1) {
                    foreach ($circle->neighbours as $neighbourId) {
                        $neighbour = $this->array_find($circles, fn($c) => $c->circleId === $neighbourId);
                        if ($neighbour->value === null && !in_array($neighbourId, $possibleCircles)) {
                            $possibleCircles[] = $neighbourId;
                        }
                    }              
                }
            }
        }
    
        return [
            'possibleCircles' => $possibleCircles,
            'value' => $number,
            'number' => $number, // for title bar
        ];
    }
   
    function argPlayCards() {
        $playerId = intval($this->getActivePlayerId());

        $totalPoints = $this->getCardsPoints($playerId)->totalPoints;
        $playableDuoCards = $this->playableDuoCards($playerId);
        $canCallEndRound = $totalPoints >= 7 && intval($this->getGameStateValue(END_ROUND_TYPE)) == 0;
        $hasFourMermaids = count($this->getPlayerMermaids($playerId)) == 4;
    
        return [
            'canDoAction' => count($playableDuoCards) > 0 || $canCallEndRound || $hasFourMermaids,
            'playableDuoCards' => $playableDuoCards,
            'hasFourMermaids' => $hasFourMermaids,
            'canCallEndRound' => $canCallEndRound,
        ];
    }

    function argChooseDiscardCard() {
        $playerId = intval($this->getActivePlayerId());

        $discardNumber = $this->getGameStateValue(CHOSEN_DISCARD);
        $cards = $this->getCardsFromDb($this->cards->getCardsInLocation('discard'.$discardNumber, null, 'location_arg'));
        $maskedCards = Card::onlyIds($cards);
    
        return [
            'discardNumber' => $discardNumber,
            '_private' => [
                $playerId => [
                    'cards' => $cards,
                ]
            ],
            'cards' => $maskedCards,
        ];
    }

    function argChooseOpponent() {
        $playerId = intval($this->getActivePlayerId());

        $possibleOpponentsToSteal = $this->getPossibleOpponentsToSteal($playerId);

        return [
            'playersIds' => $possibleOpponentsToSteal,
        ];
    }
    
}
