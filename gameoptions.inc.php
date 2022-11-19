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
                'name' => totranslate('A - First Contact'),
                'tmdisplay' => totranslate('A - First Contact'),
            ],
            2 => [
                'name' => totranslate('B - La grosse cavalerie'), // TODO
                'tmdisplay' => totranslate('B - La grosse cavalerie'), // TODO
            ],
            3 => [
                'name' => totranslate('C - UN TERRITOIRE TROP LOIN'), // TODO
                'tmdisplay' => totranslate('C - UN TERRITOIRE TROP LOIN'), // TODO
            ],
            4 => [
                'name' => totranslate('D - LA POSSIBILITÉ D’UNE ÎLE'), // TODO
                'tmdisplay' => totranslate('D - LA POSSIBILITÉ D’UNE ÎLE'), // TODO
            ],
            5 => [
                'name' => totranslate('E - APRÈS MOI LE DÉLUGE'), // TODO
                'tmdisplay' => totranslate('E - APRÈS MOI LE DÉLUGE'), // TODO
            ],
            6 => [
                'name' => totranslate('F - LE SOLDAT DE L’HIVER'), // TODO
                'tmdisplay' => totranslate('F - LE SOLDAT DE L’HIVER'), // TODO
            ],
            7 => [
                'name' => totranslate('G - LA GRANDE TRAVERSÉE'), // TODO
                'tmdisplay' => totranslate('G - LA GRANDE TRAVERSÉE'), // TODO
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
];

