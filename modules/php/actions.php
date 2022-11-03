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
        $this->gamestate->nextState('nextPlayer'); // TODO
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
        $this->gamestate->nextState('nextPlayer'); // TODO
    }
}
