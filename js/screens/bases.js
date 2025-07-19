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
        const availableGang = this.state.getAvailableGangMembers();
        
        return `
            <div class="screen-header">
                <button class="back-button" onclick="game.showScreen('home')">← Back</button>
                <h3>🏢 Base Operations</h3>
                <div style="font-size: 12px; color: #aaa;">Empire Management</div>
            </div>
            
            <!-- Bases Overview -->
            <div style="background: #333; border: 1px solid #666; border-radius: 10px; 
                        padding: 15px; margin-bottom: 20px;">
                            <div style="display: grid; grid-template-columns: 1fr 1fr 1fr 1fr; gap: 15px; text-align: center;">
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
                    <div style="font-size: 12px; color: #aaa; margin-bottom: 5px;">🔫 Assigned Guns</div>
                    <div style="font-size: 18px; color: #ff6666; font-weight: bold;">
                        ${summary.assignedGuns}/${this.state.get('guns')}
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
            
            <!-- All Bases List -->
            <div id="allBasesList">
                ${this.renderAllBases()}
            </div>
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
                
                <div style="display: grid; grid-template-columns: 1fr 1fr 1fr 1fr; gap: 10px; margin: 15px 0; 
                            text-align: center;">
                    <div>
                        <div style="font-size: 10px; color: #aaa;">Gang Assigned</div>
                        <div style="color: #ffff00; font-weight: bold;">
                            ${base.assignedGang}/${baseType.gangRequired}
                        </div>
                    </div>
                    <div>
                        <div style="font-size: 10px; color: #aaa;">Guns Assigned</div>
                        <div style="color: #ff6666; font-weight: bold;">
                            ${base.guns || 0}/${baseType.gunsRequired}
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
                
                <!-- Gun Management -->
                <div style="background: #1a1a1a; padding: 10px; border-radius: 5px; margin-bottom: 10px;">
                    <div style="font-size: 12px; color: #ff6666; margin-bottom: 8px;">🔫 Gun Management</div>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
                        <button onclick="game.screens.bases.assignGuns('${city}', 1)" 
                                class="action-btn" style="padding: 6px; font-size: 11px;" 
                                ${this.state.get('guns') === 0 || (base.guns || 0) >= baseType.gunsRequired ? 'disabled' : ''}>
                            + Assign 1
                        </button>
                        <button onclick="game.screens.bases.removeGuns('${city}', 1)" 
                                class="action-btn sell" style="padding: 6px; font-size: 11px;" 
                                ${(base.guns || 0) === 0 ? 'disabled' : ''}>
                            - Remove 1
                        </button>
                    </div>
                    <div style="font-size: 10px; color: #aaa; text-align: center; margin-top: 5px;">
                        Assigned: ${base.guns || 0}/${baseType.gunsRequired} | Available: ${this.state.get('guns')} guns
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
    
    renderAllBases() {
        const allBases = Object.values(this.state.data.bases).filter(base => base.city !== this.state.get('currentCity'));
        
        if (allBases.length === 0) return '';
        
        let content = '<div style="margin-top: 20px; margin-bottom: 10px; font-size: 14px; color: #aaa;">🗺️ Other Bases</div>';
        
        allBases.forEach(base => {
            const baseType = this.game.data.baseTypes[base.level];
            const income = this.systems.bases.calculateBaseIncome(base);
            
            content += `
                <div style="background: #222; border: 1px solid #444; border-radius: 10px; 
                            padding: 15px; margin-bottom: 10px;">
                    <div style="display: flex; justify-content: space-between; align-items: center; 
                                margin-bottom: 10px;">
                        <div>
                            <div style="font-weight: bold; color: #fff;">
                                ${baseType.name} - ${base.city}
                            </div>
                            <div style="font-size: 12px; color: ${base.operational ? '#66ff66' : '#ff6666'};">
                                ${base.operational ? '✅ Operational' : '❌ Understaffed'}
                            </div>
                        </div>
                        <div style="text-align: right;">
                            <div style="font-size: 12px; color: #aaa;">Daily Income</div>
                            <div style="color: #66ff66; font-weight: bold;">
                                $${income.toLocaleString()}
                            </div>
                        </div>
                    </div>
                    
                    <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 8px; 
                                font-size: 11px; color: #aaa;">
                        <div>Gang: ${base.assignedGang}/${baseType.gangRequired}</div>
                        <div>Guns: ${base.guns || 0}/${baseType.gunsRequired}</div>
                        <div>Cash: $${base.cashStored.toLocaleString()}</div>
                    </div>
                    
                    <button onclick="game.screens.bases.travelToBase('${base.city}')" 
                            class="action-btn" style="width: 100%; margin-top: 10px; padding: 6px; 
                                                     font-size: 11px;">
                        ✈️ Travel to ${base.city}
                    </button>
                </div>
            `;
        });
        
        return content;
    }
    
    purchaseBase() {
        const city = this.state.get('currentCity');
        const result = this.systems.bases.purchaseBase(city);
        if (result.success) {
            this.game.showScreen('bases'); // Refresh screen
        } else if (result.error) {
            this.ui.modals.alert(result.error, 'Purchase Failed');
        }
    }
    
    assignGang(city, amount) {
        const result = this.systems.bases.assignGangToBase(city, amount);
        if (result.success) {
            this.game.showScreen('bases');
        } else if (result.error) {
            this.ui.modals.alert(result.error, 'Assign Gang Failed');
        }
    }
    
    removeGang(city, amount) {
        const result = this.systems.bases.removeGangFromBase(city, amount);
        if (result.success) {
            this.game.showScreen('bases');
        } else if (result.error) {
            this.ui.modals.alert(result.error, 'Remove Gang Failed');
        }
    }
    
    assignGuns(city, amount) {
        const result = this.systems.bases.assignGunsToBase(city, amount);
        if (result.success) {
            this.game.showScreen('bases');
        } else if (result.error) {
            this.ui.modals.alert(result.error, 'Assign Guns Failed');
        }
    }
    
    removeGuns(city, amount) {
        const result = this.systems.bases.removeGunsFromBase(city, amount);
        if (result.success) {
            this.game.showScreen('bases');
        } else if (result.error) {
            this.ui.modals.alert(result.error, 'Remove Guns Failed');
        }
    }
    
    collectIncome(city) {
        const result = this.systems.bases.collectBaseIncome(city);
        if (result.success) {
            this.game.showScreen('bases');
        } else if (result.error) {
            this.ui.modals.alert(result.error, 'Collect Income Failed');
        }
    }
    
    upgradeBase(city) {
        const result = this.systems.bases.upgradeBase(city);
        if (result.success) {
            this.game.showScreen('bases');
        } else if (result.error) {
            this.ui.modals.alert(result.error, 'Upgrade Failed');
        }
    }
    
    travelToBase(city) {
        const cost = this.systems.trading.calculateTravelCost(city);
        this.ui.modals.confirm(
            `Travel to ${city} for $${cost.toLocaleString()} to manage your base?`,
            () => {
                this.state.updateCash(-cost);
                this.state.travelToCity(city);
                this.systems.heat.applyTravelHeatReduction();
                this.ui.events.add(`✈️ Arrived in ${city} (Cost: $${cost.toLocaleString()})`, 'good');
                this.game.showScreen('bases');
            }
        );
    }
    
    showBaseManagementModal(city, storeFlow, modalInstance) {
        const base = this.state.getBase(city);
        if (!base) return;
        const modalId = `base-mgmt-modal-${city.replace(/\s+/g, '-')}`;
        // Helper to render the content for each step
        const renderContent = (step, storeFlow) => {
            let storeSection = '';
            if (step === 'quantity') {
                storeSection = `
                    <div style="background: #333; padding: 15px; border-radius: 5px; margin-bottom: 15px;">
                        <h4 style="color: #ffff00; margin-top: 0;">Store ${storeFlow.drug} in ${base.city}</h4>
                        <div style='margin-bottom:10px;'>How many units would you like to store? (Max: ${storeFlow.maxCanStore})</div>
                        <div style='display: flex; align-items: center; gap: 10px; margin-bottom: 10px;'>
                            <input id='storeDrugQtyInput' type='number' min='1' max='${storeFlow.maxCanStore}' value='1' style='width:80px; text-align:center;'/>
                            <button id='storeDrugQtyMaxBtn' class='action-btn' style='padding: 5px 10px; font-size: 11px;'>Max</button>
                        </div>
                        <div style='margin-top:10px;'><button id='storeDrugQtySubmitBtn' class='action-btn'>OK</button> <button id='storeDrugQtyCancelBtn' class='action-btn sell'>Cancel</button></div>
                    </div>
                `;
            }
            const drugCount = this.systems.bases.getBaseDrugCount(base);
            const baseType = this.game.data.baseTypes[base.level];
            const income = this.systems.bases.calculateBaseIncome(base);
            return `
                <div id="${modalId}" style="background: #222; border-radius: 10px; padding: 15px; margin-bottom: 15px;">
                    <div style="font-weight: bold; color: #fff; font-size: 16px; margin-bottom: 8px;">
                        ${baseType.name} - ${base.city}
                    </div>
                    <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; text-align: center; font-size: 12px; color: #aaa; margin-bottom: 8px;">
                        <div>👥 Gang: <span style='color:#ffff00;'>${base.assignedGang}/${baseType.gangRequired}</span></div>
                        <div>💰 Daily Income: <span style='color:#66ff66;'>$${income.toLocaleString()}</span></div>
                        <div>📦 Drugs: <span style='color:#66ff66;'>${drugCount}/${baseType.maxInventory}</span></div>
                        <div>💵 Cash: <span style='color:#66ff66;'>$${base.cashStored.toLocaleString()}</span></div>
                    </div>
                    <div style="text-align: center; margin-bottom: 20px; padding: 10px; 
                                background: ${base.operational ? '#002200' : '#220000'}; border-radius: 5px;">
                        <strong style="color: ${base.operational ? '#00ff00' : '#ff0000'};">
                            ${base.operational ? '✅ BASE OPERATING' : '❌ BASE NOT OPERATING'}
                        </strong>
                        <div style="font-size: 12px; color: #aaa; margin-top: 5px;">
                            ${base.operational ? 
                                `Daily Earnings: $${income.toLocaleString()}` : 
                                'Needs gang members and drugs to operate'}
                        </div>
                    </div>
                    ${storeSection}
                    <!-- Drug Storage -->
                    <div style="background: #222; padding: 15px; border-radius: 5px;">
                        <h4 style="color: #66ff66; margin-top: 0;">
                            📦 Drug Storage (${drugCount}/${baseType.maxInventory})
                        </h4>
                        <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px;">
                            ${Object.keys(base.inventory).map(drug => `
                                <div style="text-align: center; padding: 10px; background: #333; border-radius: 5px;">
                                    <div style="font-weight: bold; color: #ffff00;">${drug}</div>
                                    <div style="color: #ffff00; font-size: 18px; margin: 5px 0;">
                                        ${base.inventory[drug]}
                                    </div>
                                    <div style="font-size: 10px; color: #aaa;">
                                        You have: ${this.state.getInventory(drug)}
                                    </div>
                                    <button class="store-drug-btn" data-city="${base.city}" data-drug="${drug}"
                                            style="width: 100%; margin: 2px 0; font-size: 10px;"
                                            ${this.state.getInventory(drug) === 0 || drugCount >= baseType.maxInventory ? 'disabled' : ''}>
                                        Store
                                    </button>
                                    <button onclick="game.screens.bases.takeDrug('${base.city}', '${drug}')" 
                                            style="width: 100%; font-size: 10px;"
                                            ${base.inventory[drug] === 0 ? 'disabled' : ''}>
                                        Take 1
                                    </button>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </div>
            `;
        };

        // If no modalInstance, create and show the modal
        if (!modalInstance) {
            const modal = this.ui.modals.create(`🏢 ${city} Base Management`, renderContent('main'));
            modal.show();
            setTimeout(() => {
                this.showBaseManagementModal(city, undefined, modal);
            }, 100);
            return;
        }

        // Update modal content for each step
        const modalElement = modalInstance.element;
        const modalBody = modalElement.querySelector('.modal-body');
        if (!storeFlow) {
            // Main management view
            modalBody.innerHTML = renderContent('main');
        } else if (storeFlow.step === 'quantity') {
            modalBody.innerHTML = renderContent('quantity', storeFlow);
        }

        // Attach event listeners after content update
        setTimeout(() => {
            // Store button logic
            const storeBtns = modalBody.querySelectorAll('.store-drug-btn');
            storeBtns.forEach(btn => {
                btn.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    const city = btn.getAttribute('data-city');
                    const drug = btn.getAttribute('data-drug');
                    // Calculate maxCanStore
                    const playerHas = this.state.getInventory(drug);
                    const base = this.state.getBase(city);
                    const baseType = this.game.data.baseTypes[base.level];
                    const drugCount = this.systems.bases.getBaseDrugCount(base);
                    const drugsCount = Object.keys(this.game.data.drugs).length;
                    const perDrugCap = Math.floor(baseType.maxInventory / drugsCount);
                    const currentDrugAmount = base.inventory[drug] || 0;
                    const perDrugSpace = perDrugCap - currentDrugAmount;
                    const maxCanStore = Math.min(playerHas, baseType.maxInventory - drugCount, perDrugSpace);
                    if (maxCanStore <= 0) {
                        this.ui.modals.alert('You do not have enough space in this base for that drug.', 'Not Enough Space');
                        return;
                    }
                    // Update modal with quantity input
                    this.showBaseManagementModal(city, { step: 'quantity', drug, maxCanStore }, modalInstance);
                });
            });
            // Quantity input logic
            const qtySubmitBtn = modalBody.querySelector('#storeDrugQtySubmitBtn');
            const qtyCancelBtn = modalBody.querySelector('#storeDrugQtyCancelBtn');
            const qtyMaxBtn = modalBody.querySelector('#storeDrugQtyMaxBtn');
            const qtyInput = modalBody.querySelector('#storeDrugQtyInput');
            
            if (qtyMaxBtn) {
                qtyMaxBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    if (qtyInput) {
                        qtyInput.value = storeFlow.maxCanStore;
                    }
                });
            }
            
            if (qtySubmitBtn) {
                qtySubmitBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    const qty = parseInt(modalBody.querySelector('#storeDrugQtyInput').value, 10);
                    const drug = storeFlow.drug;
                    if (isNaN(qty) || qty < 1 || qty > storeFlow.maxCanStore) {
                        this.ui.modals.alert('Invalid quantity.', 'Error');
                        return;
                    }
                    // Store drugs directly without confirmation
                    const result = this.systems.bases.storeDrugsInBase(city, drug, qty);
                    if (result.success) {
                        this.showBaseManagementModal(city, undefined, modalInstance);
                    } else if (result.error) {
                        this.ui.modals.alert(result.error, 'Store Drug Failed');
                    }
                });
            }
            if (qtyCancelBtn) {
                qtyCancelBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    this.showBaseManagementModal(city, undefined, modalInstance);
                });
            }

        }, 100);
    }
    
    renderBaseManagementModal(base, storeFlow) {
        const baseType = this.game.data.baseTypes[base.level];
        if (!base.inventory) {
            base.inventory = this.systems.bases.createEmptyInventory();
        }
        const drugCount = this.systems.bases.getBaseDrugCount(base);
        const income = this.systems.bases.calculateBaseIncome(base);
        const modalId = `base-mgmt-modal-${base.city.replace(/\s+/g, '-')}`;
        // storeFlow: { step: 'quantity'|'confirm', drug, maxCanStore, qty }
        let storeSection = '';
        if (storeFlow && storeFlow.step === 'quantity') {
            storeSection = `
                <div style="background: #333; padding: 15px; border-radius: 5px; margin-bottom: 15px;">
                    <h4 style="color: #ffff00; margin-top: 0;">Store ${storeFlow.drug} in ${base.city}</h4>
                    <div style='margin-bottom:10px;'>How many units would you like to store? (Max: ${storeFlow.maxCanStore})</div>
                    <input id='storeDrugQtyInput' type='number' min='1' max='${storeFlow.maxCanStore}' value='1' style='width:80px; text-align:center;'/>
                    <div style='margin-top:10px;'><button id='storeDrugQtySubmitBtn' class='action-btn'>OK</button> <button id='storeDrugQtyCancelBtn' class='action-btn sell'>Cancel</button></div>
                </div>
            `;
        } else if (storeFlow && storeFlow.step === 'confirm') {
            storeSection = `
                <div style="background: #333; padding: 15px; border-radius: 5px; margin-bottom: 15px;">
                    <h4 style="color: #ffff00; margin-top: 0;">Confirm Store</h4>
                    <div style='margin-bottom:10px;'>Add ${storeFlow.qty} units of ${storeFlow.drug} to ${base.city}?</div>
                    <div style='margin-top:10px;'><button id='storeDrugConfirmBtn' class='action-btn'>Confirm</button> <button id='storeDrugCancelBtn' class='action-btn sell'>Cancel</button></div>
                </div>
            `;
        }
        const html = `
            <div id="${modalId}" style="background: #222; border-radius: 10px; padding: 15px; margin-bottom: 15px;">
                <div style="font-weight: bold; color: #fff; font-size: 16px; margin-bottom: 8px;">
                    ${baseType.name} - ${base.city}
                </div>
                <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; text-align: center; font-size: 12px; color: #aaa; margin-bottom: 8px;">
                    <div>👥 Gang: <span style='color:#ffff00;'>${base.assignedGang}/${baseType.gangRequired}</span></div>
                    <div>💰 Daily Income: <span style='color:#66ff66;'>$${income.toLocaleString()}</span></div>
                    <div>📦 Drugs: <span style='color:#66ff66;'>${drugCount}/${baseType.maxInventory}</span></div>
                    <div>💵 Cash: <span style='color:#66ff66;'>$${base.cashStored.toLocaleString()}</span></div>
                </div>
                <div style="text-align: center; margin-bottom: 20px; padding: 10px; 
                            background: ${base.operational ? '#002200' : '#220000'}; border-radius: 5px;">
                    <strong style="color: ${base.operational ? '#00ff00' : '#ff0000'};">
                        ${base.operational ? '✅ BASE OPERATING' : '❌ BASE NOT OPERATING'}
                    </strong>
                    <div style="font-size: 12px; color: #aaa; margin-top: 5px;">
                        ${base.operational ? 
                            `Daily Earnings: $${income.toLocaleString()}` : 
                            'Needs gang members and drugs to operate'}
                    </div>
                </div>
                ${storeSection}
                <!-- Drug Storage -->
                <div style="background: #222; padding: 15px; border-radius: 5px;">
                    <h4 style="color: #66ff66; margin-top: 0;">
                        📦 Drug Storage (${drugCount}/${baseType.maxInventory})
                    </h4>
                    <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px;">
                        ${Object.keys(base.inventory).map(drug => `
                            <div style="text-align: center; padding: 10px; background: #333; border-radius: 5px;">
                                <div style="font-weight: bold; color: #ffff00;">${drug}</div>
                                <div style="color: #ffff00; font-size: 18px; margin: 5px 0;">
                                    ${base.inventory[drug]}
                                </div>
                                <div style="font-size: 10px; color: #aaa;">
                                    You have: ${this.state.getInventory(drug)}
                                </div>
                                <button class="store-drug-btn" data-city="${base.city}" data-drug="${drug}"
                                        style="width: 100%; margin: 2px 0; font-size: 10px;"
                                        ${this.state.getInventory(drug) === 0 || drugCount >= baseType.maxInventory ? 'disabled' : ''}>
                                    Store
                                </button>
                                <button onclick="game.screens.bases.takeDrug('${base.city}', '${drug}')" 
                                        style="width: 100%; font-size: 10px;"
                                        ${base.inventory[drug] === 0 ? 'disabled' : ''}>
                                    Take 1
                                </button>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;
        return html;
    }

    storeDrug(city, drug) {
        console.log('[storeDrug] called for', city, drug);
        const playerHas = this.state.getInventory(drug);
        const base = this.state.getBase(city);
        const baseType = this.game.data.baseTypes[base.level];
        const drugCount = this.systems.bases.getBaseDrugCount(base);
        const drugsCount = Object.keys(this.game.data.drugs).length;
        const perDrugCap = Math.floor(baseType.maxInventory / drugsCount);
        const currentDrugAmount = base.inventory[drug] || 0;
        const perDrugSpace = perDrugCap - currentDrugAmount;
        const maxCanStore = Math.min(playerHas, baseType.maxInventory - drugCount, perDrugSpace);
        console.log('[storeDrug] maxCanStore:', maxCanStore, 'playerHas:', playerHas, 'baseSpace:', baseType.maxInventory - drugCount, 'perDrugSpace:', perDrugSpace);
        if (maxCanStore <= 0) {
            this.ui.modals.alert('You do not have enough space in this base for that drug.', 'Not Enough Space');
            return;
        }
        // Use built-in prompt for quantity
        this.ui.modals.prompt(
            `How many units of ${drug} would you like to store? (Max: ${maxCanStore})`,
            '1',
            (qtyStr) => {
                const qty = parseInt(qtyStr, 10);
                if (isNaN(qty) || qty < 1) return;
                if (qty > maxCanStore) {
                    this.ui.modals.alert('You do not have enough space in this base for that quantity.', 'Not Enough Space');
                    return;
                }
                // Confirm modal
                this.ui.modals.confirm(
                    `Add ${qty} units of ${drug} to ${city}?`,
                    () => {
                        const result = this.systems.bases.storeDrugsInBase(city, drug, qty);
                        if (result.success) {
                            // Check how much was actually stored by comparing before/after
                            const newBase = this.state.getBase(city);
                            const newAmount = newBase.inventory[drug] || 0;
                            const stored = newAmount - currentDrugAmount;
                            if (stored < qty) {
                                this.ui.modals.alert(`Only ${stored} units of ${drug} could be stored due to space or cap limits.`, 'Partial Store');
                            }
                            this.showBaseManagementModal(city);
                        } else if (result.error) {
                            this.ui.modals.alert(result.error, 'Store Drug Failed');
                        }
                    }
                );
            }
        );
    }

    takeDrug(city, drug) {
        // Implementation would need to prompt for amount, here is a basic pattern:
        const amount = 1; // Example, should be user input
        const result = this.systems.bases.takeDrugsFromBase(city, drug, amount);
        if (result.success) {
            this.game.showScreen('bases');
        } else if (result.error) {
            this.ui.modals.alert(result.error, 'Take Drug Failed');
        }
    }

    testStore() {
        console.log('[testStore] Method called');
        this.ui.modals.prompt(
            'How many units would you like to store? (Test)',
            '1',
            (qtyStr) => {
                console.log('[testStore] Quantity entered:', qtyStr);
                const qty = parseInt(qtyStr, 10);
                if (isNaN(qty) || qty < 1) {
                    console.log('[testStore] Invalid quantity');
                    return;
                }
                console.log('[testStore] Valid quantity:', qty);
                this.ui.modals.alert(`Test: Would store ${qty} units`, 'Test Store');
            }
        );
    }
}