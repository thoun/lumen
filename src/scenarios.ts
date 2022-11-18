class ObjectiveTokenPosition {
    public constructor(public letter: string, public x: number, public y: number) {}
}

class ObjectiveDescription {
    public constructor(public letter: string, public timing: string, public type: string | null, public text: string, public number: number = 1) {}
}

class ScenarioInfos {
    public constructor(
      public battlefields: BattlefieldPosition[], 
      public objectiveTokens: ObjectiveTokenPosition[],
      public synopsis: string,
      public specialRules: string[],
      public objectives: ObjectiveDescription[],
    ) {}
}

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
          new BattlefieldPosition(1, 300, 0, 180),
          new BattlefieldPosition(2, 548, 213, 270),
          new BattlefieldPosition(3, 829, 389, 90),
          new BattlefieldPosition(4, 36, 21, 0),
          new BattlefieldPosition(5, 601, 442, 180),
          new BattlefieldPosition(6, 850, 655, 270),
          new BattlefieldPosition(7, 89, 250, 90),
        ];
      case 2:
        return [
          new BattlefieldPosition(1, 692, -88, 270),
          new BattlefieldPosition(2, 249, 213, 270),
          new BattlefieldPosition(3, 973, 88, 90),
          new BattlefieldPosition(4, 744, 140, 180),
          new BattlefieldPosition(5, 531, 389, 90),
          new BattlefieldPosition(6, 0, 0, 180),
          new BattlefieldPosition(7, 478, 160, 0),
        ];
    }
  }

  private static getObjectiveTokens(number: number): ObjectiveTokenPosition[] {
    switch (number) {
      case 1:
        return [
          new ObjectiveTokenPosition('B1', 200, 490),
          new ObjectiveTokenPosition('B2', 1035, 800),
        ];
      case 2:
        return [];
    }
  }

  private static getSynopsis(number: number): string {
    switch (number) {
      case 1: return _("À chaque aurore et chaque crépuscule, les peuples du Monde Perdu s’attèlent à la recherche et la capture de lumens. Il est parfois necessaire de s’aventurer dans des terrtioires inconnus. La place n’est malheuresuement pas toujours libre…"); // TODO
      case 2: return _("Il est parfois nécessaire d’envoyer tout une armée afin de s’assurer la victoire. Mais attention à bien gérer votre campagne et ne pas perdre de temps !"); // TODO
    }
  }

  private static getSpecialRules(number: number): string[] {
    switch (number) {
      case 1: 
      case 2:
        return [];
    }
  }

  private static getObjectives(number: number): ObjectiveDescription[] {
    const DURING_GAME = _('En cours de partie :');
    const END_GAME = _('En fin de partie :');

    switch (number) {
      case 1: return [
        new ObjectiveDescription('A', DURING_GAME, null, _("Le premier joueur qui réussit à amener <i>un mercenaire</i> sur le champ de bataille gagne ce jeton Objectif.")),
        new ObjectiveDescription('B',  DURING_GAME, _("Frontières :"), _("Aussitôt qu’un joueur contrôle chaque territoire limitrophe, il gagne ce jeton Objectif définitivement."), 2),
        new ObjectiveDescription('C', END_GAME, null, _("Le joueur qui possède le jeton d’intiative en fin de partie remporte cette pierre.")),
      ]; // TODO
      case 2: return [
        new ObjectiveDescription('A', DURING_GAME, null, _("Chaque joueur qui réussit à vider son sac gagne 2 jetons Objectifs.")),
        new ObjectiveDescription('B',  END_GAME, null, _("Le joueur qui a le moins d’orphelins gagne 1 jeton Objectif.")),
      ]; // TODO
    }
  }
}
