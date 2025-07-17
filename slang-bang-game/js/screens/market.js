// js/screens/market.js - Market screen component
export class MarketScreen {
    constructor(game) {
        this.game = game;
        this.state = game.state;
        this.ui = game.ui;
        this.systems = game.systems;
        this.selectedCity = null;
    }
    
    render() {
        this.selectedCity = this.selectedCity || this.state.get('currentCity');
        
        return `
            <div class="screen-header">
                <button class="back-button" onclick="game.showScreen('home')">← Back</button>
                <h3>💊 Market Overview</h3>
                <div style="font-size: 12px; color: #aaa;">Compare Prices</div>
            </div>
            
            <div style="margin-bottom: 20px;">
                <div style="font-size: 14px; margin-bottom: 10px; color: #aaa;">Select City to View Prices:</div>
                <select id="marketCitySelector" onchange="game.screens.market.updateSelectedCity()" style="
                    width: 100%;
                    background: #222;
                    color: #00ff00;
                    border: 1px solid #666;
                    padding: 10px;
                    border-radius: 8px;
                    font-family: inherit;
                ">
                    ${Object.keys(this.game.data.cities).map(city => 
                        `<option value="${city}" ${city === this.selectedCity ? 'selected' : ''}>${city}</option>`
                    ).join('')}
                </select>
            </div>
            
            <div id="marketPricesDisplay">
                ${this.renderPrices()}
            </div>
            
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-top: 20px;">
                <button id="travelToMarketBtn" onclick="game.screens.market.travelToSelected()" 
                        class="action-btn" style="padding: 15px;">
                    ✈️ Travel There
                </button>
                <button id="tradeAtMarketBtn" onclick="game.screens.market.goToTrading()" 
                        class="action-btn" style="padding: 15px;">
                    💰 Trade Here
                </button>
            </div>
        `;
    }
    
    onShow() {
        this.updateButtons();
    }
    
    updateSelectedCity() {
        const selector = document.getElementById('marketCitySelector');
        if (selector) {
            this.selectedCity = selector.value;
            const pricesDisplay = document.getElementById('marketPricesDisplay');
            if (pricesDisplay) {
                pricesDisplay.innerHTML = this.renderPrices();
            }
            this.updateButtons();
        }
    }
    
    renderPrices() {
        const isCurrentCity = this.selectedCity === this.state.get('currentCity');
        const travelCost = isCurrentCity ? 0 : this.systems.trading.calculateTravelCost(this.selectedCity);
        const cityData = this.game.data.cities[this.selectedCity];
        
        let content = `
            <div style="background: #333; padding: 15px; margin-bottom: 20px; border-radius: 10px; 
                        display: flex; justify-content: space-between; align-items: center;">
                <div>
                    <strong>${this.selectedCity}</strong>
                    <div style="font-size: 12px; color: #aaa;">${cityData.population}</div>
                </div>
                <div>
                    ${isCurrentCity ? 
                        '<div style="background: #00ff00; color: #000; padding: 5px 10px; border-radius: 5px; font-size: 12px; font-weight: bold;">📍 Current</div>' : 
                        `<div style="background: #ff6600; color: #fff; padding: 5px 10px; border-radius: 5px; font-size: 12px; font-weight: bold;">✈️ $${travelCost.toLocaleString()}</div>`
                    }
                </div>
            </div>
        `;
        
        // Drug prices
        Object.keys(this.game.data.drugs).forEach(drug => {
            const price = this.state.cityPrices[this.selectedCity]?.[drug] || 0;
            const owned = this.state.getInventory(drug);
            const supply = this.state.data.citySupply[this.selectedCity]?.[drug] || 0;
            
            let comparison = '';
            if (!isCurrentCity) {
                const comp = this.systems.trading.getPriceComparison(drug, this.selectedCity);
                comparison = `
                    <div style="color: ${comp.color}">${comp.indicator}</div>
                    <div>vs Current: <span style="color: ${comp.difference < 0 ? '#66ff66' : '#ff6666'}">
                        ${comp.difference < 0 ? '' : '+'}$${Math.abs(comp.difference).toLocaleString()}
                    </span></div>
                `;
            }
            
            content += `
                <div style="background: #222; border: 1px solid #444; border-radius: 10px; padding: 15px; margin-bottom: 10px;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                        <div style="font-weight: bold; font-size: 14px;">${drug}</div>
                        <div style="color: #66ff66; font-weight: bold;">$${price.toLocaleString()}</div>
                    </div>
                    <div style="display: grid; grid-template-columns: 1fr 1fr ${isCurrentCity ? '' : '1fr'}; 
                                gap: 10px; font-size: 12px; color: #aaa;">
                        <div>Supply: <span style="color: ${this.getSupplyColor(supply)}">${supply}</span></div>
                        <div>You have: <span style="color: #ffff00">${owned}</span></div>
                        ${comparison}
                    </div>
                </div>
            `;
        });
        
        return content;
    }
    
    getSupplyColor(supply) {
        if (supply < 10) return '#ff6666';
        if (supply < 30) return '#ffff00';
        if (supply < 60) return '#66ff66';
        return '#66ff66';
    }
    
    updateButtons() {
        const isCurrentCity = this.selectedCity === this.state.get('currentCity');
        const travelCost = isCurrentCity ? 0 : this.systems.trading.calculateTravelCost(this.selectedCity);
        const canAfford = this.state.canAfford(travelCost);
        
        const travelBtn = document.getElementById('travelToMarketBtn');
        const tradeBtn = document.getElementById('tradeAtMarketBtn');
        
        if (travelBtn) {
            if (isCurrentCity) {
                travelBtn.disabled = true;
                travelBtn.innerHTML = '📍 You Are Here';
            } else {
                travelBtn.disabled = !canAfford;
                travelBtn.innerHTML = `✈️ Travel (${travelCost.toLocaleString()})`;
            }
        }
        
        if (tradeBtn) {
            if (isCurrentCity) {
                tradeBtn.disabled = false;
                tradeBtn.innerHTML = '💰 Trade Here';
            } else {
                tradeBtn.disabled = true;
                tradeBtn.innerHTML = '💰 Travel to Trade';
            }
        }
    }
    
    travelToSelected() {
        const travelCost = this.systems.trading.calculateTravelCost(this.selectedCity);
        
        if (confirm(`Travel to ${this.selectedCity} for ${travelCost.toLocaleString()}?`)) {
            this.state.updateCash(-travelCost);
            this.state.travelToCity(this.selectedCity);
            
            // Apply heat reduction
            this.systems.heat.applyTravelHeatReduction();
            
            this.ui.events.add(`✈️ Arrived in ${this.selectedCity} (Cost: ${travelCost.toLocaleString()})`, 'good');
            
            // Go to trading screen
            this.game.showScreen('trading');
        }
    }
    
    goToTrading() {
        this.game.showScreen('trading');
    }
}