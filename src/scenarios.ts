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
      case 5:
        return [
          new BattlefieldPosition(1, 0, 301, 180),
          new BattlefieldPosition(3, 228, 249, 90),
          new BattlefieldPosition(4, 690, 212, 270),
          new BattlefieldPosition(5, 249, 514, 270),
          new BattlefieldPosition(6, 441, 0, 180),
          new BattlefieldPosition(7, 477, 461, 0),
        ];
      case 6:
        return [
          new BattlefieldPosition(1, 99, 531, 90),
          new BattlefieldPosition(3, 540, 229, 90),
          new BattlefieldPosition(4, 560, 495, 270),
          new BattlefieldPosition(5, 312, 282, 180),
          new BattlefieldPosition(6, 259, 53, 270),
          new BattlefieldPosition(7, 487, 0, 0),
        ];
      case 7:
        return [
          new BattlefieldPosition(1, 228, 551, 90),
          new BattlefieldPosition(2, 669, 249, 90),
          new BattlefieldPosition(3, 441, 302, 180),
          new BattlefieldPosition(4, 1131, 212, 270),
          new BattlefieldPosition(5, 882, 0, 180),
          new BattlefieldPosition(6, 0, 604, 180),
          new BattlefieldPosition(7, 1360, 159, 0),
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
      case 5:
        return [
          new ObjectiveTokenPosition('A1', 163, 699),
          new ObjectiveTokenPosition('A2', 603, 508),
          new ObjectiveTokenPosition('B', 558, 0),
        ];
      case 6:
        return [
          new ObjectiveTokenPosition('A1', 407, 639),
          new ObjectiveTokenPosition('A2', 525, 266),
        ];
      case 7:
        return [
          new ObjectiveTokenPosition('A', 906, 148),
        ];
    }
  }

  private static getTitle(number: number): string {
    switch (number) {
      case 1: return _("A : First Contact"); // TODO
      case 2: return _("B : La grosse cavalerie"); // TODO
      case 3: return _("C - UN TERRITOIRE TROP LOIN"); // TODO
      case 4: return _("D - LA POSSIBILITÉ D’UNE ÎLE"); // TODO
      case 5: return _("E - APRÈS MOI LE DÉLUGE"); // TODO
      case 6: return _("F - LE SOLDAT DE L’HIVER"); // TODO
      case 7: return _("G - LA GRANDE TRAVERSÉE"); // TODO
    }
  }

  private static getSynopsis(number: number): string {
    switch (number) {
      case 1: return _("À chaque aurore et chaque crépuscule, les peuples du Monde Perdu s’attèlent à la recherche et la capture de lumens. Il est parfois necessaire de s’aventurer dans des terrtioires inconnus. La place n’est malheuresuement pas toujours libre…"); // TODO
      case 2: return _("Il est parfois nécessaire d’envoyer tout une armée afin de s’assurer la victoire. Mais attention à bien gérer votre campagne et ne pas perdre de temps !"); // TODO
      case 3: return _("Quand une zone s’apauvrie en Lumens il est necéssaire de s’aventurer dans des zones souvent inaccessibles."); // TODO
      case 4: return _("Les freluquets, combattants de base et non moins malins, arpentent les îles à la recherche de lumens via un réseau de galerie existant sous le Monde Perdu."); // TODO
      case 5: return _("Le Monde Perdu subit des intempéries hors du commun. certains peuple profiteront plus que d’autres de la situation !"); // TODO
      case 6: return _("Certains territoires du Monde Perdu subissent un hiver rude et localisé. Les combattants affronteront la rudesse du terrain… ou tenteront de la contourner !"); // TODO
      case 7: return _("Le printemps est rare sur le Monde Perdu mais source d’une grande quantité de lumens. Les peuples le savent et savent aussi qu’ils ne sont jamais seuls dans cette course aux lumens. Les plus rapides prennent souvent une option sur la victoire !"); // TODO
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
      case 5:
        return [
          _("Sauts interdits."), // TODO
          _("Les baveux peuvent faire des déplacements terrestres."), // TODO
          _("Les territoires verts sont boueux : impossible d’en sortir sauf pour les baveux ou en se faisant pousser."), // TODO
        ];
      case 6:
        return [
          _("Les combattants dans les territoires de l’hiver ne peuvent pas utiliser leurs capacités spéciales."), // TODO
        ];
      case 7:
        return [
          _("Vol par dessus le territoire de printemps interdit."), // TODO
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
      case 5: return [
        new ObjectiveDescription('A',  DURING_GAME, _("Frontières :"), _("Aussitôt qu’un joueur contrôle chaque territoire limitrophe, il gagne ce jeton Objectif définitivement."), 2),
        new ObjectiveDescription('B',  DURING_GAME, null, _("Un jeton Objectif pour le premier joueur à atteindre ce territoire hiver.")),
      ]; // TODO
      case 6: return [
        new ObjectiveDescription('A',  DURING_GAME, _("Frontières :"), _("Aussitôt qu’un joueur contrôle chaque territoire limitrophe, il gagne ce jeton Objectif définitivement."), 2),
        new ObjectiveDescription('B', END_GAME, null, _("2 jetons Objectifs pour le joueur qui a le plus de combattants dans les territoires de l’hiver.")),
      ]; // TODO
      case 7: return [
        new ObjectiveDescription('A',  DURING_GAME, _("Frontières :"), _("Aussitôt qu’un joueur contrôle chaque territoire limitrophe, il gagne ce jeton Objectif définitivement."), 2),
        new ObjectiveDescription('B', END_GAME, _("LA GRANDE TRAVERSÉE :"), _("3 jetons Objectifs pour le 1er joueur à atteindre le territoire de départ de son adversaire avec un de ses combattant.")),
      ]; // TODO
    }
  }

  private static getDiceLeft(number: number): number {
    switch (number) {
      case 1: return 700;
      case 2: return 300;
      case 3: return 700;
      case 4: return 300;
      case 5: case 6: return 100;
      case 7: return 300;
    }
  }
}
