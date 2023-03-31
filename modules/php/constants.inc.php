<?php

define('PLAYER_COLOR_ORANGE', 'f28700');
define('PLAYER_COLOR_BLUE', '1f3067');

/*
 * State constants
 */
define('ST_BGA_GAME_SETUP', 1);

define('ST_NEW_ROUND', 20);

define('ST_PLAYER_ASK_ACTIVATE_PLANNING', 25);
define('ST_PLAYER_PLANNING_CHOOSE_FACES', 26);

define('ST_ROLL_DICE', 30);

define('ST_PLAYER_CHOOSE_OPERATION', 35);

// Prepare orders
define('ST_PLAYER_CHOOSE_CELL', 40);
define('ST_PLAYER_CHOOSE_CELL_LINK', 45);

define('ST_PLAYER_CONFIRM_CELL', 47);

define('ST_PLAYER_CHOOSE_ACTION', 50);
// Transmit orders
define('ST_PLAYER_CHOOSE_FIGHTER', 55);

define('ST_PLAYER_CHOOSE_TERRITORY', 60);

define('ST_PLAYER_CHOOSE_CELL_INTERFERENCE', 65);

define('ST_NEXT_MOVE', 75);
define('ST_NEXT_PLAYER', 80);

define('ST_END_ROUND', 85);
define('ST_END_SCORE', 90);

define('ST_END_GAME', 99);
define('END_SCORE', 100);

/*
 * Constants
 */
define('FIRST_PLAYER', 10);
define('FIRST_PLAYER_OPERATION', 11);
define('RANDOM_SCENARIO', 12);

define('INITIATIVE_MARKER_TERRITORY', 15);

define('DIE1', 20);
define('DIE2', 21);

define('PLAYER_OPERATION', 30);
define('PLAYER_NUMBER', 31);
define('PLAYER_CELL', 32);
define('REMAINING_FIGHTERS_TO_PLACE', 34);
define('REMAINING_FIGHTERS_TO_MOVE_OR_ACTIVATE', 35);

define('PLAYER_SELECTED_FIGHTER', 40);
define('PLAYER_SELECTED_TARGET', 41);
define('PLAYER_CURRENT_MOVE', 45);
    define('MOVE_PLAY', 1);
    define('MOVE_MOVE', 2);
    define('MOVE_ACTIVATE', 3);
    define('MOVE_PUSH', 4);
    define('MOVE_KILL', 5);
    define('MOVE_FLY', 6);
    define('MOVE_SUPER', 7);
    define('MOVE_IMPATIENT', 8);
    define('MOVE_UNACTIVATE', 9);
    define('MOVE_FURY', 21); 
    define('MOVE_RESET', 22);
    define('MOVE_TELEPORT', 23);


/*
 * Options
 */
define('SCENARIO_OPTION', 100);

/*
 * Powers
 */
define('POWER_MUDSHELL', 1);
define('POWER_RESTORER', 2);
define('POWER_PUSHER', 3);
define('POWER_ASSASSIN', 4);
define('POWER_FEATHERED', 5);

//define('POWER_PUSHER', 11);
//define('POWER_ASSASSIN', 12);
define('POWER_IMPATIENT', 13);
define('POWER_BOMBER', 14);
define('POWER_WEAVER', 15);
define('POWER_ROOTSPRING', 16);
define('POWER_HYPNOTIST', 17);
define('POWER_METAMORPH', 18);

define('ACTION_FURY', 21); 
define('ACTION_CLEAN_SHEET', 22);
define('ACTION_TELEPORTATION', 23);

define('MISSION_LOOT', 31); 
define('MISSION_WINTER', 32); 
define('MISSION_SHROOMLING', 33); 

// Discover tiles
define('POWER_INTERFERENCE', 1);
define('POWER_PLANNING', 2);
define('POWER_PARATROOPING', 3);
define('POWER_PRIORITY_MESSAGE', 4);
define('POWER_FOUL_PLAY', 5);

/*
 * Globlal variables
 */
define('REMAINING_ACTIONS', 'REMAINING_ACTIONS');
define('UNDO_SELECTED_CIRCLE', 'UNDO_SELECTED_CIRCLE');

?>
