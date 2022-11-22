
class Territory {
    constructor(
      public id: number, 
      public x: number, 
      public y: number, 
      public width: number, 
      public height: number,
      public direction: 'horizontal' | 'vertical',
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
    new Territory(11, 24, 0, 303, 291, 'horizontal', [[0, 0], [2, 1], [5, 9], [12, 8]]),
    new Territory(15, 0, 150, 408, 537, 'vertical', [[0, 0], [3, 3], [8, 7], [5, 9], [4, 12]]),
  ]),
  new Battlefield(2, [
    new Territory(27, 0, 0, 423, 708, 'vertical', [[2, 0], [4, 4], [9, 5], [9, 8], [5, 10], [6, 12]]),
  ]),
  new Battlefield(3, [
    new Territory(31, 82, 330, 337, 378, 'vertical', [[9, 0], [8, 4], [1, 12]]),
    new Territory(33, 0, 0, 417, 382, 'horizontal', [[0, 0], [4, 8], [12, 8]]),
  ]),
  new Battlefield(4, [
    new Territory(41, 226, 129, 198, 384, 'vertical', [[4, 0], [8, 6], [9, 12]]),
    new Territory(45, 0, 0, 333, 708, 'vertical', [[3, 0], [9, 6], [8, 12]]),
  ]),
  new Battlefield(5, [
    new Territory(51, 0, 0, 264, 378, 'vertical', [[2, 0], [8, 6], [6, 12]]),
    new Territory(53, 222, 127, 195, 277, 'vertical', [[6, 0], [5, 6], [8, 12]]),
    new Territory(54, 82, 378, 339, 330, 'vertical', [[8, 0], [7, 6], [3, 12]]),
  ]),
  new Battlefield(6, [
    new Territory(61, 82, 423, 219, 285, 'vertical', [[10, 0], [5, 6], [10, 12]]),
    new Territory(63, 0, 0, 225, 267, 'vertical', [[5, 0], [6, 6], [5, 12]]),
    new Territory(65, 66, 129, 355, 442, 'vertical', [[7, 0], [7, 6], [10, 12]]),
  ]),
  new Battlefield(7, [
    new Territory(71, 79, 339, 258, 309, 'vertical', [[10, 0], [8, 4], [0, 12]]),
    new Territory(73, 0, 0, 316, 394, 'vertical', [[2, 0], [3, 6], [5, 9], [12, 12]]),
    new Territory(75, 120, 12, 303, 696, 'vertical', [[1, 0], [2, 4], [10, 5], [10, 8], [5, 10], [4, 12]]),
  ]),
];
