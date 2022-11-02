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
        $this->power = $DISCOVER_TILES_TYPE[$this->subType]->power;
    } 

    public static function onlyId(Card $card) {
        return new Card([
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