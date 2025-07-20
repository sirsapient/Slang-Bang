// js/screens/assets.js - Assets screen component
export class AssetsScreen {
    constructor(game) {
        this.game = game;
        this.state = game.state;
        this.ui = game.ui;
        this.systems = game.systems;
        this.activeTab = 'exclusive'; // Default tab - show exclusive drops first
    }
    
    render() {
        const isAssetsUnlocked = this.systems.assets.isUnlocked();
        const isJewelryUnlocked = this.systems.assets.isJewelryUnlocked();
        
        // If nothing is unlocked, show locked screen
        if (!isAssetsUnlocked && !isJewelryUnlocked) {
            return `
                <div class="screen-header">
                    <button class="back-button" onclick="game.showScreen('home')">← Back</button>
                    <h3>💎 Asset Store</h3>
                    <div style="font-size: 12px; color: #aaa;">Locked</div>
                </div>
                <div style="background: #222; border: 2px solid #ff6666; border-radius: 10px; padding: 40px 20px; text-align: center; margin-top: 50px;">
                    <div style="font-size: 48px; margin-bottom: 20px;">🔒</div>
                    <div style="font-size: 18px; color: #ff6666; font-weight: bold; margin-bottom: 10px;">Asset Store Locked</div>
                    <div style="font-size: 14px; color: #aaa; margin-bottom: 20px;">Assets unlock at Rank 4 (District Chief)</div>
                    <button onclick="game.showScreen('home')" class="action-btn" style="margin-top: 30px; padding: 12px 24px;">Continue Building Empire</button>
                </div>
            `;
        }
        
        const summary = this.systems.assets.getAssetSummary();
        const cash = this.state.get('cash');
        
        return `
            <div class="screen-header">
                <button class="back-button" onclick="game.showScreen('home')">← Back</button>
                <h3>💎 Asset Store</h3>
                <div style="font-size: 12px; color: #aaa;">Build Your Empire</div>
            </div>
            
            <!-- Asset Summary -->
            <div style="background: #333; border: 2px solid #ffaa00; border-radius: 10px; 
                        padding: 15px; margin-bottom: 20px;">
                <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; text-align: center;">
                    <div>
                        <div style="font-size: 12px; color: #aaa; margin-bottom: 5px;">💰 Cash</div>
                        <div style="font-size: 16px; color: #66ff66; font-weight: bold;">
                            $${cash.toLocaleString()}
                        </div>
                    </div>
                    <div>
                        <div style="font-size: 12px; color: #aaa; margin-bottom: 5px;">💎 Asset Value</div>
                        <div style="font-size: 16px; color: #ffaa00; font-weight: bold;">
                            $${summary.totalValue.toLocaleString()}
                        </div>
                    </div>
                    <div>
                        <div style="font-size: 12px; color: #aaa; margin-bottom: 5px;">⭐ Flex Score</div>
                        <div style="font-size: 16px; color: #ff66ff; font-weight: bold;">
                            ${summary.flexScore}
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Tab Navigation -->
            <div style="display: grid; grid-template-columns: repeat(${this.getAvailableTabCount()}, 1fr); gap: 8px; margin-bottom: 20px;">
                ${isAssetsUnlocked ? `
                    <button onclick="game.screens.assets.switchTab('exclusive')" 
                            class="tab-btn ${this.activeTab === 'exclusive' ? 'active' : ''}"
                            style="padding: 10px; border-radius: 8px; font-size: 12px;">
                        🌟 Exclusive
                    </button>
                ` : ''}
                ${isJewelryUnlocked ? `
                    <button onclick="game.screens.assets.switchTab('jewelry')" 
                            class="tab-btn ${this.activeTab === 'jewelry' ? 'active' : ''}"
                            style="padding: 10px; border-radius: 8px; font-size: 12px;">
                        💍 Jewelry
                    </button>
                ` : ''}
                ${isAssetsUnlocked ? `
                    <button onclick="game.screens.assets.switchTab('cars')" 
                            class="tab-btn ${this.activeTab === 'cars' ? 'active' : ''}"
                            style="padding: 10px; border-radius: 8px; font-size: 12px;">
                        🚗 Cars
                    </button>
                    <button onclick="game.screens.assets.switchTab('property')" 
                            class="tab-btn ${this.activeTab === 'property' ? 'active' : ''}"
                            style="padding: 10px; border-radius: 8px; font-size: 12px;">
                        🏠 Property
                    </button>
                ` : ''}
                <button onclick="game.screens.assets.switchTab('owned')" 
                        class="tab-btn ${this.activeTab === 'owned' ? 'active' : ''}"
                        style="padding: 10px; border-radius: 8px; font-size: 12px;">
                    📦 Owned
                </button>
            </div>
            
            <!-- Tab Content -->
            <div id="assetTabContent">
                ${this.renderTabContent()}
            </div>
        `;
    }
    
