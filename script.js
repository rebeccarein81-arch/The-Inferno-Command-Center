// Replace this with your actual Published CSV link from Google Sheets
const BRAIN_CSV_URL = 'PASTE_YOUR_CSV_LINK_HERE';

async function loadIntelligence() {
    const rosterBody = document.getElementById('roster-data');
    const leaderBody = document.getElementById('leaderboard-data');
    
    try {
        const response = await fetch(BRAIN_CSV_URL);
        const csvText = await response.text();
        const rows = csvText.split('\n').slice(1); // Skip header

        rosterBody.innerHTML = ''; 
        leaderBody.innerHTML = '';

        rows.forEach(row => {
            const cols = row.split(',');
            if (cols.length >= 3) {
                const name = cols[0].trim();
                const role = cols[1].trim();
                const gain = cols[2].trim();

                // Add to Roster Table
                const rosterRow = `<tr>
                    <td style="padding:10px; border-bottom:1px solid rgba(255,255,255,0.05); font-weight:bold;">${name}</td>
                    <td style="padding:10px; border-bottom:1px solid rgba(255,255,255,0.05); color:#888;">${role}</td>
                </tr>`;
                rosterBody.innerHTML += rosterRow;

                // Add to Leaderboard Table
                const leaderRow = `<tr>
                    <td style="padding:10px; border-bottom:1px solid rgba(255,255,255,0.05); font-weight:bold;">${name}</td>
                    <td style="padding:10px; border-bottom:1px solid rgba(255,255,255,0.05); color:#00ff00;">+${gain}</td>
                </tr>`;
                leaderBody.innerHTML += leaderRow;
            }
        });
    } catch (err) {
        console.error("The Brain is not responding:", err);
    }
}

// Update your showSection function to call this
function showSection(s) {
    document.getElementById('dash-view').style.display = (s === 'dash') ? 'grid' : 'none';
    document.getElementById('intel-view').style.display = (s === 'intel') ? 'block' : 'none';
    
    if (s === 'intel') {
        loadIntelligence(); // Pull data when Intel tab is clicked
    }
}
