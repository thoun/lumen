<?php

/*
 * State constants
 */
define('ST_BGA_GAME_SETUP', 1);

define('ST_NEW_ROUND', 20);

define('ST_PLAYER_CHOOSE_OPERATION', 30);

// Prepare orders
define('ST_PLAYER_CHOOSE_CELL', 40);

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

define('ST_NEXT_PLAYER', 80);

define('ST_END_ROUND', 85);

define('ST_END_SCORE', 90);

define('ST_END_GAME', 99);
define('END_SCORE', 100);

/*
 * Constants
 */
define('FIRST_PLAYER', 10);
define('TOTAL_NUMBER_OF_ACTIONS', 11);
define('CURRENT_NUMBER_OF_ACTIONS', 12);

?>
