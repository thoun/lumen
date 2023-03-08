class CardsManager extends CardManager<Card> {

    constructor(public game: LumenGame) {
        super(game, {
            animationManager: game.animationManager,
            getId: card => `card-${card.id}`,
            setupDiv: (card, div) => {
                div.classList.add('fighter');
                div.dataset.type = ''+card.type;
                div.dataset.subType = ''+card.subType;
                if (card.playerId) {
                    div.dataset.color = game.getPlayerColor(card.playerId);
                }

                if (card.type == 10 && card.playerId) {
                    const playerToken = document.createElement('div');
                    playerToken.classList.add('player-token');
                    playerToken.dataset.color = game.getPlayerColor(card.playerId);
                    div.appendChild(playerToken);
                }
            },
            setupFrontDiv: (card, div) => {
                div.id = `${this.getId(card)}-front`;
                game.setTooltip(div.id, this.getTooltip(card.subType, _('Active')));
            },
            setupBackDiv: (card, div) => {
                div.id = `${this.getId(card)}-back`;
                game.setTooltip(div.id, this.getTooltip(card.subType, _('Inactive')));
            },
        });
    }  

    public getName(subType: number) {
        switch (subType) {
            case 1: return _("The Shroomling");
            case 2: return _("The Mudshell");
            case 3: return _("The Restorer");
            case 4: return _("The Pusher");
            case 5: return _("The Assassin");
            case 6: return _("The Feathered");

            case 11: return _("The Epic Pusher");
            case 12: return _("The Epic Assassin");
            case 13: return _("The Impatient");
            case 14: return _("The Bomber");
            case 15: return _("The Weaver");
            case 16: return _("The Rootspring");
            case 17: return _("The Hypnotist");
            case 18: return _("The Metamorph");

            case 21: return _("Fury");
            case 22: return _("Clean Sheet");
            case 23: return _("Teleportation");

            case 31: return _("Discovery Mission");
            case 32: return _("Winter Mission");
            case 33: return _("Shroomling Mission");
        }
    }

    public getNotPlayedStrength(subType: number): number {
        switch (subType) {
            case 1: return 2;
            case 2: return 3;
            case 3: return 1;
            case 4: return 1;
            case 5: return 1;
            case 6: return 1;

            case 11: return 1;
            case 12: return 1;
            case 13: return 2;
            case 14: return 1;
            case 15: return 2;
            case 16: return 2;
            case 17: return 2;
            case 18: return 1;
        }
    }

    public getStrength(subType: number): number | string {
        switch (subType) {
            case 1: return 2;
            case 2: return 3;
            case 3: return 1;
            case 4: return 1;
            case 5: return 1;
            case 6: return 1;

            case 11: return 1;
            case 12: return 1;
            case 13: return 2;
            case 14: return 1;
            case 15: return '2 <div class="strength-icon"></div> / 1';
            case 16: return '2 <div class="strength-icon"></div> / 1';
            case 17: return 2;
            case 18: return '1 <div class="strength-icon"></div> / 3';
        }
    }

    public getDescription(subType: number) {
        switch (subType) {
            case 1: return _("No special ability");
            case 2: return _("This creature's shell offers protection against Deadly Fighters and the Fury. The Mudshell cannot be moved during phase 3 Issuing Orders.");
            case 3: return _("When you flip the Restorer to its INACTIVE side, flip all other Fighters in its Territory and all adjacent Territories back to their ACTIVE side.");
            case 4: return _("When you flip the Pusher to its INACTIVE side, push 1 Fighter of your choice (yours or your opponent's) to an adjacent Territory.");
            case 5: return _("This creature belongs to the family of Deadly Fighters. When you flip the Assassin to its INACTIVE side, remove 1 of your opponent's Basic Fighters or Mercenary Fighters from the same Territory. This Fighter is returned to its colored bag and can rejoin the battle later.");
            case 6: return _("When you flip the Feathered to its INACTIVE side, it takes off and moves by air to any other Territory on the Battlefield.");

            case 11: return `${_("When you flip it to its INACTIVE side, the Epic Pusher:")}<br> 
                &nbsp; ${_("MUST first move 1 space by land.")}<br> 
                &nbsp; ${_("THEN, it pushes 1 other Fighter of your choice (yours or your opponent's) to an adjacent Territory.")}`;
            case 12: return `${_("This creature belongs to the family of Deadly Fighters. When you flip it to its INACTIVE side, the Epic Assassin:")}<br> 
                &nbsp; ${_("MUST first move 1 space by land.")}<br> 
                &nbsp; ${_("THEN, it removes 1 of the opponent's Basic Fighters or Mercenary Fighters from the same Territory. This Fighter is returned to its colored bag and can rejoin the battle later.")}`;
            case 13: return _("When you flip it to its INACTIVE side, the Impatient takes the Initiative marker and places it on its own Territory or an adjacent Territory.");
            case 14: return _("This creature belongs to the family of Deadly Fighters. When you flip the Bomber to its INACTIVE side, remove 1 of your opponent's Basic Fighters or Mercenary Fighters from anywhere on the Battlefield. This Fighter is returned to its colored bag and can rejoin the battle later.");
            case 15: return `${_("When you flip it to its INACTIVE side, the Weaver:")}<br> 
                &nbsp; ${_("- cannot move.")}<br> 
                &nbsp; ${_("- captures all enemy Fighters inside its Territory. It's still possible for enemy Fighters to enter this Territory by air or by land, but it's not possible to leave the Territory as long as the Weaver is flipped to its INACTIVE side. The Weaver does not affect allied Fighters.")}`;
            case 16: return `${_("When you flip it to its INACTIVE side, the Rootspring:")}<br> 
                &nbsp; ${_("- cannot move.")}<br> 
                &nbsp; ${_("- spreads its roots all around its Territory, preventing enemy Fighters from entering or leaving the Territory by land.")}`;
            case 17: return _("When you flip the Hypnotist to its INACTIVE side, flip the enemy Fighters of your choice - in or adjacent to its Territory - to their INACTIVE side.");
            case 18: return _("While it's ACTIVE, the Metamorph cannot move during phase 3 Issuing Orders (but it can still be targeted by a Pusher). When you flip it to its INACTIVE side, it transforms into a Fighter with a Combat Strength of 3 that can move by land.");

            case 21: return _("Remove 2 enemy Fighters (Basic or Mercenary) from 2 different Territories of the Battlefield. These Fighters are returned to their colored bag and can rejoin the battle later.");
            case 22: return _("Choose a Territory: remove all Fighters present there (yours and your opponent’s). These Fighters are returned to their colored bags and can rejoin the battle later.");
            case 23: return _("Swap the positions of 2 of your Fighters on the Battlefield.");

            case 31: return _("Receive 1 Objective token if you have 2 Discovery tokens at the end of the game, and 1 additional Objective token for each additional Discovery token.");
            case 32: return _("Receive 1 Objective token if you control 2 Winter Territories at the end of the game, and 1 additional Objective token for each additional Winter Territory you control.");
            case 33: return _("Receive 1 Objective token for each of your Territories containing 2 Shroomlings at the end of the game, and 1 additional Objective token for each additional Shroomling in those Territories.");
        }
    }

    public getTooltip(subType: number, side?: string) {
        let html = `<h3>${this.getName(subType)}</h3>
        ${subType < 20 ? `${_("Combat Strength:")} <strong>${this.getStrength(subType)} <div class="strength-icon"></div></strong>` : ''}
        <p>${this.getDescription(subType)}</p>
        `;
        if (side && subType > 2 && subType < 20) {
            html += `<p><strong>${_('Side:')}</strong>  ${side}</p>`;
        }
        return html;
    }

    public getCurrentStrength(fighter: Card): number {
        if (fighter.played) {
            if ([15, 16].includes(fighter.subType) /* Rootspring, Weaver */) {
                return 1;
            } else if (fighter.subType == 18 /* Metamorph */) {
                return 3;
            }
        }
        return this.getNotPlayedStrength(fighter.subType);
    }
}