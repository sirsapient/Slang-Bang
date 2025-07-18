// js/gameState.js - Game state management
export class GameState {
    constructor() {
        // ... (initialize all state properties as before) ...
        this.data = {
            cash: 5000,
            day: 1,
            currentCity: 'Chicago',
            inventory: {
                'Fentanyl': 0,
                'Oxycontin': 0,
                'Heroin': 0,
                'Cocaine': 0,
                'Weed': 0,
                'Meth': 0
            },
            bases: {},
            citySupply: {},
            assets: {
                owned: {},
                wearing: { jewelry: [] },
                storage: { jewelry: 2, cars: 0 }
            },
            gangSize: 4,
            warrant: 0,
            heatLevel: 0,
            daysInCurrentCity: 1,
            daysSinceTravel: 0,
            lastTravelDay: 1,
            guns: 0
        };
        this.cityPrices = {};
        this.timeRemaining = 60000;
        this.dayDuration = 60000;
        this.listeners = {};
    }
    // ... (all methods unchanged, including save/load/clearSave/validateSaveData/ensureDataIntegrity) ...
}
export const gameState = new GameState(); 