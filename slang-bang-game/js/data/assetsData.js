// js/data/assetData.js - Asset configuration data

export const assetData = {
    assets: [
        // JEWELRY
        {
            id: 'fake_chain',
            name: 'Fake Gold Chain',
            type: 'jewelry',
            cost: 2500,
            resaleValue: 2000,
            flexScore: 3,
            storageSize: 1,
            description: 'Looks real from a distance'
        },
        {
            id: 'silver_chain',
            name: 'Silver Chain',
            type: 'jewelry',
            cost: 5000,
            resaleValue: 4500,
            flexScore: 5,
            storageSize: 1,
            description: 'Basic but clean'
        },
        {
            id: 'cuban_link',
            name: 'Cuban Link Chain',
            type: 'jewelry',
            cost: 10000,
            resaleValue: 9000,
            flexScore: 10,
            storageSize: 1,
            description: 'Classic street style'
        },
        {
            id: 'gold_watch',
            name: 'Gold Watch',
            type: 'jewelry',
            cost: 12000,
            resaleValue: 10800,
            flexScore: 11,
            storageSize: 1,
            description: 'Time is money'
        },
        {
            id: 'iced_watch',
            name: 'Iced Out Watch',
            type: 'jewelry',
            cost: 15000,
            resaleValue: 13500,
            flexScore: 12,
            storageSize: 1,
            description: 'Diamonds dancing on your wrist'
        },
        {
            id: 'grillz',
            name: 'Gold Grillz',
            type: 'jewelry',
            cost: 7000,
            resaleValue: 6000,
            flexScore: 8,
            storageSize: 1,
            description: 'Smile worth a fortune'
        },
        {
            id: 'diamond_earrings',
            name: 'Diamond Earrings',
            type: 'jewelry',
            cost: 8000,
            resaleValue: 7200,
            flexScore: 9,
            storageSize: 1,
            description: '2 carat studs'
        },
        {
            id: 'iced_chain',
            name: 'Iced Out Chain',
            type: 'jewelry',
            cost: 25000,
            resaleValue: 22500,
            flexScore: 18,
            storageSize: 1,
            description: 'VVS diamonds everywhere'
        },
        {
            id: 'pinky_ring',
            name: 'Diamond Pinky Ring',
            type: 'jewelry',
            cost: 20000,
            resaleValue: 18000,
            flexScore: 15,
            storageSize: 1,
            description: 'Boss status'
        },
        {
            id: 'rolex',
            name: 'Rolex Submariner',
            type: 'jewelry',
            cost: 50000,
            resaleValue: 45000,
            flexScore: 25,
            storageSize: 1,
            description: 'Swiss precision meets street cred'
        },
        
        // CARS
        {
            id: 'hooptie',
            name: 'Beater Sedan',
            type: 'car',
            cost: 5000,
            resaleValue: 4000,
            flexScore: 4,
            description: 'Gets you from A to B'
        },
        {
            id: 'used_bmw',
            name: 'Used BMW 3 Series',
            type: 'car',
            cost: 12000,
            resaleValue: 10800,
            flexScore: 8,
            description: 'Entry level luxury'
        },
        {
            id: 'muscle_car',
            name: 'Old-School Muscle',
            type: 'car',
            cost: 15000,
            resaleValue: 13500,
            flexScore: 10,
            description: 'American power'
        },
        {
            id: 'escalade',
            name: 'Black Escalade',
            type: 'car',
            cost: 35000,
            resaleValue: 31500,
            flexScore: 15,
            description: 'Rolling like a boss'
        },
        {
            id: 'mercedes',
            name: 'Mercedes S-Class',
            type: 'car',
            cost: 45000,
            resaleValue: 40500,
            flexScore: 18,
            description: 'German engineering'
        },
        {
            id: 'lambo',
            name: 'Black Lambo',
            type: 'car',
            cost: 60000,
            resaleValue: 54000,
            flexScore: 20,
            description: 'Italian stallion'
        },
        {
            id: 'bentley',
            name: 'Bentley Continental',
            type: 'car',
            cost: 80000,
            resaleValue: 72000,
            flexScore: 28,
            description: 'British luxury'
        },
        {
            id: 'ferrari',
            name: 'Red Ferrari',
            type: 'car',
            cost: 100000,
            resaleValue: 90000,
            flexScore: 35,
            description: 'Ultimate flex machine'
        },
        {
            id: 'bugatti',
            name: 'Bugatti Veyron',
            type: 'car',
            cost: 250000,
            resaleValue: 225000,
            flexScore: 50,
            description: 'King of the streets'
        },
        
        // PROPERTIES
        {
            id: 'studio_apt',
            name: 'Studio Apartment',
            type: 'property',
            cost: 15000,
            resaleValue: 13500,
            flexScore: 5,
            capacity: {
                jewelry: 3,
                cars: 0
            },
            description: 'Small but yours'
        },
        {
            id: 'trap_house',
            name: 'Trap House',
            type: 'property',
            cost: 20000,
            resaleValue: 18000,
            flexScore: 8,
            capacity: {
                jewelry: 3,
                cars: 1
            },
            description: 'Where it all started'
        },
        {
            id: 'condo',
            name: 'Downtown Condo',
            type: 'property',
            cost: 35000,
            resaleValue: 31500,
            flexScore: 12,
            capacity: {
                jewelry: 4,
                cars: 1
            },
            description: 'City views included'
        },
        {
            id: 'suburban_home',
            name: 'Suburban Home',
            type: 'property',
            cost: 50000,
            resaleValue: 45000,
            flexScore: 15,
            capacity: {
                jewelry: 5,
                cars: 2
            },
            description: 'Nice neighborhood'
        },
        {
            id: 'luxury_house',
            name: 'Luxury House',
            type: 'property',
            cost: 75000,
            resaleValue: 67500,
            flexScore: 20,
            capacity: {
                jewelry: 7,
                cars: 3
            },
            description: 'Pool and hot tub included'
        },
        {
            id: 'penthouse',
            name: 'Downtown Penthouse',
            type: 'property',
            cost: 120000,
            resaleValue: 100000,
            flexScore: 30,
            capacity: {
                jewelry: 10,
                cars: 3
            },
            description: 'Sky-high luxury'
        },
        {
            id: 'mansion',
            name: 'Beverly Hills Mansion',
            type: 'property',
            cost: 200000,
            resaleValue: 180000,
            flexScore: 40,
            capacity: {
                jewelry: 15,
                cars: 5
            },
            description: 'Celebrity neighborhood'
        },
        {
            id: 'compound',
            name: 'Cartel Compound',
            type: 'property',
            cost: 500000,
            resaleValue: 450000,
            flexScore: 60,
            capacity: {
                jewelry: 20,
                cars: 10
            },
            description: 'Ultimate drug lord fortress'
        }
    ]
};