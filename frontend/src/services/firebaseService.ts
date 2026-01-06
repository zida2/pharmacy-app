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

// Helper to prevent Firebase from hanging forever on bad connections
const withTimeout = <T>(promise: Promise<T>, timeoutMs: number = 10000): Promise<T> => {
    return Promise.race([
        promise,
        new Promise<T>((_, reject) =>
            setTimeout(() => reject(new Error("Firebase Timeout")), timeoutMs)
        )
    ]);
};

export const firebaseService = {
    // 🏥 PHARMACIES
    async getPharmacies(): Promise<Pharmacy[]> {
        try {
            if (!USE_REAL_BACKEND) throw new Error("Using Mock Mode");
            const snap = await withTimeout(getDocs(collection(db, "pharmacies")), 8000) as any;
            if (snap.empty) throw new Error("No pharmacies in DB");
            return snap.docs.map((d: any) => ({ id: d.id, ...d.data() } as Pharmacy));
        } catch (e) {
            console.warn("Firebase fetch failed/timeout, using local fallback");
            return PHARMACIES_BURKINA_FASO;
        }
    },

    async getPharmacyById(id: string): Promise<Pharmacy | null> {
        try {
            if (USE_REAL_BACKEND) {
                const d = await withTimeout(getDoc(doc(db, "pharmacies", id)), 5000) as any;
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
                return pharmacies.filter(p => !!p).map(p => {
                    const lat = p.location?.lat || 0;
                    const lng = p.location?.lng || 0;
                    const straight = calculateDistance(userLocation, { latitude: lat, longitude: lng });
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
                        const lat = pharmacy.location?.lat || 0;
                        const lng = pharmacy.location?.lng || 0;
                        const dist = calculateDistance(userLocation, { latitude: lat, longitude: lng }) * 1.4;
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
                    if (pharm.location?.lat && pharm.location?.lng) {
                        const dist = calculateDistance(userLocation, { latitude: pharm.location.lat, longitude: pharm.location.lng }) * 1.4;
                        finalResults.push({ pharmacy: { ...pharm, distance: dist } });
                    } else {
                        finalResults.push({ pharmacy: pharm });
                    }
                }
            }

            if (isEmergencySearch) {
                const filtered = finalResults
                    .filter(r => r.pharmacy.status === 'guard' || !isEmergencySearch);

                if (filtered.length > 0) {
                    return filtered.sort((a, b) => (a.pharmacy.distance || 999) - (b.pharmacy.distance || 999));
                }
            }

            if (finalResults.length > 0) {
                return finalResults.sort((a, b) => (a.pharmacy.distance || 999) - (b.pharmacy.distance || 999));
            }

            // If zero results from real backend, force trigger local fallback logic below
            throw new Error("No results found in real backend");

        } catch (error: any) {
            if (error.message === "No results found in real backend") {
                console.log("🔍 Base de données vide, passage à la recherche locale intelligente...");
            } else {
                console.warn("⚠️ Échec de la recherche serveur, utilisation du secours local:", error);
            }
            const pharmacies = await this.getPharmacies();
            const q = term?.toLowerCase() || "";

            const pharmsWithDist = pharmacies.filter(p => !!p).map(p => {
                let distance = 999;
                if (p.location?.lat && p.location?.lng) {
                    distance = calculateDistance(userLocation, { latitude: p.location.lat, longitude: p.location.lng }) * 1.4;
                }
                return { ...p, distance };
            }).sort((a, b) => a.distance - b.distance);

            if (!q) return pharmsWithDist.map(p => ({ pharmacy: p }));

            // Better Fallback Filter: Use keywords and trimming for intelligence
            const cleanQuery = q.trim();
            const keywords = cleanQuery.split(/\s+/).filter(k => k.length >= 3);

            const filtered = pharmsWithDist.filter(p => {
                if (!p.name) return false;
                const name = p.name.toLowerCase();

                // 1. Precise match (trimmed)
                if (name.includes(cleanQuery)) return true;

                // 2. Specific typo tolerance for Marjean (common typo)
                if ((cleanQuery.includes("marje") || cleanQuery.includes("marge")) && p.id === "pharm-marjean") return true;

                // 3. Keyword matching (allows queries like "Pharmacie Marjean Ouaga")
                if (keywords.length > 0) {
                    return keywords.every(k => name.includes(k) || (p.location?.address?.toLowerCase()?.includes(k) || false));
                }

                return false;
            });

            return filtered.map(p => ({
                pharmacy: p,
                product: cleanQuery.includes("para") || cleanQuery.includes("med") ? {
                    id: "prod-para",
                    name: "Paracétamol 500mg",
                    price: 500 + Math.floor(Math.random() * 100),
                    inStock: true
                } as any : undefined
            }));
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
            const snap = await withTimeout(getDoc(userRef), 10000) as any;
            return snap.exists() ? snap.data() : null;
        } catch (error) {
            console.warn("User profile fetch timeout/error");
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
