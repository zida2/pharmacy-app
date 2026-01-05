const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function addMarjean() {
    const marjean = {
        name: "Pharmacie Marjean",
        location: {
            lat: 12.42864,
            lng: -1.5210985,
            address: "Secteur 40, Toudbwéogo (Arrondissement 09)",
            city: "Ouagadougou"
        },
        phone: "+226 79 00 01 41",
        status: "open",
        rating: 4.8,
        reviewCount: 124,
        isVerified: true,
        deliveryAvailable: true,
        deliveryFee: 1000,
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };

    try {
        const docRef = await db.collection('pharmacies').doc('pharm-marjean').set(marjean);
        console.log("✅ Pharmacie Marjean ajoutée avec succès à Firestore !");
    } catch (e) {
        console.error("❌ Erreur lors de l'ajout :", e);
    }
}

addMarjean();
