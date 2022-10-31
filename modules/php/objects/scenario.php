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

    public function __construct(array $battlefieldsIds, array $territoriesLinks) {
        $this->battlefieldsIds = $battlefieldsIds;
        $this->territoriesLinks = $territoriesLinks;
    }
}
?>