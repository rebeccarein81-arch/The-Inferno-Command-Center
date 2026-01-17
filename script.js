// --- THE BLACK INFERNO ENGINE ---

function ignite() {
    const keyInput = document.getElementById('apiKey').value.trim();
    if(keyInput.length === 16) {
        localStorage.setItem('inferno_key', keyInput);
        document.getElementById('login-screen').style.display = 'none';
        document.getElementById('dashboard').style.display = 'grid';
        // Force immediate math calculation
        updateGoalProgress(keyInput);
    } else {
        document.getElementById('error-msg').style.display = 'block';
    }
}

async function updateGoalProgress(key) {
    // 1. Get Goal - Clean input and handle defaults
    let rawGoal = localStorage.getItem('inferno_user_goal') || "100000000";
    let goalNum = Number(rawGoal.replace(/[^0-9.]/g, ''));
    if (goalNum <= 0) goalNum = 100000000;

    document.getElementById('goal-target-display').innerText = (goalNum / 1000000).toFixed(0) + "M";

    try {
        // 2. Fetch User Stats
        const res = await fetch(`https://api.torn.com/user/?selections=profile&key=${key}`);
        const data = await res.json();
        
        if (data.error) {
            document.getElementById('motivation-text').innerText = "API Error. Check Key.";
            return;
        }

        // 3. The Math: Convert stats to pure numbers
        const total = (Number(data.strength) || 0) + 
                      (Number(data.speed) || 0) + 
                      (Number(data.dexterity) || 0) + 
                      (Number(data.defense) || 0);

        // 4. Update UI - Only calculate if stats exist
        if (total > 0) {
            let percent = ((total / goalNum) * 100).toFixed(1);
            document.getElementById('display-name').innerText = data.name;
            document.getElementById('goal-percent').innerText = percent + "%";
            document.getElementById('goal-progress-fill').style.width = Math.min(percent, 100) + "%";
            
            const mot = document.getElementById('motivation-text');
            mot.innerText = (percent >= 100) ? "GOAL ACHIEVED. Raise the stakes." : "Target locked. Burn through the gym.";
        }
    } catch (err) {
        console.error("Critical Failure:", err);
    }
}

// UI CONTROLS
function saveGoal() {
    const val = document.getElementById('new-goal-val').value;
    if(val) {
        localStorage.setItem('inferno_user_goal', val);
        document.getElementById('goal-input-area').style.display = 'none';
        updateGoalProgress(localStorage.getItem('inferno_key'));
    }
}

function toggleGoalInput() {
    const area = document.getElementById('goal-input-area');
    area.style.display = (area.style.display === 'none') ? 'block' : 'none';
}

function showSection(s) {
    document.getElementById('dash-view').style.display = (s === 'dash') ? 'grid' : 'none';
    document.getElementById('intel-view').style.display = (s === 'intel') ? 'block' : 'none';
    
    // Toggle active link visual
    document.querySelectorAll('.nav-link').forEach(link => link.classList.remove('active'));
    // This assumes the first two links are Dash and Intel
}

function logout() { 
    localStorage.removeItem('inferno_key'); 
    location.reload(); 
}

window.onload = () => {
    const saved = localStorage.getItem('inferno_key');
    if(saved) {
        document.getElementById('apiKey').value = saved;
        ignite();
    }
};
