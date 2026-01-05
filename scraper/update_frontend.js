const fs = require('fs');
const path = require('path');

const finalDataPath = path.join(__dirname, 'pharmacies_final.json');
const pharmacies = JSON.parse(fs.readFileSync(finalDataPath, 'utf8'));

const targetPath = path.join(__dirname, '../frontend/src/services/pharmaciesData.ts');

const fileContent = `import { Pharmacy } from "./types";

/**
 * Dataset Master (Fused ONPBF + Maps/OSM)
 * This file acts as a local fallback for the app.
 * Generated automatically by discovery/enrichment scripts.
 */
export const PHARMACIES_BURKINA_FASO: Pharmacy[] = ${JSON.stringify(pharmacies, null, 4)};
`;

fs.writeFileSync(targetPath, fileContent);
console.log('🚀 PHARMACIES_BURKINA_FASO mis à jour avec 100+ pharmacies enrichies !');
