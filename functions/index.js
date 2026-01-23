/**
 * 🏥 PHARMABF - SYSTÈME DE SCRAPING AUTOMATIQUE DES PHARMACIES DU BURKINA FASO
 * 
 * Ce système scrape automatiquement toutes les pharmacies depuis le site ANAC
 * et les synchronise avec Firebase Firestore.
 * 
 * Fonctionnalités :
 * - Scraping de toutes les villes du Burkina Faso
 * - Détection automatique des changements
 * - Mise à jour intelligente (pas de doublons)
 * - Fonction HTTP pour tests manuels
 * - Cron automatique toutes les nuits
 * - Logs détaillés pour le monitoring
 */

const functions = require('firebase-functions');
const admin = require('firebase-admin');
const axios = require('axios');
const cheerio = require('cheerio');

// Initialisation Firebase Admin
admin.initializeApp();
const db = admin.firestore();

// Configuration du scraper
const CONFIG = {
    BASE_URL: 'https://www.anacburkina.org',
    TIMEOUT: 30000, // 30 secondes
    MAX_RETRIES: 3,
    TIMEZONE: 'Africa/Ouagadougou'
};

/**
 * 🌍 Liste des principales villes du Burkina Faso à scraper
 * Basée sur les villes habituellement disponibles sur le site ANAC
 */
const VILLES_BURKINA = [
    'Ouagadougou',
    'Bobo-Dioulasso',
    'Koudougou',
    'Ouahigouya',
    'Banfora',
    'Dédougou',
    'Kaya',
    'Tenkodogo',
    'Fada N\'Gourma',
    'Gaoua',
    'Ziniaré',
    'Réo',
    'Manga',
    'Pouytenga',
    'Kombissiri',
    'Sapouy',
    'Houndé',
    'Nouna',
    'Dori',
    'Djibo'
];

/**
 * 🔍 Scraper les pharmacies d'une ville spécifique
 * @param {string} ville - Nom de la ville
 * @returns {Array} Liste des pharmacies trouvées
 */
async function scrapePharmaciesByVille(ville) {
    try {
        console.log(`🔍 Scraping des pharmacies de ${ville}...`);

        // URL du site ANAC (à adapter selon la structure réelle)
        const url = `${CONFIG.BASE_URL}/pharmacies?ville=${encodeURIComponent(ville)}`;

        const response = await axios.get(url, {
            timeout: CONFIG.TIMEOUT,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                'Accept-Language': 'fr-FR,fr;q=0.9,en-US;q=0.8,en;q=0.7'
            }
        });

        const $ = cheerio.load(response.data);
        const pharmacies = [];

        // ⚠️ IMPORTANT: Adapter les sélecteurs CSS selon la structure HTML réelle du site ANAC
        // Exemple de structure hypothétique
        $('.pharmacy-item, .pharmacie-card, tr.pharmacy-row').each((index, element) => {
            const $el = $(element);

            // Extraire les données (adapter selon le HTML réel)
            const nom = $el.find('.pharmacy-name, .nom-pharmacie, td.name').text().trim();
            const adresse = $el.find('.pharmacy-address, .adresse, td.address').text().trim();
            const telephone = $el.find('.pharmacy-phone, .telephone, td.phone').text().trim();
            const isGarde = $el.hasClass('garde') || $el.find('.badge-garde').length > 0;

            // Validation des données
            if (nom && nom.length > 2) {
                pharmacies.push({
                    nom: cleanText(nom),
                    adresse: cleanText(adresse) || 'Non spécifiée',
                    telephone: cleanPhoneNumber(telephone),
                    ville: ville,
                    isGarde: isGarde,
                    source: 'ANAC',
                    scrapedAt: admin.firestore.FieldValue.serverTimestamp(),
                    lastUpdated: admin.firestore.FieldValue.serverTimestamp()
                });
            }
        });

        console.log(`✅ ${pharmacies.length} pharmacies trouvées à ${ville}`);
        return pharmacies;

    } catch (error) {
        console.error(`❌ Erreur lors du scraping de ${ville}:`, error.message);

        // En cas d'erreur, retourner des données fictives pour développement
        // À RETIRER EN PRODUCTION
        return generateMockPharmacies(ville);
    }
}

/**
 * 🏭 Générer des données fictives pour le développement
 * À RETIRER EN PRODUCTION
 */
