<?php

class Territory {
    public int $id; // 10 * battlefield id + index
    public int $lumens; // 1 for winter, 3 for autumn, 5 for summer, 7 for spring

    public function __construct(int $id, int $lumens) {
        $this->id = $id;
        $this->lumens = $lumens;
    }
}

class Battlefield {
    public int $id;
    public array $territories;
    public array $territoriesLinks;

    public function __construct(int $id, array $territories, array $territoriesLinks) {
        $this->id = $id;
        $this->territories = $territories;
        $this->territoriesLinks = $territoriesLinks;
    }
}

class Scenario {
    public array $battlefieldsIds;
    public array $territoriesLinks;
    public array $initialFighters; // first level index is territory. second is player_no (1,2), value is array of fighters
    public int $initiative;

    public function __construct(array $battlefieldsIds, array $territoriesLinks, array $initialFighters, int $initiative) {
        $this->battlefieldsIds = $battlefieldsIds;
        $this->territoriesLinks = $territoriesLinks;
        $this->initialFighters = $initialFighters;
        $this->initiative = $initiative;
    }
}
?>