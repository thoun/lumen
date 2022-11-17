
-- ------
-- BGA framework: © Gregory Isabelli <gisabelli@boardgamearena.com> & Emmanuel Colin <ecolin@boardgamearena.com>
-- Lumen implementation : © <Your name here> <Your email address here>
-- 
-- This code has been produced on the BGA studio platform for use on http://boardgamearena.com.
-- See http://en.boardgamearena.com/#!doc/Studio for more information.
-- -----

-- dbmodel.sql

-- This is the file where you are describing the database schema of your game
-- Basically, you just have to export from PhpMyAdmin your table structure and copy/paste
-- this export here.
-- Note that the database itself and the standard tables ("global", "stats", "gamelog" and "player") are
-- already created and must not be created here

-- Note: The database schema is created from this file when the game starts. If you modify this file,
--       you have to restart a game to see your changes in database.

-- Example 1: create a standard "card" table to be used with the "Deck" tools (see example game "hearts"):

CREATE TABLE IF NOT EXISTS `card` (
  `card_id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `card_type` int(11) NOT NULL,
  `card_type_arg` int(11) NOT NULL,
  `card_location` varchar(30) NOT NULL,
  `card_location_arg` int(11) NOT NULL,
  `player_id` int(11) NOT NULL DEFAULT '0',
  `played` smallint(1) NOT NULL DEFAULT '0',
  PRIMARY KEY (`card_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 AUTO_INCREMENT=1;

CREATE TABLE IF NOT EXISTS `discover_tile` (
  `card_id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `card_type` int(11) NOT NULL,
  `card_type_arg` int(11) NOT NULL,
  `card_location` varchar(16) NOT NULL,
  `card_location_arg` int(11) NOT NULL,
  `visible` smallint(1) NOT NULL DEFAULT '0',
  PRIMARY KEY (`card_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 AUTO_INCREMENT=1;

CREATE TABLE IF NOT EXISTS `objective_token` (
  `card_id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `card_type` int(11) NOT NULL,
  `card_type_arg` int(11) NULL,
  `card_location` varchar(16) NOT NULL,
  `card_location_arg` int(11) NOT NULL,
  PRIMARY KEY (`card_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 AUTO_INCREMENT=1;

 CREATE TABLE IF NOT EXISTS `link` (
   `player_id` int(11) NOT NULL,
   `index1` int(5) NOT NULL,
   `index2` int(5) NOT NULL,
   `middle` int(5) NOT NULL DEFAULT '-1',
   PRIMARY KEY (`player_id`, `index1`, `index2`)
 ) ENGINE=InnoDB DEFAULT CHARSET=utf8 AUTO_INCREMENT=1 ;
  
 CREATE TABLE IF NOT EXISTS `circle` (
   `circle_id` tinyint(2) NOT NULL,
   `player_id` int(11) NOT NULL,
   `value` int(5) NOT NULL,
   `zone` int(5) DEFAULT '-1' NOT NULL,
   PRIMARY KEY (`circle_id`, `player_id`)
 ) ENGINE=InnoDB DEFAULT CHARSET=utf8 AUTO_INCREMENT=1 ;
 
 CREATE TABLE IF NOT EXISTS `operation` ( 
   `player_id` int(11) NOT NULL,
   `operation` tinyint(1) NOT NULL,
   `nb` tinyint(1) NOT NULL,
   PRIMARY KEY (`player_id`, `operation`)
 ) ENGINE=InnoDB DEFAULT CHARSET=utf8 AUTO_INCREMENT=1 ;

CREATE TABLE IF NOT EXISTS `realized_objective` (
  `letter` varchar(1)NOT NULL,
  `player_id` int(11) NOT NULL DEFAULT '0',
  PRIMARY KEY (`letter`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 AUTO_INCREMENT=1;

-- Example 2: add a custom field to the standard "player" table
ALTER TABLE `player` ADD `checks` INT UNSIGNED NOT NULL DEFAULT '0';

