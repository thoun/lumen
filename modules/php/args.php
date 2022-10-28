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

        $possibleOperations = [];

        for ($type=1; $type<=5; $type++) {
            $max = $this->getOpMax($type);
            $current = self::getUniqueValueFromDB( "SELECT nb from operation where player_id = $playerId and operation = $type");
            
            if ($current < $max) {
                $possibleOperations[] = $type;
            }
        }

        if (count($possibleOperations) > 1) {
            $firstPlayer = intval($this->getGameStateValue(FIRST_PLAYER));
            if ($playerId != $firstPlayer) {
                $firstPlayerOperation = intval($this->getGameStateValue(FIRST_PLAYER_OPERATION));
                $possibleOperations = array_values(array_filter($possibleOperations, fn($possibleOperation) => $possibleOperation != $firstPlayerOperation));
            }
        }
    
        return [
           'possibleOperations' => $possibleOperations,
        ];
    }

    function argChooseCard() {        
        $playerId = intval($this->getActivePlayerId());

        $cards = $this->getCardsFromDb($this->cards->getCardsInLocation('pick'));
        $maskedCards = Card::onlyIds($cards);
    
        return [
            '_private' => [
                $playerId => [
                    'cards' => $cards,
                ]
            ],
            'cards' => $maskedCards,
            'remainingCardsInDeck' => $this->getRemainingCardsInDeck(),
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
