const BRAIN_CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQnpIVPLG6fIEQ_DCD8ydwGyKlZh2xr6Gkej4RdcajQPJ1M2-CCKZvi_EDn8PKUhvHzNqe2gdgvNr2t/pub?gid=722061266&single=true&output=csv';
const LEADERSHIP_ROLES = ['Leader', 'Co-leader', 'Council', 'Enforcer', 'Recruiter'];
let warInterval;

async function ignite() {
    const keyInput = document.getElementById('apiKey');
    const key = keyInput ? keyInput.value.trim() : '';
    if (key.length !== 16) return;

    try {
        const res = await fetch(`https://api.torn.com/user/?selections=profile&key=${key}`);
        const data = await res.json();

        if (data.name) {
            localStorage.setItem('inferno_key', key);
            
            // Check Permissions
            const isLeadership = LEADERSHIP_ROLES.includes(data.faction.position);
            document.querySelectorAll('.admin-only').forEach(el => {
                el.style.display = isLeadership ? 'block' : 'none';
            });

            document.getElementById('display-name').innerText = data.name;
            document.getElementById('login-screen').style.display = 'none';
            document.getElementById('dashboard').style.display = 'grid';
            
            updateGoalProgress(key);
        }
    } catch (e) { console.error("Ignite failed", e); }
}

async function updateGoalProgress(key) {
    let rawGoal = localStorage.getItem('inferno_user_goal') || "100000000";
    let goalNum = Number(rawGoal);
    try {
        const res = await fetch(`https://api.torn.com/user/?selections=profile&key=${key}`);
        const data = await res.json();
        if (data.name) {
            const total = (data.strength || 0) + (data.speed || 0) + (data.dexterity || 0) + (data.defense || 0);
            let percent = ((total / goalNum) * 100).toFixed(1);
            document.getElementById('goal-percent').innerText = percent + "%";
            document.getElementById('goal-progress-fill').style.width = Math.min(percent, 100) + "%";
            document.getElementById('goal-target-display').innerText = (goalNum / 1000000).toFixed(0) + "M";
        }
    } catch (e) { console.error(e); }
}

async function loadIntelligence() {
    try {
        const res = await fetch(BRAIN_CSV_URL);
        const csv = await res.text();
        const rows = csv.split('\n').filter(r => r.trim() && !r.includes('pageUrl')).slice(1);
        
        const roster = document.getElementById('roster-data');
        const leader = document.getElementById('leaderboard-data');
        roster.innerHTML = ''; leader.innerHTML = '';

        rows.forEach(row => {
            const col = row.split(',').map(c => c.trim().replace(/"/g, ''));
            if (col.length >= 6 && col[1] !== 'null') {
                roster.innerHTML += `<tr><td style="padding:10px;">${col[1]}</td><td style="padding:10px;">${col[4]}</td></tr>`;
                leader.innerHTML += `<tr><td style="padding:10px;">${col[1]}</td><td style="padding:10px; color:#0ff;">+${col[5]}</td></tr>`;
            }
        });
    } catch (e) { console.error(e); }
}

async function scoutPlayer() {
    const id = document.getElementById('recruit-id').value.trim();
    const key = localStorage.getItem('inferno_key');
    const resDiv = document.getElementById('recruit-results');
    if (!id) return;
    
    resDiv.innerHTML = "Scouting neural link...";
    try {
        const res = await fetch(`https://api.torn.com/user/${id}?selections=profile,personalstats&key=${key}`);
        const data = await res.json();
        if (data.name) {
            resDiv.innerHTML = `<div style="border-left:2px solid #ff4500; padding:15px; background:rgba(255,255,255,0.05);">
                <p><strong>${data.name} [${id}]</strong></p>
                <p>Status: ${data.status.description}</p>
                <p>Xanax: ${data.personalstats.xantaken || 0}</p>
            </div>`;
        }
    } catch (e) { resDiv.innerHTML = "Error fetching data."; }
}

function showSection(s) {
    ['dash-view', 'intel-view', 'recruit-view', 'war-view'].forEach(v => {
        const el = document.getElementById(v);
        if (el) el.style.display = 'none';
    });
    document.getElementById(s + '-view').style.display = (s === 'dash') ? 'grid' : 'block';
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
            document.getElementById('chain-bar').style.width = (data.chain.timeout / 300 * 100) + "%";
            let mins = Math.floor(data.chain.timeout / 60);
            let secs = data.chain.timeout % 60;
            document.getElementById('chain-timer').innerText = `${mins}:${secs < 10 ? '0' : ''}${secs}`;
        }
    } catch (e) { console.error(e); }
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

function logout() { localStorage.removeItem('inferno_key'); location.reload(); }
window.onload = () => { if(localStorage.getItem('inferno_key')) ignite(); };
