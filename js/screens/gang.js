// js/screens/gang.js - Gang management screen component
export class GangScreen {
    constructor(game) {
        this.game = game;
        this.state = game.state;
        this.ui = game.ui;
        this.systems = game.systems;
    }
    
    render() {
        const gangSize = this.state.get('gangSize');
        const cash = this.state.get('cash');
        const currentCity = this.state.get('currentCity');
        const costPerMember = this.calculateGangMemberCost();
        
        return `
            <div class="screen-header">
                <button class="back-button" onclick="game.showScreen('home')">← Back</button>
                <h3>👥 Gang Management</h3>
                <div style="font-size: 12px; color: #aaa;">Build Your Crew</div>
            </div>
            
            <!-- Gang Overview -->
            <div style="background: #333; border: 1px solid #666; border-radius: 10px; 
                        padding: 15px; margin-bottom: 20px;">
                <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 15px; text-align: center;">
                    <div>
                        <div style="font-size: 12px; color: #aaa; margin-bottom: 5px;">👥 Gang Size</div>
                        <div style="font-size: 18px; color: #ffff00; font-weight: bold;">${gangSize}</div>
                    </div>
                    <div>
                        <div style="font-size: 12px; color: #aaa; margin-bottom: 5px;">💰 Cash</div>
                        <div style="font-size: 18px; color: #66ff66; font-weight: bold;">
                            $${cash.toLocaleString()}
                        </div>
                    </div>
                    <div>
                        <div style="font-size: 12px; color: #aaa; margin-bottom: 5px;">📍 Location</div>
                        <div style="font-size: 18px; color: #ffff00; font-weight: bold;">${currentCity}</div>
                    </div>
                </div>
            </div>

            <!-- Recruitment Section -->
            <div class="market-item">
                <div class="market-header">
                    <div class="drug-name">🔫 Recruit Gang Members</div>
                    <div class="drug-price">$${costPerMember.toLocaleString()} each</div>
                </div>
                <div style="font-size: 12px; color: #aaa; margin-bottom: 15px;">
                    Gang members generate heat but enable advanced operations. 
                    <span style="color: #ffff00;">Cost increases with city heat modifier.</span>
                </div>
                
                <!-- Recruitment Interface -->
                <div style="background: #1a1a1a; padding: 15px; border-radius: 8px; margin-bottom: 15px;">
                    <div style="font-size: 14px; color: #ffff00; margin-bottom: 10px; text-align: center;">
                        💼 Bulk Recruitment
                    </div>
                    
                    <div style="display: grid; grid-template-columns: 1fr auto auto; gap: 8px; 
                                align-items: center; margin-bottom: 10px;">
                        <input type="number" class="quantity-input" id="gangRecruitCount" 
                               value="1" min="1" max="50" 
                               oninput="game.screens.gang.updateRecruitmentCost()" 
                               placeholder="Members to recruit">
                        <button class="action-btn" onclick="game.screens.gang.recruitGangMembers()" 
                                id="recruitBtn">
                            Recruit
                        </button>
                        <button class="action-btn" onclick="game.screens.gang.setMaxRecruitment()" 
                                style="background: #666; font-size: 10px; padding: 6px 8px;">
                            Max
                        </button>
                    </div>
                    
                    <div id="recruitmentCostDisplay" style="font-size: 12px; color: #ffff00; 
                                                           text-align: center; min-height: 40px;">
                        <!-- Cost calculation will appear here -->
                    </div>
                </div>

                <!-- Quick Recruitment Options -->
                <div style="background: #222; border: 1px solid #444; border-radius: 8px; padding: 12px;">
                    <div style="font-size: 12px; color: #aaa; margin-bottom: 8px; text-align: center;">
                        ⚡ Quick Options
                    </div>
                    <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 8px;">
                        <button onclick="game.screens.gang.quickRecruit(5)" class="action-btn" 
                                style="padding: 6px; font-size: 11px;">
                            +5 Members
                        </button>
                        <button onclick="game.screens.gang.quickRecruit(10)" class="action-btn" 
                                style="padding: 6px; font-size: 11px;">
                            +10 Members
                        </button>
                        <button onclick="game.screens.gang.quickRecruit(25)" class="action-btn" 
                                style="padding: 6px; font-size: 11px;">
                            +25 Members
                        </button>
                    </div>
                </div>
            </div>

            <!-- Gang Members List -->
            <div id="gangMembersList">
                ${this.renderGangMembersList()}
            </div>
        `;
    }
    
    onShow() {
        this.updateRecruitmentCost();
    }
    
