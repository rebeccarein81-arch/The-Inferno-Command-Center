// --- LEADERSHIP INTELLIGENCE (FIREBASE) ---
async function loadIntelligence() {
    const roster = document.getElementById('roster-data');
    const leader = document.getElementById('leaderboard-data');
    if (!roster || !leader) return;

    roster.innerHTML = '<tr><td colspan="2">Syncing with Inferno HQ...</td></tr>';

    try {
        const dbRef = ref(db);
        const snapshot = await get(child(dbRef, `members`));
        
        if (snapshot.exists()) {
            roster.innerHTML = '';
            leader.innerHTML = '';
            const members = snapshot.val();

            // Loop through all members saved in your database
            Object.keys(members).forEach(id => {
                const m = members[id];
                // Update Activity Table
                roster.innerHTML += `
                    <tr>
                        <td style="padding:10px; border-bottom:1px solid #333;">${m.name}</td>
                        <td style="padding:10px; border-bottom:1px solid #333;">${m.xanax}</td>
                    </tr>`;
                
                // Update Top Gainers (Mock logic for now until we store gain history)
                leader.innerHTML += `
                    <tr>
                        <td style="padding:10px; border-bottom:1px solid #333;">${m.name}</td>
                        <td style="padding:10px; border-bottom:1px solid #333; color:#0ff;">${m.last_action}</td>
                    </tr>`;
            });
        } else {
            roster.innerHTML = '<tr><td colspan="2">No member data synced yet.</td></tr>';
        }
    } catch (e) {
        console.error("Firebase read failed:", e);
    }
import { ref, set, push, onValue } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

// --- LEADERSHIP NOTEBOOK: SAVE FEATURE ---
window.saveRecruitNote = async function() {
    const id = document.getElementById('recruit-id').value.trim();
    const note = document.getElementById('recruit-note-input').value.trim();
    const commander = document.getElementById('display-name').innerText;

    if (!id || !note) return;

    try {
        // Save note under the player's ID in Firebase
        await set(ref(db, 'recruitment/' + id), {
            target_id: id,
            note: note,
            logged_by: commander,
            timestamp: new Date().toLocaleString()
        });
        
        alert("Tactical note saved to Inferno HQ.");
        document.getElementById('recruit-note-input').value = '';
    } catch (e) {
        console.error("Database write failed:", e);
    }
};
    
}
