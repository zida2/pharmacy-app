const fs = require('fs');
const path = require('path');

// Load source data
const sourceFile = path.join(__dirname, 'pharmacies_burkina_final.json');
const pharmacies = JSON.parse(fs.readFileSync(sourceFile, 'utf8'));

console.log(`📊 Converting ${pharmacies.length} pharmacies...\n`);

// Convert to webapp import format
const convertedData = pharmacies.map(pharm => ({
    id: pharm.id,
    nom_pharmacie: pharm.nom_pharmacie,
    name: pharm.nom_pharmacie,
    ville: pharm.ville,
    adresse_complete: pharm.adresse_complete || pharm.quartier || '',
    quartier: pharm.quartier || '',
    telephone: pharm.telephone || 'NC',
    groupe: pharm.groupe || '1',
    type_service: pharm.type_service || 'NORMALE',
    latitude: pharm.latitude || 0,
    longitude: pharm.longitude || 0,
    source: pharm.source || 'ONPBF',
    status: pharm.type_service === 'GARDE' ? 'guard' : 'open',
    isGuardToday: pharm.type_service === 'GARDE'
}));

// Save for web import
const outputFile = path.join(__dirname, 'pharmacies_for_webapp_import.json');
fs.writeFileSync(outputFile, JSON.stringify(convertedData, null, 2));

console.log(`✅ Fichier créé: ${outputFile}`);
console.log(`📦 ${convertedData.length} pharmacies prêtes pour l'import\n`);
console.log(`🌐 Prochaine étape:`);
console.log(`   1. Ouvrir http://localhost:3000/admin/import`);
console.log(`   2. Uploader le fichier: pharmacies_for_webapp_import.json`);
console.log(`   3. Attendre la fin de l'import\n`);
