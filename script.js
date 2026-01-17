async function loadIntelligence() {
    if (BRAIN_CSV_URL === 'PASTE_YOUR_CSV_LINK_HERE') {
        console.warn("Intelligence source not configured.");
        return;
    }

    try {
        const res = await fetch(BRAIN_CSV_URL);
        const csv = await res.text();
        // Filter out empty rows to prevent undefined errors
        const rows = csv.split('\n').filter(row => row.trim() !== '').slice(1);
        
        const roster = document.getElementById('roster-data');
        const leader = document.getElementById('leaderboard-data');
        roster.innerHTML = ''; leader.innerHTML = '';

        rows.forEach(row => {
            const col = row.split(',').map(item => item.trim()); // Trim whitespace
            if (col.length >= 6) {
                const name = col[1]; 
                const xanax = col[4]; 
                const gain = col[5]; 

                roster.innerHTML += `<tr><td style="padding:10px; border-bottom:1px solid #333;">${name}</td><td style="padding:10px; border-bottom:1px solid #333;">${xanax}</td></tr>`;
                leader.innerHTML += `<tr><td style="padding:10px; border-bottom:1px solid #333;">${name}</td><td style="padding:10px; border-bottom:1px solid #333; color:#00ff00;">+${gain}</td></tr>`;
            }
        });
    } catch (err) { 
        console.error("Failed to load intel:", err); 
    }
}
