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
        
        // Safety check for cash value
        const safeCash = (cash !== undefined && cash !== null && !isNaN(cash)) ? cash : 0;
        
        return `
            <!-- Current Location -->
            <div style="background: #333; border: 1px solid #666; border-radius: 10px; padding: 15px; margin-bottom: 20px; text-align: center;">
                <div style="font-size: 12px; color: #aaa; margin-bottom: 5px;">📍 Current Location</div>
                <div style="font-size: 18px; font-weight: bold; color: #ffff00;">${currentCity}</div>
                <div style="font-size: 12px; color: #aaa;">Population: ${cityData.population}</div>
            </div>

            <!-- Cash and Flex Score Side by Side -->
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 20px;">
                <!-- Cash Card -->
                <div style="background: #222; border: 1px solid #666; border-radius: 10px; padding: 15px; text-align: center;">
                    <div style="font-size: 12px; color: #aaa; margin-bottom: 5px;">💰 Cash on Hand</div>
                    <div style="font-size: 20px; color: #66ff66; font-weight: bold;">$<span id="homeCash">${safeCash.toLocaleString()}</span></div>
                    <div style="font-size: 10px; color: #666; margin-top: 5px;">
                        Day <span id="homeDay">${day}</span> • 
                        <span id="dayCountdown" style="color: #66ff66;">60s</span>
                    </div>
                </div>
                
                <!-- Flex Score Card -->
                <div style="background: #222; border: 1px solid #666; border-radius: 10px; padding: 15px; text-align: center;">
                    <div style="font-size: 12px; color: #ff66ff; margin-bottom: 5px;">⭐ Flex Score</div>
                    <div style="font-size: 20px; font-weight: bold;" class="flex-score-display">
                        ${(window.game?.systems?.assets?.calculateFlexScore && window.game.systems.assets.calculateFlexScore()) || 0}
                    </div>
                    <div style="font-size: 10px; color: #aaa; margin-top: 5px;">
                        From jewelry, cars & property
                    </div>
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
                
                <div class="app-icon" onclick="console.log('Manage Bases clicked'); game.showScreen('bases');">
                    <div class="app-emoji">🏢</div>
                    <div class="app-name">Manage Bases</div>
                </div>
                
                <div class="app-icon" onclick="game.screens.home.showGangManagementModal()">
                    <div class="app-emoji">👥</div>
                    <div class="app-name">Manage Gang</div>
                </div>
                
                <div class="app-icon" onclick="game.showScreen('raid')">
                    <div class="app-emoji">⚔️</div>
                    <div class="app-name">Raid Bases</div>
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
                <div class="app-icon" id="assetsAppIcon">
                    <div class="app-emoji">💎</div>
                    <div class="app-name">Assets</div>
                </div>
                
                <div class="app-icon" onclick="game.screens.home.showRankingModal()">
                    <div class="app-emoji">🏆</div>
                    <div class="app-name">Ranking</div>
                </div>
                
                <div class="app-icon" onclick="game.screens.home.showAchievementsModal()">
                    <div class="app-emoji">🏅</div>
                    <div class="app-name">Achievements</div>
                </div>
                
                <div class="app-icon" onclick="game.screens.home.showSettingsModal()">
                    <div class="app-emoji">⚙️</div>
                    <div class="app-name">Settings</div>
                </div>
                
                <div class="app-icon" onclick="game.showScreen('mail')" id="mailAppIcon">
                    <div class="app-emoji">📧</div>
                    <div class="app-name">Mail</div>
                    <div id="unreadCount" style="font-size: 9px; color: #66ccff; font-weight: bold; margin-top: 2px;">
                        ${this.state.getUnreadNotifications().length} unread
                    </div>
                </div>
                

            </div>
        `;
    }
    
    onShow() {
        // Refresh heat display
        this.systems.heat.calculateHeatLevel();
        
        // Update unread count
        this.updateUnreadCount();
        
        // Attach event handler for Assets button
        const assetsBtn = document.getElementById('assetsAppIcon');
        if (assetsBtn) {
            assetsBtn.onclick = (event) => {
                event.preventDefault();
                event.stopPropagation();
                this.handleAssetsClick();
            };
        }
    }
    
    refresh() {
        // Update dynamic elements without full re-render
        const cashEl = document.getElementById('homeCash');
        const dayEl = document.getElementById('homeDay');
        
        const cash = this.state.get('cash');
        const safeCash = (cash !== undefined && cash !== null && !isNaN(cash)) ? cash : 0;
        
        if (cashEl) cashEl.textContent = safeCash.toLocaleString();
        if (dayEl) dayEl.textContent = this.state.get('day');
        
        // Update heat warning if needed
        const heatWarning = this.systems.heat.getHeatWarning();
        const warningCard = document.getElementById('heatWarningCard');
        
        if (heatWarning && !warningCard) {
            // Need to re-render to show warning
            this.game.showScreen('home');
        } else if (!heatWarning && warningCard) {
            // Remove warning
            warningCard.remove();
        }
    }
    
    // Modal: Quick Buy
    showQuickBuyModal() {
        const modal = this.ui.modals.create('🛒 Quick Buy Assets', this.renderQuickBuyContent());
        modal.show();
    }
    
    renderQuickBuyContent() {
        const gunCost = this.game.data.config.gunCost;
        const gangCost = this.calculateGangMemberCost();
        const cash = this.state.get('cash');
        const safeCash = (cash !== undefined && cash !== null && !isNaN(cash)) ? cash : 0;
        
        return `
            <div style="background: #222; border: 1px solid #666; border-radius: 10px; padding: 15px; margin-bottom: 20px; text-align: center;">
                <div style="font-size: 12px; color: #aaa; margin-bottom: 5px;">💰 Available Cash</div>
                <div style="font-size: 20px; color: #66ff66; font-weight: bold;">$${safeCash.toLocaleString()}</div>
            </div>
            
            <!-- Guns -->
            <div style="background: #222; border: 1px solid #444; border-radius: 10px; padding: 15px; margin-bottom: 15px;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                    <div style="font-weight: bold;">🔫 Guns</div>
                    <div style="color: #66ff66;">$${gunCost.toLocaleString()} each</div>
                </div>
                <div style="font-size: 11px; color: #aaa; margin-bottom: 10px;">
                    You have: ${this.state.get('guns')} guns
                </div>
                <div style="display: grid; grid-template-columns: 1fr auto; gap: 8px;">
                    <input type="number" id="quickBuyGuns" value="1" min="1" max="100" class="quantity-input">
                    <button onclick="game.screens.home.quickBuyGuns()" class="action-btn">Buy</button>
                </div>
            </div>
            
            <!-- Gang Members -->
            <div style="background: #222; border: 1px solid #444; border-radius: 10px; padding: 15px; margin-bottom: 15px;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                    <div style="font-weight: bold;">👥 Gang Members</div>
                    <div style="color: #66ff66;">$${gangCost.toLocaleString()} each</div>
                </div>
                <div style="font-size: 11px; color: #aaa; margin-bottom: 10px;">
                    You have: ${this.state.get('gangSize')} members
                </div>
                <div style="display: grid; grid-template-columns: 1fr auto; gap: 8px;">
                    <input type="number" id="quickBuyGang" value="1" min="1" max="50" class="quantity-input">
                    <button onclick="game.screens.home.quickBuyGang()" class="action-btn">Buy</button>
                </div>
            </div>
            

        `;
    }
    
    quickBuyGuns() {
        const quantity = parseInt(document.getElementById('quickBuyGuns').value) || 0;
        const cost = quantity * this.game.data.config.gunCost;
        const currentCity = this.state.get('currentCity');
        
        console.log('quickBuyGuns called:', { quantity, cost, currentCity });
        
        if (quantity <= 0) {
            console.log('Quantity is 0 or invalid, returning');
            return;
        }
        
        // Check if we can afford it first
        if (!this.state.canAfford(cost)) {
            this.ui.modals.alert('Not enough cash for this purchase!', 'Purchase Failed');
            return;
        }
        
        // Use a simple confirmation with alert instead of modal
        const confirmed = confirm(`Buy ${quantity} guns in ${currentCity} for $${cost.toLocaleString()}?`);
        
        if (confirmed) {
            console.log('Gun purchase confirmed!');
            this.state.updateCash(-cost);
            this.state.addGunsToCity(currentCity, quantity);
            this.ui.events.add(`Purchased ${quantity} guns in ${currentCity} for $${cost.toLocaleString()}`, 'good');
            this.refreshQuickBuyModal();
            console.log('Gun purchase completed successfully');
        } else {
            console.log('Gun purchase cancelled');
        }
    }
    
    quickBuyGang() {
        const quantity = parseInt(document.getElementById('quickBuyGang').value) || 0;
        const costPer = this.calculateGangMemberCost();
        const cost = quantity * costPer;
        const heat = quantity * this.game.data.config.gangRecruitHeat;
        const currentCity = this.state.get('currentCity');
        
        console.log('quickBuyGang called:', { quantity, costPer, cost, heat, currentCity });
        
        if (quantity <= 0) {
            console.log('Quantity is 0 or invalid, returning');
            return;
        }
        
        // Check if we can afford it first
        if (!this.state.canAfford(cost)) {
            this.ui.modals.alert('Not enough cash for this purchase!', 'Purchase Failed');
            return;
        }
        
        // Use a simple confirmation with alert instead of modal
        const confirmed = confirm(`Recruit ${quantity} gang members in ${currentCity} for $${cost.toLocaleString()}?\n\nHeat will increase by ${heat.toLocaleString()}`);
        
        if (confirmed) {
            console.log('Gang member purchase confirmed!');
            this.state.updateCash(-cost);
            this.state.addGangMembers(currentCity, quantity);
            this.state.updateWarrant(heat);
            this.ui.events.add(`Recruited ${quantity} gang members in ${currentCity} for $${cost.toLocaleString()}`, 'good');
            this.ui.events.add(`Gang recruitment increased heat by ${heat.toLocaleString()}`, 'bad');
            this.refreshQuickBuyModal();
            console.log('Gang member purchase completed successfully');
        } else {
            console.log('Gang member purchase cancelled');
        }
    }
    
    refreshQuickBuyModal() {
        // Check if we're currently showing the Quick Buy modal
        if (this.ui.modals.activeModal && this.ui.modals.activeModal.title === '🛒 Quick Buy Assets') {
            // Update just the modal body content
            const modalBody = document.querySelector('.modal-body');
            if (modalBody) {
                modalBody.innerHTML = this.renderQuickBuyContent();
            }
        }
    }
    

    
    calculateGangMemberCost() {
        const baseCost = this.game.data.config.baseGangCost || 10000;
        const currentCity = this.state.get('currentCity');
        const cityData = this.game.data.cities[currentCity];
        const cityModifier = cityData?.heatModifier || 1.0;
        const gangSize = this.state.get('gangSize') || 0;
        const gangCostScaling = this.game.data.config.gangCostScaling || 0.1;
        const gangModifier = 1 + (gangSize * gangCostScaling);
        
        const cost = Math.floor(baseCost * cityModifier * gangModifier);
        
        // Cap the price at 40,000
        const cappedCost = Math.min(cost, 40000);
        
        // Debug logging
        console.log('Home screen gang cost calculation:', {
            baseCost,
            currentCity,
            cityModifier,
            gangSize,
            gangCostScaling,
            gangModifier,
            calculatedCost: cost,
            cappedCost: cappedCost
        });
        
        return cappedCost;
    }
    
    // Modal: Bribery
    showBriberyModal() {
        const bribery = this.systems.heat.calculateBriberyCost();
        
        const content = `
            <div style="text-align: center; padding: 30px;">
                <p style="margin: 15px 0;">Pay bribes to reduce your heat level?</p>
                
                <div style="background: #222; padding: 15px; margin: 15px 0; border-radius: 5px;">
                    <div>Current Warrant: <span style="color: #ff6666;">$${this.state.get('warrant').toLocaleString()}</span></div>
                    <div>Bribery Cost: <span style="color: #ff6600;">$${bribery.cost.toLocaleString()}</span></div>
                    <div>Warrant Reduction: <span style="color: #66ff66;">-$${bribery.reduction.toLocaleString()}</span></div>
                </div>
                
                <button onclick="game.screens.home.executeBribery()" class="action-btn bribe" style="margin: 10px;">
                    💰 Pay Bribes
                </button>
                <button onclick="game.ui.modals.close()" class="action-btn" style="background: #ff6666; margin: 10px;">
                    Cancel
                </button>
            </div>
        `;
        
        const modal = this.ui.modals.create('💰 Corrupt Officials', content);
        modal.show();
    }
    
    executeBribery() {
        const bribery = this.systems.heat.calculateBriberyCost();
        const result = this.systems.heat.processBribery(bribery.cost, bribery.reduction);
        if (result.success) {
            this.ui.modals.close();
            this.refresh();
        } else if (result.error) {
            this.ui.modals.alert(result.error, 'Bribery Failed');
        }
    }
    
    // Modal: Ranking
    showRankingModal() {
        const modal = this.ui.modals.create('🏆 Player Ranking', this.renderRankingContent());
        modal.show();
    }
    
    renderRankingContent() {
        const netWorth = this.state.calculateNetWorth();
        const currentRankId = this.getCurrentRank();
        const currentRank = this.game.data.playerRanks[currentRankId];
        const nextRank = currentRankId < 7 ? this.game.data.playerRanks[currentRankId + 1] : null;
        const assetCount = (window.game?.systems?.assets?.getOwnedAssetCount && window.game.systems.assets.getOwnedAssetCount()) || 0;
        
        return `
            <div style="text-align: center; padding: 20px;">
                <div style="font-size: 48px; margin-bottom: 10px;">${currentRank.emoji}</div>
                <div style="font-size: 20px; color: ${currentRank.color}; font-weight: bold;">${currentRank.name}</div>
                <div style="font-size: 12px; color: #aaa; margin-bottom: 20px;">Rank ${currentRankId} of 7</div>
                
                <div style="background: #222; padding: 15px; border-radius: 10px; margin-bottom: 20px;">
                    <div style="font-size: 14px; color: #ffff00; margin-bottom: 10px;">📊 Current Stats</div>
                    <div style="text-align: left; font-size: 12px;">
                        💰 Net Worth: $${netWorth.toLocaleString()}<br>
                        💎 Asset Value: $${(this.systems.assets?.getTotalAssetValue && this.systems.assets.getTotalAssetValue()) || 0}<br>
                        🏢 Bases: ${Object.keys(this.state.data.bases).length}<br>
                        👥 Gang: ${this.state.get('gangSize')}<br>
                        🔫 Guns: ${this.state.get('guns')}<br>
                        💎 Assets Owned: ${assetCount}
                    </div>
                </div>
                
                ${nextRank ? `
                    <div style="background: #1a1a1a; padding: 15px; border-radius: 10px;">
                        <div style="font-size: 14px; color: #aaa; margin-bottom: 10px;">
                            🎯 Next: ${nextRank.emoji} ${nextRank.name}
                        </div>
                        <div style="text-align: left; font-size: 11px; color: #aaa;">
                            Need:<br>
                            💰 $${nextRank.minNetWorth.toLocaleString()} net worth<br>
                            🏢 ${nextRank.minBases} bases<br>
                            👥 ${nextRank.minGang} gang members<br>
                            ${nextRank.minAssets > 0 ? `💎 ${nextRank.minAssets} assets<br>` : ''}
                        </div>
                    </div>
                ` : `
                    <div style="background: linear-gradient(45deg, #ffaa00, #ff6600); 
                                padding: 15px; border-radius: 10px; color: #000;">
                        <div style="font-size: 16px; font-weight: bold;">🏆 MAXIMUM RANK!</div>
                        <div style="font-size: 12px;">You rule the criminal underworld!</div>
                    </div>
                `}
            </div>
        `;
    }
    
    getCurrentRank() {
        const netWorth = this.state.calculateNetWorth();
        const basesOwned = Object.keys(this.state.data.bases).length;
        const gangSize = this.state.get('gangSize');
        const assetCount = (window.game?.systems?.assets?.getOwnedAssetCount && window.game.systems.assets.getOwnedAssetCount()) || 0;
        
        let currentRank = 1;
        for (let rankId = 7; rankId >= 1; rankId--) {
            const rank = this.game.data.playerRanks[rankId];
            if (netWorth >= rank.minNetWorth && 
                basesOwned >= rank.minBases && 
                gangSize >= rank.minGang &&
                assetCount >= rank.minAssets) {
                currentRank = rankId;
                break;
            }
        }
        
        return currentRank;
    }

    showSettingsModal() {
        const content = `
            <div style="text-align: center; padding: 30px;">
                <div style="font-size: 20px; font-weight: bold; margin-bottom: 20px;">Settings</div>
                <button onclick="game.screens.home.confirmRestartGame()" class="action-btn" style="width: 100%; margin-bottom: 15px; background: #ff6666;">🔄 Restart Game</button>
                <button onclick="game.ui.modals.close()" class="action-btn" style="width: 100%;">Close</button>
            </div>
        `;
        const modal = this.ui.modals.create('⚙️ Settings', content);
        modal.show();
    }

    confirmRestartGame() {
        this.ui.modals.confirm(
            'Are you sure you want to restart the game? This will erase your current progress.',
            () => {
                console.log('Restart callback this:', this);
                this.ui.modals.close();
                this.confirmNewGame();
            },
            null
        );
    }

    confirmNewGame() {
        // Clear saved game and reload the page for a true fresh start
        localStorage.removeItem('slangBangSave');
        if (window.gameSaveData) {
            window.gameSaveData = null;
        }
        location.reload();
    }

    handleAssetsClick() {
        const isAssetsUnlocked = this.systems.assets.isUnlocked();
        const isJewelryUnlocked = this.systems.assets.isJewelryUnlocked();
        
        if (isAssetsUnlocked || isJewelryUnlocked) {
            this.game.showScreen('assets');
        } else {
            this.ui.modals.alert('You need to be Rank 4 (District Chief) to access the Asset Store. Keep building your empire!');
            return;
        }
    }
    
    showAchievementsModal() {
        const modal = this.ui.modals.create('🏅 Achievements', this.renderAchievementsContent());
        modal.show();
    }
    
    renderAchievementsContent() {
        const achievements = this.state.getAchievements();
        const progress = achievements.progress;
        const unlocked = achievements.unlocked;
        
        const allAchievements = [
            { id: 'firstBase', name: '🏠 First Base', description: 'Purchase your first base', icon: '🏠' },
            { id: 'firstRaid', name: '⚔️ First Raid', description: 'Conduct your first raid', icon: '⚔️' },
            { id: 'firstAsset', name: '💎 First Asset', description: 'Purchase your first asset', icon: '💎' },
            { id: 'millionaire', name: '💰 Millionaire', description: 'Reach $1M net worth', icon: '💰' },
            { id: 'drugLord', name: '💎 Drug Lord', description: 'Reach $5M net worth', icon: '💎' },
            { id: 'cartelBoss', name: '🏆 Cartel Boss', description: 'Reach $10M net worth', icon: '🏆' },
            { id: 'raidMaster', name: '⚔️ Raid Master', description: 'Successfully complete 50 raids', icon: '⚔️' },
            { id: 'empireBuilder', name: '🏢 Empire Builder', description: 'Own 10 bases', icon: '🏢' },
            { id: 'assetCollector', name: '💎 Asset Collector', description: 'Own 20 assets', icon: '💎' },
            { id: 'survivor', name: '🕊️ Survivor', description: 'Survive 100 days', icon: '🕊️' },
            { id: 'heatMaster', name: '🔥 Heat Master', description: 'Survive with 50K+ warrant', icon: '🔥' },
            { id: 'traveler', name: '✈️ Traveler', description: 'Visit 8 different cities', icon: '✈️' }
        ];
        
        let content = `
            <div style="text-align: center; padding: 20px;">
                <div style="font-size: 18px; color: #ffff00; margin-bottom: 20px;">
                    🏅 Achievement Progress
                </div>
                <div style="font-size: 12px; color: #aaa; margin-bottom: 20px;">
                    ${unlocked.length} of ${allAchievements.length} achievements unlocked
                </div>
        `;
        
        // Filter to only show unlocked achievements
        const unlockedAchievements = allAchievements.filter(achievement => unlocked.includes(achievement.id));
        
        if (unlockedAchievements.length === 0) {
            content += `
                <div style="background: #1a1a1a; border: 1px solid #666; border-radius: 8px; 
                            padding: 40px 20px; text-align: center; margin-bottom: 10px;">
                    <div style="font-size: 48px; margin-bottom: 15px;">🏅</div>
                    <div style="font-size: 16px; color: #aaa; margin-bottom: 10px;">
                        No achievements unlocked yet
                    </div>
                    <div style="font-size: 12px; color: #666;">
                        Keep playing to unlock achievements!
                    </div>
                </div>
            `;
        } else {
            unlockedAchievements.forEach(achievement => {
                content += `
                    <div style="background: #1a3a1a; border: 1px solid #66ff66; 
                                border-radius: 8px; padding: 12px; margin-bottom: 10px;">
                        <div style="display: flex; align-items: center; justify-content: space-between;">
                            <div style="text-align: left;">
                                <div style="font-size: 14px; color: #66ff66; font-weight: bold;">
                                    ${achievement.icon} ${achievement.name}
                                </div>
                                <div style="font-size: 11px; color: #aaa;">
                                    ${achievement.description}
                                </div>
                            </div>
                            <div style="text-align: right;">
                                <div style="color: #66ff66; font-size: 12px;">✓ UNLOCKED</div>
                            </div>
                        </div>
                    </div>
                `;
            });
        }
        
        content += `
                <div style="background: #222; padding: 15px; border-radius: 10px; margin-top: 20px;">
                    <div style="font-size: 14px; color: #ffff00; margin-bottom: 10px;">📊 Current Stats</div>
                    <div style="text-align: left; font-size: 11px; color: #aaa;">
                        Total Raids: ${progress.totalRaids || 0}<br>
                        Successful Raids: ${progress.successfulRaids || 0}<br>
                        Total Earnings: $${(progress.totalEarnings || 0).toLocaleString()}<br>
                        Bases Owned: ${progress.basesOwned || 0}<br>
                        Assets Owned: ${progress.assetsOwned || 0}<br>
                        Days Survived: ${progress.daysSurvived || 0}<br>
                        Cities Visited: ${progress.citiesVisited || 0}<br>
                        Max Net Worth: $${(progress.maxNetWorth || 0).toLocaleString()}<br>
                        Max Heat Survived: ${(progress.maxHeatSurvived || 0).toLocaleString()}
                    </div>
                </div>
            </div>
        `;
        
        return content;
    }
    
    updateUnreadCount() {
        const unreadCountEl = document.getElementById('unreadCount');
        if (unreadCountEl) {
            const unreadCount = this.state.getUnreadNotifications().length;
            unreadCountEl.textContent = `${unreadCount} unread`;
            unreadCountEl.style.color = unreadCount > 0 ? '#66ccff' : '#666';
            
            // Also update the mail app icon styling if there are unread notifications
            const mailAppIcon = document.getElementById('mailAppIcon');
            if (mailAppIcon) {
                if (unreadCount > 0) {
                    mailAppIcon.style.borderColor = '#66ccff';
                    mailAppIcon.style.boxShadow = '0 0 10px rgba(102, 204, 255, 0.3)';
                } else {
                    mailAppIcon.style.borderColor = '#666';
                    mailAppIcon.style.boxShadow = 'none';
                }
            }
        }
    }
    
    // Gang Management Modal
    showGangManagementModal() {
        const modal = this.ui.modals.create('👥 Gang Management', this.renderGangManagementContent());
        modal.show();
    }
    
    renderGangManagementContent() {
        const gangMembers = this.state.data.gangMembers || {};
        const gunsByCity = this.state.data.gunsByCity || {};
        const citiesWithGang = Object.keys(gangMembers).filter(city => gangMembers[city] > 0);
        const citiesWithGuns = Object.keys(gunsByCity).filter(city => gunsByCity[city] > 0);
        const allCities = Object.keys(this.game.data.cities);
        
        console.log('Gang management data:', {
            gangMembers,
            citiesWithGang,
            currentCity: this.state.get('currentCity')
        });
        
        let content = `
            <div style="text-align: right; margin-bottom: 15px;">
                <button onclick="game.ui.modals.close()" class="action-btn" style="padding: 5px 10px; font-size: 11px; background: #666;">
                    ✕ Close
                </button>
            </div>
            
            <div style="background: #333; border: 1px solid #666; border-radius: 10px; 
                        padding: 15px; margin-bottom: 20px;">
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
            
            <div style="background: #333; border: 1px solid #666; border-radius: 10px; 
                        padding: 15px; margin-bottom: 20px;">
                <div style="font-size: 14px; color: #ffff00; margin-bottom: 15px; text-align: center;">
                    🔫 Guns by City
                </div>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
                    ${citiesWithGuns.map(city => {
                        const totalInCity = gunsByCity[city];
                        const availableInCity = this.state.getAvailableGunsInCity(city);
                        const assignedInCity = totalInCity - availableInCity;
                        
                        return `
                            <div style="background: #1a1a1a; padding: 10px; border-radius: 5px;">
                                <div style="font-size: 12px; color: #aaa; margin-bottom: 5px;">${city}</div>
                                <div style="font-size: 14px; color: #66ff66; font-weight: bold;">
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
        
        if (citiesWithGang.length > 1) {
            content += `
                <div style="background: #222; border: 1px solid #444; border-radius: 10px; 
                            padding: 15px; margin-bottom: 20px;">
                    <div style="font-size: 14px; color: #ffff00; margin-bottom: 15px; text-align: center;">
                        🔄 Transfer Gang Members
                    </div>
                    <div style="font-size: 12px; color: #aaa; margin-bottom: 10px;">
                        Transfer gang members between cities for a fee
                    </div>
                    <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 8px; margin-bottom: 10px;">
                        <select id="transferFromCity" style="background: #333; color: #fff; border: 1px solid #666; padding: 5px; border-radius: 3px;">
                            ${citiesWithGang.map(city => 
                                `<option value="${city}">${city} (${this.state.getAvailableGangMembersInCity(city)} available)</option>`
                            ).join('')}
                        </select>
                        <select id="transferToCity" style="background: #333; color: #fff; border: 1px solid #666; padding: 5px; border-radius: 3px;">
                            ${allCities.map(city => 
                                `<option value="${city}">${city}</option>`
                            ).join('')}
                        </select>
                        <input type="number" id="transferAmount" value="1" min="1" max="10" 
                               style="background: #333; color: #fff; border: 1px solid #666; padding: 5px; border-radius: 3px; text-align: center;">
                    </div>
                    <button onclick="game.screens.home.transferGangMembers()" class="action-btn" style="width: 100%;">
                        🔄 Transfer Gang Members
                    </button>
                </div>
            `;
        }
        
        if (citiesWithGuns.length > 1) {
            content += `
                <div style="background: #222; border: 1px solid #444; border-radius: 10px; 
                            padding: 15px; margin-bottom: 20px;">
                    <div style="font-size: 14px; color: #ffff00; margin-bottom: 15px; text-align: center;">
                        🔄 Transfer Guns
                    </div>
                    <div style="font-size: 12px; color: #aaa; margin-bottom: 10px;">
                        Transfer guns between cities for a fee
                    </div>
                    <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 8px; margin-bottom: 10px;">
                        <select id="transferGunsFromCity" style="background: #333; color: #fff; border: 1px solid #666; padding: 5px; border-radius: 3px;">
                            ${citiesWithGuns.map(city => 
                                `<option value="${city}">${city} (${this.state.getAvailableGunsInCity(city)} available)</option>`
                            ).join('')}
                        </select>
                        <select id="transferGunsToCity" style="background: #333; color: #fff; border: 1px solid #666; padding: 5px; border-radius: 3px;">
                            ${allCities.map(city => 
                                `<option value="${city}">${city}</option>`
                            ).join('')}
                        </select>
                        <input type="number" id="transferGunsAmount" value="1" min="1" max="10" 
                               style="background: #333; color: #fff; border: 1px solid #666; padding: 5px; border-radius: 3px; text-align: center;">
                    </div>
                    <button onclick="game.screens.home.transferGuns()" class="action-btn" style="width: 100%;">
                        🔄 Transfer Guns
                    </button>
                </div>
            `;
        }
        
        if (citiesWithGang.length === 0) {
            content = `
                <div style="background: #222; border: 1px solid #444; border-radius: 10px; 
                            padding: 30px; text-align: center;">
                    <div style="font-size: 48px; margin-bottom: 15px;">👤</div>
                    <div style="font-size: 16px; color: #aaa; margin-bottom: 10px;">
                        No gang members yet
                    </div>
                    <div style="font-size: 12px; color: #666; margin-bottom: 20px;">
                        Recruit gang members in different cities to manage them here
                    </div>
                </div>
            `;
        }
        
        return content;
    }
    
    transferGangMembers() {
        console.log('transferGangMembers called');
        const fromCity = document.getElementById('transferFromCity').value;
        const toCity = document.getElementById('transferToCity').value;
        const amount = parseInt(document.getElementById('transferAmount').value) || 0;
        
        console.log('Transfer params:', { fromCity, toCity, amount });
        
        if (fromCity === toCity) {
            this.ui.modals.alert('Cannot transfer to the same city', 'Transfer Failed');
            return;
        }
        
        if (amount <= 0) {
            this.ui.modals.alert('Please enter a valid amount', 'Transfer Failed');
            return;
        }
        
        const availableInCity = this.state.getAvailableGangMembersInCity(fromCity);
        console.log('Available gang members in', fromCity, ':', availableInCity);
        
        if (availableInCity < amount) {
            this.ui.modals.alert(`Not enough available gang members in ${fromCity}. You have ${availableInCity} available.`, 'Transfer Failed');
            return;
        }
        
        // Calculate transfer cost using improved formula
        const transferCost = this.calculateTransferCost(fromCity, toCity, amount);
        console.log('Transfer cost:', transferCost);
        
        if (!this.state.canAfford(transferCost)) {
            this.ui.modals.alert(`Not enough cash for transfer. Need $${transferCost.toLocaleString()}`, 'Transfer Failed');
            return;
        }
        
        // Show detailed confirmation popup
        this.ui.modals.confirm(
            `Transfer ${amount} gang members from ${fromCity} to ${toCity}?<br><br>` +
            `<strong>Cost:</strong> $${transferCost.toLocaleString()}<br>` +
            `<strong>Distance:</strong> ${Math.abs(this.game.data.cities[fromCity].distanceIndex - this.game.data.cities[toCity].distanceIndex)} units<br>` +
            `<strong>Available in ${fromCity}:</strong> ${availableInCity} members<br><br>` +
            `This action cannot be undone.`,
            () => {
                console.log('Transfer confirmed');
                // Remove from source city
                this.state.removeGangMembersFromCity(fromCity, amount);
                // Add to destination city
                this.state.addGangMembers(toCity, amount);
                // Pay transfer cost
                this.state.updateCash(-transferCost);
                
                this.ui.events.add(`Transferred ${amount} gang members from ${fromCity} to ${toCity} for $${transferCost.toLocaleString()}`, 'good');
                this.ui.modals.close();
                this.showGangManagementModal(); // Refresh the modal
            },
            null
        );
    }
    
    calculateTransferCost(fromCity, toCity, amount) {
        // Base transfer cost per member
        const baseTransferCost = this.game.data.config.baseGangCost * 0.3; // 30% of recruitment cost
        
        // Distance multiplier based on city distance
        const fromDistance = this.game.data.cities[fromCity]?.distanceIndex || 0;
        const toDistance = this.game.data.cities[toCity]?.distanceIndex || 0;
        const distance = Math.abs(fromDistance - toDistance);
        const distanceMultiplier = 1 + (distance * 0.1); // 10% more per distance unit
        
        // Heat modifier (higher heat cities cost more to transfer to)
        const toCityHeat = this.game.data.cities[toCity]?.heatModifier || 1.0;
        const heatMultiplier = 1 + (toCityHeat - 1) * 0.5; // 50% of heat modifier
        
        const totalCost = Math.floor(baseTransferCost * amount * distanceMultiplier * heatMultiplier);
        
        return totalCost;
    }
    
    transferGuns() {
        const fromCity = document.getElementById('transferGunsFromCity').value;
        const toCity = document.getElementById('transferGunsToCity').value;
        const amount = parseInt(document.getElementById('transferGunsAmount').value) || 0;
        
        if (fromCity === toCity) {
            this.ui.modals.alert('Cannot transfer to the same city', 'Transfer Failed');
            return;
        }
        
        if (amount <= 0) {
            this.ui.modals.alert('Please enter a valid amount', 'Transfer Failed');
            return;
        }
        
        const availableInCity = this.state.getAvailableGunsInCity(fromCity);
        if (availableInCity < amount) {
            this.ui.modals.alert(`Not enough available guns in ${fromCity}. You have ${availableInCity} available.`, 'Transfer Failed');
            return;
        }
        
        // Calculate transfer cost (base cost per gun)
        const transferCost = amount * this.game.data.config.gunCost * 0.5; // 50% of purchase cost
        
        this.ui.modals.confirm(
            `Transfer ${amount} guns from ${fromCity} to ${toCity} for $${transferCost.toLocaleString()}?`,
            () => {
                if (this.state.canAfford(transferCost)) {
                    // Remove from source city
                    this.state.removeGunsFromCity(fromCity, amount);
                    // Add to destination city
                    this.state.addGunsToCity(toCity, amount);
                    // Pay transfer cost
                    this.state.updateCash(-transferCost);
                    
                    this.ui.events.add(`Transferred ${amount} guns from ${fromCity} to ${toCity} for $${transferCost.toLocaleString()}`, 'good');
                    this.ui.modals.close();
                    this.showGangManagementModal(); // Refresh the modal
                } else {
                    this.ui.modals.alert(`Not enough cash for transfer. Need $${transferCost.toLocaleString()}`, 'Transfer Failed');
                }
            },
            null
        );
    }
}