// Need to handle the fact that it's a TS file with imports.
// We'll do a specialized extraction for just the array content.
const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../frontend/src/services/pharmaciesData.ts');
const content = fs.readFileSync(filePath, 'utf8');

// Match the array content more carefully
const match = content.match(/export const PHARMACIES_BURKINA_FASO: Pharmacy\[\] = (\[[\s\S]*?\]);/);

if (match) {
    let arrayContent = match[1];

    // Create a temp JS file that defines the array and prints it as JSON
    const tempFile = path.join(__dirname, 'temp_extractor.js');
    const script = `
const PHARMACIES_BURKINA_FASO = ${arrayContent};
console.log(JSON.stringify(PHARMACIES_BURKINA_FASO, null, 2));
    `;

    fs.writeFileSync(tempFile, script);

    try {
        const { execSync } = require('child_process');
        const jsonOutput = execSync(`node "${tempFile}"`).toString();
        fs.writeFileSync(path.join(__dirname, 'pharmacies_canonical.json'), jsonOutput);
        console.log('✅ pharmacies_canonical.json généré avec succès !');
        fs.unlinkSync(tempFile);
    } catch (e) {
        console.error('❌ Erreur lors de l\'exécution du script temporaire:', e.message);
    }
} else {
    console.error('❌ Impossible de trouver PHARMACIES_BURKINA_FASO.');
}
