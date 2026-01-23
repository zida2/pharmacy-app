/**
 * Script pour mettre à jour les pharmacies de garde (rotation automatique)
 * Ce script doit être exécuté quotidiennement (par exemple via un cron job ou Cloud Function)
 */

const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

// Initialize Firebase Admin (si pas déjà fait)
if (!admin.apps.length) {
    const serviceAccount = require('../serviceAccountKey.json');
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
}

const db = admin.firestore();

/**
 * Sélectionne N pharmacies de garde pour aujourd'hui basé sur une rotation
 * @param {Array} pharmacies - Liste de toutes les pharmacies
 * @param {number} count - Nombre de pharmacies de garde à sélectionner
 * @param {Date} date - Date pour laquelle on sélectionne les pharmacies
 * @returns {Array} - IDs des pharmacies de garde
 */
function selectGuardPharmacies(pharmacies, count = 10, date = new Date()) {
    // Utiliser la date comme seed pour une sélection pseudo-aléatoire mais déterministe
    const dayOfYear = Math.floor((date - new Date(date.getFullYear(), 0, 0)) / 1000 / 60 / 60 / 24);

    // Créer un hash simple basé sur le jour de l'année
    const seed = dayOfYear % pharmacies.length;

    // Sélectionner des pharmacies à intervalle régulier pour assurer une rotation équitable
    const selected = [];
    const step = Math.floor(pharmacies.length / count);

    for (let i = 0; i < count; i++) {
        const index = (seed + (i * step)) % pharmacies.length;
        selected.push(pharmacies[index].id);
    }

    return selected;
}

/**
 * Met à jour le statut de garde de toutes les pharmacies dans Firestore
 */
async function updateGuardStatus() {
    try {
        console.log('📋 Récupération de toutes les pharmacies...');

        // Récupérer toutes les pharmacies
        const snapshot = await db.collection('pharmacies').get();
        const pharmacies = [];

        snapshot.forEach(doc => {
            pharmacies.push({
                id: doc.id,
                ...doc.data()
            });
        });

        console.log(`✅ ${pharmacies.length} pharmacies trouvées`);

        // Sélectionner les pharmacies de garde pour aujourd'hui
        const today = new Date();
        const guardIds = selectGuardPharmacies(pharmacies, 10, today); // 10 pharmacies de garde

        console.log(`🌙 ${guardIds.length} pharmacies sélectionnées pour la garde aujourd'hui`);

        // Mettre à jour toutes les pharmacies
        const batch = db.batch();
        let updateCount = 0;

        for (const pharmacy of pharmacies) {
            const ref = db.collection('pharmacies').doc(pharmacy.id);
            const isGuard = guardIds.includes(pharmacy.id);

            batch.update(ref, {
                isGuardToday: isGuard,
                lastGuardUpdate: admin.firestore.FieldValue.serverTimestamp()
            });

            if (isGuard) {
                console.log(`  ✓ ${pharmacy.name || pharmacy.id} - DE GARDE`);
            }

            updateCount++;
        }

        // Commit le batch
        await batch.commit();

        console.log(`\n✅ Statut de garde mis à jour pour ${updateCount} pharmacies`);
        console.log(`🌙 ${guardIds.length} pharmacies sont maintenant de garde`);

        return {
            total: pharmacies.length,
            guard: guardIds.length,
            updated: updateCount
        };

    } catch (error) {
        console.error('❌ Erreur lors de la mise à jour:', error);
        throw error;
    }
}

/**
 * Liste les pharmacies de garde actuelles
 */
async function listCurrentGuardPharmacies() {
    try {
        const snapshot = await db.collection('pharmacies')
            .where('isGuardToday', '==', true)
            .get();

        console.log(`\n🌙 PHARMACIES DE GARDE AUJOURD'HUI (${snapshot.size}):`);
        console.log('═'.repeat(60));

        snapshot.forEach(doc => {
            const data = doc.data();
            console.log(`  📍 ${data.name || 'Sans nom'}`);
            console.log(`     ID: ${doc.id}`);
            console.log(`     Tél: ${data.phone || 'NC'}`);
            console.log(`     Adresse: ${data.location?.address || 'NC'}`);
            console.log('─'.repeat(60));
        });

        return snapshot.size;

    } catch (error) {
        console.error('❌ Erreur lors de la récupération:', error);
        throw error;
    }
}

// Main execution
async function main() {
    const command = process.argv[2] || 'update';

    switch (command) {
        case 'update':
            console.log('🔄 Mise à jour des pharmacies de garde...\n');
            await updateGuardStatus();
            await listCurrentGuardPharmacies();
            break;

        case 'list':
            await listCurrentGuardPharmacies();
            break;

        default:
            console.log('Usage: node update_guard_pharmacies.js [update|list]');
            console.log('  update - Met à jour les pharmacies de garde');
            console.log('  list   - Liste les pharmacies de garde actuelles');
    }

    process.exit(0);
}

// Execute if run directly
if (require.main === module) {
    main().catch(error => {
        console.error('Fatal error:', error);
        process.exit(1);
    });
}

module.exports = {
    updateGuardStatus,
    listCurrentGuardPharmacies,
    selectGuardPharmacies
};
