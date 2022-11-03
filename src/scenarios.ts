
class Territory {
    constructor(public id: number, public lumens: number) {}
}

class Battlefield {
    public constructor(public id: number, public territories: Territory[], public territoriesLinks: number[]) {}
}

class Scenario {
    public constructor(public battlefieldsIds: number[]) {
    }
}