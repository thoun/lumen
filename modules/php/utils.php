<?php

require_once(__DIR__.'/objects/cards-points.php');

trait UtilTrait {

    //////////////////////////////////////////////////////////////////////////////
    //////////// Utility functions
    ////////////

    function array_find(array $array, callable $fn) {
        foreach ($array as $value) {
            if($fn($value)) {
                return $value;
            }
        }
        return null;
    }

    function array_find_key(array $array, callable $fn) {
        foreach ($array as $key => $value) {
            if($fn($value)) {
                return $key;
            }
        }
        return null;
    }

    function array_some(array $array, callable $fn) {
        foreach ($array as $value) {
            if($fn($value)) {
                return true;
            }
        }
        return false;
    }
    
    function array_every(array $array, callable $fn) {
        foreach ($array as $value) {
            if(!$fn($value)) {
                return false;
            }
        }
        return true;
    }

    function array_identical(array $a1, array $a2) {
        if (count($a1) != count($a2)) {
            return false;
        }
        for ($i=0;$i<count($a1);$i++) {
            if ($a1[$i] != $a2[$i]) {
                return false;
            }
        }
        return true;
    }

    function getPlayersIds() {
        return array_keys($this->loadPlayersBasicInfos());
    }

    function getPlayerName(int $playerId) {
        return self::getUniqueValueFromDB("SELECT player_name FROM player WHERE player_id = $playerId");
    }

    
    
    function getOpMax(int $type) {
        return $type > 2 ? 4 : 3;
    }
    
    function getValue(int $val1, int $val2, int $type) {        
        $value = 0;
        switch($type)
        {
            case 1:
                $value = min($val1, $val2);
                break;
            case 2:
                $value = max($val1, $val2);
                break;
            case 3:
                $value = abs($val1-$val2);
                break;
            case 4:
                $value = $val1+$val2;
                break;
            case 5:
                $value = $val1*$val2;
                break;
        }
        return $value;
    }

}
