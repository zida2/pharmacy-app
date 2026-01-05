import {
    collection,
    getDocs,
    getDoc,
    doc,
    query,
    where,
    addDoc,
    updateDoc,
    setDoc,
    serverTimestamp,
    orderBy,
    limit,
    Timestamp
} from "firebase/firestore";
import { db, auth } from "./firebase";
import { Pharmacy, Product, Order, PharmacyInventory } from "./types";
import { PHARMACIES_BURKINA_FASO } from "./pharmaciesData";
import { calculateDistance, getUserLocation } from "@/lib/geolocation";

const USE_REAL_BACKEND = process.env.NEXT_PUBLIC_USE_FIREBASE !== "false";

export const firebaseService = {
    // 🏥 PHARMACIES
    async getPharmacies(): Promise<Pharmacy[]> {
        try {
            if (!USE_REAL_BACKEND) throw new Error("Using Mock Mode");
            const snap = await getDocs(collection(db, "pharmacies"));
            if (snap.empty) throw new Error("No pharmacies in DB");
            return snap.docs.map((d: any) => ({ id: d.id, ...d.data() } as Pharmacy));
        } catch (e) {
            console.warn("Firebase fetch failed/disabled/empty, using full local dataset");
            return PHARMACIES_BURKINA_FASO;
        }
    },

    async getPharmacyById(id: string): Promise<Pharmacy | null> {
        try {
            if (USE_REAL_BACKEND) {
                const d = await getDoc(doc(db, "pharmacies", id));
                if (d.exists()) {
                    return { id: d.id, ...d.data() } as Pharmacy;
                }
            }
            return PHARMACIES_BURKINA_FASO.find(p => p.id === id) || null;
        } catch (e) {
            return PHARMACIES_BURKINA_FASO.find(p => p.id === id) || null;
        }
    },

    // 💊 PRODUCTS & SEARCH
    async searchMedicines(term: string, coords?: { latitude: number; longitude: number }): Promise<{ pharmacy: Pharmacy; product?: Product }[]> {
        const userLocation = coords || await getUserLocation();

        try {
            if (!USE_REAL_BACKEND) throw new Error("Using Mock Mode");

            const q = term?.toLowerCase() || "";
            const isEmergencySearch = q.includes("garde") || q.includes("urgence");

            // If no term, just return nearby
            if (!q) {
                const pharmacies = await this.getPharmacies();
                return pharmacies.map(p => {
                    const straight = calculateDistance(userLocation, { latitude: p.location.lat, longitude: p.location.lng });
                    return { pharmacy: { ...p, distance: straight * 1.4 } };
                }).sort((a, b) => (a.pharmacy.distance || 0) - (b.pharmacy.distance || 0));
            }

            // 1. Search for Products
            const productSnap = await getDocs(
                query(collection(db, "products"),
                    where("name", ">=", term),
                    where("name", "<=", term + '\uf8ff'))
            );
            const products = productSnap.docs.map((d: any) => ({ id: d.id, ...d.data() } as Product));

            // 2. Search for Pharmacies by Name (Direct match)
            const pharmacySnap = await getDocs(
                query(collection(db, "pharmacies"),
                    where("name", ">=", term),
                    where("name", "<=", term + '\uf8ff'))
            );
            const matchingPharmacies = pharmacySnap.docs.map((d: any) => ({ id: d.id, ...d.data() } as Pharmacy));

            const finalResults: { pharmacy: Pharmacy; product?: Product }[] = [];

            // Process Product Matches
            for (const prod of products) {
                const invSnap = await getDocs(
                    query(collection(db, "pharmacy_inventory"),
                        where("productId", "==", prod.id),
                        where("inStock", "==", true))
                );

                for (const invDoc of invSnap.docs) {
                    const inv = invDoc.data() as PharmacyInventory;
                    const pharmacy = await this.getPharmacyById(inv.pharmacyId);
                    if (pharmacy) {
                        const dist = calculateDistance(userLocation, { latitude: pharmacy.location.lat, longitude: pharmacy.location.lng }) * 1.4;
                        finalResults.push({
                            pharmacy: { ...pharmacy, distance: dist },
                            product: { ...prod, price: inv.price, stock: inv.stock, inStock: inv.inStock }
                        });
                    }
                }
            }

            // Process Direct Pharmacy Matches (if not already added)
            for (const pharm of matchingPharmacies) {
                if (!finalResults.some(r => r.pharmacy.id === pharm.id)) {
                    const dist = calculateDistance(userLocation, { latitude: pharm.location.lat, longitude: pharm.location.lng }) * 1.4;
                    finalResults.push({ pharmacy: { ...pharm, distance: dist } });
                }
            }

            // Emergency filter: if searching for 'garde', boost those with status 'guard'
            if (isEmergencySearch) {
                return finalResults
                    .filter(r => r.pharmacy.status === 'guard' || !isEmergencySearch)
                    .sort((a, b) => (a.pharmacy.distance || 999) - (b.pharmacy.distance || 999));
            }

            return finalResults.sort((a, b) => (a.pharmacy.distance || 999) - (b.pharmacy.distance || 999));

        } catch (error) {
            const pharmacies = await this.getPharmacies();
            const pharmsWithDist = pharmacies.map(p => {
                let distance = 999;
                if (p.location && typeof p.location.lat === 'number' && typeof p.location.lng === 'number') {
                    distance = calculateDistance(userLocation, { latitude: p.location.lat, longitude: p.location.lng }) * 1.4;
                }
                return { ...p, distance };
            }).sort((a, b) => a.distance - b.distance);

            if (!term) return pharmsWithDist.map(p => ({ pharmacy: p }));

            if (term.toLowerCase().includes("para") || term.toLowerCase().includes("doliprane")) {
                return pharmsWithDist.slice(0, 10).map(p => ({
                    pharmacy: p,
                    product: {
                        id: "prod-para",
                        name: "Paracétamol 500mg",
                        price: 500 + Math.floor(Math.random() * 100),
                        inStock: true
                    } as any
                }));
            }
            return pharmsWithDist.map(p => ({ pharmacy: p }));
        }
    },

    async getPharmacyInventory(pharmacyId: string): Promise<Product[]> {
        try {
            const invSnap = await getDocs(
                query(collection(db, "pharmacy_inventory"), where("pharmacyId", "==", pharmacyId))
            );

            const products: Product[] = [];
            for (const invDoc of invSnap.docs) {
                const inv = invDoc.data() as PharmacyInventory;
                const prodDoc = await getDoc(doc(db, "products", inv.productId));
                if (prodDoc.exists()) {
                    products.push({
                        ...(prodDoc.data() as Product),
                        id: prodDoc.id,
                        price: inv.price,
                        stock: inv.stock,
                        inStock: inv.inStock
                    });
                }
            }
            return products;
        } catch (e) {
            return [];
        }
    },

    // 🛒 ORDERS (USER SIDE)
    async getUserOrders(): Promise<Order[]> {
        const user = auth.currentUser;
        if (!user) return [];
        try {
            const q = query(
                collection(db, "orders"),
                where("userId", "==", user.uid),
                orderBy("createdAt", "desc")
            );
            const snap = await getDocs(q);
            return snap.docs.map((d: any) => ({ id: d.id, ...d.data() } as Order));
        } catch (e) {
            return [];
        }
    },

    async getOrderById(orderId: string): Promise<Order | null> {
        try {
            const d = await getDoc(doc(db, "orders", orderId));
            return d.exists() ? ({ id: d.id, ...d.data() } as Order) : null;
        } catch (e) {
            return null;
        }
    },

    async createOrder(orderData: Partial<Order>): Promise<string> {
        const user = auth.currentUser;
        const finalOrder: any = {
            ...orderData,
            userId: user?.uid || "anonymous",
            orderNumber: `ORD-${Math.random().toString(36).substring(7).toUpperCase()}`,
            status: "pending",
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
        };

        const docRef = await addDoc(collection(db, "orders"), finalOrder);
        return docRef.id;
    },

    async cancelOrder(orderId: string) {
        const orderRef = doc(db, "orders", orderId);
        await updateDoc(orderRef, {
            status: 'cancelled',
            updatedAt: serverTimestamp()
        });
    },

    // 👤 USER PROFILE
    async getUserProfile(uid: string) {
        try {
            const userRef = doc(db, "users", uid);
            const snap = await getDoc(userRef);
            return snap.exists() ? snap.data() : null;
        } catch (error) {
            return null;
        }
    },

    async saveUserProfile(uid: string, data: any) {
        try {
            const userRef = doc(db, "users", uid);
            await setDoc(userRef, {
                ...data,
                updatedAt: serverTimestamp()
            }, { merge: true });
        } catch (error) {
            console.error("Error saving user profile:", error);
        }
    },

    async upgradeUserToPremium(uid: string, plan: 'monthly' | 'yearly' = 'yearly') {
        try {
            const userRef = doc(db, "users", uid);
            const now = new Date();
            const expiryDate = new Date();
            if (plan === 'yearly') expiryDate.setFullYear(now.getFullYear() + 1);
            else expiryDate.setMonth(now.getMonth() + 1);

            await updateDoc(userRef, {
                "userInfo.isPremium": true,
                "userInfo.premiumExpiry": expiryDate.toISOString(),
                "userInfo.plan": plan
            });
            return true;
        } catch (error) {
            throw error;
        }
    },

    async syncUserProfile(userData: any) {
        const user = auth.currentUser;
        if (user) await this.saveUserProfile(user.uid, userData);
    }
};
