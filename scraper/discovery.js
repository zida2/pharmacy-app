const axios = require('axios');
const fs = require('fs');
const path = require('path');

async function discoverPharmacies() {
    console.log('🔍 Découverte des pharmacies via OpenStreetMap (Overpass API)...');

    // Query Overpass for all pharmacies in Ouagadougou bounding box
    const query = `
        [out:json][timeout:25];
        (
          node["amenity"="pharmacy"](12.2131,-1.6562,12.5186,-1.3789);
          way["amenity"="pharmacy"](12.2131,-1.6562,12.5186,-1.3789);
          rel["amenity"="pharmacy"](12.2131,-1.6562,12.5186,-1.3789);
        );
        out body;
        >;
        out skel qt;
    `;

    try {
        const response = await axios.post('https://overpass-api.de/api/interpreter', query);
        const elements = response.data.elements;

        const pharmacies = elements
            .filter(e => e.tags && e.tags.amenity === 'pharmacy')
            .map(e => ({
                name: e.tags.name || 'Pharmacie Sans Nom',
                lat: e.lat || (e.center ? e.center.lat : 0),
                lng: e.lon || (e.center ? e.center.lon : 0),
                phone: e.tags['phone'] || e.tags['contact:phone'] || '',
                address: e.tags['addr:street'] || '',
                source: 'OpenStreetMap'
            }));

        console.log(`✅ ${pharmacies.length} pharmacies trouvées sur la carte !`);

        fs.writeFileSync(
            path.join(__dirname, 'discovered_pharmacies.json'),
            JSON.stringify(pharmacies, null, 2)
        );

        return pharmacies;
    } catch (error) {
        console.error('❌ Erreur Overpass:', error.message);
        return [];
    }
}

discoverPharmacies();
