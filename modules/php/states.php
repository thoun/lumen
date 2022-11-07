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
        $playerId = intval($this->getActivePlayerId());

        $planificationTiles = $this->getDiscoverTilesByLocation('player', $playerId, null, 2, POWER_PLANIFICATION);
        $canActivatePlanification = count($planificationTiles) > 0;

        $this->gamestate->nextState($canActivatePlanification ? 'askActivatePlanification' : 'rollDice');
    }    

    function stRollDice() {
        $die1 = bga_rand(0,5);
        $die2 = bga_rand(1,6);

        $this->setGameStateValue(DIE1, $die1);
        $this->setGameStateValue(DIE2, $die2);

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

    function stNextMove() {
        $this->setGameStateValue(PLAYER_SELECTED_FIGHTER, 0);
        $this->setGameStateValue(PLAYER_CURRENT_MOVE, 0);
        
        $canDoAction =  (
            intval($this->getGameStateValue(REMAINING_FIGHTERS_TO_PLACE)) + 
            intval($this->getGameStateValue(REMAINING_FIGHTERS_TO_MOVE_OR_ACTIVATE))
        ) > 0;
        $this->gamestate->nextState($canDoAction ? 'chooseFighter' : 'nextPlayer');
    }

    function stNextPlayer() {
        $playerId = intval($this->getActivePlayerId());
        $this->refillReserve($playerId);

        $this->giveExtraTime($playerId);
        $playerId = $this->activeNextPlayer();
        
        $firstPlayer = intval($this->getGameStateValue(FIRST_PLAYER));

        $this->gamestate->nextState($firstPlayer == $playerId ? 'nextPlayer' : 'endRound');
    }

    function stEndRound() {
        $this->incStat(1, 'turnNumber');

        $lastRound = intval($this->getStat('turnNumber')) >= 17;

        if (!$lastRound) {
            $initiativeMarkerControlledPlayer = $this->getTerritoryControlledPlayer(INITIATIVE_MARKER_TERRITORY);
            $firstPlayerId = $this->getFirstPlayerId();
            if ($initiativeMarkerControlledPlayer === null) {
                $newFirstPlayerId = $this->getOpponentId($firstPlayerId);
                $this->setFirstPlayer($newFirstPlayerId, false);
            } else if ($initiativeMarkerControlledPlayer != $firstPlayerId) {
                $this->setFirstPlayer($initiativeMarkerControlledPlayer, true);
            }
        }

        $this->gamestate->nextState($lastRound ? 'endScore' : 'newRound');
    }

    function stEndScore() {
        $playersIds = $this->getPlayersIds();

        $scenarioId = $this->getScenarioId();
        switch ($scenarioId) {
            case 1:
                $initiativeMarkerControlledPlayer = $this->getTerritoryControlledPlayer(INITIATIVE_MARKER_TERRITORY);
                if ($initiativeMarkerControlledPlayer !== null) {
                    $this->takeScenarioObjectiveToken($initiativeMarkerControlledPlayer, 'C');
                    $this->setRealizedObjective('C');
                }
                break;
        }

        foreach ($playersIds as $playerId) {
            $missions = $this->getCardsByLocation('highCommand'.$playerId, null, null, 30);
            $scenario = $this->getScenario();

            foreach ($missions as $mission) {
                switch ($mission->power) {
                    case MISSION_COFFRE:
                        $discoverTokens = $this->getDiscoverTilesByLocation('player', $playerId, null, 1);
                        $count = count($discoverTokens);
                        if ($count >= 2) {
                            $this->takeMissionObjectiveToken($playerId, $count - 1, _('Coffre')); // TODO
                        }
                        break;
                    case MISSION_WINTER:
                        $controlledWinterTerritories = 0;
                        foreach ($scenario->battlefieldsIds as $battlefieldId) {
                            foreach ($this->BATTLEFIELDS[$battlefieldId]->territories as $territory) {
                                if ($territory->lumens === 1 && $this->getTerritoryControlledPlayer($territory->id) === $playerId) {
                                    $controlledWinterTerritories++;
                                }
                            }
                        }
                        if ($controlledWinterTerritories >= 2) {
                            $this->takeMissionObjectiveToken($playerId, $controlledWinterTerritories - 1, _('Hiver')); // TODO
                        }
                        break;
                    case MISSION_FRELUQUETS:
                        $tokensCount = 0;
                        foreach ($scenario->battlefieldsIds as $battlefieldId) {
                            foreach ($this->BATTLEFIELDS[$battlefieldId]->territories as $territory) {
                                $count = $this->getCardsByLocation('territory', $territory->id, $playerId, 1, 1);
                                if ($count >= 2) {
                                    $tokensCount += $count - 1;
                                }
                            }
                        }
                        if ($tokensCount > 0) {
                            $this->takeMissionObjectiveToken($playerId, $tokensCount, _('Freluquet')); // TODO
                        }
                        break;
                }
            }
        }

        // update player_score_aux
        /*$endRound = intval($this->getGameStateValue(END_ROUND_TYPE));
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
        }*/

        $this->gamestate->nextState('endGame');
    }
}
