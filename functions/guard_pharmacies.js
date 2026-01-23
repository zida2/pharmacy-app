/**
 * 🌙 SCRAPER DES VRAIES PHARMACIES DE GARDE - BURKINA FASO
 * Source: Site officiel de l'ANAC (Agence Nationale de Normalisation et de Contrôle)
 * URL: https://www.anacburkina.org
 * 
 * Ce script scrape les pharmacies de garde RÉELLES publiées officiellement
 */

const functions = require('firebase-functions');
const admin = require('firebase-admin');
const axios = require('axios');
const cheerio = require('cheerio');

/**
 * Scrape les pharmacies de garde depuis le site officiel de l'ANAC
 */
async function scrapeRealGuardPharmacies() {
    console.log('🔍 Scraping des VRAIES pharmacies de garde depuis ANAC...');

    try {
        // URL du site ANAC - pharmacies de garde
        const anacUrl = 'https://www.anacburkina.org/pharmacies-garde';

        const response = await axios.get(anacUrl, {
            timeout: 30000,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                'Accept-Language': 'fr-FR,fr;q=0.9',
            }
        });

        const $ = cheerio.load(response.data);
        const guardPharmacies = [];

        // 🔑 SÉLECTEURS À ADAPTER selon la structure HTML réelle du site ANAC
        // Ces sélecteurs sont des exemples - il faut inspecter le site réel

        // Option 1: Si liste de pharmacies avec classe spécifique
        $('.pharmacy-guard-item, .pharmacie-garde, .guard-pharmacy').each((index, element) => {
            const $el = $(element);

            const name = $el.find('.name, .nom, .pharmacy-name, h3, h4').first().text().trim();
            const address = $el.find('.address, .adresse, .location').first().text().trim();
            const phone = $el.find('.phone, .tel, .telephone, .contact').first().text().trim();
            const schedule = $el.find('.schedule, .horaire, .hours').first().text().trim();

            if (name && name.length > 3) {
                guardPharmacies.push({
                    name: cleanText(name),
                    address: cleanText(address),
                    phone: cleanPhoneNumber(phone),
                    schedule: cleanText(schedule),
                    scraped_at: new Date().toISOString()
                });
            }
        });

        // Option 2: Si tableau HTML
        $('table tr').each((index, row) => {
            if (index === 0) return; // Skip header

            const $row = $(row);
            const cells = $row.find('td');

            if (cells.length >= 2) {
                const name = $(cells[0]).text().trim();
                const address = $(cells[1]).text().trim();
                const phone = cells.length > 2 ? $(cells[2]).text().trim() : '';

                if (name && name.length > 3) {
                    guardPharmacies.push({
                        name: cleanText(name),
                        address: cleanText(address),
                        phone: cleanPhoneNumber(phone),
                        schedule: '',
                        scraped_at: new Date().toISOString()
                    });
                }
            }
        });

        // Option 3: Recherche de liste générique
        $('ul.pharmacies-list li, ol.guard-list li').each((index, item) => {
            const text = $(item).text();
            const nameMatch = text.match(/Pharmacie\s+([^,\n\r]+)/i);
            const phoneMatch = text.match(/(\+?226)?\s*\d{2}\s*\d{2}\s*\d{2}\s*\d{2}/);

            if (nameMatch) {
                guardPharmacies.push({
                    name: cleanText(nameMatch[0]),
                    address: '',
                    phone: phoneMatch ? cleanPhoneNumber(phoneMatch[0]) : '',
                    schedule: '',
                    scraped_at: new Date().toISOString()
                });
            }
        });

        console.log(`✅ ${guardPharmacies.length} pharmacies de garde trouvées sur ANAC`);

        if (guardPharmacies.length === 0) {
            console.warn('⚠️ Aucune pharmacie trouvée - vérifier les sélecteurs CSS');
            throw new Error('Aucune pharmacie de garde trouvée sur le site ANAC');
        }

        return guardPharmacies;

    } catch (error) {
        console.error('❌ Erreur scraping ANAC:', error.message);

        // Fallback: Essayer une source alternative (ex: page Facebook, WhatsApp Business, etc.)
        console.log('🔄 Tentative source alternative...');
        return await scrapeFallbackSources();
    }
}

