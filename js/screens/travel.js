// js/screens/travel.js - Travel screen component
export class TravelScreen {
    constructor(game) {
        this.game = game;
        this.state = game.state;
        this.ui = game.ui;
        this.systems = game.systems;
    }
    
    render() {
        const cash = this.state.get('cash');
        const currentCity = this.state.get('currentCity');
        const heatLevel = this.systems.heat.getHeatLevelText();
        const heatColor = heatLevel === 'High' || heatLevel === 'Critical' ? '#ff6666' : '#66ff66';
        
        return `
            <div class="screen-header">
                <button class="back-button" onclick="game.showScreen('home')">← Back</button>
                <h3>✈️ Travel</h3>
                <div style="font-size: 12px; color: #aaa;">Choose Destination</div>
            </div>
            
            <div style="background: #333; padding: 10px; margin-bottom: 15px; border-radius: 8px; font-size: 12px;">
                <div>💰 Your Cash: $<span id="travelCash">${cash.toLocaleString()}</span></div>
                <div>📍 Current City: <span id="travelCurrentCity">${currentCity}</span></div>
                <div>🔥 Heat Level: <span id="travelHeatLevel" style="color: ${heatColor}">${heatLevel}</span></div>
            </div>
            
            <div id="cityList">
                ${this.renderCityList()}
            </div>
        `;
    }
    
    renderCityList() {
        const currentCity = this.state.get('currentCity');
        const cash = this.state.get('cash');
        let content = '';
        
        Object.entries(this.game.data.cities).forEach(([cityName, cityData]) => {
            if (cityName !== currentCity) {
                const cost = this.systems.trading.calculateTravelCost(cityName);
                const canAfford = cash >= cost;
                const hasBase = this.state.hasBase(cityName);
                
                content += `
                    <div class="city-item" 
                         style="${!canAfford ? 'opacity: 0.5; cursor: not-allowed;' : ''}"
                         ${canAfford ? `onclick="game.screens.travel.confirmTravel('${cityName}', ${cost})"` : ''}>
                        <div class="city-header">
                            <div class="city-name">
                                ${cityName}
                                ${hasBase ? ' 🏢' : ''}
                            </div>
                            <div class="travel-cost" style="color: ${canAfford ? '#ff6666' : '#ff0000'};">
                                $${cost.toLocaleString()}
                            </div>
                        </div>
                        <div style="font-size: 12px; color: #aaa;">
                            Population: ${cityData.population}
                            ${!canAfford ? ' • Cannot afford' : ''}
                            ${this.state.get('heatLevel') >= 40 ? ' • Will reduce heat' : ''}
                            ${hasBase ? ' • You own a base here' : ''}
                        </div>
                    </div>
                `;
            }
        });
        
        return content;
    }
    
    onShow() {
        // Update heat display
        this.systems.heat.calculateHeatLevel();
    }
    
    confirmTravel(cityName, cost) {
        const currentCity = this.state.get('currentCity');
        const heatLevel = this.state.get('heatLevel');
        
        let message = `Travel to ${cityName} for $${cost.toLocaleString()}?`;
        
        if (heatLevel >= 40) {
            message += '<br><br>🌊 Traveling will reduce your heat level!';
        }
        
        if (this.state.hasBase(cityName)) {
            message += '<br><br>🏢 You have a base in this city.';
        }
        
        this.ui.modals.confirm(
            message,
            () => this.executeTravel(cityName, cost),
            null
        );
    }
    
