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

    public function chooseCell(int $cellId) {
        $this->checkAction('chooseCell'); 
        
        $playerId = intval($this->getActivePlayerId());
        
        $args = $this->argChooseCell();
        if (!in_array($cellId, $args['possibleCircles'])) {
            throw new BgaUserException("Invalid cell");
        }

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

        $this->refreshZones($playerId, $cellId);

        /*$this->incStat(1, 'takeFromDiscard');
        $this->incStat(1, 'takeFromDiscard', $playerId);
        TODO update zones and links
        $this->updateCardsPoints($playerId);*/
        $this->gamestate->nextState('nextPlayer');
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
}
