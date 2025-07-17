// js/ui/modals.js - Modal management system
export class ModalManager {
    constructor() {
        this.activeModal = null;
        this.container = document.getElementById('modalContainer');
        
        // Create container if it doesn't exist
        if (!this.container) {
            this.container = document.createElement('div');
            this.container.id = 'modalContainer';
            document.body.appendChild(this.container);
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
        // Close any existing modal
        this.close();
        
        // Create modal element
        const modalElement = document.createElement('div');
        modalElement.className = 'modal-overlay';
        modalElement.innerHTML = `
            <div class="modal-content" style="max-width: ${modal.options.maxWidth || '500px'};">
                <div class="modal-header">
                    ${modal.title}
                    <button class="modal-close" onclick="game.ui.modals.close()">×</button>
                </div>
                <div class="modal-body">
                    ${modal.content}
                </div>
            </div>
        `;
        
        // Handle click outside
        modalElement.addEventListener('click', (e) => {
            if (e.target === modalElement) {
                this.close();
            }
        });
        
        // Add to DOM
        this.container.appendChild(modalElement);
        modal.element = modalElement;
        this.activeModal = modal;
        
        // Fade in effect
        setTimeout(() => {
            modalElement.style.opacity = '1';
        }, 10);
    }
    
    close() {
        if (this.activeModal && this.activeModal.element) {
            const element = this.activeModal.element;
            
            // Fade out effect
            element.style.opacity = '0';
            
            setTimeout(() => {
                element.remove();
                this.activeModal = null;
            }, 300);
        }
    }
    
    confirm(message, onConfirm, onCancel) {
        const content = `
            <div style="text-align: center; padding: 20px;">
                <p style="margin-bottom: 20px;">${message}</p>
                <button onclick="game.ui.modals.handleConfirm()" class="action-btn" 
                        style="margin: 0 10px;">Confirm</button>
                <button onclick="game.ui.modals.close()" class="action-btn" 
                        style="margin: 0 10px; background: #ff6666;">Cancel</button>
            </div>
        `;
        
        this.confirmCallback = onConfirm;
        this.cancelCallback = onCancel;
        
        const modal = this.create('Confirm Action', content);
        modal.show();
    }
    
    handleConfirm() {
        if (this.confirmCallback) {
            this.confirmCallback();
        }
        this.close();
    }
    
    alert(message, title = 'Alert') {
        const content = `
            <div style="text-align: center; padding: 20px;">
                <p style="margin-bottom: 20px;">${message}</p>
                <button onclick="game.ui.modals.close()" class="action-btn">OK</button>
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
                    <button onclick="game.ui.modals.handlePromptSubmit('${inputId}')" 
                            class="action-btn" style="margin: 0 10px;">Submit</button>
                    <button onclick="game.ui.modals.close()" 
                            class="action-btn" style="margin: 0 10px; background: #ff6666;">Cancel</button>
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
}