<?php

class Circle {
    public int $circleId;
    public /*int | null*/ $value; // -1 for grayed
    public int $zone;
    public array $neighbours;

    public function __construct(int $circleId, /*int | null*/ $value = null, int $zone = -1) {
        $this->circleId = $circleId;
        $this->value = $value;
        $this->zone = $zone;
    }
}
?>