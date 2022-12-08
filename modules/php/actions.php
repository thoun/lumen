<?php

trait ActionTrait {

    //////////////////////////////////////////////////////////////////////////////
    //////////// Player actions
    //////////// 
    
    /*
        Each time a player is doing some game action, one of the methods below is called.
        (note: each method below must match an input method in nicodemus.action.php)
    */

    public function activatePlanification() {
        $this->checkAction('activatePlanification'); 

        $this->gamestate->nextState('activate');
    }

    public function passPlanification() {
        $this->checkAction('passPlanification'); 

        $this->gamestate->nextState('pass');
    }

    public function chooseDiceFaces(int $die1, int $die2) {
        $this->checkAction('chooseDiceFaces'); 
        
        if ($die1 < 0 || $die1 > 5 || $die2 < 1 || $die2 > 6) {
            throw new BgaUserException("Invalid die face");
        }
        
        $playerId = intval($this->getActivePlayerId());

        $planificationTiles = $this->getDiscoverTilesByLocation('player', $playerId, null, 2, POWER_PLANIFICATION);
        if (count($planificationTiles) < 1) {
            throw new BgaUserException("No planification token");
        }

        $this->setGameStateValue(DIE1, $die1);
        $this->setGameStateValue(DIE2, $die2);

        $firstPlayer = intval($this->getGameStateValue(FIRST_PLAYER));
        self::notifyAllPlayers('diceChange', clienttranslate('${player_name} choses ${whiteDieFace} ${blackDieFace} with Planification'), [
            'player_name' => $this->getPlayerName($firstPlayer),
            'die1' => $die1,
            'die2' => $die2,
            'whiteDieFace' => $die1,
            'blackDieFace' => $die2,
        ]);

        // remove the used planification tile
        $this->discardDiscoverTile($planificationTiles[0]);

        $this->gamestate->nextState('chooseOperation');
    }

    public function chooseOperation(int $type) {
        $this->checkAction('chooseOperation'); 

        $args = $this->argChooseOperation();
        $operation = $args['operations'][$type];
        if (!$operation || $operation['disabled'] != null) {
            throw new BgaUserException("This operation is impossible at the moment");
        }
        
        $playerId = intval($this->getActivePlayerId());
        $firstPlayer = intval($this->getGameStateValue(FIRST_PLAYER));
        $isFirstPlayer = $playerId == $firstPlayer;
        if ($isFirstPlayer) {
            $this->setGameStateValue(FIRST_PLAYER_OPERATION, $type);
        }
        $this->setGameStateValue(PLAYER_OPERATION, $type);
        $this->setGameStateValue(PLAYER_NUMBER, $operation['value']);

        self::DbQuery("update operation set nb = nb + 1 where player_id = $playerId and operation = $type");

        self::notifyAllPlayers('setPlayedOperation', clienttranslate('${player_name} chooses value ${number} (operation ${operation})'), [
            'playerId' => $playerId,
            'player_name' => $this->getPlayerName($playerId),
            'number' => $operation['value'], // for log
            'operation' => $type, // for log
            'type' => $type,
            'operationsNumber' => intval(self::getUniqueValueFromDB( "SELECT nb from operation where player_id = $playerId and operation = $type")),
            'firstPlayer' => $isFirstPlayer,
        ]);

        /* TODO $this->incStat(1, 'operation'.$type);
        $this->incStat(1, 'operation'.$type, $playerId); */

        $this->gamestate->nextState('chooseCell');
    }

    public function cancelOperation() {
        $this->checkAction('cancelOperation'); 
        
        $playerId = intval($this->getActivePlayerId());
        $firstPlayer = intval($this->getGameStateValue(FIRST_PLAYER));
        $isFirstPlayer = $playerId == $firstPlayer;

        $type = intval($this->getGameStateValue(PLAYER_OPERATION));

        self::DbQuery("update operation set nb = nb - 1 where player_id = $playerId and operation = $type");

        self::notifyAllPlayers('setCancelledOperation', clienttranslate('${player_name} cancels operation choice'), [
            'playerId' => $playerId,
            'player_name' => $this->getPlayerName($playerId),
            'type' => $type,
            'operationsNumber' => intval(self::getUniqueValueFromDB( "SELECT nb from operation where player_id = $playerId and operation = $type")),
            'firstPlayer' => $isFirstPlayer,
        ]);

        $this->gamestate->nextState('cancel');
    }

