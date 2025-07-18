// js/screens/home.js - Home screen component
export class HomeScreen {
    constructor(game) {
        this.game = game;
        this.state = game.state;
        this.ui = game.ui;
        this.systems = game.systems;
    }
    
    render() {
        const cash = this.state.get('cash');
        const day = this.state.get('day');
        const currentCity = this.state.get('currentCity');
        const cityData = this.game.data.cities[currentCity];
        const heatLevel = this.systems.heat.calculateHeatLevel();
        const heatWarning = this.systems.heat.getHeatWarning();
        
        return `
            <!-- Player Card -->
            <div class="player-card">
                <div style="font-size: 12px; color: #aaa; margin-bottom: 5px;">💰 Cash on Hand</div>
                <div class="cash-display">$<span id="homeCash">${cash.toLocaleString()}</span></div>
                <div style="font-size: 10px; color: #666; margin-top: 5px;">
                    Day <span id="homeDay">${day}</span> • 
                    <span id="dayCountdown" style="color: #66ff66;">60s</span>
                </div>
            </div>
            
            <!-- Current Location -->
            <div style="background: #333; border: 1px solid #666; border-radius: 10px; padding: 15px; margin-bottom: 20px; text-align: center;">
                <div style="font-size: 12px; color: #aaa; margin-bottom: 5px;">📍 Current Location</div>
                <div style="font-size: 18px; font-weight: bold; color: #ffff00;">${currentCity}</div>
                <div style="font-size: 12px; color: #aaa;">Population: ${cityData.population}</div>
            </div>

            <!-- Flex Score Card -->
            <div style="background: #222; padding: 15px; border-radius: 10px; margin-bottom: 20px;">
                <div style="font-size: 14px; color: #ff66ff; margin-bottom: 10px;">⭐ Flex Score</div>
                <div style="font-size: 24px; font-weight: bold;" class="flex-score-display">
                    ${window.game?.systems?.assets?.calculateFlexScore() || 0}
                </div>
                <div style="font-size: 11px; color: #aaa; margin-top: 5px;">
                    From jewelry, cars & property
                </div>
            </div>
            
            <!-- Heat Warning Card -->
            ${heatWarning ? `
                <div class="warrant-card" id="heatWarningCard">
                    <div style="font-size: 16px; margin-bottom: 10px;">🔥 HIGH HEAT WARNING</div>
                    <div style="font-size: 12px; color: #ffaaaa; margin-bottom: 10px;">${heatWarning}</div>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-top: 15px;">
                        <div style="font-size: 10px; color: #aaa;">
                            Days in City: <span>${this.state.get('daysInCurrentCity')}</span>
                        </div>
                        <div style="font-size: 10px; color: #aaa;">
                            Warrant: $<span>${this.state.get('warrant').toLocaleString()}</span>
                        </div>
                    </div>
                    <button class="action-btn bribe" onclick="game.screens.home.showBriberyModal()" style="margin-top: 15px; width: 100%;">
                        💰 Pay Bribe to Reduce Heat
                    </button>
                </div>
            ` : ''}
            
            <!-- App Grid -->
            <div class="app-grid">
                <div class="app-icon" onclick="game.screens.home.showQuickBuyModal()">
                    <div class="app-emoji">🛒</div>
                    <div class="app-name">Quick Buy</div>
                </div>
                
                <div class="app-icon" onclick="game.screens.home.showBaseManagementModal()">
                    <div class="app-emoji">🏢</div>
                    <div class="app-name">Manage Bases</div>
                </div>
                
                <div class="app-icon" onclick="game.showScreen('market')">
                    <div class="app-emoji">💊</div>
                    <div class="app-name">Market</div>
                </div>
                
                <div class="app-icon" onclick="game.showScreen('travel')">
                    <div class="app-emoji">✈️</div>
                    <div class="app-name">Travel</div>
                </div>
                
                <div class="app-icon" onclick="game.showScreen('inventory')">
                    <div class="app-emoji">🎒</div>
                    <div class="app-name">Inventory</div>
                </div>
                <div class="app-icon" onclick="game.showScreen('assets')">
                    <div class="app-emoji">💎</div>
                    <div class="app-name">Assets</div>
                </div>
                
                <div class="app-icon" onclick="game.screens.home.showRankingModal()">
                    <div class="app-emoji">🏆</div>
                    <div class="app-name">Ranking</div>
                </div>
            </div>
            
            <!-- Event Log -->
            <div class="event-log">
                <div style="text-align: center; margin-bottom: 10px; color: #666; font-size: 12px;">📰 Recent Activity</div>
                <div id="eventLog">${this.ui.events.getHTML()}</div>
            </div>

            <!-- Save Status -->
            <div style="text-align: center; margin-top: 10px; font-size: 10px; color: #666;">
                <span id="saveStatus">💾 Auto-save enabled</span>
                <button onclick="game.screens.home.confirmNewGame()" 
                        style="margin-left: 10px; padding: 4px 8px; font-size: 10px; 
                               background: #444; border: 1px solid #666; color: #aaa;">
                    New Game
                </button>
            </div>
        `;
    }

