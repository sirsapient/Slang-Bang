// js/systems/assets.js - Asset management system
export class AssetSystem {
    constructor(gameState, eventLogger, gameData) {
        this.state = gameState;
        this.events = eventLogger;
        this.data = gameData;
    }
    
    // Check if player has unlocked assets (Rank 4+)
    isUnlocked() {
        const rankId = this.getCurrentPlayerRank();
        return rankId >= 4;
    }
    
    getCurrentPlayerRank() {
        const netWorth = this.state.calculateNetWorth();
        const basesOwned = Object.keys(this.state.data.bases).length;
        const gangSize = this.state.get('gangSize');
        
        let currentRank = 1;
        for (let rankId = 7; rankId >= 1; rankId--) {
            const rank = this.data.playerRanks[rankId];
            if (netWorth >= rank.minNetWorth && 
                basesOwned >= rank.minBases && 
                gangSize >= rank.minGang) {
                currentRank = rankId;
                break;
            }
        }
        
        return currentRank;
    }
    
    // Initialize player assets if not exists
    initializeAssets() {
        if (!this.state.data.assets) {
            this.state.data.assets = {
                owned: {},      // All owned assets by ID
                wearing: {      // Currently worn items
                    jewelry: []  // Array of jewelry IDs (max 2 without storage)
                },
                storage: {      // Storage capacity
                    jewelry: 2,  // Default: can wear 2 jewelry
                    cars: 0      // Default: no car storage
                }
            };
        }
    }
    
    // Get all assets of a specific type
    getAssetsByType(type) {
        return this.data.assets.filter(asset => asset.type === type);
    }
    
    // Get owned assets
    getOwnedAssets(type = null) {
        this.initializeAssets();
        const owned = this.state.data.assets.owned;
        
        if (!type) return owned;
        
        const filtered = {};
        Object.entries(owned).forEach(([id, asset]) => {
            if (asset.type === type) {
                filtered[id] = asset;
            }
        });
        
        return filtered;
    }
    
    // Get worn jewelry
    getWornJewelry() {
        this.initializeAssets();
        return this.state.data.assets.wearing.jewelry || [];
    }
    
    // Calculate total flex score
    calculateFlexScore() {
        this.initializeAssets();
        let flexScore = 0;
        
        // Add flex from worn jewelry
        this.getWornJewelry().forEach(jewelryId => {
            const jewelry = this.state.data.assets.owned[jewelryId];
            if (jewelry) {
                flexScore += jewelry.flexScore || 0;
            }
        });
        
        // Add flex from all owned cars
        Object.values(this.state.data.assets.owned).forEach(asset => {
            if (asset.type === 'car') {
                flexScore += asset.flexScore || 0;
            }
        });
        
        // Add flex from best house
        let bestHouseFlex = 0;
        Object.values(this.state.data.assets.owned).forEach(asset => {
            if (asset.type === 'property') {
                bestHouseFlex = Math.max(bestHouseFlex, asset.flexScore || 0);
            }
        });
        flexScore += bestHouseFlex;
        
        return flexScore;
    }
    
    // Purchase asset
    purchaseAsset(assetId) {
        const asset = this.data.assets.find(a => a.id === assetId);
        if (!asset) {
            this.events.add('Asset not found', 'bad');
            return false;
        }
        
        if (!this.isUnlocked()) {
            this.events.add('Asset Store unlocks at Rank 4 (District Chief)', 'bad');
            return false;
        }
        
        if (!this.state.canAfford(asset.cost)) {
            this.events.add(`Can't afford ${asset.name}. Need $${asset.cost.toLocaleString()}`, 'bad');
            return false;
        }
        
        // Check storage capacity for cars
        if (asset.type === 'car') {
            const ownedCars = Object.values(this.getOwnedAssets('car')).length;
            const carCapacity = this.getStorageCapacity().cars;
            
            if (ownedCars >= carCapacity && carCapacity > 0) {
                this.events.add('No car storage available. Buy a house first!', 'bad');
                return false;
            }
        }
        
        // Execute purchase
        this.initializeAssets();
        this.state.updateCash(-asset.cost);
        
        // Add to owned assets
        this.state.data.assets.owned[assetId] = {
            ...asset,
            purchaseDate: this.state.get('day'),
            purchasePrice: asset.cost
        };
        
        // Update storage capacity if it's a property
        if (asset.type === 'property' && asset.capacity) {
            this.updateStorageCapacity(asset.capacity);
        }
        
        this.events.add(`💎 Purchased ${asset.name} for $${asset.cost.toLocaleString()}`, 'good');
        
        // Auto-wear jewelry if slots available
        if (asset.type === 'jewelry' && this.canWearMoreJewelry()) {
            this.wearJewelry(assetId);
        }
        
        return true;
    }
    