    public function chooseCell(int $cellId) {
        $this->checkAction('chooseCell'); 
        $this->setGameStateValue(REMAINING_FIGHTERS_TO_PLACE, 0);
        $this->setGameStateValue(REMAINING_FIGHTERS_TO_MOVE_OR_ACTIVATE, 0);
        
        $playerId = intval($this->getActivePlayerId());
        
        $args = $this->argChooseCell();
        if (!in_array($cellId, $args['possibleCircles'])) {
            throw new BgaUserException("Invalid cell");
        }

        $this->setGameStateValue(PLAYER_CELL, $cellId);
        $value = intval($this->getGameStateValue(PLAYER_NUMBER));
        self::DbQuery("INSERT INTO circle (player_id, circle_id, value) VALUES ($playerId, $cellId, $value)");

        if ($value >= 7) {
            $this->incStat(1, 'figuresOver6', $playerId);
            $this->addCheck($playerId);
        }

        self::notifyAllPlayers('setCircleValue', '', [
            'playerId' => $playerId,
            'player_name' => $this->getPlayerName($playerId),
            'circleId' => $cellId,
            'value' => $value,
        ]);

        $newZoneCellCount = $this->refreshZones($playerId, $cellId);
        $this->setGameStateValue(REMAINING_FIGHTERS_TO_PLACE, $newZoneCellCount);
        if ($newZoneCellCount == 2) {
            $this->incStat(1, 'numberOfZones', $playerId);
        }

        $links = $this->getLinks($playerId);
        $currentCellInALink = false;
        $possibleUpperLinkCirclesIds = $this->getPossibleLinkCirclesIds($playerId, $links, $cellId, $value, 1);
        $possibleLowerLinkCirclesIds = $this->getPossibleLinkCirclesIds($playerId, $links, $cellId, $value, -1);

        if (count($possibleUpperLinkCirclesIds) === 1) {
            $this->addLink($playerId, $cellId, $possibleUpperLinkCirclesIds[0]);
            if (!$currentCellInALink) {
                $this->incGameStateValue(REMAINING_FIGHTERS_TO_MOVE_OR_ACTIVATE, 1);
                $currentCellInALink = true;
            }

            $isOtherCellInALink = $this->array_some($links, fn($link) => $link->index1 == $possibleUpperLinkCirclesIds[0] || $link->index2 == $possibleUpperLinkCirclesIds[0]);
            if (!$isOtherCellInALink) {
                $this->incGameStateValue(REMAINING_FIGHTERS_TO_MOVE_OR_ACTIVATE, 1);
            }
        }
        if (count($possibleLowerLinkCirclesIds) === 1) {
            $this->addLink($playerId, $cellId, $possibleLowerLinkCirclesIds[0]);
            if (!$currentCellInALink) {
                $this->incGameStateValue(REMAINING_FIGHTERS_TO_MOVE_OR_ACTIVATE, 1);
                $currentCellInALink = true;
            }

            $isOtherCellInALink = $this->array_some($links, fn($link) => $link->index1 == $possibleLowerLinkCirclesIds[0] || $link->index2 == $possibleLowerLinkCirclesIds[0]);
            if (!$isOtherCellInALink) {
                $this->incGameStateValue(REMAINING_FIGHTERS_TO_MOVE_OR_ACTIVATE, 1);
            }
        }

        if (count($possibleUpperLinkCirclesIds) > 1 || count($possibleLowerLinkCirclesIds) > 1) {
            $this->gamestate->nextState('chooseCellLink');
            return;
        }

        $this->gamestate->nextState('chooseAction');
    }

    public function chooseCellLink(int $cellId) {
        $this->checkAction('chooseCellLink'); 
        
        $playerId = intval($this->getActivePlayerId());
        
        $args = $this->argChooseCellLink();
        if (!in_array($cellId, $args['possibleLinkCirclesIds'])) {
            throw new BgaUserException("Invalid cell");
        }

        $fromCell = $args['cellId'];

        $links = $this->getLinks($playerId);
        $isOtherCellInALink = $this->array_some($links, fn($link) => $link->index1 == $cellId || $link->index2 == $cellId);
        $linkAddedToCurrentCell = $this->array_some($links, fn($link) => $link->index1 == $fromCell || $link->index2 == $fromCell);
        
        $this->addLink($playerId, $fromCell, $cellId);
        
        $this->incGameStateValue(REMAINING_FIGHTERS_TO_MOVE_OR_ACTIVATE, ($linkAddedToCurrentCell ? 0 : 1) + ($isOtherCellInALink ? 0 : 1));
        
        $this->gamestate->nextState('chooseAction');
    }

