
class Territory {
    constructor(public id: number, public clipPath: string | any) {}
}

class Battlefield {
    public constructor(public id: number, public territories: Territory[]) {}
}

class BattlefieldPosition {
    public constructor(public battlefieldId: number, public rotation: number, public x: number, public y: number) {}
}

class Scenario {
    public constructor(public battlefields: BattlefieldPosition[]) {
    }
}

const BATTLEFIELDS = [
    null,
    new Battlefield(1, [
      new Territory(11, 1),
      new Territory(15, 5),
    ]),
    new Battlefield(2, [
      new Territory(27, 7),
    ]),
    new Battlefield(3, [
      new Territory(31, 1),
      new Territory(33, 3),
    ]),
    new Battlefield(4, [
      new Territory(41, 1),
      new Territory(45, 5),
    ]),
    new Battlefield(5, [
      new Territory(51, 1),
      new Territory(53, 3),
      new Territory(54, 3),
    ]),
    new Battlefield(6, [
      new Territory(61, 1),
      new Territory(63, 3),
      new Territory(65, 5),
    ]),
    new Battlefield(6, [
      new Territory(71, 1),
      new Territory(73, 3),
      new Territory(75, 5),
    ]),
  ];

const SCENARIOS = [
    null,
    new Scenario([
      new BattlefieldPosition(1, 0, 0, 0),
      new BattlefieldPosition(2, 0, 0, 0),
      new BattlefieldPosition(3, 0, 0, 0),
      new BattlefieldPosition(4, 0, 0, 0),
      new BattlefieldPosition(5, 0, 0, 0),
      new BattlefieldPosition(6, 0, 0, 0),
      new BattlefieldPosition(7, 0, 0, 0),
    ]),
  ];