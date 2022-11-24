class ObjectiveTokenPosition {
    public constructor(public letter: string, public x: number, public y: number) {}
}

class ObjectiveDescription {
    public constructor(public letters: string[], public timing: string, public type: string | null, public text: string) {}
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
      case 0:
        return [
          new BattlefieldPosition(1, 0, 0, 0),
          new BattlefieldPosition(2, 423*1, 0, 0),
          new BattlefieldPosition(3, 423*2, 0, 0),
          new BattlefieldPosition(4, 423*3, 0, 0),
          new BattlefieldPosition(5, 423*4, 0, 0),
          new BattlefieldPosition(6, 423*5, 0, 0),
          new BattlefieldPosition(7, 423*6, 0, 0),
        ];
      case 1:
        return [
          new BattlefieldPosition(1, 452, 1, 180),
          new BattlefieldPosition(2, 824, 319, 270),
          new BattlefieldPosition(3, 1246, 584, 90),
          new BattlefieldPosition(4, 54, 31, 0),
          new BattlefieldPosition(5, 903, 662, 180),
          new BattlefieldPosition(6, 1276, 981, 270),
          new BattlefieldPosition(7, 133, 375, 90),
        ];
      case 2:
        return [
          new BattlefieldPosition(1, 1037, -133, 270),
          new BattlefieldPosition(2, 373, 319, 270),
          new BattlefieldPosition(3, 1459, 132, 90),
          new BattlefieldPosition(4, 1116, 210, 180),
          new BattlefieldPosition(5, 796, 583, 90),
          new BattlefieldPosition(6, 0, 0, 180),
          new BattlefieldPosition(7, 717, 240, 0),
        ];
      case 3:
        return [
          new BattlefieldPosition(1, 259, 207, 180),
          new BattlefieldPosition(2, 180, -135, 270),
          new BattlefieldPosition(3, 1096, 838, 90),
          new BattlefieldPosition(4, 1018, 495, 0),
          new BattlefieldPosition(5, 1414, 465, 180),
          new BattlefieldPosition(6, 675, 573, 270),
          new BattlefieldPosition(7, 601, 128, 90),
        ];
      case 4:
        return [
          new BattlefieldPosition(1, 838, 894, 180),
          new BattlefieldPosition(2, 1080, -135, 270),
          new BattlefieldPosition(3, 168, 564, 90),
          new BattlefieldPosition(4, 89, 222, 0),
          new BattlefieldPosition(5, 1159, 207, 180),
          new BattlefieldPosition(6, 199, 961, 270),
          new BattlefieldPosition(7, 1181, 816, 90),
        ];
      case 5:
        return [
          new BattlefieldPosition(1, 0, 451, 180),
          new BattlefieldPosition(3, 342, 373, 90),
          new BattlefieldPosition(4, 1034, 319, 270),
          new BattlefieldPosition(5, 373, 771, 270),
          new BattlefieldPosition(6, 661, 0, 180),
          new BattlefieldPosition(7, 713, 693, 0),
        ];
      case 6:
        return [
          new BattlefieldPosition(1, 153, 796, 90),
          new BattlefieldPosition(3, 810, 344, 90),
          new BattlefieldPosition(4, 840, 742, 270),
          new BattlefieldPosition(5, 466, 423, 180),
          new BattlefieldPosition(6, 388, 79, 270),
          new BattlefieldPosition(7, 731, 0, 0),
        ];
      case 7:
        return [
          new BattlefieldPosition(1, 342, 826, 90),
          new BattlefieldPosition(2, 1004, 375, 90),
          new BattlefieldPosition(3, 661, 453, 180),
          new BattlefieldPosition(4, 1697, 319, 270),
          new BattlefieldPosition(5, 1324, 1, 180),
          new BattlefieldPosition(6, 0, 906, 180),
          new BattlefieldPosition(7, 2041, 240, 0),
        ];
    }
  }

  private static getObjectiveTokens(number: number): ObjectiveTokenPosition[] {
    switch (number) {
      case 0: 
      return [];
      case 1:
        return [
          new ObjectiveTokenPosition('A', 286, 772),
          new ObjectiveTokenPosition('B', 1570, 1205),
        ];
      case 2:
        return [];
      case 3:
        return [
          new ObjectiveTokenPosition('A', 746, 530),
          new ObjectiveTokenPosition('B', 1042, 782),
        ];
      case 4:
        return [];
      case 5:
        return [
          new ObjectiveTokenPosition('A', 273, 1088),
          new ObjectiveTokenPosition('B', 920, 780),
          new ObjectiveTokenPosition('C', 890, 24),
        ];
      case 6:
        return [
          new ObjectiveTokenPosition('A', 824, 418),
          new ObjectiveTokenPosition('B', 654, 988),
        ];
      case 7:
        return [
          new ObjectiveTokenPosition('A', 1382, 256),
        ];
    }
  }

  private static getTitle(number: number): string {
    switch (number) {
      case 0: return '';
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
      case 0: return '';
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
      case 0:
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
      case 0: [];
      case 1: return [
        new ObjectiveDescription([''], DURING_GAME, null, _("Le premier joueur qui réussit à amener <i>un mercenaire</i> sur le champ de bataille gagne ce jeton Objectif.")),
        new ObjectiveDescription(['A', 'B'],  DURING_GAME, _("Frontières :"), _("Aussitôt qu’un joueur contrôle chaque territoire limitrophe, il gagne ce jeton Objectif définitivement.")),
        new ObjectiveDescription([''], END_GAME, null, _("Le joueur qui possède le jeton d’intiative en fin de partie remporte cette pierre.")),
      ]; // TODO
      case 2: return [
        new ObjectiveDescription(['', ''], DURING_GAME, null, _("Chaque joueur qui réussit à vider son sac gagne 2 jetons Objectifs.")),
        new ObjectiveDescription([''],  END_GAME, null, _("Le joueur qui possède sur sa Fiche de Commandement le moins de cellules n’appartenant ni à une Zone ni à une Chaîne d’Ordres remporte un jeton Objectif. En cas d’égalité, personne ne reçoit de jeton Objectif.")),
      ]; // TODO
      case 3: return [
        new ObjectiveDescription(['A', 'B'],  DURING_GAME, _("Frontières :"), _("Aussitôt qu’un joueur contrôle chaque territoire limitrophe, il gagne ce jeton Objectif définitivement.")),
      ]; // TODO
      case 4: return [
        new ObjectiveDescription([''],  null, null, _("Un jeton Objectif pour le joueur qui a le plus grand nombre de Combattants,")),
        new ObjectiveDescription(['+1'],  null, null, _("Un jeton Objectif supplémentaire si le joueur est seul sur l’île !")),
      ]; // TODO
      case 5: return [
        new ObjectiveDescription(['A', 'B'],  DURING_GAME, _("Frontières :"), _("Aussitôt qu’un joueur contrôle chaque territoire limitrophe, il gagne ce jeton Objectif définitivement.")),
        new ObjectiveDescription(['C'],  DURING_GAME, null, _("Un jeton Objectif pour le premier joueur à atteindre ce territoire hiver.")),
      ]; // TODO
      case 6: return [
        new ObjectiveDescription(['A', 'B'],  DURING_GAME, _("Frontières :"), _("Aussitôt qu’un joueur contrôle chaque territoire limitrophe, il gagne ce jeton Objectif définitivement.")),
        new ObjectiveDescription(['', ''], END_GAME, null, _("2 jetons Objectifs pour le joueur qui a le plus de combattants dans les territoires de l’hiver.")),
      ]; // TODO
      case 7: return [
        new ObjectiveDescription(['A'],  DURING_GAME, _("Frontières :"), _("Aussitôt qu’un joueur contrôle chaque territoire limitrophe, il gagne ce jeton Objectif définitivement.")),
        new ObjectiveDescription(['', '', ''], END_GAME, _("LA GRANDE TRAVERSÉE :"), _("3 jetons Objectifs pour le 1er joueur à atteindre le territoire de départ de son adversaire avec un de ses combattant.")),
      ]; // TODO
    }
  }

  private static getDiceLeft(number: number): number {
    switch (number) {
      case 0:
      case 1: return 1050;
      case 2: return 450;
      case 3: return 1050;
      case 4: return 450;
      case 5: case 6: return 150;
      case 7: return 450;
    }
  }
}
