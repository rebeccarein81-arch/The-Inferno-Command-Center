// --- THE BLACK INFERNO COMMAND LOGIC ---

// 1. GATEKEEPER: Handles the Login process
function ignite() {
    const keyInput = document.getElementById('apiKey').value.trim();
    
    // Check for 16-character Torn API Key
    if(keyInput.length === 16) {
        localStorage.setItem('inferno_key', keyInput);
        document.getElementById('login-screen').style.display = 'none';
        document.getElementById('dashboard').style.display = 'grid';
        
        // Trigger the math functions immediately after login
        updateGoalProgress(keyInput);
    } else {
        document.getElementById('error-msg').style.display = 'block';
    }
}

// 2. THE BRAIN: Fetches stats and calculates the Goal %
async function updateGoalProgress(key) {
    // Get the goal from browser memory or default to 100M
    let rawGoal = localStorage.getItem('inferno_user_goal') || "100000000";
    let goalNum = Number(rawGoal.replace(/[^0-9.]/g, ''));
    
    // Safety check: ensure goal isn't zero to avoid NaN errors
    if (goalNum <= 0) goalNum = 100000000;

    // Display the goal in millions (e.g., 100M)
    document.getElementById('goal-target-display').innerText = (goalNum / 1000000).toFixed(0) + "M";

    try {
        // Fetch live stats from Torn API
        const res = await fetch(`https://api.torn.com/user/?selections=profile&key=${key}`);
        const data = await res.json();
        
        if (data.error) {
            document.getElementById('motivation-text').innerText = "API Error. Check Key.";
            return;
        }

        // The Math: Convert stats to numbers and sum them up
        const total = (Number(data.strength) || 0) + 
                      (Number(data.speed) || 0) + 
                      (Number(data.dexterity) || 0) + 
                      (Number(data.defense) || 0);

        // Update UI with the result
        if (total > 0) {
            let percent = ((total / goalNum) * 100).toFixed(1);
            document.getElementById('display-name').innerText = data.name;
            document.getElementById('goal-percent').innerText = percent + "%";
            document.getElementById('goal-progress-fill').style.width = Math.min(percent, 100) + "%";
            
            // Set Motivational message based on progress
            const mot = document.getElementById('motivation-text');
            if (percent >= 100) {
                mot.innerText = "GOAL ACHIEVED. Raise the stakes.";
                mot.style.color = "#ff4500";
            } else {
                mot.innerText = "Target locked. Burn through the gym.";
                mot.style.color = "#666";
            }
        }
    } catch (err) {
        console.error("Critical Failure connecting to Torn:", err);
    }
}

// 3. UTILITIES: Controls UI interactions
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
}

function logout() { 
    localStorage.removeItem('inferno_key'); 
    location.reload(); 
}

// 4. AUTO-IGNITE: Logs user in automatically if key exists
window.onload = () => {
    const saved = localStorage.getItem('inferno_key');
    if(saved) {
        document.getElementById('apiKey').value = saved;
        ignite();
    }
};
