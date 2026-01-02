import { db } from "./firebase";
import { collection, writeBatch, doc, serverTimestamp } from "firebase/firestore";
import { MOCK_PHARMACIES } from "./mockApi";

const MOCK_PRODUCTS_SEED = [
    { title: "Doliprane 1000mg", price: 1500, description: "Paracétamol, douleurs et fièvre", category: "medicament" },
    { title: "Amoxicilline 500mg", price: 2500, description: "Antibiotique large spectre", category: "medicament" },
    { title: "Efferalgan 1g", price: 1800, description: "Comprimés effervescents", category: "medicament" },
    { title: "Maalox", price: 3200, description: "Brûlures d'estomac", category: "medicament" },
    { title: "Spasfon", price: 2100, description: "Douleurs abdominales", category: "medicament" },
    { title: "Bétadine", price: 1200, description: "Antiseptique local", category: "parapharmacie" },
    { title: "Vitamine C Upsa", price: 1500, description: "Fatigue passagère", category: "parapharmacie" },
];

export async function seedDatabase() {
    console.log("Starting DB Seed...");
    const batch = writeBatch(db);

    // 1. Seed Pharmacies
    console.log("Seeding Pharmacies...");
    const pharmacyIds: string[] = [];
    MOCK_PHARMACIES.forEach((pharmacy) => {
        // Use static ID from mock data to keep references stable
        const pharmacyRef = doc(db, "pharmacies", pharmacy.id);
        const pharmacyId = pharmacy.id;
        pharmacyIds.push(pharmacyId);

        // Map mock data format to Firestore format
        batch.set(pharmacyRef, {
            ...pharmacy,
            id: pharmacyId,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
            // Ensure numbers are numbers
            deliveryFee: Number(pharmacy.deliveryFee || 0),
            rating: Number(pharmacy.rating || 0),
            reviewCount: Number(pharmacy.reviewCount || 0)
        });
    });

    // 2. Seed Products (Global catalog)
    console.log("Seeding Products...");
    const productIds: string[] = [];
    MOCK_PRODUCTS_SEED.forEach((prod) => {
        const prodRef = doc(collection(db, "products"));
        productIds.push(prodRef.id);

        batch.set(prodRef, {
            id: prodRef.id,
            name: prod.title,
            description: prod.description,
            category: prod.category || "medicament",
            requiresPrescription: false,
            createdAt: new Date(),
            images: []
        });
    });

    // 3. Seed Inventory (Link Pharmacies <-> Products)
    console.log("Seeding Inventory...");
    pharmacyIds.forEach((pharmacyId) => {
        // Give each pharmacy some random products from the catalog
        const numProducts = Math.floor(Math.random() * 4) + 3; // 3 to 6 products
        const shuffledProducts = [...productIds].sort(() => 0.5 - Math.random());
        const selectedProducts = shuffledProducts.slice(0, numProducts);

        selectedProducts.forEach((productId) => {
            const productSeed = MOCK_PRODUCTS_SEED[productIds.indexOf(productId)];
            const inventoryRef = doc(collection(db, "pharmacy_inventory"));

            batch.set(inventoryRef, {
                id: inventoryRef.id,
                pharmacyId: pharmacyId,
                productId: productId,
                price: productSeed.price + (Math.floor(Math.random() * 500) - 250), // Randomize price slightly
                stock: Math.floor(Math.random() * 50),
                inStock: Math.random() > 0.2, // 80% chance in stock
                lastUpdated: new Date()
            });
        });
    });

    console.log("Committing Batch...");
    await batch.commit();
    console.log("Database Seeded Successfully! 🚀");
}
