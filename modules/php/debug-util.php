<?php

trait DebugUtilTrait {

//////////////////////////////////////////////////////////////////////////////
//////////// Utility functions
////////////

    function debugSetup() {
        if ($this->getBgaEnvironment() != 'studio') { 
            return;
        } 

        //$this->debugAddDiscoverTile(2343492, POWER_PLANIFICATION);
        $this->debugAddDiscoverTile(2343492, POWER_COUP_FOURRE);
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

    public function debugReplacePlayersIds() {
        if ($this->getBgaEnvironment() != 'studio') { 
            return;
        } 

		// These are the id's from the BGAtable I need to debug.
		$ids = [
            92432695,
            87587865,
            88804802
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
			$this->DbQuery("UPDATE placed_routes SET player_id=$sid WHERE player_id = $id" );
			
			++$sid;
		}
	}

    function debug($debugData) {
        if ($this->getBgaEnvironment() != 'studio') { 
            return;
        }die('debug data : '.json_encode($debugData));
    }
}
