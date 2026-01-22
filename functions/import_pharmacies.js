const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

// Initialize Firebase Admin
if (!admin.apps.length) {
    try {
        // Try to load service account if it exists (for local dev)
        // But wrapped in try-catch to avoid crashing if missing
        try {
            const serviceAccount = require("./serviceAccountKey.json");
            admin.initializeApp({
                credential: admin.credential.cert(serviceAccount)
            });
            console.log("Initialized with serviceAccountKey.json");
        } catch (e) {
            // Fallback to default credentials (ADC)
            console.log("serviceAccountKey.json not found, trying default credentials...");
            admin.initializeApp();
        }
    } catch (e) {
        console.error("Failed to initialize Firebase Admin:", e);
        process.exit(1);
    }
}

const db = admin.firestore();

async function importPharmacies() {
    try {
        const filePath = path.join('..', 'scraper', 'pharmacies_for_webapp_import.json');
        console.log(`Reading data from ${filePath}...`);

        if (!fs.existsSync(filePath)) {
            console.error(`File not found: ${filePath}`);
            process.exit(1);
        }

        const rawData = fs.readFileSync(filePath);
        const pharmacies = JSON.parse(rawData);

        console.log(`Found ${pharmacies.length} pharmacies to import.`);

        const batchSize = 400;
        let batch = db.batch();
        let count = 0;
        let totalImported = 0;

        for (const p of pharmacies) {
            const docId = p.id || `pharm_${Math.random().toString(36).substr(2, 9)}`;
            const docRef = db.collection('pharmacies').doc(docId);

            // Prepare data - ensure status is correct
            const data = {
                ...p,
                updatedAt: admin.firestore.FieldValue.serverTimestamp(),
                importedAt: admin.firestore.FieldValue.serverTimestamp()
            };

            batch.set(docRef, data, { merge: true });
            count++;

            if (count >= batchSize) {
                await batch.commit();
                totalImported += count;
                console.log(`Imported ${totalImported} pharmacies...`);
                batch = db.batch();
                count = 0;
            }
        }

        if (count > 0) {
            await batch.commit();
            totalImported += count;
        }

        console.log(`✅ Successfully imported ${totalImported} pharmacies into Firestore.`);

    } catch (error) {
        console.error("❌ Error importing pharmacies:", error);

        // Detailed error for debugging
        if (error.code === 'app/invalid-credential') {
            console.error("\n❌ CREDENTIAL ERROR: You need to set up authentication.");
            console.error("Run: gcloud auth application-default login");
            console.error("OR put your serviceAccountKey.json in the functions folder.");
        }

        process.exit(1);
    }
}

importPharmacies();
