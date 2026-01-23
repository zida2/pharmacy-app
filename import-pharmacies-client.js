// Script d'import des pharmacies utilisant le SDK client Firebase
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, doc, setDoc, serverTimestamp } = require('firebase/firestore');
const fs = require('fs');
const path = require('path');

// Configuration Firebase
const firebaseConfig = {
    apiKey: "AIzaSyDdbnlEjSiT3C-LTjJokcp7gRRpqt-t0uw",
    authDomain: "formation-28ed5.firebaseapp.com",
    projectId: "formation-28ed5",
    storageBucket: "formation-28ed5.firebasestorage.app",
    messagingSenderId: "544408503333",
    appId: "1:544408503333:web:3bb506c42852dfe0936bcc"
};

// Fonction pour obtenir le groupe de garde basé sur l'ID
function getStableGuardGroup(id) {
    let hash = 0;
    for (let i = 0; i < id.length; i++) {
        hash = ((hash << 5) - hash) + id.charCodeAt(i);
        hash |= 0;
    }
    const groups = ["1", "2", "3", "4"];
    return groups[Math.abs(hash) % 4];
}

async function importPharmacies() {
    console.log('🔥 IMPORT DES PHARMACIES VERS FIREBASE...\n');

    // Initialiser Firebase
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);
    console.log('✅ Firebase initialisé\n');

    // Charger les données
    const dataFile = path.join(__dirname, 'frontend', 'src', 'data', 'pharmacies_import.json');
    const pharmacies = JSON.parse(fs.readFileSync(dataFile, 'utf8'));
    console.log(`📊 ${pharmacies.length} pharmacies à importer\n`);

    let imported = 0;
    let failed = 0;

    // Importer une par une (le SDK client ne supporte pas les batches comme Admin SDK)
    for (let i = 0; i < pharmacies.length; i++) {
        const pharm = pharmacies[i];

        try {
            const docId = pharm.id || `onpbf_${Math.random().toString(36).substring(7)}`;

            // Préparer les données
            const pharmacyData = {
                name: pharm.nom_pharmacie || pharm.name || "Pharmacie Inconnue",
                location: {
                    city: pharm.ville || "Ouagadougou",
                    address: pharm.adresse_complete || pharm.quartier || "",
                    lat: pharm.latitude || 0,
                    lng: pharm.longitude || 0
                },
                phone: pharm.telephone || "NC",
                guardGroup: pharm.groupe || getStableGuardGroup(docId),
                status: (pharm.type_service === 'GARDE' || pharm.status === 'guard') ? 'guard' : 'open',
                isGuardToday: (pharm.type_service === 'GARDE' || pharm.isGuardToday === true),
                isVerified: true,
                deliveryAvailable: true,
                deliveryFee: 1000,
                rating: 4.5,
                reviewCount: Math.floor(Math.random() * 50) + 10,
                updatedAt: new Date().toISOString(),
                source: "ONPBF Scraper"
            };

            // Importer dans Firestore
            await setDoc(doc(db, "pharmacies", docId), pharmacyData);
            imported++;

            // Afficher la progression tous les 20
            if ((i + 1) % 20 === 0 || i === pharmacies.length - 1) {
                console.log(`✅ Progression: ${i + 1}/${pharmacies.length} (${Math.round((i + 1) / pharmacies.length * 100)}%)`);
            }

            // Petite pause pour éviter de surcharger Firebase
            if ((i + 1) % 10 === 0) {
                await new Promise(resolve => setTimeout(resolve, 100));
            }

        } catch (error) {
            console.error(`❌ Erreur pour ${pharm.nom_pharmacie || pharm.name}:`, error.message);
            failed++;
        }
    }

    console.log(`\n🎉 IMPORTATION TERMINÉE !`);
    console.log(`   ✅ Succès: ${imported}`);
    console.log(`   ❌ Échecs: ${failed}`);
    console.log(`\n📍 Les pharmacies sont maintenant disponibles dans votre app !`);

    process.exit(0);
}

importPharmacies().catch((error) => {
    console.error('❌ Erreur fatale:', error);
    process.exit(1);
});
