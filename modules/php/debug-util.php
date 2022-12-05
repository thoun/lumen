<?php

trait DebugUtilTrait {

//////////////////////////////////////////////////////////////////////////////
//////////// Utility functions
////////////

    function debugSetup() {
        if ($this->getBgaEnvironment() != 'studio') { 
            return;
        } 

        $this->debugSetCircleValues(2343492, [3, 8], 4, 1);
        $this->debugSetCircleValues(2343492, [13], 4);
        
        $this->debugSetCircleValues(2343492, [2, 6], 2, 2);
        $this->debugSetCircleValues(2343492, [4, 10], 2, 3);

        $this->debugSetCircleValues(2343492, [15, 19], 1);
        $this->debugSetCircleValues(2343492, [18, 20], 5, 4);

        $this->debugSetCircleValues(2343492, [11], 3);

        /*$this->debugAddObjectiveToken(2343492, 1);
        $this->debugAddDiscoverTile(2343492, 4, 1);
        $this->debugAddDiscoverTile(2343492, 5, 1);
        $this->debugAddDiscoverTile(2343492, 3, 1);
        $this->debugAddDiscoverTile(2343492, POWER_PLANIFICATION);
        $this->debugAddDiscoverTile(2343492, POWER_COUP_FOURRE);
        
        $this->debugAddObjectiveToken(2343493, 6);*/
        /*for ($i=0;$i<3;$i++) $this->debugAddPlayerFighter(2343492, 1, 'territory', 11);
        //for ($i=0;$i<2;$i++) $this->debugAddPlayerFighter(2343492, 1, 'territory', 15);
        $this->debugAddNeutralFighter(2343492, 11, 'territory', 11);
        $this->debugAddNeutralFighter(2343492, 13, 'territory', 11);
        $this->debugAddNeutralFighter(2343492, 12, 'territory', 41);*/
        /*$this->debugAddNeutralFighter(2343492, 31, 'highCommand2343492', 1);
        $this->debugAddNeutralFighter(2343492, 32, 'highCommand2343492', 2);
        $this->debugAddNeutralFighter(2343492, 33, 'highCommand2343492', 3);*/
        $this->debugAddNeutralFighter(2343492, 21, 'highCommand2343492', 1);
        $this->debugAddNeutralFighter(2343492, 22, 'highCommand2343492', 2);
        $this->debugAddNeutralFighter(2343492, 23, 'highCommand2343492', 3);
        //$this->debugLastTurn();
    }

    public function debugAddPlayerFighter(int $playerId, int $subType, string $location, $locationArg = null, $played = false) {
        $cards = $this->getCardsByLocation('bag'.$playerId, null, null, null, $subType);
        $card = $cards[0];
        if ($played) {
            self::DbQuery("update card set played = true where card_id = $card->id");
        }
        $this->cards->moveCard($card->id, $location, $locationArg);
    }

    public function debugAddNeutralFighter(int $playerId, int $subType, string $location, $locationArg = null, $played = false) {
        $cards = $this->getCardsByLocation('bag0', null, null, null, $subType);
        $card = $cards[0];
        if ($played) {
            self::DbQuery("update card set played = true where card_id = $card->id");
        }
        self::DbQuery("update card set player_id = $playerId where card_id = $card->id");
        $this->cards->moveCard($card->id, $location, $locationArg);
    }

    public function debugAddObjectiveToken(int $playerId, int $number = 1) {
        $this->objectiveTokens->pickCardsForLocation($number, 'deck', 'player', $playerId);
    }

    public function debugAddDiscoverTile(int $playerId, int $powerOrLumens, int $type = 2) {
        $tiles = $this->getDiscoverTilesByLocation('deck', null, null, $type, $powerOrLumens);
        if (count($tiles) > 0) {
            $this->discoverTiles->moveCard($tiles[0]->id, 'player', $playerId);
        } else {
            $tiles = $this->getDiscoverTilesByLocation('territory', null, null, $type, $powerOrLumens);
            if (count($tiles) > 0) {
                $this->discoverTiles->moveCard($tiles[0]->id, 'player', $playerId);
            } else {
                $this->debug("Discover tile $type $powerOrLumens not found");
            }
        }
    }

    public function debugSetCircleValues($playerId, $circlesIds, $value, $zoneId = null) {
        foreach($circlesIds as $circleId) {
            self::DbQuery($zoneId !== null ?
                "INSERT INTO `circle` (`circle_id`, `player_id`, `value`, `zone`) VALUES ($circleId, $playerId, $value, $zoneId)" :
                "INSERT INTO `circle` (`circle_id`, `player_id`, `value`) VALUES ($circleId, $playerId, $value)"
            );
        }
    }

    public function debugLastTurn() {
        $this->incStat(20, 'roundNumber');
    }

    public function debugReplacePlayersIds() {
        if ($this->getBgaEnvironment() != 'studio') { 
            return;
        } 

		// These are the id's from the BGAtable I need to debug.
		$ids = [
            83846198,
            86175279
		];

		// Id of the first player in BGA Studio
		$sid = 2343492;
		
		foreach ($ids as $id) {
			// basic tables
			$this->DbQuery("UPDATE player SET player_id=$sid WHERE player_id = $id" );
			$this->DbQuery("UPDATE global SET global_value=$sid WHERE global_value = $id" );
			$this->DbQuery("UPDATE card SET card_location_arg=$sid WHERE card_location_arg = $id" );

			// 'other' game specific tables. example:
			// tables specific to your schema that use player_ids
			$this->DbQuery("UPDATE card SET player_id=$sid WHERE player_id = $id" );
			$this->DbQuery("UPDATE discover_tile SET card_location_arg=$sid WHERE card_location_arg = $id" );
			$this->DbQuery("UPDATE objective_token SET card_location_arg=$sid WHERE card_location_arg = $id" );
			$this->DbQuery("UPDATE link SET player_id=$sid WHERE player_id = $id" );
			$this->DbQuery("UPDATE circle SET player_id=$sid WHERE player_id = $id" );
			$this->DbQuery("UPDATE operation SET player_id=$sid WHERE player_id = $id" );
			$this->DbQuery("UPDATE realized_objective SET player_id=$sid WHERE player_id = $id" );
			
			++$sid;
		}

        self::reloadPlayersBasicInfos();
	}

    function debug($debugData) {
        if ($this->getBgaEnvironment() != 'studio') { 
            return;
        }die('debug data : '.json_encode($debugData));
    }
}
