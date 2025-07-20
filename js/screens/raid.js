// js/screens/raid.js - Raid screen component
export class RaidScreen {
    constructor(game) {
        this.game = game;
        this.state = game.state;
        this.ui = game.ui;
        this.systems = game.systems;
        this.selectedTarget = null;
        this.raidGangSize = 3;
    }
    
    onShow() {
        // Reset any necessary state when showing the raid screen
        // The execute raid button uses onclick attribute, so no event listener needed
    }
    
    render() {
        const currentCity = this.state.get('currentCity');
        const availableGang = this.state.getAvailableGangMembers();
        const availableGangInCity = this.state.getAvailableGangMembersInCity(currentCity);
        const guns = this.state.get('guns');
        const targets = this.systems.raid.getAvailableTargets(currentCity);
        
        const baseInCity = this.state.getBase(currentCity);
        console.log('Raid screen data:', {
            currentCity,
            availableGang,
            availableGangInCity,
            guns,
            targetsCount: targets.length,
            gangMembersInCity: this.state.getGangMembersInCity(currentCity),
            assignedGangInCity: this.state.getGangMembersInCity(currentCity) - availableGangInCity,
            hasBase: !!baseInCity,
            baseAssignedGang: baseInCity ? baseInCity.assignedGang : 0
        });
        
        return `
            <div class="screen-header">
                <button class="back-button" onclick="game.showScreen('home')">← Back</button>
                <h3>⚔️ Base Raids</h3>
                <div style="font-size: 12px; color: #aaa;">Attack Enemy Bases</div>
            </div>
            
            <!-- Raid Overview -->
            <div style="background: #333; border: 1px solid #666; border-radius: 10px; 
                        padding: 15px; margin-bottom: 20px;">
                <div style="display: grid; grid-template-columns: 1fr 1fr 1fr 1fr; gap: 15px; text-align: center;">
                    <div>
                        <div style="font-size: 12px; color: #aaa; margin-bottom: 5px;">👥 Total Gang</div>
                        <div style="font-size: 18px; color: #ffff00; font-weight: bold;">
                            ${availableGang}
                        </div>
                    </div>
                    <div>
                        <div style="font-size: 12px; color: #aaa; margin-bottom: 5px;">🗺️ In ${currentCity}</div>
                        <div style="font-size: 18px; color: #66ff66; font-weight: bold;">
                            ${this.state.getAvailableGangMembersInCity(currentCity)}
                        </div>
                    </div>
                    <div>
                        <div style="font-size: 12px; color: #aaa; margin-bottom: 5px;">🔫 Guns in ${currentCity}</div>
                        <div style="font-size: 18px; color: #66ff66; font-weight: bold;">
                            ${this.state.getAvailableGunsInCity(currentCity)}
                        </div>
                    </div>
                    <div>
                        <div style="font-size: 12px; color: #aaa; margin-bottom: 5px;">🎯 Targets</div>
                        <div style="font-size: 18px; color: #66ff66; font-weight: bold;">
                            ${targets.length}
                        </div>
                    </div>
                </div>
            </div>

            ${availableGangInCity < 3 ? this.renderInsufficientGang() : this.renderRaidInterface(targets)}
        `;
    }
    
    renderInsufficientGang() {
        return `
            <div style="background: #222; border: 1px solid #444; border-radius: 10px; 
                        padding: 30px; text-align: center; margin-top: 20px;">
                <div style="font-size: 48px; margin-bottom: 15px;">⚔️</div>
                <div style="font-size: 16px; color: #aaa; margin-bottom: 10px;">
                    Insufficient Gang Members
                </div>
                <div style="font-size: 12px; color: #666; margin-bottom: 20px;">
                    You need at least 3 unassigned gang members to conduct raids
                </div>
                <div style="font-size: 11px; color: #888;">
                    💡 Tip: Recruit more gang members and keep them unassigned for raids
                </div>
            </div>
        `;
    }
    
