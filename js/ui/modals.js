let modalManagerInstanceId = 0;

export class ModalManager {
    constructor() {
        this._instanceId = ++modalManagerInstanceId;
        console.log('ModalManager instance created:', this._instanceId);
        this.activeModal = null;
        this.confirmCallback = null;
        this.cancelCallback = null;
        this.promptCallback = null;
        this.isShowing = false;
        this.isClosing = false;
        // Notification queue
        this.notificationQueue = [];
        this.notificationActive = false;
        
        // Always attach modal container to body for proper positioning
        this.container = document.body;
        
        // Create or reuse modal overlay container
        this.modalOverlayContainer = document.getElementById('modalContainer');
        if (!this.modalOverlayContainer) {
            this.modalOverlayContainer = document.createElement('div');
            this.modalOverlayContainer.id = 'modalContainer';
            this.modalOverlayContainer.style.position = 'fixed';
            this.modalOverlayContainer.style.top = '0';
            this.modalOverlayContainer.style.left = '0';
            this.modalOverlayContainer.style.width = '100%';
            this.modalOverlayContainer.style.height = '100%';
            this.modalOverlayContainer.style.zIndex = '9999';
            this.modalOverlayContainer.style.pointerEvents = 'none';
            this.container.appendChild(this.modalOverlayContainer);
        } else if (!this.modalOverlayContainer.parentNode) {
            this.container.appendChild(this.modalOverlayContainer);
        }
    }
    
    create(title, content, options = {}) {
        const modal = {
            title,
            content,
            options,
            element: null
        };
        
        modal.show = () => this.show(modal);
        modal.close = () => this.close();
        
        return modal;
    }
    
    show(modal) {
        // Prevent multiple rapid show calls
        if (this.isShowing) {
            console.log('Modal already showing, ignoring duplicate call');
            return;
        }
        
        this.isShowing = true;
        
        // Always re-append the container if it was removed
        if (!this.modalOverlayContainer.parentNode) {
            this.container.appendChild(this.modalOverlayContainer);
        }
        this.modalOverlayContainer.style.display = 'flex';
        
        console.log('show() called on instance', this._instanceId);
        
        // Close any existing modal first
        if (this.activeModal) {
            this.close();
            // Wait for close animation
            setTimeout(() => {
                this._showModal(modal);
                this.isShowing = false;
            }, 350);
        } else {
            // Add a small delay to ensure DOM is ready
            setTimeout(() => {
                this._showModal(modal);
                this.isShowing = false;
            }, 50);
        }
    }
    
    _showModal(modal) {
        // Create modal element
        const modalElement = document.createElement('div');
        modalElement.className = 'modal-overlay';
        modalElement.innerHTML = `
            <div class="modal-content" style="max-width: ${modal.options.maxWidth || '500px'};">
                <div class="modal-header">
                    <span class="modal-title">${modal.title || ''}</span>
                    ${modal.options.noCloseButton ? '' : '<button class="modal-close">×</button>'}
                </div>
                <div class="modal-body">
                    ${modal.content}
                </div>
            </div>
        `;
        
        // Handle click outside with a small delay to prevent immediate closing
        modalElement.addEventListener('click', (e) => {
            if (e.target === modalElement) {
                // Add a small delay to prevent accidental closing
                setTimeout(() => {
                    if (this.activeModal === modal) {
                        this.close();
                    }
                }, 100);
            }
        });
        
        // Add to DOM
        this.modalOverlayContainer.appendChild(modalElement);
        console.log('Modal overlay appended', modalElement);
        modal.element = modalElement;
        this.activeModal = modal;
        
        // Ensure modal is visible and clickable
        modalElement.style.opacity = '0';
        modalElement.style.pointerEvents = 'auto';
        this.modalOverlayContainer.style.pointerEvents = 'auto';
        console.log('Modal overlay style after append', modalElement.style);
        
        // Add event listeners for modal buttons
        const confirmBtn = modalElement.querySelector('#modalConfirmBtn');
        const cancelBtn = modalElement.querySelector('#modalCancelBtn');
        const closeBtn = modalElement.querySelector('.modal-close');
        
        if (confirmBtn) {
            // Ensure button is clickable
            confirmBtn.style.cursor = 'pointer';
            confirmBtn.style.pointerEvents = 'auto';
            confirmBtn.style.userSelect = 'none';
            
            // Remove any existing listeners to prevent duplicates
            const newConfirmBtn = confirmBtn.cloneNode(true);
            confirmBtn.parentNode.replaceChild(newConfirmBtn, confirmBtn);
            
            // Add click listener with proper event handling
            newConfirmBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                e.stopImmediatePropagation();
                this.handleConfirm();
            }, true); // Use capture phase
            
