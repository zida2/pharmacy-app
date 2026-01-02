import { Pharmacy, Product } from "./types";
import { firebaseService } from "./firebaseService";
import { PHARMACIES_BURKINA_FASO } from "./pharmaciesData";

/**
 * ⚡ DATA ADAPTER
 * Toggle this to switch between Mock and Real Firebase Backend
 */
const USE_REAL_BACKEND = false; // Forcé à false pour utiliser les vraies données locales

// Base de données complète des pharmacies du Burkina Faso
export const MOCK_PHARMACIES: Pharmacy[] = PHARMACIES_BURKINA_FASO;

export const searchMedicines = async (query: string): Promise<{ pharmacy: Pharmacy; product?: Product }[]> => {
    // If flag is enabled, fetch from REAL Firebase Backend
    if (USE_REAL_BACKEND) {
        console.log("Fetching from REAL BACKEND (Firebase)...");
        try {
            return await firebaseService.searchMedicines(query);
        } catch (error) {
            console.error("Firebase Search Error, falling back to mock:", error);
            // Fallback to mock logic below...
        }
    }

    // --- MOCK LOGIC avec tri par distance ---
    // Simulate API Delay
    await new Promise(resolve => setTimeout(resolve, 300));

    // Obtenir la position de l'utilisateur
    let userLat = 12.3714; // Centre de Ouagadougou par défaut
    let userLng = -1.5197;

    try {
        if (typeof navigator !== 'undefined' && navigator.geolocation) {
            const position = await new Promise<GeolocationPosition>((resolve, reject) => {
                navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 3000 });
            });
            userLat = position.coords.latitude;
            userLng = position.coords.longitude;
        }
    } catch (error) {
        console.log("Géolocalisation non disponible, utilisation de la position par défaut");
    }

    // Calculer la distance pour chaque pharmacie
    const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
        const R = 6371; // Rayon de la Terre en km
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    };

    // Ajouter la distance à chaque pharmacie et trier
    const pharmaciesWithDistance = MOCK_PHARMACIES.map(p => ({
        ...p,
        distance: calculateDistance(userLat, userLng, p.location.lat, p.location.lng)
    })).sort((a, b) => a.distance - b.distance);

    if (!query) {
        // Retourner les 20 pharmacies les plus proches
        return pharmaciesWithDistance.slice(0, 20).map(p => ({ pharmacy: p }));
    }

    const q = query.toLowerCase();

    // Recherche dans les noms de pharmacies ou adresses
    const matchingPharmacies = pharmaciesWithDistance.filter(p =>
        p.name.toLowerCase().includes(q) ||
        (p.location.address || "").toLowerCase().includes(q) ||
        (p.location.city || "").toLowerCase().includes(q)
    );

    return matchingPharmacies.slice(0, 15).map(p => ({
        pharmacy: p,
        product: {
            id: `prod-${p.id}`,
            name: query,
            price: 500 + Math.floor(Math.random() * 5000),
            requiresPrescription: Math.random() > 0.7
        }
    }));
};

export const getPharmacyDetails = async (id: string): Promise<Pharmacy | null> => {
    if (USE_REAL_BACKEND) {
        return await firebaseService.getPharmacyById(id);
    }
    return MOCK_PHARMACIES.find(p => p.id === id) || null;
};

export const getPharmacyProducts = async (id: string): Promise<Product[]> => {
    if (USE_REAL_BACKEND) {
        return await firebaseService.getPharmacyInventory(id);
    }
    // Mock products
    return [
        { id: "p1", name: "Doliprane 1000mg", price: 1500, inStock: true },
        { id: "p2", name: "Amoxicilline 500mg", price: 2200, inStock: true },
        { id: "p3", name: "Spasfon Lyoc", price: 3400, inStock: true }
    ];
};
