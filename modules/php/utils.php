<?php

require_once(__DIR__.'/objects/circle.php');

trait UtilTrait {

    //////////////////////////////////////////////////////////////////////////////
    //////////// Utility functions
    ////////////

    function array_find(array $array, callable $fn) {
        foreach ($array as $value) {
            if($fn($value)) {
                return $value;
            }
        }
        return null;
    }

    function array_find_key(array $array, callable $fn) {
        foreach ($array as $key => $value) {
            if($fn($value)) {
                return $key;
            }
        }
        return null;
    }

    function array_some(array $array, callable $fn) {
        foreach ($array as $value) {
            if($fn($value)) {
                return true;
            }
        }
        return false;
    }
    
    function array_every(array $array, callable $fn) {
        foreach ($array as $value) {
            if(!$fn($value)) {
                return false;
            }
        }
        return true;
    }

    function array_identical(array $a1, array $a2) {
        if (count($a1) != count($a2)) {
            return false;
        }
        for ($i=0;$i<count($a1);$i++) {
            if ($a1[$i] != $a2[$i]) {
                return false;
            }
        }
        return true;
    }

    function getPlayersIds() {
        return array_keys($this->loadPlayersBasicInfos());
    }

    function getPlayerName(int $playerId) {
        return self::getUniqueValueFromDB("SELECT player_name FROM player WHERE player_id = $playerId");
    }

    function getPlayerChecks(int $playerId) {
        return intval(self::getUniqueValueFromDB("SELECT checks FROM player WHERE player_id = $playerId"));
    }

    function getFirstPlayerId() {
        return intval(self::getGameStateValue(FIRST_PLAYER));
    }
    function getOpponentId(int $playerId) {
        return intval(self::getUniqueValueFromDB("SELECT player_id FROM player WHERE player_id <> $playerId"));
    }

    function getScenarioId() {
        return intval($this->getGameStateValue(SCENARIO_OPTION));
    }

    function getScenario() {
    return $this->SCENARIOS[/* TODO $this->getScenarioId()*/ 1];
    }
    
    function getOpMax(int $type) {
        return $type > 2 ? 4 : 3;
    }
    
    function getValue(int $val1, int $val2, int $type) {        
        $value = 0;
        switch($type)
        {
            case 1:
                $value = min($val1, $val2);
                break;
            case 2:
                $value = max($val1, $val2);
                break;
            case 3:
                $value = abs($val1-$val2);
                break;
            case 4:
                $value = $val1+$val2;
                break;
            case 5:
                $value = $val1*$val2;
                break;
        }
        return $value;
    }

    function getCardsByLocation(string $location, /*int|null*/ $location_arg = null, /*int|null*/ $type = null, /*int|null*/ $subType = null) {
        $sql = "SELECT * FROM `card` WHERE `card_location` = '$location'";
        if ($location_arg !== null) {
            $sql .= " AND `card_location_arg` = $location_arg";
        }
        if ($type !== null) {
            $sql .= " AND `card_type` = $type";
        }
        if ($subType !== null) {
            $sql .= " AND `card_type_arg` = $type";
        }
        $sql .= " ORDER BY `card_location_arg`";
        $dbResults = $this->getCollectionFromDb($sql);
        return array_map(fn($dbCard) => new Card($dbCard, $this->CARDS), array_values($dbResults));
    }

    function setupCards(array $players) {
        foreach($players as $playerId => $player) {
            $cards = [];
            foreach ($this->CARDS as $subType => $cardType) {
                if ($cardType->type === 1) {
                    $cards[] = [ 'type' => intval($player['player_table_order']), 'type_arg' => $subType, 'nbr' => $cardType->number ];
                }
            }
            $this->cards->createCards($cards, 'bag'.$playerId);
            $this->cards->shuffle('bag'.$playerId);
        }

        $cards = [];
        foreach ($this->CARDS as $subType => $cardType) {
            if ($cardType->type !== 1) {
                $cards[] = [ 'type' => $cardType->type, 'type_arg' => $subType, 'nbr' => $cardType->number ];
            }
        }
        $this->cards->createCards($cards, 'bag0');
        $this->cards->shuffle('bag0');
    }

    function setupDiscoverTiles() {
        // TODO
    }

    function initScenario(array $players) {
        $scenario = $this->getScenario();
        $playersIdsByPlayerNo = [];
        foreach($players as $playerId => $player) {
            $playersIdsByPlayerNo[intval($player['player_table_order'])] = intval($playerId);
        }

        foreach ($scenario->initialFighters as $territoryId => $playerFighters) {
            foreach ($playerFighters as $playerNo => $fightersSubType) {
                foreach($fightersSubType as $fighterSubType) {
                    $card = array_values($this->cards->getCardsOfTypeInLocation($playerNo, $fighterSubType, 'bag'.$playersIdsByPlayerNo[$playerNo]))[0];
                    $this->cards->moveCard($card['id'], 'territory', $territoryId);
                }
            }
        }
    }

