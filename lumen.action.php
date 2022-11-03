<?php
/**
 *------
 * BGA framework: © Gregory Isabelli <gisabelli@boardgamearena.com> & Emmanuel Colin <ecolin@boardgamearena.com>
 * Lumen implementation : © <Your name here> <Your email address here>
 *
 * This code has been produced on the BGA studio platform for use on https://boardgamearena.com.
 * See http://en.doc.boardgamearena.com/Studio for more information.
 * -----
 * 
 * lumen.action.php
 *
 * Lumen main action entry point
 *
 *
 * In this file, you are describing all the methods that can be called from your
 * user interface logic (javascript).
 *       
 * If you define a method "myAction" here, then you can call it from your javascript code with:
 * this.ajaxcall( "/lumen/lumen/myAction.html", ...)
 *
 */
  
  
  class action_lumen extends APP_GameAction { 
    // Constructor: please do not modify
   	public function __default() {
  	    if( self::isArg( 'notifwindow') ) {
            $this->view = "common_notifwindow";
  	        $this->viewArgs['table'] = self::getArg( "table", AT_posint, true );
  	    } else {
            $this->view = "lumen_lumen";
            self::trace( "Complete reinitialization of board game" );
      }
  	} 

    public function chooseOperation() {
      self::setAjaxMode();

      $operation = self::getArg("operation", AT_posint, true);

      $this->game->chooseOperation($operation);

      self::ajaxResponse();
    }

    public function cancelOperation() {
      self::setAjaxMode();

      $this->game->cancelOperation();

      self::ajaxResponse();
    }

    public function chooseCell() {
      self::setAjaxMode();

      $cell = self::getArg("cell", AT_posint, true);

      $this->game->chooseCell($cell);

      self::ajaxResponse();
    }

    public function chooseCellLink() {
      self::setAjaxMode();

      $cell = self::getArg("cell", AT_posint, true);

      $this->game->chooseCellLink($cell);

      self::ajaxResponse();
    }

    public function playFighter() {
      self::setAjaxMode();

      $id = self::getArg("id", AT_posint, true);

      $this->game->playFighter($id);

      self::ajaxResponse();
    }

    public function moveFighter() {
      self::setAjaxMode();

      $id = self::getArg("id", AT_posint, true);

      $this->game->moveFighter($id);

      self::ajaxResponse();
    }

    public function activateFighter() {
      self::setAjaxMode();

      $id = self::getArg("id", AT_posint, true);

      $this->game->activateFighter($id);

      self::ajaxResponse();
    }

    public function chooseTerritory() {
      self::setAjaxMode();

      $id = self::getArg("id", AT_posint, true);

      $this->game->chooseTerritory($id);

      self::ajaxResponse();
    }

  }
  

