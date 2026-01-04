import { db } from './frontend/src/services/firebase';
import { collection, getDocs, limit, query } from 'firebase/firestore';

async function debugData() {
    try {
        const q = query(collection(db, "pharmacies"), limit(1));
        const snap = await getDocs(q);
        if (snap.empty) {
            console.log("❌ La collection 'pharmacies' est vide !");
            return;
        }
        const data = snap.docs[0].data();
        console.log("✅ Exemple de données en base :");
        console.log(JSON.stringify(data, null, 2));

        console.log("\n🔍 Verification des types :");
        console.log("name type:", typeof data.name);
        console.log("location type:", typeof data.location);
        if (data.location) {
            console.log("lat type:", typeof data.location.lat);
            console.log("lng type:", typeof data.location.lng);
        }
    } catch (e) {
        console.error("❌ Erreur lors du debug :", e);
    }
}

debugData();