    // ... (other methods unchanged) ...

    // Modal: Base Management
    showBaseManagementModal() {
        const summary = this.systems.bases.getBaseSummary();
        const modal = this.ui.modals.create('🏢 Base Management', this.renderBaseManagementContent(summary));
        modal.show();
    }

    renderBaseManagementContent(summary) {
        const bases = Object.values(this.state.data.bases);
        const currentCity = this.state.get('currentCity');
        
        if (bases.length === 0) {
            return `
                <div style="text-align: center; padding: 30px;">
                    <div style="font-size: 48px; margin-bottom: 15px;">🏠</div>
                    <div style="font-size: 16px; color: #aaa;">No Bases Owned</div>
                    <button onclick="game.ui.modals.close(); game.screens.home.showQuickBuyModal();" 
                            class="action-btn" style="margin-top: 20px;">
                        🛒 Quick Buy Base
                    </button>
                </div>
            `;
        }
        
        return `
            <div style="background: #222; padding: 15px; margin-bottom: 20px; border-radius: 10px;">
                <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; text-align: center;">
                    <div>
                        <div style="color: #aaa; font-size: 11px;">Bases</div>
                        <div style="color: #ffff00; font-weight: bold;">${summary.basesOwned}</div>
                    </div>
                    <div>
                        <div style="color: #aaa; font-size: 11px;">Daily Income</div>
                        <div style="color: #66ff66; font-weight: bold;">$${summary.dailyIncome.toLocaleString()}</div>
                    </div>
                    <div>
                        <div style="color: #aaa; font-size: 11px;">Cash Stored</div>
                        <div style="color: #66ff66; font-weight: bold;">$${summary.totalCashStored.toLocaleString()}</div>
                    </div>
                </div>
            </div>
            <div style="max-height: 300px; overflow-y: auto;">
                ${bases.map(base => this.renderBaseItem(base)).join('')}
            </div>
        `;
    }

    renderBaseItem(base) {
        const baseType = this.game.data.baseTypes[base.level];
        const isCurrentCity = base.city === this.state.get('currentCity');
        const income = this.systems.bases.calculateBaseIncome(base);
        
        return `
            <div style="background: #222; border: 1px solid ${isCurrentCity ? '#66ff66' : '#444'}; 
                        border-radius: 10px; padding: 15px; margin-bottom: 10px;">
                <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                    <div>
                        <div style="font-weight: bold;">${baseType.name}</div>
                        <div style="font-size: 12px; color: #aaa;">${base.city} ${isCurrentCity ? '📍' : ''}</div>
                    </div>
                    <div style="text-align: right;">
                        <div style="color: ${base.operational ? '#66ff66' : '#ff6666'}; font-size: 12px;">
                            ${base.operational ? '✅ Active' : '❌ Inactive'}
                        </div>
                        <div style="font-size: 11px; color: #aaa;">$${income.toLocaleString()}/day</div>
                    </div>
                </div>
                
                ${isCurrentCity ? `
                    <button onclick="game.ui.modals.close(); game.showScreen('bases');" 
                            class="action-btn" style="width: 100%; font-size: 11px;">
                        Manage Base
                    </button>
                ` : `
                    <button onclick="game.screens.home.travelToBase('${base.city}')" 
                            class="action-btn" style="width: 100%; font-size: 11px;">
                        ✈️ Travel to ${base.city}
                    </button>
                `}
            </div>
        `;
    }

    confirmTravelToBase(city) {
        const cost = this.systems.trading.calculateTravelCost(city);
        this.ui.modals.confirm(
            `Travel to ${city} for $${cost.toLocaleString()} to manage your base?`,
            () => {
                this.state.updateCash(-cost);
                this.state.travelToCity(city);
                this.systems.heat.applyTravelHeatReduction();
                this.ui.events.add(`✈️ Arrived in ${city} (Cost: $${cost.toLocaleString()})`, 'good');
                this.ui.modals.close();
                this.game.showScreen('bases');
            },
            null
        );
    }

    travelToBase(city) {
        const cost = this.systems.trading.calculateTravelCost(city);
        
        this.ui.modals.confirm(
            `Travel to ${city} for $${cost.toLocaleString()}?`,
            () => {
                if (this.state.canAfford(cost)) {
                    this.state.updateCash(-cost);
                    this.state.travelToCity(city);
                    this.systems.heat.applyTravelHeatReduction();
                    this.ui.events.add(`✈️ Arrived in ${city} (Cost: $${cost.toLocaleString()})`, 'good');
                    this.ui.modals.close();
                    this.game.showScreen('bases');
                } else {
                    this.ui.modals.alert(`Need $${cost.toLocaleString()} to travel!`, 'Not Enough Cash');
                }
            },
            null
        );
    }

    // ... (other methods unchanged) ...
} 