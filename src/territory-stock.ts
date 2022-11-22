
//const curvePoints = [[0, 0], [10, 10]];//[[0, 2], [2, 3], [3, 4], [4, 2], [5, 6], [10, 5]];
const cardWidth = 100;
const cardHeight = 100;

class TerritoryStock extends ManualPositionStock<Card> {
    tempOriginalCurve: number[][];

    private curveXScale: number;
    private curveYScale: number;
    private canvasWidth: number;
    private canvasHeight: number;

    constructor(protected manager: CardManager<Card>, protected element: HTMLElement, protected direction: 'horizontal' | 'vertical', protected curve: number[][], protected rotation: 0 | 90 | 180 | 270) {
        super(manager, element, (_, cards) => this.manualPosition(cards));
        element.classList.add('territory-stock');

        this.tempOriginalCurve = curve.slice();

        
        if ([90, 270].includes(rotation)) {
            this.rotateCoordinates();
        }
        if (rotation >= 180) {
            this.flipCoordinates();
        }

        //const points = this.curve;
        this.canvasWidth = element.clientWidth;
        this.canvasHeight = element.clientHeight;
        this.curveXScale = this.canvasWidth / 12;
        this.curveYScale = this.canvasHeight / 12;
        /*if (this.canvasWidth == 708) {
            //var cv = document.getElementById("curveCanvas") as HTMLCanvasElement;
            const cv = document.createElement('canvas');
            element.prepend(cv);
            cv.style.width = `${element.clientWidth}px`;
            cv.style.height = `${element.clientHeight}px`;
            const points = this.curve;
            var ctx = cv.getContext("2d");
            ctx.moveTo(points[0][0] / 300 * 12 , points[0][1] / 150 * 12);
            
            for (var i = 1; i < points.length; i ++) {
                //var x_mid = (points[i][0] + points[i+1][0]) / 2 * this.curveXScale;
                //var y_mid = (points[i][1] + points[i+1][1]) / 2 * this.curveYScale;
                //var cp_x1 = (x_mid + points[i][0] * this.curveXScale) / 2;
                //var cp_x2 = (x_mid + points[i+1][0] * this.curveXScale) / 2;
                //ctx.quadraticCurveTo(cp_x1,points[i][1] * this.curveYScale ,x_mid, y_mid);
                //ctx.quadraticCurveTo(cp_x2,points[i+1][1] * this.curveYScale,points[i+1][0] * this.curveXScale, points[i+1][1] * this.curveYScale);
                ctx.lineTo(points[i][0] * 300 / 12, points[i][1] * 150 / 12);
            }
            ctx.stroke();
        }*/
    }

    private rotateCoordinates() {
        this.curve = this.curve.slice();
        for (let i = 0; i < this.curve.length; i ++) {
            this.curve[i] = [12 - this.curve[i][1], this.curve[i][0]];
        }
    }

    private flipCoordinates() {
        this.curve = this.curve.slice();
        for (let i = 0; i < this.curve.length; i ++) {
            this.curve[i] = [12 - this.curve[i][0], 12 - this.curve[i][1]];
        }
    }

    private manualPosition(cards: Card[]) {
        let vertical = this.direction !== 'horizontal';
        if ([90, 270].includes(this.rotation)) {
            vertical = !vertical;
        }
        return vertical ? this.manualPositionVertical(cards) : this.manualPositionHorizontal(cards);
    }

    private manualPositionHorizontal(cards: Card[]) {
        this.getCards().forEach((card, index) => {
            const cardDiv = this.getCardElement(card);
            let left = this.canvasWidth / 2 + ((cardWidth + 10) * (index - (cards.length) / 2));
            if (left < 0) {
                left = 0;
            }
            if (left > this.canvasWidth) {
                left = this.canvasWidth;
            }
            const x = (left + cardWidth / 2) / this.curveXScale;
    
            const y = this.getYFromX(x);
    
            cardDiv.style.left = `${left}px`;
            cardDiv.style.top = `${y * this.curveYScale - cardHeight / 2}px`;
        });
    }

    private manualPositionVertical(cards: Card[]) {
        this.getCards().forEach((card, index) => {
            const cardDiv = this.getCardElement(card);
            let top = this.canvasHeight / 2 + ((cardHeight + 10) * (index - (cards.length) / 2));
            if (top < 0) {
                top = 0;
            }
            if (top > this.canvasHeight) {
                top = this.canvasHeight;
            }

            const y = (top + cardHeight / 2) / this.curveYScale;
    
            const x = this.getXFromY(y);
    
            cardDiv.style.top = `${top}px`;
            cardDiv.style.left = `${x * this.curveXScale - cardWidth / 2}px`;
        });
    }

    private getYFromX(x: number) {
        if (this.curve[0][0] > this.curve[1][0]) {
            this.curve = this.curve.slice().reverse();
        }
        const curvePoints = this.curve;

        for (let i=0; i<curvePoints.length - 1; i++) {
            if (x >= curvePoints[i][0] && x <= curvePoints[i+1][0]) {
                const relativeDistance = (x - curvePoints[i][0]) / (curvePoints[i+1][0] - curvePoints[i][0]);
                return curvePoints[i][1] + (curvePoints[i+1][1] - curvePoints[i][1]) * relativeDistance;
            }
        }
    
        throw new Error(`invalid x (${x}), curve : ${JSON.stringify(curvePoints)}, originalCurve : ${JSON.stringify(this.tempOriginalCurve)}, rotation : ${this.rotation}`);
    }
    
    private getXFromY(y: number) {
        if (this.curve[0][1] > this.curve[1][1]) {
            this.curve = this.curve.slice().reverse();
        }
        const curvePoints = this.curve;

        for (let i=0; i<curvePoints.length - 1; i++) {
            if (y >= curvePoints[i][1] && y <= curvePoints[i+1][1]) {
                const relativeDistance = (y - curvePoints[i][1]) / (curvePoints[i+1][1] - curvePoints[i][1]);
                return curvePoints[i][0] + (curvePoints[i+1][0] - curvePoints[i][0]) * relativeDistance;
            }
        }
    
        throw new Error(`invalid y (${y}), curve : ${JSON.stringify(curvePoints)}, originalCurve : ${JSON.stringify(this.tempOriginalCurve)}, rotation : ${this.rotation}`);
    }
}