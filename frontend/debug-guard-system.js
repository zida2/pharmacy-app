/**
 * Script de diagnostic pour vérifier le système de garde
 * 
 * Utilisation: node debug-guard-system.js
 */

const now = new Date();
console.log('='.repeat(60));
console.log('🔍 DIAGNOSTIC DU SYSTÈME DE GARDE');
console.log('='.repeat(60));
console.log();

// 1. Vérifier la date et l'heure actuelles
console.log('📅 Date et Heure:');
console.log(`   Date: ${now.toLocaleDateString('fr-FR')}`);
console.log(`   Heure: ${now.toLocaleTimeString('fr-FR')}`);
console.log(`   Jour semaine: ${['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'][now.getDay()]}`);
console.log();

// 2. Calculer le groupe de garde actuel
const refDate = new Date(2025, 0, 4); // 4 janvier 2025 (samedi)
const diffTime = now.getTime() - refDate.getTime();
const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
let weeks = Math.floor(diffDays / 7);
const day = now.getDay();
const hours = now.getHours();

// Ajustement si samedi soir après 19h
if (day === 6 && hours >= 19) weeks += 1;

const cycle = ['1', '2', '3', '4'];
const currentGroup = cycle[((weeks % 4) + 4) % 4];

console.log('🏥 Calcul du Groupe de Garde:');
console.log(`   Date de référence: 4 janvier 2025 (Groupe 1)`);
console.log(`   Jours écoulés: ${diffDays}`);
console.log(`   Semaines complètes: ${weeks}`);
console.log(`   Position dans le cycle: ${weeks % 4}`);
console.log(`   --> GROUPE ACTUEL: ${currentGroup}`);
console.log();

// 3. Afficher les prochaines rotations
console.log('📆 Prochaines Rotations:');
for (let i = 0; i < 4; i++) {
    const futureWeeks = weeks + i;
    const groupNum = cycle[((futureWeeks % 4) + 4) % 4];
    const futureDays = futureWeeks * 7;
    const futureDate = new Date(refDate.getTime() + futureDays * 24 * 60 * 60 * 1000);
    const indicator = i === 0 ? '   ✅ ' : '      ';
    console.log(`${indicator}Semaine du ${futureDate.toLocaleDateString('fr-FR')}: Groupe ${groupNum}`);
}
console.log();

// 4. Vérifier les données du fichier JSON
const fs = require('fs');
const path = require('path');

const jsonPath = path.join(__dirname, '../scraper/pharmacies_burkina.json');
if (fs.existsSync(jsonPath)) {
    const pharmacies = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));

    console.log('📊 Répartition des Pharmacies:');
    const groupCount = {};
    const currentGroupPharmacies = [];

    pharmacies.forEach(p => {
        const g = p.groupe || 'N/A';
        groupCount[g] = (groupCount[g] || 0) + 1;
        if (g === currentGroup) {
            currentGroupPharmacies.push(p.nom_pharmacie);
        }
    });

    console.log(`   Total: ${pharmacies.length} pharmacies`);
    Object.keys(groupCount).sort().forEach(g => {
        const isActive = g === currentGroup ? ' ✅ DE GARDE' : '';
        console.log(`   Groupe ${g}: ${groupCount[g]} pharmacies${isActive}`);
    });

    console.log();
    console.log(`🌙 Pharmacies de Garde Actuelles (Groupe ${currentGroup}):`);
    currentGroupPharmacies.slice(0, 10).forEach(name => {
        console.log(`   - ${name}`);
    });
    if (currentGroupPharmacies.length > 10) {
        console.log(`   ... et ${currentGroupPharmacies.length - 10} autres`);
    }
} else {
    console.log('⚠️  Fichier pharmacies_burkina.json non trouvé');
}

console.log();
console.log('='.repeat(60));
console.log('✅ Diagnostic terminé');
console.log('='.repeat(60));
