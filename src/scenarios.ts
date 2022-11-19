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
      public title: string,
      public synopsis: string,
      public specialRules: string[],
      public objectives: ObjectiveDescription[],      
      public diceLeft: number,
    ) {}
}

class Scenario extends ScenarioInfos {
  constructor(number: number) {
    super(
      Scenario.getBattlefields(number),
      Scenario.getObjectiveTokens(number),
      Scenario.getTitle(number),
      Scenario.getSynopsis(number),
      Scenario.getSpecialRules(number),
      Scenario.getObjectives(number),      
      Scenario.getDiceLeft(number),
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
      case 3:
        return [
          new BattlefieldPosition(1, 173, 138, 180),
          new BattlefieldPosition(2, 120, -90, 270),
          new BattlefieldPosition(3, 731, 559, 90),
          new BattlefieldPosition(4, 679, 330, 0),
          new BattlefieldPosition(5, 943, 310, 180),
          new BattlefieldPosition(6, 450, 382, 270),
          new BattlefieldPosition(7, 402, 85, 90),
        ];
      case 4:
        return [
          new BattlefieldPosition(1, 559, 596, 180),
          new BattlefieldPosition(2, 720, -90, 270),
          new BattlefieldPosition(3, 112, 376, 90),
          new BattlefieldPosition(4, 59, 148, 0),
          new BattlefieldPosition(5, 773, 138, 180),
          new BattlefieldPosition(6, 133, 641, 270),
          new BattlefieldPosition(7, 788, 543, 90),
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
      case 3:
        return [
          new ObjectiveTokenPosition('A1', 486, 322),
          new ObjectiveTokenPosition('A2', 681, 508),
        ];
      case 4:
        return [];
    }
  }

  private static getTitle(number: number): string {
    switch (number) {
      case 1: return _("A : First Contact");
      case 2: return _("B : La grosse cavalerie"); // TODO
      case 3: return _("C - UN TERRITOIRE TROP LOIN"); // TODO
      case 4: return _("D - LA POSSIBILITÉ D’UNE ÎLE"); // TODO
    }
  }

  private static getSynopsis(number: number): string {
    switch (number) {
      case 1: return _("À chaque aurore et chaque crépuscule, les peuples du Monde Perdu s’attèlent à la recherche et la capture de lumens. Il est parfois necessaire de s’aventurer dans des terrtioires inconnus. La place n’est malheuresuement pas toujours libre…"); // TODO
      case 2: return _("Il est parfois nécessaire d’envoyer tout une armée afin de s’assurer la victoire. Mais attention à bien gérer votre campagne et ne pas perdre de temps !"); // TODO
      case 3: return _("Quand une zone s’apauvrie en Lumens il est necéssaire de s’aventurer dans des zones souvent inaccessibles."); // TODO
      case 4: return _("Les freluquets, combattants de base et non moins malins, arpentent les îles à la recherche de lumens via un réseau de galerie existant sous le Monde Perdu."); // TODO
    }
  }

  private static getSpecialRules(number: number): string[] {
    switch (number) {
      case 1: 
      case 2:
        return [];
      case 3:
        return [
          _("Traverser la rivière par voie terrestre coûte 2 actions."), // TODO
          _("On peut voler au dessus de la rivière."), // TODO
          _("Un jeton poussé dans la rivière est remis dans le sac de son propriétaire"), // TODO
        ];
      case 4:
        return [
          _("Les effets spéciaux (vol, tir, ..) sont autorisés à l’intérieur d’une île, mais pas d’une île à une autre"), // TODO
          _("Les territoires d’hiver sont tous connectés par des galeries empruntables UNIQUEMENT par les freluquets."), // TODO
        ];
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
      case 3: return [
        new ObjectiveDescription('A',  DURING_GAME, _("Frontières :"), _("Aussitôt qu’un joueur contrôle chaque territoire limitrophe, il gagne ce jeton Objectif définitivement."), 2),
      ]; // TODO
      case 4: return [
        new ObjectiveDescription('A',  END_GAME, _("Sur chaque île :"), _("une pierre pour celui qui a le plus grand nombre de combattants - Une pierre supplémentaire si un joueur est seul sur l’île !")),
      ]; // TODO
    }
  }

  private static getDiceLeft(number: number): number {
    switch (number) {
      case 1: return 700;
      case 2: return 300;
      case 3: return 700;
      case 4: return 300;
    }
  }
}