    renderRaidInterface(targets) {
        if (targets.length === 0) {
            return `
                <div style="background: #222; border: 1px solid #444; border-radius: 10px; 
                            padding: 30px; text-align: center; margin-top: 20px;">
                    <div style="font-size: 48px; margin-bottom: 15px;">🎯</div>
                    <div style="font-size: 16px; color: #aaa; margin-bottom: 10px;">
                        No Available Targets
                    </div>
                    <div style="font-size: 12px; color: #666; margin-bottom: 20px;">
                        All enemy bases in this city are on cooldown
                    </div>
                    <div style="font-size: 11px; color: #888;">
                        💡 Tip: Try traveling to another city or wait for cooldowns to reset
                    </div>
                </div>
            `;
        }
        
        return `
            <!-- Target Selection -->
            <div style="margin-bottom: 20px;">
                <div style="font-size: 14px; color: #ffff00; margin-bottom: 10px;">🎯 Select Target</div>
                ${targets.map(target => this.renderTargetCard(target)).join('')}
            </div>
            
            <!-- Raid Planning -->
            ${this.selectedTarget ? this.renderRaidPlanning() : ''}
        `;
    }
    
    renderTargetCard(target) {
        const difficultyColor = this.systems.raid.getDifficultyColor(target.difficulty);
        const difficultyText = this.systems.raid.getDifficultyText(target.difficulty);
        const totalDrugs = Object.values(target.drugs).reduce((sum, count) => sum + count, 0);
        
        // Check if target is on cooldown
        const currentTime = Date.now();
        const cooldownPeriod = 5 * 60 * 1000; // 5 minutes
        const timeSinceLastRaid = currentTime - target.lastRaid;
        const isOnCooldown = timeSinceLastRaid < cooldownPeriod;
        const remainingMinutes = isOnCooldown ? Math.ceil((cooldownPeriod - timeSinceLastRaid) / 1000 / 60) : 0;
        
        return `
            <div class="raid-target" style="background: #222; border: 2px solid ${isOnCooldown ? '#666' : difficultyColor}; 
                        border-radius: 10px; padding: 15px; margin-bottom: 10px; cursor: pointer; opacity: ${isOnCooldown ? '0.6' : '1'};"
                 onclick="game.screens.raid.selectTarget('${target.id}')">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                    <div>
                        <div style="font-weight: bold; color: #fff;">
                            ${target.name}
                            ${isOnCooldown ? ' ⏰' : ''}
                        </div>
                        <div style="font-size: 12px; color: #aaa;">${target.city}</div>
                    </div>
                    <div style="text-align: right;">
                        <div style="color: ${isOnCooldown ? '#666' : difficultyColor}; font-weight: bold; font-size: 14px;">
                            ${isOnCooldown ? 'On Cooldown' : difficultyText}
                        </div>
                        <div style="font-size: 10px; color: #aaa;">
                            ${isOnCooldown ? `${remainingMinutes}m left` : 'Difficulty'}
                        </div>
                    </div>
                </div>
                
                <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 8px; 
                            font-size: 11px; color: #aaa;">
                    <div>💰 $${target.cash.toLocaleString()}</div>
                    <div>📦 ${totalDrugs} drugs</div>
                    <div>👥 ${target.gangSize} guards</div>
                </div>
                
                ${isOnCooldown ? `
                    <div style="background: #333; padding: 8px; border-radius: 5px; margin-top: 10px; 
                                text-align: center; font-size: 11px; color: #ffaa00;">
                        ⏰ Cooldown: ${remainingMinutes} minutes remaining
                    </div>
                ` : ''}
            </div>
        `;
    }
    
