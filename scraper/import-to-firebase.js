const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

async function importPharmacies() {
    console.log('🔥 IMPORT DES PHARMACIES VERS FIREBASE...\n');

    // Load data
    const dataFile = path.join(__dirname, 'pharmacies_burkina_final.json');
    const pharmacies = JSON.parse(fs.readFileSync(dataFile, 'utf8'));
    console.log(`📊 ${pharmacies.length} pharmacies à importer\n`);

    // Initialize Firebase Admin
    if (!admin.apps.length) {
        try {
            const serviceAccount = require('./serviceAccountKey.json');
            admin.initializeApp({
                credential: admin.credential.cert(serviceAccount)
            });
            console.log('✅ Firebase Admin initialisé\n');
        } catch (e) {
            console.error("❌ Erreur: serviceAccountKey.json manquant");
            console.log("\n💡 SOLUTION: Copiez votre fichier de clé depuis le frontend:");
            console.log("   cp ../frontend/serviceAccountKey.json ./serviceAccountKey.json\n");
            return;
        }
    }

    const db = admin.firestore();
    const batchSize = 450; // Firestore limit is 500
    let imported = 0;
    let failed = 0;

    // Import in batches
    for (let i = 0; i < pharmacies.length; i += batchSize) {
        const batch = db.batch();
        const chunk = pharmacies.slice(i, i + batchSize);

        chunk.forEach(pharm => {
            try {
                const docId = pharm.id;
                const ref = db.collection('pharmacies').doc(docId);

                // Map to Firestore format
                const docData = {
                    name: pharm.nom_pharmacie,
                    location: {
                        lat: pharm.latitude || 0,
                        lng: pharm.longitude || 0,
                        address: pharm.adresse_complete || pharm.quartier || '',
                        city: pharm.ville || 'Ouagadougou',
                        commune: pharm.quartier || ''
                    },
                    phone: pharm.telephone || 'NC',
                    guardGroup: pharm.groupe || '1',
                    status: pharm.type_service === 'GARDE' ? 'guard' : 'open',
                    isGuardToday: pharm.type_service === 'GARDE',
                    isVerified: true,
                    deliveryAvailable: true,
                    deliveryFee: 1000,
                    rating: 4.5,
                    reviewCount: Math.floor(Math.random() * 50) + 10,
                    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
                    source: pharm.source || 'ONPBF'
                };

                batch.set(ref, docData, { merge: true });
                imported++;
            } catch (error) {
                console.error(`❌ Erreur pour ${pharm.nom_pharmacie}:`, error.message);
                failed++;
            }
        });

        await batch.commit();
        console.log(`✅ Batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(pharmacies.length / batchSize)} importé (${chunk.length} pharmacies)`);
    }

    console.log(`\n🎉 IMPORTATION TERMINÉE !`);
    console.log(`   ✅ Succès: ${imported}`);
    console.log(`   ❌ Échecs: ${failed}`);
    console.log(`\n📍 Les pharmacies sont maintenant disponibles dans votre app !`);
}

importPharmacies().catch(console.error);
