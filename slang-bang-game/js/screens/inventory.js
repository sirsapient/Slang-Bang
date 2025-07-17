// js/screens/inventory.js - Inventory screen component
export class InventoryScreen {
    constructor(game) {
        this.game = game;
        this.state = game.state;
        this.ui = game.ui;
        this.systems = game.systems;
    }
    
    render() {
        const cash = this.state.get('cash');
        const currentCity = this.state.get('currentCity');
        
        return `
            <div class="screen-header">
                <button class="back-button" onclick="game.showScreen('home')">← Back</button>
                <h3>🎒 Inventory</h3>
                <div style="font-size: 12px; color: #aaa;">Your Stash</div>
            </div>
            
            <div style="background: #333; padding: 15px; margin-bottom: 20px; border-radius: 10px;">
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; text-align: center;">
                    <div>
                        <div style="font-size: 12px; color: #aaa; margin-bottom: 5px;">💰 Cash</div>
                        <div style="font-size: 18px; color: #66ff66; font-weight: bold;">
                            $${cash.toLocaleString()}
                        </div>
                    </div>
                    <div>
                        <div style="font-size: 12px; color: #aaa; margin-bottom: 5px;">📍 Location</div>
                        <div style="font-size: 18px; color: #ffff00; font-weight: bold;">
                            ${currentCity}
                        </div>
                    </div>
                </div>
            </div>
            
            <div id="inventoryList">
                ${this.renderInventory()}
            </div>
        `;
    }
    
    renderInventory() {
        const inventory = this.state.get('inventory');
        const totalItems = this.state.getTotalInventory();
        
        if (totalItems === 0) {
            return `
                <div style="background: #222; border: 1px solid #444; border-radius: 10px; 
                            padding: 30px; text-align: center;">
                    <div style="font-size: 48px; margin-bottom: 15px;">🎒</div>
                    <div style="font-size: 16px; color: #aaa; margin-bottom: 10px;">
                        Your inventory is empty
                    </div>
                    <div style="font-size: 12px; color: #666; margin-bottom: 20px;">
                        Buy some drugs to start building your empire
                    </div>
                    <button onclick="game.showScreen('market')" class="action-btn" style="padding: 12px 20px;">
                        💊 Go to Market
                    </button>
                </div>
            `;
        }
        
        // Calculate total value
        let totalValue = 0;
        const prices = this.systems.trading.getCurrentCityPrices();
        
        Object.entries(inventory).forEach(([drug, quantity]) => {
            if (quantity > 0 && prices[drug]) {
                totalValue += quantity * prices[drug];
            }
        });
        
        let content = `
            <div style="background: #333; border: 1px solid #666; border-radius: 10px; 
                        padding: 15px; margin-bottom: 20px; text-align: center;">
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                    <div>
                        <div style="font-size: 12px; color: #aaa; margin-bottom: 5px;">📦 Total Items</div>
                        <div style="font-size: 18px; color: #ffff00; font-weight: bold;">${totalItems}</div>
                    </div>
                    <div>
                        <div style="font-size: 12px; color: #aaa; margin-bottom: 5px;">💎 Total Value</div>
                        <div style="font-size: 18px; color: #66ff66; font-weight: bold;">
                            $${totalValue.toLocaleString()}
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // Individual drug items
        Object.entries(inventory).forEach(([drug, quantity]) => {
            if (quantity > 0) {
                const currentPrice = prices[drug] || 0;
                const itemValue = currentPrice * quantity;
                
                content += `
                    <div class="market-item">
                        <div class="market-header">
                            <div class="drug-name">${drug}</div>
                            <div style="color: #ffff00; font-weight: bold;">${quantity} units</div>
                        </div>
                        <div style="display: flex; justify-content: space-between; font-size: 12px; 
                                    color: #aaa; margin-top: 8px;">
                            <span>Current Price: $${currentPrice.toLocaleString()}</span>
                            <span style="color: #66ff66;">Value: $${itemValue.toLocaleString()}</span>
                        </div>
                        <div style="margin-top: 10px;">
                            <button onclick="game.showScreen('trading')" class="action-btn" 
                                    style="width: 100%; padding: 8px;">
                                💰 Go Trade ${drug}
                            </button>
                        </div>
                    </div>
                `;
            }
        });
        
        return content;
    }
    
    onShow() {
        // Ensure prices are loaded
        if (!this.state.gameInitialized) {
            this.systems.trading.generateAllCityPrices();
        }
    }
}