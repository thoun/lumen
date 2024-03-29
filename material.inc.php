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

$this->SLOTS_BY_CHECKS = [
  1 => 0,
  2 => 1,
  3 => 0,
  4 => 2,
  5 => 3,
  6 => 4,
  7 => 5,
];

$this->CARDS = [
  1 => new CardType(1, 6, 2),
  2 => new CardType(1, 2, 3, POWER_MUDSHELL),
  3 => new CardType(1, 2, 1, POWER_RESTORER),
  4 => new CardType(1, 2, 1, POWER_PUSHER),
  5 => new CardType(1, 2, 1, POWER_ASSASSIN),
  6 => new CardType(1, 2, 1, POWER_FEATHERED),
  
  11 => new CardType(10, 1, 1, POWER_PUSHER),
  12 => new CardType(10, 1, 1, POWER_ASSASSIN),
  13 => new CardType(10, 1, 2, POWER_IMPATIENT),
  14 => new CardType(10, 1, 1, POWER_BOMBER),
  15 => new CardType(10, 1, 2, POWER_WEAVER),
  16 => new CardType(10, 1, 2, POWER_ROOTSPRING),
  17 => new CardType(10, 1, 2, POWER_HYPNOTIST),
  18 => new CardType(10, 1, 1, POWER_METAMORPH),

  21 => new CardType(20, 1, 0, ACTION_FURY), 
  22 => new CardType(20, 1, 0, ACTION_CLEAN_SHEET),
  23 => new CardType(20, 1, 0, ACTION_TELEPORTATION),
  
  31 => new CardType(30, 1, 0, MISSION_LOOT), 
  32 => new CardType(30, 1, 0, MISSION_WINTER), 
  33 => new CardType(30, 1, 0, MISSION_SHROOMLING), 
];

$this->DISCOVER_TILES = [
  new DiscoverTileType(1, 2, 3),
  new DiscoverTileType(1, 2, 4),
  new DiscoverTileType(1, 1, 5),
  new DiscoverTileType(2, 2, POWER_INTERFERENCE),
  new DiscoverTileType(2, 2, POWER_PLANNING),
  new DiscoverTileType(2, 2, POWER_PARATROOPING),
  new DiscoverTileType(2, 2, POWER_PRIORITY_MESSAGE),
  new DiscoverTileType(2, 2, POWER_FOUL_PLAY),
];


$this->TERRITORIES = [
  11 => new Territory(11, 1),
  15 => new Territory(15, 5),  
  27 => new Territory(27, 7),    
  31 => new Territory(31, 1),
  33 => new Territory(33, 3),
  41 => new Territory(41, 1),
  45 => new Territory(45, 5),
  51 => new Territory(51, 1),
  53 => new Territory(53, 3),
  54 => new Territory(54, 3),
  61 => new Territory(61, 1),
  63 => new Territory(63, 3),
  65 => new Territory(65, 5),
  71 => new Territory(71, 1),
  73 => new Territory(73, 3),
  75 => new Territory(75, 5),
];

