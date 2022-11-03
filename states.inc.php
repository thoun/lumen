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
 * states.inc.php
 *
 * Lumen game states description
 *
 */

/*
   Game state machine is a tool used to facilitate game developpement by doing common stuff that can be set up
   in a very easy way from this configuration file.

   Please check the BGA Studio presentation about game state to understand this, and associated documentation.

   Summary:

   States types:
   _ activeplayer: in this type of state, we expect some action from the active player.
   _ multipleactiveplayer: in this type of state, we expect some action from multiple players (the active players)
   _ game: this is an intermediary state where we don't expect any actions from players. Your game logic must decide what is the next game state.
   _ manager: special type for initial and final state

   Arguments of game states:
   _ name: the name of the GameState, in order you can recognize it on your own code.
   _ description: the description of the current game state is always displayed in the action status bar on
                  the top of the game. Most of the time this is useless for game state with "game" type.
   _ descriptionmyturn: the description of the current game state when it's your turn.
   _ type: defines the type of game states (activeplayer / multipleactiveplayer / game / manager)
   _ action: name of the method to call when this game state become the current game state. Usually, the
             action method is prefixed by "st" (ex: "stMyGameStateName").
   _ possibleactions: array that specify possible player actions on this step. It allows you to use "checkAction"
                      method on both client side (Javacript: this.checkAction) and server side (PHP: self::checkAction).
   _ transitions: the transitions are the possible paths to go from a game state to another. You must name
                  transitions in order to use transition names in "nextState" PHP method, and use IDs to
                  specify the next game state for each transition.
   _ args: name of the method to call to retrieve arguments for this gamestate. Arguments are sent to the
           client side to be used on "onEnteringState" or to set arguments in the gamestate description.
   _ updateGameProgression: when specified, the game progression is updated (=> call to your getGameProgression
                            method).
*/

//    !! It is not a good idea to modify this file when a game is running !!

require_once("modules/php/constants.inc.php");

$basicGameStates = [

    // The initial state. Please do not modify.
    ST_BGA_GAME_SETUP => [
        "name" => "gameSetup",
        "description" => clienttranslate("Game setup"),
        "type" => "manager",
        "action" => "stGameSetup",
        "transitions" => [ "" => ST_NEW_ROUND ]
    ],
   
    // Final state.
    // Please do not modify.
    ST_END_GAME => [
        "name" => "gameEnd",
        "description" => clienttranslate("End of game"),
        "type" => "manager",
        "action" => "stGameEnd",
        "args" => "argGameEnd",
    ],
];


$chooseCellTransitions = [
    "nextMove" => ST_NEXT_MOVE,
    "cancel" => ST_PLAYER_CHOOSE_OPERATION,
    "nextPlayer" => ST_NEXT_PLAYER,
];

