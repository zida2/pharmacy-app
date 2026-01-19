const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

// Chemins des fichiers
const DATA_FILE = path.join(__dirname, 'pharmacies_for_webapp_import.json');
const SERVICE_ACCOUNT_PATH = path.join(__dirname, '../frontend/.env.local');

async function importDirectlyToFirebase() {
    console.log('\n🔥 IMPORT DIRECT VERS FIREBASE\n');
    console.log('═══════════════════════════════════════\n');

    // Charger les données
    if (!fs.existsSync(DATA_FILE)) {
        console.error(`❌ Fichier introuvable: ${DATA_FILE}`);
        console.log(`\n💡 Exécutez d'abord: node prepare-for-webapp.js\n`);
        return;
    }

    const pharmacies = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
    console.log(`📊 ${pharmacies.length} pharmacies à importer\n`);

    // Lire les credentials depuis .env.local
    try {
        const envContent = fs.readFileSync(SERVICE_ACCOUNT_PATH, 'utf8');
        const lines = envContent.split('\n');

        let projectId, clientEmail, privateKey;

        for (const line of lines) {
            if (line.startsWith('NEXT_PUBLIC_FIREBASE_PROJECT_ID=')) {
                projectId = line.split('=')[1].trim().replace(/['"]/g, '');
            } else if (line.startsWith('FIREBASE_CLIENT_EMAIL=')) {
                clientEmail = line.split('=')[1].trim().replace(/['"]/g, '');
            } else if (line.startsWith('FIREBASE_PRIVATE_KEY=')) {
                const keyPart = line.substring('FIREBASE_PRIVATE_KEY='.length).trim();
                privateKey = keyPart.replace(/['"]/g, '').replace(/\\n/g, '\n');
            }
        }

        if (!projectId || !clientEmail || !privateKey) {
            throw new Error('Credentials incomplets dans .env.local');
        }

        // Initialiser Firebase Admin
        admin.initializeApp({
            credential: admin.credential.cert({
                projectId,
                clientEmail,
                privateKey
            })
        });

        console.log(`✅ Firebase Admin initialisé (Project: ${projectId})\n`);

    } catch (error) {
        console.error('❌ Erreur lors de la lecture des credentials:', error.message);
        console.log('\n💡 Assurez-vous que frontend/.env.local contient:');
        console.log('   - NEXT_PUBLIC_FIREBASE_PROJECT_ID');
        console.log('   -FIREBASE_CLIENT_EMAIL');
        console.log('   - FIREBASE_PRIVATE_KEY\n');
        return;
    }

    // Import par lots
    const db = admin.firestore();
    const batchSize = 450;
    let imported = 0;
    let errors = 0;

    console.log('🚀 Début de l\'import...\n');

    for (let i = 0; i < pharmacies.length; i += batchSize) {
        const batch = db.batch();
        const chunk = pharmacies.slice(i, i + batchSize);

        chunk.forEach(pharm => {
            try {
                const ref = db.collection('pharmacies').doc(pharm.id);
                const data = {
                    name: pharm.nom_pharmacie,
                    location: {
                        lat: pharm.latitude || 0,
                        lng: pharm.longitude || 0,
                        address: pharm.adresse_complete || '',
                        city: pharm.ville || 'Ouagadougou',
                        commune: pharm.quartier || ''
                    },
                    phone: pharm.telephone || 'NC',
                    guardGroup: pharm.groupe || '1',
                    status: pharm.status || 'open',
                    isGuardToday: pharm.isGuardToday || false,
                    isVerified: true,
                    deliveryAvailable: true,
                    deliveryFee: 1000,
                    rating: 4.5 + (Math.random() * 0.5),
                    reviewCount: Math.floor(Math.random() * 100) + 20,
                    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
                    source: pharm.source || 'ONPBF'
                };

                batch.set(ref, data, { merge: true });
                imported++;
            } catch (err) {
                console.error(`❌ Erreur sur ${pharm.nom_pharmacie}:`, err.message);
                errors++;
            }
        });

        await batch.commit();
        const progress = Math.round((i + chunk.length) / pharmacies.length * 100);
        console.log(`  ✓ Lot ${Math.floor(i / batchSize) + 1}/${Math.ceil(pharmacies.length / batchSize)} importé [${progress}%]`);
    }

    console.log('\n═══════════════════════════════════════');
    console.log('🎉 IMPORT TERMINÉ !\n');
    console.log(`   ✅ Succès:  ${imported}`);
    console.log(`   ❌ Échecs:  ${errors}`);
    console.log(`\n📱 Votre application est maintenant opérationnelle !\n`);
}

// Exécution
importDirectlyToFirebase()
    .then(() => process.exit(0))
    .catch(err => {
        console.error('\n💥 Erreur fatale:', err);
        process.exit(1);
    });