/**
 * Sources alternatives si ANAC ne fonctionne pas
 */
async function scrapeFallbackSources() {
    // TODO: Ajouter des sources alternatives
    // - Page Facebook de l'Ordre des Pharmaciens du Burkina
    // - Sites d'actualités locales
    // - API gouvernementale si disponible

    console.warn('⚠️ Sources alternatives non configurées');
    throw new Error('Impossible de récupérer les pharmacies de garde');
}

/**
 * Nettoyer le texte
 */
function cleanText(text) {
    if (!text) return '';
    return text
        .replace(/\s+/g, ' ')
        .replace(/[\n\r\t]/g, ' ')
        .trim();
}

/**
 * Nettoyer et formater les numéros de téléphone
 */
function cleanPhoneNumber(phone) {
    if (!phone) return '';

    let cleaned = phone.replace(/[^\d+]/g, '');

    if (!cleaned.startsWith('+226') && cleaned.length >= 8) {
        cleaned = '+226' + cleaned;
    }

    return cleaned || '';
}

/**
 * Matcher les pharmacies scrapées avec celles dans Firestore
 */
async function matchAndUpdateGuardStatus(scrapedPharmacies) {
    const db = admin.firestore();

    console.log('🔄 Mise à jour du statut de garde dans Firestore...');

    // Récupérer toutes les pharmacies de la base
    const snapshot = await db.collection('pharmacies').get();
    const allPharmacies = snapshot.docs.map(doc => ({
        id: doc.id,
        ref: doc.ref,
        name: doc.data().name || '',
        phone: doc.data().phone || '',
        ...doc.data()
    }));

    console.log(`📋 ${allPharmacies.length} pharmacies dans la base`);

    // Fonction pour comparer les noms (similarité)
    function similarityScore(name1, name2) {
        const n1 = name1.toLowerCase().replace(/[^a-z0-9]/g, '');
        const n2 = name2.toLowerCase().replace(/[^a-z0-9]/g, '');

        if (n1 === n2) return 100;
        if (n1.includes(n2) || n2.includes(n1)) return 80;

        // Jaccard similarity (mots)
        const words1 = new Set(name1.toLowerCase().split(/\s+/));
        const words2 = new Set(name2.toLowerCase().split(/\s+/));
        const intersection = new Set([...words1].filter(x => words2.has(x)));
        const union = new Set([...words1, ...words2]);

        return (intersection.size / union.size) * 100;
    }

    // Matcher chaque pharmacie scrapée
    const matches = [];
    const unmatched = [];

    for (const scrapedPharmacy of scrapedPharmacies) {
        let bestMatch = null;
        let bestScore = 0;

        for (const dbPharmacy of allPharmacies) {
            const nameScore = similarityScore(scrapedPharmacy.name, dbPharmacy.name);

            // Bonus si téléphone correspond
            let phoneBonus = 0;
            if (scrapedPharmacy.phone && dbPharmacy.phone) {
                const phone1 = scrapedPharmacy.phone.replace(/[^\d]/g, '');
                const phone2 = dbPharmacy.phone.replace(/[^\d]/g, '');
                if (phone1 === phone2) phoneBonus = 20;
            }

            const totalScore = nameScore + phoneBonus;

            if (totalScore > bestScore) {
                bestScore = totalScore;
                bestMatch = dbPharmacy;
            }
        }

        // Considérer comme match si score > 70%
        if (bestScore >= 70 && bestMatch) {
            matches.push({
                scraped: scrapedPharmacy,
                db: bestMatch,
                score: bestScore
            });
        } else {
            unmatched.push(scrapedPharmacy);
        }
    }

    console.log(`✅ ${matches.length} pharmacies matchées (score ≥ 70%)`);
    console.log(`⚠️ ${unmatched.length} pharmacies non matchées`);

    if (unmatched.length > 0) {
        console.log('📝 Pharmacies non matchées:');
        unmatched.forEach(p => console.log(`  - ${p.name}`));
    }

    // Mise à jour par batch
    const batch = db.batch();
    let updateCount = 0;

    // Marquer toutes les pharmacies comme NON de garde d'abord
    allPharmacies.forEach(pharmacy => {
        batch.update(pharmacy.ref, {
            isGuardToday: false,
            lastGuardCheck: admin.firestore.FieldValue.serverTimestamp()
        });
    });

    // Marquer les pharmacies matchées comme DE GARDE
    matches.forEach(match => {
        batch.update(match.db.ref, {
            isGuardToday: true,
            guardInfo: {
                scrapedName: match.scraped.name,
                address: match.scraped.address,
                phone: match.scraped.phone,
                schedule: match.scraped.schedule,
                matchScore: match.score,
                lastUpdate: admin.firestore.FieldValue.serverTimestamp()
            }
        });
        updateCount++;

        console.log(`  ✓ ${match.db.name} (score: ${match.score.toFixed(1)}%)`);
    });

    await batch.commit();

    console.log(`✅ ${updateCount} pharmacies de garde mises à jour`);

    return {
        total: allPharmacies.length,
        scraped: scrapedPharmacies.length,
        matched: matches.length,
        unmatched: unmatched.length,
        guardPharmacies: matches.map(m => ({
            id: m.db.id,
            name: m.db.name,
            scrapedName: m.scraped.name,
            score: m.score
        }))
    };
}

