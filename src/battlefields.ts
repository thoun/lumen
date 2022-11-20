
class Territory {
    constructor(public id: number, public x: number, public y: number, public width: number, public height: number, public clipPath: string | any) {}
}

class Battlefield {
    public constructor(public id: number, public territories: Territory[]) {}
}

class BattlefieldPosition {
    public constructor(public battlefieldId: number, public x: number, public y: number, public rotation: number) {}
}

const BATTLEFIELDS = [
  null,
  new Battlefield(1, [
    new Territory(11, 24, 0, 303, 291, 1),
    new Territory(15, 0, 150, 408, 537, 5),
  ]),
  new Battlefield(2, [
    new Territory(27, 0, 0, 423, 708, 7),
  ]),
  new Battlefield(3, [
    new Territory(31, 82, 330, 337, 378, 1),
    new Territory(33, 0, 0, 417, 382, 3),
  ]),
  new Battlefield(4, [
    new Territory(41, 226, 129, 198, 384, 1),
    new Territory(45, 0, 0, 333, 708, 5),
  ]),
  new Battlefield(5, [
    new Territory(51, 0, 0, 264, 378, 1),
    new Territory(53, 222, 127, 195, 277, 3),
    new Territory(54, 82, 378, 339, 330, 3),
  ]),
  new Battlefield(6, [
    new Territory(61, 82, 423, 219, 285, 1),
    new Territory(63, 0, 0, 225, 267, 3),
    new Territory(65, 66, 129, 355, 442, 5),
  ]),
  new Battlefield(6, [
    new Territory(71, 79, 339, 309, 258, 1),
    new Territory(73, 0, 0, 316, 394, 3),
    new Territory(75, 120, 12, 303, 696, 5),
  ]),
];
