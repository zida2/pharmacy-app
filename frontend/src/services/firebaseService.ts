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
    Timestamp,
    onSnapshot,
    deleteDoc
} from "firebase/firestore";
import { db, auth } from "./firebase";
import { sendPasswordResetEmail } from "firebase/auth";
import { Pharmacy, Product, Order, PharmacyInventory, Consultation, ChatMessage, Treatment, Insurance } from "./types";
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

// Automated Guard Rotation Logic (Groups 1, 2, 3, 4)
const getCurrentGuardGroup = (): string => {
    // Reference: Saturday, Jan 4th, 2025 was a Group 1 start (Real world sync)
    const refDate = new Date(2025, 0, 4);
    const now = new Date();

    // Difference in weeks
    const diffMs = now.getTime() - refDate.getTime();
    const diffWeeks = Math.floor(diffMs / (1000 * 60 * 60 * 24 * 7));

    // Cycle: 1 -> 2 -> 3 -> 4
    const cycle = ["1", "2", "3", "4"];
    const index = ((diffWeeks % 4) + 4) % 4;
    return cycle[index];
};

// Stable group assignment for pharmacies without explicit data
const getStableGuardGroup = (id: string): string => {
    let hash = 0;
    for (let i = 0; i < id.length; i++) {
        hash = ((hash << 5) - hash) + id.charCodeAt(i);
        hash |= 0;
    }
    const index = Math.abs(hash) % 4;
    return ["1", "2", "3", "4"][index];
};