    calculateGangMemberCost() {
        const baseCost = this.game.data.config.baseGangCost;
        const cityModifier = this.game.data.cities[this.state.get('currentCity')].heatModifier;
        const gangModifier = 1 + (this.state.get('gangSize') * this.game.data.config.gangCostScaling);
        return Math.floor(baseCost * cityModifier * gangModifier);
    }
    
    updateRecruitmentCost() {
        const quantity = parseInt(document.getElementById('gangRecruitCount')?.value) || 0;
        const costPerMember = this.calculateGangMemberCost();
        const totalCost = costPerMember * quantity;
        const maxAffordable = Math.floor(this.state.get('cash') / costPerMember);
        
        const costDisplay = document.getElementById('recruitmentCostDisplay');
        const recruitBtn = document.getElementById('recruitBtn');
        
        if (costDisplay) {
            if (quantity > 0) {
                const heatIncrease = quantity * this.game.data.config.gangRecruitHeat;
                costDisplay.innerHTML = `
                    <div>Total Cost: <span style="color: ${totalCost > this.state.get('cash') ? '#ff6666' : '#ffff00'}">
                        $${totalCost.toLocaleString()}
                    </span></div>
                    <div style="margin-top: 5px;">Heat Increase: <span style="color: #ff6666">
                        +${heatIncrease.toLocaleString()}
                    </span></div>
                    ${totalCost > this.state.get('cash') ? 
                        `<div style="color: #ff6666; margin-top: 5px;">
                            ⚠️ Not enough cash! (Max: ${maxAffordable})
                        </div>` : 
                        `<div style="color: #66ff66; margin-top: 5px;">
                            Remaining: $${(this.state.get('cash') - totalCost).toLocaleString()}
                        </div>`
                    }
                `;
            } else {
                costDisplay.innerHTML = '<div style="color: #666;">Enter quantity to see cost</div>';
            }
        }
        
        if (recruitBtn) {
            recruitBtn.disabled = quantity <= 0 || totalCost > this.state.get('cash');
        }
    }
    
    setMaxRecruitment() {
        const costPerMember = this.calculateGangMemberCost();
        const maxAffordable = Math.floor(this.state.get('cash') / costPerMember);
        const input = document.getElementById('gangRecruitCount');
        if (input) {
            input.value = Math.max(1, Math.min(50, maxAffordable));
            this.updateRecruitmentCost();
        }
    }
    
    quickRecruit(amount) {
        const input = document.getElementById('gangRecruitCount');
        if (input) {
            input.value = amount;
            this.updateRecruitmentCost();
        }
    }
    
    recruitGangMembers() {
        const quantity = parseInt(document.getElementById('gangRecruitCount')?.value) || 0;
        
        if (quantity <= 0) {
            this.ui.events.add('Enter a quantity to recruit gang members', 'neutral');
            return;
        }
        
        const costPerMember = this.calculateGangMemberCost();
        const totalCost = costPerMember * quantity;
        const currentCity = this.state.get('currentCity');
        
        if (this.state.canAfford(totalCost)) {
            this.state.updateCash(-totalCost);
            this.state.addGangMembers(currentCity, quantity);
            
            // Add heat
            const heatIncrease = quantity * this.game.data.config.gangRecruitHeat;
            this.state.updateWarrant(heatIncrease);
            
            this.ui.events.add(`Recruited ${quantity} gang members in ${currentCity} for $${totalCost.toLocaleString()}`, 'good');
            this.ui.events.add(`Gang recruitment increased heat by ${heatIncrease.toLocaleString()}`, 'bad');
            
            // Reset form and refresh
            document.getElementById('gangRecruitCount').value = '1';
            this.game.showScreen('gang'); // Refresh screen
        } else {
            this.ui.events.add(`Not enough cash to recruit ${quantity} gang members`, 'bad');
        }
    }
    
