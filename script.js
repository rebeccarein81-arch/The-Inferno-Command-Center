// --- THE BLACK INFERNO: COMMAND CENTER LOGIC ---

// 1. THE IGNITE FUNCTION (Login)
function ignite() {
    const key = document.getElementById('apiKey').value;
    const errorMsg = document.getElementById('error-msg');

    if (key.length === 16) {
        localStorage.setItem('inferno_api_key', key);
        
        // Visual Transition
        document.getElementById('login-screen').style.display = 'none';
        document.getElementById('dashboard').style.display = 'grid';
        
        // Fetch User Identity
        updateUserIdentity(key);
    } else {
        if (errorMsg) errorMsg.style.display = 'block';
    }
}

// 2. IDENTITY CHECK (Who is logging in?)
async function updateUserIdentity(key) {
    try {
        const response = await fetch(`https://api.torn.com/user/?selections=profile&key=${key}`);
        const data = await response.json();

        if (data.name) {
            document.getElementById('display-name').innerText = data.name;
            console.log("Welcome back, " + data.name);
        }
    } catch (err) {
        console.error("API Connection Failed", err);
    }
}

// 3. NAVIGATION (Switching Tabs)
function showSection(sectionId) {
    // Select the main briefing cards and the intelligence view
    const mainBriefing = document.querySelector('.stats-grid');
    const intelView = document.getElementById('intelligence-section');

    if (sectionId === 'intelligence') {
        mainBriefing.style.display = 'none';
        intelView.style.display = 'block';
    } else {
        mainBriefing.style.display = 'grid';
        intelView.style.display = 'none';
    }

    // Update the Sidebar 'Active' Look
    document.querySelectorAll('.nav-link').forEach(link => link.classList.remove('active'));
    // This logic assumes you add IDs to your sidebar links (e.g., id="nav-dash")
}

// 4. AUTO-LOGIN ON LOAD
window.onload = () => {
    const savedKey = localStorage.getItem('inferno_api_key');
    if (savedKey) {
        document.getElementById('apiKey').value = savedKey;
        ignite();
    }
};

function logout() {
    localStorage.removeItem('inferno_api_key');
    location.reload();
}