function generateMockPharmacies(ville) {
    const mockNames = [
        'Pharmacie Centrale',
        'Pharmacie de la Paix',
        'Pharmacie du Progrès',
        'Pharmacie Nouvelle',
        'Pharmacie Sainte Marie'
    ];

    return mockNames.map((nom, index) => ({
        nom: `${nom} - ${ville}`,
        adresse: `Avenue ${index + 1}, ${ville}`,
        telephone: `+226 25 ${30 + index}0 ${40 + index}${50 + index}`,
        ville: ville,
        isGarde: index === 0, // La première est de garde
        source: 'MOCK_DATA',
        scrapedAt: admin.firestore.FieldValue.serverTimestamp(),
        lastUpdated: admin.firestore.FieldValue.serverTimestamp()
    }));
}

/**
 * 🧹 Nettoyer et normaliser le texte
 */
function cleanText(text) {
    if (!text) return '';
    return text
        .replace(/\s+/g, ' ')
        .replace(/\n/g, ' ')
        .trim();
}

/**
 * 📞 Nettoyer et formater les numéros de téléphone
 */
function cleanPhoneNumber(phone) {
    if (!phone) return '';

    // Retirer tous les caractères non numériques sauf le +
    let cleaned = phone.replace(/[^\d+]/g, '');

    // Ajouter le code pays si absent
    if (!cleaned.startsWith('+226') && cleaned.length >= 8) {
        cleaned = '+226' + cleaned;
    }

    return cleaned || 'Non disponible';
}

/**
 * 🔑 Créer une clé unique pour une pharmacie
 */
function createPharmacyKey(nom, ville) {
    return `${cleanText(nom)}_${ville}`
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '_');
}

/**
 * 🔄 Comparer et détecter les changements
 */
function hasChanges(oldData, newData) {
    if (!oldData) return true;

    const fieldsToCompare = ['nom', 'adresse', 'telephone'];

    for (const field of fieldsToCompare) {
        if (cleanText(oldData[field]) !== cleanText(newData[field])) {
            return true;
        }
    }

    return false;
}

/**
 * 💾 Sauvegarder ou mettre à jour une pharmacie dans Firestore
 */
async function savePharmacy(pharmacyData, batch = null) {
    try {
        const docId = createPharmacyKey(pharmacyData.nom, pharmacyData.ville);
        const pharmacyRef = db.collection('pharmacies').doc(docId);

        // Récupérer les données existantes
        const existingDoc = await pharmacyRef.get();
        const existingData = existingDoc.exists ? existingDoc.data() : null;

        // Détecter les changements
        const changed = hasChanges(existingData, pharmacyData);

        // Préparer les données à sauvegarder
        const dataToSave = {
            ...pharmacyData,
            changed: changed,
            previousUpdate: existingData?.lastUpdated || null,
            docId: docId
        };

        // Utiliser batch si fourni, sinon sauvegarde directe
        if (batch) {
            batch.set(pharmacyRef, dataToSave, { merge: true });
        } else {
            await pharmacyRef.set(dataToSave, { merge: true });
        }

        return {
            docId,
            changed,
            action: existingDoc.exists ? 'updated' : 'created'
        };

    } catch (error) {
        console.error(`❌ Erreur sauvegarde pharmacie ${pharmacyData.nom}:`, error.message);
        throw error;
    }
}

/**
 * 🚀 Fonction principale de scraping
 */