    renderGangMembersList() {
        const gangSize = this.state.get('gangSize');
        
        if (gangSize === 0) {
            return `
                <div style="background: #222; border: 1px solid #444; border-radius: 10px; 
                            padding: 30px; text-align: center; margin-top: 20px;">
                    <div style="font-size: 48px; margin-bottom: 15px;">👤</div>
                    <div style="font-size: 16px; color: #aaa; margin-bottom: 10px;">
                        No gang members yet
                    </div>
                    <div style="font-size: 12px; color: #666; margin-bottom: 20px;">
                        Recruit your first crew members to unlock advanced operations
                    </div>
                    <div style="font-size: 11px; color: #888;">
                        💡 Tip: Gang members generate heat but enable base operations and raids
                    </div>
                </div>
            `;
        }
        
        // Calculate gang statistics
        const dailyHeatGeneration = gangSize * this.game.data.config.gangHeatPerMember;
        const costPerMember = this.calculateGangMemberCost();
        const totalValue = gangSize * (costPerMember * 0.7); // Resale value is 70%
        
        let content = `
            <div style="background: #333; border: 1px solid #666; border-radius: 10px; 
                        padding: 15px; margin-top: 20px; margin-bottom: 15px;">
                <div style="font-size: 14px; color: #ffff00; margin-bottom: 15px; text-align: center;">
                    📊 Gang Statistics
                </div>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                    <div style="text-align: center;">
                        <div style="font-size: 12px; color: #aaa; margin-bottom: 5px;">🔥 Daily Heat</div>
                        <div style="font-size: 16px; color: #ff6666; font-weight: bold;">
                            +${dailyHeatGeneration.toLocaleString()}
                        </div>
                    </div>
                    <div style="text-align: center;">
                        <div style="font-size: 12px; color: #aaa; margin-bottom: 5px;">💎 Total Value</div>
                        <div style="font-size: 16px; color: #66ff66; font-weight: bold;">
                            $${totalValue.toLocaleString()}
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // Gang members by city
        const gangMembers = this.state.data.gangMembers || {};
        const citiesWithGang = Object.keys(gangMembers).filter(city => gangMembers[city] > 0);
        
        if (citiesWithGang.length > 0) {
            content += `
                <div style="background: #222; border: 1px solid #444; border-radius: 10px; 
                            padding: 15px; margin-bottom: 15px;">
                    <div style="font-size: 14px; color: #ffff00; margin-bottom: 15px; text-align: center;">
                        🗺️ Gang Members by City
                    </div>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
                        ${citiesWithGang.map(city => {
                            const totalInCity = gangMembers[city];
                            const availableInCity = this.state.getAvailableGangMembersInCity(city);
                            const assignedInCity = totalInCity - availableInCity;
                            
                            return `
                                <div style="background: #1a1a1a; padding: 10px; border-radius: 5px;">
                                    <div style="font-size: 12px; color: #aaa; margin-bottom: 5px;">${city}</div>
                                    <div style="font-size: 14px; color: #ffff00; font-weight: bold;">
                                        ${totalInCity} total
                                    </div>
                                    <div style="font-size: 10px; color: #66ff66;">
                                        ${availableInCity} available
                                    </div>
                                    ${assignedInCity > 0 ? 
                                        `<div style="font-size: 10px; color: #ff6666;">
                                            ${assignedInCity} assigned
                                        </div>` : ''
                                    }
                                </div>
                            `;
                        }).join('')}
                    </div>
                </div>
            `;
        }
        
        // Gang tier
        let currentTier = null;
        for (let tier of this.game.data.gangTiers) {
            if (gangSize >= tier.range[0] && gangSize <= tier.range[1]) {
                currentTier = tier;
                break;
            }
        }
        
        if (currentTier) {
            content += `
                <div style="background: #222; border: 1px solid #444; border-radius: 10px; 
                            padding: 15px; margin-bottom: 15px;">
                    <div style="text-align: center;">
                        <div style="font-size: 24px; margin-bottom: 8px;">${currentTier.emoji}</div>
                        <div style="font-size: 14px; color: #ffff00; font-weight: bold; margin-bottom: 5px;">
                            ${currentTier.name}
                        </div>
                        <div style="font-size: 12px; color: #aaa;">${currentTier.description}</div>
                    </div>
                </div>
            `;
        }
        
        // Operations unlocked
        const operationsAvailable = [];
        if (gangSize >= 3) operationsAvailable.push('⚔️ Base Raids');
        if (gangSize >= 4) operationsAvailable.push('🏢 Base Operations');
        if (gangSize >= 10) operationsAvailable.push('⚔️ Turf Wars');
        if (gangSize >= 20) operationsAvailable.push('🎯 Territory Raids');
        if (gangSize >= 30) operationsAvailable.push('👑 Empire Management');
        
        if (operationsAvailable.length > 0) {
            content += `
                <div style="background: #1a3300; border: 1px solid #336600; border-radius: 10px; padding: 15px;">
                    <div style="font-size: 12px; color: #66ff66; margin-bottom: 10px; text-align: center;">
                        ✅ Operations Unlocked
                    </div>
                    <div style="font-size: 11px; color: #aaffaa;">
                        ${operationsAvailable.map(op => `<div style="margin: 3px 0;">${op}</div>`).join('')}
                    </div>
                </div>
            `;
        }
        
        return content;
    }
}