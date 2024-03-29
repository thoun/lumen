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

        $planningTiles = $this->getDiscoverTilesByLocation('player', $playerId, null, 2, POWER_PLANNING);
        $canActivatePlanning = count($planningTiles) > 0;

        $this->incStat(1, 'roundsAsFirstPlayer', $playerId);        

        $this->gamestate->nextState($canActivatePlanning ? 'askActivatePlanning' : 'rollDice');
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

    function stChooseAction() {
        $playerId = intval($this->getActivePlayerId());

        $place = intval($this->getGameStateValue(REMAINING_FIGHTERS_TO_PLACE));
        $move = intval($this->getGameStateValue(REMAINING_FIGHTERS_TO_MOVE_OR_ACTIVATE));
        $this->setActionsCount($place, $move);
        
        self::notifyAllPlayers('log', clienttranslate('${player_name} can place ${place} fighters and move/activate ${move} fighters'), [
            'player_name' => $this->getPlayerName($playerId),
            'place' => $place,
            'move' => $move,
        ]);

        if ($place == 0 || $move == 0) {
            $this->setActionOrder(1);
            $this->gamestate->nextState('nextMove');
        }
    }

    function stNextMove() {
        $playerId = intval($this->getActivePlayerId());

        $this->setGameStateValue(PLAYER_SELECTED_FIGHTER, 0);
        $this->setGameStateValue(PLAYER_SELECTED_TARGET, 0);
        $this->setGameStateValue(PLAYER_CURRENT_MOVE, 0);
        
        $remainingActions = $this->getRemainingActions();

        if ($remainingActions->startWith == '') {
            $this->gamestate->nextState('chooseAction');
            return;
        }

        $canDoAction = (
            $remainingActions->actions[0]->remaining + 
            $remainingActions->actions[1]->remaining
        ) > 0 || count($this->getDiscoverTilesByLocation('player', $playerId, null, 2, POWER_FOUL_PLAY)) > 0;;
        $this->gamestate->nextState($canDoAction ? 'chooseFighter' : 'nextPlayer');
    }

    function stNextPlayer() {
        if ($this->checkPlayerElimination()) {
            $this->gamestate->jumpToState(ST_END_GAME);
            return;
        }

        $playerId = intval($this->getActivePlayerId());
        $this->refillReserve($playerId);

        $this->giveExtraTime($playerId);
        $this->activeNextPlayer();
        
        $firstPlayer = intval($this->getGameStateValue(FIRST_PLAYER));

        $this->gamestate->nextState($firstPlayer == $playerId ? 'nextPlayer' : 'endRound');
    }

    function stEndRound() {
        $this->incStat(1, 'roundNumber');

        $lastRound = intval($this->getStat('roundNumber')) >= 17;

        if (!$lastRound) {
            $initiativeMarkerControlledPlayer = $this->getTerritoryControlledPlayer(intval($this->getGameStateValue(INITIATIVE_MARKER_TERRITORY)));
            $firstPlayerId = $this->getFirstPlayerId();
            if ($initiativeMarkerControlledPlayer == null) {
                $newFirstPlayerId = $this->getOpponentId($firstPlayerId);
                $this->setFirstPlayer($newFirstPlayerId, false);
            } else {
                $this->setFirstPlayer($initiativeMarkerControlledPlayer, true);
            }
        }

        $this->gamestate->nextState($lastRound ? 'endScore' : 'newRound');
    }

    function scoreTerritoryControl(array $playersIds, Scenario $scenario) {
        foreach ($scenario->battlefieldsIds as $battlefieldId) {
            foreach ($this->BATTLEFIELDS[$battlefieldId]->territories as $territory) {
                $controlPlayer = $this->getTerritoryControlledPlayer($territory->id);

                if ($controlPlayer !== null) {
                    $this->incStat(1, 'controlledTerritories');   
                    $this->incStat(1, 'controlledTerritories', $controlPlayer);   
                    $this->incStat(1, 'controlledTerritories'.$territory->lumens);   
                    $this->incStat(1, 'controlledTerritories'.$territory->lumens, $controlPlayer);  
                    $this->incStat($territory->lumens, 'scoreTerritoryControl', $controlPlayer);

                    $this->incPlayerScore($controlPlayer, $territory->lumens, clienttranslate('${player_name} controls the ${season} territory on battlefield ${battlefieldId}'), [
                        'scoreType' => 'endControlTerritory',
                        'territoryId' => $territory->id,
                        'lumens' => $territory->lumens,
                        'season' => $this->getSeasonName($territory->lumens),
                        'battlefieldId' => $battlefieldId,
                        'i18n' => ['season'],
                    ]);
                } else {
                    if (count($this->getCardsByLocation('territory', $territory->id)) > 0) {
                        $this->incStat(1, 'tieControlTerritories'); 
                        foreach($playersIds as $playerId) {  
                            $this->incStat(1, 'tieControlTerritories', $playerId);   
                        }
                    }
                    self::notifyAllPlayers('endControlTerritory', clienttranslate('Nobody controls the ${season} territory on battlefield ${battlefieldId}'), [
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
                    case MISSION_LOOT:
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
                    case MISSION_SHROOMLING:
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

            $this->setStat($points, 'scoreDiscoverTiles', $playerId);
        }
    }

    function scoreScenarioEndgameObjectives(int $scenarioId) {
        switch ($scenarioId) {
            case 1:
                $initiativeMarkerControlledPlayer = $this->getTerritoryControlledPlayer(intval($this->getGameStateValue(INITIATIVE_MARKER_TERRITORY)));
                if ($initiativeMarkerControlledPlayer !== null) {
                    $this->takeScenarioObjectiveToken($initiativeMarkerControlledPlayer);
                    $this->setRealizedObjective('3', $initiativeMarkerControlledPlayer);
                    $this->incStat(1, 'completedObjectives');
                    $this->incStat(1, 'completedObjectives', $initiativeMarkerControlledPlayer);
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
                        if ($circle->value !== null && $circle->value !== -1 && $circle->zone == -1 && !$this->array_some($links, fn($link) => $link->index1 == $circle->circleId || $link->index2 == $circle->circleId)) {
                            $orphansByPlayer[$playerId]++;
                        }   
                    }
                }

                $this->notifyAllPlayers('log', clienttranslate('${player_name} has ${orphan_count} orphan cell(s), ${player_name2} has ${orphan_count2} orphan cell(s)'), [
                    'player_name' => $this->getPlayerName($playersIds[0]),
                    'orphan_count' => $orphansByPlayer[$playersIds[0]],
                    'player_name2' => $this->getPlayerName($playersIds[1]),
                    'orphan_count2' => $orphansByPlayer[$playersIds[1]],
                ]);

                if ($orphansByPlayer[$playersIds[0]] < $orphansByPlayer[$playersIds[1]]) {
                    $leastOrphans = $playersIds[0];
                } else if ($orphansByPlayer[$playersIds[1]] < $orphansByPlayer[$playersIds[0]]) {
                    $leastOrphans = $playersIds[1];
                }

                if ($leastOrphans !== null) {
                    $this->takeScenarioObjectiveToken($leastOrphans);
                    $this->setRealizedObjective('2', $leastOrphans);
                    $this->incStat(1, 'completedObjectives');
                    $this->incStat(1, 'completedObjectives', $leastOrphans);
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
                            $mostFighters, 
                            $number,
                            clienttranslate('${player_name} gets ${number} objective token(s) for objective ${letter} on ${cardinalDirection} island'), 
                            [
                                'letter' => 'A',
                                'number' => $number,
                                'cardinalDirection' => $cardinalDirection,
                                'i18n' => ['cardinalDirection'],
                            ]
                        );
                        $this->setRealizedObjective('1'.$islandIndex, $mostFighters);
                        if ($alone) {
                            $this->setRealizedObjective('2'.$islandIndex, $mostFighters);
                        }
                        $this->incStat(1, 'completedObjectives');
                        $this->incStat(1, 'completedObjectives', $mostFighters);
                    }
                }
                break;
            case 6:
                $initiativeMarkerControlledPlayer = $this->getTerritoryControlledPlayer(intval($this->getGameStateValue(INITIATIVE_MARKER_TERRITORY)));
                $playersIds = $this->getPlayersIds();
                $mostWinterFighters = null;
                $winterFightersCountByPlayer = [];
                foreach ($playersIds as $playerId) {
                    $playerFighters = $this->getCardsByLocation('territory', null, $playerId);
                    $winterFightersCountByPlayer[$playerId] = count(array_filter($playerFighters, fn($fighter) => $fighter->locationArg % 10 == 1));
                }

                if ($winterFightersCountByPlayer[$playersIds[0]] > $winterFightersCountByPlayer[$playersIds[1]]) {
                    $mostWinterFighters = $playersIds[0];
                } else if ($winterFightersCountByPlayer[$playersIds[1]] > $winterFightersCountByPlayer[$playersIds[0]]) {
                    $mostWinterFighters = $playersIds[1];
                }

                if ($mostWinterFighters !== null) {
                    $this->takeScenarioObjectiveToken($mostWinterFighters, null, 2);
                    $this->setRealizedObjective('2', $mostWinterFighters);
                    $this->incStat(1, 'completedObjectives');
                    $this->incStat(1, 'completedObjectives', $mostWinterFighters);
                }

                break;
        }
    }

    function scoreObjectiveTokens(array $playersIds) {
        foreach ($playersIds as $playerId) {
            $objectiveTokens = $this->getObjectiveTokensFromDb($this->objectiveTokens->getCardsInLocation('player', $playerId));

            $points = 0;
            foreach ($objectiveTokens as $objectiveToken) {
                $points += $objectiveToken->lumens;
            }

            $this->notifyAllPlayers('revealObjectiveTokens', '', [
                'playerId' => $playerId,
                'tokens' => $objectiveTokens
            ]);

            $this->incPlayerScore($playerId, $points, clienttranslate('${player_name} gains ${vp} VP with objective tokens'), [
                'scoreType' => 'objectiveTokens',
                'vp' => $points,
            ]);

            $this->setStat($points, 'scoreObjectiveTokens', $playerId);
        }
    }

    function endStats(array $playersIds) {
        foreach ($playersIds as $playerId) {
            $circles = $this->getCircles($playerId);
            $circles = array_filter($circles, fn($circle) => $circle->value !== null && $circle->value !== -1);
            $totalValues = array_reduce(array_map(fn($circle) => $circle->value, $circles), fn($a, $b) => $a + $b, 0);
            $this->setStat(count($circles) > 0 ? ($totalValues / count($circles)) : 0, 'averageFigure', $playerId);

            $playerFighters = $this->getCardsByLocation('territory', null, $playerId);

            $territoryFightersCount = count($playerFighters);
            $this->setStat($territoryFightersCount, 'territoryFighters', $playerId);
            $territoryFightersCumulatedStrength = array_reduce(array_map(fn($fighter) => $fighter->getStrength(), $playerFighters), fn($a, $b) => $a + $b, 0);
            $this->setStat($territoryFightersCumulatedStrength, 'territoryFightersCumulatedStrength', $playerId);
            $this->setStat($territoryFightersCount > 0 ? ($territoryFightersCumulatedStrength / $territoryFightersCount) : 0, 'territoryFightersAverageStrength', $playerId);
        }
    }

    function stEndScore() {
        $playersIds = $this->getPlayersIds();

        $scenarioId = $this->getScenarioId();
        $scenario = $this->getScenario();

        $this->scoreMissions($playersIds, $scenario);
        $this->scoreTerritoryControl($playersIds, $scenario);
        $this->scoreDiscoverTiles($playersIds);
        $this->scoreScenarioEndgameObjectives($scenarioId);
        $this->scoreObjectiveTokens($playersIds);

        // update player_score_aux
        $initiativeMarkerControlledPlayer = $this->getTerritoryControlledPlayer(intval($this->getGameStateValue(INITIATIVE_MARKER_TERRITORY)));
        if ($initiativeMarkerControlledPlayer !== null) {
            $this->DbQuery("UPDATE `player` SET `player_score_aux` = 1 WHERE `player_id` = $initiativeMarkerControlledPlayer"); 
        }

        $this->endStats($playersIds);

        $this->gamestate->nextState('endGame');
    }
}
