
//const curvePoints = [[0, 0], [10, 10]];//[[0, 2], [2, 3], [3, 4], [4, 2], [5, 6], [10, 5]];
const cardWidth = 100;
const cardHeight = 100;

function getYFromX(curvePoints: number[][], x: number) {
    for (let i=0; i<curvePoints.length - 1; i++) {
        if (x >= curvePoints[i][0] && x <= curvePoints[i+1][0]) {
            const relativeDistance = (x - curvePoints[i][0]) / (curvePoints[i+1][0] - curvePoints[i][0]);
            return curvePoints[i][1] + (curvePoints[i+1][1] - curvePoints[i][1]) * relativeDistance;
        }
    }

    throw new Error(`invalid x (${x}), curve : ${curvePoints.toString()}`);
}

function getXFromY(curvePoints: number[][], y: number) {
    for (let i=0; i<curvePoints.length - 1; i++) {
        if (y >= curvePoints[i][1] && y <= curvePoints[i+1][1]) {
            const relativeDistance = (y - curvePoints[i][1]) / (curvePoints[i+1][1] - curvePoints[i][1]);
            return curvePoints[i][0] + (curvePoints[i+1][0] - curvePoints[i][0]) * relativeDistance;
        }
    }

    throw new Error(`invalid y (${y}), curve : ${curvePoints.toString()}`);
}

class TerritoryStock extends ManualPositionStock<Card> {
    private curveXScale: number;
    private curveYScale: number;
    private canvasWidth: number;
    private canvasHeight: number;

    constructor(protected manager: CardManager<Card>, protected element: HTMLElement, protected direction: 'horizontal' | 'vertical', protected curve: number[][], flipCoordinates: boolean) {
        super(manager, element, direction === 'horizontal' ? (_, cards) => this.manualPositionHorizontal(cards) : (_, cards) => this.manualPositionVertical(cards));
        element.classList.add('territory-stock');

        if (flipCoordinates) {
            this.flipCoordinates();
        }

        //const points = this.curve;
        this.canvasWidth = element.clientWidth;
        this.canvasHeight = element.clientHeight;
        this.curveXScale = this.canvasWidth / 12;
        this.curveYScale = this.canvasHeight / 12;
        /*//var cv = document.getElementById("curveCanvas") as HTMLCanvasElement;
        const cv = document.createElement('canvas');
        element.prepend(cv);
        cv.style.width = `${element.clientWidth}px`;
        cv.style.height = `${element.clientHeight}px`;
        //setTimeout(() => {
            var ctx = cv.getContext("2d");
            ctx.moveTo(points[0][0] * this.curveXScale, points[0][1] * this.curveYScale);
            
            for (var i = 1; i < points.length; i ++) {
                /_*var x_mid = (points[i][0] + points[i+1][0]) / 2 * this.curveXScale;
                var y_mid = (points[i][1] + points[i+1][1]) / 2 * this.curveYScale;
                var cp_x1 = (x_mid + points[i][0] * this.curveXScale) / 2;
                var cp_x2 = (x_mid + points[i+1][0] * this.curveXScale) / 2;
                ctx.quadraticCurveTo(cp_x1,points[i][1] * this.curveYScale ,x_mid, y_mid);
                ctx.quadraticCurveTo(cp_x2,points[i+1][1] * this.curveYScale,points[i+1][0] * this.curveXScale, points[i+1][1] * this.curveYScale);*_/
                ctx.lineTo(points[i][0] * this.curveXScale, points[i][1] * this.curveYScale);
            }
            ctx.stroke();
        //}, 200);*/
    }

    private flipCoordinates() {
        this.curve = this.curve.slice().reverse();
        for (let i = 0; i < this.curve.length; i ++) {
            this.curve[i] = [12 - this.curve[i][0], 12 - this.curve[i][1]];
        }
    }

    private manualPositionHorizontal(cards: Card[]) {
        this.getCards().forEach((card, index) => {
            const cardDiv = this.getCardElement(card);
            const left = this.canvasWidth / 2 + ((cardWidth + 10) * (index - (cards.length) / 2));
            const x = (left + cardWidth / 2) / this.curveXScale;
    
            const y = getYFromX(this.curve, x);
    
            cardDiv.style.left = `${left}px`;
            cardDiv.style.top = `${y * this.curveYScale - cardHeight / 2}px`;
        });
    }

    private manualPositionVertical(cards: Card[]) {
        this.getCards().forEach((card, index) => {
            const cardDiv = this.getCardElement(card);
            const top = this.canvasHeight / 2 + ((cardHeight + 10) * (index - (cards.length) / 2));
            const y = (top + cardHeight / 2) / this.curveYScale;
    
            const x = getXFromY(this.curve, y);
    
            cardDiv.style.top = `${top}px`;
            cardDiv.style.left = `${x * this.curveXScale - cardWidth / 2}px`;
        });
    }
}