    renderLockedScreen() {
        const currentRankId = this.systems.assets.getCurrentPlayerRank();
        const currentRank = this.game.data.playerRanks[currentRankId];
        const requiredRank = this.game.data.playerRanks[4];
        
        return `
            <div class="screen-header">
                <button class="back-button" onclick="game.showScreen('home')">← Back</button>
                <h3>💎 Asset Store</h3>
                <div style="font-size: 12px; color: #aaa;">Locked</div>
            </div>
            
            <div style="background: #222; border: 2px solid #ff6666; border-radius: 10px; 
                        padding: 40px 20px; text-align: center; margin-top: 50px;">
                <div style="font-size: 48px; margin-bottom: 20px;">🔒</div>
                <div style="font-size: 18px; color: #ff6666; font-weight: bold; margin-bottom: 10px;">
                    Asset Store Locked
                </div>
                <div style="font-size: 14px; color: #aaa; margin-bottom: 20px;">
                    Assets unlock at Rank 4 (District Chief)
                </div>
                
                <div style="background: #333; padding: 15px; border-radius: 8px; margin: 20px 0;">
                    <div style="font-size: 12px; color: #aaa; margin-bottom: 5px;">Current Rank</div>
                    <div style="color: ${currentRank.color}; font-size: 16px; font-weight: bold;">
                        ${currentRank.emoji} ${currentRank.name}
                    </div>
                </div>
                
                <div style="font-size: 12px; color: #aaa; margin-top: 20px;">
                    Requirements for District Chief:<br>
                    💰 $${requiredRank.minNetWorth.toLocaleString()} net worth<br>
                    🏢 ${requiredRank.minBases} bases<br>
                    👥 ${requiredRank.minGang} gang members
                </div>
                
                <button onclick="game.showScreen('home')" class="action-btn" 
                        style="margin-top: 30px; padding: 12px 24px;">
                    Continue Building Empire
                </button>
            </div>
        `;
    }
    
    renderTabContent() {
        const isAssetsUnlocked = this.systems.assets.isUnlocked();
        const isJewelryUnlocked = this.systems.assets.isJewelryUnlocked();
        
        switch (this.activeTab) {
            case 'exclusive':
                if (!isAssetsUnlocked) {
                    return this.renderLockedTab('Exclusive items unlock at Rank 4');
                }
                return this.renderExclusiveTab();
            case 'jewelry':
                if (!isJewelryUnlocked) {
                    return this.renderLockedTab('Jewelry store is not available');
                }
                return this.renderJewelryTab();
            case 'cars':
                if (!isAssetsUnlocked) {
                    return this.renderLockedTab('Cars unlock at Rank 4');
                }
                return this.renderCarsTab();
            case 'property':
                if (!isAssetsUnlocked) {
                    return this.renderLockedTab('Properties unlock at Rank 4');
                }
                return this.renderPropertyTab();
            case 'owned':
                return this.renderOwnedTab();
            default:
                return '';
        }
    }
    
    renderLockedTab(message) {
        return `
            <div style="background: #222; border: 1px solid #ff6666; border-radius: 10px; 
                        padding: 40px 20px; text-align: center;">
                <div style="font-size: 48px; margin-bottom: 20px;">🔒</div>
                <div style="font-size: 16px; color: #ff6666; font-weight: bold; margin-bottom: 10px;">
                    ${message}
                </div>
                <div style="font-size: 12px; color: #aaa;">
                    Continue building your empire to unlock more assets!
                </div>
            </div>
        `;
    }
    