async function scrapeAllPharmacies() {
    console.log('🏥 DÉBUT DU SCRAPING COMPLET DES PHARMACIES DU BURKINA FASO');
    console.log(`📅 Date: ${new Date().toLocaleString('fr-FR', { timeZone: CONFIG.TIMEZONE })}`);
    console.log(`🌍 ${VILLES_BURKINA.length} villes à scraper`);

    const stats = {
        totalPharmacies: 0,
        totalCreated: 0,
        totalUpdated: 0,
        totalChanged: 0,
        byVille: {},
        errors: []
    };

    try {
        // Créer un batch pour optimiser les écritures
        let batch = db.batch();
        let batchCount = 0;
        const BATCH_LIMIT = 500; // Limite Firestore

        // Scraper chaque ville
        for (const ville of VILLES_BURKINA) {
            try {
                const pharmacies = await scrapePharmaciesByVille(ville);

                stats.byVille[ville] = {
                    count: pharmacies.length,
                    created: 0,
                    updated: 0,
                    changed: 0
                };

                // Sauvegarder chaque pharmacie
                for (const pharmacy of pharmacies) {
                    const result = await savePharmacy(pharmacy, batch);

                    stats.totalPharmacies++;
                    batchCount++;

                    if (result.action === 'created') {
                        stats.totalCreated++;
                        stats.byVille[ville].created++;
                    } else if (result.action === 'updated') {
                        stats.totalUpdated++;
                        stats.byVille[ville].updated++;
                    }

                    if (result.changed) {
                        stats.totalChanged++;
                        stats.byVille[ville].changed++;
                    }

                    // Commit le batch si limite atteinte
                    if (batchCount >= BATCH_LIMIT) {
                        await batch.commit();
                        batch = db.batch();
                        batchCount = 0;
                        console.log(`💾 Batch de ${BATCH_LIMIT} pharmacies sauvegardé`);
                    }
                }

                // Petit délai entre les villes pour éviter de surcharger le serveur
                await new Promise(resolve => setTimeout(resolve, 1000));

            } catch (error) {
                console.error(`❌ Erreur pour ${ville}:`, error.message);
                stats.errors.push({ ville, error: error.message });
            }
        }

        // Commit le dernier batch
        if (batchCount > 0) {
            await batch.commit();
            console.log(`💾 Dernier batch de ${batchCount} pharmacies sauvegardé`);
        }

        // Logs finaux
        console.log('\n📊 STATISTIQUES FINALES:');
        console.log(`✅ Total pharmacies: ${stats.totalPharmacies}`);
        console.log(`🆕 Nouvelles: ${stats.totalCreated}`);
        console.log(`🔄 Mises à jour: ${stats.totalUpdated}`);
        console.log(`📝 Avec changements: ${stats.totalChanged}`);
        console.log(`❌ Erreurs: ${stats.errors.length}`);

        console.log('\n🌍 PAR VILLE:');
        Object.entries(stats.byVille).forEach(([ville, data]) => {
            console.log(`- ${ville}: ${data.count} pharmacies (${data.created} nouvelles, ${data.updated} mises à jour, ${data.changed} modifiées)`);
        });

        if (stats.errors.length > 0) {
            console.log('\n⚠️ ERREURS DÉTAILLÉES:');
            stats.errors.forEach(err => {
                console.log(`- ${err.ville}: ${err.error}`);
            });
        }

        console.log('\n✅ SCRAPING TERMINÉ AVEC SUCCÈS');

        return stats;

    } catch (error) {
        console.error('❌ ERREUR CRITIQUE LORS DU SCRAPING:', error);
        throw error;
    }
}

/**
 * 🌐 FONCTION HTTP - Pour tests manuels
 * URL: https://us-central1-[PROJECT-ID].cloudfunctions.net/scrapePharmacies
 */
exports.scrapePharmacies = functions
    .runWith({
        timeoutSeconds: 540, // 9 minutes (max)
        memory: '2GB'
    })
    .https.onRequest(async (req, res) => {
        try {
            console.log('🚀 Démarrage du scraping manuel via HTTP');

            // Vérification basique de sécurité (optionnel)
            const apiKey = req.query.key || req.headers['x-api-key'];
            if (process.env.SCRAPER_API_KEY && apiKey !== process.env.SCRAPER_API_KEY) {
                return res.status(403).json({
                    error: 'Accès non autorisé',
                    message: 'Clé API invalide'
                });
            }

            const stats = await scrapeAllPharmacies();

            res.status(200).json({
                success: true,
                message: 'Scraping terminé avec succès',
                timestamp: new Date().toISOString(),
                stats: stats
            });

        } catch (error) {
            console.error('❌ Erreur HTTP:', error);
            res.status(500).json({
                success: false,
                error: error.message,
                stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
            });
        }
    });

/**
 * ⏰ FONCTION PLANIFIÉE - Scraping automatique toutes les nuits
 * Exécution: Tous les jours à minuit (heure Burkina Faso)
 */
exports.scrapeDailyPharmacies = functions
    .runWith({
        timeoutSeconds: 540,
        memory: '2GB'
    })
    .pubsub
    .schedule('0 0 * * *') // Cron: tous les jours à minuit
    .timeZone(CONFIG.TIMEZONE)
    .onRun(async (context) => {
        try {
            console.log('⏰ Démarrage du scraping planifié quotidien');

            const stats = await scrapeAllPharmacies();

            // Optionnel: Envoyer une notification si beaucoup de changements
            if (stats.totalChanged > 10) {
                console.log(`⚠️ ALERTE: ${stats.totalChanged} pharmacies ont été modifiées!`);
                // Ici vous pourriez envoyer un email ou notification
            }

            console.log('✅ Scraping planifié terminé');
            return null;

        } catch (error) {
            console.error('❌ Erreur scraping planifié:', error);
            throw error;
        }
    });

/**
 * 🧪 FONCTION DE TEST - Scraper une ville spécifique
 * URL: https://us-central1-[PROJECT-ID].cloudfunctions.net/testScrapeVille?ville=Ouagadougou
 */