$playerActionsGameStates = [

    ST_PLAYER_ASK_ACTIVATE_PLANIFICATION => [
        "name" => "askActivatePlanification",
        "description" => clienttranslate('${actplayer} can activate Planification'),
        "descriptionmyturn" => clienttranslate('${you} can activate Planification'),
        "type" => "activeplayer",
        "possibleactions" => [ 
            "activatePlanification",
            "passPlanification",
        ],
        "transitions" => [
            "activate" => ST_PLAYER_PLANIFICATION_CHOOSE_FACES,
            "pass" => ST_ROLL_DICE,
        ]
    ],

    ST_PLAYER_PLANIFICATION_CHOOSE_FACES => [
        "name" => "planificationChooseFaces",
        "description" => clienttranslate('${actplayer} must choose dice faces'),
        "descriptionmyturn" => clienttranslate('${you} must choose dice faces'),
        "type" => "activeplayer",
        "possibleactions" => [ 
            "chooseDiceFaces",
        ],
        "transitions" => [
            "chooseOperation" => ST_PLAYER_CHOOSE_OPERATION,
        ]
    ],

    ST_PLAYER_CHOOSE_OPERATION => [
        "name" => "chooseOperation",
        "description" => clienttranslate('${actplayer} must choose an operation'),
        "descriptionmyturn" => clienttranslate('${you} must choose an operation'),
        "type" => "activeplayer",
        "args" => "argChooseOperation",
        "possibleactions" => [ 
            "chooseOperation",
        ],
        "transitions" => [
            "chooseCell" => ST_PLAYER_CHOOSE_CELL,
        ]
    ],

    ST_PLAYER_CHOOSE_CELL => [
        "name" => "chooseCell",
        "description" => clienttranslate('${actplayer} must report ${number} in an eligible circle'),
        "descriptionmyturn" => clienttranslate('${you} must report ${number} in an eligible circle'),
        "type" => "activeplayer",    
        "args" => "argChooseCell",
        "possibleactions" => [ 
            "chooseCell",
            "cancelOperation",
        ],
        "transitions" => $chooseCellTransitions + [
            "chooseCellLink" => ST_PLAYER_CHOOSE_CELL_LINK,
        ],
    ],

    ST_PLAYER_CHOOSE_CELL_LINK => [
        "name" => "chooseCellLink",
        "description" => clienttranslate('${actplayer} must choose a cell link'),
        "descriptionmyturn" => clienttranslate('${you} must choose a cell link'),
        "type" => "activeplayer",    
        "args" => "argChooseCellLink",
        "possibleactions" => [ 
            "chooseCellLink",
            "cancelOperation",
        ],
        "transitions" => $chooseCellTransitions,
    ],

    ST_PLAYER_CHOOSE_FIGHTER => [
        "name" => "chooseFighter",
        "description" => clienttranslate('${actplayer} must choose a fighter to play, move or activate'),
        "descriptionmyturn" => clienttranslate('${you} must choose a fighter to play, move or activate'),
        "descriptionOnlyPlay" => clienttranslate('${actplayer} must choose a fighter to play'),
        "descriptionmyturnOnlyPlay" => clienttranslate('${you} must choose a fighter to play'),
        "descriptionOnlyMoveActivate" => clienttranslate('${actplayer} must choose a fighter to move or activate'),
        "descriptionmyturnOnlyMoveActivate" => clienttranslate('${you} must choose a fighter to move or activate'),
        "type" => "activeplayer",
        "args" => "argChooseFighter", 
        "possibleactions" => [ 
            "playFighter",
            "moveFighter",
            "activateFighter",
        ],
        "transitions" => [
            "chooseTerritory" => ST_PLAYER_CHOOSE_FIGHTER_TERRITORY,
        ]
    ],

    ST_PLAYER_CHOOSE_MOVE_OR_ACTIVATE => [
        "name" => "chooseMoveOrActivate",
        "description" => clienttranslate('${actplayer} must choose to move or activate selected fighter'),
        "descriptionmyturn" => clienttranslate('${you} must choose to move or activate selected fighter'),
        "type" => "activeplayer",
        "possibleactions" => [ 
            "chooseMove",
            "chooseActivate",
        ],
        "transitions" => [
            "chooseNewTerritory" => ST_PLAYER_CHOOSE_FIGHTER_TERRITORY,
            "chooseNewTerritory" => ST_PLAYER_CHOOSE_FIGHTER_TERRITORY,
        ]
    ],

    ST_PLAYER_CHOOSE_FIGHTER_TERRITORY => [
        "name" => "chooseFighterTerritory",
        "description" => clienttranslate('${actplayer} must choose a card'),
        "descriptionmyturn" => clienttranslate('${you} must choose a card'),
        "type" => "activeplayer", 
        "args" => "argChooseFighterTerritory", 
        "possibleactions" => [ 
            "chooseFighterTerritory",
        ],
        "transitions" => [
            //"playCards" => ST_PLAYER_PLAY_CARDS,
        ]
    ],

    ST_PLAYER_CHOOSE_FIGHTER_POWER => [
        "name" => "chooseFighterPower",
        "description" => clienttranslate('${actplayer} must choose a discard pile'),
        "descriptionmyturn" => clienttranslate('${you} must choose a discard pile'),
        "type" => "activeplayer",
        "args" => "argChooseFighterPower", 
        "possibleactions" => [ 
            "chooseFighter",
        ],
        "transitions" => [
            "nextMove" => ST_NEXT_MOVE,
        ]
    ],

    ST_PLAYER_ACTION_CHOOSE_TERRITORY => [
        "name" => "actionChooseTerritory",
        "description" => clienttranslate('${actplayer} must choose a card'),
        "descriptionmyturn" => clienttranslate('${you} must choose a card'),
        "type" => "activeplayer", 
        "args" => "argActionChooseTerritory", 
        "possibleactions" => [ 
            "actionChooseTerritory",
        ],
        "transitions" => [
            //"playCards" => ST_PLAYER_PLAY_CARDS,
        ]
    ],

    ST_PLAYER_ACTION_CHOOSE_FIGHTER => [
        "name" => "actionChooseFighter",
        "description" => clienttranslate('${actplayer} must choose a discard pile'),
        "descriptionmyturn" => clienttranslate('${you} must choose a discard pile'),
        "type" => "activeplayer",
        "args" => "argActionChooseFighter", 
        "possibleactions" => [ 
            "actionChooseFighter",
        ],
        "transitions" => [
            //"chooseCard" => ST_PLAYER_CHOOSE_DISCARD_CARD,
        ]
    ],

    ST_PLAYER_ACTION_CHOOSE_FIGHTER_TERRITORY => [
        "name" => "actionChooseFighterTerritory",
        "description" => clienttranslate('${actplayer} must choose a card'),
        "descriptionmyturn" => clienttranslate('${you} must choose a card'),
        "type" => "activeplayer", 
        "args" => "argActionChooseFighterTerritory", 
        "possibleactions" => [ 
            "actionChooseFighterTerritory",
        ],
        "transitions" => [
            //"playCards" => ST_PLAYER_PLAY_CARDS,
        ]
    ],
];

