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
        $this->setGameStateValue(FIRST_PLAYER_OPERATION, 0);

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

    function scoreTerritoryControl(Scenario $scenario) {
        foreach ($scenario->battlefieldsIds as $battlefieldId) {
            foreach ($this->BATTLEFIELDS[$battlefieldId]->territories as $territory) {
                $controlPlayer = $this->getTerritoryControlledPlayer($territory->id);
                if ($controlPlayer !== null) {
                    $this->incPlayerScore($controlPlayer, $territory->lumens, clienttranslate('${player_name} controls the ${season} territory on battlefield ${battlefieldId}'), [
                        'scoreType' => 'endControlTerritory',
                        'territoryId' => $territory->id,
                        'season' => $this->getSeasonName($territory->lumens),
                        'battlefieldId' => $battlefieldId,
                        'i18n' => ['season'],
                    ]);
                } else {
                    self::notifyAllPlayers('endUncontrolledTerritory', clienttranslate('Nobody controls the ${season} territory on battlefiled ${battlefieldId}'), [
                        'territoryId' => $territory->id,
                        'season' => $this->getSeasonName($territory->lumens),
                        'battlefieldId' => $battlefieldId,
                        'i18n' => ['season'],
                    ]);
                }
            }
        }
    }

    function scoreMissions(array $playersIds, Scenario $scenario) {
        foreach ($playersIds as $playerId) {
            $missions = $this->getCardsByLocation('highCommand'.$playerId, null, null, 30);

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
    }

    function scoreDiscoverTiles(array $playersIds) {
        foreach ($playersIds as $playerId) {
            $playerDiscoverTiles = $this->getDiscoverTilesByLocation('player', $playerId);

            // TODO reveal discoverTiles

            $points = 0;
            foreach ($playerDiscoverTiles as $discoverTile) {
                if ($discoverTile->type === 1) {
                    $points += $discoverTile->subType;
                }
            }

            $this->incPlayerScore($playerId, $points, clienttranslate('${player_name} gains ${vp} VP with discover tiles'), [
                'scoreType' => 'discoverTiles',
                'vp' => $points,
            ]);
        }
    }

    function scoreScenarioEndgameObjectives(int $scenarioId, Scenario $scenario) {
        switch ($scenarioId) {
            case 1:
                $initiativeMarkerControlledPlayer = $this->getTerritoryControlledPlayer(INITIATIVE_MARKER_TERRITORY);
                if ($initiativeMarkerControlledPlayer !== null) {
                    $this->takeScenarioObjectiveToken($initiativeMarkerControlledPlayer, 'C');
                    $this->setRealizedObjective('C');
                }
                break;
            case 2:
                $initiativeMarkerControlledPlayer = $this->getTerritoryControlledPlayer(INITIATIVE_MARKER_TERRITORY);
                $playersIds = $this->getPlayersIds();
                $mostOrphans = null;
                $orphansByPlayer = [];
                foreach ($playersIds as $playerId) {
                    $orphansByPlayer[$playerId] = 0;

                    foreach ($scenario->battlefieldsIds as $battlefieldId) {
                        foreach ($this->BATTLEFIELDS[$battlefieldId]->territories as $territory) {
                            $fightersOnTerritory = $this->getCardsByLocation('territory', $territory->id, $playerId);
                            if (count($fightersOnTerritory) === 1) {
                                $orphansByPlayer[$playerId]++;
                            }
                        }
                    }
                }

                if ($orphansByPlayer[$playersIds[0]] > $orphansByPlayer[$playersIds[1]]) {
                    $mostOrphans = $playersIds[0];
                } else if ($orphansByPlayer[$playersIds[1]] > $orphansByPlayer[$playersIds[0]]) {
                    $mostOrphans = $playersIds[1];
                }

                if ($mostOrphans !== null) {
                    $this->takeScenarioObjectiveToken($mostOrphans, 'B');
                    $this->setRealizedObjective('B');
                }

                break;
        }
    }

    function scoreObjectiveTokens(array $playersIds) {
        foreach ($playersIds as $playerId) {
            $objectiveTokens = $this->getObjectiveTokensFromDb($this->objectiveTokens->getCardsInLocation('player', $playerId));
            
            // TODO reveal objectiveTokens

            $points = 0;
            foreach ($objectiveTokens as $objectiveToken) {
                $points += $objectiveToken->type;
            }

            $this->incPlayerScore($playerId, $points, clienttranslate('${player_name} gains ${vp} VP with objective tokens'), [
                'scoreType' => 'objectiveTokens',
                'vp' => $points,
            ]);
        }
    }

    function stEndScore() {
        $playersIds = $this->getPlayersIds();

        $scenarioId = $this->getScenarioId();
        $scenario = $this->getScenario();

        $this->scoreMissions($playersIds, $scenario);
        $this->scoreTerritoryControl($scenario);
        $this->scoreDiscoverTiles($playersIds);
        $this->scoreScenarioEndgameObjectives($scenarioId, $scenario);
        $this->scoreObjectiveTokens($playersIds);

        // update player_score_aux
        $initiativeMarkerControlledPlayer = $this->getTerritoryControlledPlayer(INITIATIVE_MARKER_TERRITORY);
        if ($initiativeMarkerControlledPlayer !== null) {
            $this->DbQuery("UPDATE `player` SET `player_score_aux` = 1 WHERE `player_id` = $initiativeMarkerControlledPlayer"); 
        }

        // TODO stats

        $this->gamestate->nextState('endGame');
    }
}
