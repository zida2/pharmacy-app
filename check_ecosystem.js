const fs = require('fs');
const path = require('path');

const files = ['clinics.json', 'dentists.json', 'insurance_providers.json', 'pharmacies.json'];

console.log("\n📊 ÉTAT DE L'ÉCOSYSTÈME SANTÉ\n");
console.log("=".repeat(40));

files.forEach(f => {
    try {
        const filePath = path.join('ecosystem_data', f);
        const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        const name = f.replace('.json', '').toUpperCase().padEnd(25);
        const count = data.length.toString().padStart(6);
        console.log(`${name}: ${count} entrées`);
    } catch (e) {
        console.log(`${f.padEnd(25)}: ERREUR - ${e.message}`);
    }
});

console.log("=".repeat(40));
console.log("\n✅ Données prêtes pour l'import Firestore !\n");