    renderJewelryTab() {
        const jewelry = this.systems.assets.getAssetsByType('jewelry');
        const owned = this.systems.assets.getOwnedAssets('jewelry');
        const wearing = this.systems.assets.getWornJewelry();
        const capacity = this.systems.assets.getStorageCapacity();
        
        let content = `
            <div style="background: #1a1a1a; padding: 10px; border-radius: 8px; margin-bottom: 15px; 
                        text-align: center; font-size: 12px; color: #ffff00;">
                Wearing: ${wearing.length}/${capacity.jewelry} jewelry items
                ${wearing.length >= capacity.jewelry ? ' (Buy property for more slots!)' : ''}
            </div>
        `;
        
        jewelry.forEach(item => {
            const isOwned = owned[item.id];
            const isWorn = wearing.includes(item.id);
            
            content += `
                <div class="market-item" style="${isOwned ? 'border: 2px solid #66ff66;' : ''}">
                    <div class="market-header">
                        <div class="drug-name">
                            ${item.name}
                            ${isOwned ? ' ✅' : ''}
                            ${isWorn ? ' 👤' : ''}
                        </div>
                        <div class="drug-price">
                            ${isOwned ? `💰 $${item.resaleValue.toLocaleString()}` : `$${item.cost.toLocaleString()}`}
                        </div>
                    </div>
                    <div style="font-size: 12px; color: #aaa; margin: 8px 0;">
                        ${item.description} • ⭐ +${item.flexScore} Flex
                    </div>
                    ${isOwned ? `
                        <div style="display: grid; grid-template-columns: ${isWorn ? '1fr 1fr' : '1fr 1fr'}; gap: 8px;">
                            ${!isWorn ? `
                                <button onclick="game.screens.assets.wearJewelry('${item.id}')" 
                                        class="action-btn" style="padding: 6px; font-size: 11px;">
                                    👤 Wear
                                </button>
                            ` : `
                                <button onclick="game.screens.assets.removeJewelry('${item.id}')" 
                                        class="action-btn" style="padding: 6px; font-size: 11px; background: #666;">
                                    Remove
                                </button>
                            `}
                            <button onclick="game.screens.assets.sellAsset('${item.id}')" 
                                    class="action-btn sell" style="padding: 6px; font-size: 11px;">
                                💰 Sell
                            </button>
                        </div>
                    ` : `
                        <button onclick="game.screens.assets.purchaseAsset('${item.id}')" 
                                class="action-btn" style="width: 100%; padding: 8px;"
                                ${this.state.get('cash') < item.cost ? 'disabled' : ''}>
                            💎 Purchase
                        </button>
                    `}
                </div>
            `;
        });
        
        return content;
    }
    
    renderCarsTab() {
        const cars = this.systems.assets.getAssetsByType('car');
        const owned = this.systems.assets.getOwnedAssets('car');
        const capacity = this.systems.assets.getStorageCapacity();
        const ownedCount = Object.keys(owned).length;
        
        let content = '';
        
        if (capacity.cars === 0) {
            content += `
                <div style="background: #331111; border: 1px solid #ff6666; padding: 15px; 
                            border-radius: 8px; margin-bottom: 15px; text-align: center;">
                    <div style="color: #ff6666; font-weight: bold; margin-bottom: 5px;">
                        ⚠️ No Car Storage Available
                    </div>
                    <div style="font-size: 12px; color: #ffaaaa;">
                        Buy a property with garage space to own cars!
                    </div>
                </div>
            `;
        } else {
            content += `
                <div style="background: #1a1a1a; padding: 10px; border-radius: 8px; margin-bottom: 15px; 
                            text-align: center; font-size: 12px; color: #ffff00;">
                    Car Storage: ${ownedCount}/${capacity.cars} cars
                </div>
            `;
        }
        
        cars.forEach(item => {
            const isOwned = owned[item.id];
            const canBuy = capacity.cars > 0 && ownedCount < capacity.cars;
            
            content += `
                <div class="market-item" style="${isOwned ? 'border: 2px solid #66ff66;' : ''}">
                    <div class="market-header">
                        <div class="drug-name">
                            ${item.name}
                            ${isOwned ? ' ✅' : ''}
                        </div>
                        <div class="drug-price">
                            ${isOwned ? `💰 $${item.resaleValue.toLocaleString()}` : `$${item.cost.toLocaleString()}`}
                        </div>
                    </div>
                    <div style="font-size: 12px; color: #aaa; margin: 8px 0;">
                        ${item.description} • ⭐ +${item.flexScore} Flex
                    </div>
                    ${isOwned ? `
                        <button onclick="game.screens.assets.sellAsset('${item.id}')" 
                                class="action-btn sell" style="width: 100%; padding: 8px;">
                            💰 Sell Car
                        </button>
                    ` : `
                        <button onclick="game.screens.assets.purchaseAsset('${item.id}')" 
                                class="action-btn" style="width: 100%; padding: 8px;"
                                ${!canBuy || this.state.get('cash') < item.cost ? 'disabled' : ''}>
                            ${!canBuy ? 'No Storage' : '🚗 Purchase'}
                        </button>
                    `}
                </div>
            `;
        });
        
        return content;
    }
    
