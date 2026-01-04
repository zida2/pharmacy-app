import { NextRequest, NextResponse } from 'next/server';
import admin from 'firebase-admin';

// Initialiser Firebase Admin
if (!admin.apps.length) {
    try {
        admin.initializeApp({
            credential: admin.credential.applicationDefault(),
        });
    } catch (error: any) {
        console.log('Firebase admin already initialized or error:', error.message);
    }
}

const db = admin.firestore();

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

export async function GET(request: NextRequest) {
    try {
        console.log('🏥 Début de la génération des pharmacies...');

        const batch = db.batch();
        let count = 0;
        const details: any[] = [];

        for (const ville of VILLES) {
            const villePharmacies: any[] = [];

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
                    rating: parseFloat((4.0 + Math.random()).toFixed(1)),
                    source: 'MOCK_DATA',
                    createdAt: admin.firestore.FieldValue.serverTimestamp(),
                    lastUpdated: admin.firestore.FieldValue.serverTimestamp()
                };

                const docId = `${pharmacy.nom}_${pharmacy.ville}`
                    .toLowerCase()
                    .replace(/[^a-z0-9]/g, '_');

                const docRef = db.collection('pharmacies').doc(docId);
                batch.set(docRef, pharmacy);

                villePharmacies.push(pharmacy.nom);
                count++;
            }

            details.push({
                ville: ville.nom,
                count: villePharmacies.length,
                pharmacies: villePharmacies
            });
        }

        await batch.commit();

        console.log(`✅ ${count} pharmacies créées avec succès !`);

        return NextResponse.json({
            success: true,
            message: `${count} pharmacies créées avec succès`,
            total: count,
            villes: VILLES.length,
            details: details
        });

    } catch (error: any) {
        console.error('❌ Erreur:', error);

        return NextResponse.json({
            success: false,
            error: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        }, { status: 500 });
    }
}
