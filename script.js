const BRAIN_CSV_URL = 'PASTE_YOUR_CSV_LINK_HERE';

function ignite() {
    const key = document.getElementById('apiKey').value.trim();
    if(key.length === 16) {
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
    if (goalNum <= 0) goalNum = 100000000;

    document.getElementById('goal-target-display').innerText = (goalNum / 1000000).toFixed(0) + "M";

    try {
        const res = await fetch(`https://api.torn.com/user/?selections=profile&key=${key}`);
        const data = await res.json();
        const total = (Number(data.strength) || 0) + (Number(data.speed) || 0) + (Number(data.dexterity) || 0) + (Number(data.defense) || 0);

        if (total > 0) {
            let percent = ((total / goalNum) * 100).toFixed(1);
            document.getElementById('display-name').innerText = data.name;
            document.getElementById('goal-percent').innerText = percent + "%";
            document.getElementById('goal-progress-fill').style.width = Math.min(percent, 100) + "%";
            document.getElementById('motivation-text').innerText = (percent >= 100) ? "GOAL ACHIEVED." : "Target locked.";
        }
    } catch (err) { console.error(err); }
}

async function loadIntelligence() {
    try {
        const res = await fetch(BRAIN_CSV_URL);
        const csv = await res.text();
        const rows = csv.split('\n').slice(1);
        const roster = document.getElementById('roster-data');
        const leader = document.getElementById('leaderboard-data');
        roster.innerHTML = ''; leader.innerHTML = '';

        rows.forEach(row => {
            const col = row.split(',');
            if (col.length >= 6) {
                const name = col[1]; // Column B
                const xanax = col[4]; // Column E
                const gain = col[5]; // Column F

                roster.innerHTML += `<tr><td style="padding:10px; border-bottom:1px solid #333;">${name}</td><td style="padding:10px; border-bottom:1px solid #333;">${xanax}</td></tr>`;
                leader.innerHTML += `<tr><td style="padding:10px; border-bottom:1px solid #333;">${name}</td><td style="padding:10px; border-bottom:1px solid #333; color:#00ff00;">+${gain}</td></tr>`;
            }
        });
    } catch (err) { console.error(err); }
}

function showSection(s) {
    document.getElementById('dash-view').style.display = (s === 'dash') ? 'grid' : 'none';
    document.getElementById('intel-view').style.display = (s === 'intel') ? 'block' : 'none';
    if(s === 'intel') loadIntelligence();
}

function saveGoal() {
    localStorage.setItem('inferno_user_goal', document.getElementById('new-goal-val').value);
    document.getElementById('goal-input-area').style.display = 'none';
    updateGoalProgress(localStorage.getItem('inferno_key'));
}

function toggleGoalInput() {
    const area = document.getElementById('goal-input-area');
    area.style.display = (area.style.display === 'none') ? 'block' : 'none';
}

function logout() { localStorage.removeItem('inferno_key'); location.reload(); }

window.onload = () => { if(localStorage.getItem('inferno_key')) ignite(); };
