// js/systems/bases.js - Base management system
export class BaseSystem {
    constructor(gameState, eventLogger, gameData) {
        this.state = gameState;
        this.events = eventLogger;
        this.data = gameData;
    }
    
    // Calculate base cost for a city
    calculateBaseCost(city) {
        const baseCost = this.data.baseTypes[1].cost;
        const cityModifier = this.data.cities[city].heatModifier;
        return Math.floor(baseCost * cityModifier);
    }
    
    // Purchase a base
    purchaseBase(city) {
        const cost = this.calculateBaseCost(city);
        
        // Validation
        if (this.state.hasBase(city)) {
            this.events.add(`You already own a base in ${city}`, 'neutral');
            return false;
        }
        
        if (this.state.get('gangSize') < 4) {
            this.events.add('Need at least 4 gang members to purchase a base', 'bad');
            return false;
        }
        
        if (!this.state.canAfford(cost)) {
            this.events.add(`Can't afford base in ${city}. Need ${cost.toLocaleString()}`, 'bad');
            return false;
        }
        
        // Create base
        this.state.updateCash(-cost);
        this.state.addBase(city, {
            city: city,
            level: 1,
            assignedGang: 0,
            drugStorage: 0,
            operational: false,
            cashStored: 0,
            lastCollection: this.state.get('day'),
            guns: 0,
            inventory: this.createEmptyInventory()
        });
        
        this.events.add(`🏠 Purchased Trap House in ${city} for ${cost.toLocaleString()}`, 'good');
        return true;
    }
    
    // Create empty inventory for base
    createEmptyInventory() {
        const inventory = {};
        Object.keys(this.data.drugs).forEach(drug => {
            inventory[drug] = 0;
        });
        return inventory;
    }
    
    // Assign gang members to base
    assignGangToBase(city, amount) {
        const base = this.state.getBase(city);
        if (!base) return false;
        
        const available = this.state.getAvailableGangMembers();
        const actualAmount = Math.min(amount, available);
        
        if (actualAmount > 0) {
            base.assignedGang += actualAmount;
            this.updateBaseOperationalStatus(city);
            this.events.add(`Assigned ${actualAmount} gang members to ${city} base`, 'good');
            return true;
        }
        
        return false;
    }
    
    // Remove gang members from base
    removeGangFromBase(city, amount) {
        const base = this.state.getBase(city);
        if (!base) return false;
        
        const actualAmount = Math.min(amount, base.assignedGang);
        
        if (actualAmount > 0) {
            base.assignedGang -= actualAmount;
            this.updateBaseOperationalStatus(city);
            this.events.add(`Removed ${actualAmount} gang members from ${city} base`, 'neutral');
            return true;
        }
        
        return false;
    }
    
    // Update base operational status
    updateBaseOperationalStatus(city) {
        const base = this.state.getBase(city);
        if (!base) return;
        
        const baseType = this.data.baseTypes[base.level];
        const hasEnoughGang = base.assignedGang >= baseType.gangRequired;
        const hasDrugs = this.getBaseDrugCount(base) > 0;
        
        base.operational = hasEnoughGang && hasDrugs;
    }
    
    // Get total drugs in base
    getBaseDrugCount(base) {
        if (!base.inventory) return 0;
        return Object.values(base.inventory).reduce((sum, qty) => sum + qty, 0);
    }
    
    // Calculate base income
    calculateBaseIncome(base) {
        const baseType = this.data.baseTypes[base.level];
        const efficiency = Math.min(1, base.assignedGang / baseType.gangRequired);
        const drugBonus = this.getBaseDrugCount(base) > 0 ? this.data.config.baseIncomeBonus : 1;
        return Math.floor(baseType.income * efficiency * drugBonus);
    }
    
    // Generate daily income for all bases
    generateDailyIncome() {
        let totalIncome = 0;
        
        Object.values(this.state.data.bases).forEach(base => {
            if (base.operational) {
                const income = this.calculateBaseIncome(base);
                base.cashStored = Math.min(base.cashStored + income, this.data.baseTypes[base.level].maxSafe);
                totalIncome += income;
                
                // Consume drugs
                if (this.getBaseDrugCount(base) > 0) {
                    // Consume one random drug
                    const availableDrugs = Object.keys(base.inventory).filter(drug => base.inventory[drug] > 0);
                    if (availableDrugs.length > 0) {
                        const drugToConsume = availableDrugs[Math.floor(Math.random() * availableDrugs.length)];
                        base.inventory[drugToConsume]--;
                        this.updateBaseOperationalStatus(base.city);
                    }
                }
            }
        });
        
        if (totalIncome > 0) {
            this.events.add(`🏢 Bases generated ${totalIncome.toLocaleString()} income`, 'good');
        }
    }
    
    // Collect income from base
    collectBaseIncome(city) {
        const base = this.state.getBase(city);
        if (!base || base.cashStored === 0) return false;
        
        const collected = base.cashStored;
        this.state.updateCash(collected);
        base.cashStored = 0;
        
        this.events.add(`💰 Collected ${collected.toLocaleString()} from ${city} base`, 'good');
        return true;
    }
    
    // Collect from all bases
    collectAllBaseCash() {
        let totalCollected = 0;
        
        Object.values(this.state.data.bases).forEach(base => {
            if (base.cashStored > 0) {
                totalCollected += base.cashStored;
                base.cashStored = 0;
            }
        });
        
        if (totalCollected > 0) {
            this.state.updateCash(totalCollected);
            this.events.add(`💰 Collected ${totalCollected.toLocaleString()} from all bases`, 'good');
            return true;
        }
        
        return false;
    }
    
