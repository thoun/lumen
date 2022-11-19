<?php
 /**
  *------
  * BGA framework: © Gregory Isabelli <gisabelli@boardgamearena.com> & Emmanuel Colin <ecolin@boardgamearena.com>
  * Lumen implementation : © <Your name here> <Your email address here>
  * 
  * This code has been produced on the BGA studio platform for use on http://boardgamearena.com.
  * See http://en.boardgamearena.com/#!doc/Studio for more information.
  * -----
  * 
  * lumen.game.php
  *
  * This is the main file for your game logic.
  *
  * In this PHP file, you are going to defines the rules of the game.
  *
  */


require_once(APP_GAMEMODULE_PATH.'module/table/table.game.php');

require_once('modules/php/constants.inc.php');
require_once('modules/php/utils.php');
require_once('modules/php/actions.php');
require_once('modules/php/states.php');
require_once('modules/php/args.php');
require_once('modules/php/debug-util.php');

class Lumen extends Table {
    use UtilTrait;
    use ActionTrait;
    use StateTrait;
    use ArgsTrait;
    use DebugUtilTrait;
    
	function __construct() {
        // Your global variables labels:
        //  Here, you can assign labels to global variables you are using for this game.
        //  You can use any number of global variables with IDs between 10 and 99.
        //  If your game has options (variants), you also have to associate here a label to
        //  the corresponding ID in gameoptions.inc.php.
        // Note: afterwards, you can get/set the global variables with getGameStateValue/setGameStateInitialValue/setGameStateValue
        parent::__construct();
        
        self::initGameStateLabels([
            FIRST_PLAYER => FIRST_PLAYER,
            FIRST_PLAYER_OPERATION => FIRST_PLAYER_OPERATION,
            INITIATIVE_MARKER_TERRITORY => INITIATIVE_MARKER_TERRITORY,
            DIE1 => DIE1,
            DIE2 => DIE2,
            PLAYER_OPERATION => PLAYER_OPERATION,
            PLAYER_NUMBER => PLAYER_NUMBER,
            PLAYER_CELL => PLAYER_CELL,
            REMAINING_FIGHTERS_TO_PLACE => REMAINING_FIGHTERS_TO_PLACE,
            REMAINING_FIGHTERS_TO_MOVE_OR_ACTIVATE => REMAINING_FIGHTERS_TO_MOVE_OR_ACTIVATE,
            PLAYER_SELECTED_FIGHTER => PLAYER_SELECTED_FIGHTER,
            PLAYER_CURRENT_MOVE => PLAYER_CURRENT_MOVE,

            SCENARIO_OPTION => SCENARIO_OPTION,
        ]); 
		
        $this->cards = $this->getNew("module.common.deck");
        $this->cards->init("card");  
		
        $this->discoverTiles = $this->getNew("module.common.deck");
        $this->discoverTiles->init("discover_tile");   
		
        $this->objectiveTokens = $this->getNew("module.common.deck");
        $this->objectiveTokens->init("objective_token");   
	}
	
    protected function getGameName() {
		// Used for translations and stuff. Please do not modify.
        return "lumen";
    }	

    /*
        setupNewGame:
        
        This method is called only once, when a new game is launched.
        In this method, you must setup the game according to the game rules, so that
        the game is ready to be played.
    */
    protected function setupNewGame($players, $options = []) {    
        // Set the colors of the players with HTML color code
        // The default below is red/green/blue/orange/brown
        // The number of colors defined here must correspond to the maximum number of players allowed for the gams
        $gameinfos = self::getGameinfos();
        $default_colors = $gameinfos['player_colors'];
 
        // Create players
        // Note: if you added some extra field on "player" table in the database (dbmodel.sql), you can initialize it there.
        $sql = "INSERT INTO player (player_id, player_color, player_canal, player_name, player_avatar) VALUES ";
        $values = [];
        $firstPlayerSet = false;
        foreach ($players as $playerId => $player) {
            if (!$firstPlayerSet) {
                $this->setGameStateValue(FIRST_PLAYER, $playerId);
                $firstPlayerSet = true;
            }
            $color = array_shift( $default_colors );
            $values[] = "('".$playerId."','$color','".$player['player_canal']."','".addslashes( $player['player_name'] )."','".addslashes( $player['player_avatar'] )."')";
        }
        $sql .= implode(',', $values);
        self::DbQuery($sql);



        $sql = "INSERT INTO operation (player_id, operation, nb) VALUES ";
        $values = [];        
        foreach ($players as $playerId => $player) {
            for ($i = 1; $i <= 5 ; $i++) {
                $values[] = "('$playerId','$i',0)";
            }
        }
        $sql .= implode(',', $values);
        self::DbQuery($sql);


        //self::reattributeColorsBasedOnPreferences( $players, $gameinfos['player_colors'] );
        self::reloadPlayersBasicInfos();
        
        /************ Start the game initialization *****/

        // Init global values with their initial values
        //self::setGameStateInitialValue( 'my_first_global_variable', 0 );
        
        // Init game statistics
        // (note: statistics used in this file must be defined in your stats.inc.php file)
        //self::initStat( 'table', 'table_teststat1', 0 );    // Init a table statistics
        //self::initStat( 'player', 'player_teststat1', 0 );  // Init a player statistics (for all players)

        $this->setupCards($players);
        $this->setupDiscoverTiles();
        $this->setupObjectiveTokens();
        $this->initScenario($players);
        $this->initPlayersCards($players);

        // Activate first player (which is in general a good idea :) )
        $this->activeNextPlayer();

        // TODO TEMP
        $this->debugSetup();

        /************ End of the game initialization *****/
    }