    renderRaidPlanning() {
        const target = this.systems.raid.enemyBases[this.state.get('currentCity')]
            .find(t => t.id === this.selectedTarget);
        
        if (!target) return '';
        
        const currentCity = this.state.get('currentCity');
        const availableGangInCity = this.state.getAvailableGangMembersInCity(currentCity);
        const availableGunsInCity = this.state.getAvailableGunsInCity(currentCity);
        const successChance = this.systems.raid.calculateRaidSuccess(
            this.raidGangSize, availableGunsInCity, target.difficulty, target.gangSize
        );
        const successColor = successChance > 0.7 ? '#66ff66' : 
                           successChance > 0.5 ? '#ffff00' : '#ff6666';
        
        // Check if we have enough guns for the raid
        const hasEnoughGuns = availableGunsInCity >= this.raidGangSize;
        const hasEnoughGang = availableGangInCity >= this.raidGangSize;
        
        // Check if target is on cooldown
        const currentTime = Date.now();
        const cooldownPeriod = 5 * 60 * 1000; // 5 minutes
        const timeSinceLastRaid = currentTime - target.lastRaid;
        const isOnCooldown = timeSinceLastRaid < cooldownPeriod;
        const remainingMinutes = isOnCooldown ? Math.ceil((cooldownPeriod - timeSinceLastRaid) / 1000 / 60) : 0;
        
        const canExecuteRaid = hasEnoughGuns && hasEnoughGang && !isOnCooldown;
        
        return `
            <div style="background: #222; border: 1px solid #444; border-radius: 10px; padding: 15px;">
                <div style="font-size: 14px; color: #ffff00; margin-bottom: 15px; text-align: center;">
                    ⚔️ Raid Planning - ${target.name}
                </div>
                
                <!-- Success Chance -->
                <div style="background: #333; padding: 15px; border-radius: 8px; margin-bottom: 15px; text-align: center;">
                    <div style="font-size: 12px; color: #aaa; margin-bottom: 5px;">Success Chance</div>
                    <div style="font-size: 24px; color: ${successColor}; font-weight: bold;">
                        ${Math.round(successChance * 100)}%
                    </div>
                </div>
                
                <!-- Gang Size Slider -->
                <div style="margin-bottom: 15px;">
                    <div style="font-size: 12px; color: #aaa; margin-bottom: 8px;">
                        👥 Gang Members in ${currentCity}: ${this.raidGangSize} / ${availableGangInCity}
                    </div>
                    <input type="range" min="3" max="${Math.min(availableGangInCity, 25)}" 
                           value="${this.raidGangSize}" 
                           oninput="game.screens.raid.updateGangSize(this.value)"
                           style="width: 100%;">
                    <div style="display: flex; justify-content: space-between; font-size: 10px; color: #666; margin-top: 5px;">
                        <span>3</span>
                        <span>${Math.min(availableGangInCity, 25)}</span>
                    </div>
                </div>
                
                <!-- Raid Details -->
                <div style="background: #333; padding: 10px; border-radius: 5px; margin-bottom: 15px;">
                    <div style="font-size: 11px; color: #aaa; margin-bottom: 8px;">Raid Details</div>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; font-size: 10px;">
                        <div>Your Gang: <span style="color: #ffff00;">${this.raidGangSize}</span></div>
                        <div>Enemy Guards: <span style="color: #ff6666;">${target.gangSize}</span></div>
                        <div>Your Guns: <span style="color: ${hasEnoughGuns ? '#66ff66' : '#ff6666'};">${availableGunsInCity}</span></div>
                        <div>Difficulty: <span style="color: ${this.systems.raid.getDifficultyColor(target.difficulty)};">
                            ${this.systems.raid.getDifficultyText(target.difficulty)}
                        </span></div>
                    </div>
                </div>
                
                <!-- Validation Warnings -->
                ${!hasEnoughGuns ? `
                    <div style="background: #220000; border: 1px solid #660000; border-radius: 8px; 
                                padding: 10px; margin-bottom: 15px;">
                        <div style="font-size: 12px; color: #ff6666;">
                            ⚠️ Not enough guns! You need ${this.raidGangSize} guns for ${this.raidGangSize} gang members, 
                            but only have ${availableGunsInCity} available in ${currentCity}.
                        </div>
                    </div>
                ` : ''}
                
                ${!hasEnoughGang ? `
                    <div style="background: #220000; border: 1px solid #660000; border-radius: 8px; 
                                padding: 10px; margin-bottom: 15px;">
                        <div style="font-size: 12px; color: #ff6666;">
                            ⚠️ Not enough gang members! You need ${this.raidGangSize} gang members, 
                            but only have ${availableGangInCity} available in ${currentCity}.
                        </div>
                    </div>
                ` : ''}
                
                <!-- Execute Raid -->
                <button id="executeRaidBtn" 
                        class="action-btn" 
                        onclick="game.screens.raid.executeRaid()"
                        style="width: 100%; padding: 12px; background: ${canExecuteRaid ? '#660000' : '#333'}; border-color: ${canExecuteRaid ? '#ff6666' : '#666'};"
                        ${!canExecuteRaid ? 'disabled' : ''}>
                    ⚔️ Execute Raid
                </button>
                
                ${!canExecuteRaid ? `
                    <div style="font-size: 11px; color: #666; text-align: center; margin-top: 8px;">
                        ${isOnCooldown ? 
                            `⏰ Target on cooldown - ${remainingMinutes} minutes remaining` : 
                            'Cannot execute raid - requirements not met'
                        }
                    </div>
                ` : ''}
            </div>
        `;
    }
    
    selectTarget(targetId) {
        this.selectedTarget = targetId;
        this.game.showScreen('raid'); // Refresh screen
    }
    
