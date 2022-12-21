const CARD_WIDTH = 100;
const CARD_HEIGHT = 100;
const CARD_DISTANCE = 125;

class DiscoverTileStock extends CardStock<DiscoverTile> {
    constructor(protected manager: CardManager<DiscoverTile>, protected element: HTMLElement, protected updateDisplay: () => void) {
        super(manager, element);
    }

    public addCard(card: DiscoverTile, animation?: CardAnimation<DiscoverTile>, settings?: AddCardSettings): Promise<boolean> {
        const promise = super.addCard(card, animation, settings);
        this.updateDisplay();
        return promise;
    }

    public cardRemoved(card: DiscoverTile): void {
        super.cardRemoved(card);
        this.updateDisplay();
    }
}

class TerritoryStock extends ManualPositionStock<Card> {
    public discoverTileStock: DiscoverTileStock;

    private initiativeMarker: boolean;
    private discoverTileStockDiv: HTMLDivElement;
    private pathLength: number = 0;
    private strengthCounter: HTMLDivElement;

    public onAnyClick?: () => void;

    constructor(
        protected manager: CardsManager, 
        protected element: HTMLElement, 
        protected curve: number[][], 
        protected rotation: 0 | 90 | 180 | 270,
        private territoryId: number) {
        super(manager, element, () => this.manualPosition());
        element.classList.add('territory-stock');

        
        if ([90, 270].includes(rotation)) {
            this.rotateCoordinates();
        }
        if (rotation >= 180) {
            this.flipCoordinates();
        }

        this.curve = this.curve.map(point => [point[0] * element.clientWidth / 12, point[1] * element.clientHeight / 12]);

        this.discoverTileStockDiv = document.createElement('div');
        this.discoverTileStockDiv.id = `territory-${territoryId}-discover-tiles`;
        this.discoverTileStockDiv.classList.add('discover-tile-stock');
        element.appendChild(this.discoverTileStockDiv);
        this.discoverTileStock = new DiscoverTileStock((this.manager.game as LumenGame).discoverTilesManager, this.discoverTileStockDiv, () => this.manualPosition());

        for (var i = 1; i < this.curve.length; i ++) {
            this.pathLength += this.getPathLength(this.curve[i-1], this.curve[i]);
        }

        this.element.addEventListener('click', () => this.onAnyClick?.());

        // this.debugShowCurveCanvas();

        this.strengthCounter = document.createElement('div');
        this.strengthCounter.classList.add('strength-counter');
        this.strengthCounter.dataset.visible = 'false';
        this.strengthCounter.innerHTML = `
            <div><span id="strength-counter-${territoryId}-orange" style="--color: #f28700;"></span> <div class="strength-icon"></div></div>
            <div><span id="strength-counter-${territoryId}-blue" style="--color: #1f3067;"></span> <div class="strength-icon"></div></div>
        `;
        element.appendChild(this.strengthCounter);
    }

    public addInitiativeMarker() {
        this.initiativeMarker = true;
        this.element.appendChild(document.getElementById(`initiative-marker`));
        this.manualPosition();
    }

    public initiativeMarkerRemoved() {
        this.initiativeMarker = false;
        this.manualPosition();
    }

    private rotateCoordinates() {
        this.curve = this.curve.slice();
        for (let i = 0; i < this.curve.length; i ++) {
            this.curve[i] = [12 - this.curve[i][1], this.curve[i][0]];
        }
    }

    private flipCoordinates() {
        this.curve = this.curve.slice().reverse();
        for (let i = 0; i < this.curve.length; i ++) {
            this.curve[i] = [12 - this.curve[i][0], 12 - this.curve[i][1]];
        }
    }

    private manualPosition() {
        const elements = this.getElements();
        elements.forEach((cardDiv, index) => {
            const {x, y, scale} = this.getCoordinates(index, elements.length);
            cardDiv.style.left = `${x - CARD_WIDTH / 2}px`;
            cardDiv.style.top = `${y - CARD_HEIGHT / 2}px`;
            cardDiv.style.transform = scale === 1 ? '' : `scale(${scale})`;
        });
    }

    private getElements(): HTMLElement[] {
        const cards = this.getCards();
        const elements = cards.map(card => this.getCardElement(card));
        const showStrengthCounter = this.showStrengthCounter(cards);
        this.strengthCounter.dataset.visible = showStrengthCounter.toString();
        if (showStrengthCounter) {
            elements.unshift(this.getStrengthCounter(cards));
        }
        if (!this.discoverTileStock.isEmpty()) {
            elements.push(this.discoverTileStockDiv);
        }

        if (this.initiativeMarker) {
            elements.push(document.getElementById(`initiative-marker`));
        }

        return elements;
    }