export const firebaseService = {
    // 🏥 PHARMACIES
    async getPharmacies(): Promise<Pharmacy[]> {
        const currentGroup = getCurrentGuardGroup();
        try {
            if (!USE_REAL_BACKEND) throw new Error("Using Mock Mode");
            const snap = await withTimeout(getDocs(collection(db, "pharmacies")), 8000) as any;
            if (snap.empty) throw new Error("No pharmacies in DB");
            return snap.docs.map((d: any) => {
                const data = d.data();
                const assignedGroup = data.guardGroup || getStableGuardGroup(d.id);
                const isGuard = assignedGroup === currentGroup;
                return {
                    id: d.id,
                    ...data,
                    guardGroup: assignedGroup,
                    isGuardToday: isGuard,
                    status: isGuard ? "guard" : (data.status || "open")
                } as Pharmacy;
            });
        } catch (e) {
            console.warn("Firebase fetch failed/timeout, using local fallback");
            return PHARMACIES_BURKINA_FASO.map(p => {
                const assignedGroup = p.guardGroup || getStableGuardGroup(p.id);
                const isGuard = assignedGroup === currentGroup;
                return {
                    ...p,
                    guardGroup: assignedGroup,
                    isGuardToday: isGuard,
                    status: isGuard ? "guard" : "open"
                } as Pharmacy;
            });
        }
    },

    async getPharmacyById(id: string): Promise<Pharmacy | null> {
        const currentGroup = getCurrentGuardGroup();
        try {
            if (USE_REAL_BACKEND) {
                const d = await withTimeout(getDoc(doc(db, "pharmacies", id)), 5000) as any;
                if (d.exists()) {
                    const data = d.data();
                    const assignedGroup = data.guardGroup || getStableGuardGroup(d.id);
                    const isGuard = assignedGroup === currentGroup;
                    return {
                        id: d.id,
                        ...data,
                        guardGroup: assignedGroup,
                        isGuardToday: isGuard,
                        status: isGuard ? "guard" : (data.status || "open")
                    } as Pharmacy;
                }
            }
            const p = PHARMACIES_BURKINA_FASO.find(p => p.id === id);
            if (!p) return null;
            const assignedGroup = p.guardGroup || getStableGuardGroup(p.id);
            const isGuard = assignedGroup === currentGroup;
            return { ...p, guardGroup: assignedGroup, isGuardToday: isGuard, status: isGuard ? "guard" : "open" };
        } catch (e) {
            const p = PHARMACIES_BURKINA_FASO.find(p => p.id === id);
            if (!p) return null;
            const assignedGroup = p.guardGroup || getStableGuardGroup(p.id);
            const isGuard = assignedGroup === currentGroup;
            return { ...p, guardGroup: assignedGroup, isGuardToday: isGuard, status: isGuard ? "guard" : "open" };
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

            // 1. Search for Products by Name or Active Ingredient
            const [nameSnap, ingredientSnap] = await Promise.all([
                getDocs(query(collection(db, "products"),
                    where("name", ">=", term),
                    where("name", "<=", term + '\uf8ff'))),
                getDocs(query(collection(db, "products"),
                    where("activeIngredient", ">=", term),
                    where("activeIngredient", "<=", term + '\uf8ff')))
            ]);

            const productsMap = new Map<string, Product>();
            nameSnap.docs.forEach((d: any) => productsMap.set(d.id, { id: d.id, ...d.data() } as Product));
            ingredientSnap.docs.forEach((d: any) => productsMap.set(d.id, { id: d.id, ...d.data() } as Product));

            const products = Array.from(productsMap.values());

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

            // If zero results from real backend, normally we might fetch from OSM or similar.
            // But since user expects to see *something* near them during TEST, let's inject a "Test Pharmacy" if the list is empty near them.




            // If zero results from real backend, force trigger local fallback logic below
            throw new Error("No results found in real backend");

        } catch (error: any) {
            console.warn("⚠️ Using OpenStreetMap Fallback for Pharmacies...");

            // 1. Try fetching from OpenStreetMap (Overpass API)
            try {
                const osmPharmacies = await this.fetchPharmaciesFromOSM();
                if (osmPharmacies.length > 0) {
                    console.log(`✅ ${osmPharmacies.length} pharmacies found via OSM`);

                    const pharmsWithDist = osmPharmacies.map(p => {
                        let distance = 999;
                        if (p.location?.lat && p.location?.lng) {
                            distance = calculateDistance(userLocation, { latitude: p.location.lat, longitude: p.location.lng }) * 1.4;
                        }
                        return { ...p, distance };
                    }).sort((a, b) => a.distance - b.distance);

                    // Filter if query exists
                    const q = term?.toLowerCase().trim() || "";
                    if (q) {
                        const filtered = pharmsWithDist.filter(p => p.name.toLowerCase().includes(q));
                        return filtered.map(p => ({ pharmacy: p, product: undefined }));
                    }

                    return pharmsWithDist.map(p => ({ pharmacy: p, product: undefined }));
                }
            } catch (osmError) {
                console.error("OSM Fallback failed:", osmError);
            }

            // 2. Final Fallback: Local Static Data (if OSM fails)
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

            const cleanQuery = q.trim();
            const filtered = pharmsWithDist.filter(p => p.name.toLowerCase().includes(cleanQuery));
            return filtered.map(p => ({ pharmacy: p, product: undefined }));
        }
    },

    // 🌍 OSM FETCH HELPER
    async fetchPharmaciesFromOSM(): Promise<Pharmacy[]> {
        const query = `
            [out:json][timeout:25];
            // Burkina Faso Area (approx bbox or query by name, using bbox for speed/reliability)
            (
              node["amenity"="pharmacy"](9.40, -5.52, 15.09, 2.41);
            );
            out body;
        `;
        const url = `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`;

        const response = await fetch(url);
        const data = await response.json();

        if (!data.elements) return [];

        return data.elements.map((el: any) => ({
            id: `osm-${el.id}`,
            name: el.tags.name || "Pharmacie Inconnue",
            location: {
                lat: el.lat,
                lng: el.lon,
                address: el.tags["addr:street"] || el.tags["addr:city"] || "Burkina Faso",
                city: el.tags["addr:city"] || "Ouagadougou"
            },
            phone: el.tags.phone || el.tags["contact:phone"] || "NC",
            status: "open", // Assumption for OSM data
            isVerified: false,
            source: "OpenStreetMap"
        }));
    },

    async getPharmacyInventory(pharmacyId: string): Promise<Product[]> {
        // TODO: Re-enable this when API is connected
        // Temporary: Empty stock for tests as requested
        return [];

        /*
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
        */
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
    },

    async resetPassword(email: string) {
        return sendPasswordResetEmail(auth, email);
    },

    // 🩺 TELE-CONSULTATION
    async createConsultation(type: "chat" | "video", subject: string, pharmacyId?: string): Promise<string> {
        const user = auth.currentUser;
        if (!user) throw new Error("Auth required");

        let userName = user.displayName || "Patient";
        try {
            const profile = await this.getUserProfile(user.uid);
            if (profile?.userInfo?.name) userName = profile.userInfo.name;
        } catch (e) {
            console.warn("Could not fetch profile name, using default");
        }

        const consultationData: any = {
            userId: user.uid,
            userName,
            status: "pending",
            type,
            subject,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
            unreadCount: 0
        };

        if (pharmacyId) {
            consultationData.pharmacyId = pharmacyId;
        }

        const docRef = await addDoc(collection(db, "consultations"), consultationData);

        // Add welcome message
        await addDoc(collection(db, "messages"), {
            consultationId: docRef.id,
            senderId: "system",
            senderName: "Assistant PharmaBF",
            senderRole: "pharmacist",
            text: `Bonjour ${consultationData.userName}, bienvenue dans votre espace de consultation sécurisé. Un pharmacien va vous assister pour votre demande : ${subject}.`,
            type: "text",
            createdAt: serverTimestamp()
        });

        return docRef.id;
    },

    async getUserConsultations(): Promise<Consultation[]> {
        const user = auth.currentUser;
        if (!user) return [];
        try {
            const q = query(
                collection(db, "consultations"),
                where("userId", "==", user.uid),
                orderBy("updatedAt", "desc")
            );
            const snap = await getDocs(q);
            return snap.docs.map((d: any) => ({ id: d.id, ...d.data() } as Consultation));
        } catch (e) {
            console.error("Error fetching consultations:", e);
            return [];
        }
    },

    async sendChatMessage(consultationId: string, text: string, type: "text" | "image" | "prescription" = "text") {
        const user = auth.currentUser;
        if (!user) throw new Error("Auth required");

        const msg: any = {
            consultationId,
            senderId: user.uid,
            senderName: user.displayName || "Patient",
            senderRole: "user",
            text,
            type,
            createdAt: serverTimestamp()
        };

        await addDoc(collection(db, "messages"), msg);

        // Update consultation last message
        const consultRef = doc(db, "consultations", consultationId);
        await updateDoc(consultRef, {
            lastMessage: text,
            updatedAt: serverTimestamp()
        });
    },

    // 💊 TREATMENTS (PILL REMINDER)
    async createTreatment(data: Partial<Treatment>) {
        const user = auth.currentUser;
        if (!user) throw new Error("Auth required");
        return await addDoc(collection(db, "treatments"), {
            ...data,
            userId: user.uid,
            isActive: true,
            createdAt: serverTimestamp()
        });
    },

    async getUserTreatments(): Promise<Treatment[]> {
        const user = auth.currentUser;
        if (!user) return [];
        try {
            const q = query(collection(db, "treatments"), where("userId", "==", user.uid));
            const snap = await getDocs(q);
            return snap.docs.map((d: any) => ({ id: d.id, ...d.data() } as Treatment));
        } catch (e) {
            console.error(e);
            return [];
        }
    },

    async deleteTreatment(id: string) {
        await deleteDoc(doc(db, "treatments", id));
    },

    // 🛡️ INSURANCE
    async createInsurance(data: Partial<Insurance>) {
        const user = auth.currentUser;
        if (!user) throw new Error("Auth required");
        return await addDoc(collection(db, "insurances"), {
            ...data,
            userId: user.uid,
            isVerified: false,
            createdAt: serverTimestamp()
        });
    },

    async getUserInsurances(): Promise<Insurance[]> {
        const user = auth.currentUser;
        if (!user) return [];
        try {
            const q = query(collection(db, "insurances"), where("userId", "==", user.uid));
            const snap = await getDocs(q);
            return snap.docs.map((d: any) => ({ id: d.id, ...d.data() } as Insurance));
        } catch (e) {
            console.error(e);
            return [];
        }
    }
};
