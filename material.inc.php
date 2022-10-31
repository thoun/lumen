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
 * material.inc.php
 *
 * Lumen game material description
 *
 * Here, you can describe the material of your game with PHP variables.
 *   
 * This file is loaded in your game logic class constructor, ie these variables
 * are available everywhere in your game logic code.
 *
 */

require_once('modules/php/objects/card.php');
require_once('modules/php/objects/scenario.php');

$this->CARDS = [
  1 => new CardType(1, 6, 2),
  2 => new CardType(1, 2, 3, POWER_BAVEUX),
  3 => new CardType(1, 2, 1, POWER_REANIMATRICE),
  4 => new CardType(1, 2, 1, POWER_PUSHER),
  5 => new CardType(1, 2, 1, POWER_ASSASSIN),
  6 => new CardType(1, 2, 2, POWER_EMPLUME),
  
  11 => new CardType(10, 1, 1, POWER_PUSHER),
  12 => new CardType(10, 1, 1, POWER_ASSASSIN),
  13 => new CardType(10, 1, 2, POWER_IMPATIENT),
  14 => new CardType(10, 1, 2, POWER_BOMBARDE),
  15 => new CardType(10, 1, 2, POWER_TISSEUSE),
  16 => new CardType(10, 1, 2, POWER_ROOTED),
  17 => new CardType(10, 1, 2, POWER_PACIFICATEUR),
  18 => new CardType(10, 1, 1, POWER_METAMORPH),

  // TODO check quantity
  21 => new CardType(20, 1, 0, ACTION_FURY), 
  22 => new CardType(20, 1, 0, ACTION_RESET),
  23 => new CardType(20, 1, 0, ACTION_TELEPORT),
  
  // TODO check quantity
  31 => new CardType(30, 1, 0, MISSION_COFFRE), 
  32 => new CardType(30, 1, 0, MISSION_WINTER), 
  33 => new CardType(30, 1, 0, MISSION_FRELUQUETS), 
];

$this->DISCOVER_TILES = [
  // TODO
];

$this->BATTLEFIELDS = [
  1 => new Battlefield(1, [
    new Territory(11, 1),
    new Territory(15, 5),
  ],
  [
    11 => [15],
  ]),
  2 => new Battlefield(2, [
    new Territory(27, 7),
  ], []),
  3 => new Battlefield(3, [
    new Territory(31, 1),
    new Territory(33, 3),
  ],
  [
    31 => [33],
  ]),
  4 => new Battlefield(4, [
    new Territory(41, 1),
    new Territory(45, 5),
  ],
  [
    41 => [45],
  ]),
  5 => new Battlefield(5, [
    new Territory(51, 1),
    new Territory(53, 3),
    new Territory(54, 3),
  ],
  [
    51 => [53],
    53 => [54],
  ]),
  6 => new Battlefield(6, [
    new Territory(61, 1),
    new Territory(63, 3),
    new Territory(65, 5),
  ],
  [
    61 => [65],
    63 => [65],
  ]),
  7 => new Battlefield(6, [
    new Territory(71, 1),
    new Territory(73, 3),
    new Territory(75, 5),
  ],
  [
    71 => [73, 75],
    73 => [75],
  ]),
];

$this->SCENARIOS = [
  1 => new Scenario([
    1,2,3,4,5,6,7
  ], [
    11 => [27, 73, 75],
    15 => [41, 73],
    27 => [54],
    31 => [51, 53, 54, 65],
    33 => [65],
    41 => [73],
    45 => [71, 73],
    51 => [63, 65],
  ],
  [
    15 => [
      1 => [4],
    ],
    31 => [
      2 => [3],
    ],
    45 => [
      2 => [4],
    ],
    51 => [
      1 => [3],
    ],
  ]),
];
