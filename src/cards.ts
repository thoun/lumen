class CardsManager extends CardManager<Card> {

    constructor(public game: LumenGame) {
        super(game, {
            getId: card => `card-${card.id}`,
            setupDiv: (card, div) => {
                div.classList.add('fighter');
                div.dataset.type = ''+card.type;
                div.dataset.subType = ''+card.subType;
                if (card.playerId) {
                    div.dataset.color = game.getPlayerColor(card.playerId);
                }
                game.setTooltip(div.id, this.getTooltip(card.subType));

                if (card.type == 10 && card.playerId) {
                    const playerToken = document.createElement('div');
                    playerToken.classList.add('player-token');
                    playerToken.dataset.color = game.getPlayerColor(card.playerId);
                    div.appendChild(playerToken);
                }
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
            case 14: return 1;
            case 15: return '2 / 1';
            case 16: return '2 / 1';
            case 17: return 2;
            case 18: return '1 / 3';
        }
    }

    public getDescription(subType: number) { // TODO
        switch (subType) {
            case 1: return _("Pas d’effet spécial");
            case 2: return _("La coquille du Baveux le protège contre les agressions des Combattants Tueurs et de la Furie. Le Baveux ne peut pas effectuer de déplacement lors dela phase 3 Transmission des Ordres.");
            case 3: return _("Lorsque vous retournez la Réanimatrice sur sa face INACTIF, replacez sur leur face ACTIF tous vos autres Combattants présents sur son Territoire, ainsi que sur les Territoires voisins");
            case 4: return _("Lorsque vous retournez le Pousseur sur sa face INACTIF, vous pouvez pousser n’importe quel autre Combattant (allié ou adverse) vers un Territoire voisin");
            case 5: return _("Fait partie de la famille des Combattants Tueurs. Lorsque vous retournez l’Assassin sur sa face INACTIF, éliminez un Combattant adverse de Base ou Mercenaire du Territoire sur lequel il est présent. Ce Combattant est remis dans son sac d’origine et pourra éventuellement revenir en jeu plus tard.");
            case 6: return _("Lorsque vous retournez l’Emplumé sur sa face INACTIF, il prend son envol, et se déplace par voie aérienne vers n’importe quel autre Territoire du Champ de Bataille");

            case 11: return _("Lorsque vous le retournez sur sa face INACTIF, le Super Pousseur : d DOIT d’abord exécuter un déplacement par voie terrestre. d PUIS pousse n’importe quel autre Combattant (allié ou adverse) vers un Territoire voisin.");
            case 12: return _("Fait partie de la famille des Combattants Tueurs. Lorsque vous le retournez sur sa face INACTIF, le Super Assassin : d DOIT d’abord effectuer un déplacement par voie terrestre. d PUIS il élimine de ce Territoire un Combattant adverse de Base ou Mercenaire. Ce Combattant est remis dans son sac d’origine et pourra éventuellement revenir en jeu plus tard");
            case 13: return _("Lorsque vous le retournez sur sa face INACTIF, l’Impatient prend le marqueur Initiative et le replace sur son Territoire ou n’importe quel autre Territoire voisin.");
            case 14: return _("Fait partie de la famille des Combattants Tueurs. Lorsque vous retournez la Bombarde sur sa face INACTIF, éliminez un Combattant adverse de Base ou Mercenaire n’importe où sur le Champ de Bataille. Ce Combattant est remis dans son sac d’origine et pourra éventuellement revenir en jeu plus tard.");
            case 15: return _("Lorsqu’elle est retournée sur sa face INACTIF, la Tisseuse : d ne peut plus se déplacer. d emprisonne tous les Combattants adverses présents sur son Territoire. Il est toujours possible pour les Combattants adverses de rentrer sur ce Territoire, que ce soit par voie terrestre ou aérienne, mais il n’est plus possible d’en sortir tant que la Tisseuse est présente sur sa face INACTIF.La Tisseuse n’a aucun effet sur les Combattants alliés.");
            case 16: return _("Lorsqu’elle est retournée sur sa face INACTIF, l’Enracinée déploie ses racines tout autour du Territoire sur lequel elle est située, empêchant es Combattants adverses d’y pénétrer par voie terrestre");
            case 17: return _("Lorsqu’il est retourné sur sa face INACTIF, retournez sur leur face INACTIF les Combattants adverses de votre choix présents sur son Territoire, ainsi que sur les Territoires voisins.");
            case 18: return _("Lorsqu’il est sur sa face ACTIF, le Métamorphe ne peut pas effectuer de déplacement lors de la phase 3 Transmission des Ordres (il peut bien sûr être la cible d’un Pousseur). Lorsqu’il est retourné sur sa face INACTIF, il se transforme en un Combattant de force 3, se déplaçant par voie terrestre.");

            case 21: return _("Supprimez du Champ de Bataille deux Combattants adverses de Base ou Mercenaires situés dans deux Territoires différents. Ces Combattants sont remis dans leur sac d’origine et pourront éventuellement revenir en jeu plus tard.");
            case 22: return _("Désignez un de vos Combattants de Base ou Mercenaire. Retirez-le du Champ de Bataille ainsi que TOUS les autres Combattants de Base ou Mercenaires adverses et alliés présents, sans exception, dans le même Territoire. Ces Combattants sont remis dans leur sac d’origine et pourront éventuellement revenir en jeu plus tard.");
            case 23: return _("Echangez la position de deux de vos Combattants sur le Champ de Bataille.");

            case 31: return _("Remportez un jeton Objectif si vous possédez deux jetons Découvertes en fin de partie, plus un jeton Objectif par jeton Découverte supplémentaire.");
            case 32: return _("Remportez un jeton Objectif si vous contrôlez deux Territoires de l’Hiver en fin de partie, plus un jeton Objectif par Territoire de l’Hiver contrôlé supplémentaire");
            case 33: return _("Pour chaque Territoire dans lequel vous avez des Freluquets, remportez un jeton Objectif si vous possédez deux Freluquets dans ce Territoire, plus un jeton Objectif par Freluquet supplémentaire.");
        }
    }

    public getTooltip(subType: number) {
        return `<h3>${this.getName(subType)}</h3>
        ${subType < 20 ? `${_("Strength:")} <strong>${this.getStrength(subType)} <div class="strength-icon"></div></strong>` : ''}
        <p>${this.getDescription(subType)}</p>
        `;
    }
}