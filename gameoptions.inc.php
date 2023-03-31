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
 * gameoptions.inc.php
 *
 * Lumen game options description
 * 
 * In this file, you can define your game options (= game variants).
 *   
 * Note: If your game has no variant, you don't have to modify this file.
 *
 * Note²: All options defined in this file should have a corresponding "game state labels"
 *        with the same ID (see "initGameStateLabels" in lumen.game.php)
 *
 * !! It is not a good idea to modify this file when a game is running !!
 *
 */

require_once("modules/php/constants.inc.php");

$game_options = [

    SCENARIO_OPTION => [
        'name' => totranslate('Scenario'),
        'values' => [
            1 => [
                'name' => totranslate('A - First contact'),
                'tmdisplay' => totranslate('A - First contact'),
            ],
            2 => [
                'name' => totranslate('B - Disturbance on the western front'),
                'tmdisplay' => totranslate('B - Disturbance on the western front'),
            ],
            3 => [
                'name' => totranslate('C - A territory too far'),
                'tmdisplay' => totranslate('C - A territory too far'),
            ],
            4 => [
                'name' => totranslate('D - Isles of promise'),
                'tmdisplay' => totranslate('D - Isles of promise'),
            ],
            5 => [
                'name' => totranslate('E - After the flood'),
                'tmdisplay' => totranslate('E - After the flood'),
            ],
            6 => [
                'name' => totranslate('F - The winter soldier'),
                'tmdisplay' => totranslate('F - The winter soldier'),
            ],
            7 => [
                'name' => totranslate('G - The great crossing'),
                'tmdisplay' => totranslate('G - The great crossing'),
            ],
            0 => [
                'name' => totranslate('Random'),
                'tmdisplay' => totranslate('Random'),
            ],
        ],
        'default' => 1,
    ],
];

$game_preferences = [
    201 => [
        'name' => totranslate('Zone filling'),
        'needReload' => false,
        'values' => [
            1 => [ 'name' => totranslate( 'Color' ) ],
            2 => [ 'name' => totranslate( 'Pattern' ) ],
        ],
        'default' => 1,
    ],

    299 => [
        'name' => '',
        'needReload' => false,
        'values' => [
            1 => ['name' => totranslate('Enabled')],
            2 => ['name' => totranslate('Disabled')],
        ],
        'default' => 1
    ],
];

