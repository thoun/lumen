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
        $this->setGameStateValue(PLAYER_SELECTED_TARGET, 0);
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
        $this->activeNextPlayer();
        
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
                    self::notifyAllPlayers('endControlTerritory', clienttranslate('Nobody controls the ${season} territory on battlefiled ${battlefieldId}'), [
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
                        $this->takeMissionObjectiveToken($playerId, $count - 1, $mission);
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
                        $this->takeMissionObjectiveToken($playerId, $controlledWinterTerritories - 1, $mission); 
                        break;
                    case MISSION_FRELUQUETS:
                        $tokensCount = 0;
                        foreach ($scenario->battlefieldsIds as $battlefieldId) {
                            foreach ($this->BATTLEFIELDS[$battlefieldId]->territories as $territory) {
                                $count = count($this->getCardsByLocation('territory', $territory->id, $playerId, 1, 1));
                                if ($count >= 2) {
                                    $tokensCount += $count - 1;
                                }
                            }
                        }
                        $this->takeMissionObjectiveToken($playerId, $tokensCount, $mission);
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

    function scoreScenarioEndgameObjectives(int $scenarioId) {
        switch ($scenarioId) {
            case 1:
                $initiativeMarkerControlledPlayer = $this->getTerritoryControlledPlayer(INITIATIVE_MARKER_TERRITORY);
                if ($initiativeMarkerControlledPlayer !== null) {
                    $this->takeScenarioObjectiveToken($initiativeMarkerControlledPlayer);
                }
                break;
            case 2:
                $playersIds = $this->getPlayersIds();
                $leastOrphans = null;
                $orphansByPlayer = [];
                foreach ($playersIds as $playerId) {
                    $orphansByPlayer[$playerId] = 0;

                    $circles = $this->getCircles($playerId);
                    $links = $this->getLinks($playerId);

                    foreach ($circles as $circle) {
                        if ($circle->value !== null && $circle->value !== -1 && !$this->array_some($links, fn($link) => $link->index1 == $circle->circleId || $link->index2 == $circle->circleId)) {
                            $orphansByPlayer[$playerId]++;
                        }   
                    }
                }

                if ($orphansByPlayer[$playersIds[0]] < $orphansByPlayer[$playersIds[1]]) {
                    $leastOrphans = $playersIds[0];
                } else if ($orphansByPlayer[$playersIds[1]] < $orphansByPlayer[$playersIds[0]]) {
                    $leastOrphans = $playersIds[1];
                }

                if ($leastOrphans !== null) {
                    $this->takeScenarioObjectiveToken($leastOrphans);
                }

                break;
            case 4:
                $playersIds = $this->getPlayersIds();
                foreach([[3, 4, 6], [2, 5], [1, 7]] as $islandIndex => $islandBattlefieldsIds) {
                    $fightersByPlayer = [];
                    foreach ($playersIds as $playerId) {
                        $fightersByPlayer[$playerId] = 0;

                        foreach ($islandBattlefieldsIds as $battlefieldId) {
                            foreach ($this->BATTLEFIELDS[$battlefieldId]->territories as $territory) {
                                $fightersOnTerritory = $this->getCardsByLocation('territory', $territory->id, $playerId);
                                $fightersByPlayer[$playerId] += count($fightersOnTerritory);
                            }
                        }
                    }


                    $mostFighters = null;
                    $alone = false;
                    if ($fightersByPlayer[$playersIds[0]] > $fightersByPlayer[$playersIds[1]]) {
                        $mostFighters = $playersIds[0];
                        $alone = $fightersByPlayer[$playersIds[1]] == 0;
                    } else if ($fightersByPlayer[$playersIds[1]] > $fightersByPlayer[$playersIds[0]]) {
                        $mostFighters = $playersIds[1];
                        $alone = $fightersByPlayer[$playersIds[0]] == 0;
                    }

                    if ($mostFighters !== null) {
                        //$this->takeScenarioObjectiveToken($mostFighters, 'A', $alone ? 2 : 1);
                        $cardinalDirection = '';
                        switch ($islandIndex) {
                            case 0: $cardinalDirection = clienttranslate('west'); break;
                            case 1: $cardinalDirection = clienttranslate('north'); break;
                            case 2: $cardinalDirection = clienttranslate('south'); break;
                        }

                        $number = $alone ? 2 : 1;
                        $this->takeObjectiveTokens(
                            $playerId, 
                            $number,
                            clienttranslate('${player_name} gets ${number} objective token(s) for objective ${letter} on ${cardinalDirection} island'), 
                            [
                                'letter' => 'A',
                                'number' => $number,
                                'cardinalDirection' => $cardinalDirection,
                                'i18n' => ['cardinalDirection'],
                            ]
                        );
                    }
                }
                break;
            case 6:
                $initiativeMarkerControlledPlayer = $this->getTerritoryControlledPlayer(INITIATIVE_MARKER_TERRITORY);
                $playersIds = $this->getPlayersIds();
                $monstWinterFighters = null;
                $winterFightersCountByPlayer = [];
                foreach ($playersIds as $playerId) {
                    $playerFighters = $this->getCardsByLocation('territory', null, $playerId);
                    $winterFightersCountByPlayer[$playerId] = count(array_filter($playerFighters, fn($fighter) => $fighter->locationArg % 10 == 1));
                }

                if ($winterFightersCountByPlayer[$playersIds[0]] > $winterFightersCountByPlayer[$playersIds[1]]) {
                    $monstWinterFighters = $playersIds[0];
                } else if ($winterFightersCountByPlayer[$playersIds[1]] > $winterFightersCountByPlayer[$playersIds[0]]) {
                    $monstWinterFighters = $playersIds[1];
                }

                if ($monstWinterFighters !== null) {
                    $this->takeScenarioObjectiveToken($monstWinterFighters);
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
                $points += $objectiveToken->lumens;
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
        $this->scoreScenarioEndgameObjectives($scenarioId);
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
