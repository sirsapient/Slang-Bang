// js/systems/heat.js - Heat and warrant management system
export class HeatSystem {
    constructor(gameState, eventLogger) {
        this.state = gameState;
        this.events = eventLogger;
    }
    
    // Calculate current heat level based on warrant and time in city
    calculateHeatLevel() {
        const warrantHeat = Math.min(this.state.get('warrant') / 10000, 50);
        const timeHeat = Math.max(0, this.state.get('daysInCurrentCity') - 3) * 5;
        const totalHeat = warrantHeat + timeHeat;
        
        this.state.set('heatLevel', Math.min(100, totalHeat));
        return this.state.get('heatLevel');
    }
    
    // Get heat level as text
    getHeatLevelText() {
        const heat = this.state.get('heatLevel');
        if (heat < 20) return 'Low';
        if (heat < 40) return 'Medium';
        if (heat < 70) return 'High';
        return 'Critical';
    }
    
    // Get heat level color class
    getHeatColorClass() {
        const heat = this.state.get('heatLevel');
        if (heat < 20) return 'heat-low';
        if (heat < 40) return 'heat-medium';
        if (heat < 70) return 'heat-high';
        return 'heat-critical';
    }
    
    // Apply warrant decay when staying in same city
    applyWarrantDecay() {
        const daysSinceTravel = this.state.get('daysSinceTravel');
        
        if (daysSinceTravel > 0) {
            let decayRate = 0.02; // Base 2% decay
            
            if (daysSinceTravel >= 3) decayRate = 0.035;
            if (daysSinceTravel >= 7) decayRate = 0.05;
            if (daysSinceTravel >= 14) decayRate = 0.08;
            
            const currentWarrant = this.state.get('warrant');
            const warrantReduction = Math.floor(currentWarrant * decayRate);
            
            if (warrantReduction > 0) {
                this.state.updateWarrant(-warrantReduction);
                
                if (daysSinceTravel === 3) {
                    this.events.add(`🕊️ Laying low is working - warrant reduced by ${warrantReduction.toLocaleString()}`, 'good');
                } else if (daysSinceTravel === 7) {
                    this.events.add(`😎 Heat cooling down - warrant reduced by ${warrantReduction.toLocaleString()}`, 'good');
                } else if (daysSinceTravel >= 14 && daysSinceTravel % 7 === 0) {
                    this.events.add(`🏖️ Deep cover paying off - warrant reduced by ${warrantReduction.toLocaleString()}`, 'good');
                }
            }
        }
    }
    
    // Check for police raids based on heat level
    checkPoliceRaid() {
        const heat = this.calculateHeatLevel();
        
        if (heat >= 70) {
            const raidChance = Math.min(0.3, (heat - 70) / 100);
            
            if (Math.random() < raidChance) {
                this.executePoliceRaid();
            }
        }
    }
    
    // Execute a police raid
    executePoliceRaid() {
        const totalDrugs = this.state.getTotalInventory();
        const guns = this.state.get('guns');
        
        if (totalDrugs === 0 && guns === 0) {
            this.events.add('🚔 Police raided but found nothing! Lucky escape.', 'good');
            this.state.updateWarrant(-Math.floor(this.state.get('warrant') * 0.5));
            return;
        }
        
        // Gun protection reduces losses
        const gunProtection = Math.min(0.4, guns * 0.02);
        const baseLossPercent = 0.3 + Math.random() * 0.4;
        const actualLossPercent = Math.max(0.1, baseLossPercent - gunProtection);
        
        // Lose drugs
        const drugsLost = [];
        const inventory = this.state.get('inventory');
        Object.keys(inventory).forEach(drug => {
            const currentAmount = inventory[drug];
            const lost = Math.floor(currentAmount * actualLossPercent);
            if (lost > 0) {
                this.state.updateInventory(drug, -lost);
                drugsLost.push(`${lost} ${drug}`);
            }
        });
        
        // Lose cash
        const cashLoss = Math.floor(this.state.get('cash') * (0.1 + Math.random() * 0.2));
        this.state.updateCash(-cashLoss);
        
        // Lose guns
        const gunsLost = Math.floor(guns * (0.1 + Math.random() * 0.2));
        this.state.set('guns', Math.max(0, guns - gunsLost));
        
        // Increase warrant
        const warrantIncrease = 5000 + Math.floor(Math.random() * 10000);
        this.state.updateWarrant(warrantIncrease);

        // Asset protection event
        const assetValue = window.game?.systems?.assets?.getTotalAssetValue() || 0;
        if (assetValue > 0) {
            this.events.add('💎 Your assets were protected from the raid!', 'good');
        }

        // Build raid message
        let raidMessage = `🚔 POLICE RAID! Lost `;
        if (drugsLost.length > 0) {
            raidMessage += drugsLost.join(', ') + ', ';
        }
        raidMessage += `${cashLoss.toLocaleString()} cash`;
        if (gunsLost > 0) {
            raidMessage += `, ${gunsLost} guns`;
        }
        raidMessage += `, +${warrantIncrease.toLocaleString()} warrant`;
        
        if (gunProtection > 0) {
            this.events.add(`🔫 Guns reduced raid losses by ${Math.floor(gunProtection * 100)}%`, 'good');
        }
        
        this.events.add(raidMessage, 'bad');
    }
    
    // Generate heat from gang activities
    generateGangHeat() {
        const gangSize = this.state.get('gangSize');
        
        if (gangSize > 0) {
            const warrantIncrease = Math.floor(gangSize * 100 * Math.random());
            if (warrantIncrease > 0) {
                this.state.updateWarrant(warrantIncrease);
                this.events.add(`Gang activities increased heat by ${warrantIncrease.toLocaleString()}`, 'bad');
            }
        }
    }
    
    // Handle travel heat reduction
    applyTravelHeatReduction() {
        const currentWarrant = this.state.get('warrant');
        const heatReduction = Math.floor(currentWarrant * 0.4);
        
        if (heatReduction > 0) {
            this.state.updateWarrant(-heatReduction);
            this.events.add(`🌊 Travel cooled you down, heat reduced by ${heatReduction.toLocaleString()}`, 'good');
        }
    }
    
    // Process bribery
    processBribery(cost, reduction) {
        if (!this.state.canAfford(cost)) {
            this.events.add(`Can't afford bribe. Need ${cost.toLocaleString()}`, 'bad');
            return false;
        }
        
        this.state.updateCash(-cost);
        this.state.updateWarrant(-reduction);
        
        this.events.add(`💰 Paid ${cost.toLocaleString()} in bribes - warrant reduced by ${reduction.toLocaleString()}`, 'good');
        
        // Small chance of backfire
        if (Math.random() < 0.05) {
            const backfireWarrant = Math.floor(cost * 0.1);
            this.state.updateWarrant(backfireWarrant);
            this.events.add(`🚨 Bribery discovered! Additional warrant: ${backfireWarrant.toLocaleString()}`, 'bad');
        }
        
        return true;
    }
    
    // Get heat warning message
    getHeatWarning() {
        const heat = this.state.get('heatLevel');
        
        if (heat >= 70) {
            return '🚨 CRITICAL: Police raids likely! Travel or pay bribes immediately!';
        } else if (heat >= 40) {
            return '⚠️ HIGH HEAT: Consider traveling to a new city or paying bribes.';
        }
        return null;
    }
    
    // Calculate bribery costs
    calculateBriberyCost() {
        const warrant = this.state.get('warrant');
        const cost = warrant * 2;
        const reduction = Math.floor(warrant * 0.75);
        
        return { cost, reduction };
    }
}