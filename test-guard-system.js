/**
 * Script de test rapide pour vérifier les pharmacies de garde
 * Usage: node test-guard-system.js
 */

const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function testGuardSystem() {
    console.log('🧪 Test du système de pharmacies de garde\n');

    try {
        // 1. Compter toutes les pharmacies
        const allSnapshot = await db.collection('pharmacies').get();
        console.log(`📊 Total pharmacies dans la base: ${allSnapshot.size}`);

        // 2. Compter les pharmacies de garde
        const guardSnapshot = await db.collection('pharmacies')
            .where('isGuardToday', '==', true)
            .get();

        console.log(`🌙 Pharmacies de garde aujourd'hui: ${guardSnapshot.size}\n`);

        if (guardSnapshot.size === 0) {
            console.log('⚠️  AUCUNE PHARMACIE DE GARDE TROUVÉE');
            console.log('   → Exécutez la fonction manualUpdateRealGuardPharmacies');
            console.log('   → Ou allez sur /admin/guard\n');
        } else {
            console.log('✅ PHARMACIES DE GARDE ACTIVES:\n');
            guardSnapshot.forEach((doc, index) => {
                const data = doc.data();
                console.log(`${index + 1}. ${data.name || 'Sans nom'}`);
                console.log(`   📍 ${data.location?.address || data.location?.city || 'Adresse NC'}`);
                console.log(`   📞 ${data.phone || 'NC'}`);
                if (data.guardInfo) {
                    console.log(`   🔍 Match score: ${data.guardInfo.matchScore?.toFixed(1)}%`);
                    console.log(`   📝 Source ANAC: ${data.guardInfo.scrapedName}`);
                }
                console.log('');
            });
        }

        // 3. Vérifier la dernière mise à jour
        const recentGuardUpdate = await db.collection('pharmacies')
            .where('lastGuardCheck', '!=', null)
            .orderBy('lastGuardCheck', 'desc')
            .limit(1)
            .get();

        if (!recentGuardUpdate.empty) {
            const lastUpdate = recentGuardUpdate.docs[0].data().lastGuardCheck.toDate();
            const now = new Date();
            const hoursSinceUpdate = (now - lastUpdate) / (1000 * 60 * 60);

            console.log(`⏰ Dernière mise à jour: ${lastUpdate.toLocaleString('fr-FR')}`);
            console.log(`   (il y a ${hoursSinceUpdate.toFixed(1)} heures)\n`);

            if (hoursSinceUpdate > 24) {
                console.log('⚠️  La mise à jour date de plus de 24h');
                console.log('   → Déclenchez une mise à jour manuelle\n');
            }
        }

        // 4. Statistiques
        console.log('📈 STATISTIQUES:');
        const withPhone = allSnapshot.docs.filter(doc => doc.data().phone && doc.data().phone !== 'NC').length;
        const withAddress = allSnapshot.docs.filter(doc => doc.data().location?.address).length;
        const guardPercentage = guardSnapshot.size > 0 ? ((guardSnapshot.size / allSnapshot.size) * 100).toFixed(1) : 0;

        console.log(`   • Pharmacies avec téléphone: ${withPhone}/${allSnapshot.size} (${((withPhone / allSnapshot.size) * 100).toFixed(1)}%)`);
        console.log(`   • Pharmacies avec adresse: ${withAddress}/${allSnapshot.size} (${((withAddress / allSnapshot.size) * 100).toFixed(1)}%)`);
        console.log(`   • Pharmacies de garde: ${guardSnapshot.size}/${allSnapshot.size} (${guardPercentage}%)\n`);

        console.log('✅ Test terminé\n');

    } catch (error) {
        console.error('❌ Erreur:', error);
    }

    process.exit(0);
}

// Exécuter le test
testGuardSystem();
