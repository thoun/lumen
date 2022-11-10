class CardsManager extends CardManager<Card> {

    constructor(public game: LumenGame) {
        super(game, {
            getId: card => `card-${card.id}`,
            setupDiv: (card, div) => div.classList.add('fighter'),
            setupFrontDiv: (card, div) => {
                div.innerHTML = `${card.type} ${card.subType}
            <button id="card-${card.id}-play">play ${card.id}</button>
            <button id="card-${card.id}-move">move ${card.id}</button>
            <button id="card-${card.id}-activate">activate ${card.id}</button>
            `;
            document.getElementById(`card-${card.id}-play`).addEventListener('click', () => this.game.playFighter(card.id));
            document.getElementById(`card-${card.id}-move`).addEventListener('click', () => this.game.moveFighter(card.id));
            document.getElementById(`card-${card.id}-activate`).addEventListener('click', () => this.game.activateFighter(card.id));
            }
        })
    }  
}