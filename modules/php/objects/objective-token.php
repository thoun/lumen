<?php

class ObjectiveToken {
    public int $id;
    public string $location;
    public int $locationArg;
    public int $lumens;

    public function __construct($dbCard) {
        $this->id = intval($dbCard['id']);
        $this->location = $dbCard['location'];
        $this->locationArg = intval($dbCard['location_arg']);
        $this->lumens = intval($dbCard['type']);
    } 

    public static function onlyId(ObjectiveToken $card) {
        return new ObjectiveToken([
            'id' => $card->id,
            'location' => $card->location,
            'location_arg' => $card->locationArg,
            'type' => null
        ], null);
    }

    public static function onlyIds(array $cards) {
        return array_map(fn($card) => self::onlyId($card), $cards);
    }
}
?>