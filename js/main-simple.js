console.log('Simple main.js loaded!');

// Simple test to see if basic JavaScript works
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded in simple version');
    
    const container = document.getElementById('screenContainer');
    if (container) {
        container.innerHTML = `
            <div style="color: #00ff00; padding: 20px; text-align: center;">
                <h2>Simple Test Loaded!</h2>
                <p>Basic JavaScript is working.</p>
                <p>Time: ${new Date().toLocaleTimeString()}</p>
            </div>
        `;
    } else {
        console.error('screenContainer not found');
    }
}); 