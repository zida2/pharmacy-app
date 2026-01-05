const fs = require('fs');
const path = require('path');
const stringSimilarity = require('string-similarity');

// Load discovered data (OSM)
const discovered = JSON.parse(fs.readFileSync(path.join(__dirname, 'discovered_pharmacies.json'), 'utf8'));

// Load canonical data (we'll extract it from the local file or a mock for this script)
// In a real scenario, this would come from the ONPBF scraper results
const canonicalFile = path.join(__dirname, 'pharmacies_canonical.json');
let canonical = [];
if (fs.existsSync(canonicalFile)) {
    canonical = JSON.parse(fs.readFileSync(canonicalFile, 'utf8'));
} else {
    console.log('⚠️ Fichier canonique manquant. Utilisation d\'un mini-set pour le test.');
    canonical = [
        { name: "Pharmacie Wend Yam", phone: "+226 25 48 30 47", city: "Ouagadougou" },
        { name: "Pharmacie Marjean", phone: "+226 79 00 01 41", city: "Ouagadougou" }
    ];
}

async function enrich() {
    console.log('🧬 Fusion des données (Officiel + Maps)...');

    const enriched = [];
    const unmatchedDiscovered = [];

    for (const disc of discovered) {
        if (disc.name === 'Pharmacie Sans Nom') continue;

        // Simple fuzzy match
        const matches = stringSimilarity.findBestMatch(
            disc.name.toLowerCase().replace('pharmacie', '').trim(),
            canonical.map(c => c.name.toLowerCase().replace('pharmacie', '').trim())
        );

        if (matches.bestMatch.rating > 0.6) {
            const best = canonical[matches.bestMatchIndex];
            enriched.push({
                ...best,
                location: {
                    ...best.location,
                    lat: disc.lat,
                    lng: disc.lng,
                    address: disc.address || best.location?.address || ''
                },
                source: 'Fused (ONPBF + OSM)'
            });
            console.log(`✅ Associé: ${disc.name} -> ${best.name} (${Math.round(matches.bestMatch.rating * 100)}%)`);
        } else {
            unmatchedDiscovered.push(disc);
        }
    }

    console.log(`\n📊 Résultats :`);
    console.log(`- ${enriched.length} pharmacies fusionnées.`);
    console.log(`- ${unmatchedDiscovered.length} nouvelles pharmacies potentielles trouvées sur Maps.`);

    // Add unmatched as new entries (with a tag to verify)
    const finalData = [...enriched];
    for (const u of unmatchedDiscovered) {
        finalData.push({
            id: `disc_${u.name.toLowerCase().replace(/[^a-z]/g, '')}`,
            name: u.name,
            location: {
                lat: u.lat,
                lng: u.lng,
                address: u.address,
                city: 'Ouagadougou'
            },
            phone: u.phone || 'NC',
            status: 'open',
            isVerified: false,
            source: 'Discovery (Maps/OSM)'
        });
    }

    fs.writeFileSync(path.join(__dirname, 'pharmacies_final.json'), JSON.stringify(finalData, null, 2));
    console.log(`✨ Fichier final généré : pharmacies_final.json (${finalData.length} items)`);
}

enrich();
