
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
    new Territory(11, 16, 0, 202, 194, 1),
    new Territory(15, 0, 100, 272, 358, 5),
  ]),
  new Battlefield(2, [
    new Territory(27, 0, 0, 282, 472, 7),
  ]),
  new Battlefield(3, [
    new Territory(31, 55, 220, 225, 252, 1),
    new Territory(33, 0, 0, 278, 255, 3),
  ]),
  new Battlefield(4, [
    new Territory(41, 151, 86, 132, 286, 1),
    new Territory(45, 0, 0, 222, 472, 5),
  ]),
  new Battlefield(5, [
    new Territory(51, 0, 0, 176, 252, 1),
    new Territory(53, 148, 85, 130, 185, 3),
    new Territory(54, 55, 252, 226, 220, 3),
  ]),
  new Battlefield(6, [
    new Territory(61, 55, 282, 146, 190, 1),
    new Territory(63, 0, 0, 150, 178, 3),
    new Territory(65, 44, 86, 237, 295, 5),
  ]),
  new Battlefield(6, [
    new Territory(71, 53, 226, 206, 172, 1),
    new Territory(73, 0, 0, 211, 263, 3),
    new Territory(75, 80, 8, 202, 464, 5),
  ]),
];
