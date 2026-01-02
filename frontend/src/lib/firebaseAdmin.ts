import * as admin from 'firebase-admin';

if (!admin.apps.length) {
    try {
        admin.initializeApp({
            credential: admin.credential.applicationDefault(),
            databaseURL: process.env.FIREBASE_DATABASE_URL
        });
        console.log('Firebase Admin Initialized');
    } catch (error) {
        console.error('Firebase Admin initialization error', error);
    }
}

export const adminDb = admin.firestore();
export const adminAuth = admin.auth();
