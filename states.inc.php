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
    "chooseAction" => ST_PLAYER_CONFIRM_CELL,
    "cancel" => ST_PLAYER_CHOOSE_OPERATION,
    "nextPlayer" => ST_NEXT_PLAYER,
];

$playerActionsGameStates = [

    ST_PLAYER_ASK_ACTIVATE_PLANNING => [
        "name" => "askActivatePlanning",
        "description" => clienttranslate('${actplayer} can activate Planning'),
        "descriptionmyturn" => clienttranslate('${you} can activate Planning'),
        "type" => "activeplayer",
        "possibleactions" => [ 
            "activatePlanning",
            "passPlanning",
        ],
        "transitions" => [
            "activate" => ST_PLAYER_PLANNING_CHOOSE_FACES,
            "pass" => ST_ROLL_DICE,
        ]
    ],

    ST_PLAYER_PLANNING_CHOOSE_FACES => [
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

    ST_PLAYER_CONFIRM_CELL => [
        "name" => "confirmCell",
        "description" => clienttranslate('${actplayer} must confirm circle'),
        "descriptionmyturn" => clienttranslate('${you} must confirm circle'),
        "type" => "activeplayer",    
        "args" => "argConfirmCell",
        "possibleactions" => [ 
            "confirmCell",
            "cancelCell",
        ],
        "transitions" => [
            "chooseAction" => ST_PLAYER_CHOOSE_ACTION,
            "cancel" => ST_PLAYER_CHOOSE_CELL,
        ]
    ],
    ST_PLAYER_CHOOSE_ACTION => [
        "name" => "chooseAction",
        "description" => clienttranslate('${actplayer} must choose the order of actions'),
        "descriptionmyturn" => clienttranslate('${you} must choose the order of actions'),
        "type" => "activeplayer", 
        "action" => "stChooseAction",
        "args" => "argChooseAction", 
        "possibleactions" => [ 
            "startWithAction",
            "useFoulPlay",
        ],
        "transitions" => [
            "useFoulPlay" => ST_PLAYER_CHOOSE_FIGHTER,
            "nextMove" => ST_NEXT_MOVE,
        ]
    ],

    ST_PLAYER_CHOOSE_FIGHTER => [
        "name" => "chooseFighter",
        "description" => clienttranslate('${actplayer} must choose a fighter to play, move or activate'),
        "descriptionmyturn" => clienttranslate('${you} must choose a fighter to play, move or activate'),
        "descriptionOnlyFoolPlay" => clienttranslate('${actplayer} can use Foul Play'),
        "descriptionmyturnOnlyFoolPlay" => clienttranslate('${you} can use Foul Play'),
        "descriptionPLACE" => clienttranslate('${actplayer} must choose a fighter to play'),
        "descriptionmyturnPLACE" => clienttranslate('${you} must choose a fighter to play'),
        "descriptionMOVE" => clienttranslate('${actplayer} must choose a fighter to move or activate'),
        "descriptionmyturnMOVE" => clienttranslate('${you} must choose a fighter to move or activate'),
        "description4" => clienttranslate('${actplayer} must choose a fighter to push'),
        "descriptionmyturn4" => clienttranslate('${you} must choose a fighter to push'),
        "description5" => clienttranslate('${actplayer} must choose a fighter to assassinate'),
        "descriptionmyturn5" => clienttranslate('${you} must choose a fighter to assassinate'),
        "description9" => clienttranslate('${actplayer} must choose a fighter to disable'),
        "descriptionmyturn9" => clienttranslate('${you} must choose a fighter to disable'),
        "description21" => clienttranslate('${actplayer} must choose two fighters to remove'),
        "descriptionmyturn21" => clienttranslate('${you} must choose two fighters to remove'),
        "description22" => clienttranslate('${actplayer} must choose a fighter to reset its territory'),
        "descriptionmyturn22" => clienttranslate('${you} must choose a fighter to reset its territory'),
        "description23" => clienttranslate('${actplayer} must choose two fighters to swap'),
        "descriptionmyturn23" => clienttranslate('${you} must choose two fighters to swap'),
        "type" => "activeplayer",
        "args" => "argChooseFighter", 
        "possibleactions" => [ 
            "playFighter",
            "moveFighter",
            "activateFighter",
            "chooseFighters",
            "cancelChooseFighters",
            "pass",
            "passChooseFighters",
            "useFoulPlay",
            "cancelFoulPlay"
        ],
        "transitions" => [
            "useFoulPlay" => ST_PLAYER_CHOOSE_FIGHTER,
            "cancel" => ST_PLAYER_CHOOSE_FIGHTER,
            "chooseTerritory" => ST_PLAYER_CHOOSE_TERRITORY,
            "chooseFighter" => ST_PLAYER_CHOOSE_FIGHTER,
            "nextMove" => ST_NEXT_MOVE,
            "nextPlayer" => ST_NEXT_PLAYER,
        ]
    ],

    ST_PLAYER_CHOOSE_TERRITORY => [
        "name" => "chooseTerritory",
        "description" => '',
        "descriptionmyturn" => '',
        "description1" => clienttranslate('${actplayer} must choose a territory to place the new fighter'),
        "descriptionmyturn1" => clienttranslate('${you} must choose a territory to place the new fighter'),
        "description2" => clienttranslate('${actplayer} must choose a territory to move the fighter'),
        "descriptionmyturn2" => clienttranslate('${you} must choose a territory to move the fighter'),
        "description4" => clienttranslate('${actplayer} must choose a territory to push the fighter to'),
        "descriptionmyturn4" => clienttranslate('${you} must choose a territory to push the fighter to'),
        "description6" => clienttranslate('${actplayer} must choose a territory to fly to'),
        "descriptionmyturn6" => clienttranslate('${you} must choose a territory to fly to'),
        "description7" => clienttranslate('${actplayer} must choose a territory to move the fighter'),
        "descriptionmyturn7" => clienttranslate('${you} must choose a territory to move the fighter'),
        "description8" => clienttranslate('${actplayer} must choose a territory to place the initiative marker'),
        "descriptionmyturn8" => clienttranslate('${you} must choose a territory to place the initiative marker'),
        "type" => "activeplayer", 
        "args" => "argChooseTerritory", 
        "possibleactions" => [ 
            "chooseTerritory",
            "cancelChooseTerritory",
        ],
        "transitions" => [
            "cancel" => ST_PLAYER_CHOOSE_FIGHTER,
            "chooseCellInterference" => ST_PLAYER_CHOOSE_CELL_INTERFERENCE,
            "chooseFighter" => ST_PLAYER_CHOOSE_FIGHTER,
            "nextMove" => ST_NEXT_MOVE,
        ]
    ],

    ST_PLAYER_CHOOSE_CELL_INTERFERENCE => [
        "name" => "chooseCellInterference",
        "description" => clienttranslate('${actplayer} must choose a circle for Interference'),
        "descriptionmyturn" => clienttranslate('${you} must choose a circle for Interference'),
        "type" => "activeplayer", 
        "args" => "argChooseCellInterference", 
        "possibleactions" => [ 
            "chooseCellInterference",
        ],
        "transitions" => [
            "nextMove" => ST_NEXT_MOVE,
            "chooseFighter" => ST_PLAYER_CHOOSE_FIGHTER,
        ]
    ],
];

$gameGameStates = [

    ST_NEW_ROUND => [
        "name" => "newRound",
        "description" => "",
        "type" => "game",
        "action" => "stNewRound",
        "args" => "argNewRound",
        "updateGameProgression" => true,
        "transitions" => [
            "askActivatePlanning" => ST_PLAYER_ASK_ACTIVATE_PLANNING,
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
            "chooseAction" => ST_PLAYER_CHOOSE_ACTION,
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