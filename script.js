// MUST BE THE CSV EXPORT LINK
const BRAIN_CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQnpIVPLG6fIEQ_DCD8ydwGyKlZh2xr6Gkej4RdcajQPJ1M2-CCKZvi_EDn8PKUhvHzNqe2gdgvNr2t/pub?gid=722061266&single=true&output=csv';

// Define your leadership team roles
const LEADERSHIP_ROLES = ['Leader', 'Co-leader', 'Council', 'Enforcer', 'Recruiter'];
let warInterval;

/**
 * Validates the API key and initializes the dashboard views.
 */
async function ignite() {
    const keyInput = document.getElementById('apiKey');
    const key = keyInput ? keyInput.value.trim() : '';

    if (key.length === 16) {
        try {
            const res = await fetch(`https://api.torn.com/user/?selections=profile&key=${key}`);
            const data = await res.json();

            if (data.name) {
                localStorage.setItem('inferno_key', key);
                
                // Identify the user's role from their faction position
                const userPosition = data.faction.position;
                const isLeadership = LEADERSHIP_ROLES.includes(userPosition);

                document.getElementById('display-name').innerText = data.name;
                document.getElementById('login-screen').style.display = 'none';
                document.getElementById('dashboard').style.display = 'grid';
                
                // Show admin links only if they have a leadership role
                document.querySelectorAll('.admin-only').forEach(el => {
                    el.style.display = isLeadership ? 'block' : 'none';
                });

                updateGoalProgress(key);
            }
        } catch (e) { 
            console.error("Ignite Sequence Failed:", e); 
        }
    } else {
        document.getElementById('error-msg').style.display = 'block';
    }
}

/**
 * Loads Intelligence data and cleans Google Sheets metadata.
 */
async function loadIntelligence() {
    try {
        const res = await fetch(BRAIN_CSV_URL);
        const csv = await res.text();
        
        // Filter out metadata and empty rows
        const rows = csv.split('\n').filter(r => r.trim() && !r.includes('pageUrl') && !r.includes('f{a=a.split')).slice(1);
        
        const roster = document.getElementById('roster-data');
        const leader = document.getElementById('leaderboard-data');
        roster.innerHTML = ''; leader.innerHTML = '';

        rows.forEach(row => {
            const col = row.split(',').map(c => c.trim().replace(/"/g, ''));
            if (col.length >= 6 && col[1] && col[1] !== 'null') {
                roster.innerHTML += `<tr><td style="padding:10px; border-bottom:1px solid #333;">${col[1]}</td><td style="padding:10px; border-bottom:1px solid #333;">${col[4]}</td></tr>`;
                leader.innerHTML += `<tr><td style="padding:10px; border-bottom:1px solid #333;">${col[1]}</td><td style="padding:10px; border-bottom:1px solid #333; color:#0ff;">+${col[5]}</td></tr>`;
            }
        });
    } catch (e) { console.error("Intel fetch failed", e); }
}

/**
 * Recruitment Scout Tool for leadership team.
 */
async function scoutPlayer() {
    const targetId = document.getElementById('recruit-id').value.trim();
    const key = localStorage.getItem('inferno_key');
    const resultsDiv = document.getElementById('recruit-results');
    
    if (!targetId) return;
    resultsDiv.innerHTML = "Accessing Neural Link...";

    try {
        const res = await fetch(`https://api.torn.com/user/${targetId}?selections=profile,personalstats&key=${key}`);
        const data = await res.json();
        
        if (data.name) {
            resultsDiv.innerHTML = `
                <div style="border-left: 3px solid #ff4500; padding: 15px; background: rgba(255,255,255,0.05);">
                    <p><strong>NAME:</strong> ${data.name} [${targetId}]</p>
                    <p><strong>STATUS:</strong> ${data.status.description}</p>
                    <p><strong>XANAX TAKEN:</strong> ${data.personalstats.xantaken || 0}</p>
                    <p><strong>LAST ACTION:</strong> ${data.last_action.relative}</p>
                </div>
            `;
        }
    } catch (e) { resultsDiv.innerHTML = "Scouting failed."; }
}

async function updateGoalProgress(key) {
    try {
        const res = await fetch(`https://api.torn.com/user/?selections=profile&key=${key}`);
        const data = await res.json();
        const total = (data.strength || 0) + (data.speed || 0) + (data.dexterity || 0) + (data.defense || 0);
        let percent = ((total / 1000000) * 100).toFixed(1); 
        document.getElementById('goal-percent').innerText = percent + "%";
        document.getElementById('goal-progress-fill').style.width = Math.min(percent, 100) + "%";
    } catch (e) { console.error(e); }
}

function showSection(s) {
    const views = ['dash-view', 'intel-view', 'recruit-view', 'war-view'];
    views.forEach(v => {
        const el = document.getElementById(v);
        if (el) el.style.display = 'none';
    });
    
    const target = document.getElementById(s + '-view');
    if (target) {
        target.style.display = (s === 'dash') ? 'grid' : 'block';
    }
    
    document.getElementById('view-title').innerText = s.toUpperCase();
    
    clearInterval(warInterval);
    if (s === 'intel') loadIntelligence();
    if (s === 'war') {
        updateWarData();
        warInterval = setInterval(updateWarData, 15000);
    }
}

async function updateWarData() {
    const key = localStorage.getItem('inferno_key');
    try {
        const res = await fetch(`https://api.torn.com/faction/?selections=basic&key=${key}`);
        const data = await res.json();
        if (data.chain) {
            document.getElementById('chain-count').innerText = data.chain.current;
            let mins = Math.floor(data.chain.timeout / 60);
            let secs = data.chain.timeout % 60;
            document.getElementById('chain-timer').innerText = `${mins}:${secs < 10 ? '0' : ''}${secs}`;
        }
    } catch (e) { console.error(e); }
}

function logout() { localStorage.removeItem('inferno_key'); location.reload(); }

window.onload = () => { if(localStorage.getItem('inferno_key')) ignite(); };
