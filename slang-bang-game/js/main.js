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
import { EventLogger } from './ui/events.js';
import { ModalManager } from './ui/modals.js';
import { updatePhoneTime } from './utils.js';
import { AssetSystem } from './systems/assets.js';
import { AssetsScreen } from './screens/assets.js';
import { assetData } from './data/assetsData.js';
import { TradingScreen } from './screens/trading.js';
Object.assign(gameData, assetData);

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
        this.systems.assets = new AssetSystem(this.state, this.ui.events, assetData);
        // Initialize screens
        this.screens.home = new HomeScreen(this);
        this.screens.market = new MarketScreen(this);
        this.screens.travel = new TravelScreen(this);
        this.screens.inventory = new InventoryScreen(this);
        this.screens.gang = new GangScreen(this);
        this.screens.bases = new BasesScreen(this);
        this.screens.assets = new AssetsScreen(this);
        this.screens.trading = new TradingScreen(this);
        // Set up navigation
        this.setupNavigation();
        // Set up phone time
        updatePhoneTime();
        setInterval(updatePhoneTime, 60000);
        // Try to load saved game
        if (!this.state.load()) {
            // New game - generate initial prices
            this.systems.trading.generateAllCityPrices();
            this.ui.events.add("Welcome to Slang and Bang! Build your drug empire while time ticks away...", 'neutral');
        } else {
            this.ui.events.add("Welcome back! Game restored from previous session.", 'good');
        }
        // Start game systems
        this.startAutoSave();
        this.startRealTimeGame();
        // Show home screen
        this.showScreen('home');
        console.log('Game initialization complete');
    }
    // ... (rest of the Game class unchanged) ...
}
// Initialize game when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.game = new Game();
    window.game.init().catch(error => {
        console.error('Failed to initialize game:', error);
        alert('Failed to initialize game. Please refresh the page.');
    });
}); 