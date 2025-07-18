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
        
        // Apply heat reduction
        this.systems.heat.applyTravelHeatReduction();
        
        // Trigger police raid and gang heat (now only on travel)
        this.systems.heat.checkPoliceRaid();
        this.systems.heat.generateGangHeat();
        
        // Log event
        this.ui.events.add(`✈️ Arrived in ${cityName} (Cost: $${cost.toLocaleString()})`, 'good');
        
        // Go to home screen
        this.game.showScreen('home');
    }
}