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

    public setupFrontDiv(card: DiscoverTile, div?: HTMLDivElement) {
        if (!div) {
            div = this.getCardElement(card).getElementsByClassName('front')[0] as HTMLDivElement;
        }
        div.id = `discover-tile-${card.id}-front`;

        if (card.type) {
            div.dataset.type = ''+card.type;
            div.dataset.subType = ''+card.subType;
        }

        this.game.setTooltip(div.id, this.getTooltip(card.type, card.subType));
    }

    public getName(type: number, subType: number) { // TODO
        switch (type) {
            case 1: return _("Découvertes");
            case 2:
                switch (subType) {
                    case 1: return _("Brouillage");
                    case 2: return _("Planification");
                    case 3: return _("Parachutage");
                    case 4: return _("Message prioritaire");
                    case 5: return _("Coup fourré");
                }
        }
    }

    public getDescription(type: number, subType: number) { // TODO
        switch (type) {
            case 1: return _("Découvertes");
            case 2:
                switch (subType) {
                    case 1: return _("Brouillage");
                    case 2: return _("Planification");
                    case 3: return _("Parachutage");
                    case 4: return _("Message prioritaire");
                    case 5: return _("Coup fourré");
                }
        }
    }

    public getTooltip(type: number, subType: number) {
        return `<h3>${this.getName(type, subType)}</h3>
        <p>${this.getDescription(type, subType)}</p>
        `;
    }
}