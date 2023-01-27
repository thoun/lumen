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
 * stats.inc.php
 *
 * Lumen game statistics description
 *
 */

/*
    In this file, you are describing game statistics, that will be displayed at the end of the
    game.
    
    !! After modifying this file, you must use "Reload  statistics configuration" in BGA Studio backoffice
    ("Control Panel" / "Manage Game" / "Your Game")
    
    There are 2 types of statistics:
    _ table statistics, that are not associated to a specific player (ie: 1 value for each game).
    _ player statistics, that are associated to each players (ie: 1 value for each player in the game).

    Statistics types can be "int" for integer, "float" for floating point values, and "bool" for boolean
    
    Once you defined your statistics there, you can start using "initStat", "setStat" and "incStat" method
    in your game logic, using statistics names defined below.
    
    !! It is not a good idea to modify this file when a game is running !!

    If your game is already public on BGA, please read the following before any change:
    http://en.doc.boardgamearena.com/Post-release_phase#Changes_that_breaks_the_games_in_progress
    
    Notes:
    * Statistic index is the reference used in setStat/incStat/initStat PHP method
    * Statistic index must contains alphanumerical characters and no space. Example: 'turn_played'
    * Statistics IDs must be >=10
    * Two table statistics can't share the same ID, two player statistics can't share the same ID
    * A table statistic can have the same ID than a player statistics
    * Statistics ID is the reference used by BGA website. If you change the ID, you lost all historical statistic data. Do NOT re-use an ID of a deleted statistic
    * Statistic name is the English description of the statistic as shown to players
    
*/



$commonStats = [
    // 10+ : rounds/turns/other
    "completedObjectives" => [
        "id" => 17,
        "name" => totranslate("Completed objectives"),
        "type" => "int"
    ],
    "tokensFromMissions" => [
        "id" => 18,
        "name" => totranslate("Objective tokens from missions"),
        "type" => "int"
    ],
    "playObtained" => [
        "id" => 19,
        "name" => totranslate("Place actions obtained"),
        "type" => "int"
    ],
    "moveObtained" => [
        "id" => 99,
        "name" => totranslate("Move actions obtained"),
        "type" => "int"
    ],
    // 20+ : territories 
    "controlledTerritories" => [
        "id" => 20,
        "name" => totranslate("Number of controlled territories"),
        "type" => "int" 
    ],
    "tieControlTerritories" => [
        "id" => 21,
        "name" => totranslate("Number of territories with a tie"),
        "type" => "int"
    ],
    "controlledTerritories1" => [
        "id" => 22,
        "name" => totranslate("Number of winter controlled territories"),
        "type" => "int"
    ],
    "controlledTerritories3" => [
        "id" => 23,
        "name" => totranslate("Number of autumn controlled territories"),
        "type" => "int"
    ],
    "controlledTerritories5" => [
        "id" => 24,
        "name" => totranslate("Number of summer controlled territories"),
        "type" => "int"
    ],
    "controlledTerritories7" => [
        "id" => 25,
        "name" => totranslate("Number of spring controlled territories"),
        "type" => "int"
    ],
    // 30+ : fighters
    "placedFighters" => [
        "id" => 30,
        "name" => totranslate("Played fighters"),
        "type" => "int"
    ],
    "movedFighters" => [
        "id" => 31,
        "name" => totranslate("Moved fighters"),
        "type" => "int"
    ],
    "activatedFighters" => [
        "id" => 32,
        "name" => totranslate("Activated fighters"),
        "type" => "int"
    ],
    "territoryFighters" => [
        "id" => 33,
        "name" => totranslate("Fighters in territories at the end"),
        "type" => "int"
    ],
    "territoryFightersCumulatedStrength" => [
        "id" => 34,
        "name" => totranslate("Fighters in territories cumulated strength"),
        "type" => "int"
    ],
    "territoryFightersAverageStrength" => [
        "id" => 35,
        "name" => totranslate("Fighters in territories average strength"),
        "type" => "float"
    ],
    "placedMercenaries" => [
        "id" => 36,
        "name" => totranslate("Played mercenaries"),
        "type" => "int"
    ],
    "playedActions" => [
        "id" => 37,
        "name" => totranslate("Played actions"),
        "type" => "int"
    ],
    // 50+ : scoring
];

$stats_type = [

    // Statistics global to table
    "table" => $commonStats + [
        // 10+ : rounds/turns/other
        "roundNumber" => [
            "id" => 10,
            "name" => totranslate("Number of rounds"),
            "type" => "int"
        ], 
        // 20+ : territories 
        // 30+ : fighters
        // 50+ : scoring
    ],
    
    // Statistics existing for each player
    "player" => $commonStats + [
        // 10+ : rounds/turns/other
        "roundsAsFirstPlayer" => [
            "id" => 11,
            "name" => totranslate("Rounds as first player"),
            "type" => "int"
        ],
        "checkedMercenaries" => [
            "id" => 12,
            "name" => totranslate("Checked on mercenary track"),
            "type" => "int"
        ],
        "numberOfZones" => [
            "id" => 13,
            "name" => totranslate("Number of zones"),
            "type" => "int" 
        ],
        "numberOfLines" => [
            "id" => 14,
            "name" => totranslate("Number of lines"),
            "type" => "int" 
        ],
        "figuresOver6" => [
            "id" => 15,
            "name" => totranslate("Figures over 6"),
            "type" => "int" 
        ],
        "averageFigure" => [
            "id" => 16,
            "name" => totranslate("Average figure"),
            "type" => "int" 
        ],
        // 20+ : territories 
        // 30+ : fighters
        // 50+ : scoring
        "scoreTerritoryControl" => [
            "id" => 50,
            "name" => totranslate("Points with territory control"),
            "type" => "int"
        ],
        "scoreDiscoverTiles" => [
            "id" => 51,
            "name" => totranslate("Points with discover tiles"),
            "type" => "int"
        ],
        "scoreObjectiveTokens" => [
            "id" => 52,
            "name" => totranslate("Points with objective tokens"),
            "type" => "int"
        ],
    ]
];
