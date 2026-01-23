// Script d'import des cliniques et dentistes via le SDK client Firebase
const { initializeApp } = require('firebase/app');
const { getFirestore, doc, setDoc, serverTimestamp } = require('firebase/firestore');
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

async function importMedicalFacilities() {
    console.log('🔥 IMPORT DES ÉTABLISSEMENTS MÉDICAUX VERS FIREBASE...\n');

    // Initialiser Firebase
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);
    console.log('✅ Firebase initialisé\n');

    // Fichiers à importer
    const filesToImport = [
        {
            file: path.join(__dirname, 'ecosystem_data', 'clinics.json'),
            collection: 'clinics',
            label: 'Cliniques'
        },
        {
            file: path.join(__dirname, 'ecosystem_data', 'dentists.json'),
            collection: 'dentists',
            label: 'Dentistes'
        }
    ];

    for (const item of filesToImport) {
        if (!fs.existsSync(item.file)) {
            console.warn(`⚠️ Fichier introuvable: ${item.file}`);
            continue;
        }

        try {
            const data = JSON.parse(fs.readFileSync(item.file, 'utf8'));
            console.log(`📊 Import de ${data.length} ${item.label} dans '${item.collection}'...`);

            let imported = 0;
            let failed = 0;

            // Import complet
            const entriesToImport = data;

            console.log(`   (Import complet de ${entriesToImport.length} entrées)\n`);

            for (let i = 0; i < entriesToImport.length; i++) {
                const entry = entriesToImport[i];

                // --- FILTRAGE STRICT ---
                const rawName = (entry.name || "").trim();
                const cleanName = rawName.toLowerCase();
                const lat = entry.location?.lat || 0;
                const lng = entry.location?.lng || 0;

                if (!rawName || cleanName === "sans nom" || cleanName === "noname" || cleanName === "unknown" || cleanName.length < 3) {
                    continue; // Ignorer nom invalide
                }
                if (lat === 0 && lng === 0) {
                    continue; // Ignorer sans coordonnées
                }
                // -----------------------

                const docId = entry.id || `${item.collection}_${Math.random().toString(36).substring(7)}`;

                // Standardisation des données
                const facilityData = {
                    name: entry.name || "Sans nom",
                    type: entry.type || item.collection.slice(0, -1), // clinic ou dentist
                    location: {
                        lat: entry.location?.lat || 0,
                        lng: entry.location?.lng || 0,
                        address: entry.location?.address || "",
                        city: entry.location?.city || "Ouagadougou"
                    },
                    phone: entry.phone || "NC",
                    services: entry.services || [],
                    openingHours: entry.openingHours || "24/7",
                    isVerified: false,
                    updatedAt: new Date().toISOString(),
                    source: "OpenStreetMap Import"
                };

                try {
                    await setDoc(doc(db, item.collection, docId), facilityData);
                    imported++;
                } catch (e) {
                    console.error(`   ❌ Erreur ${entry.name}: ${e.message}`);
                    failed++;
                }

                // Feedback visuel
                if ((i + 1) % 20 === 0) {
                    process.stdout.write('.');
                }
            }

            console.log(`\n\n✅ ${item.label}: ${imported} importés, ${failed} échecs.\n`);

        } catch (error) {
            console.error(`❌ Erreur globale pour ${item.label}:`, error);
        }
    }

    console.log(`\n🎉 IMPORTATION TERMINÉE !`);
    process.exit(0);
}

importMedicalFacilities().catch((error) => {
    console.error('❌ Erreur fatale:', error);
    process.exit(1);
});
