// js/systems/trading.js - Market and trading system
import { formatCurrency, formatNumber } from '../utils.js';
/**
 * TradingSystem manages all market and trading logic: prices, buying, selling, supply, etc.
 */
export class TradingSystem {
    constructor(gameState, eventLogger, gameData) {
        this.state = gameState;
        this.events = eventLogger;
        this.data = gameData;
    }

    /**
     * Generate prices for all cities and initialize supply if needed.
     */
    generateAllCityPrices() {
        const cityPrices = {};
        Object.keys(this.data.cities).forEach(city => {
            cityPrices[city] = this.generateCityPrices(city);
            if (!this.state.data.citySupply[city]) {
                this.state.data.citySupply[city] = {};
                Object.keys(this.data.drugs).forEach(drug => {
                    this.state.data.citySupply[city][drug] = Math.floor(Math.random() * 150) + 50;
                });
            }
        });
        this.state.cityPrices = cityPrices;
        this.state.gameInitialized = true;
    }

    /**
     * Generate prices for a specific city.
     * @param {string} city
     * @returns {Object}
     */
    generateCityPrices(city) {
        const cityData = this.data.cities[city];
        const prices = {};
        Object.entries(this.data.drugs).forEach(([drug, drugData]) => {
            const basePrice = drugData.basePrice;
            const variation = (Math.random() - 0.5) * drugData.volatility;
            const price = Math.round(basePrice * (1 + variation) * cityData.heatModifier);
            prices[drug] = price;
        });
        return prices;
    }

    /**
     * Update market prices for all cities (called daily).
     */
    updateMarketPrices() {
        Object.keys(this.state.cityPrices).forEach(city => {
            Object.keys(this.state.cityPrices[city]).forEach(drug => {
                const drugData = this.data.drugs[drug];
                const cityData = this.data.cities[city];
                const volatility = 0.95 + Math.random() * 0.1;
                let newPrice = Math.floor(this.state.cityPrices[city][drug] * volatility);
                const minPrice = Math.floor(drugData.basePrice * cityData.heatModifier * 0.5);
                const maxPrice = Math.floor(drugData.basePrice * cityData.heatModifier * 2.0);
                newPrice = Math.max(minPrice, Math.min(maxPrice, newPrice));
                this.state.cityPrices[city][drug] = newPrice;
            });
        });
        this.restockCitySupplies();
    }

    /**
     * Restock city drug supplies.
     */
    restockCitySupplies() {
        Object.keys(this.state.data.citySupply).forEach(city => {
            Object.keys(this.state.data.citySupply[city]).forEach(drug => {
                const currentSupply = this.state.data.citySupply[city][drug];
                if (currentSupply < 20) {
                    const restockAmount = Math.floor(10 + Math.random() * 20);
                    this.state.data.citySupply[city][drug] = Math.min(200, currentSupply + restockAmount);
                    if (currentSupply === 0 && city === this.state.get('currentCity')) {
                        this.events.add(`📦 ${drug} supply restocked in ${city} (+${restockAmount})`, 'neutral');
                    }
                } else if (currentSupply < 50) {
                    const restockAmount = Math.floor(5 + Math.random() * 10);
                    this.state.data.citySupply[city][drug] = Math.min(200, currentSupply + restockAmount);
                }
            });
        });
    }

    /**
     * Attempt to buy drugs. Returns {success, error}.
     * @param {string} drug
     * @param {number} quantity
     * @returns {{success: boolean, error?: string}}
     */
    buyDrug(drug, quantity) {
        const city = this.state.get('currentCity');
        const price = this.state.cityPrices[city][drug];
        const totalCost = price * quantity;
        const supply = this.state.data.citySupply[city][drug];
        if (quantity <= 0) {
            return { success: false, error: `Enter a quantity to buy ${drug}` };
        }
        if (quantity > supply) {
            return { success: false, error: `Only ${supply} ${drug} available in ${city}` };
        }
        if (!this.state.canAfford(totalCost)) {
            return { success: false, error: `Not enough cash to buy ${quantity} ${drug}` };
        }
        this.state.updateCash(-totalCost);
        this.state.updateInventory(drug, quantity);
        this.state.data.citySupply[city][drug] -= quantity;
        this.events.add(`Bought ${quantity} ${drug} for ${formatCurrency(totalCost)}`, 'good');
        if (quantity >= 10) {
            const warrantIncrease = Math.floor(quantity * 50);
            this.state.updateWarrant(warrantIncrease);
            this.events.add(`Large purchase increased heat by ${formatNumber(warrantIncrease)}`, 'bad');
        }
        return { success: true };
    }

