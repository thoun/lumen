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
        if (!$operation || !$operation['possible']) {
            throw new BgaUserException("This operation is impossible at the moment");
        }
        
        $playerId = intval($this->getActivePlayerId());
        $firstPlayer = intval($this->getGameStateValue(FIRST_PLAYER));
        $isFirstPlayer = $playerId === $firstPlayer;
        if ($isFirstPlayer) {
            $this->setGameStateValue(FIRST_PLAYER_OPERATION, $type);
        }
        $this->setGameStateValue(PLAYER_OPERATION, $type);
        $this->setGameStateValue(PLAYER_NUMBER, $operation['value']);

        self::DbQuery("update operation set nb = nb + 1 where player_id = $playerId and operation = $type");

        self::notifyAllPlayers('setPlayedOperation', clienttranslate('${player_name} chooses value ${number} (operation ${operation})'), [
            'playerId' => $playerId,
            'player_name' => $this->getPlayerName($playerId),
            'number' => $operation['value'],
            'operation' => $type, // for log
            'type' => $type,
            'number' => intval(self::getUniqueValueFromDB( "SELECT nb from operation where player_id = $playerId and operation = $type")),
            'firstPlayer' => $isFirstPlayer,
        ]);

        /* TODO $this->incStat(1, 'operation'.$type);
        $this->incStat(1, 'operation'.$type, $playerId); */

        $this->gamestate->nextState('chooseCell');
    }

    public function cancelOperation() {
        $this->checkAction('cancelOperation'); 
        
        $playerId = intval($this->getActivePlayerId());

        $type = intval($this->getGameStateValue(PLAYER_OPERATION));

        self::DbQuery("update operation set nb = nb - 1 where player_id = $playerId and operation = $type");

        self::notifyAllPlayers('setCancelledOperation', clienttranslate('${player_name} cancels operation choice'), [
            'playerId' => $playerId,
            'player_name' => $this->getPlayerName($playerId),
            'type' => $type,
            'number' => intval(self::getUniqueValueFromDB( "SELECT nb from operation where player_id = $playerId and operation = $type")),
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

        $links = $this->getLinks($playerId);
        $possibleUpperLinkCirclesIds = $this->getPossibleLinkCirclesIds($playerId, $links, $cellId, $value, 1);
        $possibleLowerLinkCirclesIds = $this->getPossibleLinkCirclesIds($playerId, $links, $cellId, $value, -1);

        if (count($possibleUpperLinkCirclesIds) === 1) {
            $this->addLink($playerId, $cellId, $possibleUpperLinkCirclesIds[0]);
            $this->incGameStateValue(REMAINING_FIGHTERS_TO_MOVE_OR_ACTIVATE, 1);
        }
        if (count($possibleLowerLinkCirclesIds) === 1) {
            $this->addLink($playerId, $cellId, $possibleLowerLinkCirclesIds[0]);
            $this->incGameStateValue(REMAINING_FIGHTERS_TO_MOVE_OR_ACTIVATE, 1);
        }

        if (count($possibleUpperLinkCirclesIds) > 1 || count($possibleLowerLinkCirclesIds) > 1) {
            $this->gamestate->nextState('chooseCellLink');
            return;
        }

        /*$this->incStat(1, 'takeFromDiscard');
        $this->incStat(1, 'takeFromDiscard', $playerId);
        $this->updateCardsPoints($playerId);*/
        $this->gamestate->nextState('nextMove');
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

    public function chooseCellLink(int $cellId) {
        $this->checkAction('chooseCellLink'); 
        
        $playerId = intval($this->getActivePlayerId());
        
        $args = $this->argChooseCellLink();
        if (!in_array($cellId, $args['possibleLinkCirclesIds'])) {
            throw new BgaUserException("Invalid cell");
        }

        $fromCell = $args['cellId'];
        $this->addLink($playerId, $fromCell, $cellId);
        $this->incGameStateValue(REMAINING_FIGHTERS_TO_MOVE_OR_ACTIVATE, 1);

        /*$this->incStat(1, 'takeFromDiscard');
        $this->incStat(1, 'takeFromDiscard', $playerId);
        $this->updateCardsPoints($playerId);*/
        $this->gamestate->nextState('nextMove');
    }

    public function playFighter(int $id) {
        $this->checkAction('playFighter'); 
        
        $playerId = intval($this->getActivePlayerId());

        if (intval($this->getGameStateValue(REMAINING_FIGHTERS_TO_PLACE)) <= 0) {
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

        if ($this->getScenarioId() == 1 && $fighter->type == 10 && !$this->isRealizedObjective('A')) {
            $this->takeScenarioObjectiveToken($playerId, 'A');
            $this->setRealizedObjective('A');
        }

        $this->gamestate->nextState('chooseTerritory');
    }

    public function moveFighter(int $id) {
        $this->checkAction('moveFighter'); 
        
        $playerId = intval($this->getActivePlayerId());

        if (intval($this->getGameStateValue(REMAINING_FIGHTERS_TO_MOVE_OR_ACTIVATE)) <= 0) {
            throw new BgaUserException("No remaining action");
        }
        if (intval($this->getGameStateValue(PLAYER_CURRENT_MOVE)) > 0) {
            throw new BgaUserException("Impossible to move a fighter now");
        }

        $fighter = $this->getCardById($id);
        
        if ($fighter->playerId != $playerId || $fighter->location != 'territory') {
            throw new BgaUserException("Invalid fighter");
        }

        if ($fighter->power === POWER_BAVEUX) {
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
            $opponentTisseuses = $this->getCardsByLocation($fighter->location, $fighter->locationArg, $this->getOpponentId(), null, 15);
            if ($this->array_some($opponentTisseuses, fn($opponentTisseuse) => $opponentTisseuse->played)) {
                throw new BgaUserException("An opponent Tisseuse prevents you to leave the territory");
            }
        }

        $this->setGameStateValue(PLAYER_SELECTED_FIGHTER, $id);
        $this->setGameStateValue(PLAYER_CURRENT_MOVE, MOVE_MOVE);

        $this->gamestate->nextState('chooseTerritory');
    }

    public function activateFighter(int $id) {
        $this->checkAction('activateFighter'); 
        
        $playerId = intval($this->getActivePlayerId());
        $usedTile = null;

        if (intval($this->getGameStateValue(REMAINING_FIGHTERS_TO_MOVE_OR_ACTIVATE)) <= 0) {
            $tiles = $this->getDiscoverTilesByLocation('player', $playerId, null, 2, POWER_COUP_FOURRE);
            if ($tiles > 0) {
                $usedTile = $tiles[0];
            } else {
                throw new BgaUserException("No remaining action");
            }
        }
        if (intval($this->getGameStateValue(PLAYER_CURRENT_MOVE)) > 0) {
            throw new BgaUserException("Impossible to activate a fighter now");
        }

        $fighter = $this->getCardById($id);

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
        }

        if ($action) {
            $this->applyAction($fighter);
        } else {
            $this->applyActivateFighter($fighter);
        }

        if ($usedTile !== null) {
            $this->discardDiscoverTile($usedTile);
        }
    }

    public function chooseFighters(array $ids) {        
        $this->checkAction('chooseFighters'); 

        $args = $this->argChooseFighter();
        if ($args['selectionSize'] != count($ids)) {
            throw new BgaUserException("Invalid selection size");
        }
        $fighters = [];
        foreach($ids as $id) {
            if (!in_array($id, $args['possibleTerritoryFighters'])) {
                throw new BgaUserException("Invalid fighter");
            }
            $fighters[] = $this->getCardById($id);
        }
        $fighter = $fighters[0];

        $nextState = 'nextMove';
        switch ($fighter->power) {
            case POWER_PUSHER:                 
                $this->setGameStateValue(PLAYER_SELECTED_FIGHTER, $fighter->id);
                $nextState = 'chooseTerritory';
                break;
            case POWER_ASSASSIN:
                $this->putBackInBag([$fighter]);
                $this->checkTerritoriesDiscoverTileControl();
                break;
            case POWER_PACIFICATEUR:
                $this->setFightersActivated($fighters);
                break;
            case ACTION_FURY:
                if ($fighters[0]->locationArg == $fighters[1]->locationArg) {
                    throw new BgaUserException("You must select fighters of different trritories");
                }
                $this->putBackInBag($fighters);
                $this->checkTerritoriesDiscoverTileControl();
                break;
            case ACTION_RESET:
                $fighters = $this->getCardsByLocation($fighter->location, $fighter->locationArg);
                $this->putBackInBag($fighters);
                break;
            case ACTION_TELEPORT:
                $this->cards->moveCard($fighters[0]->id, 'territory', $fighters[1]->locationArg);
                $this->cards->moveCard($fighters[1]->id, 'territory', $fighters[0]->locationArg);
                $this->checkTerritoriesDiscoverTileControl();
        
                self::notifyAllPlayers("exchangedFighters", '', [
                    'fighters' => $fighters,
                ]);
                break;
        }

        $this->gamestate->nextState($nextState);
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

        $nextState = 'nextMove';
        switch ($move) {
            case MOVE_PLAY:
                $this->applyMoveFighter($selectedFighter, $territoryId);
                $this->incGameStateValue(REMAINING_FIGHTERS_TO_PLACE, -1);
                break;
            case MOVE_MOVE:
                $redirectBrouillage = $this->applyMoveFighter($selectedFighter, $territoryId);
                if ($redirectBrouillage) {
                    $nextState = 'chooseCellBrouillage';
                }
                $this->incGameStateValue(REMAINING_FIGHTERS_TO_MOVE_OR_ACTIVATE, -1);
                break;
            case MOVE_SUPER:
                $redirectBrouillage = $this->applyMoveFighter($selectedFighter, $territoryId);
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
                $redirectBrouillage = $this->applyMoveFighter($selectedFighter, $territoryId);
                if ($redirectBrouillage) {
                    $nextState = 'chooseCellBrouillage';
                }
                break;
            case POWER_IMPATIENT:
                $this->setGameStateValue(INITIATIVE_MARKER_TERRITORY, $territoryId);
                self::notifyAllPlayers('moveInitiativeMarker', clienttranslate('${player_name} moves the initiative marker'), [
                    'playerId' => $playerId,
                    'player_name' => $this->getPlayerName($playerId),
                    'territoryId' => $territoryId,
                ]);
                break;
        }

        $this->gamestate->nextState($nextState);
    }

    public function pass() {
        $this->checkAction('pass'); 

        $this->gamestate->nextState('nextPlayer');
    }
}
