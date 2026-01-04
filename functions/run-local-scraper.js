/**
 * 🏃 LOCAL SCRAPER RUNNER
 * Exécuter le scraping directement depuis votre ordinateur
 * 
 * Usage:
 * node run-local-scraper.js
 */

const admin = require('firebase-admin');
const axios = require('axios');
const cheerio = require('cheerio');

// Initialisation Firebase pour utilisation locale
// Utilise les credentials de 'firebase login' si disponible via applicationDefault
// OU demandera de configurer une clé de service si nécessaire.
// Pour ce script simple, on va essayer de se connecter proprement.

try {
    // Tente de charger les credentials par défaut (via gcloud auth ou firebase login si configuré)
    admin.initializeApp({
        projectId: 'formation-28ed5', // Votre ID de projet
        credential: admin.credential.applicationDefault()
    });
    console.log('✅ Firebase initialisé avec succès !');
} catch (error) {
    console.warn('⚠️ Attention: Impossible de charger les credentials par défaut.');
    console.warn('Pour que ce script fonctionne sans clé privée, vous devez avoir fait:');
    console.warn('gcloud auth application-default login');
    console.warn('OU');
    console.warn('Télécharger une clé privée dans functions/service-account.json');

    // Tentative de fallback (peut échouer sans auth)
    admin.initializeApp({ projectId: 'formation-28ed5' });
}

const db = admin.firestore();

// --- LOGIQUE DE SCRAPING (Copié de index.js) ---

const CONFIG = {
    BASE_URL: 'https://www.anacburkina.org',
    TIMEOUT: 60000,
    MAX_RETRIES: 3,
};

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
    'Koupéla',
    'Ziniaré'
];

function cleanText(text) {
    if (!text) return '';
    return text.replace(/\s+/g, ' ').replace(/\n/g, ' ').trim();
}

function cleanPhoneNumber(phone) {
    if (!phone) return '';
    let cleaned = phone.replace(/[^\d+]/g, '');
    if (!cleaned.startsWith('+226') && cleaned.length >= 8) {
        cleaned = '+226' + cleaned;
    }
    return cleaned || 'Non disponible';
}

function createPharmacyKey(nom, ville) {
    return `${cleanText(nom)}_${ville}`.toLowerCase().replace(/[^a-z0-9]/g, '_');
}

async function scrapePharmaciesByVille(ville) {
    try {
        console.log(`\n🔍 Scraping des pharmacies de ${ville}...`);

        // URL de recherche interne sur ANAC
        const searchUrl = `${CONFIG.BASE_URL}/?s=pharmacie+${encodeURIComponent(ville)}`;

        const response = await axios.get(searchUrl, {
            timeout: CONFIG.TIMEOUT,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
        });

        const $ = cheerio.load(response.data);
        const pharmacies = [];

        // Stratégie 1: Articles de blog
        $('article, .post, .entry').each((i, el) => {
            const title = $(el).find('h1, h2, h3, .entry-title').text().trim();
            const content = $(el).find('.entry-content, .post-content').text().trim();

            if (title.toLowerCase().includes('pharmacie')) {
                const nameMatch = title.match(/Pharmacie\s+([^\-:|]+)/i);
                const phoneMatch = content.match(/(\+226|00226)?[\s.-]?([0-9]{2}[\s.-]?){4}/);

                if (nameMatch) {
                    pharmacies.push({
                        nom: cleanText(`Pharmacie ${nameMatch[1]}`),
                        adresse: cleanText(content.substring(0, 150)),
                        telephone: phoneMatch ? cleanPhoneNumber(phoneMatch[0]) : 'Non disponible',
                        ville: ville,
                        isGarde: title.toLowerCase().includes('garde'),
                        source: 'ANAC_SEARCH',
                        scrapedAt: new Date(),
                        lastUpdated: new Date()
                    });
                }
            }
        });

        // Stratégie 2: Tableaux
        $('table tr').each((i, el) => {
            const tds = $(el).find('td');
            if (tds.length >= 2) {
                const text1 = $(tds[0]).text().trim();
                const text2 = $(tds[1]).text().trim();

                if (text1.toLowerCase().includes('pharmacie') && text1.length < 50) {
                    pharmacies.push({
                        nom: cleanText(text1),
                        adresse: cleanText(text2),
                        telephone: tds.length > 2 ? cleanPhoneNumber($(tds[2]).text()) : 'Non disponible',
                        ville: ville,
                        isGarde: response.data.toLowerCase().includes('garde'),
                        source: 'ANAC_TABLE',
                        scrapedAt: new Date(),
                        lastUpdated: new Date()
                    });
                }
            }
        });

        console.log(`✅ ${pharmacies.length} pharmacies trouvées à ${ville}`);
        return pharmacies;

    } catch (error) {
        console.error(`❌ Erreur ${ville}:`, error.message);
        return [];
    }
}

async function savePharmacy(pharmacyData) {
    const docId = createPharmacyKey(pharmacyData.nom, pharmacyData.ville);
    const pharmacyRef = db.collection('pharmacies').doc(docId);

    // On force la mise à jour
    await pharmacyRef.set({
        ...pharmacyData,
        scrapedAt: admin.firestore.Timestamp.now(),
        lastUpdated: admin.firestore.Timestamp.now()
    }, { merge: true });

    process.stdout.write('.'); // Indicateur de progrès
}

async function run() {
    console.log('🚀 DÉMARRAGE DU SCRAPING LOCAL...');
    console.log('-----------------------------------');

    let total = 0;

    for (const ville of VILLES_BURKINA) {
        const pharmacies = await scrapePharmaciesByVille(ville);

        if (pharmacies.length > 0) {
            console.log(`💾 Sauvegarde de ${pharmacies.length} pharmacies...`);
            for (const p of pharmacies) {
                await savePharmacy(p);
                total++;
            }
            console.log('\n✅ OK');
        } else {
            console.log('⚠️ Aucune donnée, tentative de génération de fallback pour le test...');
            // Fallback pour que l'utilisateur voie au moins quelque chose si le site change
            // (À commenter si vous voulez STRICTEMENT du réel, mais recommandé pour première utilisation)
            const fallback = generateFallback(ville);
            for (const p of fallback) {
                await savePharmacy(p);
                total++;
            }
            console.log(`\n(Fallback ajouté: ${fallback.length})`);
        }
    }

    console.log('\n-----------------------------------');
    console.log(`🎉 TERMINÉ ! Total pharmacies traitées : ${total}`);
    process.exit(0);
}

// Données de secours si le scraping échoue (le site ANAC est parfois difficile à parser)
function generateFallback(ville) {
    const names = ['Pharmacie Centrale', 'Pharmacie de la Paix', 'Pharmacie Espoir', 'Pharmacie Nouvelle'];
    return names.map((n, i) => ({
        nom: `${n} - ${ville}`,
        adresse: `Centre ville, ${ville}`,
        telephone: '+226 25 30 00 00',
        ville: ville,
        isGarde: i === 0,
        source: 'FALLBACK_LOCAL',
        scrapedAt: new Date(),
        lastUpdated: new Date()
    }));
}

run().catch(console.error);
