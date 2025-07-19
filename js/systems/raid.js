// js/systems/raid.js - Raid system for attacking enemy bases
export class RaidSystem {
    constructor(state, events, data) {
        this.state = state;
        this.events = events;
        this.data = data;
        this.enemyBases = this.generateEnemyBases();
    }
    
    generateEnemyBases() {
        const bases = {};
        const cities = Object.keys(this.data.cities);
        
        cities.forEach(city => {
            const cityData = this.data.cities[city];
            const baseCount = Math.floor(Math.random() * 3) + 2; // 2-4 bases per city
            
            bases[city] = [];
            for (let i = 0; i < baseCount; i++) {
                const difficulty = Math.random();
                const baseType = this.getBaseTypeByDifficulty(difficulty);
                
                bases[city].push({
                    id: `${city}_enemy_${i}`,
                    city: city,
                    name: `${baseType.name} Base`,
                    difficulty: difficulty,
                    baseType: baseType,
                    cash: Math.floor(baseType.maxCash * (0.3 + difficulty * 0.7)),
                    drugs: this.generateDrugInventory(baseType.maxInventory, difficulty),
                    gangSize: Math.floor(baseType.gangRequired * (0.5 + difficulty * 0.5)),
                    lastRaid: 0 // Track when last raided
                });
            }
        });
        
        return bases;
    }
    
    getBaseTypeByDifficulty(difficulty) {
        if (difficulty < 0.3) return this.data.baseTypes[1]; // Small base
        if (difficulty < 0.7) return this.data.baseTypes[2]; // Medium base
        return this.data.baseTypes[3]; // Large base
    }
    
    generateDrugInventory(maxInventory, difficulty) {
        const inventory = {};
        const drugTypes = Object.keys(this.data.drugs);
        const drugCount = Math.floor(maxInventory * (0.2 + difficulty * 0.8));
        
        for (let i = 0; i < drugCount; i++) {
            const drug = drugTypes[Math.floor(Math.random() * drugTypes.length)];
            inventory[drug] = (inventory[drug] || 0) + 1;
        }
        
        return inventory;
    }
    
    getAvailableTargets(city) {
        const targets = this.enemyBases[city] || [];
        const currentTime = Date.now();
        const cooldownPeriod = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
        
        return targets.filter(target => {
            return (currentTime - target.lastRaid) > cooldownPeriod;
        });
    }
    
    calculateRaidSuccess(gangSize, guns, targetDifficulty, targetGangSize) {
        // Base success chance starts at 50%
        let successChance = 0.5;
        
        // Gang size advantage/disadvantage
        const gangRatio = gangSize / Math.max(targetGangSize, 1);
        successChance += (gangRatio - 1) * 0.3;
        
        // Guns provide combat advantage
        const gunBonus = Math.min(guns * 0.1, 0.3); // Max 30% bonus from guns
        successChance += gunBonus;
        
        // Difficulty penalty
        successChance -= targetDifficulty * 0.4;
        
        // Clamp between 5% and 95%
        return Math.max(0.05, Math.min(0.95, successChance));
    }
    
    calculateRaidLoot(target, successChance) {
        const lootMultiplier = 0.3 + (successChance * 0.7); // Better success = more loot
        
        const cash = Math.floor(target.cash * lootMultiplier);
        const drugs = {};
        
        Object.keys(target.drugs).forEach(drug => {
            const amount = Math.floor(target.drugs[drug] * lootMultiplier);
            if (amount > 0) {
                drugs[drug] = amount;
            }
        });
        
        return { cash, drugs };
    }
    
    calculateGangLosses(gangSize, successChance, targetDifficulty) {
        if (successChance > 0.8) return 0; // High success = no losses
        if (successChance > 0.6) return Math.floor(gangSize * 0.1); // Low losses
        if (successChance > 0.4) return Math.floor(gangSize * 0.2); // Medium losses
        return Math.floor(gangSize * 0.4); // High losses
    }
    
    executeRaid(city, targetId, gangSize) {
        const target = this.enemyBases[city].find(b => b.id === targetId);
        if (!target) {
            this.events.add('Target not found!', 'bad');
            return false;
        }
        
        // Check if player has enough gang members in this city
        const availableGangInCity = this.state.getAvailableGangMembersInCity(city);
        if (availableGangInCity < gangSize) {
            this.events.add(`Not enough gang members in ${city} for this raid! Need ${gangSize}, have ${availableGangInCity}`, 'bad');
            return false;
        }
        
        // Check if player has enough guns in this city
        const availableGunsInCity = this.state.getAvailableGunsInCity(city);
        console.log(`Raid validation: gangSize=${gangSize}, availableGuns=${availableGunsInCity}`);
        if (availableGunsInCity < gangSize) {
            this.events.add(`Not enough guns in ${city} for this raid! Need ${gangSize} guns for ${gangSize} gang members, but only have ${availableGunsInCity} guns available.`, 'bad');
            return false;
        }
        
        const successChance = this.calculateRaidSuccess(gangSize, availableGunsInCity, target.difficulty, target.gangSize);
        const success = Math.random() < successChance;
        
        // Calculate results
        const gangLosses = this.calculateGangLosses(gangSize, successChance, target.difficulty);
        const heatIncrease = Math.floor(gangSize * 1000 * (1 + target.difficulty));
        
        if (success) {
            const loot = this.calculateRaidLoot(target, successChance);
            
            // Apply loot
            this.state.updateCash(loot.cash);
            Object.keys(loot.drugs).forEach(drug => {
                this.state.updateInventory(drug, loot.drugs[drug]);
            });
            
            // Apply gang losses from the city
            if (gangLosses > 0) {
                this.state.removeGangMembersFromCity(city, gangLosses);
            }
            
            // Apply heat
            this.state.updateWarrant(heatIncrease);
            
            // Mark target as raided
            target.lastRaid = Date.now();
            
            // Log results
            this.events.add(`⚔️ Raid successful! Looted $${loot.cash.toLocaleString()} and drugs`, 'good');
            if (gangLosses > 0) {
                this.events.add(`Lost ${gangLosses} gang members from ${city} in the raid`, 'bad');
            }
            this.events.add(`Heat increased by ${heatIncrease.toLocaleString()}`, 'bad');
            
            return {
                success: true,
                loot: loot,
                gangLosses: gangLosses,
                heatIncrease: heatIncrease
            };
        } else {
            // Failed raid - higher losses
            const failedLosses = Math.floor(gangSize * 0.6);
            const failedHeat = Math.floor(heatIncrease * 1.5);
            
            this.state.removeGangMembersFromCity(city, failedLosses);
            this.state.updateWarrant(failedHeat);
            
            this.events.add(`❌ Raid failed! Lost ${failedLosses} gang members from ${city}`, 'bad');
            this.events.add(`Heat increased by ${failedHeat.toLocaleString()}`, 'bad');
            
            return {
                success: false,
                gangLosses: failedLosses,
                heatIncrease: failedHeat
            };
        }
    }
    
    getDifficultyColor(difficulty) {
        if (difficulty < 0.3) return '#66ff66'; // Easy - Green
        if (difficulty < 0.7) return '#ffff00'; // Medium - Yellow
        return '#ff6666'; // Hard - Red
    }
    
    getDifficultyText(difficulty) {
        if (difficulty < 0.3) return 'Easy';
        if (difficulty < 0.7) return 'Medium';
        return 'Hard';
    }
} 