    // Sell asset
    sellAsset(assetId) {
        this.initializeAssets();
        const asset = this.state.data.assets.owned[assetId];
        
        if (!asset) {
            this.events.add('You don\'t own this asset', 'bad');
            return false;
        }
        
        // Remove from wearing if worn
        if (asset.type === 'jewelry') {
            this.removeJewelry(assetId);
        }
        
        // Calculate resale value
        const resaleValue = asset.resaleValue || Math.floor(asset.cost * 0.9);
        
        // Remove from owned
        delete this.state.data.assets.owned[assetId];
        
        // Update cash
        this.state.updateCash(resaleValue);
        
        // Reduce storage if selling property
        if (asset.type === 'property' && asset.capacity) {
            this.reduceStorageCapacity(asset.capacity);
        }
        
        this.events.add(`💰 Sold ${asset.name} for $${resaleValue.toLocaleString()}`, 'good');
        return true;
    }
    
    // Wear jewelry
    wearJewelry(jewelryId) {
        this.initializeAssets();
        const jewelry = this.state.data.assets.owned[jewelryId];
        
        if (!jewelry || jewelry.type !== 'jewelry') {
            this.events.add('Invalid jewelry item', 'bad');
            return false;
        }
        
        const wearing = this.state.data.assets.wearing.jewelry;
        const maxWearable = this.getMaxWearableJewelry();
        
        // Check if already wearing
        if (wearing.includes(jewelryId)) {
            this.events.add(`Already wearing ${jewelry.name}`, 'neutral');
            return false;
        }
        
        // Check capacity
        if (wearing.length >= maxWearable) {
            this.events.add(`Can only wear ${maxWearable} jewelry items. Remove one first or buy storage!`, 'bad');
            return false;
        }
        
        // Wear the jewelry
        wearing.push(jewelryId);
        this.events.add(`💍 Now wearing ${jewelry.name} (+${jewelry.flexScore} flex)`, 'good');
        return true;
    }
    
    // Remove jewelry
    removeJewelry(jewelryId) {
        this.initializeAssets();
        const wearing = this.state.data.assets.wearing.jewelry;
        const index = wearing.indexOf(jewelryId);
        
        if (index > -1) {
            const jewelry = this.state.data.assets.owned[jewelryId];
            wearing.splice(index, 1);
            
            if (jewelry) {
                this.events.add(`Removed ${jewelry.name}`, 'neutral');
            }
            return true;
        }
        
        return false;
    }
    
    // Get storage capacity
    getStorageCapacity() {
        this.initializeAssets();
        return this.state.data.assets.storage;
    }
    
    // Get max wearable jewelry
    getMaxWearableJewelry() {
        const storage = this.getStorageCapacity();
        return storage.jewelry || 2;
    }
    
    // Check if can wear more jewelry
    canWearMoreJewelry() {
        const wearing = this.getWornJewelry();
        const max = this.getMaxWearableJewelry();
        return wearing.length < max;
    }
    
    // Update storage capacity when buying property
    updateStorageCapacity(capacity) {
        this.initializeAssets();
        const storage = this.state.data.assets.storage;
        
        // Take the best capacity from all owned properties
        let bestJewelryCapacity = 2; // Base capacity
        let bestCarCapacity = 0;
        
        Object.values(this.state.data.assets.owned).forEach(asset => {
            if (asset.type === 'property' && asset.capacity) {
                bestJewelryCapacity = Math.max(bestJewelryCapacity, asset.capacity.jewelry || 2);
                bestCarCapacity = Math.max(bestCarCapacity, asset.capacity.cars || 0);
            }
        });
        
        storage.jewelry = bestJewelryCapacity;
        storage.cars = bestCarCapacity;
    }
    
    // Reduce storage when selling property
    reduceStorageCapacity(capacity) {
        // Recalculate from remaining properties
        this.updateStorageCapacity({});
        
        // Check if we need to remove worn jewelry
        const wearing = this.getWornJewelry();
        const maxWearable = this.getMaxWearableJewelry();
        
        if (wearing.length > maxWearable) {
            // Remove excess jewelry
            const toRemove = wearing.length - maxWearable;
            for (let i = 0; i < toRemove; i++) {
                const jewelryId = wearing[wearing.length - 1];
                this.removeJewelry(jewelryId);
                this.events.add('Had to remove jewelry due to reduced storage', 'bad');
            }
        }
    }
    
    // Get total asset value
    getTotalAssetValue() {
        this.initializeAssets();
        let total = 0;
        
        Object.values(this.state.data.assets.owned || {}).forEach(asset => {
            total += asset.resaleValue || Math.floor(asset.cost * 0.9);
        });
        
        return total;
    }
    
    // Get asset summary
    getAssetSummary() {
        this.initializeAssets();
        const owned = this.state.data.assets.owned;
        const wearing = this.getWornJewelry();
        
        let jewelryCount = 0;
        let carCount = 0;
        let propertyCount = 0;
        
        Object.values(owned).forEach(asset => {
            if (asset.type === 'jewelry') jewelryCount++;
            else if (asset.type === 'car') carCount++;
            else if (asset.type === 'property') propertyCount++;
        });
        
        return {
            totalAssets: Object.keys(owned).length,
            jewelryCount,
            carCount,
            propertyCount,
            wearingCount: wearing.length,
            flexScore: this.calculateFlexScore(),
            totalValue: this.getTotalAssetValue()
        };
    }
}