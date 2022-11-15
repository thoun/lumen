<?php

class DiscoverTileType {
    public int $type; // 1 for coffre, 2 for power
    public int $number;
    public int $power; // or lumen value for coffre
  
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

    public function __construct($dbCard, $DISCOVER_TILES_TYPE) {
        $this->id = intval($dbCard['card_id']);
        $this->location = $dbCard['card_location'];
        $this->locationArg = intval($dbCard['card_location_arg']);
        $this->type = intval($dbCard['card_type']);
        $this->subType = intval($dbCard['card_type_arg']);
        $this->visible = boolval($dbCard['visible']);
        $this->power = $this->subType ? $DISCOVER_TILES_TYPE[$this->subType]->power : 0;
    } 

    public static function onlyId(DiscoverTile $card) {
        return new DiscoverTile([
            'card_id' => $card->id,
            'card_location' => $card->location,
            'card_location_arg' => $card->locationArg,
            'card_type' => null,
            'card_type_arg' => null,
            'visible' => null,
        ], null);
    }

    public static function onlyIds(array $cards) {
        return array_map(fn($card) => self::onlyId($card), $cards);
    }
}
?>