    executeTravel(cityName, cost) {
        // Deduct cost
        this.state.updateCash(-cost);
        
        // Update location
        this.state.travelToCity(cityName);
        
        // Arrest/Busted logic
        const inventory = this.state.get('inventory');
        const totalDrugs = Object.values(inventory).reduce((a, b) => a + b, 0);
        const heat = this.state.get('heatLevel');
        console.log(`[TRAVEL DEBUG] Inventory:`, inventory);
        console.log(`[TRAVEL DEBUG] Total drugs: ${totalDrugs}`);
        console.log(`[TRAVEL DEBUG] Heat level: ${heat}`);
        let risk = 0;
        if (totalDrugs > 0) {
            risk += 2; // Drugs in inventory
            console.log(`[TRAVEL DEBUG] Added +2 risk for drugs`);
        }
        if (heat >= 40) {
            risk += 1; // High heat
            console.log(`[TRAVEL DEBUG] Added +1 risk for high heat`);
        }
        if (totalDrugs > 0 && heat >= 70) {
            risk += 2; // High heat + drugs
            console.log(`[TRAVEL DEBUG] Added +2 risk for high heat + drugs`);
        }
        // Traveling with drugs is highest risk
        if (totalDrugs > 0) {
            risk += 2;
            console.log(`[TRAVEL DEBUG] Added +2 risk for traveling with drugs`);
        }
        // Random chance based on risk
        const bustChance = risk * 0.08;
        const randomRoll = Math.random();
        console.log(`[TRAVEL DEBUG] Final risk: ${risk}, Bust chance: ${(bustChance * 100).toFixed(1)}%, Roll: ${(randomRoll * 100).toFixed(1)}%`);
        if (risk > 0 && randomRoll < bustChance) {
            console.log(`[TRAVEL DEBUG] BUSTED! Triggering arrest modal`);
            // Determine severity
            let severity = 'mild';
            if (risk >= 5) severity = 'severe';
            else if (risk >= 3) severity = 'medium';
            // Show arrest modal
            this.showArrestModal(severity, totalDrugs);
            return; // Stop further travel actions until resolved
        } else {
            console.log(`[TRAVEL DEBUG] Not busted, continuing travel`);
        }
        
        // Apply heat reduction
        this.systems.heat.applyTravelHeatReduction();
        
        // Trigger police raid and gang heat (now only on travel)
        this.systems.heat.checkPoliceRaid();
        this.systems.heat.generateGangHeat();
        
        // Log event
        this.ui.events.add(`✈️ Arrived in ${cityName} (Cost: $${cost.toLocaleString()})`, 'good');
        
        // Clear notifications from previous city
        const previousCity = this.state.get('currentCity');
        if (previousCity && previousCity !== cityName) {
            this.systems.assetDrop.clearCityNotifications(previousCity);
        }
        
        // Check for new drops in the city
        this.checkNewDropsInCity(cityName);
        
        // Go to home screen
        this.game.showScreen('home');
    }

    showArrestModal(severity, totalDrugs) {
        let title = '🚨 BUSTED!';
        let content = '';
        let onConfirm = null;
        let onCancel = null;
        
        if (severity === 'mild') {
            content = `<p>You were stopped by police, but a quick bribe will get you out of trouble.</p><p>Pay $1,000 to walk away?</p>`;
            onConfirm = () => {
                this.state.updateCash(-1000);
                this.state.updateWarrant(-5000);
                this.ui.events.add('Bribed police and walked away.', 'good');
                this.state.addNotification('Bribed police and walked away.', 'success');
                this.game.showScreen('home');
            };
            onCancel = () => {
                this.state.updateWarrant(2000);
                this.ui.events.add('Refused bribe - warrant increased.', 'bad');
                this.state.addNotification('Refused bribe - warrant increased.', 'error');
                this.game.showScreen('home');
            };
        } else if (severity === 'medium') {
            content = `<p>Police caught you with drugs! They confiscate all drugs on you (not in bases).</p><p>Continue?</p>`;
            onConfirm = () => {
                const inventory = this.state.get('inventory');
                Object.keys(inventory).forEach(drug => {
                    this.state.updateInventory(drug, -inventory[drug]);
                });
                this.state.updateWarrant(5000);
                this.ui.events.add('Police took all your drugs on you.', 'bad');
                this.state.addNotification('Police took all your drugs on you.', 'error');
                this.game.showScreen('home');
            };
            onCancel = () => {
                this.state.updateWarrant(3000);
                this.ui.events.add('Refused to cooperate - warrant increased.', 'bad');
                this.state.addNotification('Refused to cooperate - warrant increased.', 'error');
                this.game.showScreen('home');
            };
        } else if (severity === 'severe') {
            content = `<p>You were arrested! Police take all your drugs on you, all your cash, and you must pay $10,000 bail to get out.</p><p>If you don't have enough cash, you can gather cash from your bases or sell assets.</p>`;
            onConfirm = () => {
                // Take all drugs and cash
                const inventory = this.state.get('inventory');
                Object.keys(inventory).forEach(drug => {
                    this.state.updateInventory(drug, -inventory[drug]);
                });
                const cash = this.state.get('cash');
                this.state.updateCash(-cash);
                this.state.updateWarrant(10000);
                // Try to pay bail
                if (cash >= 10000) {
                    this.state.updateCash(-10000);
                    this.ui.events.add('Paid bail and released.', 'bad');
                    this.state.addNotification('Paid bail and released.', 'warning');
                    this.game.showScreen('home');
                } else {
                    // Not enough cash, prompt to gather from bases or sell assets
                    this.showBailOptions(10000 - cash);
                }
            };
            onCancel = () => {
                this.state.updateWarrant(5000);
                this.ui.events.add('Refused to pay bail - warrant increased.', 'bad');
                this.state.addNotification('Refused to pay bail - warrant increased.', 'error');
                this.game.showScreen('home');
            };
        }
        
        // Create a blocking arrest modal that won't be interfered with
        this.showBlockingArrestModal(title, content, onConfirm, onCancel);
    }
    