    // Upgrade base
    upgradeBase(city) {
        const base = this.state.getBase(city);
        if (!base) return false;
        
        const currentType = this.data.baseTypes[base.level];
        if (!currentType.upgradeCost) {
            this.events.add(`${city} base is already at maximum level`, 'neutral');
            return false;
        }
        
        if (!this.state.canAfford(currentType.upgradeCost)) {
            this.events.add(`Need ${currentType.upgradeCost.toLocaleString()} to upgrade ${city} base`, 'bad');
            return false;
        }
        
        const newLevel = base.level + 1;
        const newType = this.data.baseTypes[newLevel];
        
        this.state.updateCash(-currentType.upgradeCost);
        base.level = newLevel;
        this.updateBaseOperationalStatus(city);
        
        this.events.add(`🔧 Upgraded ${city} base to ${newType.name} for ${currentType.upgradeCost.toLocaleString()}`, 'good');
        return true;
    }
    
    // Store drugs in base
    storeDrugsInBase(city, drug, amount) {
        const base = this.state.getBase(city);
        if (!base) return false;
        const baseType = this.data.baseTypes[base.level];
        const currentStorage = this.getBaseDrugCount(base);
        const spaceAvailable = baseType.maxInventory - currentStorage;
        // Per-drug cap
        const drugsCount = Object.keys(this.data.drugs).length;
        const perDrugCap = Math.floor(baseType.maxInventory / drugsCount);
        const currentDrugAmount = base.inventory[drug] || 0;
        const perDrugSpace = perDrugCap - currentDrugAmount;
        if (spaceAvailable <= 0 || perDrugSpace <= 0) {
            this.events.add('Base storage is full for this drug', 'bad');
            return false;
        }
        const playerHas = this.state.getInventory(drug);
        const actualAmount = Math.min(amount, playerHas, spaceAvailable, perDrugSpace);
        if (actualAmount > 0) {
            this.state.updateInventory(drug, -actualAmount);
            base.inventory[drug] = (base.inventory[drug] || 0) + actualAmount;
            this.updateBaseOperationalStatus(city);
            this.events.add(`Stored ${actualAmount} ${drug} in ${city} base`, 'good');
            return true;
        }
        return false;
    }
    
    // Take drugs from base
    takeDrugsFromBase(city, drug, amount) {
        const base = this.state.getBase(city);
        if (!base || !base.inventory[drug]) return false;
        
        const actualAmount = Math.min(amount, base.inventory[drug]);
        
        if (actualAmount > 0) {
            base.inventory[drug] -= actualAmount;
            this.state.updateInventory(drug, actualAmount);
            this.updateBaseOperationalStatus(city);
            this.events.add(`Took ${actualAmount} ${drug} from ${city} base`, 'good');
            return true;
        }
        
        return false;
    }
    
    // Buy guns for base
    buyGunsForBase(city, amount = 1) {
        const base = this.state.getBase(city);
        if (!base) return false;
        
        const costPerGun = this.data.config.gunCost;
        const totalCost = costPerGun * amount;
        
        if (!this.state.canAfford(totalCost)) {
            this.events.add(`Need ${totalCost.toLocaleString()} to buy ${amount} guns`, 'bad');
            return false;
        }
        
        this.state.updateCash(-totalCost);
        base.guns = (base.guns || 0) + amount;
        this.events.add(`Bought ${amount} guns for ${city} base defense`, 'good');
        return true;
    }
    
    // Calculate daily income for all bases
    calculateTotalDailyIncome() {
        let total = 0;
        Object.values(this.state.data.bases).forEach(base => {
            if (base.operational) {
                total += this.calculateBaseIncome(base);
            }
        });
        return total;
    }
    
    // Get base summary
    getBaseSummary() {
        const bases = this.state.data.bases;
        const basesOwned = Object.keys(bases).length;
        let assignedGang = 0;
        let totalCashStored = 0;
        let operationalBases = 0;
        
        Object.values(bases).forEach(base => {
            assignedGang += base.assignedGang;
            totalCashStored += base.cashStored;
            if (base.operational) operationalBases++;
        });
        
        return {
            basesOwned,
            operationalBases,
            assignedGang,
            totalCashStored,
            dailyIncome: this.calculateTotalDailyIncome()
        };
    }

    // Process real-time sales for all bases (called every minute)
    processRealTimeSales() {
        const UNITS_PER_MIN = 1 / 60; // 0.01667 units per minute
        Object.values(this.state.data.bases).forEach(base => {
            if (!base.operational) return;
            const city = base.city;
            const cityPrices = this.state.cityPrices[city] || {};
            let soldAny = false;
            Object.keys(base.inventory).forEach(drug => {
                let available = base.inventory[drug];
                if (available >= 0.01) {
                    const toSell = Math.min(UNITS_PER_MIN, available);
                    const price = cityPrices[drug] || 0;
                    const profit = toSell * price * 3;
                    base.inventory[drug] -= toSell;
                    base.cashStored = (base.cashStored || 0) + profit;
                    soldAny = true;
                }
            });
            if (soldAny) {
                this.updateBaseOperationalStatus(city);
            }
        });
    }
}