    renderPropertyTab() {
        const properties = this.systems.assets.getAssetsByType('property');
        const owned = this.systems.assets.getOwnedAssets('property');
        
        let content = `
            <div style="background: #1a1a1a; padding: 10px; border-radius: 8px; margin-bottom: 15px; 
                        text-align: center; font-size: 12px; color: #aaa;">
                Properties increase your jewelry and car storage capacity
            </div>
        `;
        
        properties.forEach(item => {
            const isOwned = owned[item.id];
            
            content += `
                <div class="market-item" style="${isOwned ? 'border: 2px solid #66ff66;' : ''}">
                    <div class="market-header">
                        <div class="drug-name">
                            ${item.name}
                            ${isOwned ? ' ✅' : ''}
                        </div>
                        <div class="drug-price">
                            ${isOwned ? `💰 $${item.resaleValue.toLocaleString()}` : `$${item.cost.toLocaleString()}`}
                        </div>
                    </div>
                    <div style="font-size: 12px; color: #aaa; margin: 8px 0;">
                        ${item.description} • ⭐ +${item.flexScore} Flex
                    </div>
                    <div style="background: #1a1a1a; padding: 8px; border-radius: 5px; margin: 8px 0; 
                                font-size: 11px; color: #ffff00;">
                        Storage: 💍 ${item.capacity.jewelry} jewelry • 🚗 ${item.capacity.cars} cars
                    </div>
                    ${isOwned ? `
                        <button onclick="game.screens.assets.sellAsset('${item.id}')" 
                                class="action-btn sell" style="width: 100%; padding: 8px;">
                            💰 Sell Property
                        </button>
                    ` : `
                        <button onclick="game.screens.assets.purchaseAsset('${item.id}')" 
                                class="action-btn" style="width: 100%; padding: 8px;"
                                ${this.state.get('cash') < item.cost ? 'disabled' : ''}>
                            🏠 Purchase
                        </button>
                    `}
                </div>
            `;
        });
        
        return content;
    }
    
    renderOwnedTab() {
        const owned = this.systems.assets.getOwnedAssets();
        const wearing = this.systems.assets.getWornJewelry();
        
        if (Object.keys(owned).length === 0) {
            return `
                <div style="background: #222; border: 1px solid #444; border-radius: 10px; 
                            padding: 40px; text-align: center;">
                    <div style="font-size: 48px; margin-bottom: 15px;">💎</div>
                    <div style="font-size: 16px; color: #aaa;">
                        No assets owned yet
                    </div>
                    <div style="font-size: 12px; color: #666; margin-top: 10px;">
                        Start building your collection!
                    </div>
                </div>
            `;
        }
        
        let content = `
            <div style="margin-bottom: 20px;">
                <h4 style="color: #ffaa00; margin-bottom: 15px;">💎 Your Asset Collection</h4>
            </div>
        `;
        
        // Group by type
        const grouped = { jewelry: [], cars: [], property: [], exclusive: [] };
        Object.values(owned).forEach(asset => {
            if (asset.exclusive) {
                grouped.exclusive.push(asset);
            } else if (grouped[asset.type]) {
                grouped[asset.type].push(asset);
            }
        });
        
        // Render each type
        ['exclusive', 'jewelry', 'cars', 'property'].forEach(type => {
            if (grouped[type].length > 0) {
                const typeEmoji = type === 'exclusive' ? '🌟' : type === 'jewelry' ? '💍' : type === 'cars' ? '🚗' : '🏠';
                const typeName = type === 'exclusive' ? 'Exclusive' : type.charAt(0).toUpperCase() + type.slice(1);
                
                content += `
                    <div style="margin-bottom: 20px;">
                        <h5 style="color: #aaa; margin-bottom: 10px;">${typeEmoji} ${typeName}</h5>
                `;
                
                grouped[type].forEach(asset => {
                    const isWorn = wearing.includes(asset.id);
                    const isExclusive = asset.exclusive;
                    
                    content += `
                        <div style="background: #222; border: 1px solid ${isExclusive ? '#ffaa00' : '#444'}; border-radius: 8px; 
                                    padding: 12px; margin-bottom: 10px;">
                            <div style="display: flex; justify-content: space-between; align-items: center;">
                                <div>
                                    <div style="font-weight: bold; color: #fff;">
                                        ${asset.name} ${isWorn ? '👤' : ''} ${isExclusive ? '🌟' : ''}
                                    </div>
                                    <div style="font-size: 11px; color: #aaa;">
                                        Bought Day ${asset.purchaseDate} • ⭐ +${asset.flexScore} Flex
                                        ${isExclusive ? ` • Purchased in ${asset.cityPurchased}` : ''}
                                    </div>
                                </div>
                                <div style="text-align: right;">
                                    <div style="font-size: 11px; color: #66ff66;">
                                        Sell: $${asset.resaleValue.toLocaleString()}
                                    </div>
                                    <div style="font-size: 10px; color: #aaa;">
                                        Paid: $${asset.purchasePrice.toLocaleString()}
                                    </div>
                                </div>
                            </div>
                        </div>
                    `;
                });
                
                content += `</div>`;
            }
        });
        
        return content;
    }
    
