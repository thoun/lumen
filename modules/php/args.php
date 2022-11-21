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
                if ($firstPlayerOperation > 0) {
                    $operations[$firstPlayerOperation]['possible'] = false;
                }
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

        $move = intval($this->getGameStateValue(PLAYER_CURRENT_MOVE));
        $args = [
            'move' => $move,
        ];

        $possibleTerritoryFighters = [];
        $selectionSize = 1;
        $optionalDetail = '';

        switch ($move) {
            case 0:
                $remainingPlays = intval($this->getGameStateValue(REMAINING_FIGHTERS_TO_PLACE));
                $remainingMoves = intval($this->getGameStateValue(REMAINING_FIGHTERS_TO_MOVE_OR_ACTIVATE));
                $remainingBonusMoves = count($this->getDiscoverTilesByLocation('player', $playerId, null, 2, POWER_COUP_FOURRE));

                $highCommand = $this->getCardsByLocation('highCommand'.$playerId);
                $territoryFighters = $this->getCardsByLocation('territory', null, $playerId);
                $possibleTerritoryFighters = $territoryFighters;

                $possibleFightersToActivate = array_values(array_filter($territoryFighters, fn($fighter) => !$fighter->played && $fighter->power !== null && $fighter->power !== POWER_BAVEUX));
                $scenarioId = $this->getScenarioId();
                switch ($scenarioId) {
                    case 5:
                        $possibleFightersToActivate = array_values(array_filter($possibleFightersToActivate, fn($fighter) => $fighter->power !== POWER_EMPLUME));
                        break;
                    case 6:
                        $possibleFightersToActivate = array_values(array_filter($possibleFightersToActivate, fn($fighter) => $fighter->location != 'territory' || $fighter->locationArg % 10 != 1));
                        break;
                }

                $optionalDetail = $remainingPlays == 0 && $remainingMoves == 0 && $remainingBonusMoves > 0 ?
                    clienttranslate('(with Coup fourré)') : ''; // TODO check translation

                $args = $args + [
                    'remainingPlays' => $remainingPlays,
                    'remainingMoves' => $remainingMoves,
                    'remainingBonusMoves' => $remainingBonusMoves,
                    'possibleFightersToPlace' => array_merge(
                        $this->getCardsByLocation('reserve'.$playerId),
                        array_values(array_filter($highCommand, fn($fighter) => in_array($fighter->type, [1, 10])))
                    ),
                    'possibleActions' => array_values(array_filter($highCommand, fn($fighter) => $fighter->type === 20)),
                    'possibleFightersToActivate' => $possibleFightersToActivate,
                ];
                break;
            case MOVE_PUSH:
                $selectedFighterId = intval($this->getGameStateValue(PLAYER_SELECTED_FIGHTER));
                $selectedFighter = $this->getCardById($selectedFighterId);
                $possibleTerritoryFighters = $this->getCardsByLocation('territory', $selectedFighter->locationArg);
                $possibleTerritoryFighters = array_values(array_filter($possibleTerritoryFighters, fn($fighter) => $fighter->id  != $selectedFighter->id));
                break;
            case MOVE_KILL:
                $selectedFighterId = intval($this->getGameStateValue(PLAYER_SELECTED_FIGHTER));
                $selectedFighter = $this->getCardById($selectedFighterId);
                if ($selectedFighter->power == POWER_BOMBARDE) {
                    $battlefieldsIds = $this->getBattlefieldsIds($selectedFighter->locationArg);                    
                    $possibleTerritoryFighters = $this->getCardsByLocation('territory', null, $this->getOpponentId($playerId));
                    $possibleTerritoryFighters = array_values(array_filter($possibleTerritoryFighters, fn($fighter) => in_array($fighter->locationArg % 10, $battlefieldsIds)));
                } else {
                    $possibleTerritoryFighters = $this->getCardsByLocation('territory', $selectedFighter->locationArg, $this->getOpponentId($playerId));
                }

                $possibleTerritoryFighters = array_values(array_filter($possibleTerritoryFighters, fn($fighter) => $fighter->power != POWER_BAVEUX));
                break;
            case MOVE_UNACTIVATE:
                $selectedFighterId = intval($this->getGameStateValue(PLAYER_SELECTED_FIGHTER));
                $selectedFighter = $this->getCardById($selectedFighterId);
                $territoriesIds = [$selectedFighter->locationArg, ...$this->getTerritoryNeighboursIds($selectedFighter->locationArg)];
                $opponentId = $this->getOpponentId($playerId);
                foreach($territoriesIds as $territoryId) {
                    $opponentFighters = $this->getCardsByLocation('territory', $territoryId, $opponentId);
                    $opponentFighters = array_values(array_filter($opponentFighters, fn($fighter) => !$fighter->played));
                    $possibleTerritoryFighters = array_merge($possibleTerritoryFighters, $opponentFighters);
                }
                $selectionSize = -1;
                break;
            case ACTION_FURY:
                $possibleTerritoryFighters = $this->getCardsByLocation('territory', null, $this->getOpponentId($playerId));
                $possibleTerritoryFighters = array_values(array_filter($possibleTerritoryFighters, fn($fighter) => $fighter->power != POWER_BAVEUX));
                $selectionSize = 2;
                break;
            case ACTION_RESET:
                $possibleTerritoryFighters = $this->getCardsByLocation('territory', null, $playerId);
                break;
            case ACTION_TELEPORT:
                $possibleTerritoryFighters = $this->getCardsByLocation('territory', null, $playerId);
                $selectionSize = 2;
                break;
        }


        return $args + [
           'possibleTerritoryFighters' => $possibleTerritoryFighters,
           'selectionSize' => $selectionSize,
           'optionalDetail' => $optionalDetail,
           'i18n' => ['optionalDetail'],
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
            case MOVE_PUSH:
            case MOVE_SUPER:
                // territories neighbours to current fighter
                $neighboursIds = $this->getTerritoryNeighboursIds($selectedFighter->locationArg);
                $opponentId = $this->getOpponentId($playerId);
                foreach($neighboursIds as $neighbourId) {
                    $opponentRooteds = $this->getCardsByLocation($selectedFighter->location, $neighbourId, $opponentId, null, 16);
                    if (!$this->array_some($opponentRooteds, fn($opponentRooted) => $opponentRooted->played)) {
                        $territoriesIds[] = $neighbourId;
                    }
                }

                if ($move == MOVE_MOVE) {
                    $scenarioId = $this->getScenarioId();
                    switch ($scenarioId) {
                        case 3:
                            $remainingMoves = intval($this->getGameStateValue(REMAINING_FIGHTERS_TO_MOVE_OR_ACTIVATE));
                            $remainingBonusMoves = count($this->getDiscoverTilesByLocation('player', $playerId, null, 2, POWER_COUP_FOURRE));
                            if ($remainingMoves + $remainingBonusMoves >= 2) {
                                $territoriesIds = array_merge($territoriesIds, $this->RIVER_CROSS_TERRITORIES[$selectedFighter->locationArg]);
                            }
                            break;
                        case 4:
                            if ($selectedFighter->subType == 1 && $selectedFighter->locationArg % 10 == 1) {
                                $scenario = $this->getScenario();
                                foreach ($scenario->battlefieldsIds as $battlefieldId) {
                                    foreach ($this->BATTLEFIELDS[$battlefieldId]->territories as $territory) {
                                        if ($territory->id != $selectedFighter->locationArg && $territory->lumens == 1) {
                                            $territoriesIds[] = $territory->id;
                                        }
                                    }
                                }
                            }
                            break;
                    }
                }
                break;
            case MOVE_FLY:
                $battlefieldsIds = $this->getBattlefieldsIds($selectedFighter->locationArg);
                if ($this->getScenarioId() == 7) {
                    if (in_array($selectedFighter->locationArg % 10, [6, 1, 3])) {
                        $battlefieldsIds = [6, 1, 3];
                    } else if (in_array($selectedFighter->locationArg % 10, [5, 4, 7])) {
                        $battlefieldsIds = [5, 4, 7];
                    }
                } // TODO check si on peut s'arrpeter sur le 2 depuis 1 3 6 ou si on doit d'arrêter avant. Et si on peut voler depuis le 2
                foreach ($battlefieldsIds as $battlefieldId) {
                    foreach ($this->BATTLEFIELDS[$battlefieldId]->territories as $territory) {
                        $territoriesIds[] = $territory->id;
                    }
                }
                break;
            case MOVE_IMPATIENT:
                $territoriesIds = [$selectedFighter->locationArg, ...$this->getTerritoryNeighboursIds($selectedFighter->locationArg)];
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
