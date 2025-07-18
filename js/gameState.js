// js/gameState.js - Centralized game state management
export class GameState {
    constructor() {
        this.data = {
            // Player stats
            playerName: 'Player',
            cash: 5000,
            gangSize: 0,
            warrant: 0,
            day: 1,
            guns: 0,
            
            // Location
            currentCity: 'New York',
            daysInCurrentCity: 1,
            daysSinceTravel: 0,
            lastTravelDay: 0,
            
            // Game state
            currentScreen: 'home',
            heatLevel: 0,
            
            // Inventory
            inventory: {
                'Fentanyl': 0,
                'Oxycontin': 0,
                'Heroin': 0,
                'Cocaine': 0,
                'Weed': 0,
                'Meth': 0
            },
            
            // Bases
            bases: {},
            
            // Market data
            citySupply: {},
            lastPurchase: {},
            
            // Meta
            saveVersion: '1.0',
            lastSaved: Date.now()
        };
        
        // Runtime data (not saved)
        this.cityPrices = {};
        this.gameInitialized = false;
        this.gameTimer = null;
        this.countdownTimer = null;
        this.dayDuration = 60000; // 60 seconds per day
        this.timeRemaining = this.dayDuration;

        // Police raid loss tracking (not saved)
        this.raidLossHistory = [];
        // Event listeners
        this.listeners = {};
    }
    
    // Basic getters/setters
    get(key) {
        return this.data[key];
    }
    
    set(key, value) {
        this.data[key] = value;
        this.emit('stateChange', { key, value });
        this.emit(`${key}Changed`, value);
    }
    
    // Inventory management
    getInventory(drug) {
        return this.data.inventory[drug] || 0;
    }
    
    updateInventory(drug, amount) {
        this.data.inventory[drug] = Math.max(0, (this.data.inventory[drug] || 0) + amount);
        this.emit('inventoryChanged', { drug, amount: this.data.inventory[drug] });
    }
    
    // Cash management
    updateCash(amount) {
        this.data.cash = Math.max(0, this.data.cash + amount);
        this.emit('cashChanged', this.data.cash);
    }
    
    canAfford(amount) {
        return this.data.cash >= amount;
    }
    
    // Gang management
    updateGangSize(amount) {
        this.data.gangSize = Math.max(0, this.data.gangSize + amount);
        this.emit('gangChanged', this.data.gangSize);
    }
    
    getAvailableGangMembers() {
        let assignedGang = 0;
        Object.values(this.data.bases).forEach(base => {
            assignedGang += base.assignedGang || 0;
        });
        return Math.max(0, this.data.gangSize - assignedGang);
    }
    
    // Heat/Warrant management
    updateWarrant(amount) {
        this.data.warrant = Math.max(0, this.data.warrant + amount);
        this.calculateHeatLevel();
        this.emit('warrantChanged', this.data.warrant);
    }
    
    calculateHeatLevel() {
        const warrantHeat = Math.min(this.data.warrant / 10000, 50);
        const timeHeat = Math.max(0, this.data.daysInCurrentCity - 3) * 5;
        this.data.heatLevel = Math.min(100, warrantHeat + timeHeat);
        return this.data.heatLevel;
    }
    
    getHeatLevelText() {
        const heat = this.data.heatLevel;
        if (heat < 20) return 'Low';
        if (heat < 40) return 'Medium';
        if (heat < 70) return 'High';
        return 'Critical';
    }
    
    // Base management
    hasBase(city) {
        return !!this.data.bases[city];
    }
    
    getBase(city) {
        return this.data.bases[city];
    }
    
    addBase(city, baseData) {
        this.data.bases[city] = baseData;
        this.emit('baseAdded', { city, base: baseData });
    }
    
    // City/Travel management
    travelToCity(city) {
        this.data.currentCity = city;
        this.data.daysInCurrentCity = 1;
        this.data.daysSinceTravel = 0;
        this.data.lastTravelDay = this.data.day;
        this.emit('cityChanged', city);
    }
    
    // Save/Load functionality
    save() {
        const saveData = {
            gameState: this.data,
            cityPrices: this.cityPrices,
            timeRemaining: this.timeRemaining,
            saveTime: Date.now()
        };
        
        // Save to localStorage
        localStorage.setItem('slangBangSave', JSON.stringify(saveData));
        
        // In Claude environment, save to memory
        window.gameSaveData = saveData;
        
        console.log('Game saved');
        this.emit('gameSaved');
    }
    
    load() {
        try {
            let saveData = null;
            
            // Try memory first (Claude environment)
            if (window.gameSaveData) {
                saveData = window.gameSaveData;
            }
            
            // Load from localStorage
            const saved = localStorage.getItem('slangBangSave');
            if (saved) saveData = JSON.parse(saved);
            
            if (saveData) {
                this.data = { ...this.data, ...saveData.gameState };
                this.cityPrices = saveData.cityPrices || {};
                this.timeRemaining = saveData.timeRemaining || this.dayDuration;
                console.log('Game loaded');
                this.emit('gameLoaded');
                return true;
            }
        } catch (error) {
            console.error('Failed to load game:', error);
        }
        return false;
    }
    
    // Event system
    on(event, callback) {
        if (!this.listeners[event]) {
            this.listeners[event] = [];
        }
        this.listeners[event].push(callback);
    }
    
    off(event, callback) {
        if (this.listeners[event]) {
            this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
        }
    }
    
    emit(event, data) {
        if (this.listeners[event]) {
            this.listeners[event].forEach(callback => {
                try {
                    callback(data);
                } catch (error) {
                    console.error(`Error in event listener for ${event}:`, error);
                }
            });
        }
    }
    
    // Utility methods
    getTotalInventory() {
        return Object.values(this.data.inventory).reduce((sum, qty) => sum + qty, 0);
    }
    
    calculateNetWorth() {
        let netWorth = this.data.cash;
        
        // Add inventory value
        Object.keys(this.data.inventory).forEach(drug => {
            const qty = this.data.inventory[drug];
            const price = this.cityPrices[this.data.currentCity]?.[drug] || 0;
            netWorth += qty * price;
        });
        
        // Add base values
        Object.values(this.data.bases).forEach(base => {
            netWorth += base.cashStored || 0;
            // Add estimated base value
            netWorth += 35000; // Simplified for now
        });
        
        // Add gang value
        netWorth += this.data.gangSize * 1250; // Half of avg recruitment cost

        // Add asset value
        if (window.game?.systems?.assets) {
            netWorth += window.game.systems.assets.getTotalAssetValue();
        }
        
        return Math.floor(netWorth);
    }

    // Police raid loss tracking
    addRaidLoss(amount) {
        const now = Date.now();
        this.raidLossHistory.push({ amount, time: now });
        // Remove entries older than 24 hours
        const cutoff = now - 24 * 60 * 60 * 1000;
        this.raidLossHistory = this.raidLossHistory.filter(entry => entry.time >= cutoff);
    }

    getRaidLossLast24h() {
        const now = Date.now();
        const cutoff = now - 24 * 60 * 60 * 1000;
        return this.raidLossHistory
            .filter(entry => entry.time >= cutoff)
            .reduce((sum, entry) => sum + entry.amount, 0);
    }
}

// Export singleton instance
export const gameState = new GameState();