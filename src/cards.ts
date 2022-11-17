class CardsManager extends CardManager<Card> {

    constructor(public game: LumenGame) {
        super(game, {
            getId: card => `card-${card.id}`,
            setupDiv: (card, div) => {
                div.classList.add('fighter');
                game.setTooltip(div.id, this.getTooltip(card.subType));

                if (card.type == 10) {
                    const playerToken = document.createElement('div');
                    playerToken.classList.add('player-token');
                    playerToken.dataset.color = game.getPlayerColor(card.playerId);
                    div.appendChild(playerToken);
                }
            },
            setupFrontDiv: (card, div) => {
                div.innerHTML = `${this.getName(card.subType)}`;
                if (card.type == 1) { div.style.background = `#${game.getPlayerColor(card.playerId)}`; }
            },
            setupBackDiv: (card, div) => {
                div.innerHTML = `${this.getName(card.subType)}`;
                if (card.type == 1) { div.style.background = `#${game.getPlayerColor(card.playerId)}99`; }
            },
        });
    }  

    public getName(subType: number) { // TODO
        switch (subType) {
            case 1: return _("Freluquet");
            case 2: return _("Baveux");
            case 3: return _("Réanimatrice");
            case 4: return _("Pusher");
            case 5: return _("Assassin");
            case 6: return _("Emplumé");

            case 11: return _("Super Pusher");
            case 12: return _("Super Assassin");
            case 13: return _("Impatient");
            case 14: return _("Bombarde");
            case 15: return _("Tisseuse");
            case 16: return _("Rooted");
            case 17: return _("Pacificateur");
            case 18: return _("Metamorph");

            case 21: return _("Fury");
            case 22: return _("Reset");
            case 23: return _("Teleport");

            case 31: return _("Coffre");
            case 32: return _("Winter");
            case 33: return _("Freluquets");
        }
    }

    public getStrength(subType: number) {
        switch (subType) {
            case 1: return 2;
            case 2: return 3;
            case 3: return 1;
            case 4: return 1;
            case 5: return 1;
            case 6: return 2;

            case 11: return 1;
            case 12: return 1;
            case 13: return 2;
            case 14: return 2;
            case 15: return 2;
            case 16: return 2;
            case 17: return 2;
            case 18: return '1 / 3';
        }
    }

    public getDescription(subType: number) { // TODO
        switch (subType) {
            case 1: return _("Freluquet");
            case 2: return _("Baveux");
            case 3: return _("Réanimatrice");
            case 4: return _("Pusher");
            case 5: return _("Assassin");
            case 6: return _("Emplumé");

            case 11: return _("Super Pusher");
            case 12: return _("Super Assassin");
            case 13: return _("Impatient");
            case 14: return _("Bombarde");
            case 15: return _("Tisseuse");
            case 16: return _("Rooted");
            case 17: return _("Pacificateur");
            case 18: return _("Metamorph");

            case 21: return _("Fury");
            case 22: return _("Reset");
            case 23: return _("Teleport");

            case 31: return _("Coffre");
            case 32: return _("Winter");
            case 33: return _("Freluquets");
        }
    }

    public getTooltip(subType: number) {
        return `<h3>${this.getName(subType)}</h3>
        ${subType < 20 ? `${_("Strength:")} <strong>${this.getStrength(subType)}</strong>` : ''}
        <p>${this.getDescription(subType)}</p>
        `;
    }
}