    function initPlayersCards(array $players) {
        foreach($players as $playerId => $player) {
            for ($i=1; $i<=3; $i++) {
                $this->cards->pickCardForLocation('bag'.$playerId, 'reserve'.$playerId, $i); // TODO check translation
            }
        }
    }

    function getTerritoryNeighbours(int $territoryId, int $scenarioId) {
        $scenario = $this->SCENARIOS[$scenarioId];

        $neighboursId = [];

        foreach ($scenario->battlefieldsIds as $battlefieldId) {
            $battlefield = $this->BATTLEFIELDS[$battlefieldId];
            foreach ($battlefield->territoriesLinks as $from => $tos) {
                if ($from == $territoryId) {
                    $neighboursId = array_merge($neighboursId, $tos);
                }
                if (in_array($territoryId, $tos)) {
                    $neighboursId = $from;
                }
            }
        }

        foreach ($scenario->territoriesLinks as $from => $tos) {
            if ($from == $territoryId) {
                $neighboursId = array_merge($neighboursId, $tos);
            }
            if (in_array($territoryId, $tos)) {
                $neighboursId = $from;
            }
        }

        return array_values(array_unique($neighboursId));
    }

    function addCheck(int $playerId) {
        $checks = $this->getPlayerChecks($playerId);

        if ($checks > 7) {
            return;
        }
        self::DbQuery("update player set checks = checks + 1 where player_id = $playerId");
        $checks++;
        self::notifyAllPlayers('addCheck', clienttranslate('${player_name} checks a box in the high command section'), [ // TODO check translation
            'playerId' => $playerId,
            'player_name' => $this->getPlayerName($playerId),
            'checks' => $checks,
        ]);

        $slot = $this->SLOTS_BY_CHECKS[$checks];

        if ($slot > 0) {
            $this->cards->pickCardForLocation('bag'.$playerId, 'highCommand'.$playerId, $slot); // TODO check translation
            $card = $this->getCardsByLocation('highCommand'.$playerId, $slot)[0];
            self::notifyAllPlayers('addHighCommandCard', clienttranslate('${player_name} get a new high command card'), [ // TODO check translation
                'playerId' => $playerId,
                'player_name' => $this->getPlayerName($playerId),
                'card' => $card,
            ]);
        }
    }

    function setFirstPlayer(int $playerId) {
        $this->setGameStateValue(FIRST_PLAYER, $playerId);

        self::notifyAllPlayers('newFirstPlayer', clienttranslate('${player_name} is the new first player'), [
            'playerId' => $playerId,
        ]);
    }

    function getTerritoryControlledPlayer(int $territoryId) {
        $territoryControlledPlayer = null;
        $players = $this->loadPlayersBasicInfos();
        $fightersOnTerritory = $this->getCardsByLocation('territory', $territoryId);
        $strengthByPlayer = [];
        foreach ($players as $playerId => $player) {
            $playerFighters = array_values(array_filter($fightersOnTerritory, fn($fighter) => $fighter->type == intval($player['player_no'])));
            $playerFightersStrengthes = array_map(fn($fighter) => $fighter->strength, $playerFighters);
            $strengthByPlayer[$playerId] = array_reduce($playerFightersStrengthes, fn($a, $b) => $a + $b, 0);
        }

        if ($strengthByPlayer[array_keys($strengthByPlayer)[0]] > $strengthByPlayer[array_keys($strengthByPlayer)[1]]) {
            $territoryControlledPlayer = array_keys($strengthByPlayer)[0];
        } else if ($strengthByPlayer[array_keys($strengthByPlayer)[1]] > $strengthByPlayer[array_keys($strengthByPlayer)[0]]) {
            $territoryControlledPlayer = array_keys($strengthByPlayer)[1];
        }

        return $territoryControlledPlayer;
    }

    function getCircles(int $playerId) {
        $dbCircles = $this->getCollectionFromDb( "SELECT * FROM `circle` WHERE player_id = $playerId ORDER BY `circle_id`");
        $circles = [];
        foreach ($this->CIRCLE_NEIGHBOURS as $circleId => $neighbours) {
            $dbCircle = $this->array_find($dbCircles, fn($dbCircle) => intval($dbCircle['circle_id']) == $circleId);
            if ($dbCircle !== null) {
                $circle = new Circle($circleId, intval($dbCircle['value']), intval($dbCircle['zone']));
            } else {
                $circle = new Circle($circleId);
            }
            $circle->neighbours = $neighbours;
            $circles[] = $circle;
        }
        return $circles;
    }

}
