// Replace with your actual Google Sheets CSV export link
const BRAIN_CSV_URL = 'PASTE_YOUR_CSV_LINK_HERE';

/**
 * Validates the API key and switches the view from Login to Dashboard.
 */
function ignite() {
    const keyInput = document.getElementById('apiKey');
    const key = keyInput ? keyInput.value.trim() : '';

    if (key.length === 16) {
        localStorage.setItem('inferno_key', key);
        
        // Switch screens
        document.getElementById('login-screen').style.display = 'none';
        document.getElementById('dashboard').style.display = 'grid';
        
        console.log("System Ignited. Welcome, Commander.");
        updateGoalProgress(key);
    } else {
        const errorMsg = document.getElementById('error-msg');
        if (errorMsg) errorMsg.style.display = 'block';
    }
}

/**
 * Fetches user stats from Torn API and updates the Goal Progress bar.
 */
async function updateGoalProgress(key) {
    let rawGoal = localStorage.getItem('inferno_user_goal') || "100000000";
    let goalNum = Number(rawGoal.replace(/[^0-9.]/g, ''));
    if (goalNum <= 0) goalNum = 100000000;

    const targetDisplay = document.getElementById('goal-target-display');
    if (targetDisplay) {
        targetDisplay.innerText = (goalNum / 1000000).toFixed(0) + "M";
    }

    try {
        const res = await fetch(`https://api.torn.com/user/?selections=profile&key=${key}`);
        const data = await res.json();
        
        if (data.error) {
            console.error("Torn API Error:", data.error.error);
            return;
        }

        const total = (Number(data.strength) || 0) + (Number(data.speed) || 0) + 
                      (Number(data.dexterity) || 0) + (Number(data.defense) || 0);

        if (total > 0) {
            let percent = ((total / goalNum) * 100).toFixed(1);
            document.getElementById('display-name').innerText = data.name;
            document.getElementById('goal-percent').innerText = percent + "%";
            document.getElementById('goal-progress-fill').style.width = Math.min(percent, 100) + "%";
            document.getElementById('motivation-text').innerText = (percent >= 100) ? "GOAL ACHIEVED." : "Target locked.";
        }
    } catch (err) { 
        console.error("Failed to update stats:", err); 
    }
}

/**
 * Loads Intelligence data from the CSV link provided.
 */
async function loadIntelligence() {
    if (!BRAIN_CSV_URL || BRAIN_CSV_URL === 'PASTE_YOUR_CSV_LINK_HERE') {
        console.warn("Intelligence source (CSV URL) is not configured.");
        return;
    }

    try {
        const res = await fetch(BRAIN_CSV_URL);
        const csv = await res.text();
        const rows = csv.split('\n').filter(row => row.trim() !== '').slice(1);
        
        const roster = document.getElementById('roster-data');
        const leader = document.getElementById('leaderboard-data');
        if (!roster || !leader) return;

        roster.innerHTML = ''; 
        leader.innerHTML = '';

        rows.forEach(row => {
            const col = row.split(',').map(item => item.trim());
            if (col.length >= 6) {
                const name = col[1]; // Column B
                const xanax = col[4]; // Column E
                const gain = col[5]; // Column F

                roster.innerHTML += `<tr><td style="padding:10px; border-bottom:1px solid #333;">${name}</td><td style="padding:10px; border-bottom:1px solid #333;">${xanax}</td></tr>`;
                leader.innerHTML += `<tr><td style="padding:10px; border-bottom:1px solid #333;">${name}</td><td style="padding:10px; border-bottom:1px solid #333; color:#00ff00;">+${gain}</td></tr>`;
            }
        });
    } catch (err) { 
        console.error("Intelligence load failed:", err); 
    }
}

/**
 * Handles tab switching within the dashboard.
 */
function showSection(s) {
    const dashView = document.getElementById('dash-view');
    const intelView = document.getElementById('intel-view');
    
    if (dashView) dashView.style.display = (s === 'dash') ? 'grid' : 'none';
    if (intelView) intelView.style.display = (s === 'intel') ? 'block' : 'none';
    
    if (s === 'intel') loadIntelligence();

    // Update active state for nav links
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
        if (link.innerText.toLowerCase() === s) link.classList.add('active');
    });
}

function saveGoal() {
    const newVal = document.getElementById('new-goal-val').value;
    localStorage.setItem('inferno_user_goal', newVal);
    document.getElementById('goal-input-area').style.display = 'none';
    updateGoalProgress(localStorage.getItem('inferno_key'));
}

function toggleGoalInput() {
    const area = document.getElementById('goal-input-area');
    area.style.display = (area.style.display === 'none') ? 'block' : 'none';
}

function logout() { 
    localStorage.removeItem('inferno_key'); 
    location.reload(); 
}

// Check for existing key on load
window.onload = () => { 
    if (localStorage.getItem('inferno_key')) {
        ignite(); 
    } 
};
