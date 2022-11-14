
class Territory {
    constructor(public id: number, public clipPath: string | any) {}
}

class Battlefield {
    public constructor(public id: number, public territories: Territory[]) {}
}

class BattlefieldPosition {
    public constructor(public battlefieldId: number, public x: number, public y: number, public rotation: number) {}
}

class ObjectiveTokenPosition {
    public constructor(public letter: string, public x: number, public y: number) {}
}


class ScenarioInfos {
    public constructor(
      public battlefields: BattlefieldPosition[], 
      public objectiveTokens: ObjectiveTokenPosition[],
      public synopsis: string,
      public specialRules: string[],
      public objectives: string[],
    ) {}
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

class Scenario extends ScenarioInfos {
  constructor(number: number) {
    super(
      Scenario.getBattlefields(number),
      Scenario.getObjectiveTokens(number),
      Scenario.getSynopsis(number),
      Scenario.getSpecialRules(number),
      Scenario.getObjectives(number)
    );
  }

  private static getBattlefields(number: number): BattlefieldPosition[] {
    switch (number) {
      case 1:
        return [
          new BattlefieldPosition(1, 0, 0, 0),
          new BattlefieldPosition(2, 0, 0, 0),
          new BattlefieldPosition(3, 0, 0, 0),
          new BattlefieldPosition(4, 0, 0, 0),
          new BattlefieldPosition(5, 0, 0, 0),
          new BattlefieldPosition(6, 0, 0, 0),
          new BattlefieldPosition(7, 0, 0, 0),
        ];
    }
  }

  private static getObjectiveTokens(number: number): ObjectiveTokenPosition[] {
    switch (number) {
      case 1:
        return [
          new ObjectiveTokenPosition('B1', 300, 200),
          new ObjectiveTokenPosition('B2', 600, 300),
        ];
    }
  }

  private static getSynopsis(number: number): string {
    switch (number) {
      case 1: return _("À chaque aurore et chaque crépuscule, les peuples du Monde Perdu s’attèlent à la recherche et la capture de lumens. Il est parfois necessaire de s’aventurer dans des terrtioires inconnus. La place n’est malheuresuement pas toujours libre…"); // TODO
    }
  }

  private static getSpecialRules(number: number): string[] {
    switch (number) {
      case 1: return [];
    }
  }

  private static getObjectives(number: number): string[] {
    switch (number) {
      case 1: return [
        '<strong>' + _("En cours de partie :") + '</strong>' + _("Le premier joueur qui réussit à amener <i>un mercenaire</i> sur le champ de bataille gagne ce jeton Objectif."),
        '<strong>' + _("En cours de partie :") + '</strong>' + '<strong>' + _("Frontières") + ' - </strong>' + _("Aussitôt qu’un joueur contrôle chaque territoire limitrophe, il gagne ce jeton Objectif définitivement."),
        '<strong>' + _("En fin de partie :") + '</strong>' + _("Le joueur qui possède le jeton d’intiative en fin de partie remporte cette pierre."),
      ]; // TODO
    }
  }
}
