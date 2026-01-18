// Leadership Role Map
const LEADERSHIP_ROLES = ['Leader', 'Co-leader', 'Council', 'Enforcer', 'Recruiter'];
let warInterval;

/**
 * PHASE 1: Persistent Handshake
 * Runs automatically when the page loads to check for an existing session.
 */
async function checkExistingSession() {
    const savedKey = localStorage.getItem('inferno_key');
    if (savedKey && savedKey.length === 16) {
        // Attempt to re-verify the session without forcing a manual login
        await verifyAndLaunch(savedKey);
    }
}

/**
 * Logic to verify the API key and unlock the dashboard.
 */
async function ignite() {
    const keyInput = document.getElementById('apiKey');
    const key = keyInput ? keyInput.value.trim() : '';
    
    if (key.length === 16) {
        await verifyAndLaunch(key);
    } else {
        const errorMsg = document.getElementById('error-msg');
        if (errorMsg) errorMsg.style.display = 'block';
    }
}

/**
 * The core engine that checks the user's role and populates the UI.
 */
async function verifyAndLaunch(key) {
    try {
        const res = await fetch(`https://api.torn.com/user/?selections=profile&key=${key}`);
        const data = await res.json();

        if (data.name) {
            localStorage.setItem('inferno_key', key);
            
            // ROLE-BASED ACCESS CONTROL
            const userPosition = data.faction.position;
            const isLeadership = LEADERSHIP_ROLES.includes(userPosition);

            // Update UI elements
            document.getElementById('display-name').innerText = data.name;
            document.getElementById('login-screen').style.display = 'none';
            document.getElementById('dashboard').style.display = 'grid';
            
            // Reveal Leadership Sections
            document.querySelectorAll('.admin-only').forEach(el => {
                el.style.display = isLeadership ? 'block' : 'none';
            });

            // Refresh personal stats/goals
            updateGoalProgress(key);
        } else if (data.error && data.error.code === 2) {
            // If the key is invalid, force a logout to clear the bad session
            logout();
        }
    } catch (e) { 
        console.error("Neural link handshake failed:", e); 
    }
}

// ... (Rest of your showSection, logout, and scoutPlayer functions) ...

// Updated initialization
window.onload = checkExistingSession;
