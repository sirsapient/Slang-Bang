// js/screens/bases.js - Base management screen component
export class BasesScreen {
    constructor(game) {
        this.game = game;
        this.state = game.state;
        this.ui = game.ui;
        this.systems = game.systems;
    }
    
    render() {
        const currentCity = this.state.get('currentCity');
        const summary = this.systems.bases.getBaseSummary();
        return `
            <div class="screen-header">
                <button class="back-button" onclick="game.showScreen('home')">← Back</button>
                <h3>🏢 Base Operations</h3>
                <div style="font-size: 12px; color: #aaa;">Empire Management</div>
            </div>
            <!-- Bases Overview -->
            <div style="background: #333; border: 1px solid #666; border-radius: 10px; 
                        padding: 15px; margin-bottom: 20px;">
                <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 15px; text-align: center;">
                    <div>
                        <div style="font-size: 12px; color: #aaa; margin-bottom: 5px;">🏢 Bases Owned</div>
                        <div style="font-size: 18px; color: #ffff00; font-weight: bold;">
                            ${summary.basesOwned}
                        </div>
                    </div>
                    <div>
                        <div style="font-size: 12px; color: #aaa; margin-bottom: 5px;">👥 Assigned Gang</div>
                        <div style="font-size: 18px; color: #66ff66; font-weight: bold;">
                            ${summary.assignedGang}/${this.state.get('gangSize')}
                        </div>
                    </div>
                    <div>
                        <div style="font-size: 12px; color: #aaa; margin-bottom: 5px;">💰 Daily Income</div>
                        <div style="font-size: 18px; color: #66ff66; font-weight: bold;">
                            $${summary.dailyIncome.toLocaleString()}
                        </div>
                    </div>
                </div>
            </div>
            ${this.renderBasePurchaseOrManagement(currentCity)}
        `;
    }
    
    renderBasePurchaseOrManagement(city) {
        const hasBase = this.state.hasBase(city);
        if (!hasBase) {
            return this.renderBasePurchaseSection(city);
        } else {
            return this.renderCurrentCityBase(city);
        }
    }
    
    renderBasePurchaseSection(city) {
        const cost = this.systems.bases.calculateBaseCost(city);
        const cash = this.state.get('cash');
        const gangSize = this.state.get('gangSize');
        const availableGang = this.state.getAvailableGangMembers();
        return `
            <div id="basePurchaseSection" class="market-item">
                <div class="market-header">
                    <div class="drug-name">🏠 Purchase Base in ${city}</div>
                    <div class="drug-price">$${cost.toLocaleString()}</div>
                </div>
                <div style="font-size: 12px; color: #aaa; margin-bottom: 15px;">
                    Bases generate passive income when staffed with gang members and supplied with drugs.
                    <span style="color: #ffff00;">Requires 4+ gang members to operate.</span>
                </div>
                <div style="background: #1a1a1a; padding: 15px; border-radius: 8px; margin-bottom: 15px;">
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; text-align: center; 
                                margin-bottom: 10px;">
                        <div>
                            <div style="font-size: 10px; color: #aaa;">Your Cash</div>
                            <div style="color: #66ff66; font-weight: bold;">$${cash.toLocaleString()}</div>
                        </div>
                        <div>
                            <div style="font-size: 10px; color: #aaa;">Available Gang</div>
                            <div style="color: #ffff00; font-weight: bold;">${availableGang} members</div>
                        </div>
                    </div>
                    <button onclick="game.screens.bases.purchaseBase()" id="purchaseBaseBtn" 
                            class="action-btn" style="width: 100%; padding: 12px;"
                            ${gangSize < 4 || cash < cost ? 'disabled' : ''}>
                        🏠 Purchase Base
                    </button>
                    ${gangSize < 4 ? 
                        '<div style="font-size: 11px; margin-top: 8px; text-align: center; color: #ff6666;">Requires 4+ gang members</div>' : 
                        cash < cost ? 
                        `<div style="font-size: 11px; margin-top: 8px; text-align: center; color: #ff6666;">Need $${(cost - cash).toLocaleString()} more</div>` : 
                        ''
                    }
                </div>
            </div>
        `;
    }
    
