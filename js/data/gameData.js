// js/data/gameData.js - All game constants and configuration data

export const gameData = {
    // Cities configuration
    cities: {
        'New York': { 
            population: '8.3M', 
            heatModifier: 1.2,
            distanceIndex: 0
        },
        'Los Angeles': { 
            population: '4.0M', 
            heatModifier: 1.1,
            distanceIndex: 7
        },
        'Chicago': { 
            population: '2.7M', 
            heatModifier: 1.3,
            distanceIndex: 3
        },
        'Houston': { 
            population: '2.3M', 
            heatModifier: 0.9,
            distanceIndex: 5
        },
        'Phoenix': { 
            population: '1.7M', 
            heatModifier: 0.8,
            distanceIndex: 6
        },
        'Philadelphia': { 
            population: '1.6M', 
            heatModifier: 1.1,
            distanceIndex: 1
        },
        'San Antonio': { 
            population: '1.5M', 
            heatModifier: 0.7,
            distanceIndex: 5
        },
        'San Diego': { 
            population: '1.4M', 
            heatModifier: 0.8,
            distanceIndex: 7
        },
        'Dallas': { 
            population: '1.3M', 
            heatModifier: 0.9,
            distanceIndex: 4
        },
        'Austin': { 
            population: '965K', 
            heatModifier: 0.8,
            distanceIndex: 5
        }
    },
    
    // Drug configuration
    drugs: {
        'Fentanyl': { 
            basePrice: 15000,
            volatility: 0.6,
            heatGeneration: 5
        },
        'Oxycontin': { 
            basePrice: 8000,
            volatility: 0.4,
            heatGeneration: 3
        },
        'Heroin': { 
            basePrice: 12000,
            volatility: 0.5,
            heatGeneration: 4
        },
        'Cocaine': { 
            basePrice: 10000,
            volatility: 0.5,
            heatGeneration: 4
        },
        'Weed': { 
            basePrice: 2000,
            volatility: 0.3,
            heatGeneration: 1
        },
        'Meth': { 
            basePrice: 5000,
            volatility: 0.4,
            heatGeneration: 3
        }
    },
    
    // Base types configuration
    baseTypes: {
        1: { 
            name: 'Trap House', 
            cost: 50000,
            income: 1000, 
            gangRequired: 4, 
            upgradeCost: 15000, 
            maxInventory: 60, // 10 per drug, 6 drugs
            maxSafe: 50000 
        },
        2: { 
            name: 'Safe House', 
            cost: 65000,
            income: 2500, 
            gangRequired: 6, 
            upgradeCost: 40000, 
            maxInventory: 120, // 20 per drug
            maxSafe: 250000 
        },
        3: { 
            name: 'Distribution Center', 
            cost: 105000,
            income: 6000, 
            gangRequired: 10, 
            upgradeCost: 100000, 
            maxInventory: 240, // 40 per drug
            maxSafe: 500000 
        },
        4: { 
            name: 'Drug Fortress', 
            cost: 205000,
            income: 15000, 
            gangRequired: 15, 
            upgradeCost: null, 
            maxInventory: 480, // 80 per drug
            maxSafe: 1000000 
        }
    },
    
    // Player ranks
    playerRanks: {
        1: { 
            name: 'Street Dealer', 
            minNetWorth: 0, 
            minBases: 0, 
            minGang: 0, 
            emoji: '👤', 
            color: '#888888' 
        },
        2: { 
            name: 'Corner Boss', 
            minNetWorth: 25000, 
            minBases: 1, 
            minGang: 5, 
            emoji: '🔫', 
            color: '#996633' 
        },
        3: { 
            name: 'Block Captain', 
            minNetWorth: 100000, 
            minBases: 2, 
            minGang: 15, 
            emoji: '👔', 
            color: '#6666ff' 
        },
        4: { 
            name: 'District Chief', 
            minNetWorth: 500000, 
            minBases: 3, 
            minGang: 30, 
            emoji: '🎯', 
            color: '#9966ff' 
        },
        5: { 
            name: 'City Kingpin', 
            minNetWorth: 1000000, 
            minBases: 5, 
            minGang: 50, 
            emoji: '👑', 
            color: '#ffaa00' 
        },
        6: { 
            name: 'Drug Lord', 
            minNetWorth: 5000000, 
            minBases: 7, 
            minGang: 100, 
            emoji: '💎', 
            color: '#ff6600' 
        },
        7: { 
            name: 'Cartel Boss', 
            minNetWorth: 10000000, 
            minBases: 10, 
            minGang: 200, 
            emoji: '🏆', 
            color: '#ff0066' 
        }
    },
    
    // Game configuration
    config: {
        // Starting values
        startingCash: 5000,
        startingCity: 'New York',
        
        // Time settings
        dayDuration: 60000, // 60 seconds
        autoSaveInterval: 10000, // 10 seconds
        
        // Travel settings
        baseTravelCost: 200,
        maxTravelCost: 800,
        travelHeatReduction: 0.4, // 40% warrant reduction
        
        // Heat settings
        warrantDecayBase: 0.02, // 2% per day when laying low
        warrantDecayMax: 0.08, // 8% after 2 weeks
        raidChanceAtCritical: 0.3, // 30% max raid chance
        
        // Gang settings
        baseGangCost: 2500,
        gangCostScaling: 0.1, // 10% increase per existing member
        gangHeatPerMember: 100, // Heat generated per gang member per day
        gangRecruitHeat: 200, // Heat per recruitment
        
        // Base settings
        baseCostModifier: 1.0, // Applied to city heat modifier
        baseIncomeBonus: 1.5, // When drugs are stocked
        
        // Trading settings
        maxSupply: 200,
        minSupply: 0,
        restockThreshold: 20,
        restockAmount: [10, 30], // Random between min and max
        
        // Combat settings
        gunCost: 1500,
        gunDefenseBonus: 0.02, // 2% protection per gun (max 40%)
        
        // UI settings
        maxEventLogItems: 50,
        modalFadeTime: 300
    },
    
    // Gang tiers (for display purposes)
    gangTiers: [
        { 
            name: 'Street Soldiers', 
            range: [1, 5], 
            emoji: '🔫', 
            description: 'Basic operations' 
        },
        { 
            name: 'Lieutenants', 
            range: [6, 15], 
            emoji: '👤', 
            description: 'Enhanced operations' 
        },
        { 
            name: 'Crew Chiefs', 
            range: [16, 30], 
            emoji: '👔', 
            description: 'Base management' 
        },
        { 
            name: 'Underbosses', 
            range: [31, 50], 
            emoji: '🎯', 
            description: 'Territory control' 
        },
        { 
            name: 'Crime Family', 
            range: [51, 999], 
            emoji: '👑', 
            description: 'Empire operations' 
        }
    ]
};