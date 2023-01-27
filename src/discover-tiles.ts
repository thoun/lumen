class DiscoverTilesManager extends CardManager<DiscoverTile> {

    constructor(public game: LumenGame) {
        super(game, {
            getId: card => `discover-tile-${card.id}`,
            setupDiv: (card, div) => div.classList.add('discover-tile'),
            setupFrontDiv: (card, div) => this.setupFrontDiv(card, div),            
            setupBackDiv: (card, div) => {
                div.id = `discover-tile-${card.id}-back`;

                this.game.setTooltip(div.id, _('Discover tile'));
            }
        })
    }  

    public setupFrontDiv(card: DiscoverTile, div: HTMLDivElement) {
        div.id = `discover-tile-${card.id}-front`;

        if (card.type) {
            div.dataset.type = ''+card.type;
            div.dataset.subType = ''+card.subType;
        }

        this.game.setTooltip(div.id, this.getTooltip(card.type, card.subType));
    }

    public getName(type: number, subType: number) {
        switch (type) {
            case 1: return _("Loot");
            case 2:
                switch (subType) {
                    case 1: return _("Interference");
                    case 2: return _("Planning");
                    case 3: return _("Paratrooper");
                    case 4: return _("Priority Message");
                    case 5: return _("Foul Play");
                }
        }
    }

    public getDescription(type: number, subType: number) {
        switch (type) {
            case 1: return _("When you reveal a Loot token, leave it on its Territory until one of the clans is able to claim it. Each Loot token is worth 3 to 5 Lumen. To permanently claim a Loot token on a Territory, the combined Combat Strength of one clan's Fighters in that Territory must be bigger than the other clan's combined Combat Strength, with a difference that's equal to or higher than the number of Lumen on the Loot token. If your opponent has no Fighters on the Territory, their Combat Strength is 0. In that case, the combined Combat Strength of your Fighters must be equal to the number on the Loot token before you can claim it. As soon as a clan meets the condition, they claim the Loot token and will score its VP at the end of the game.");
            case 2:
                switch (subType) {
                    case 1: return _("When you reveal this token, discard it.") + ' ' + _("Immediately destroy 1 cell of your choice on your opponent's Command board by barring it.");
                    case 2: return _("When you reveal this token, place it face up next to your Command board.") + ' ' + _("On a future turn in which you are the first player, you may discard it. If you do, you don't have to roll the dice. Instead, you may freely choose their values!");
                    case 3: return _("When you reveal this token, discard it.") + ' ' + _("Draw a Fighter from your bag at random, and immediately add it to this Territory as a Reinforcement.");
                    case 4: return _("When you reveal this token, discard it.") + ' ' + _("Immediately cross off the leftmost available box of the High Command area on your Command board. Apply the effects of this box, if any.");
                    case 5: return _("When you reveal this token, place it face up next to your Command board.") + ' ' + _("During phase 3 Issuing Orders, each Foul Play token you discard allows you to gain an extra action (Move a Fighter by land or by air, Activate a special ability, or Apply the effect of a Glow Action token). If you have both Foul Play tokens, you’re allowed to use both of them during the same turn in order to gain 2 additional free actions.");
                }
        }
    }

    public getTooltip(type: number, subType: number) {
        return `<h3>${this.getName(type, subType)}</h3>
        <p>${this.getDescription(type, subType)}</p>
        `;
    }
}