$this->BATTLEFIELDS = [
  1 => new Battlefield(1, [
    $this->TERRITORIES[11],
    $this->TERRITORIES[15],
  ],
  [
    11 => [15],
  ]),
  2 => new Battlefield(2, [
    $this->TERRITORIES[27],
  ], []),
  3 => new Battlefield(3, [
    $this->TERRITORIES[31],
    $this->TERRITORIES[33],
  ],
  [
    31 => [33],
  ]),
  4 => new Battlefield(4, [
    $this->TERRITORIES[41],
    $this->TERRITORIES[45],
  ],
  [
    41 => [45],
  ]),
  5 => new Battlefield(5, [
    $this->TERRITORIES[51],
    $this->TERRITORIES[53],
    $this->TERRITORIES[54],
  ],
  [
    51 => [53],
    53 => [54],
  ]),
  6 => new Battlefield(6, [
    $this->TERRITORIES[61],
    $this->TERRITORIES[63],
    $this->TERRITORIES[65],
  ],
  [
    61 => [65],
    63 => [65],
  ]),
  7 => new Battlefield(6, [
    $this->TERRITORIES[71],
    $this->TERRITORIES[73],
    $this->TERRITORIES[75],
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
    15 => [27, 41, 73],
    27 => [54],
    31 => [51, 53, 54, 65],
    33 => [65],
    41 => [73],
    45 => [71, 73],
    51 => [63, 65],
  ],
  [
    15 => [
      PLAYER_COLOR_ORANGE => [4],
    ],
    31 => [
      PLAYER_COLOR_BLUE => [3],
    ],
    45 => [
      PLAYER_COLOR_BLUE => [4],
    ],
    51 => [
      PLAYER_COLOR_ORANGE => [3],
    ],
  ], 
  61,
  [
    'A' => [71, 73, 75],
    'B' => [61, 65],
  ]),
  
  2 => new Scenario([
    1,2,3,4,5,6,7
  ], [
    11 => [75],
    15 => [41, 45, 75],
    27 => [63, 71, 73],
    31 => [45],
    41 => [15, 51, 75],
    45 => [51],
    51 => [75],
    54 => [71, 75],
  ],
  [
    11 => [
      PLAYER_COLOR_BLUE => [3],
    ],
    41 => [
      PLAYER_COLOR_ORANGE => [3],
      PLAYER_COLOR_BLUE => [3],
    ],
    51 => [
      PLAYER_COLOR_ORANGE => [3],
    ],
  ], 
  61,
  []),
  
  3 => new Scenario([
    1,2,3,4,5,6,7
  ], [
    11 => [0],
    15 => [0, 27, 71, 75],
    31 => [45],
    33 => [41, 45, 51, 53],
    41 => [53, 54],
    45 => [0, 61, 65],
    63 => [0],
    65 => [0],
    75 => [0],
  ],
  [
    31 => [
      PLAYER_COLOR_BLUE => [2],
    ],
    41 => [
      PLAYER_COLOR_ORANGE => [2],
    ],
    51 => [
      PLAYER_COLOR_ORANGE => [6],
      PLAYER_COLOR_BLUE => [6],
    ],
  ], 
  27,
  [
    'A' => [71, 73, 75],
    'B' => [45, 61, 65],
  ]),
  
  4 => new Scenario([
    1,2,3,4,5,6,7
  ], [
    15 => [71, 75],
    27 => [54],
    31 => [45, 65],
    33 => [41, 45, 65],
  ],
  [
    45 => [
      PLAYER_COLOR_ORANGE => [1],
      PLAYER_COLOR_BLUE => [1],
    ],
    65 => [
      PLAYER_COLOR_ORANGE => [1],
      PLAYER_COLOR_BLUE => [1],
    ],
  ], 
  33,
  []),
  
  5 => new Scenario([
    1,3,4,5,6,7
  ], [
    11 => [51, 53],
    15 => [31, 53],
    31 => [53],
    33 => [53, 54, 63, 65, 73, 75],
    41 => [63],
    45 => [63, 75],
    54 => [71, 73],
  ],
  [
    31 => [
      PLAYER_COLOR_ORANGE => [3],
      PLAYER_COLOR_BLUE => [4],
    ],
    71 => [
      PLAYER_COLOR_ORANGE => [4],
      PLAYER_COLOR_BLUE => [3],
    ],
  ], 
  41,
  [
    'A' => [11, 51],
    'B' => [45, 75],
  ]),
  
  6 => new Scenario([
    1,3,4,5,6,7
  ], [
    11 => [51, 53],
    15 => [31, 53],
    31 => [41, 51, 53, 54, 71, 75],
    33 => [41, 75],
    41 => [51],
    45 => [51],
    54 => [61, 63, 65],
    61 => [71, 73],
    65 => [73],
  ],
  [
    33 => [
      PLAYER_COLOR_ORANGE => [3],
      PLAYER_COLOR_BLUE => [3],
    ],
    53 => [
      PLAYER_COLOR_ORANGE => [3],
    ],
    63 => [
      PLAYER_COLOR_BLUE => [3],
    ],
  ], 
  73,
  [
    'A' => [61, 71],
    'B' => [11, 51],
  ]),
  
  7 => new Scenario([
    1,2,3,4,5,6,7
  ], [
    11 => [33],
    15 => [33, 61, 63, 65],
    27 => [31, 33, 51, 53],
    41 => [51, 73],
    45 => [51, 71, 73],
  ],
  [
    65 => [
      PLAYER_COLOR_ORANGE => [4, 5],
    ],
    75 => [
      PLAYER_COLOR_BLUE => [4, 5],
    ],
  ], 
  31,
  [
    'A' => [53, 54],
  ]),
];

$this->CIRCLE_NEIGHBOURS = [
  1 => [2, 4, 5],
  2 => [1, 5, 6],
  3 => [7, 8],
  4 => [1, 5, 10, 11],
  5 => [1, 2, 4, 6, 11, 12],
  6 => [2, 5, 7, 12, 13],
  7 => [3, 6, 8, 13, 14],
  8 => [3, 7, 14],
  9 => [10, 15, 16],
  10 => [4, 9, 11, 17],
  11 => [4, 5, 10, 12, 18],
  12 => [5, 6, 11, 13],
  13 => [6, 7, 12, 14],
  14 => [7, 8, 13],
  15 => [9, 16],
  16 => [9, 15, 17, 19],
  17 => [10, 16, 18, 19, 20],
  18 => [11, 17, 20],
  19 => [16, 17, 20],
  20 => [17, 18, 19],
];

$this->RIVER_CROSS_TERRITORIES = [
  11 => [63, 65],
  15 => [65],
  45 => [75],
  63 => [11],
  65 => [11, 15, 75],
  75 => [45, 65],
];

$this->BATTLEFIELDS_IN_SAME_ISLAND = [
  1 => [7],
  2 => [5],
  3 => [4, 6],
  4 => [3, 6],
  5 => [2],
  6 => [3, 4],
  7 => [1],
];

$this->FORBIDDEN_JAMMING_PAIRS = [
  4 => [11],
  6 => [12, 13],
  7 => [8, 13, 14],
  8 => [7],
  9 => [16],
  10 => [11, 16, 18],
  11 => [4, 10],
  12 => [6],
  13 => [6, 7],
  14 => [7],
  16 => [9, 10],
  18 => [10],
];