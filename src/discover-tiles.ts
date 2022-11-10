class DiscoverTilesManager extends CardManager<DiscoverTile> {

    constructor(public game: LumenGame) {
        super(game, {
            getId: card => `discover-tile-${card.id}`,
            setupDiv: (card, div) => div.classList.add('discover-tile'),
            setupFrontDiv: (card, div) => {
                if (card.type) {
                    div.dataset.type = ''+card.type;
                    div.dataset.subType = ''+card.subType;
                }
            }
        })
    }  
}