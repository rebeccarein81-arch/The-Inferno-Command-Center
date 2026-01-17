// MUST BE THE CSV EXPORT LINK - Verified format to prevent raw code injection
const BRAIN_CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQnpIVPLG6fIEQ_DCD8ydwGyKlZh2xr6Gkej4RdcajQPJ1M2-CCKZvi_EDn8PKUhvHzNqe2gdgvNr2t/pub?gid=722061266&single=true&output=csv';
let warInterval;

/**
 * Validates the API key and initializes the dashboard.
 */
function ignite() {
    const keyInput = document.getElementById('apiKey');
    const key = keyInput ? keyInput.value.trim() : '';

    if (key.length === 16) {
        localStorage.setItem('inferno_key', key);
        document.getElementById('login-screen').style.display = 'none';
        document.getElementById('dashboard').style.display = 'grid';
        updateGoalProgress(key);
    } else {
        const errorMsg = document.getElementById('error-msg');
        if (errorMsg) errorMsg.style.display = 'block';
    }
}

/**
 * Fetches user stats and updates the "Commander" progress bar.
 */
async function updateGoalProgress(key) {
    let rawGoal = localStorage.getItem('inferno_user_goal') || "100000000";
    let goalNum = Number(rawGoal.replace(/[^0-9.]/g, ''));
    if (goalNum <= 0) goalNum = 100000000;

    const targetDisplay = document.getElementById('goal-target-display');
    if (targetDisplay) targetDisplay.innerText = (goalNum / 1000000).toFixed(0) + "M";

    try {
        const res = await fetch(`https://api.torn.com/user/?selections=profile&key=${key}`);
        const data = await res.json();
        
        if (data.name) {
            document.getElementById('display-name').innerText = data.name;
            const total = (Number(data.strength) || 0) + (Number(data.speed) || 0) + 
                          (Number(data.dexterity) || 0) + (Number(data.defense) || 0);

            let percent = ((total / goalNum) * 100).toFixed(1);
            document.getElementById('goal-percent').innerText = percent + "%";
            document.getElementById('goal-progress-fill').style.width = Math.min(percent, 100) + "%";
            document.getElementById('motivation-text').innerText = (percent >= 100) ? "GOAL ACHIEVED." : "Target locked.";
        }
    } catch (e) { 
        console.error("Stat fetch failed", e); 
    }
}

/**
 * Loads Intelligence data and cleans Google Sheets metadata.
 */
async function loadIntelligence() {
    if (BRAIN_CSV_URL.includes('PASTE')) return;
    try {
        const res = await fetch(BRAIN_CSV_URL);
        const csv = await res.text();
        
        // Clean rows to skip metadata snippets and empty lines
        const rows = csv.split('\n')
            .filter(r => r.trim() && !r.includes('pageUrl') && !r.includes('f{a=a.split'))
            .slice(1);
        
        const roster = document.getElementById('roster-data');
        const leader = document.getElementById('leaderboard-data');
        roster.innerHTML = ''; leader.innerHTML = '';

        rows.forEach(row => {
            const col = row.split(',').map(c => c.trim().replace(/"/g, ''));
            // Ensure columns exist and contain valid member names
            if (col.length >= 6 && col[1] && col[1] !== 'null' && col[1] !== 'NAME') {
                roster.innerHTML += `<tr><td style="padding:10px; border-bottom:1px solid #333;">${col[1]}</td><td style="padding:10px; border-bottom:1px solid #333;">${col[4]}</td></tr>`;
                leader.innerHTML += `<tr><td style="padding:10px; border-bottom:1px solid #333;">${col[1]}</td><td style="padding:10px; border-bottom:1px solid #333; color:#0ff;">+${col[5]}</td></tr>`;
            }
        });
    } catch (e) { 
        console.error("Intel fetch failed", e); 
    }
}

/**
 * Updates real-time faction data for the War Room.
 */
async function updateWarData() {
    const key = localStorage.getItem('inferno_key');
    try {
        const res = await fetch(`https://api.torn.com/faction/?selections=basic&key=${key}`);
        const data = await res.json();
        
        if (data.chain) {
            document.getElementById('chain-count').innerText = data.chain.current;
            // Chain bar percentage based on 5-minute cooldown (300s)
            document.getElementById('chain-bar').style.width = (data.chain.timeout / 300 * 100) + "%";
            
            let mins = Math.floor(data.chain.timeout / 60);
            let secs = data.chain.timeout % 60;
            document.getElementById('chain-timer').innerText = `${mins}:${secs < 10 ? '0' : ''}${secs}`;
        }
    } catch (e) { 
        console.error("War fetch failed", e); 
    }
}

/**
 * Tab switcher and view manager.
 */
function showSection(s) {
    const sections = ['dash-view', 'intel-view', 'war-view'];
    sections.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.style.display = 'none';
    });

    const targetView = document.getElementById(s + '-view');
    if (targetView) targetView.style.display = (s === 'dash') ? 'grid' : 'block';
    
    document.getElementById('view-title').innerText = s.toUpperCase();

    // Reset intervals and load specific data
    clearInterval(warInterval);
    if (s === 'intel') loadIntelligence();
    if (s === 'war') {
        updateWarData();
        warInterval = setInterval(updateWarData, 15000); // 15s refresh
    }

    // Update nav-link styling
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
        if (link.innerText.toLowerCase() === s) link.classList.add('active');
    });
}

function toggleGoalInput() {
    const area = document.getElementById('goal-input-area');
    area.style.display = (area.style.display === 'none') ? 'block' : 'none';
}

function saveGoal() {
    localStorage.setItem('inferno_user_goal', document.getElementById('new-goal-val').value);
    toggleGoalInput();
    updateGoalProgress(localStorage.getItem('inferno_key'));
}

function logout() { 
    localStorage.removeItem('inferno_key'); 
    location.reload(); 
}

window.onload = () => { 
    if(localStorage.getItem('inferno_key')) ignite(); 
};