    /**
     * Attempt to sell drugs. Returns {success, error}.
     * @param {string} drug
     * @param {number} quantity
     * @returns {{success: boolean, error?: string}}
     */
    sellDrug(drug, quantity) {
        const city = this.state.get('currentCity');
        const price = this.state.cityPrices[city][drug];
        const owned = this.state.getInventory(drug);
        if (quantity <= 0) {
            return { success: false, error: `Enter a quantity to sell ${drug}` };
        }
        if (quantity > owned) {
            return { success: false, error: `You only have ${owned} ${drug} to sell` };
        }
        const totalEarned = price * quantity;
        this.state.updateCash(totalEarned);
        this.state.updateInventory(drug, -quantity);
        this.events.add(`Sold ${quantity} ${drug} for ${formatCurrency(totalEarned)}`, 'good');
        return { success: true };
    }

    /**
     * Attempt to sell all drugs. Returns {success, error, totalEarned, drugsSold}.
     * @returns {{success: boolean, error?: string, totalEarned?: number, drugsSold?: Array<string>}}
     */
    sellAllDrugs() {
        const city = this.state.get('currentCity');
        let totalEarned = 0;
        const drugsSold = [];
        Object.keys(this.state.get('inventory')).forEach(drug => {
            const quantity = this.state.getInventory(drug);
            if (quantity > 0) {
                const price = this.state.cityPrices[city][drug];
                const earned = price * quantity;
                totalEarned += earned;
                this.state.updateInventory(drug, -quantity);
                drugsSold.push(`${quantity} ${drug}`);
            }
        });
        if (totalEarned > 0) {
            this.state.updateCash(totalEarned);
            this.events.add(`💸 Sold all drugs (${drugsSold.join(', ')}) for ${formatCurrency(totalEarned)}`, 'good');
            return { success: true, totalEarned, drugsSold };
        } else {
            return { success: false, error: 'No drugs to sell' };
        }
    }

    /**
     * Get current city prices.
     * @returns {Object}
     */
    getCurrentCityPrices() {
        const city = this.state.get('currentCity');
        return this.state.cityPrices[city] || {};
    }

    /**
     * Get city prices for a specific city.
     * @param {string} city
     * @returns {Object}
     */
    getCityPrices(city) {
        return this.state.cityPrices[city] || {};
    }

    /**
     * Get drug supply for current city.
     * @param {string} drug
     * @returns {number}
     */
    getCurrentCitySupply(drug) {
        const city = this.state.get('currentCity');
        return this.state.data.citySupply[city]?.[drug] || 0;
    }

    /**
     * Get price comparison between current and target city.
     * @param {string} drug
     * @param {string} targetCity
     * @returns {Object}
     */
    getPriceComparison(drug, targetCity) {
        const currentCity = this.state.get('currentCity');
        const currentPrice = this.state.cityPrices[currentCity]?.[drug] || 0;
        const targetPrice = this.state.cityPrices[targetCity]?.[drug] || 0;
        const difference = targetPrice - currentPrice;
        const percentDiff = currentPrice > 0 ? (difference / currentPrice) * 100 : 0;
        let indicator = '';
        let color = '#66ff66';
        if (percentDiff < -10) {
            indicator = '📈 GREAT BUY';
            color = '#00ff00';
        } else if (percentDiff < 0) {
            indicator = '📊 Good Buy';
            color = '#66ff66';
        } else if (percentDiff > 10) {
            indicator = '📉 Poor Deal';
            color = '#ff6666';
        } else if (percentDiff > 0) {
            indicator = '📊 Good Sell';
            color = '#ff9999';
        }
        return {
            currentPrice,
            targetPrice,
            difference,
            percentDiff,
            indicator,
            color
        };
    }

    /**
     * Calculate travel cost between current city and destination.
     * @param {string} destination
     * @returns {number}
     */
    calculateTravelCost(destination) {
        const currentCity = this.state.get('currentCity');
        const currentDistance = this.data.cities[currentCity].distanceIndex;
        const destDistance = this.data.cities[destination].distanceIndex;
        const distance = Math.abs(currentDistance - destDistance);
        const cost = this.data.config.baseTravelCost + (distance * 100);
        return Math.min(cost, this.data.config.maxTravelCost);
    }
}