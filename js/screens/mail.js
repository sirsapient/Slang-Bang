// js/screens/mail.js - Mail/Notifications screen component
export class MailScreen {
    constructor(game) {
        this.game = game;
        this.state = game.state;
        this.ui = game.ui;
    }
    
    render() {
        const notifications = this.state.getNotifications();
        const unreadCount = this.state.getUnreadNotifications().length;
        
        return `
            <div style="background: #222; border: 1px solid #666; border-radius: 10px; padding: 15px; margin-bottom: 20px;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                    <div style="font-size: 18px; font-weight: bold; color: #ffff00;">📧 Mail & Notifications</div>
                    <div style="display: flex; gap: 10px;">
                        <button onclick="game.screens.mail.markAllAsRead()" class="action-btn" style="font-size: 11px;">
                            Mark All Read
                        </button>
                        <button onclick="game.screens.mail.clearAll()" class="action-btn" style="font-size: 11px; background: #ff6666;">
                            Clear All
                        </button>
                    </div>
                </div>
                
                <div style="font-size: 12px; color: #aaa; margin-bottom: 10px;">
                    ${unreadCount} unread • ${notifications.length} total
                </div>
            </div>
            
            <div id="notificationsList" style="max-height: 400px; overflow-y: auto;">
                ${this.renderNotifications(notifications)}
            </div>
            
            <div style="text-align: center; margin-top: 20px;">
                <button onclick="game.showScreen('home')" class="action-btn">
                    ← Back to Home
                </button>
            </div>
        `;
    }
    
    renderNotifications(notifications) {
        if (notifications.length === 0) {
            return `
                <div style="text-align: center; padding: 40px; color: #666;">
                    <div style="font-size: 48px; margin-bottom: 10px;">📭</div>
                    <div style="font-size: 16px; margin-bottom: 5px;">No notifications yet</div>
                    <div style="font-size: 12px;">Game events and updates will appear here</div>
                </div>
            `;
        }
        
        return notifications.map(notification => {
            const typeConfig = {
                info: { icon: '📢', color: '#66ccff' },
                success: { icon: '✅', color: '#66ff66' },
                warning: { icon: '⚠️', color: '#ffcc66' },
                error: { icon: '❌', color: '#ff6666' }
            };
            
            const config = typeConfig[notification.type] || typeConfig.info;
            const isUnread = !notification.read;
            const timeAgo = this.getTimeAgo(notification.timestamp);
            
            return `
                <div class="notification-item ${isUnread ? 'unread' : ''}" 
                     onclick="game.screens.mail.markAsRead(${notification.id})"
                     style="background: ${isUnread ? '#333' : '#222'}; 
                            border: 1px solid ${isUnread ? '#666' : '#444'}; 
                            border-radius: 8px; 
                            padding: 12px; 
                            margin-bottom: 8px; 
                            cursor: pointer;
                            transition: all 0.2s;">
                    <div style="display: flex; align-items: flex-start; gap: 10px;">
                        <div style="font-size: 20px;">${config.icon}</div>
                        <div style="flex: 1;">
                            <div style="color: ${config.color}; font-weight: bold; margin-bottom: 5px;">
                                ${notification.message}
                            </div>
                            <div style="font-size: 11px; color: #666;">
                                Day ${notification.day} • ${timeAgo}
                                ${isUnread ? ' • <span style="color: #66ccff;">NEW</span>' : ''}
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    }
    
    getTimeAgo(timestamp) {
        const now = Date.now();
        const diff = now - timestamp;
        const minutes = Math.floor(diff / (1000 * 60));
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        
        if (days > 0) return `${days}d ago`;
        if (hours > 0) return `${hours}h ago`;
        if (minutes > 0) return `${minutes}m ago`;
        return 'Just now';
    }
    
    onShow() {
        // Mark all notifications as read when opening mail
        this.state.markAllNotificationsAsRead();
        this.refresh();
    }
    
    refresh() {
        const container = document.getElementById('notificationsList');
        if (container) {
            const notifications = this.state.getNotifications();
            container.innerHTML = this.renderNotifications(notifications);
        }
    }
    
    markAsRead(notificationId) {
        this.state.markNotificationAsRead(notificationId);
        this.refresh();
    }
    
    markAllAsRead() {
        this.state.markAllNotificationsAsRead();
        this.refresh();
    }
    
    clearAll() {
        this.ui.modals.confirm(
            'Are you sure you want to clear all notifications?',
            () => {
                this.state.clearNotifications();
                this.refresh();
            }
        );
    }
} 