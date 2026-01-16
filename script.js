// --- CONFIGURATION ---
const BRAIN_CSV_URL = 'PASTE_YOUR_PUBLISHED_CSV_URL_HERE';

// --- CORE ENGINE ---
async function ignite() {
    const key = document.getElementById('apiKey').value;
    if (key.length === 16) {
        localStorage.setItem('inferno_key', key);
        document.getElementById('login-screen').style.display = 'none';
        document.getElementById('dashboard').style.display = 'grid';
        
        // Run all the math
        updateIdentity(key);
        updateGoalProgress(key);
    } else {
        document.getElementById('error-msg').style.display = 'block';
    }
}

// MATH: Calculates Progress toward Personal Goal
async function updateGoalProgress(key) {
    const savedGoal = localStorage.getItem('inferno_user_goal') || 100000000;
    document.getElementById('goal-target-display').innerText = (savedGoal / 1000000).toFixed(0) + "M";

    const res = await fetch(`https://api.torn.com/user/?selections=profile&key=${key}`);
    const data = await res.json();
    
    // The Math: Summing the 4 battle stats
    const total = data.strength + data.speed + data.dexterity + data.defense;
    const percent = Math.min((total / savedGoal) * 100, 100).toFixed(1);

    document.getElementById('goal-percent').innerText = percent + "%";
    document.getElementById('goal-progress-fill').style.width = percent + "%";
    
    // Motivation Logic
    const mot = document.getElementById('motivation-text');
    if(percent < 50) mot.innerText = "Smoke is rising. Getting stronger.";
    else if(percent < 100) mot.innerText = "Target in sight. Burn it down.";
    else mot.innerText = "GOAL ACHIEVED. Set a new target.";
}

// MATH: Calculates Weekly Gains (API Stats - Google Sheet Stats)
async function loadLeaderboard() {
    const tbody = document.getElementById('leaderboard-data');
    tbody.innerHTML = '<tr><td colspan="3">Calculating gains...</td></tr>';

    try {
        const response = await fetch(BRAIN_CSV_URL);
        const csvText = await response.text();
        const rows = csvText.split('\n').slice(1); // Skip header

        tbody.innerHTML = ''; // Clear loading
        rows.forEach((row, index) => {
            const cols = row.split(',');
            if (cols.length >= 2) {
                const name = cols[0];
                const oldStats = parseFloat(cols[1]); // Stats from last week
                
                // In a full version, we'd fetch each member's live stats here
                // For now, we display the gain recorded in 'The Brain'
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td style="padding:15px; border-bottom:1px solid rgba(255,255,255,0.05); font-weight:bold;">${name}</td>
                    <td style="padding:15px; border-bottom:1px solid rgba(255,255,255,0.05); color:#00ff00;">+${oldStats.toLocaleString()}</td>
                    <td style="padding:15px; border-bottom:1px solid rgba(255,255,255,0.05); color:#888;">#${index + 1}</td>
                `;
                tbody.appendChild(tr);
            }
        });
    } catch (err) {
        console.error("The Brain is offline.", err);
    }
}

// --- NAVIGATION & UTILS ---
function showSection(section) {
    document.getElementById('dash-view').style.display = (section === 'dash') ? 'grid' : 'none';
    document.getElementById('intel-view').style.display = (section === 'intel') ? 'block' : 'none';
    if(section === 'intel') loadLeaderboard();
}

function toggleGoalInput() {
    const area = document.getElementById('goal-input-area');
    area.style.display = (area.style.display === 'none') ? 'block' : 'none';
}

function saveGoal() {
    const val = document.getElementById('new-goal-val').value;
    if(val) {
        localStorage.setItem('inferno_user_goal', val);
        document.getElementById('goal-input-area').style.display = 'none';
        updateGoalProgress(localStorage.getItem('inferno_key'));
    }
}

function logout() { localStorage.removeItem('inferno_key'); location.reload(); }

window.onload = () => {
    const saved = localStorage.getItem('inferno_key');
    if(saved) { document.getElementById('apiKey').value = saved; ignite(); }
};
