<?php

class Circle {
    public int $circleId;
    public /*int | null*/ $value; // -1 for barred
    public int $zone;
    public array $neighbours;

    public function __construct(int $circleId, /*int | null*/ $value = null, int $zone = -1) {
        $this->circleId = $circleId;
        $this->value = $value;
        $this->zone = $zone;
    }
}

class Link {
    public int $index1;
    public int $index2;

    public function __construct(int $index1, int $index2) {
        $this->index1 = $index1;
        $this->index2 = $index2;
    }
}

?>