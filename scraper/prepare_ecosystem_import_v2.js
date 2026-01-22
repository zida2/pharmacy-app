const fs = require('fs');
const path = require('path');

// 1. Definition des sources
const ECOSYSTEM_DIR = path.join(__dirname, 'ecosystem_data');
const outputFile = path.join(__dirname, 'pharmacies_for_webapp_import.json');

// 2. Lecture des fichiers
console.log("📂 Lecture des données de l'écosystème...");

let pharmacies = [];
try {
    const rawPharma = fs.readFileSync(path.join(ECOSYSTEM_DIR, 'pharmacies.json'), 'utf8');
    pharmacies = JSON.parse(rawPharma);
    console.log(`   - Pharmacies trouvées: ${pharmacies.length}`);
} catch (e) {
    console.error("   ❌ Erreur lecture pharmacies.json:", e.message);
    process.exit(1);
}

// 3. Transformation pour format Webapp (compatibilité ascendante)
// Le format attendu par l'admin panel (ImportPage) est :
// {
//   id, nom_pharmacie, ville, quartier, telephone, 
//   groupe ("1"), type_service ("GARDE"/"NORMALE"), 
//   latitude, longitude, source, status ("guard"/"open")
// }

console.log("🔄 Transformation des données...");

const webappData = pharmacies.map(p => {
    // Mapping du statut
    const isGuard = (p.status === 'guard') || (p.type_service === 'GARDE');

    return {
        id: p.id,
        nom_pharmacie: p.name || p.nom_pharmacie, // Fallback
        name: p.name || p.nom_pharmacie,

        // Location
        ville: p.location?.city || p.ville || 'Ouagadougou',
        quartier: p.location?.address || p.quartier || '',
        adresse_complete: p.location?.address || p.adresse_complete || '',

        // GPS
        latitude: p.location?.lat || p.latitude || 0,
        longitude: p.location?.lng || p.longitude || 0,

        // Contact
        telephone: p.phone || p.telephone || 'NC',

        // Garde logic
        type_service: isGuard ? 'GARDE' : 'NORMALE',
        status: isGuard ? 'guard' : 'open',
        isGuardToday: isGuard,
        groupe: p.groupe || '1', // Default si perdu

        // Meta
        source: p.source || 'ONPBF_Ecosystem',
        gps_validated: p.gps_validated || false
    };
});

// 4. Ecriture du fichier final
fs.writeFileSync(outputFile, JSON.stringify(webappData, null, 2));

console.log("\n✅ Conversion terminée !");
console.log(`📄 Fichier généré : ${outputFile}`);
console.log(`📊 Nombre total d'éléments : ${webappData.length}`);
console.log("\n👉 Vous pouvez maintenant aller sur http://localhost:3000/admin/import et charger ce fichier.");