    public function chooseCellBrouillage(int $cellId) {
        $this->checkAction('chooseCellBrouillage'); 
        
        $playerId = intval($this->getActivePlayerId());
        $opponentId = $this->getOpponentId($playerId);
        
        $args = $this->argChooseCellBrouillage();
        if (!in_array($cellId, $args['possibleCircles'])) {
            throw new BgaUserException("Invalid cell");
        }

        self::DbQuery("INSERT INTO circle (player_id, circle_id, value) VALUES ($opponentId, $cellId, -1)");

        self::notifyAllPlayers('setCircleValue', clienttranslate('${player_name} Brouillage an opponent circle'), [
            'playerId' => $opponentId,
            'player_name' => $this->getPlayerName($playerId),
            'circleId' => $cellId,
            'value' => -1,
        ]);

        $nextState = 'nextMove';
        if (intval($this->getGameStateValue(PLAYER_CURRENT_MOVE)) == MOVE_SUPER) {
            $selectedFighterId = intval($this->getGameStateValue(PLAYER_SELECTED_FIGHTER));
            $selectedFighter = $this->getCardById($selectedFighterId);

            switch ($selectedFighter->power) {
                case POWER_PUSHER:
                    $this->setGameStateValue(PLAYER_CURRENT_MOVE, MOVE_PUSH);
                    break;
                case POWER_ASSASSIN:
                    $this->setGameStateValue(PLAYER_CURRENT_MOVE, MOVE_KILL);
                    break;
            }
            $nextState = 'chooseFighter';
        }

        $this->gamestate->nextState($nextState);
    }

    public function startWithAction(int $id) {
        $this->checkAction('startWithAction'); 
        if (!in_array($id, [1, 2])) {
            throw new BgaUserException("Invalid choice");
        }

        $this->setActionOrder($id);

        $this->gamestate->nextState('nextMove');
    }

    public function playFighter(int $id) {
        $this->checkAction('playFighter'); 
        
        $playerId = intval($this->getActivePlayerId());

        $currentAction = $this->getCurrentAction();
        if ($currentAction->type != 'PLACE' || $currentAction->remaining == 0) {
            throw new BgaUserException("No remaining action");
        }
        if (intval($this->getGameStateValue(PLAYER_CURRENT_MOVE)) > 0) {
            throw new BgaUserException("Impossible to play a fighter now");
        }

        $fighter = $this->getCardById($id);
        
        if ($fighter->playerId != $playerId || !in_array($fighter->location, ['reserve'.$playerId, 'highCommand'.$playerId])) {
            throw new BgaUserException("Invalid fighter");
        }
        if (!in_array($fighter->type, [1, 10])) {
            throw new BgaUserException("This is not a fighter");
        }

        $this->setGameStateValue(PLAYER_SELECTED_FIGHTER, $id);
        $this->setGameStateValue(PLAYER_CURRENT_MOVE, MOVE_PLAY);

        if ($this->getScenarioId() == 1 && $fighter->type == 10 && !$this->isRealizedObjective('1')) {
            $this->takeScenarioObjectiveToken($playerId, '1');
            $this->setRealizedObjective('1');
            $this->incStat(1, 'completedObjectives');
            $this->incStat(1, 'completedObjectives', $playerId);
        }

        $this->gamestate->nextState('chooseTerritory');
    }

