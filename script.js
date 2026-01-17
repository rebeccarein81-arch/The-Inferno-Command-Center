const BRAIN_CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQnpIVPLG6flEQ_DCD8ydwGyKlZh2xr6Gkej4RdcajQPJ1M2-CCKZvi_EDn8PKUhvHzNqe2gdgvNr2t/pub?gid=722061266&single=true&output=csv';
let warInterval;

function ignite() {
    const keyInput = document.getElementById('apiKey');
    const key = keyInput ? keyInput.value.trim() : '';

    if (key.length === 16) {
        localStorage.setItem('inferno_key', key);
        document.getElementById('login-screen').style.display = 'none';
        document.getElementById('dashboard').style.display = 'grid';
        updateGoalProgress(key);
    } else {
        document.getElementById('error-msg').style.display = 'block';
    }
}

async function updateGoalProgress(key) {
    let rawGoal = localStorage.getItem('inferno_user_goal') || "100000000";
    let goalNum = Number(rawGoal.replace(/[^0-9.]/g, ''));
    
    try {
        const res = await fetch(`https://api.torn.com/user/?selections=profile&key=${key}`);
        const data = await res.json();
        
        if (data.name) {
            document.getElementById('display-name').innerText = data.name;
            const total = (data.strength || 0) + (data.speed || 0) + (data.dexterity || 0) + (data.defense || 0);
            let percent = ((total / goalNum) * 100).toFixed(1);
            document.getElementById('goal-percent').innerText = percent + "%";
            document.getElementById('goal-progress-fill').style.width = Math.min(percent, 100) + "%";
            document.getElementById('motivation-text').innerText = (percent >= 100) ? "GOAL ACHIEVED." : "Target locked.";
        }
    } catch (e) { console.error("Stat fetch failed", e); }
}

async function loadIntelligence() {
    if (BRAIN_CSV_URL.includes('PASTE')) return;
    try {
        const res = await fetch(BRAIN_CSV_URL);
        const csv = await res.text();
        const rows = csv.split('\n').filter(r => r.trim()).slice(1);
        const roster = document.getElementById('roster-data');
        const leader = document.getElementById('leaderboard-data');
        roster.innerHTML = ''; leader.innerHTML = '';

        rows.forEach(row => {
            const col = row.split(',').map(c => c.trim());
            if (col.length >= 6) {
                roster.innerHTML += `<tr><td style="padding:10px; border-bottom:1px solid #333;">${col[1]}</td><td style="padding:10px; border-bottom:1px solid #333;">${col[4]}</td></tr>`;
                leader.innerHTML += `<tr><td style="padding:10px; border-bottom:1px solid #333;">${col[1]}</td><td style="padding:10px; border-bottom:1px solid #333; color:#0ff;">+${col[5]}</td></tr>`;
            }
        });
    } catch (e) { console.error("Intel fetch failed", e); }
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
    } catch (e) { console.error("War fetch failed", e); }
}

function showSection(s) {
    const sections = ['dash-view', 'intel-view', 'war-view'];
    sections.forEach(id => document.getElementById(id).style.display = 'none');
    document.getElementById(s + '-view').style.display = (s === 'dash') ? 'grid' : 'block';
    document.getElementById('view-title').innerText = s.toUpperCase();

    clearInterval(warInterval);
    if (s === 'intel') loadIntelligence();
    if (s === 'war') {
        updateWarData();
        warInterval = setInterval(updateWarData, 15000);
    }
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
