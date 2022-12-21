class ObjectiveTokensManager extends CardManager<ObjectiveToken> {

    constructor(public game: LumenGame) {
        super(game, {
            getId: card => `objective-token-${card.id}`,
            setupDiv: (card, div) => div.classList.add('objective-token'),
            setupFrontDiv: (card, div) => this.setupFrontDiv(card, div)
        })
    }  

    public setupFrontDiv(card: ObjectiveToken, div: HTMLDivElement) {
        if (card.lumens) {
            div.dataset.lumens = ''+card.lumens;
        }
    }
}