    private showStrengthCounter(cards: Card[]): boolean {
        return cards.length >= 3 && cards.map(card => card.playerId).filter((value, index, self) => self.indexOf(value) === index).length > 1;
    }
    
    private getStrengthCounter(cards: Card[]): HTMLElement {
        const strengthes = {};
        cards.forEach(card => {
            if (!strengthes[card.playerId]) {
                strengthes[card.playerId] = 0;
            }
            strengthes[card.playerId] += this.manager.getCurrentStrength(card);
        });

        const totalStrength = Object.values(strengthes).reduce((a: number, b: number) => a + b, 0) as number;
        const orangePlayerId = this.manager.game.getPlayerIdByColor('f28700');
        const bluePlayerId = this.manager.game.getPlayerIdByColor('1f3067');
        const orangePlayerStrength = strengthes[orangePlayerId];

        document.getElementById(`strength-counter-${this.territoryId}-orange`).innerHTML = strengthes[orangePlayerId];
        document.getElementById(`strength-counter-${this.territoryId}-blue`).innerHTML = strengthes[bluePlayerId];

        this.strengthCounter.style.setProperty('--percent', `${orangePlayerStrength * 100 / totalStrength}%`);
        return this.strengthCounter;
    }

    private getPathCoordinates(cardPathLength: number) {
        let currentDistance = 0;

        for (let i=1; i<this.curve.length; i++) {
            const segmentLength = this.getPathLength(this.curve[i-1], this.curve[i]);
            const newDistance = currentDistance + segmentLength;
            if (cardPathLength >= currentDistance && cardPathLength <= newDistance || i === this.curve.length-1) {
                const relativeDistance = (cardPathLength - currentDistance) / segmentLength;
                const x = this.curve[i-1][0] + (this.curve[i][0] - this.curve[i-1][0]) * relativeDistance;
                const y = this.curve[i-1][1] + (this.curve[i][1] - this.curve[i-1][1]) * relativeDistance;
                return {x, y};
            } else {
                currentDistance = newDistance;
            }
        }
    }

    private getCoordinates(index: number, elementLength: number) {
        const halfPathLength = this.pathLength / 2;
        let cardDistance = CARD_DISTANCE;
        const maxDistance = this.pathLength - CARD_DISTANCE;
        let scale = 1;
        if ((elementLength - 1) * cardDistance > maxDistance) {
            cardDistance = Math.floor(maxDistance / (elementLength - 1));
            scale = (cardDistance * 2 + CARD_DISTANCE) / (CARD_DISTANCE * 3);
        }
        const cardPathLength = halfPathLength + cardDistance * (index - elementLength / 2) + CARD_DISTANCE / 4;
        return {
            ...this.getPathCoordinates(cardPathLength),
            scale,
        };
    }

    private getPathLength(point1: number[], point2: number[]) {
        const x = point1[0]-point2[0];
        const y = point1[1]-point2[1];
        return Math.hypot(x, y);
    }
    
    private debugShowCurveCanvas() {
        ///*if (this.canvasWidth == 708) {
            //var cv = document.getElementById("curveCanvas") as HTMLCanvasElement;
            const cv = document.createElement('canvas');
            this.element.prepend(cv);
            cv.setAttribute('width', `${this.element.clientWidth}`);
            cv.setAttribute('height', `${this.element.clientHeight}`);
            const points = this.curve;
            var ctx = cv.getContext("2d");  
            ctx.lineWidth = 3;          
            for (var i = 0; i < points.length; i ++) {
                //var x_mid = (points[i][0] + points[i+1][0]) / 2 * this.curveXScale;
                //var y_mid = (points[i][1] + points[i+1][1]) / 2 * this.curveYScale;
                //var cp_x1 = (x_mid + points[i][0] * this.curveXScale) / 2;
                //var cp_x2 = (x_mid + points[i+1][0] * this.curveXScale) / 2;
                //ctx.quadraticCurveTo(cp_x1,points[i][1] * this.curveYScale ,x_mid, y_mid);
                //ctx.quadraticCurveTo(cp_x2,points[i+1][1] * this.curveYScale,points[i+1][0] * this.curveXScale, points[i+1][1] * this.curveYScale);
                ctx[i == 0 ? 'moveTo' :'lineTo'](points[i][0], points[i][1]);
            }
            ctx.stroke();
        //}*/
    }
}