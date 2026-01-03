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
import { calculateDistance, getUserLocation, sortByDistance } from "@/lib/geolocation";

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
            // Fallback: Check local dataset if not found in DB or if using mock
            return PHARMACIES_BURKINA_FASO.find(p => p.id === id) || null;
        } catch (e) {
            // Error Fallback
            return PHARMACIES_BURKINA_FASO.find(p => p.id === id) || null;
        }
    },

    // 💊 PRODUCTS & INVENTORY
    async searchMedicines(term: string, coords?: { latitude: number; longitude: number }): Promise<{ pharmacy: Pharmacy; product?: Product }[]> {
        // Get user location for distance calculations
        const userLocation = coords || await getUserLocation();

        try {
            if (!USE_REAL_BACKEND) throw new Error("Using Mock Mode");
            if (!term) {
                const pharmacies = await this.getPharmacies();
                // Add distance to each pharmacy and sort by proximity
                const pharmaciesWithDistance = pharmacies.map(p => ({
                    ...p,
                    distance: calculateDistance(
                        userLocation,
                        { latitude: p.location.lat, longitude: p.location.lng }
                    )
                })).sort((a, b) => a.distance - b.distance);

                return pharmaciesWithDistance.slice(0, 100).map(p => ({ pharmacy: p }));
            }

            const q = term.toLowerCase();

            // In Firestore, searching is complex (usually requires Algolia).
            // For this phase, we fetch the common global products and filter client-side 
            // OR search in a global index. Let's do a simple name match.
            const productSnap = await getDocs(
                query(collection(db, "products"),
                    where("name", ">=", term),
                    where("name", "<=", term + '\uf8ff'))
            );

            const products = productSnap.docs.map((d: any) => ({ id: d.id, ...d.data() } as Product));
            const finalResults: { pharmacy: Pharmacy; product?: Product }[] = [];

            for (const prod of products) {
                // Find pharmacies that have this product in inventory
                const invSnap = await getDocs(
                    query(collection(db, "pharmacy_inventory"),
                        where("productId", "==", prod.id),
                        where("inStock", "==", true))
                );

                for (const invDoc of invSnap.docs) {
                    const inv = invDoc.data() as PharmacyInventory;
                    const pharmacy = await this.getPharmacyById(inv.pharmacyId);
                    if (pharmacy) {
                        // Calculate real distance
                        const distance = calculateDistance(
                            userLocation,
                            { latitude: pharmacy.location.lat, longitude: pharmacy.location.lng }
                        );

                        finalResults.push({
                            pharmacy: {
                                ...pharmacy,
                                distance
                            },
                            product: {
                                ...prod,
                                price: inv.price,
                                stock: inv.stock,
                                inStock: inv.inStock
                            }
                        });
                    }
                }
            }

            // Sort by distance (closest first)
            return finalResults.sort((a, b) =>
                (a.pharmacy.distance || 999) - (b.pharmacy.distance || 999)
            );

        } catch (error) {
            console.warn("Search failed/disabled, using fallback mock data", error);
            const pharmacies = await this.getPharmacies();

            // Calculate distances for base pharmacies
            const pharmsWithDist = pharmacies.map(p => ({
                ...p,
                distance: calculateDistance(userLocation, { latitude: p.location.lat, longitude: p.location.lng })
            })).sort((a, b) => a.distance - b.distance);

            if (!term) return pharmsWithDist.map(p => ({ pharmacy: p }));

            // Mock product search
            if (term.toLowerCase().includes("para") || term.toLowerCase().includes("doliprane")) {
                const results = pharmsWithDist.map(p => ({
                    pharmacy: p,
                    product: {
                        id: "prod-para",
                        name: "Paracétamol 500mg",
                        description: "Boite de 16 comprimés",
                        price: 500 + Math.floor(Math.random() * 100), // varies by pharmacy
                        category: "medicament",
                        requiresPrescription: false,
                        inStock: Math.random() > 0.3
                    } as Product
                }));
                return results.filter(r => r.product && r.product.inStock === true);
            }

            // Default: just return pharmacies
            return pharmsWithDist.map(p => ({ pharmacy: p }));
        }
    },

    async getPharmacyInventory(pharmacyId: string): Promise<Product[]> {
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
                    inventoryId: invDoc.id, // Add inventory ID for easy updates
                    price: inv.price,
                    stock: inv.stock,
                    inStock: inv.inStock
                });
            }
        }
        return products;
    },

    async updateInventoryItem(inventoryId: string, data: Partial<PharmacyInventory>) {
        const invRef = doc(db, "pharmacy_inventory", inventoryId);
        await updateDoc(invRef, {
            ...data,
            lastUpdated: serverTimestamp()
        });
    },

    async deleteInventoryItem(inventoryId: string) {
        const { deleteDoc } = await import("firebase/firestore");
        await deleteDoc(doc(db, "pharmacy_inventory", inventoryId));
    },

    async updateProduct(productId: string, data: Partial<Product>) {
        const prodRef = doc(db, "products", productId);
        await updateDoc(prodRef, {
            ...data,
            updatedAt: serverTimestamp()
        });
    },

    async addInventoryItem(pharmacyId: string, productData: Partial<Product>) {
        // 1. Create product in products collection if it doesn't exist
        // For simplicity, we create a new product doc every time for now or search/link
        const productRef = doc(collection(db, "products"));
        const productId = productRef.id;

        await setDoc(productRef, {
            id: productId,
            name: productData.name,
            description: productData.description || "",
            category: productData.category || "medicament",
            requiresPrescription: productData.requiresPrescription || false,
            createdAt: serverTimestamp()
        });

        // 2. Create inventory link
        const invRef = doc(collection(db, "pharmacy_inventory"));
        await setDoc(invRef, {
            id: invRef.id,
            pharmacyId,
            productId,
            price: productData.price || 0,
            stock: productData.stock || 0,
            inStock: (productData.stock || 0) > 0,
            lastUpdated: serverTimestamp()
        });

        return invRef.id;
    },

    // 🛒 ORDERS
    async getPharmacyOrders(pharmacyId: string): Promise<Order[]> {
        if (!USE_REAL_BACKEND) {
            const localOrders = JSON.parse(localStorage.getItem(`mock_orders_${pharmacyId}`) || "[]");
            // Reverse to show latest first
            return localOrders.sort((a: any, b: any) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
        }

        const q = query(
            collection(db, "orders"),
            where("pharmacyId", "==", pharmacyId),
            orderBy("createdAt", "desc")
        );
        const snap = await getDocs(q);
        return snap.docs.map((d: any) => ({ id: d.id, ...d.data() } as Order));
    },

    async getOrderById(orderId: string): Promise<Order | null> {
        if (!USE_REAL_BACKEND) {
            // Check all mock buckets
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key?.startsWith("mock_orders_")) {
                    const orders = JSON.parse(localStorage.getItem(key) || "[]");
                    const order = orders.find((o: any) => o.id === orderId);
                    if (order) return order;
                }
            }
            return null;
        }

        const d = await getDoc(doc(db, "orders", orderId));
        return d.exists() ? ({ id: d.id, ...d.data() } as Order) : null;
    },

    async updateOrderStatus(orderId: string, status: string) {
        if (!USE_REAL_BACKEND) {
            // Find which pharmacy this order belongs to and update it in localStorage
            // Simplified for mock: update in all mock order buckets
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key?.startsWith("mock_orders_")) {
                    const orders = JSON.parse(localStorage.getItem(key) || "[]");
                    const index = orders.findIndex((o: any) => o.id === orderId);
                    if (index !== -1) {
                        orders[index].status = status;
                        orders[index].updatedAt = { seconds: Date.now() / 1000 };
                        localStorage.setItem(key, JSON.stringify(orders));
                    }
                }
            }
            return;
        }

        const orderRef = doc(db, "orders", orderId);
        await updateDoc(orderRef, {
            status,
            updatedAt: serverTimestamp()
        });
    },

    async createOrder(orderData: Partial<Order>): Promise<string> {
        const user = auth.currentUser;
        const newOrderId = `ord-${Math.random().toString(36).substring(7)}`;
        const finalOrder: any = {
            ...orderData,
            id: newOrderId,
            userId: user?.uid || "Client Anonyme 🇧🇫",
            orderNumber: `ORD-${Math.random().toString(36).substring(7).toUpperCase()}`,
            status: "pending",
            paymentStatus: "paid",
            createdAt: { seconds: Date.now() / 1000 },
            updatedAt: { seconds: Date.now() / 1000 }
        };

        try {
            if (!USE_REAL_BACKEND) throw new Error("Mock Mode");
            const docRef = await addDoc(collection(db, "orders"), {
                ...finalOrder,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp()
            });
            return docRef.id;
        } catch (e) {
            console.warn("Order creation failed/disabled, using local fallback");
            // Save to localStorage bucket for this pharmacy
            const pharmacyId = orderData.pharmacyId || "pharm-patte-oie";
            const existing = JSON.parse(localStorage.getItem(`mock_orders_${pharmacyId}`) || "[]");
            localStorage.setItem(`mock_orders_${pharmacyId}`, JSON.stringify([...existing, finalOrder]));
            return newOrderId;
        }
    },

    async getUserOrders(): Promise<Order[]> {
        const user = auth.currentUser;
        if (!user) return [];

        const q = query(
            collection(db, "orders"),
            where("userId", "==", user.uid),
            orderBy("createdAt", "desc")
        );
        const snap = await getDocs(q);
        return snap.docs.map((d: any) => ({ id: d.id, ...d.data() } as Order));
    },

    // 👤 USER PROFILE
    async getUserProfile(uid: string) {
        if (!USE_REAL_BACKEND) return null;
        try {
            const userRef = doc(db, "users", uid);
            const snap = await getDoc(userRef);
            if (snap.exists()) {
                return snap.data();
            }
            return null;
        } catch (error) {
            console.error("Error fetching user profile:", error);
            return null;
        }
    },

    async saveUserProfile(uid: string, data: any) {
        if (!USE_REAL_BACKEND) {
            console.log("Saving locally as real backend is disabled", data);
            return;
        }
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

    async getTodaySales(pharmacyId: string): Promise<number> {
        try {
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            if (!USE_REAL_BACKEND) {
                const localOrders = JSON.parse(localStorage.getItem(`mock_orders_${pharmacyId}`) || "[]");
                return localOrders
                    .filter((o: any) => o.status === 'completed' && (o.createdAt?.seconds * 1000) >= today.getTime())
                    .reduce((sum: number, o: any) => sum + (o.total || 0), 0);
            }

            const q = query(
                collection(db, "orders"),
                where("pharmacyId", "==", pharmacyId),
                where("status", "==", "completed"),
                where("createdAt", ">=", Timestamp.fromDate(today))
            );
            const snap = await getDocs(q);
            return snap.docs.reduce((sum: number, d: any) => sum + (d.data().total || 0), 0);
        } catch (e) {
            console.error("Error calculating today's sales:", e);
            return 0;
        }
    },

    async cancelOrder(orderId: string) {
        await this.updateOrderStatus(orderId, 'cancelled');
    },

    async syncUserProfile(userData: any) {
        const user = auth.currentUser;
        if (!user) return;
        await this.saveUserProfile(user.uid, userData);
    }
}
