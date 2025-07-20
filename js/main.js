// js/main.js - Main game controller and initialization
import { gameState } from './gameState.js';
import { gameData } from './data/gameData.js';
import { HomeScreen } from './screens/home.js';
import { MarketScreen } from './screens/market.js';
import { TravelScreen } from './screens/travel.js';
import { InventoryScreen } from './screens/inventory.js';
import { GangScreen } from './screens/gang.js';
import { BasesScreen } from './screens/bases.js';
import { HeatSystem } from './systems/heat.js';
import { TradingSystem } from './systems/trading.js';
import { BaseSystem } from './systems/base.js';
import { AssetSystem } from './systems/assets.js';
import { AssetDropSystem } from './systems/assetDrop.js';
import { EventLogger } from './ui/events.js';
import { ModalManager } from './ui/modals.js';
import { updatePhoneTime } from './utils.js';

import { AssetsScreen } from './screens/assets.js';
import { TradingScreen } from './screens/trading.js';
import { RaidSystem } from './systems/raid.js';
import { RaidScreen } from './screens/raid.js';
import { MailScreen } from './screens/mail.js';

class Game {
    constructor() {
        this.state = gameState;
        this.data = gameData;
        this.screens = {};
        this.systems = {};
        this.ui = {};
        this.currentScreen = null;
    }
    
    async init() {
        console.log('=== SLANG AND BANG INITIALIZATION ===');
        
        // Initialize UI components
        this.ui.events = new EventLogger();
        this.ui.modals = new ModalManager();
        
        // Initialize game systems
        this.systems.heat = new HeatSystem(this.state, this.ui.events);
        this.systems.trading = new TradingSystem(this.state, this.ui.events, this.data);
        this.systems.bases = new BaseSystem(this.state, this.ui.events, this.data);
        this.systems.assets = new AssetSystem(this.state, this.ui.events, this.data);
        this.systems.assetDrop = new AssetDropSystem(this.state, this.ui.events, this.data);
        this.systems.raid = new RaidSystem(this.state, this.ui.events, this.data);
        
        // Initialize screens
        this.screens.home = new HomeScreen(this);
        this.screens.market = new MarketScreen(this);
        this.screens.travel = new TravelScreen(this);
        this.screens.inventory = new InventoryScreen(this);
        this.screens.gang = new GangScreen(this);
        this.screens.bases = new BasesScreen(this);
        this.screens.assets = new AssetsScreen(this);
        this.screens.trading = new TradingScreen(this);
        this.screens.raid = new RaidScreen(this);
        this.screens.mail = new MailScreen(this);
        
        // Set up navigation
        this.setupNavigation();
        
        // Set up phone time
        updatePhoneTime();
        setInterval(updatePhoneTime, 60000);
        
        // Try to load saved game
        if (!this.state.load()) {
            // New game - generate initial prices
            this.systems.trading.generateAllCityPrices();
        } else {
        }
        
        // Start game systems
        this.startAutoSave();
        this.startRealTimeGame();
        
        // Show home screen
        this.showScreen('home');
        
        console.log('Game initialization complete');
    }
    
    setupNavigation() {
        // Handle navigation clicks (only for Home, Market, Travel)
        document.querySelectorAll('.nav-item').forEach(item => {
            const screenName = item.dataset.screen;
            if (["home", "market", "travel"].includes(screenName)) {
                item.addEventListener('click', () => {
                    this.showScreen(screenName);
                });
            }
        });
        // Listen for screen change requests from other components
        this.state.on('navigateTo', (screenName) => {
            this.showScreen(screenName);
        });
    }
    
    showScreen(screenName) {
        // Update nav bar
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.toggle('active', item.dataset.screen === screenName);
        });
        
        // Get screen instance
        const screen = this.screens[screenName];
        if (!screen) {
            console.error(`Screen '${screenName}' not found`);
            return;
        }
        
        // Update container
        const container = document.getElementById('screenContainer');
        container.innerHTML = screen.render();
        
        // Call screen's onShow method
        if (screen.onShow) {
            screen.onShow();
        }
        
        // Update state
        this.currentScreen = screen;
        this.state.set('currentScreen', screenName);
    }
    
    startAutoSave() {
        // Auto-save every 10 seconds
        setInterval(() => {
            this.state.save();
        }, 10000);
    }
    
    startRealTimeGame() {
        // Clear any existing timers
        if (this.state.gameTimer) {
            clearInterval(this.state.gameTimer);
        }
        if (this.state.countdownTimer) {
            clearInterval(this.state.countdownTimer);
        }
        if (this.state.baseSalesTimer) {
            clearInterval(this.state.baseSalesTimer);
        }
        if (this.state.baseRaidTimer) {
            clearInterval(this.state.baseRaidTimer);
        }
        // Start day advancement timer
        this.state.gameTimer = setInterval(() => {
            this.advanceDay();
        }, this.state.dayDuration);
        // Start countdown timer
        this.state.countdownTimer = setInterval(() => {
            this.state.timeRemaining -= 1000;
            if (this.state.timeRemaining <= 0) {
                this.state.timeRemaining = this.state.dayDuration;
            }
            this.updateCountdown();
        }, 1000);
        // Start real-time base sales timer (every minute)
        this.state.baseSalesTimer = setInterval(() => {
            this.systems.bases.processRealTimeSales();
        }, 60000);
        
        // Start base raid checking timer (every 5 minutes)
        this.state.baseRaidTimer = setInterval(() => {
            this.systems.bases.checkForBaseRaids();
        }, 300000);
        this.ui.events.add("⏰ Real-time mode activated - 60 seconds per day", 'neutral');
    }
    
    advanceDay() {
        this.state.set('day', this.state.get('day') + 1);
        this.state.set('daysInCurrentCity', this.state.get('daysInCurrentCity') + 1);
        this.state.set('daysSinceTravel', this.state.get('daysSinceTravel') + 1);
        
        // Apply daily systems
        this.systems.heat.applyWarrantDecay();
        this.systems.bases.generateDailyIncome();
        this.systems.trading.updateMarketPrices();
        
        this.ui.events.add(`Day ${this.state.get('day')} begins`, 'neutral');
        
        // Refresh current screen
        if (this.currentScreen && this.currentScreen.refresh) {
            this.currentScreen.refresh();
        }
    }
    
    updateCountdown() {
        const seconds = Math.ceil(this.state.timeRemaining / 1000);
        const countdownElement = document.getElementById('dayCountdown');
        if (countdownElement) {
            countdownElement.textContent = `${seconds}s`;
            countdownElement.style.color = seconds <= 10 ? '#ff0000' : 
                                        seconds <= 20 ? '#ffff00' : '#66ff66';
        }
    }
}

// Initialize game when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, initializing game...');
    try {
        const game = new Game();
        window.game = game;
        game.init().catch(error => {
            console.error('Failed to initialize game:', error);
            document.getElementById('screenContainer').innerHTML = `
                <div style="color: #ff0000; padding: 20px; text-align: center;">
                    <h2>Game Loading Error</h2>
                    <p>Failed to initialize game. Please check the console for details.</p>
                    <p>Error: ${error.message}</p>
                </div>
            `;
        });
    } catch (error) {
        console.error('Critical error during game initialization:', error);
        document.getElementById('screenContainer').innerHTML = `
            <div style="color: #ff0000; padding: 20px; text-align: center;">
                <h2>Critical Error</h2>
                <p>Failed to create game instance.</p>
                <p>Error: ${error.message}</p>
            </div>
        `;
    }
});