<?php

class CardType {
    public int $type; // 1 for basic fighter, 2 for mercenaries, 3 for action d'éclat TODO, 4 for personal missions
    public int $number;
    public int $strength;
    public /* int | null*/ $power;
  
    public function __construct(int $type, int $number, int $strength, /* int | null*/ $power = null) {
        $this->type = $type;
        $this->number = $number;
        $this->strength = $strength;
        $this->power = $power;
    } 
}

class Card extends CardType {
    public int $id;
    public string $location;
    public int $locationArg;
    public int $subType;
    public bool $played;

    public function __construct($dbCard, $CARDS_TYPE) {
        $this->id = intval($dbCard['card_id']);
        $this->location = $dbCard['card_location'];
        $this->locationArg = intval($dbCard['card_location_arg']);
        $this->type = intval($dbCard['card_type']);
        $this->subType = intval($dbCard['card_type_arg']);
        $this->played = boolval($dbCard['played']);
        $this->strength = $CARDS_TYPE[$this->subType]->strength;
        $this->power = $CARDS_TYPE[$this->subType]->power;
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