const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

async function importCollection(collectionName, fileName, transformFn) {
    const db = admin.firestore();
    const filePath = path.join(__dirname, 'ecosystem_data', fileName);

    if (!fs.existsSync(filePath)) {
        console.log(`⚠️ Skipped ${collectionName}: File ${fileName} not found.`);
        return;
    }

    const items = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    console.log(`🚀 Importing ${items.length} items to ${collectionName}...`);

    const batchSize = 400;
    let success = 0;

    for (let i = 0; i < items.length; i += batchSize) {
        const batch = db.batch();
        const chunk = items.slice(i, i + batchSize);

        chunk.forEach(item => {
            const docId = item.id.replace(/\//g, '_'); // sanitize ID
            const ref = db.collection(collectionName).doc(docId);
            const data = transformFn(item);
            batch.set(ref, data, { merge: true });
            success++;
        });

        await batch.commit();
        console.log(`  ✅ Batch committed (${chunk.length} items)`);
    }
    console.log(`✨ Imported ${success} documents to ${collectionName}.\n`);
}

async function main() {
    // Init Firebase
    if (!admin.apps.length) {
        try {
            const serviceAccount = require('./serviceAccountKey.json');
            admin.initializeApp({
                credential: admin.credential.cert(serviceAccount)
            });
        } catch (e) {
            console.error("❌ Stats: ./serviceAccountKey.json missing in scraper folder.");
            process.exit(1);
        }
    }

    // 1. Pharmacies
    await importCollection('pharmacies', 'pharmacies.json', (p) => ({
        name: p.name,
        location: p.location,
        phone: p.phone,
        status: p.status,
        guardGroup: p.id.includes('osm') ? 'unified' : (p.groupe || '1'),
        gps_validated: p.gps_validated || false,
        source: p.source,
        type: 'pharmacy',
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
    }));

    // 2. Clinics & Hospitals
    await importCollection('clinics', 'clinics.json', (c) => ({
        name: c.name,
        location: c.location,
        phone: c.phone || "NC",
        type: 'clinic',
        status: 'open',
        gps_validated: false, // Imported from OSM
        services: ["Urgences", "Médecine Générale", "Soins Infirmiers"],
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
    }));

    // 3. Dentists
    await importCollection('dentists', 'dentists.json', (d) => ({
        name: d.name,
        location: d.location,
        phone: d.phone || "NC",
        type: 'dentist',
        status: 'open',
        gps_validated: false,
        services: ["Consultation", "Soins Dentaires"],
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
    }));

    // 4. Insurances
    await importCollection('insurance_providers', 'insurance_providers.json', (i) => ({
        ...i,
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
    }));

    console.log("🎉 Ecosystem Database Populated Successfully!");
}

main().catch(console.error);
