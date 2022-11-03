<?php

trait ActionTrait {

    //////////////////////////////////////////////////////////////////////////////
    //////////// Player actions
    //////////// 
    
    /*
        Each time a player is doing some game action, one of the methods below is called.
        (note: each method below must match an input method in nicodemus.action.php)
    */

    public function chooseOperation(int $type) {
        $this->checkAction('chooseOperation'); 

        $args = $this->argChooseOperation();
        $operation = $args['operations'][$type];
        if (!$operation || !$operation['possible']) {
            throw new BgaUserException("This operation is impossible at the moment");
        }
        
        $playerId = intval($this->getActivePlayerId());
        $firstPlayer = intval($this->getGameStateValue(FIRST_PLAYER));
        if ($playerId === $firstPlayer) {
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

        $fighter = $this->getCardById($id);
        
        if ($fighter->playerId != $playerId || !in_array($fighter->location, ['reserve'.$playerId, 'highCommand'.$playerId])) {
            throw new BgaUserException("Invalid fighter");
        }

        $this->setGameStateValue(PLAYER_SELECTED_FIGHTER, $id);
        $this->setGameStateValue(PLAYER_CURRENT_MOVE, MOVE_PLAY);

        $this->gamestate->nextState('chooseTerritory');
    }

    public function moveFighter(int $id) {
        $this->checkAction('moveFighter'); 
        
        $playerId = intval($this->getActivePlayerId());

        if (intval($this->getGameStateValue(REMAINING_FIGHTERS_TO_MOVE_OR_ACTIVATE)) <= 0) {
            throw new BgaUserException("No remaining action");
        }

        $fighter = $this->getCardById($id);
        
        if ($fighter->playerId != $playerId || $fighter->location != 'territory') {
            throw new BgaUserException("Invalid fighter");
        }

        $this->setGameStateValue(PLAYER_SELECTED_FIGHTER, $id);
        $this->setGameStateValue(PLAYER_CURRENT_MOVE, MOVE_MOVE);

        $this->gamestate->nextState('chooseTerritory');
    }

    public function activateFighter(int $id) {
        $this->checkAction('moveFighter'); 
        
        $playerId = intval($this->getActivePlayerId());

        if (intval($this->getGameStateValue(REMAINING_FIGHTERS_TO_MOVE_OR_ACTIVATE)) <= 0) {
            throw new BgaUserException("No remaining action");
        }

        $fighter = $this->getCardById($id);
        
        if ($fighter->playerId != $playerId || $fighter->location != 'territory') {
            throw new BgaUserException("Invalid fighter");
        }
        if ($fighter->played) {
            throw new BgaUserException("This fighter is already played");
        }

        $this->setGameStateValue(PLAYER_SELECTED_FIGHTER, $id);
        $this->setGameStateValue(PLAYER_CURRENT_MOVE, MOVE_ACTIVATE);

        // TODO
        $this->gamestate->nextState('chooseTerritory');
    }

    public function chooseTerritory(int $territoryId) {
        $this->checkAction('chooseTerritory'); 
        
        $playerId = intval($this->getActivePlayerId());

        $selectedFighterId = intval($this->getGameStateValue(PLAYER_SELECTED_FIGHTER));

        if ($selectedFighterId <= 0) {
            throw new BgaUserException("No selected fighter");
        }

        $selectedFighter = $this->getCardById($selectedFighterId);

        $move = intval($this->getGameStateValue(PLAYER_CURRENT_MOVE));
        if ($move <= 0) {
            throw new BgaUserException("No selected move");
        }

        switch ($move) {
            case MOVE_PLAY:
                $this->applyMoveFighter($selectedFighter, $territoryId);
                $this->incGameStateValue(REMAINING_FIGHTERS_TO_PLACE, -1);
                break;
            case MOVE_MOVE:
                $this->applyMoveFighter($selectedFighter, $territoryId);
                $this->incGameStateValue(REMAINING_FIGHTERS_TO_MOVE_OR_ACTIVATE, -1);
                break;
        }

        $this->gamestate->nextState('nextMove');
    }
}
