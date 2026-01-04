/**
 * 🚀 Script API pour peupler les pharmacies
 * À exécuter depuis le frontend Next.js
 */

import { db } from '@/services/firebase';
import { collection, doc, setDoc, serverTimestamp } from 'firebase/firestore';

const VILLES = [
    { nom: 'Ouagadougou', lat: 12.3714, lng: -1.5197 },
    { nom: 'Bobo-Dioulasso', lat: 11.1772, lng: -4.2973 },
    { nom: 'Koudougou', lat: 12.2522, lng: -2.3619 },
    { nom: 'Ouahigouya', lat: 13.5827, lng: -2.4217 },
    { nom: 'Banfora', lat: 10.6331, lng: -4.7617 },
    { nom: 'Dédougou', lat: 12.4614, lng: -3.4608 },
    { nom: 'Kaya', lat: 13.0917, lng: -1.0853 },
    { nom: 'Tenkodogo', lat: 11.7800, lng: -0.3700 },
    { nom: 'Fada N\'Gourma', lat: 12.0614, lng: 0.3586 },
    { nom: 'Gaoua', lat: 10.3333, lng: -3.1833 }
];

const PHARMACY_NAMES = [
    'Pharmacie Centrale',
    'Pharmacie de la Paix',
    'Pharmacie du Progrès',
    'Pharmacie Nouvelle',
    'Pharmacie Sainte Marie'
];

export async function populatePharmacies() {
    console.log('🏥 Génération des pharmacies...');

    let count = 0;

    try {
        for (const ville of VILLES) {
            console.log(`📍 ${ville.nom}:`);

            for (let i = 0; i < 5; i++) {
                const pharmacy = {
                    nom: PHARMACY_NAMES[i],
                    adresse: `Avenue ${i + 1}, ${ville.nom}`,
                    telephone: `+226 25 ${30 + i}${i} ${40 + i}${i} ${50 + i}${i}`,
                    ville: ville.nom,
                    location: {
                        lat: ville.lat + (Math.random() - 0.5) * 0.05,
                        lng: ville.lng + (Math.random() - 0.5) * 0.05,
                        address: `Avenue ${i + 1}, ${ville.nom}`
                    },
                    isGarde: i === 0,
                    status: i === 0 ? 'guard' : 'open',
                    hours: '08:00 - 20:00',
                    rating: 4.0 + Math.random(),
                    source: 'MOCK_DATA',
                    createdAt: serverTimestamp(),
                    lastUpdated: serverTimestamp()
                };

                const docId = `${pharmacy.nom}_${pharmacy.ville}`
                    .toLowerCase()
                    .replace(/[^a-z0-9]/g, '_');

                await setDoc(doc(db, 'pharmacies', docId), pharmacy);

                console.log(`  ✅ ${pharmacy.nom}`);
                count++;
            }
        }

        console.log(`\n✅ ${count} pharmacies créées avec succès !`);
        return { success: true, count };

    } catch (error) {
        console.error('❌ Erreur:', error);
        throw error;
    }
}
