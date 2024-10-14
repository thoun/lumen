
class Territory {
    constructor(
      public id: number, 
      public x: number, 
      public y: number, 
      public width: number, 
      public height: number,
      public curve?: number[][]) {}
}

class Battlefield {
    public constructor(
      public id: number, 
      public territories: Territory[]
    ) {}
}

class BattlefieldPosition {
    public constructor(
      public battlefieldId: number, 
      public x: number, 
      public y: number, 
      public rotation: 0 | 90 | 180 | 270
    ) {}
}

const BATTLEFIELDS = [
  null,
  new Battlefield(1, [
    new Territory(11, 24, 0, 303, 291, [[1, 1], [3, 2], [5, 9], [12, 8]]),
    new Territory(15, 0, 150, 408, 537, [[1, 1], [3, 3], [9, 5], [10, 6], [7, 9], [6, 12]]),
  ]),
  new Battlefield(2, [
    new Territory(27, 0, 0, 423, 708, [[2, 1], [4, 4], [9, 5], [9, 8], [5, 10]]),
  ]),
  new Battlefield(3, [
    new Territory(31, 82, 330, 337, 378, [[9, 0], [8, 4], [3, 10]]),
    new Territory(33, 0, 0, 417, 382, [[2, 1], [4, 8], [11, 8]]),
  ]),
  new Battlefield(4, [
    new Territory(41, 226, 129, 198, 384, [[4, 1], [8, 6], [9, 12]]),
    new Territory(45, 0, 0, 333, 708, [[3, 1], [4, 4], [9, 6], [9, 9], [8, 11]]),
  ]),
  new Battlefield(5, [
    new Territory(51, 0, 0, 264, 378, [[3, 1], [6, 6], [8, 11]]),
    new Territory(53, 222, 127, 195, 277, [[6, 1], [6, 6], [7, 11]]),
    new Territory(54, 82, 378, 339, 330, [[11, 1], [5, 6], [4, 9]]),
  ]),
  new Battlefield(6, [
    new Territory(61, 82, 423, 219, 285, [[10, 0], [5, 6], [10, 12]]),
    new Territory(63, 0, 0, 225, 267, [[3, 1], [6, 6], [8, 11]]),
    new Territory(65, 66, 129, 355, 442, [[1, 4], [3, 5], [7, 3], [9, 4], [8, 6], [10, 11]]),
  ]),
  new Battlefield(7, [
    new Territory(71, 79, 339, 258, 309, [[11, 1], [8, 4], [2, 10]]),
    new Territory(73, 0, 0, 316, 394, [[2, 1], [3, 2], [3, 6], [5, 9], [11, 10]]),
    new Territory(75, 120, 12, 303, 696, [[1, 1], [2, 3], [3, 4], [8, 3], [9, 5], [10, 8], [6, 9], [5, 10], [4, 11]]),
  ]),
];