    renderExclusiveTab() {
        const currentCity = this.state.get('currentCity');
        const cityDrops = this.systems.assetDrop.getCityDrops(currentCity);
        
        if (!cityDrops || cityDrops.length === 0) {
            return `
                <div style="background: #222; border: 1px solid #444; border-radius: 10px; 
                            padding: 40px; text-align: center;">
                    <div style="font-size: 48px; margin-bottom: 15px;">📦</div>
                    <div style="font-size: 16px; color: #aaa;">
                        No exclusive items in ${currentCity} right now
                    </div>
                    <div style="font-size: 12px; color: #666; margin-top: 10px;">
                        Check back soon or travel to another city!
                    </div>
                </div>
            `;
        }
        
        let content = `
            <div style="background: #1a1a1a; padding: 10px; border-radius: 8px; margin-bottom: 15px; 
                        text-align: center; font-size: 12px; color: #ffaa00;">
                🌟 ${currentCity} Exclusive Items - Limited Supply!
            </div>
        `;
        
        cityDrops.forEach(drop => {
            const currentPrice = this.systems.assetDrop.calculateDynamicPrice(drop);
            const soldOut = drop.remaining === 0;
            const lowStock = drop.remaining < 10 && drop.remaining > 0;
            
            content += `
                <div class="market-item" style="border: 2px solid ${soldOut ? '#666' : '#ffaa00'}; 
                                               ${soldOut ? 'opacity: 0.7;' : ''}">
                    <div class="market-header">
                        <div class="drug-name">
                            ${drop.name}
                            ${soldOut ? ' ❌ SOLD OUT' : ''}
                        </div>
                        <div class="drug-price">
                            $${currentPrice.toLocaleString()}
                        </div>
                    </div>
                    <div style="font-size: 12px; color: #aaa; margin: 8px 0;">
                        ${drop.description} • ⭐ +${drop.baseFlexScore} Flex
                    </div>
                    <div style="background: #333; padding: 10px; border-radius: 5px; margin: 8px 0;">
                        <div style="display: flex; justify-content: space-between; font-size: 11px;">
                            <span style="color: ${lowStock ? '#ff6666' : '#ffaa00'};">
                                ${drop.remaining}/${drop.totalSupply} available
                            </span>
                            <span style="color: #666;">
                                Expires: ${this.systems.assetDrop.getTimeRemaining(drop.expiresAt)}
                            </span>
                        </div>
                        ${drop.currentPrice > drop.baseCost ? `
                            <div style="font-size: 10px; color: #ff6666; margin-top: 5px;">
                                Price increased ${Math.round((currentPrice / drop.baseCost - 1) * 100)}% due to demand!
                            </div>
                        ` : ''}
                    </div>
                    ${!soldOut ? `
                        <button onclick="game.screens.assets.purchaseExclusive('${drop.id}')" 
                                class="action-btn" style="width: 100%; padding: 8px;"
                                ${this.state.get('cash') < currentPrice ? 'disabled' : ''}>
                            🛒 Purchase Exclusive
                        </button>
                    ` : `
                        <div style="text-align: center; padding: 8px; color: #666; font-weight: bold;">
                            SOLD OUT
                        </div>
                    `}
                </div>
            `;
        });
        
        return content;
    }
    