$gameGameStates = [

    ST_NEW_ROUND => [
        "name" => "newRound",
        "description" => "",
        "type" => "game",
        "action" => "stNewRound",
        "updateGameProgression" => true,
        "transitions" => [
            "askActivatePlanification" => ST_PLAYER_ASK_ACTIVATE_PLANIFICATION,
            "rollDice" => ST_ROLL_DICE,
        ],
    ],

    ST_ROLL_DICE => [
        "name" => "rollDice",
        "description" => "",
        "type" => "game",
        "action" => "stRollDice",
        "transitions" => [
            "chooseOperation" => ST_PLAYER_CHOOSE_OPERATION,
        ],
    ],

    ST_NEXT_MOVE => [
        "name" => "nextMove",
        "description" => "",
        "type" => "game",
        "action" => "stNextMove",
        "transitions" => [
            "chooseFighter" => ST_PLAYER_CHOOSE_FIGHTER,
            "nextPlayer" => ST_NEXT_PLAYER,
        ],
    ],

    ST_NEXT_PLAYER => [
        "name" => "nextPlayer",
        "description" => "",
        "type" => "game",
        "action" => "stNextPlayer",
        "transitions" => [
            "nextPlayer" => ST_PLAYER_CHOOSE_OPERATION,
            "endRound" => ST_END_ROUND,
        ],
    ],

    ST_END_ROUND => [
        "name" => "endRound",
        "description" => "",
        "type" => "game",
        "action" => "stEndRound",
        "updateGameProgression" => true,
        "transitions" => [
            "newRound" => ST_NEW_ROUND,
            "endScore" => ST_END_SCORE,
        ],
    ],

    ST_END_SCORE => [
        "name" => "endScore",
        "description" => "",
        "type" => "game",
        "action" => "stEndScore",
        "transitions" => [
            "endGame" => ST_END_GAME,
        ],
    ],
];
 
$machinestates = $basicGameStates + $playerActionsGameStates + $gameGameStates;