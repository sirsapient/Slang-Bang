# 💊 Slang and Bang - Drug Empire Simulator

A real-time drug dealing empire simulation game with a mobile-first interface. Build your criminal empire from street dealer to cartel boss while managing heat, trading drugs, and expanding your operations across major US cities.

![Game Status](https://img.shields.io/badge/status-active-success.svg)
![License](https://img.shields.io/badge/license-MIT-blue.svg)

## 🎮 Play Now

Simply open `index.html` in your web browser - no installation required!

## 📱 Features

### Core Gameplay
- **Real-Time Progression**: 60-second days with automatic game advancement
- **Dynamic Drug Market**: Trade 6 different drugs with fluctuating prices across 10 major US cities
- **Heat Management**: Balance profit with police attention through strategic travel and bribery
- **Mobile-First Design**: Designed to look and feel like a mobile app

### Empire Building
- **Base Operations**: Purchase and upgrade bases for passive income generation
- **Gang Management**: Recruit and assign gang members to protect and operate your bases
- **Asset Collection**: Unlock jewelry, cars, and properties to increase your flex score (Rank 4+)
- **Ranking System**: Progress through 7 ranks from Street Dealer to Cartel Boss

### Cities Available
- New York, Los Angeles, Chicago, Houston, Phoenix
- Philadelphia, San Antonio, San Diego, Dallas, Austin

## 🚀 Getting Started

1. Clone the repository:
```bash
git clone https://github.com/yourusername/slang-bang-game.git
cd slang-bang-game
```

2. Open `index.html` in your browser

3. Start with $5,000 and build your empire!

## 🎯 How to Play

### Basic Strategy
1. **Buy Low, Sell High**: Monitor drug prices across cities and travel to find the best deals
2. **Manage Heat**: High heat levels trigger police raids - travel frequently or pay bribes
3. **Expand Operations**: Once you have 4+ gang members, purchase bases for passive income
4. **Diversify**: Balance drug trading with base management and asset collection

### Controls
- All interactions are click/tap based
- Navigation bar at the bottom for main screens
- Number inputs for precise trading amounts
- Modal popups for detailed management

### Tips for Success
- 🌡️ Keep heat below 70% to avoid raids
- 💰 Bases generate income even when you're trading elsewhere
- 🔫 Guns reduce losses during police raids
- ✈️ Traveling reduces heat by 40%
- 💎 Assets can't be lost in raids (unlocks at Rank 4)

## 🏗️ Project Structure

```
slang-bang-game/
├── index.html              # Main entry point
├── css/
│   └── main.css           # All game styles
├── js/
│   ├── main.js            # Game initialization
│   ├── gameState.js       # State management
│   ├── screens/           # UI screens
│   │   ├── home.js
│   │   ├── market.js
│   │   ├── trading.js
│   │   ├── travel.js
│   │   ├── inventory.js
│   │   ├── gang.js
│   │   ├── bases.js
│   │   └── assets.js
│   ├── systems/           # Game mechanics
│   │   ├── heat.js
│   │   ├── trading.js
│   │   ├── base.js
│   │   └── assets.js
│   ├── ui/               # UI components
│   │   ├── events.js
│   │   └── modals.js
│   ├── data/             # Game configuration
│   │   ├── gameData.js
│   │   └── assetsData.js
│   └── utils.js          # Utility functions
```

## 🛠️ Technical Details

- **Pure JavaScript**: No frameworks or build tools required
- **ES6 Modules**: Modern JavaScript with clean imports/exports
- **Responsive Design**: Optimized for mobile but works on desktop
- **Local Storage**: Game saves automatically (in-memory for demo)
- **Event-Driven**: Clean separation between game logic and UI

## 📈 Ranking System

| Rank | Title | Requirements |
|------|-------|--------------|
| 1 | 👤 Street Dealer | Starting rank |
| 2 | 🔫 Corner Boss | $25K net worth, 1 base, 5 gang |
| 3 | 👔 Block Captain | $100K net worth, 2 bases, 15 gang |
| 4 | 🎯 District Chief | $500K net worth, 3 bases, 30 gang |
| 5 | 👑 City Kingpin | $1M net worth, 5 bases, 50 gang |
| 6 | 💎 Drug Lord | $5M net worth, 7 bases, 100 gang |
| 7 | 🏆 Cartel Boss | $10M net worth, 10 bases, 200 gang |

## 🔧 Configuration

Game settings can be modified in `js/data/gameData.js`:
- Day duration (default: 60 seconds)
- Drug prices and volatility
- City heat modifiers
- Base costs and income
- Gang recruitment costs

## 🤝 Contributing

Contributions are welcome! Feel free to:
- Report bugs
- Suggest new features
- Submit pull requests
- Improve documentation

## 📝 Future Enhancements

- [ ] Multiplayer/leaderboard system
- [ ] More cities and international travel
- [ ] Special events and seasonal content
- [ ] Achievement system
- [ ] Sound effects and music
- [ ] Save to localStorage (currently in-memory only)
- [ ] Mobile app wrapper (Cordova/Capacitor)

## ⚖️ Legal Disclaimer

This is a fictional game created for entertainment purposes only. It does not promote, encourage, or glorify illegal activities. All events and scenarios in the game are purely fictional.

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Inspired by classic drug dealing games
- Built with vanilla JavaScript for learning purposes
- Mobile-first design approach

---

Made with ☕ and JavaScript
