<?php

require_once(__DIR__.'/objects/circle.php');
require_once(__DIR__.'/objects/discover-tile.php');

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
    return $this->SCENARIOS[$this->getScenarioId()];
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

    function getCardById(int $id) {
        $sql = "SELECT * FROM `card` WHERE `card_id` = $id";
        $dbResults = $this->getCollectionFromDb($sql);
        $cards = array_map(fn($dbCard) => new Card($dbCard, $this->CARDS), array_values($dbResults));
        return count($cards) > 0 ? $cards[0] : null;
    }

    function getCardsByLocation(string $location, /*int|null*/ $location_arg = null, /*int|null*/ $playerId = null, /*int|null*/ $type = null, /*int|null*/ $subType = null) {
        $sql = "SELECT * FROM `card` WHERE `card_location` = '$location'";
        if ($location_arg !== null) {
            $sql .= " AND `card_location_arg` = $location_arg";
        }
        if ($playerId !== null) {
            $sql .= " AND `player_id` = $playerId";
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
            self::DbQuery("update card set player_id = $playerId WHERE card_location='bag$playerId'");
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

    function getDiscoverTilesByLocation(string $location, /*int|null*/ $location_arg = null, /*int|null*/ $type = null, /*int|null*/ $subType = null) {
        $sql = "SELECT * FROM `discover_tile` WHERE `card_location` = '$location'";
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
        return array_map(fn($dbCard) => new DiscoverTile($dbCard, $this->DISCOVER_TILES), array_values($dbResults));
    }

    function setupDiscoverTiles() {
        foreach ($this->DISCOVER_TILES as $tile) {
            $cards[] = [ 'type' => $tile->type, 'type_arg' => $tile->power, 'nbr' => $tile->number ];
        }
        $this->discoverTiles->createCards($cards, 'deck');
        $this->discoverTiles->shuffle('deck');
    }

    function setupObjectiveTokens() {
        for ($i=3;$i<=5;$i++) {
            $cards[] = [ 'type' => $i, 'type_arg' => null, 'nbr' => 7 ];
        }
        $this->objectiveTokens->createCards($cards, 'deck');
        $this->objectiveTokens->shuffle('deck');
    }

    function initScenario(array $players) {
        $scenario = $this->getScenario();
        $playersIdsByPlayerNo = [];
        $territoriesWithFighters = [];
        foreach($players as $playerId => $player) {
            $playersIdsByPlayerNo[intval($player['player_table_order'])] = intval($playerId);
        }


        // initial fighters
        foreach ($scenario->initialFighters as $territoryId => $playerFighters) {
            foreach ($playerFighters as $playerNo => $fightersSubType) {
                foreach($fightersSubType as $fighterSubType) {
                    $card = array_values($this->cards->getCardsOfTypeInLocation($playerNo, $fighterSubType, 'bag'.$playersIdsByPlayerNo[$playerNo]))[0];
                    $this->cards->moveCard($card['id'], 'territory', $territoryId);
                    $territoriesWithFighters[] = $territoryId;
                }
            }
        }

        // discover tiles
        foreach ($scenario->battlefieldsIds as $battlefieldId) {
            foreach ($this->BATTLEFIELDS[$battlefieldId]->territories as $territory) {
                if (!in_array($territory->id, $territoriesWithFighters)) {
                    $this->discoverTiles->pickCardForLocation('deck', 'territory', $territory->id);
                }
            }
        }

        // initiative marker
        $this->setGameStateValue(INITIATIVE_MARKER_TERRITORY, $scenario->initiative);
    }

    function initPlayersCards(array $players) {
        foreach($players as $playerId => $player) {
            for ($i=1; $i<=3; $i++) {
                $this->cards->pickCardForLocation('bag'.$playerId, 'reserve'.$playerId, $i); // TODO check translation
            }
        }
    }

    function getTerritoryNeighboursIds(int $territoryId) {
        $scenario = $this->SCENARIOS[$this->getScenarioId()];

        $neighboursId = [];

        foreach ($scenario->battlefieldsIds as $battlefieldId) {
            $battlefield = $this->BATTLEFIELDS[$battlefieldId];
            foreach ($battlefield->territoriesLinks as $from => $tos) {
                if ($from == $territoryId) {
                    if ($neighboursId == null || $tos == null) {
                    }
                    $neighboursId = array_merge($neighboursId, $tos);
                }
                if (in_array($territoryId, $tos)) {
                    $neighboursId[] = $from;
                }
            }
        }

        foreach ($scenario->territoriesLinks as $from => $tos) {
            if ($from == $territoryId) {
                $neighboursId = array_merge($neighboursId, $tos);
            }
            if (in_array($territoryId, $tos)) {
                $neighboursId[] = $from;
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
            self::DbQuery("update card set player_id = $playerId WHERE card_id=$card->id");
            $card->playerId = $playerId;

            self::notifyAllPlayers('addHighCommandCard', clienttranslate('${player_name} get a new high command card'), [ // TODO check translation
                'playerId' => $playerId,
                'player_name' => $this->getPlayerName($playerId),
                'card' => $card,
            ]);
        }
    }

    function setFirstPlayer(int $playerId, bool $withInitiativeMarker) {
        $this->setGameStateValue(FIRST_PLAYER, $playerId);

        $message = $withInitiativeMarker ?
            clienttranslate('${player_name} is the new first player because he controls initiative marker') :
            clienttranslate('${player_name} is the new first player because no-one controls initiative marker so first player changes');
        self::notifyAllPlayers('newFirstPlayer', $message, [
            'playerId' => $playerId,
            'player_name' => $this->getPlayerName($playerId),
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

    function getLinks(int $playerId) {
        $dbLinks = $this->getCollectionFromDb("SELECT * FROM `link` WHERE player_id = $playerId ORDER BY `index1`, `index2`");
        return array_map(fn($dbLink) => new Link(intval($dbLink['index1']), intval($dbLink['index2'])), $dbLinks);
    }

    function refreshZones(int $playerId, int $circleId) {
        $circle = self::getObjectFromDB("SELECT * FROM circle where player_id = ".$playerId." and circle_id = ".$circleId);
      
        $neighbors = $this->CIRCLE_NEIGHBOURS[$circleId];
        $neighttxt = implode(',', $neighbors);
        
        $list = [];
        $zid = -1;
        $newZoneCellCount = 0;
        
        $zones = self::getObjectListFromDB('SELECT distinct(zone) FROM `circle` WHERE value = '.$circle['value'].' and player_id = '.$playerId.' and circle_id in ('.$neighttxt.')', true);
        if(count($zones) == 1 && intval($zones[0]) == -1) {
            //new zones
            $zid = self::getUniqueValueFromDB( "SELECT max(zone) from circle where player_id = ".$playerId) + 1;
            self::DbQuery("update circle set zone = ".$zid.' where value = '.$circle['value'].' and player_id = '.$playerId.' and circle_id in ('.$neighttxt.', '.$circleId.')');
            $newZoneCellCount = 2;
        } else if(count($zones) == 1 && $zones[0] > -1) {
            self::DbQuery("update circle set zone = ".$zones[0].' where player_id = '.$playerId.' and circle_id = '.$circleId);
            $zid = $zones[0];
            $newZoneCellCount = 1;
        } else if(count($zones) > 1) {
            $zid = -1;              
            for($i=0;$i<count($zones);$i++) {
                if ($zones[$i] != -1) {
                    $zid = $zones[$i];
                }
            }
            
            if($zid == -1) {
                //new zones resulting from 3 merges
                $zid = self::getUniqueValueFromDB( "SELECT max(zone) from circle where player_id = ".$playerId) + 1;
            }
            
            //merge adjacent value
            self::DbQuery("update circle set zone = ".$zid.' where value = '.$circle['value'].' and player_id = '.$playerId.' and circle_id in ('.$neighttxt.', '.$circleId.')');
            
            //then merge if necessary              
            for($i=0;$i<count($zones);$i++) {
                if($zones[$i] != -1) {
                    self::DbQuery("update circle set zone = ".$zid.' where player_id = '.$playerId.' and zone = '.$zones[$i]);
                }
            }
            $newZoneCellCount = 1;
        }
                
        if ($zid >= 0) {
            $list = self::getObjectListFromDB('SELECT circle_id FROM `circle` WHERE player_id = '.$playerId.' and zone = '.$zid, true);
            
            self::notifyAllPlayers("zone", '', [
                'playerId' => $playerId,
                'circlesIds' => array_map(fn($elem) => intval($elem), $list),
                'zoneId' => $zid,
            ]);  
        }

        return $newZoneCellCount;
    }

    function getPossibleLinkCirclesIds(int $playerId, array $links, int $circleId, int $value, int $direction) {
        $circles = $this->getCircles($playerId);
        $circle = $this->array_find($circles, fn($c) => $c->circleId == $circleId);
        $possible = [];

        foreach ($circle->neighbours as $neighbourId) {
            $neighbour = $this->array_find($circles, fn($c) => $c->circleId == $neighbourId);
            if ($neighbour->value == $value - $direction) {
                $linkedCirclesIds = [];
                foreach ($links as $link) {
                    if ($neighbour->circleId == $link->index1) {
                        $linkedCirclesIds[] = $link->index2;
                    } else if ($neighbour->circleId == $link->index2) {
                        $linkedCirclesIds[] = $link->index1;
                    }
                }
                $neighbourHasUpperLink = $this->array_some($circles, fn($c) => in_array($c->circleId, $linkedCirclesIds) && $c->value > $neighbour->value);
                $neighbourHasLowerLink = $this->array_some($circles, fn($c) => in_array($c->circleId, $linkedCirclesIds) && $c->value < $neighbour->value);

                if (
                    ($direction === 1 && !$neighbourHasUpperLink) ||
                    ($direction === -1 && !$neighbourHasLowerLink)
                ) {
                    $possible[] = $neighbour->circleId;
                }
            }
        }

        return $possible;
    }

    function addLink(int $playerId, int $circleId, int $toCircleId) {
        $index1 = min($circleId, $toCircleId);
        $index2 = max($circleId, $toCircleId);

        self::DbQuery("INSERT INTO link (player_id, index1, index2) VALUES ($playerId, $index1, $index2)");
        
        self::notifyAllPlayers( "link", '', [
            'playerId' => $playerId,
            'index1' => $index1,
            'index2' => $index2,
        ]);
    }

    function takeObjectiveToken(int $playerId, string $letter) {
        $token = $this->objectiveTokens->pickCardForLocation('deck', 'player', $playerId);
        $value = intval($token['type']);
        
        $args = [
            'playerId' => $playerId,
            'player_name' => $this->getPlayerName($playerId),
            'letter' => $letter
        ];
        self::notifyAllPlayers("takeObjectiveToken", clienttranslate('${player_name} get an objective token for objective ${letter}'), $args);
        self::notifyPlayer($playerId, "takeObjectiveToken", clienttranslate('You get a ${lumens} lumens objective token for objective ${letter}'), $args + [
            'value' => $value,
            'lumens' => $value,
        ]);
    }

    function applyMoveFighter(Card $fighter, int $territoryId) {
        $this->cards->moveCard($fighter->id, 'territory', $territoryId);
        $fighter = $this->getCardById($fighter->id);

        self::notifyAllPlayers("moveFighter", '', [
            'fighter' => $fighter,
            'territoryId' => $territoryId,
        ]);
    }

    function refillReserve(int $playerId) {
        $reserve = $this->getCardsByLocation('reserve'.$playerId);
        for ($i=1; $i<=3; $i++) {
            if (!$this->array_some($reserve, fn($fighter) => $fighter->locationArg == $i)) {
                $this->cards->pickCardForLocation('bag'.$playerId, 'reserve'.$playerId, $i);

                $fighters = $this->getCardsByLocation('reserve'.$playerId, $i);
                $fighter = count($fighters) > 0 ? $fighters[0] : null;

                self::notifyAllPlayers("refillReserve", '', [
                    'playerId' => $playerId,
                    'fighter' => $fighter,
                    'slot' => $i,
                ]);
            }
        }
    }

}
