class DiscoverTilesManager extends CardManager<DiscoverTile> {

    constructor(public game: LumenGame) {
        super(game, {
            getId: card => `discover-tile-${card.id}`,
            setupDiv: (card, div) => div.classList.add('discover-tile'),
            setupFrontDiv: (card, div) => this.setupFrontDiv(card, div)
        })
    }  

    public setupFrontDiv(card: DiscoverTile, div?: HTMLDivElement) {
        if (!div) {
            div = this.getCardElement(card).getElementsByClassName('front')[0] as HTMLDivElement;
        }

        if (card.type) {
            div.dataset.type = ''+card.type;
            div.dataset.subType = ''+card.subType;
        }
    }
}