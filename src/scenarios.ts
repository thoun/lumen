class ObjectiveTokenPosition {
    public constructor(public letter: string, public x: number, public y: number) {}
}

class ObjectiveDescription {
    public constructor(public visibleLetters: string[], public letters: string[], public timing: string, public type: string | null, public text: string) {}
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
      case 1: return _("A - First contact");
      case 2: return _("B - Disturbance on the western front");
      case 3: return _("C - A territory too far");
      case 4: return _("D - Isles of promise");
      case 5: return _("E - After the flood");
      case 6: return _("F - The winter soldier");
      case 7: return _("G - The great crossing");
    }
  }

  private static getSynopsis(number: number): string {
    switch (number) {
      case 0: return '';
      case 1: return _("No one really knows exactly how or why it all began. And yet, the tale of this first battle is still deeply etched in our memories. Ever since, at every dusk and every dawn, the Night and Day clans battle for control over the Lumen, trying to tip the balance of the Lost World in THEIR favor.");
      case 2: return _("All of the intel our spies have gathered points to the same conclusion. If we want to get the upper hand in this battle, we need to move West, and take control of the coveted Spring Territory and its seven Lumen. To the victor go the spoils.");
      case 3: return _("In order to access these highly coveted Territories, we’ll have to go far... Very far. All the way across the river. Luckily, nothing is impossible when you have wings!");
      case 4: return _("The battle has found its way to the Archipelago. It's time to put your Shroomlings to good use. Although the other fighters like to mock them for their puny appearance, Shroomlings are the only creatures able to freely move from one island to another. For this purpose, they use a network of small, underground passages connecting the Winter Territories to the islets of the Archipelago.");
      case 5: return _("The conflict is getting bogged down... Literally and figuratively. There seems to be no end to the fighting, and now a cold and heavy rain has transformed the Lost World and its battlefields into an inextricable swamp. Well... Not for everyone. The Mudshells are delighted! Use them to your advantage.");
      case 6: return _("Winter is here. An icy cold slows down the advancements of even the bravest of troops. And yet... These Winter Territories offer a decisive advantage to whoever has the most Fighters there at the end of the battle.");
      case 7: return _("Infiltrating the enemy and stealing their secret plans is a sure-fire way to achieve victory. Will one of your Fighters be able to accomplish this difficult mission, even though the morning fog makes flying over the Spring Territory impossible?");
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
          _("Crossing the river by land costs 2 actions."),
          _("However, you can also move by air over the river."),
          _("A Fighter that gets pushed into the river is returned to its colored bag and can rejoin the battle later."),
        ];
      case 4:
        return [
          _("Players can use the special abilities of their Fighters and Glow Actions on the islands themselves, but not from one island to another."),
          _("UNDERGROUND PASSAGES - Shroomlings can move by land from one Winter Territory to another, even if those spaces are located on different islands."),
        ];
      case 5:
        return [
          _("Moving by air is not allowed."),
          _("The Mudshells can move by land."),
          _("The Summer Territories (green) are muddy. Leaving these spaces is impossible, except for the Mudshells, or by getting pushed."),
        ];
      case 6:
        return [
          _("Fighters inside the Winter Territories are unable to activate their special abilities."),
        ];
      case 7:
        return [
          _("Moving by air to, from, or over the Spring Territory is not allowed."),
        ];
    }
  }

  private static getObjectives(number: number): ObjectiveDescription[] {
    const DURING_GAME = _('During the game:');
    const END_GAME = _('At the end of the game:');
    const FRONTIERS = _("FRONTIERS") + ' - ';

    switch (number) {
      case 0: [];
      case 1: return [
        new ObjectiveDescription([''], ['1'], DURING_GAME, null, _("The first player to deploy a <i>Mercenary Fighter</i> to the Battlefield receives an Objective token.")),
        new ObjectiveDescription(['A', 'B'], ['A', 'B'], DURING_GAME, FRONTIERS, _("The first player to seize control of the 3 border Territories marked A or the 2 border Territories marked B immediately receives an Objective token.")),
        new ObjectiveDescription([''], ['3'], END_GAME, null, _("The player with the Initiative marker at the end of the game receives an Objective token.")),
      ];
      case 2: return [
        new ObjectiveDescription(['', ''], ['1'], DURING_GAME, null, _("Each player who manages to empty their colored bag receives 2 Objective tokens (maximum once per player).")),
        new ObjectiveDescription([''], ['2'],  END_GAME, null, _("The player with the fewest cells on their Command board that aren't part of an Area or a Chain of Orders receives an Objective token*. In case of a tie, neither player receives the Objective token.")),
      ];
      case 3: return [
        new ObjectiveDescription(['A', 'B'], ['A', 'B'],  DURING_GAME, FRONTIERS, _("The first player to seize control of the 3 border Territories marked A or the 3 border Territories marked B immediately receives an Objective token.")),
      ];
      case 4: return [
        new ObjectiveDescription([''], ['10', '11', '12'],  null, null, _("The player with the most Fighters on it receives an Objective token. In case of a tie, neither player receives an Objective token.")),
        new ObjectiveDescription(['+1'], ['20', '21', '22'],  null, null, _("if you are alone on the island, you receive an additional Objective token!")),
      ];
      case 5: return [
        new ObjectiveDescription(['A', 'B'], ['A', 'B'], DURING_GAME, FRONTIERS, _("The first player to seize control of the 2 border Territories marked A or the 2 border Territories marked B immediately receives an Objective token.")),
        new ObjectiveDescription(['C'], ['C'], DURING_GAME, null, _("The first player to reach this Winter Territory receives an Objective token.")),
      ];
      case 6: return [
        new ObjectiveDescription(['A', 'B'], ['A', 'B'], DURING_GAME, FRONTIERS, _("The first player to seize control of the 2 border Territories marked A or the 2 border Territories marked B immediately receives an Objective token.")),
        new ObjectiveDescription(['', ''], ['2'], END_GAME, null, _("The player with the most Fighters in the Winter Territories receives 2 Objective tokens. In case of a tie, neither player receives the Objective tokens.")),
      ];
      case 7: return [
        new ObjectiveDescription(['A'], ['A'], DURING_GAME, FRONTIERS, _("The first player to seize control of the 2 border Territories marked A immediately receives an Objective token.")),
        new ObjectiveDescription(['', '', ''], ['2'], DURING_GAME, _("THE GREAT CROSSING") + ' - ', _("The first player to move a Fighter into their opponent's starting Territory receives 3 Objective tokens.")),
      ];
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
