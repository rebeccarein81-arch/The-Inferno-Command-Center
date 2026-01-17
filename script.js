const BRAIN_CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQnpIVPLG6fIEQ_DCD8ydwGyKlZh2xr6Gkej4RdcajQPJ1M2-CCKZvi_EDn8PKUhvHzNqe2gdgvNr2t/pub?gid=722061266&single=true&output=csv';
const LEADERSHIP_ROLES = ['Leader', 'Co-leader', 'Council', 'Enforcer', 'Recruiter'];
let warInterval;

async function ignite() {
    const key = document.getElementById('apiKey').value.trim();
    if (key.length !== 16) {
        document.getElementById('error-msg').style.display = 'block';
        return;
    }

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
    } catch (e) { console.error("Login failed", e); }
}

async function scoutPlayer() {
    const targetId = document.getElementById('recruit-id').value.trim();
    const key = localStorage.getItem('inferno_key');
    const resultsDiv = document.getElementById('recruit-results');
    
    if (!targetId) return;
    resultsDiv.innerHTML = "Scouting...";

    try {
        const res = await fetch(`https://api.torn.com/user/${targetId}?selections=profile,personalstats&key=${key}`);
        const data = await res.json();
        
        if (data.name) {
            resultsDiv.innerHTML = `
                <div style="border-left: 2px solid #ff4500; padding-left:15px;">
                    <p><strong>NAME:</strong> ${data.name} [${targetId}]</p>
                    <p><strong>LEVEL:</strong> ${data.level}</p>
                    <p><strong>STATUS:</strong> ${data.status.description}</p>
                    <p><strong>XANAX TAKEN:</strong> ${data.personalstats.xantaken || 0}</p>
                </div>
            `;
        } else { resultsDiv.innerHTML = "Player not found."; }
    } catch (e) { resultsDiv.innerHTML = "Error fetching data."; }
}

// ... existing updateGoalProgress and loadIntelligence functions ...

function showSection(s) {
    const views = ['dash-view', 'intel-view', 'recruit-view', 'war-view'];
    views.forEach(v => document.getElementById(v).style.display = 'none');
    document.getElementById(s + '-view').style.display = (s === 'dash') ? 'grid' : 'block';
    document.getElementById('view-title').innerText = s.toUpperCase();
    
    clearInterval(warInterval);
    if (s === 'intel') loadIntelligence();
    if (s === 'war') {
        updateWarData();
        warInterval = setInterval(updateWarData, 15000);
    }
}

function logout() { localStorage.removeItem('inferno_key'); location.reload(); }
window.onload = () => { if(localStorage.getItem('inferno_key')) ignite(); };
