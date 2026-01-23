// Script pour forcer des pharmacies en mode GARDE
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

// Logique pour trouver le groupe actuel (copiée du frontend)
const getCurrentGuardGroup = () => {
    const refDate = new Date(2025, 0, 4); // 4 Jan 2025 = Groupe 1
    const now = new Date();
    const diffTime = now.getTime() - refDate.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    let weeks = Math.floor(diffDays / 7);

    // Ajustement week-end
    const day = now.getDay();
    const hours = now.getHours();
    if (day === 6 && hours >= 19) weeks += 1;
    if (day === 0) weeks += 0;

    const cycle = ["1", "2", "3", "4"];
    return cycle[((weeks % 4) + 4) % 4];
};

async function forceGuard() {
    console.log('🌙 ACTIVATION FORCÉE DES PHARMACIES DE GARDE...\n');

    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);

    const currentGroup = getCurrentGuardGroup();
    console.log(`📅 Groupe de garde actuel calculé : GROUPE ${currentGroup}`);

    // Récupérer toutes les pharmacies
    const snapshot = await getDocs(collection(db, "pharmacies"));
    console.log(`🏥 ${snapshot.size} pharmacies trouvées.`);

    // On va mettre à jour TOUTES les pharmacies pour leur attribuer un groupe aléatoire MAIS stable (basé sur leur ID)
    // ET on va s'assurer qu'au moins 25% d'entre elles sont dans le groupe actuel.

    // Pour être sûr, on va prendre les 50 premières et les forcer dans le groupe ACTUEL + status 'guard'
    const batch = writeBatch(db);
    let count = 0;

    // Mélanger un peu pour que ce soit réparti dans la ville si possible, 
    // ou juste prendre les premières.
    const docs = snapshot.docs; // .sort(() => Math.random() - 0.5);

    for (let i = 0; i < docs.length; i++) {
        const d = docs[i];
        const data = d.data();

        let newGroup = data.guardGroup;
        let newStatus = data.status;
        let isGuardToday = false;

        // Si c'est l'une des 40 premières, on FORCE le groupe actuel
        if (i < 40) {
            newGroup = currentGroup;
            newStatus = 'guard';
            isGuardToday = true;
            console.log(`   ✅ Force GARDE: ${data.name}`);
        } else {
            // Pour les autres, on assigne un groupe cyclique 1,2,3,4 si pas défini
            if (!newGroup) {
                newGroup = ((i % 4) + 1).toString();
            }

            // Si par hasard elles tombent sur le groupe actuel -> Garde
            if (newGroup === currentGroup) {
                newStatus = 'guard';
                isGuardToday = true;
            } else {
                newStatus = 'open'; // ou closed selon heure, mais on met open pour tester
                isGuardToday = false;
            }
        }

        batch.update(doc(db, "pharmacies", d.id), {
            guardGroup: newGroup,
            status: newStatus,
            isGuardToday: isGuardToday,
            updatedAt: new Date().toISOString()
        });

        count++;
        // Batch limit 500
        if (count >= 400) break;
    }

    await batch.commit();
    console.log(`\n✨ Succès ! ${count} pharmacies mises à jour.`);
    console.log(`   👉 Les 40 premières sont maintenant garanties "DE GARDE".`);
    process.exit(0);
}

forceGuard().catch(console.error);