            // Also add mousedown as backup
            newConfirmBtn.addEventListener('mousedown', (e) => {
                e.preventDefault();
                e.stopPropagation();
            });
        }
        
        if (cancelBtn) {
            // Ensure button is clickable
            cancelBtn.style.cursor = 'pointer';
            cancelBtn.style.pointerEvents = 'auto';
            cancelBtn.style.userSelect = 'none';
            
            // Remove any existing listeners to prevent duplicates
            const newCancelBtn = cancelBtn.cloneNode(true);
            cancelBtn.parentNode.replaceChild(newCancelBtn, cancelBtn);
            
            // Add click listener with proper event handling
            newCancelBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                e.stopImmediatePropagation();
                if (this.cancelCallback) {
                    this.cancelCallback();
                }
                this.close();
            }, true); // Use capture phase
        }
        
        if (closeBtn) {
            // Ensure button is clickable
            closeBtn.style.cursor = 'pointer';
            closeBtn.style.pointerEvents = 'auto';
            closeBtn.style.userSelect = 'none';
            
            // Remove any existing listeners to prevent duplicates
            const newCloseBtn = closeBtn.cloneNode(true);
            closeBtn.parentNode.replaceChild(newCloseBtn, closeBtn);
            
            // Add click listener with proper event handling
            newCloseBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                e.stopImmediatePropagation();
                this.close();
            }, true); // Use capture phase
        }
        
        // Add event listeners for prompt modal buttons
        const promptSubmitBtn = modalElement.querySelector('#modalPromptSubmitBtn');
        const promptCancelBtn = modalElement.querySelector('#modalPromptCancelBtn');
        
        if (promptSubmitBtn) {
            const inputId = promptSubmitBtn.getAttribute('data-input-id');
            
            // Ensure button is clickable
            promptSubmitBtn.style.cursor = 'pointer';
            promptSubmitBtn.style.pointerEvents = 'auto';
            promptSubmitBtn.style.userSelect = 'none';
            
            // Remove any existing listeners to prevent duplicates
            const newPromptSubmitBtn = promptSubmitBtn.cloneNode(true);
            promptSubmitBtn.parentNode.replaceChild(newPromptSubmitBtn, promptSubmitBtn);
            
            // Add click listener with proper event handling
            newPromptSubmitBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                e.stopImmediatePropagation();
                this.handlePromptSubmit(inputId);
            }, true); // Use capture phase
        }
        
        if (promptCancelBtn) {
            // Ensure button is clickable
            promptCancelBtn.style.cursor = 'pointer';
            promptCancelBtn.style.pointerEvents = 'auto';
            promptCancelBtn.style.userSelect = 'none';
            
            // Remove any existing listeners to prevent duplicates
            const newPromptCancelBtn = promptCancelBtn.cloneNode(true);
            promptCancelBtn.parentNode.replaceChild(newPromptCancelBtn, promptCancelBtn);
            
            // Add click listener with proper event handling
            newPromptCancelBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                e.stopImmediatePropagation();
                this.close();
            }, true); // Use capture phase
        }
        
        // Handle alert button
        const alertBtn = modalElement.querySelector('#modalAlertBtn');
        if (alertBtn) {
            // Ensure button is clickable
            alertBtn.style.cursor = 'pointer';
            alertBtn.style.pointerEvents = 'auto';
            alertBtn.style.userSelect = 'none';
            
            // Remove any existing listeners to prevent duplicates
            const newAlertBtn = alertBtn.cloneNode(true);
            alertBtn.parentNode.replaceChild(newAlertBtn, alertBtn);
            
            // Add click listener with proper event handling
            newAlertBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                e.stopImmediatePropagation();
                this.close();
            }, true); // Use capture phase
        }
        
        // Fade in effect
        setTimeout(() => {
            modalElement.style.opacity = '1';
        }, 10);
    }
    
    close() {
        console.log('close() called on instance', this._instanceId, 'activeModal:', this.activeModal);
        console.trace(); // Print the call stack for debugging
        
        // Prevent rapid closing
        if (this.isClosing) {
            console.log('Modal already closing, ignoring duplicate call');
            return;
        }
        
        this.isClosing = true;
        
        if (this.activeModal && this.activeModal.element) {
            const element = this.activeModal.element;
            // Fade out effect
            element.style.opacity = '0';
            setTimeout(() => {
                element.remove();
                this.activeModal = null;
                // Clear callbacks after modal is removed
                this.confirmCallback = null;
                this.cancelCallback = null;
                this.promptCallback = null;
                this.modalOverlayContainer.style.pointerEvents = 'none';
                if (this.modalOverlayContainer.childElementCount === 0) {
                    // Remove the container from the DOM entirely
                    if (this.modalOverlayContainer.parentNode) {
                        this.modalOverlayContainer.parentNode.removeChild(this.modalOverlayContainer);
                    }
                }
                console.log('Modal removed and overlay hidden');
                this.isClosing = false;
            }, 300);
        } else {
            console.log('close() called but no active modal to remove');
            // Clear callbacks even if no modal
            this.confirmCallback = null;
            this.cancelCallback = null;
            this.promptCallback = null;
            this.isClosing = false;
        }
    }
    
    confirm(message, onConfirm, onCancel) {
        // Store callbacks before creating modal
        this.confirmCallback = onConfirm;
        this.cancelCallback = onCancel;
        
        const content = `
            <div style="text-align: center; padding: 20px;">
                <p style="margin-bottom: 20px;">${message}</p>
                <button id="modalConfirmBtn" class="action-btn" style="margin: 0 10px; cursor: pointer;">Confirm</button>
                <button id="modalCancelBtn" class="action-btn" style="margin: 0 10px; background: #ff6666; cursor: pointer;">Cancel</button>
            </div>
        `;
        
        // Create and show modal using the proper show method
        const modal = this.create('Confirm Action', content, { maxWidth: '500px' });
        
        // Add a small delay to prevent rapid modal creation
        setTimeout(() => {
            modal.show();
        }, 100);
    }
    
    handleConfirm() {
        const callback = this.confirmCallback;
        this.close();
        if (callback) {
            // Execute callback after close has started
            setTimeout(() => {
                callback();
            }, 50);
        }
    }
    
    alert(message, title = 'Alert') {
        const content = `
            <div style="text-align: center; padding: 20px;">
                <p style="margin-bottom: 20px;">${message}</p>
                <button id="modalAlertBtn" class="action-btn">OK</button>
            </div>
        `;
        
        const modal = this.create(title, content);
        modal.show();
    }
    
    prompt(message, defaultValue = '', onSubmit) {
        const inputId = 'modalPromptInput';
        const content = `
            <div style="padding: 20px;">
                <p style="margin-bottom: 15px;">${message}</p>
                <input type="text" id="${inputId}" value="${defaultValue}" 
                       class="quantity-input" style="width: 100%; margin-bottom: 15px;">
                <div style="text-align: center;">
                    <button id="modalPromptSubmitBtn" data-input-id="${inputId}" class="action-btn" style="margin: 0 10px;">Submit</button>
                    <button id="modalPromptCancelBtn" class="action-btn" style="margin: 0 10px; background: #ff6666;">Cancel</button>
                </div>
            </div>
        `;
        this.promptCallback = onSubmit;
        const modal = this.create('Input Required', content);
        modal.show();
        // Focus input
        setTimeout(() => {
            const input = document.getElementById(inputId);
            if (input) input.focus();
        }, 100);
    }
    
    handlePromptSubmit(inputId) {
        const input = document.getElementById(inputId);
        if (input && this.promptCallback) {
            this.promptCallback(input.value);
        }
        this.close();
    }
    
    loading(message = 'Loading...') {
        const content = `
            <div style="text-align: center; padding: 40px;">
                <div class="loading">${message}</div>
            </div>
        `;
        
        const modal = this.create('', content, { maxWidth: '300px' });
        modal.show();
        
        return modal;
    }
    
    // Notification popup system with queue
    showNotification(message, type = 'info', duration = 4000) {
        // Add to queue
        this.notificationQueue.push({ message, type, duration });
        this._processNotificationQueue();
    }

    _processNotificationQueue() {
        if (this.notificationActive || this.notificationQueue.length === 0) return;
        this.notificationActive = true;
        const { message, type, duration } = this.notificationQueue.shift();
        const typeConfig = {
            info: { icon: '📢', color: '#66ccff' },
            success: { icon: '✅', color: '#66ff66' },
            warning: { icon: '⚠️', color: '#ffcc66' },
            error: { icon: '❌', color: '#ff6666' }
        };
        const config = typeConfig[type] || typeConfig.info;
        const content = `
            <div style="text-align: center; padding: 20px;">
                <div style="font-size: 32px; margin-bottom: 10px;">${config.icon}</div>
                <p style="color: ${config.color}; font-weight: bold; margin: 0;">${message}</p>
            </div>
        `;
        // Always show close button for notifications
        const modal = this.create('', content, { 
            maxWidth: '400px',
            noCloseButton: false
        });
        // Override close to process next notification
        const originalClose = modal.close;
        modal.close = () => {
            originalClose.call(this);
            this.notificationActive = false;
            setTimeout(() => this._processNotificationQueue(), 100); // Small delay to avoid race
        };
        modal.show();
        // Auto-close after duration unless duration is 0 (for forced interaction modals)
        if (duration > 0) {
            setTimeout(() => {
                if (this.activeModal === modal) {
                    modal.close();
                }
            }, duration);
        }
        return modal;
    }
}