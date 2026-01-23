// Script de nettoyage des cliniques et dentistes invalides
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, deleteDoc, doc } = require('firebase/firestore');

const firebaseConfig = {
    apiKey: "AIzaSyDdbnlEjSiT3C-LTjJokcp7gRRpqt-t0uw",
    authDomain: "formation-28ed5.firebaseapp.com",
    projectId: "formation-28ed5",
    storageBucket: "formation-28ed5.firebasestorage.app",
    messagingSenderId: "544408503333",
    appId: "1:544408503333:web:3bb506c42852dfe0936bcc"
};

async function cleanFacilities() {
    console.log('🧹 NETTOYAGE DES DONNÉES INVALIDES...\n');

    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);

    const collectionsToCheck = ['clinics', 'dentists'];
    let deletedCount = 0;

    for (const colName of collectionsToCheck) {
        console.log(`🔍 Vérification de la collection '${colName}'...`);
        const snapshot = await getDocs(collection(db, colName));

        console.log(`   ${snapshot.size} documents trouvés.`);

        for (const d of snapshot.docs) {
            const data = d.data();
            const name = (data.name || "").toLowerCase().trim();
            const lat = data.location?.lat || 0;
            const lng = data.location?.lng || 0;

            // Critères de suppression
            let shouldDelete = false;

            if (!name || name === "sans nom" || name === "no name" || name === "noname" || name === "unknown") {
                shouldDelete = true;
                console.log(`   🗑️ Suppression ID ${d.id}: Nom invalide ("${data.name}")`);
            } else if (name.length < 3) {
                shouldDelete = true;
                console.log(`   🗑️ Suppression ID ${d.id}: Nom trop court ("${data.name}")`);
            } else if (lat === 0 && lng === 0) {
                shouldDelete = true;
                console.log(`   🗑️ Suppression ID ${d.id}: Coordonnées (0,0) - "${data.name}"`);
            }

            if (shouldDelete) {
                await deleteDoc(doc(db, colName, d.id));
                deletedCount++;
                // Petit délai pour ne pas saturer
                await new Promise(r => setTimeout(r, 20));
            }
        }
    }

    console.log(`\n✨ NETTOYAGE TERMINÉ !`);
    console.log(`   Total supprimé : ${deletedCount} entrées.`);
    process.exit(0);
}

cleanFacilities().catch(console.error);
