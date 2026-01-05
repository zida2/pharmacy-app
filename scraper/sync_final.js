const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

async function syncFinal() {
    const data = JSON.parse(fs.readFileSync(path.join(__dirname, 'pharmacies_final.json'), 'utf8'));
    console.log(`🔥 Synchronisation de ${data.length} pharmacies vers Firestore...`);

    if (!admin.apps.length) {
        try {
            const serviceAccount = require('./serviceAccountKey.json');
            admin.initializeApp({
                credential: admin.credential.cert(serviceAccount)
            });
        } catch (e) {
            console.error("⚠️ serviceAccountKey.json absent. Sync impossible.");
            return;
        }
    }

    const db = admin.firestore();
    const batchSize = 400;

    for (let i = 0; i < data.length; i += batchSize) {
        const batch = db.batch();
        const chunk = data.slice(i, i + batchSize);

        chunk.forEach(pharm => {
            const docId = pharm.id || `pharm_${pharm.name.toLowerCase().replace(/[^a-z0-9]/g, '_')}`;
            const ref = db.collection('pharmacies').doc(docId);

            // Map to final Firestore format
            const docData = {
                name: pharm.name,
                location: {
                    lat: pharm.location.lat,
                    lng: pharm.location.lng,
                    address: pharm.location.address || '',
                    city: pharm.location.city || 'Ouagadougou'
                },
                phone: pharm.phone || 'NC',
                status: pharm.status || 'open',
                isVerified: pharm.isVerified || false,
                rating: pharm.rating || 4.5,
                reviewCount: pharm.reviewCount || 10,
                updatedAt: admin.firestore.FieldValue.serverTimestamp(),
                source: pharm.source || 'Discovery (Maps/OSM)'
            };

            batch.set(ref, docData, { merge: true });
        });

        await batch.commit();
        console.log(`📦 Batch ${Math.floor(i / batchSize) + 1} synchronisé...`);
    }
    console.log('✅ Base de données Firestore mise à jour !');
}

syncFinal();
