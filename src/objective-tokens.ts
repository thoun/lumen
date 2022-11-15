class ObjectiveTokensManager extends CardManager<ObjectiveToken> {

    constructor(public game: LumenGame) {
        super(game, {
            getId: card => `objective-token-${card.id}`,
            setupDiv: (card, div) => div.classList.add('objective-token'),
            setupFrontDiv: (card, div) => this.setupFrontDiv(card, div)
        })
    }  

    public setupFrontDiv(card: DiscoverTile, div?: HTMLDivElement) {
        if (!div) {
            div = this.getCardElement(card).getElementsByClassName('front')[0] as HTMLDivElement;
        }

        if (card.type) {
            div.dataset.type = ''+card.type;
        }
    }
}