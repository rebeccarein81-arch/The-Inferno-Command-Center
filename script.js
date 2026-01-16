// --- THE BRAIN OF THE INFERNO HQ ---

function ignite() {
    const key = document.getElementById('apiKey').value;
    const errorMsg = document.getElementById('error-msg');

    // 1. Basic Validation: Torn keys are always 16 characters
    if (key.length === 16) {
        // 2. Save the key in the user's browser memory
        localStorage.setItem('inferno_api_key', key);
        
        // 3. Hide login, show dashboard
        document.getElementById('login-screen').style.display = 'none';
        document.getElementById('dashboard').style.display = 'grid';
        
        // 4. Start fetching the member's data
        fetchMemberData(key);
    } else {
        // Show error if the key is wrong length
        if (errorMsg) errorMsg.style.display = 'block';
    }
}

// This function welcomes the user by their Torn Name
async function fetchMemberData(key) {
    try {
        const response = await fetch(`https://api.torn.com/user/?selections=profile&key=${key}`);
        const data = await response.json();

        if (data.name) {
            document.getElementById('display-name').innerText = data.name;
            console.log("Authenticated as: " + data.name);
        }
    } catch (err) {
        console.error("Connection to Torn API failed.", err);
    }
}

// Auto-login check when page loads
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
