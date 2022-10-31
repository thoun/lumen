<?php

trait StateTrait {

//////////////////////////////////////////////////////////////////////////////
//////////// Game state actions
////////////

    /*
        Here, you can create methods defined as "game state actions" (see "action" property in states.inc.php).
        The action method of state X is called everytime the current game state is set to X.
    */

    function stNewRound() {
        $canActivatePlanification = false; // TODO

        $this->gamestate->nextState($canActivatePlanification ? 'askActivatePlanification' : 'rollDice');
    }    

    function stRollDice() {
        // TODO roll dice

        $die1 = bga_rand(0,5);
        $die2 = bga_rand(1,6);

        $this->setGameStateValue(DIE1, $die1);
        $this->setGameStateValue(DIE2, $die2);

        // TODO log dice
        $firstPlayer = intval($this->getGameStateValue(FIRST_PLAYER));
        self::notifyAllPlayers('diceRoll', clienttranslate('${player_name} rolled ${whiteDieFace} ${blackDieFace}'), [
            'player_name' => $this->getPlayerName($firstPlayer),
            'die1' => $die1,
            'die2' => $die2,
            'whiteDieFace' => $die1,
            'blackDieFace' => $die2,
        ]);

        $this->gamestate->nextState('chooseOperation');
    } 

    function stChooseOperation() {
        // TODO choose operation if only one available ?
    }

    function stChooseCell() {
        // TODO choose cell if only one available ?
    }

    function stNextPlayer() {
        $playerId = intval($this->getActivePlayerId());

        $this->giveExtraTime($playerId);
        
        $firstPlayer = intval($this->getGameStateValue(FIRST_PLAYER));

        $this->gamestate->nextState($firstPlayer == $playerId ? 'nextPlayer' : 'endRound');
    }

    function stEndRound() {
        $lastRound = $this->isLastRound();
        if (!$lastRound) {
            $this->cards->moveAllCardsInLocation(null, 'deck');
            $this->cards->shuffle('deck');
        }

        self::notifyAllPlayers('endRound', '', []);

        $this->gamestate->nextState($lastRound ? 'endScore' : 'newRound');
    }

    function stEndScore() {
        $playersIds = $this->getPlayersIds();

        // update player_score_aux
        $endRound = intval($this->getGameStateValue(END_ROUND_TYPE));
        $playerId = intval($this->getPlayerBefore($this->getActivePlayerId())); // if STOP, last player is the one before the newly activated player (next round starter)
        if ($endRound == LAST_CHANCE) { // if LAST_CHANCE, it's the player before (before the Caller)
            $playerId = intval($this->getPlayerBefore($playerId));
        }
        $scoreAux = count($playersIds);
        while ($scoreAux >= 1) {
            $this->DbQuery("UPDATE `player` SET `player_score_aux` = $scoreAux WHERE `player_id` = $playerId"); 
            $playerId = intval($this->getPlayerBefore($playerId));
            $scoreAux--;
        }

        foreach ($playersIds as $playerId) {
            $mermaids = $this->getPlayerMermaids($playerId);
            if (count($mermaids) == 4) {
                $this->setPlayerScore($playerId, 100, clienttranslate('${player_name} placed 4 mermaid cards and immediately wins the game!'), []);

                $this->setStat(1, 'winWithMermaids');
                $this->setStat(1, 'winWithMermaids', $playerId);
            }
        }

        $this->gamestate->nextState('endGame');
    }
}
