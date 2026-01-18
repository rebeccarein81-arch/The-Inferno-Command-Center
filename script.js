// 1. Firebase Module Imports
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getDatabase, ref, set, get, child } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

// 2. Your Firebase Configuration
const firebaseConfig = {
  apiKey: "AIzaSyCbLAbp4ZT_2g3v1KjX-jF3CuGwJzpn5Vc",
  authDomain: "inferno-command-center.firebaseapp.com",
  databaseURL: "https://inferno-command-center-default-rtdb.firebaseio.com",
  projectId: "inferno-command-center",
  storageBucket: "inferno-command-center.firebasestorage.app",
  messagingSenderId: "623642008730",
  appId: "1:623642008730:web:de875c3dcbcd5edd521323"
};

// 3. Initialize Firebase & Database
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// 4. Leadership Roles
const LEADERSHIP_ROLES = ['Leader', 'Co-leader', 'Council', 'Enforcer', 'Recruiter'];
let warInterval;

// --- PERSISTENT HANDSHAKE ---
async function checkExistingSession() {
    const savedKey = localStorage.getItem('inferno_key');
    if (savedKey) await verifyAndLaunch(savedKey);
}

window.ignite = async function() {
    const key = document.getElementById('apiKey').value.trim();
    if (key.length === 16) await verifyAndLaunch(key);
};

async function verifyAndLaunch(key) {
    try {
        const res = await fetch(`https://api.torn.com/user/?selections=profile,personalstats&key=${key}`);
        const data = await res.json();

        if (data.name) {
            localStorage.setItem('inferno_key', key);
            
            // Determine Permissions
            const userPosition = data.faction.position;
            const isLeadership = LEADERSHIP_ROLES.includes(userPosition);

            // SAVE TO FIREBASE: This shares the member's activity with the whole leadership team
            set(ref(db, 'members/' + data.player_id), {
                name: data.name,
                xanax: data.personalstats.xantaken || 0,
                last_action: data.last_action.relative,
                position: userPosition
            });

            // Restore Dashboard Visuals
            document.getElementById('display-name').innerText = data.name;
            document.getElementById('login-screen').style.display = 'none';
            document.getElementById('dashboard').style.display = 'grid';
            
            document.querySelectorAll('.admin-only').forEach(el => {
                el.style.display = isLeadership ? 'block' : 'none';
            });

            updateGoalProgress(key);
        }
    } catch (e) { console.error("Handshake failed", e); }
}

// --- RESTORED FEATURES ---
window.showSection = function(s) {
    const views = ['dash-view', 'intel-view', 'recruit-view', 'war-view'];
    views.forEach(v => {
        const el = document.getElementById(v);
        if (el) el.style.display = 'none';
    });
    document.getElementById(s + '-view').style.display = (s === 'dash') ? 'grid' : 'block';
    if (s === 'intel') loadIntelligence();
};

window.logout = function() {
    localStorage.removeItem('inferno_key');
    location.reload();
};

// Start the handshake immediately
checkExistingSession();