    public function moveFighter(int $id) {
        $this->checkAction('moveFighter'); 
        
        //$playerId = intval($this->getActivePlayerId());

        $currentAction = $this->getCurrentAction();
        if ($currentAction->type != 'MOVE' || $currentAction->remaining == 0) {
            throw new BgaUserException("No remaining action");
        }
        if (intval($this->getGameStateValue(PLAYER_CURRENT_MOVE)) > 0) {
            throw new BgaUserException("Impossible to move a fighter now");
        }
        
        $args = $this->argChooseFighter();
        $possibleFightersToMove = $args['possibleFightersToMove'];
        if (!$this->array_some($possibleFightersToMove, fn($fighter) => $fighter->id == $id)) {
            throw new BgaUserException("Impossible to move this fighter");
        }

        $fighter = $this->getCardById($id);
        
        /* checked with possibleFightersToActivate 
        if ($fighter->playerId != $playerId || $fighter->location != 'territory') {
            throw new BgaUserException("Invalid fighter");
        }

        if ($fighter->power === POWER_BAVEUX && $this->getScenarioId() != 5) {
            throw new BgaUserException("The Baveux cannot be moved");
        }
        if ($fighter->power === POWER_TISSEUSE && $fighter->played) {
            throw new BgaUserException("The Tisseuse cannot be moved when activated");
        }
        if ($fighter->power === POWER_ROOTED && $fighter->played) {
            throw new BgaUserException("The Rooted cannot be moved when activated");
        }
        if ($fighter->power === POWER_METAMORPH && !$fighter->played) {
            throw new BgaUserException("The Metamorph cannot be moved until activated");
        }

        if ($fighter->location === 'territory') {
            $opponentTisseuses = $this->getCardsByLocation($fighter->location, $fighter->locationArg, $this->getOpponentId($playerId), null, 15);
            if ($this->array_some($opponentTisseuses, fn($opponentTisseuse) => $opponentTisseuse->played)) {
                throw new BgaUserException("An opponent Tisseuse prevents you to leave the territory");
            }

            if ($fighter->locationArg % 10 == 5 && $this->getScenarioId() == 5 && $fighter->power !== POWER_BAVEUX) {
                throw new BgaUserException("Only Baveux can move from a green territory");
            }
        }
        */

        $this->setGameStateValue(PLAYER_SELECTED_FIGHTER, $id);
        $this->setGameStateValue(PLAYER_CURRENT_MOVE, MOVE_MOVE);

        $this->gamestate->nextState('chooseTerritory');
    }

    public function activateFighter(int $id) {
        $this->checkAction('activateFighter'); 

        $currentAction = $this->getCurrentAction();
        if ($currentAction->type != 'MOVE' || $currentAction->remaining == 0) {
            throw new BgaUserException("No remaining action");
        }
        if (intval($this->getGameStateValue(PLAYER_CURRENT_MOVE)) > 0) {
            throw new BgaUserException("Impossible to activate a fighter now");
        }
        
        $args = $this->argChooseFighter();
        $possibleFightersToActivate = $args['possibleFightersToActivate'];
        if (!$this->array_some($possibleFightersToActivate, fn($fighter) => $fighter->id == $id)) {
            throw new BgaUserException("Impossible to activate this fighter");
        }

        $fighter = $this->getCardById($id);

        /* checked with possibleFightersToActivate 
        $action = $fighter->type === 20;
        if ($action) {
            if ($fighter->location != 'highCommand'.$playerId) {
                throw new BgaUserException("You can't activate this action");
            }
        } else {
            if ($fighter->playerId != $playerId || $fighter->location != 'territory') {
                throw new BgaUserException("Invalid fighter");
            }
        }
        if ($fighter->played) {
            throw new BgaUserException("This fighter is already played");
        }
        if (!$fighter->power || $fighter->power === POWER_BAVEUX) {
            throw new BgaUserException("This fighter has no activable power");
        }*/

        if ($fighter->type === 20) {
            $this->applyAction($fighter);
        } else {
            $this->applyActivateFighter($fighter);
        }
    }