    onShow() {
        // Ensure assets are initialized
        this.systems.assets.initializeAssets();
        
        // Set default tab based on what's available
        const isAssetsUnlocked = this.systems.assets.isUnlocked();
        const isJewelryUnlocked = this.systems.assets.isJewelryUnlocked();
        
        if (!isAssetsUnlocked && isJewelryUnlocked) {
            // If only jewelry is available, default to jewelry tab
            this.activeTab = 'jewelry';
        } else if (!this.activeTab || (this.activeTab === 'jewelry' && !isJewelryUnlocked)) {
            // Default to first available tab
            this.activeTab = 'owned';
        }
    }
    
    switchTab(tab) {
        this.activeTab = tab;
        const contentDiv = document.getElementById('assetTabContent');
        if (contentDiv) {
            contentDiv.innerHTML = this.renderTabContent();
        }
        
        // Update tab button styles
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        event.target.classList.add('active');
    }
    
    getAvailableTabCount() {
        const isAssetsUnlocked = this.systems.assets.isUnlocked();
        const isJewelryUnlocked = this.systems.assets.isJewelryUnlocked();
        
        let count = 1; // Always have "Owned" tab
        if (isAssetsUnlocked) count += 4; // Exclusive, Cars, Property
        if (isJewelryUnlocked) count += 1; // Jewelry
        
        return count;
    }
    
    purchaseAsset(assetId) {
        const result = this.systems.assets.purchaseAsset(assetId);
        if (result.success) {
            this.game.showScreen('assets'); // Refresh screen
        } else if (result.error) {
            this.ui.modals.alert(result.error, 'Purchase Failed');
        }
    }
    
    sellAsset(assetId) {
        const asset = this.state.data.assets.owned[assetId];
        if (asset && confirm(`Sell ${asset.name} for $${asset.resaleValue.toLocaleString()}?`)) {
            const result = this.systems.assets.sellAsset(assetId);
            if (result.success) {
                this.game.showScreen('assets'); // Refresh screen
            } else if (result.error) {
                this.ui.modals.alert(result.error, 'Sell Failed');
            }
        }
    }
    
    wearJewelry(jewelryId) {
        const result = this.systems.assets.wearJewelry(jewelryId);
        if (result.success) {
            this.game.showScreen('assets'); // Refresh screen
        } else if (result.error) {
            this.ui.modals.alert(result.error, 'Cannot Wear');
        }
    }
    
    removeJewelry(jewelryId) {
        const result = this.systems.assets.removeJewelry(jewelryId);
        if (result.success) {
            this.game.showScreen('assets'); // Refresh screen
        } else if (result.error) {
            this.ui.modals.alert(result.error, 'Cannot Remove');
        }
    }
    
    purchaseExclusive(dropId) {
        // Get the drop details for confirmation
        const currentCity = this.state.get('currentCity');
        const cityDrops = this.systems.assetDrop.getCityDrops(currentCity);
        const drop = cityDrops?.find(d => d.id === dropId);
        
        if (!drop) {
            this.ui.modals.alert('Item not found', 'Purchase Failed');
            return;
        }
        
        const currentPrice = this.systems.assetDrop.calculateDynamicPrice(drop);
        
        // Show confirmation popup
        this.ui.modals.confirm(
            `Purchase exclusive item "${drop.name}" for $${currentPrice.toLocaleString()}?<br><br>` +
            `<small>• Flex Score: +${drop.baseFlexScore}<br>` +
            `• Remaining: ${drop.remaining}/${drop.totalSupply}<br>` +
            `• Expires: ${this.systems.assetDrop.getTimeRemaining(drop.expiresAt)}</small>`,
            () => {
                // User confirmed purchase
                const result = this.systems.assetDrop.purchaseExclusiveDrop(dropId);
                if (result.success) {
                    this.game.showScreen('assets'); // Refresh screen
                } else if (result.error) {
                    this.ui.modals.alert(result.error, 'Purchase Failed');
                }
            },
            () => {
                // User cancelled purchase
                console.log('Exclusive item purchase cancelled');
            }
        );
    }
}