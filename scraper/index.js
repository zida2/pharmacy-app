const puppeteer = require('puppeteer');
const XLSX = require('xlsx');
const admin = require('firebase-admin');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

// Configuration
const CONFIG = {
    ANNUAIRE_URL: 'https://ordrepharmacien.bf/index.php/service/annuaire-pharmacie/',
    GARDE_URL: 'https://ordrepharmacien.bf/index.php/service/pharmacie-garde/',
    TIMEOUT: 60000,
    WAIT_BETWEEN_PAGES: 2000,
};

async function scrapeONPBF() {
    console.log('🚀 DÉMARRAGE DU SCRAPER OFFICIEL ONPBF...');
    const browser = await puppeteer.launch({
        headless: "new",
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();
    await page.setDefaultNavigationTimeout(CONFIG.TIMEOUT);

    try {
        // --- ÉTAPE 1 : SCRAPER L'ANNUAIRE COMPLET ---
        console.log('📂 Étape 1 : Récupération de l\'annuaire complet...');
        await page.goto(CONFIG.ANNUAIRE_URL, { waitUntil: 'networkidle2' });

        // Attendre que la table TablePress soit chargée
        await page.waitForSelector('#tablepress-2', { timeout: CONFIG.TIMEOUT });

        // Régler l'affichage sur 100 éléments pour aller plus vite
        try {
            await page.select('select[name="tablepress-2_length"]', '100');
            await new Promise(r => setTimeout(r, 2000));
        } catch (e) {
            console.log('⚠️ Impossible de changer le nombre d\'éléments par page, utilisation du défaut.');
        }

        let allPharmacies = [];
        let hasNextPage = true;
        let pageNum = 1;

        while (hasNextPage) {
            console.log(`📑 Lecture de la page annuaire ${pageNum}...`);

            const pharmaciesOnPage = await page.evaluate(() => {
                const rows = Array.from(document.querySelectorAll('#tablepress-2 tbody tr'));
                return rows.map(row => {
                    const cols = Array.from(row.querySelectorAll('td'));
                    if (cols.length < 4) return null;
                    return {
                        ville: cols[0].innerText.trim(),
                        nom_pharmacie: cols[1].innerText.trim(),
                        telephone: cols[2].innerText.trim(),
                        groupe: cols[3].innerText.trim(),
                        adresse_complete: cols[4] ? cols[4].innerText.trim() : ''
                    };
                }).filter(p => p !== null);
            });

            allPharmacies.push(...pharmaciesOnPage);

            // Gérer la pagination
            const nextButton = await page.$('.dt-paging-button.next:not(.disabled)');
            if (nextButton) {
                await nextButton.click();
                await new Promise(r => setTimeout(r, CONFIG.WAIT_BETWEEN_PAGES));
                pageNum++;
            } else {
                hasNextPage = false;
            }
        }

        console.log(`✅ ${allPharmacies.length} pharmacies extraites de l'annuaire.`);

        // --- ÉTAPE 2 : SCRAPER LE CALENDRIER DE GARDE ---
        console.log('📅 Étape 2 : Récupération du calendrier de garde...');
        await page.goto(CONFIG.GARDE_URL, { waitUntil: 'networkidle2' });

        // Note: Sur le site ONPBF, la garde est souvent affichée par tables (Ouaga, Bobo, etc.)
        const gardeInfo = await page.evaluate(() => {
            const result = [];
            // Chercher toutes les tables TablePress sur la page
            const tables = document.querySelectorAll('.tablepress');
            tables.forEach(table => {
                const rows = Array.from(table.querySelectorAll('tbody tr'));
                rows.forEach(row => {
                    const cols = Array.from(row.querySelectorAll('td'));
                    if (cols.length >= 2) {
                        result.push({
                            periode: cols[0].innerText.trim(), // ex: "Du lundi 30 Décembre 2024 au Lundi 06 Janvier 2025"
                            groupe: cols[1].innerText.trim(),  // ex: "GROUPE 1"
                            ville_garde: cols[2] ? cols[2].innerText.trim() : ''
                        });
                    }
                });
            });
            return result;
        });

        console.log(`📊 ${gardeInfo.length} périodes de garde identifiées.`);

        // --- ÉTAPE 3 : NORMALISATION ET FUSION ---
        console.log('🧹 Étape 3 : Normalisation et Enrichissement...');

        const finalData = allPharmacies.map((pharm, index) => {
            // Nettoyage téléphone
            const cleanPhone = pharm.telephone.replace(/\s+/g, '');

            // Déterminer si la pharmacie est actuellement de garde
            // (Logique simplifiée : on cherche si son groupe est dans la table de garde pour sa ville)
            const currentGarde = gardeInfo.find(g =>
                g.groupe.includes(pharm.groupe) &&
                (g.ville_garde.toLowerCase().includes(pharm.ville.toLowerCase()) || pharm.ville.toLowerCase().includes(g.ville_garde.toLowerCase()))
            );

            // Parsing des dates
            let dateDebut = 'N/A';
            let dateFin = 'N/A';
            if (currentGarde) {
                const dates = parseGardeDates(currentGarde.periode);
                dateDebut = dates.start;
                dateFin = dates.end;
            }

            // Géocodage (Optionnel - prend du temps car on doit limiter les appels)
            // On le laisse à 0 par défaut pour l'Excel, mais on peut activer si besoin

            return {
                id: `onpbf_${index + 1}`,
                nom_pharmacie: pharm.nom_pharmacie,
                ville: pharm.ville,
                quartier: pharm.adresse_complete.split(',')[0].trim(),
                adresse_complete: pharm.adresse_complete,
                telephone: cleanPhone.startsWith('+226') ? cleanPhone : `+226${cleanPhone}`,
                type_service: currentGarde ? 'GARDE' : 'NORMALE',
                groupe: pharm.groupe,
                periode_garde: currentGarde ? currentGarde.periode : 'N/A',
                date_debut_garde: dateDebut,
                date_fin_garde: dateFin,
                heures_ouverture: currentGarde ? '24h/24' : '08:00-22:00',
                latitude: 0,
                longitude: 0,
                source: 'ONPBF',
                date_mise_a_jour: new Date().toISOString()
            };
        });

        // --- OPTIONNEL : GÉOCODAGE MASSIF ---
        // Si vous voulez vraiment les coordonnées, décommentez cette boucle :
        /*
        console.log('📍 Étape Bonus : Géocodage des adresses (1 appel/sec)...');
        for (let i = 0; i < finalData.length; i++) {
            const extra = await geocodeAddress(`${finalData[i].nom_pharmacie}, ${finalData[i].ville}, Burkina Faso`);
            if (extra) {
                finalData[i].latitude = extra.lat;
                finalData[i].longitude = extra.lng;
            }
            await new Promise(r => setTimeout(r, 1000)); // Respecter les quotas Nominatim
        }
        */

        // --- ÉTAPE 4 : EXPORT EXCEL ---
        console.log('📁 Étape 4 : Génération du fichier Excel...');
        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.json_to_sheet(finalData);
        XLSX.utils.book_append_sheet(wb, ws, "Pharmacies");

        const exportPath = path.join(__dirname, 'pharmacies_burkina_onpbf.xlsx');
        XLSX.writeFile(wb, exportPath);
        console.log(`✨ Fichier exporté avec succès : ${exportPath}`);

        // --- ÉTAPE 5 : SYNC FIRESTORE (Facultatif) ---
        if (process.env.SYNC_TO_FIRESTORE === 'true') {
            console.log('🔥 Étape 5 : Synchronisation avec Firestore...');
            await syncToFirestore(finalData);
        }

    } catch (error) {
        console.error('❌ ERREUR DURANT LE SCRAPING:', error);
    } finally {
        await browser.close();
        console.log('🏁 Scraper terminé.');
    }
}

function parseGardeDates(periode) {
    const months = {
        'janvier': '01', 'février': '02', 'mars': '03', 'avril': '04', 'mai': '05', 'juin': '06',
        'juillet': '07', 'août': '08', 'septembre': '09', 'octobre': '10', 'novembre': '11', 'décembre': '12'
    };

    try {
        // Regex pour capturer DD Mois YYYY
        const regex = /(\d{1,2})\s+([a-zéû]+)\s+(\d{4})/gi;
        const matches = [...periode.matchAll(regex)];

        if (matches.length >= 2) {
            const start = `${matches[0][3]}-${months[matches[0][2].toLowerCase()]}-${matches[0][1].padStart(2, '0')}`;
            const end = `${matches[1][3]}-${months[matches[1][2].toLowerCase()]}-${matches[1][1].padStart(2, '0')}`;
            return { start, end };
        }
    } catch (e) {
        console.log('⚠️ Erreur lors du parsing des dates de garde.');
    }
    return { start: 'N/A', end: 'N/A' };
}

async function geocodeAddress(address) {
    try {
        const response = await require('axios').get('https://nominatim.openstreetmap.org/search', {
            params: { q: address, format: 'json', limit: 1 },
            headers: { 'User-Agent': 'ONPBF-Scraper-Burkina' } // Nominatim require un User-Agent
        });
        if (response.data && response.data.length > 0) {
            return {
                lat: parseFloat(response.data[0].lat),
                lng: parseFloat(response.data[0].lon)
            };
        }
    } catch (e) {
        console.log(`⚠️ Erreur de géocodage pour: ${address}`);
    }
    return null;
}

async function syncToFirestore(data) {
    if (!admin.apps.length) {
        // Nécessite un fichier serviceAccountKey.json pour fonctionner
        try {
            const serviceAccount = require('./serviceAccountKey.json');
            admin.initializeApp({
                credential: admin.credential.cert(serviceAccount)
            });
        } catch (e) {
            console.error("⚠️ Fichier serviceAccountKey.json manquant. Désactivation de la sync Firestore.");
            return;
        }
    }

    const db = admin.firestore();
    const batchSize = 400;

    for (let i = 0; i < data.length; i += batchSize) {
        const batch = db.batch();
        const chunk = data.slice(i, i + batchSize);

        chunk.forEach(pharm => {
            const docId = pharm.nom_pharmacie.toLowerCase().replace(/[^a-z0-9]/g, '_') + '_' + pharm.ville.toLowerCase();
            const ref = db.collection('pharmacies').doc(docId);
            batch.set(ref, {
                name: pharm.nom_pharmacie,
                location: {
                    city: pharm.ville,
                    address: pharm.adresse_complete,
                    lat: 0, // À enrichir avec géocodage
                    lng: 0
                },
                phone: pharm.telephone,
                status: pharm.type_service === 'GARDE' ? 'guard' : 'open',
                isGuardToday: pharm.type_service === 'GARDE',
                updatedAt: admin.firestore.FieldValue.serverTimestamp(),
                source: 'ONPBF_SCRAPER'
            }, { merge: true });
        });

        await batch.commit();
        console.log(`📦 Batch ${Math.floor(i / batchSize) + 1} synchronisé...`);
    }
    console.log('✅ Synchronisation Firestore terminée.');
}

scrapeONPBF();