    renderCurrentCityBase(city) {
        const base = this.state.getBase(city);
        if (!base) return '';
        const baseType = this.game.data.baseTypes[base.level];
        const income = this.systems.bases.calculateBaseIncome(base);
        const availableGang = this.state.getAvailableGangMembers();
        return `
            <div class="market-item" style="border: 2px solid #66ff66;">
                <div class="market-header">
                    <div class="drug-name">🏢 ${baseType.name} - ${city}</div>
                    <div style="color: ${base.operational ? '#66ff66' : '#ff6666'}; font-weight: bold;">
                        ${base.operational ? '✅ Operational' : '❌ Understaffed'}
                    </div>
                </div>
                <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px; margin: 15px 0; 
                            text-align: center;">
                    <div>
                        <div style="font-size: 10px; color: #aaa;">Gang Assigned</div>
                        <div style="color: #ffff00; font-weight: bold;">
                            ${base.assignedGang}/${baseType.gangRequired}
                        </div>
                    </div>
                    <div>
                        <div style="font-size: 10px; color: #aaa;">Daily Income</div>
                        <div style="color: #66ff66; font-weight: bold;">
                            $${income.toLocaleString()}
                        </div>
                    </div>
                    <div>
                        <div style="font-size: 10px; color: #aaa;">Cash Stored</div>
                        <div style="color: #66ff66; font-weight: bold;">
                            $${base.cashStored.toLocaleString()}
                        </div>
                    </div>
                </div>
                <!-- Gang Management -->
                <div style="background: #1a1a1a; padding: 10px; border-radius: 5px; margin-bottom: 10px;">
                    <div style="font-size: 12px; color: #ffff00; margin-bottom: 8px;">👥 Gang Management</div>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
                        <button onclick="game.screens.bases.assignGang('${city}', 1)" 
                                class="action-btn" style="padding: 6px; font-size: 11px;" 
                                ${availableGang === 0 || base.assignedGang >= baseType.gangRequired ? 'disabled' : ''}>
                            + Assign 1
                        </button>
                        <button onclick="game.screens.bases.removeGang('${city}', 1)" 
                                class="action-btn sell" style="padding: 6px; font-size: 11px;" 
                                ${base.assignedGang === 0 ? 'disabled' : ''}>
                            - Remove 1
                        </button>
                    </div>
                    <div style="font-size: 10px; color: #aaa; text-align: center; margin-top: 5px;">
                        Available: ${availableGang} members
                    </div>
                </div>
                <!-- Base Management -->
                <div style="background: #1a1a1a; padding: 10px; border-radius: 5px; margin-bottom: 10px;">
                    <div style="font-size: 12px; color: #66ff66; margin-bottom: 8px;">
                        📦 Base Inventory & Defense
                    </div>
                    <button onclick="game.screens.bases.showBaseManagementModal('${city}')" 
                            class="action-btn" style="width: 100%; padding: 8px; font-size: 11px;">
                        🏢 Manage Base Details
                    </button>
                </div>
                <!-- Actions -->
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
                    <button onclick="game.screens.bases.collectIncome('${city}')" 
                            class="action-btn" style="padding: 8px; font-size: 11px;" 
                            ${base.cashStored === 0 ? 'disabled' : ''}>
                        💰 Collect Cash
                    </button>
                    ${baseType.upgradeCost ? 
                        `<button onclick="game.screens.bases.upgradeBase('${city}')" 
                                 class="action-btn" style="padding: 8px; font-size: 11px; background: #6600ff;" 
                                 ${this.state.get('cash') < baseType.upgradeCost ? 'disabled' : ''}>
                            🔧 Upgrade ($${baseType.upgradeCost.toLocaleString()})
                        </button>` :
                        `<button class="action-btn" disabled style="padding: 8px; font-size: 11px;">
                            👑 Max Level
                        </button>`
                    }
                </div>
            </div>
        `;
    }
    // ... (other methods unchanged) ...
} 