<?php

/*
 * State constants
 */
define('ST_BGA_GAME_SETUP', 1);

define('ST_NEW_ROUND', 20);

define('ST_PLAYER_ASK_ACTIVATE_PLANIFICATION', 25);
define('ST_PLAYER_PLANIFICATION_CHOOSE_FACES', 26);

define('ST_ROLL_DICE', 30);

define('ST_PLAYER_CHOOSE_OPERATION', 35);

// Prepare orders
define('ST_PLAYER_CHOOSE_CELL', 40);
define('ST_PLAYER_CHOOSE_CELL_LINK', 45);

// Transmit orders // TODO CHECK translations
// deploy backup
define('ST_PLAYER_CHOOSE_NEW_FIGHTER', 50);
define('ST_PLAYER_CHOOSE_NEW_FIGHTER_TERRITORY', 51);

define('ST_PLAYER_CHOOSE_FIGHTER', 55);
define('ST_PLAYER_CHOOSE_FIGHTER_TERRITORY', 56);
define('ST_PLAYER_CHOOSE_FIGHTER_POWER', 57);


define('ST_PLAYER_ACTION_CHOOSE_TERRITORY', 60);
define('ST_PLAYER_ACTION_CHOOSE_FIGHTER', 61);
define('ST_PLAYER_ACTION_CHOOSE_FIGHTER_TERRITORY', 62);

define('ST_NEXT_MOVE', 70);

define('ST_NEXT_PLAYER', 80);

define('ST_END_ROUND', 85);

define('ST_END_SCORE', 90);

define('ST_END_GAME', 99);
define('END_SCORE', 100);

/*
 * Constants
 */
define('FIRST_PLAYER', 10);

define('INITIATIVE_MARKER_TERRITORY', 15);

define('DIE1', 20);
define('DIE2', 21);

define('PLAYER_OPERATION', 30);
define('PLAYER_NUMBER', 31);

define('REMAINING_FIGHTERS_TO_PLACE', 40);

define('REMAINING_FIGHTERS_TO_MOVE_OR_ACTIVATE', 50);

/*
 * Options
 */
define('SCENARIO_OPTION', 100);

/*
 * Powers
 */
define('POWER_BAVEUX', 1);
define('POWER_REANIMATRICE', 2);
define('POWER_PUSHER', 3);
define('POWER_ASSASSIN', 4);
define('POWER_EMPLUME', 5);

//define('POWER_PUSHER', 11);
//define('POWER_ASSASSIN', 12);
define('POWER_IMPATIENT', 13);
define('POWER_BOMBARDE', 14);
define('POWER_TISSEUSE', 15);
define('POWER_ROOTED', 16);
define('POWER_PACIFICATEUR', 17);
define('POWER_METAMORPH', 18);

define('ACTION_FURY', 21); 
define('ACTION_RESET', 22);
define('ACTION_TELEPORT', 23);

define('MISSION_COFFRE', 31); 
define('MISSION_WINTER', 32); 
define('MISSION_FRELUQUETS', 33); 

?>
