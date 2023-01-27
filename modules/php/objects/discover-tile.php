<?php

class DiscoverTileType {
    public int $type; // 1 for Loot, 2 for power
    public int $number;
    public int $power; // or lumen value for Loot
  
    public function __construct(int $type, int $number, int $power) {
        $this->type = $type;
        $this->number = $number;
        $this->power = $power;
    } 
}

class DiscoverTile extends DiscoverTileType {
    public int $id;
    public string $location;
    public int $locationArg;
    public int $subType;
    public bool $visible;

    public function __construct($dbCard) {
        $this->id = intval($dbCard['card_id']);
        $this->location = $dbCard['card_location'];
        $this->locationArg = intval($dbCard['card_location_arg']);
        $this->type = intval($dbCard['card_type']);
        $this->subType = intval($dbCard['card_type_arg']);
        $this->visible = boolval($dbCard['visible']);
        $this->power = $this->type == 2 ? $this->subType : 0;
    } 

    public static function onlyId(DiscoverTile $card) {
        return new DiscoverTile([
            'card_id' => $card->id,
            'card_location' => $card->location,
            'card_location_arg' => $card->locationArg,
            'card_type' => null,
            'card_type_arg' => null,
            'visible' => null,
        ]);
    }

    public static function onlyIds(array $cards) {
        return array_map(fn($card) => self::onlyId($card), $cards);
    }
}
?>