    /*
        getAllDatas: 
        
        Gather all informations about current game situation (visible by the current player).
        
        The method is called each time the game interface is displayed to a player, ie:
        _ when the game starts
        _ when a player refreshes the game page (F5)
    */
    protected function getAllDatas() {
        $result = [];
    
        $currentPlayerId = intval($this->getCurrentPlayerId());    // !! We must only return informations visible by this player !!
    
        // Get information about players
        // Note: you can retrieve some extra field you added for "player" table in "dbmodel.sql" if you need it.
        $sql = "SELECT player_id id, player_score score, player_no playerNo, checks FROM player ";
        $result['players'] = self::getCollectionFromDb($sql);
  
        // Gather all information about current game situation (visible by player $current_player_id).
        foreach($result['players'] as $playerId => &$player) {
            $player['playerNo'] = intval($player['playerNo']);
            $player['checks'] = intval($player['checks']);
            $player['reserve'] = $this->getCardsByLocation('reserve'.$playerId);
            $player['highCommand'] = $this->getCardsByLocation('highCommand'.$playerId);

            $operations = $this->getCollectionFromDb("SELECT `operation`, `nb` FROM `operation` WHERE player_id = $playerId ORDER BY `operation`");
            $player['operations'] = array_map(fn($operation) => intval($operation['nb']), $operations);
            $player['circles'] = $this->getCircles($playerId);
            $player['links'] = array_values($this->getCollectionFromDb("SELECT * FROM `link` WHERE player_id = $playerId"));

            $discoverTiles = $this->getDiscoverTilesByLocation('player', $playerId);
            $player['discoverTiles'] = $playerId == $currentPlayerId ? $discoverTiles : DiscoverTile::onlyIds($discoverTiles);
            $objectiveTokens = $this->getObjectiveTokensFromDb($this->objectiveTokens->getCardsInLocation('player', $playerId));
            $player['objectiveTokens'] = $playerId == $currentPlayerId ? $objectiveTokens : ObjectiveToken::onlyIds($objectiveTokens);
        }

        $result['scenario'] = $this->getScenarioId();
        $result['fightersOnTerritories'] = $this->getCardsByLocation('territory');
        $result['discoverTilesOnTerritories'] = $this->getDiscoverTilesByLocation('territory');
        $result['initiativeMarkerTerritory'] = intval($this->getGameStateValue(INITIATIVE_MARKER_TERRITORY));
        $result['firstPlayer'] = intval($this->getGameStateValue(FIRST_PLAYER));
        $result['firstPlayerOperation'] = intval($this->getGameStateValue(FIRST_PLAYER_OPERATION));
        $result['die1'] = intval($this->getGameStateValue(DIE1));
        $result['die2'] = intval($this->getGameStateValue(DIE2));
  
        return $result;
    }

    /*
        getGameProgression:
        
        Compute and return the current game progression.
        The number returned must be an integer beween 0 (=the game just started) and
        100 (= the game is finished or almost finished).
    
        This method is called each time we are in a game state with the "updateGameProgression" property set to true 
        (see states.inc.php)
    */
    function getGameProgression() {
        // compute and return the game progression
        return intval($this->getStat('turnNumber')) * 100 / 17;
    }


//////////////////////////////////////////////////////////////////////////////
//////////// Utility functions
////////////    

