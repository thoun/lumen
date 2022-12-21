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

    public getName(type: number, subType: number) { // TODO
        switch (type) {
            case 1: return _("Butin");
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
            case 1: return _("Lorsque vous révélez un jeton Butin, laissez-le sur le Territoire jusqu’à ce qu’une faction soit en mesure de s’en emparer. Chaque jeton contient de 3 à 5 Lumens. Pour s’en emparer définitivement, il faut que la Force cumulée des Combattants d’une faction présents sur ce Territoire soit supérieure à celle des Combattants adverses présents sur ce même Territoire, avec un écart au moins égal au nombre de Lumens de ce jeton. Si aucun adversaire n’est présent sur le Territoire, sa force est égale à 0. Aussitôt qu’une faction remplie cette condition, elle s’empare du jeton Butin et marquera en fin de partie le nombre de PV indiqué au dos de ce jeton.");
            case 2:
                switch (subType) {
                    case 1: return _("Lorsque vous révélez ce jeton, défaussez-le. Eliminez immédiatement une cellule de votre choix sur la Fiche de Commandement adverse en la rayant.");
                    case 2: return _("Lorsque vous révélez ce jeton, conservez-le devant vous, face visible, près de votre Fiche de Commandement. Lors d’un prochain tour, si vous êtes premier joueur uniquement, vous pouvez décider de défausser ce jeton. Dans ce cas, ne lancez pas le dés, mais placez-les sur les faces de votre choix !");
                    case 3: return _("Lorsque vous révélez ce jeton, défaussez-le. Piochez un Combattant au hasard dans votre sac et placez-le immédiatement en Renfort sur ce Territoire.");
                    case 4: return _("Lorsque vous révélez ce jeton, défaussez-le. Cochez immédiatement la case disponible la plus à gauche de la zone de Haut Commandement de votre Fiche de Commandement. Appliquez les conséquences de cette case, tout juste cochée, le cas échéant.");
                    case 5: return _("Lorsque vous révélez ce jeton, conservez-le devant vous, face visible, près de votre Fiche de Commandement.Lors de la phase 3 Transmission des Ordres de n’importe lequel de vos tours, vous pouvez défausser ce jeton pour obtenir une action gratuite supplémentaire (Déplacement, Activation d’un effet spécial de Combattant, ou déclenchement d’une Action d’Éclat). Si vous possédez les deux jetons Coup Fourré, vous pouvez les utiliser tous les deux dans le même tour pour obtenir deux fois une action gratuite supplémentaire.");
                }
        }
    }

    public getTooltip(type: number, subType: number) {
        return `<h3>${this.getName(type, subType)}</h3>
        <p>${this.getDescription(type, subType)}</p>
        `;
    }
}