    updateGangSize(size) {
        this.raidGangSize = parseInt(size);
        this.game.showScreen('raid'); // Refresh screen
    }
    
    executeRaid() {
        console.log('executeRaid called');
        console.log('selectedTarget:', this.selectedTarget);
        console.log('raidGangSize:', this.raidGangSize);
        
        if (!this.selectedTarget) {
            this.ui.events.add('Please select a target first', 'neutral');
            return;
        }
        
        const city = this.state.get('currentCity');
        console.log('city:', city);
        console.log('available gang in city:', this.state.getAvailableGangMembersInCity(city));
        console.log('available guns in city:', this.state.getAvailableGunsInCity(city));
        
        const result = this.systems.raid.executeRaid(this.selectedTarget, this.raidGangSize);
        console.log('raid result:', result);
        console.log('result type:', typeof result);
        console.log('result keys:', result ? Object.keys(result) : 'null');
        
        if (result && typeof result === 'object') {
            if (result.onCooldown) {
                // Show cooldown popup
                this.ui.modals.alert(
                    result.error,
                    'Target on Cooldown'
                );
            } else if (result.success !== undefined) {
                this.showRaidResults(result);
            } else {
                console.log('Raid failed or returned false');
                // Show a modal to inform the user about the validation failure
                this.ui.modals.alert(
                    result.error || 'Raid cannot be executed. Check the event log for details about why the raid failed.',
                    'Raid Failed'
                );
            }
        } else {
            console.log('Raid failed or returned false');
            // Show a modal to inform the user about the validation failure
            this.ui.modals.alert(
                'Raid cannot be executed. Check the event log for details about why the raid failed.',
                'Raid Failed'
            );
        }
        // If result is false, the raid system already logged the error message
    }
    
    showRaidResults(result) {
        const modal = this.ui.modals.create('⚔️ Raid Results', this.renderRaidResults(result));
        modal.show();
        
        // Don't reset target selection - let user choose to raid same target again
        // Only reset gang size to default
        this.raidGangSize = 3;
    }
    
    renderRaidResults(result) {
        if (result.success) {
            const cash = result.loot?.cash || 0;
            const drugs = result.loot?.drugs || {};
            const heatIncrease = result.heatIncrease || 0;
            
            return `
                <div style="background: #002200; border: 1px solid #006600; border-radius: 10px; 
                            padding: 20px; text-align: center; margin-bottom: 20px;">
                    <div style="font-size: 48px; margin-bottom: 15px;">✅</div>
                    <div style="font-size: 18px; color: #66ff66; font-weight: bold; margin-bottom: 10px;">
                        Raid Successful!
                    </div>
                    <div style="font-size: 14px; color: #aaffaa;">
                        Looted $${cash.toLocaleString()} and drugs
                    </div>
                </div>
                
                <div style="background: #222; padding: 15px; border-radius: 8px; margin-bottom: 15px;">
                    <div style="font-size: 14px; color: #ffff00; margin-bottom: 10px;">Loot Details</div>
                    <div style="font-size: 12px; color: #aaa;">
                        <div>💰 Cash: $${cash.toLocaleString()}</div>
                        ${Object.keys(drugs).map(drug => 
                            `<div>📦 ${drug}: ${drugs[drug]}</div>`
                        ).join('')}
                    </div>
                </div>
                
                <div style="background: #220000; border: 1px solid #660000; border-radius: 8px; padding: 15px;">
                    <div style="font-size: 12px; color: #ff6666;">
                        🔥 Heat increased by ${heatIncrease.toLocaleString()}
                    </div>
                </div>
            `;
        } else {
            const heatIncrease = result.heatIncrease || 0;
            
            return `
                <div style="background: #220000; border: 1px solid #660000; border-radius: 10px; 
                            padding: 20px; text-align: center; margin-bottom: 20px;">
                    <div style="font-size: 48px; margin-bottom: 15px;">❌</div>
                    <div style="font-size: 18px; color: #ff6666; font-weight: bold; margin-bottom: 10px;">
                        Raid Failed!
                    </div>
                    <div style="font-size: 14px; color: #ffaaaa;">
                        Your gang was defeated
                    </div>
                </div>
                
                <div style="background: #220000; border: 1px solid #660000; border-radius: 8px; padding: 15px;">
                    <div style="font-size: 12px; color: #ff6666;">
                        🔥 Heat increased by ${heatIncrease.toLocaleString()}
                    </div>
                </div>
            `;
        }
    }
} 