    /*
        In this space, you can put any utility methods useful for your game logic
    */



//////////////////////////////////////////////////////////////////////////////
//////////// Player actions
//////////// 

    /*
        Each time a player is doing some game action, one of the methods below is called.
        (note: each method below must match an input method in lumen.action.php)
    */

    /*
    
    Example:

    function playCard( $card_id )
    {
        // Check that this is the player's turn and that it is a "possible action" at this game state (see states.inc.php)
        self::checkAction( 'playCard' ); 
        
        $player_id = self::getActivePlayerId();
        
        // Add your game logic to play a card there 
        ...
        
        // Notify all players about the card played
        self::notifyAllPlayers( "cardPlayed", clienttranslate( '${player_name} plays ${card_name}' ), array(
            'player_id' => $player_id,
            'player_name' => self::getActivePlayerName(),
            'card_name' => $card_name,
            'card_id' => $card_id
        ) );
          
    }
    
    */

    
//////////////////////////////////////////////////////////////////////////////
//////////// Game state arguments
////////////

    /*
        Here, you can create methods defined as "game state arguments" (see "args" property in states.inc.php).
        These methods function is to return some additional information that is specific to the current
        game state.
    */

    /*
    
    Example for game state "MyGameState":
    
    function argMyGameState()
    {
        // Get some values from the current game situation in database...
    
        // return values:
        return array(
            'variable1' => $value1,
            'variable2' => $value2,
            ...
        );
    }    
    */

//////////////////////////////////////////////////////////////////////////////
//////////// Game state actions
////////////

    /*
        Here, you can create methods defined as "game state actions" (see "action" property in states.inc.php).
        The action method of state X is called everytime the current game state is set to X.
    */
    
    /*
    
    Example for game state "MyGameState":

    function stMyGameState()
    {
        // Do some stuff ...
        
        // (very often) go to another gamestate
        $this->gamestate->nextState( 'some_gamestate_transition' );
    }    
    */

//////////////////////////////////////////////////////////////////////////////
//////////// Zombie
////////////

    /*
        zombieTurn:
        
        This method is called each time it is the turn of a player who has quit the game (= "zombie" player).
        You can do whatever you want in order to make sure the turn of this player ends appropriately
        (ex: pass).
        
        Important: your zombie code will be called when the player leaves the game. This action is triggered
        from the main site and propagated to the gameserver from a server, not from a browser.
        As a consequence, there is no current player associated to this action. In your zombieTurn function,
        you must _never_ use getCurrentPlayerId() or getCurrentPlayerName(), otherwise it will fail with a "Not logged" error message. 
    */

    function zombieTurn( $state, $active_player )
    {
    	$statename = $state['name'];
    	
        if ($state['type'] === "activeplayer") {
            switch ($statename) {
                default:
                    $this->gamestate->nextState( "zombiePass" );
                	break;
            }

            return;
        }

        if ($state['type'] === "multipleactiveplayer") {
            // Make sure player is in a non blocking status for role turn
            $this->gamestate->setPlayerNonMultiactive( $active_player, '' );
            
            return;
        }

        throw new feException( "Zombie mode not supported at this game state: ".$statename );
    }
    
///////////////////////////////////////////////////////////////////////////////////:
////////// DB upgrade
//////////

    /*
        upgradeTableDb:
        
        You don't have to care about this until your game has been published on BGA.
        Once your game is on BGA, this method is called everytime the system detects a game running with your old
        Database scheme.
        In this case, if you change your Database scheme, you just have to apply the needed changes in order to
        update the game database and allow the game to continue to run with your new version.
    
    */
    
    function upgradeTableDb( $from_version )
    {
        // $from_version is the current version of this game database, in numerical form.
        // For example, if the game was running with a release of your game named "140430-1345",
        // $from_version is equal to 1404301345
        
        // Example:
//        if( $from_version <= 1404301345 )
//        {
//            // ! important ! Use DBPREFIX_<table_name> for all tables
//
//            $sql = "ALTER TABLE DBPREFIX_xxxxxxx ....";
//            self::applyDbUpgradeToAllDB( $sql );
//        }
//        if( $from_version <= 1405061421 )
//        {
//            // ! important ! Use DBPREFIX_<table_name> for all tables
//
//            $sql = "CREATE TABLE DBPREFIX_xxxxxxx ....";
//            self::applyDbUpgradeToAllDB( $sql );
//        }
//        // Please add your future database scheme changes here
//
//


    }    
}