    public function chooseFighters(array $ids) {        
        $this->checkAction('chooseFighters'); 
        
        $playerId = intval($this->getActivePlayerId());

        $args = $this->argChooseFighter();
        if ($args['move'] == MOVE_FURY) {
            if (count($ids) > $args['selectionSize']) {
                throw new BgaUserException("Invalid selection size");
            }
        } else {
            if (!in_array($args['selectionSize'], [-1, count($ids)])) {
                throw new BgaUserException("Invalid selection size");
            }
        }
        $fighters = [];
        $possibleTerritoryFightersIds = array_map(fn($fighter) => $fighter->id, $args['possibleTerritoryFighters']);
        foreach($ids as $id) {
            if (!in_array($id, $possibleTerritoryFightersIds)) {
                throw new BgaUserException("Invalid fighter");
            }
            $fighters[] = $this->getCardById($id);
        }
        $fighter = $fighters[0];

        $selectedFighterId = intval($this->getGameStateValue(PLAYER_SELECTED_FIGHTER));
        $selectedFighter = $this->getCardById($selectedFighterId);

        $nextState = 'nextMove';
        switch ($selectedFighter->power) {
            case POWER_PUSHER:                 
                $this->setGameStateValue(PLAYER_SELECTED_TARGET, $fighter->id);
                $this->incStat(1, 'activatedFighters', $playerId);
                $nextState = 'chooseTerritory';
                break;
            case POWER_ASSASSIN:
            case POWER_BOMBARDE:
                $this->putBackInBag([$fighter]);
                $this->checkTerritoriesDiscoverTileControl($playerId);
                $this->incStat(1, 'activatedFighters', $playerId);
                
                self::notifyAllPlayers('log', clienttranslate('${player_name} activates ${fighterType} to kill ${fighterType2} on ${season} territory ${battlefieldId}'), [
                    'playerId' => $playerId,
                    'player_name' => $this->getPlayerName($playerId),
                    'fighterType' => $selectedFighter->subType, // for logs
                    'fighterType2' => $fighter->subType, // for logs
                    'season' => $this->getSeasonName($this->TERRITORIES[$fighter->locationArg]->lumens),
                    'battlefieldId' => floor($fighter->locationArg / 10),
                    'i18n' => ['season'],
                    'preserve' => ['playerId', 'fighterType', 'fighterType2'],
                ]);
                break;
            case POWER_PACIFICATEUR:
                $this->setFightersActivated($fighters);
                $this->incStat(1, 'activatedFighters', $playerId);
                
                self::notifyAllPlayers('log', clienttranslate('${player_name} activates ${fighterType} to set surrounding opponents to their inactive face'), [
                    'playerId' => $playerId,
                    'player_name' => $this->getPlayerName($playerId),
                    'fighterType' => $selectedFighter->subType, // for logs
                    'i18n' => ['season'],
                    'preserve' => ['playerId', 'fighterType'],
                ]);
                break;

            case ACTION_FURY:
                if (count($fighters) >= 2 && $fighters[0]->locationArg == $fighters[1]->locationArg) {
                    throw new BgaUserException("You must select fighters of different territories");
                }
                $this->putBackInBag(array_merge($fighters, [$selectedFighter]));
                $this->incStat(1, 'playedActions', $playerId);
                $this->checkTerritoriesDiscoverTileControl($playerId);
                
                foreach($fighters as $iFighter) {
                    self::notifyAllPlayers('log', clienttranslate('${player_name} activates ${fighterType} to kill ${fighterType2} on ${season} territory ${battlefieldId}'), [
                        'playerId' => $playerId,
                        'player_name' => $this->getPlayerName($playerId),
                        'fighterType' => $selectedFighter->subType, // for logs
                        'fighterType2' => $iFighter->subType, // for logs
                        'season' => $this->getSeasonName($this->TERRITORIES[$iFighter->locationArg]->lumens),
                        'battlefieldId' => floor($iFighter->locationArg / 10),
                        'i18n' => ['season'],
                        'preserve' => ['playerId', 'fighterType', 'fighterType2'],
                    ]);
                }
                break;
            case ACTION_RESET:
                $fighters = $this->getCardsByLocation($fighter->location, $fighter->locationArg);
                $this->putBackInBag(array_merge($fighters, [$selectedFighter]));
                $this->incStat(1, 'playedActions', $playerId);
                
                foreach($fighters as $iFighter) {
                    self::notifyAllPlayers('log', clienttranslate('${player_name} activates ${fighterType} to kill ${fighterType2} on ${season} territory ${battlefieldId}'), [
                        'playerId' => $playerId,
                        'player_name' => $this->getPlayerName($playerId),
                        'fighterType' => $selectedFighter->subType, // for logs
                        'fighterType2' => $iFighter->subType, // for logs
                        'season' => $this->getSeasonName($this->TERRITORIES[$iFighter->locationArg]->lumens),
                        'battlefieldId' => floor($iFighter->locationArg / 10),
                        'i18n' => ['season'],
                        'preserve' => ['playerId', 'fighterType', 'fighterType2'],
                    ]);
                }
                break;
            case ACTION_TELEPORT:
                $this->cards->moveCard($fighters[0]->id, 'territory', $fighters[1]->locationArg);
                $this->cards->moveCard($fighters[1]->id, 'territory', $fighters[0]->locationArg);
                $this->putBackInBag([$selectedFighter]);
                $this->incStat(1, 'playedActions', $playerId);
                $this->checkTerritoriesDiscoverTileControl($playerId);
        
                self::notifyAllPlayers("exchangedFighters", clienttranslate('${player_name} activates ${fighterType} to exchange ${fighterType2} with ${fighterType3}'), [
                    'fighters' => $fighters,
                    'playerId' => $playerId,
                    'player_name' => $this->getPlayerName($playerId),
                    'fighterType' => $selectedFighter->subType, // for logs
                    'fighterType2' => $fighters[0]->subType, // for logs
                    'fighterType3' => $fighters[1]->subType, // for logs
                    'preserve' => ['playerId', 'fighterType', 'fighterType2', 'fighterType3'],
                ]);
                break;
        }
        if (in_array($nextState, ['nextMove', 'chooseCellBrouillage'])) {
            $this->incMoveCount(-1);
        }

        $this->gamestate->nextState($nextState);
    }

