// Script de nettoyage TURBO des cliniques et dentistes invalides
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, writeBatch, doc } = require('firebase/firestore');

const firebaseConfig = {
    apiKey: "AIzaSyDdbnlEjSiT3C-LTjJokcp7gRRpqt-t0uw",
    authDomain: "formation-28ed5.firebaseapp.com",
    projectId: "formation-28ed5",
    storageBucket: "formation-28ed5.firebasestorage.app",
    messagingSenderId: "544408503333",
    appId: "1:544408503333:web:3bb506c42852dfe0936bcc"
};

async function cleanFacilities() {
    console.log('🚀 NETTOYAGE TURBO DES DONNÉES INVALIDES...\n');

    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);

    const collectionsToCheck = ['clinics', 'dentists'];
    let totalDeleted = 0;

    for (const colName of collectionsToCheck) {
        console.log(`🔍 Vérification de la collection '${colName}'...`);
        const snapshot = await getDocs(collection(db, colName));

        console.log(`   ${snapshot.size} documents trouvés.`);

        let batch = writeBatch(db);
        let batchCount = 0;
        let deletedInCol = 0;

        for (const d of snapshot.docs) {
            const data = d.data();
            const rawName = data.name || "";
            const name = rawName.toLowerCase().trim();
            const lat = data.location?.lat || 0;
            const lng = data.location?.lng || 0;

            // Critères de suppression
            let shouldDelete = false;

            if (!name || name === "sans nom" || name === "no name" || name === "noname" || name === "unknown") {
                shouldDelete = true;
            } else if (name.length < 3) {
                shouldDelete = true;
            } else if (lat === 0 && lng === 0) {
                shouldDelete = true;
            }

            if (shouldDelete) {
                batch.delete(doc(db, colName, d.id));
                batchCount++;
                deletedInCol++;
                totalDeleted++;

                // Commit batch every 400
                if (batchCount >= 400) {
                    await batch.commit();
                    process.stdout.write('x'); // Feedback visual
                    batch = writeBatch(db);
                    batchCount = 0;
                }
            }
        }

        // Commit remaining
        if (batchCount > 0) {
            await batch.commit();
            process.stdout.write('x');
        }
        console.log(`\n   ✅ ${deletedInCol} supprimés dans ${colName}.`);
    }

    console.log(`\n✨ NETTOYAGE TERMINÉ !`);
    console.log(`   Total supprimé : ${totalDeleted} entrées.`);
    process.exit(0);
}

cleanFacilities().catch(console.error);
