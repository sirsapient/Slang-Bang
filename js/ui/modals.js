let modalManagerInstanceId = 0;

export class ModalManager {
    constructor() {
        this._instanceId = ++modalManagerInstanceId;
        console.log('ModalManager instance created:', this._instanceId);
        this.activeModal = null;
        this.confirmCallback = null;
        this.cancelCallback = null;
        this.promptCallback = null;
        
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
            setTimeout(() => this._showModal(modal), 350);
        } else {
            this._showModal(modal);
        }
    }
    
    _showModal(modal) {
        // Create modal element
        const modalElement = document.createElement('div');
        modalElement.className = 'modal-overlay';
        modalElement.innerHTML = `
            <div class="modal-content" style="max-width: ${modal.options.maxWidth || '500px'};">
                <div class="modal-header">
                    ${modal.title}
                    <button class="modal-close">×</button>
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
            confirmBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.handleConfirm();
            });
        }
        
        if (cancelBtn) {
            cancelBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                if (this.cancelCallback) {
                    this.cancelCallback();
                }
                this.close();
            });
        }
        
        if (closeBtn) {
            closeBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.close();
            });
        }
        
        // Add event listeners for prompt modal buttons
        const promptSubmitBtn = modalElement.querySelector('#modalPromptSubmitBtn');
        const promptCancelBtn = modalElement.querySelector('#modalPromptCancelBtn');
        
        if (promptSubmitBtn) {
            const inputId = promptSubmitBtn.getAttribute('data-input-id');
            promptSubmitBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.handlePromptSubmit(inputId);
            });
        }
        
        if (promptCancelBtn) {
            promptCancelBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.close();
            });
        }
        
        // Fade in effect
        setTimeout(() => {
            modalElement.style.opacity = '1';
            console.log('Modal overlay style after fade-in', modalElement.style);
        }, 10);
    }
    
    close() {
        console.log('close() called on instance', this._instanceId, 'activeModal:', this.activeModal);
        console.trace(); // Print the call stack for debugging
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
            }, 300);
        } else {
            console.log('close() called but no active modal to remove');
            // Clear callbacks even if no modal
            this.confirmCallback = null;
            this.cancelCallback = null;
            this.promptCallback = null;
        }
    }
    
    confirm(message, onConfirm, onCancel) {
        console.log('confirm() called on instance', this._instanceId);
        
        // Store callbacks before creating modal
        this.confirmCallback = onConfirm;
        this.cancelCallback = onCancel;
        
        const content = `
            <div style="text-align: center; padding: 20px;">
                <p style="margin-bottom: 20px;">${message}</p>
                <button id="modalConfirmBtn" class="action-btn" style="margin: 0 10px;">Confirm</button>
                <button id="modalCancelBtn" class="action-btn" style="margin: 0 10px; background: #ff6666;">Cancel</button>
            </div>
        `;
        
        const modal = this.create('Confirm Action', content);
        modal.show();
    }
    
    handleConfirm() {
        console.log('handleConfirm called on instance', this._instanceId, 'callback:', this.confirmCallback);
        const callback = this.confirmCallback;
        this.close();
        if (callback) {
            // Execute callback after close has started
            setTimeout(() => callback(), 50);
        }
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
}