    public function cancelChooseFighters() {
        $this->checkAction('cancelChooseFighters');

        $args = $this->argChooseFighter();

        if (in_array($args['move'], [MOVE_PUSH, MOVE_KILL, MOVE_UNACTIVATE])) {
            $selectedFighter = $this->getCardById(intval($this->getGameStateValue(PLAYER_SELECTED_FIGHTER)));
            $this->setFightersUnactivated([$selectedFighter]);
        }

        $this->setGameStateValue(PLAYER_SELECTED_FIGHTER, 0);
        $this->setGameStateValue(PLAYER_CURRENT_MOVE, 0);

        $this->gamestate->nextState('cancel');
    }

    public function passChooseFighters() {        
        $this->checkAction('passChooseFighters');

        $this->gamestate->nextState('nextMove');
    }

    public function useCoupFourre() {        
        $this->checkAction('useCoupFourre');
        
        $playerId = intval($this->getActivePlayerId());

        $tiles = $this->getDiscoverTilesByLocation('player', $playerId, null, 2, POWER_COUP_FOURRE);
        if (count($tiles) < 1) {
            throw new BgaUserException("No POWER_COUP_FOURRE tile");
        }
        $this->discardDiscoverTile($tiles[0]);

        $this->incMoveCount(1, true);

        $this->gamestate->nextState('useCoupFourre');
    }

