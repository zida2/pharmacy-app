const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getCountFromServer } = require('firebase/firestore');

const firebaseConfig = {
    apiKey: "AIzaSyDdbnlEjSiT3C-LTjJokcp7gRRpqt-t0uw",
    authDomain: "formation-28ed5.firebaseapp.com",
    projectId: "formation-28ed5",
    storageBucket: "formation-28ed5.firebasestorage.app",
    messagingSenderId: "544408503333",
    appId: "1:544408503333:web:3bb506c42852dfe0936bcc"
};

async function checkCounts() {
    console.log('🔍 VÉRIFICATION DES DONNÉES...\n');
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);

    try {
        const clinicsSnap = await getCountFromServer(collection(db, "clinics"));
        const dentistsSnap = await getCountFromServer(collection(db, "dentists"));

        console.log(`🏥 CLINIQUES : ${clinicsSnap.data().count}`);
        console.log(`🦷 DENTISTES : ${dentistsSnap.data().count}`);
    } catch (e) {
        console.error("Erreur de connexion:", e.message);
    }
    process.exit(0);
}

checkCounts();
