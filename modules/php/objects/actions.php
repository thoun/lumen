<?php

class Action {
    public string $type; // PLACE or MOVE
    public int $initial;
    public int $remaining;
  
    public function __construct(string $type, int $count) {
        $this->type = $type;
        $this->initial = $count;
        $this->remaining = $count;
    } 
}

class Actions {
    public array $actions = [];
    public string $startWith = '';
    public /*int|null*/ $currentCoupFourreId = null;
  
    public function __construct(array $actions) {
        $this->actions = $actions;
    } 
}