/**
 * Fonction Cloud planifiée - Scraping quotidien des VRAIES pharmacies de garde
 * Exécution: Tous les jours à 6h du matin (avant l'ouverture)
 */
exports.updateRealGuardPharmacies = functions
    .region('europe-west1')
    .runWith({
        timeoutSeconds: 300,
        memory: '1GB'
    })
    .pubsub
    .schedule('0 6 * * *') // 6h du matin tous les jours
    .timeZone('Africa/Ouagadougou')
    .onRun(async (context) => {
        try {
            console.log('⏰ Début du scraping automatique des pharmacies de garde');

            const scrapedPharmacies = await scrapeRealGuardPharmacies();
            const result = await matchAndUpdateGuardStatus(scrapedPharmacies);

            console.log('✅ Mise à jour automatique terminée');
            console.log(`📊 ${result.matched} pharmacies de garde actives`);

            return result;

        } catch (error) {
            console.error('❌ Erreur scraping automatique:', error);

            // En cas d'erreur critique, envoyer une notification
            // TODO: Implémenter notification admin

            throw error;
        }
    });

/**
 * Fonction HTTP manuelle pour forcer la mise à jour
 */
exports.manualUpdateRealGuardPharmacies = functions
    .region('europe-west1')
    .runWith({
        timeoutSeconds: 300,
        memory: '1GB'
    })
    .https
    .onRequest(async (req, res) => {
        // CORS
        res.set('Access-Control-Allow-Origin', '*');

        if (req.method === 'OPTIONS') {
            res.set('Access-Control-Allow-Methods', 'POST');
            res.set('Access-Control-Allow-Headers', 'Content-Type');
            res.status(204).send('');
            return;
        }

        try {
            console.log('🔧 Mise à jour manuelle déclenchée');

            const scrapedPharmacies = await scrapeRealGuardPharmacies();
            const result = await matchAndUpdateGuardStatus(scrapedPharmacies);

            res.status(200).json({
                success: true,
                message: `${result.matched} pharmacies de garde mises à jour depuis ANAC`,
                timestamp: new Date().toISOString(),
                data: result
            });

        } catch (error) {
            console.error('❌ Erreur:', error);
            res.status(500).json({
                success: false,
                error: error.message,
                message: 'Impossible de récupérer les pharmacies de garde. Vérifiez que le site ANAC est accessible.'
            });
        }
    });

/**
 * Fonction de diagnostic - Tester le scraping sans mise à jour
 */
exports.testGuardScraping = functions
    .region('europe-west1')
    .https
    .onRequest(async (req, res) => {
        res.set('Access-Control-Allow-Origin', '*');

        try {
            const scrapedPharmacies = await scrapeRealGuardPharmacies();

            res.status(200).json({
                success: true,
                count: scrapedPharmacies.length,
                pharmacies: scrapedPharmacies,
                message: 'Scraping test réussi (aucune mise à jour effectuée)'
            });

        } catch (error) {
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    });

module.exports = {
    scrapeRealGuardPharmacies,
    matchAndUpdateGuardStatus
};