    public function chooseTerritory(int $territoryId) {
        $this->checkAction('chooseTerritory'); 
        
        $playerId = intval($this->getActivePlayerId());

        $args = $this->argChooseTerritory();
        $selectedFighter = $args['selectedFighter'];

        if ($selectedFighter == null) {
            throw new BgaUserException("No selected fighter");
        }
        
        $move = $args['move'];
        if ($move <= 0) {
            throw new BgaUserException("No selected move");
        }

        if (!in_array($territoryId, $args['territoriesIds'])) {
            throw new BgaUserException("Invalid territory");
        }

        $inc = 1;

        $nextState = 'nextMove';
        switch ($move) {
            case MOVE_PLAY:
                $this->applyMoveFighter($selectedFighter, $territoryId, clienttranslate('${player_name} plays ${fighterType} on ${season} territory ${battlefieldId}'));
                $this->incStat(1, 'placedFighters', $playerId);
                if ($selectedFighter->type == 10) {                    
                    $this->incStat(1, 'placedMercenaries', $playerId);
                }
                $this->checkTerritoriesDiscoverTileControl($playerId);
                break;
            case MOVE_MOVE:
                $originTerritoryId = $selectedFighter->locationArg;
                $redirectBrouillage = $this->applyMoveFighter($selectedFighter, $territoryId, clienttranslate('${player_name} moves ${fighterType} from ${originSeason} territory ${originBattlefieldId} to ${season} territory ${battlefieldId}'), [
                    'originSeason' => $this->getSeasonName($this->TERRITORIES[$originTerritoryId]->lumens),
                    'originBattlefieldId' => floor($originTerritoryId / 10),
                    'i18n' => ['originSeason'],
                ]);
                if ($redirectBrouillage) {
                    $nextState = 'chooseCellBrouillage';
                }

                if ($this->getScenarioId() == 3 && array_key_exists($originTerritoryId, $this->RIVER_CROSS_TERRITORIES) && in_array($territoryId, $this->RIVER_CROSS_TERRITORIES[$originTerritoryId])) {
                    $inc = 2;
                }
                $this->incStat(1, 'movedFighters', $playerId);
                break;
            case MOVE_SUPER:
                $originTerritoryId = $selectedFighter->locationArg;
                $redirectBrouillage = $this->applyMoveFighter($selectedFighter, $territoryId, clienttranslate('${player_name} moves ${fighterType} from ${originSeason} territory ${originBattlefieldId} to ${season} territory ${battlefieldId}'), [
                    'originSeason' => $this->getSeasonName($this->TERRITORIES[$originTerritoryId]->lumens),
                    'originBattlefieldId' => floor($originTerritoryId / 10),
                    'i18n' => ['originSeason'],
                ]);
                if ($redirectBrouillage) {
                    $nextState = 'chooseCellBrouillage';
                } else {
                    switch ($selectedFighter->power) {
                        case POWER_PUSHER:
                            $this->setGameStateValue(PLAYER_CURRENT_MOVE, MOVE_PUSH);
                            break;
                        case POWER_ASSASSIN:
                            $this->setGameStateValue(PLAYER_CURRENT_MOVE, MOVE_KILL);
                            break;
                    }
                    $nextState = 'chooseFighter';
                }
                break;
            case MOVE_PUSH:
                $originTerritoryId = $selectedFighter->locationArg;
                $redirectBrouillage = $this->applyMoveFighter($selectedFighter, $territoryId, clienttranslate('${player_name} pushes ${fighterType} from ${originSeason} territory ${originBattlefieldId} to ${season} territory ${battlefieldId}'), [
                    'originSeason' => $this->getSeasonName($this->TERRITORIES[$originTerritoryId]->lumens),
                    'originBattlefieldId' => floor($originTerritoryId / 10),
                    'i18n' => ['originSeason'],
                ]);
                if ($redirectBrouillage) {
                    $nextState = 'chooseCellBrouillage';
                }
                break;
            case MOVE_FLY:
                $originTerritoryId = $selectedFighter->locationArg;
                $redirectBrouillage = $this->applyMoveFighter($selectedFighter, $territoryId, clienttranslate('${player_name} flies ${fighterType} from ${originSeason} territory ${originBattlefieldId} to ${season} territory ${battlefieldId}'), [
                    'originSeason' => $this->getSeasonName($this->TERRITORIES[$originTerritoryId]->lumens),
                    'originBattlefieldId' => floor($originTerritoryId / 10),
                    'i18n' => ['originSeason'],
                ]);
                if ($redirectBrouillage) {
                    $nextState = 'chooseCellBrouillage';
                }
                break;
            case MOVE_IMPATIENT:
                $this->setGameStateValue(INITIATIVE_MARKER_TERRITORY, $territoryId);
                self::notifyAllPlayers('moveInitiativeMarker', clienttranslate('${player_name} activates ${fighterType} to move the initiative marker to ${season} territory ${battlefieldId}'), [
                    'playerId' => $playerId,
                    'player_name' => $this->getPlayerName($playerId),
                    'territoryId' => $territoryId,
                    'fighterType' => $selectedFighter->subType, // for logs
                    'season' => $this->getSeasonName($this->TERRITORIES[$territoryId]->lumens),
                    'battlefieldId' => floor($territoryId / 10),
                    'i18n' => ['season'],
                    'preserve' => ['playerId', 'fighterType'],
                ]);
                $this->incStat(1, 'activatedFighters', $playerId);
                break;
        }
        if (in_array($nextState, ['nextMove', 'chooseCellBrouillage'])) {
            if ($move == MOVE_PLAY) {
                $this->incPlaceCount(-1);
            } else {
                $this->incMoveCount(-$inc);
            }
        }

        $this->gamestate->nextState($nextState);
    }

    public function cancelChooseTerritory() {
        $this->checkAction('cancelChooseTerritory'); 

        $args = $this->argChooseTerritory();
        if(!$args['canCancel']) {
            throw new BgaUserException("Cancel is not available");
        }

        if (in_array($args['move'], [MOVE_SUPER, MOVE_FLY, MOVE_IMPATIENT])) {
            $selectedFighter = $this->getCardById(intval($this->getGameStateValue(PLAYER_SELECTED_FIGHTER)));
            $this->setFightersUnactivated([$selectedFighter]);
        }

        $this->setGameStateValue(PLAYER_SELECTED_FIGHTER, 0);
        $this->setGameStateValue(PLAYER_CURRENT_MOVE, 0);

        $this->gamestate->nextState('cancel');
    }

    public function pass() {
        $this->checkAction('pass'); 

        $this->gamestate->nextState('nextPlayer');
    }
}
