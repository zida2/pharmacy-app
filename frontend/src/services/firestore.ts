import { db } from "./firebase";
import {
    collection,
    doc,
    getDoc,
    getDocs,
    addDoc,
    updateDoc,
    query,
    where,
    orderBy,
    limit,
    Timestamp
} from "firebase/firestore";
import { Pharmacy, Product } from "./types";

// Collections
const COLLECTIONS = {
    users: "users",
    pharmacies: "pharmacies",
    products: "products",
    pharmacy_inventory: "pharmacy_inventory",
    orders: "orders",
    reviews: "reviews",
    delivery_persons: "delivery_persons"
};

// 🏥 Pharmacies
export async function getAllPharmacies(): Promise<Pharmacy[]> {
    const snapshot = await getDocs(collection(db, COLLECTIONS.pharmacies));
    return snapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() } as Pharmacy));
}

export async function getPharmacyById(id: string): Promise<Pharmacy | null> {
    const docRef = doc(db, COLLECTIONS.pharmacies, id);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } as Pharmacy : null;
}

// 💊 Products & Inventory
export async function searchProductsByName(searchQuery: string) {
    // Note: Firestore doesn't support full-text search natively
    // For production, use Algolia or similar
    const productsRef = collection(db, COLLECTIONS.products);
    const snapshot = await getDocs(productsRef);

    const products = snapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() }));
    return products.filter((p: any) =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
}

export async function getPharmacyInventory(pharmacyId: string, productId?: string) {
    const inventoryRef = collection(db, COLLECTIONS.pharmacy_inventory);
    let q = query(inventoryRef, where("pharmacyId", "==", pharmacyId));

    if (productId) {
        q = query(q, where("productId", "==", productId));
    }

    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() }));
}

// 🛒 Orders
export async function createOrder(orderData: any) {
    const orderNumber = `ORD-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}${String(new Date().getDate()).padStart(2, '0')}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;

    const order = {
        ...orderData,
        orderNumber,
        paymentStatus: "pending",
        status: "pending",
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
    };

    const docRef = await addDoc(collection(db, COLLECTIONS.orders), order);
    return { id: docRef.id, ...order };
}

export async function getUserOrders(userId: string) {
    const ordersRef = collection(db, COLLECTIONS.orders);
    const q = query(
        ordersRef,
        where("userId", "==", userId),
        orderBy("createdAt", "desc")
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() }));
}

export async function getPharmacyOrders(pharmacyId: string) {
    const ordersRef = collection(db, COLLECTIONS.orders);
    const q = query(
        ordersRef,
        where("pharmacyId", "==", pharmacyId),
        orderBy("createdAt", "desc")
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() }));
}

export async function updateOrderStatus(orderId: string, status: string) {
    const orderRef = doc(db, COLLECTIONS.orders, orderId);
    await updateDoc(orderRef, {
        status,
        updatedAt: Timestamp.now()
    });
}

// ⭐ Reviews
export async function getPharmacyReviews(pharmacyId: string) {
    const reviewsRef = collection(db, COLLECTIONS.reviews);
    const q = query(
        reviewsRef,
        where("pharmacyId", "==", pharmacyId),
        orderBy("createdAt", "desc"),
        limit(50)
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() }));
}

export async function addReview(reviewData: any) {
    const review = {
        ...reviewData,
        createdAt: Timestamp.now()
    };

    const docRef = await addDoc(collection(db, COLLECTIONS.reviews), review);
    return { id: docRef.id, ...review };
}
