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

    public function activatePlanification() {
      self::setAjaxMode();

      $this->game->activatePlanification();

      self::ajaxResponse();
    }

    public function passPlanification() {
      self::setAjaxMode();

      $this->game->passPlanification();

      self::ajaxResponse();
    }

    public function chooseDiceFaces() {
      self::setAjaxMode();

      $white = self::getArg("white", AT_posint, true);
      $black = self::getArg("black", AT_posint, true);

      $this->game->chooseDiceFaces($white, $black);

      self::ajaxResponse();
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

    public function chooseCellBrouillage() {
      self::setAjaxMode();

      $cell = self::getArg("cell", AT_posint, true);

      $this->game->chooseCellBrouillage($cell);

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

    public function chooseFighters() {
      self::setAjaxMode();

      $idsStr = explode(',', self::getArg("ids", AT_numberlist, true));
      $ids = array_map(fn($idStr) => intval($idStr), $idsStr);

      $this->game->chooseFighters($ids);

      self::ajaxResponse();
    }

    public function cancelChooseFighters() {
      self::setAjaxMode();

      $this->game->cancelChooseFighters();

      self::ajaxResponse();
    }

    public function pass() {
      self::setAjaxMode();

      $this->game->pass();

      self::ajaxResponse();
    }

    public function chooseTerritory() {
      self::setAjaxMode();

      $id = self::getArg("id", AT_posint, true);

      $this->game->chooseTerritory($id);

      self::ajaxResponse();
    }

    public function cancelChooseTerritory() {
      self::setAjaxMode();

      $this->game->cancelChooseTerritory();

      self::ajaxResponse();
    }

    public function passChooseFighters() {
      self::setAjaxMode();

      $this->game->passChooseFighters();

      self::ajaxResponse();
    }

    public function useCoupFourre() {
      self::setAjaxMode();

      $this->game->useCoupFourre();

      self::ajaxResponse();
    }

  }
  

