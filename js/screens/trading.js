// js/screens/trading.js - Trading screen component
export class TradingScreen {
    constructor(game) {
        this.game = game;
        this.state = game.state;
        this.ui = game.ui;
        this.systems = game.systems;
    }
    
    render() {
        const currentCity = this.state.get('currentCity');
        const cash = this.state.get('cash');
        return `
            <div class="screen-header">
                <button class="back-button" onclick="game.showScreen('home')">← Back</button>
                <h3>💰 Trading - ${currentCity}</h3>
                <div style="font-size: 12px; color: #aaa;">Cash: $${cash.toLocaleString()}</div>
            </div>
            
            <div class="drug-market header">
                <div>Drug</div>
                <div>Price</div>
                <div>Have</div>
                <div>Buy</div>
                <div>Sell</div>
            </div>
            
            <div id="drugMarket">
                ${this.renderDrugMarket()}
            </div>
        `;
    }
    
    renderDrugMarket() {
        const currentCity = this.state.get('currentCity');
        const prices = this.systems.trading.getCurrentCityPrices();
        
        if (!prices || Object.keys(prices).length === 0) {
            return '<div style="text-align: center; color: #666; padding: 40px;">Market data loading...</div>';
        }
        
        let content = '';
        
        Object.keys(this.game.data.drugs).forEach(drug => {
            const price = prices[drug] || 0;
            const owned = this.state.getInventory(drug);
            const supply = this.systems.trading.getCurrentCitySupply(drug);
            const maxCanBuy = Math.min(supply, Math.floor(this.state.get('cash') / price));
            
            content += `
                <div class="drug-market">
                    <div>${drug} (${supply})</div>
                    <div style="color: #66ff66">$${price.toLocaleString()}</div>
                    <div>${owned}</div>
                    <div>
                        <input type="number" id="buy-${drug}" value="0" min="0" max="${supply}" 
                               oninput="game.screens.trading.updateBuyCost('${drug}')" 
                               class="quantity-input" style="width: 60px;">
                        <button onclick="game.screens.trading.buyDrug('${drug}')" 
                                ${supply === 0 ? 'disabled' : ''}>Buy</button>
                        <div id="buy-cost-${drug}" style="font-size: 10px; color: #ffff00; margin-top: 2px;"></div>
                    </div>
                    <div>
                        <input type="number" id="sell-${drug}" value="0" min="0" max="${owned}" 
                               oninput="game.screens.trading.updateSellValue('${drug}')" 
                               class="quantity-input" style="width: 60px;">
                        <button onclick="game.screens.trading.sellDrug('${drug}')" 
                                ${owned === 0 ? 'disabled' : ''}>Sell</button>
                        <div id="sell-value-${drug}" style="font-size: 10px; color: #66ff66; margin-top: 2px;"></div>
                    </div>
                </div>
            `;
        });
        
        return content;
    }
    
    onShow() {
        // Add Sell All button to nav-bar if on trading screen
        const navBar = document.querySelector('.nav-bar');
        if (navBar && !navBar.querySelector('.sell-all-nav')) {
            const sellBtn = document.createElement('div');
            sellBtn.className = 'nav-item sell-all-nav';
            sellBtn.innerHTML = '<span>💸</span><span>Sell All</span>';
            sellBtn.style.background = '#ff6600';
            sellBtn.style.color = '#fff';
            sellBtn.onclick = () => this.sellAllDrugs();
            navBar.appendChild(sellBtn);
        }
        // Initialize if prices not loaded
        if (!this.state.gameInitialized) {
            this.systems.trading.generateAllCityPrices();
        }
    }

    onHide() {
        // Remove Sell All button from nav-bar when leaving trading screen
        document.querySelectorAll('.sell-all-nav').forEach(btn => btn.remove());
    }
    
    refresh() {
        const drugMarket = document.getElementById('drugMarket');
        if (drugMarket) {
            drugMarket.innerHTML = this.renderDrugMarket();
        }
        
        // Update header cash display
        const cashDisplay = document.querySelector('.screen-header div[style*="Cash"]');
        if (cashDisplay) {
            cashDisplay.textContent = `Cash: $${this.state.get('cash').toLocaleString()}`;
        }
    }
    
    updateBuyCost(drug) {
        const quantity = parseInt(document.getElementById(`buy-${drug}`)?.value) || 0;
        const price = this.systems.trading.getCurrentCityPrices()[drug];
        const totalCost = quantity * price;
        const costElement = document.getElementById(`buy-cost-${drug}`);
        
        if (costElement) {
            if (quantity > 0) {
                costElement.textContent = `Total: $${totalCost.toLocaleString()}`;
                if (totalCost > this.state.get('cash')) {
                    costElement.style.color = '#ff6666';
                    costElement.textContent += ' (Not enough cash)';
                } else {
                    costElement.style.color = '#ffff00';
                }
            } else {
                costElement.textContent = '';
            }
        }
    }
    
    updateSellValue(drug) {
        const quantity = parseInt(document.getElementById(`sell-${drug}`)?.value) || 0;
        const price = this.systems.trading.getCurrentCityPrices()[drug];
        const totalValue = quantity * price;
        const valueElement = document.getElementById(`sell-value-${drug}`);
        
        if (valueElement) {
            if (quantity > 0) {
                valueElement.textContent = `Total: $${totalValue.toLocaleString()}`;
                valueElement.style.color = '#66ff66';
            } else {
                valueElement.textContent = '';
            }
        }
    }
    
    buyDrug(drug) {
        const quantity = parseInt(document.getElementById(`buy-${drug}`)?.value) || 0;
        
        if (this.systems.trading.buyDrug(drug, quantity)) {
            document.getElementById(`buy-${drug}`).value = '0';
            this.updateBuyCost(drug);
            this.refresh();
        }
    }
    
    sellDrug(drug) {
        const quantity = parseInt(document.getElementById(`sell-${drug}`)?.value) || 0;
        
        if (this.systems.trading.sellDrug(drug, quantity)) {
            document.getElementById(`sell-${drug}`).value = '0';
            this.updateSellValue(drug);
            this.refresh();
        }
    }
    
    sellAllDrugs() {
        this.ui.modals.confirm(
            'Sell all drugs in your inventory at current prices?',
            () => {
                if (this.systems.trading.sellAllDrugs()) {
                    this.refresh();
                }
            },
            null
        );
    }
}