    showBlockingArrestModal(title, content, onConfirm, onCancel) {
        // Create modal element directly to avoid conflicts
        const modalElement = document.createElement('div');
        modalElement.className = 'modal-overlay';
        modalElement.style.cssText = 'position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0, 0, 0, 0.8); display: flex; justify-content: center; align-items: center; z-index: 10000; opacity: 0; transition: opacity 0.3s;';
        
        modalElement.innerHTML = `
            <div class="modal-content" style="background: #222; border: 2px solid #ff6666; border-radius: 10px; padding: 20px; max-width: 500px; width: 90%; text-align: center; position: relative;">
                <div class="modal-header" style="font-size: 20px; font-weight: bold; margin-bottom: 16px; display: flex; justify-content: space-between; align-items: center;">
                    <span class="modal-title">${title}</span>
                </div>
                <div class="modal-body">
                    ${content}
                </div>
                <div style="margin-top: 20px;">
                    <button id="arrestConfirmBtn" class="action-btn" style="margin: 0 10px; background: #ff6666;">Confirm</button>
                    <button id="arrestCancelBtn" class="action-btn" style="margin: 0 10px; background: #666;">Cancel</button>
                </div>
            </div>
        `;
        
        // Add event listeners
        const confirmBtn = modalElement.querySelector('#arrestConfirmBtn');
        const cancelBtn = modalElement.querySelector('#arrestCancelBtn');
        
        const closeModal = () => {
            modalElement.style.opacity = '0';
            setTimeout(() => {
                if (modalElement.parentNode) {
                    modalElement.parentNode.removeChild(modalElement);
                }
            }, 300);
        };
        
        confirmBtn.addEventListener('click', () => {
            closeModal();
            setTimeout(() => onConfirm(), 50);
        });
        
        cancelBtn.addEventListener('click', () => {
            closeModal();
            setTimeout(() => onCancel(), 50);
        });
        
        // Prevent closing by clicking outside
        modalElement.addEventListener('click', (e) => {
            if (e.target === modalElement) {
                // Don't close - this is a blocking modal
            }
        });
        
        // Add to DOM and fade in
        document.body.appendChild(modalElement);
        setTimeout(() => {
            modalElement.style.opacity = '1';
        }, 10);
    }

    showBailOptions(amountNeeded) {
        const title = '💸 Not Enough Cash for Bail';
        const content = `<p>You need $${amountNeeded.toLocaleString()} more to pay bail.</p><p>Gather cash from your bases or sell assets to raise the money.</p><p>Once you have enough, click Continue.</p>`;
        const onConfirm = () => {
            const cash = this.state.get('cash');
            if (cash >= amountNeeded) {
                this.state.updateCash(-amountNeeded);
                this.ui.events.add('Paid remaining bail and released.', 'bad');
                this.state.addNotification('Paid remaining bail and released.', 'warning');
                this.game.showScreen('home');
            } else {
                this.showBailOptions(amountNeeded);
            }
        };
        this.ui.modals.confirm(content, onConfirm, null);
    }
    
    checkNewDropsInCity(cityName) {
        // Check if there are any recent drops in the city (within last 10 minutes)
        const cityDrops = this.systems.assetDrop.getCityDrops(cityName);
        const recentDrops = cityDrops.filter(drop => {
            const timeSinceCreation = Date.now() - drop.createdAt;
            return timeSinceCreation < 10 * 60 * 1000; // 10 minutes
        });
        
        if (recentDrops.length > 0) {
            // Show consolidated popup for new drops
            setTimeout(() => {
                if (window.game && window.game.ui && window.game.ui.modals) {
                    const dropList = recentDrops.map(drop => 
                        `• ${drop.name} (${drop.remaining}/${drop.totalSupply} remaining)`
                    ).join('<br>');
                    
                    window.game.ui.modals.alert(
                        `🌟 Welcome to ${cityName}!<br><br>` +
                        `<strong>New exclusive items available:</strong><br>` +
                        `${dropList}<br><br>` +
                        `Check the Asset Store to purchase these limited items!`,
                        '🎉 New Drops Available!'
                    );
                }
            }, 500); // Small delay to ensure travel completes first
        }
        
        // Also check for any pending consolidated notifications
        if (this.systems.assetDrop.state.data.newDropsByCity && 
            this.systems.assetDrop.state.data.newDropsByCity[cityName] &&
            this.systems.assetDrop.state.data.newDropsByCity[cityName].length > 0) {
            setTimeout(() => {
                this.systems.assetDrop.showConsolidatedDropNotification(cityName);
            }, 1000); // Slightly longer delay to avoid conflicts
        }
    }
}