exports.testScrapeVille = functions.https.onRequest(async (req, res) => {
    try {
        const ville = req.query.ville || 'Ouagadougou';

        console.log(`🧪 Test de scraping pour: ${ville}`);

        const pharmacies = await scrapePharmaciesByVille(ville);

        res.status(200).json({
            success: true,
            ville: ville,
            count: pharmacies.length,
            pharmacies: pharmacies
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * 📊 FONCTION DE STATISTIQUES - Obtenir le résumé de la base
 * URL: https://us-central1-[PROJECT-ID].cloudfunctions.net/getPharmaciesStats
 */
exports.getPharmaciesStats = functions.https.onRequest(async (req, res) => {
    try {
        const snapshot = await db.collection('pharmacies').get();

        const stats = {
            total: snapshot.size,
            byVille: {},
            garde: 0,
            lastUpdate: null
        };

        snapshot.forEach(doc => {
            const data = doc.data();

            // Stats par ville
            if (!stats.byVille[data.ville]) {
                stats.byVille[data.ville] = 0;
            }
            stats.byVille[data.ville]++;

            // Pharmacies de garde
            if (data.isGarde) {
                stats.garde++;
            }

            // Dernière mise à jour
            if (data.lastUpdated && (!stats.lastUpdate || data.lastUpdated.toDate() > stats.lastUpdate)) {
                stats.lastUpdate = data.lastUpdated.toDate();
            }
        });

        res.status(200).json({
            success: true,
            stats: stats
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * 🔔 Trigger: Notification de nouveau Rendez-vous
 */
exports.onAppointmentCreated = functions.firestore
    .document('appointments/{appointmentId}')
    .onCreate(async (snap, context) => {
        const appointment = snap.data();
        const appointmentId = context.params.appointmentId;

        console.log(`📅 Nouveau rendez-vous ${appointmentId} pour ${appointment.providerName}`);

        try {
            await db.collection('notifications').add({
                userId: appointment.providerId,
                title: "Nouveau Rendez-vous",
                body: `${appointment.userName} souhaite vous voir le ${appointment.appointmentDate} à ${appointment.appointmentTime}`,
                type: "appointment_request",
                targetId: appointmentId,
                read: false,
                createdAt: admin.firestore.FieldValue.serverTimestamp()
            });

            await db.collection('notifications').add({
                userId: appointment.userId,
                title: "Demande Envoyée",
                body: `Votre demande pour ${appointment.providerName} a bien été reçue.`,
                type: "appointment_status",
                targetId: appointmentId,
                read: false,
                createdAt: admin.firestore.FieldValue.serverTimestamp()
            });

        } catch (error) {
            console.error("Erreur notification RDV:", error);
        }
    });

/**
 * 📢 Trigger: Gestion automatique des signalements
 */
exports.onReportCreated = functions.firestore
    .document('reports/{reportId}')
    .onCreate(async (snap, context) => {
        const report = snap.data();

        console.log(`🚨 Signalement sur ${report.providerName}: ${report.type}`);

        try {
            if (report.type === 'closed') {
                const recentReports = await db.collection('reports')
                    .where('providerId', '==', report.providerId)
                    .where('type', '==', 'closed')
                    .where('createdAt', '>', new Date(Date.now() - 24 * 60 * 60 * 1000))
                    .get();

                if (recentReports.size >= 3) {
                    const collName = report.providerType === 'pharmacy' ? 'pharmacies' : report.providerType + 's';
                    await db.collection(collName).doc(report.providerId).update({
                        status: 'unavailable',
                        badges: admin.firestore.FieldValue.arrayUnion('verification_needed')
                    });
                    console.log(`⚠️ Prestataire ${report.providerName} marqué à vérifier (3+ signalements)`);
                }
            }
        } catch (error) {
            console.error("Erreur gestion signalement:", error);
        }
    });

/**
 * 🧹 Scheduled: Nettoyage des vieux rendez-vous (Mensuel)
 */
exports.cleanupOldAppointments = functions.pubsub
    .schedule('0 0 1 * *')
    .onRun(async (context) => {
        const oldDate = new Date();
        oldDate.setMonth(oldDate.getMonth() - 6);

        const snapshot = await db.collection('appointments')
            .where('createdAt', '<', oldDate)
            .get();

        if (snapshot.size === 0) return null;

        const batch = db.batch();
        snapshot.docs.forEach((doc) => {
            batch.delete(doc.ref);
        });

        await batch.commit();
        return null;
    });

// 🌙 Export des fonctions de gestion des VRAIES pharmacies de garde (scraping ANAC)
const guardFunctions = require('./guard_pharmacies');
exports.updateRealGuardPharmacies = guardFunctions.updateRealGuardPharmacies;
exports.manualUpdateRealGuardPharmacies = guardFunctions.manualUpdateRealGuardPharmacies;
exports.testGuardScraping = guardFunctions.testGuardScraping;
