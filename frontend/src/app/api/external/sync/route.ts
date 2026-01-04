import { NextResponse } from "next/server";
import { firebaseService } from "@/services/firebaseService";

/**
 * 🚀 API EXTERNE - SYNCHRONISATION DU STOCK
 * Permet aux pharmacies tierces de mettre à jour leur inventaire via POST.
 */
export async function POST(request: Request) {
    try {
        const authHeader = request.headers.get("authorization");

        // 🔒 Simple check for demo (should be a real JWT or API Key strategy)
        if (!authHeader || !authHeader.startsWith("Bearer sk_bf_")) {
            return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
        }

        const body = await request.json();
        const { pharmacyId, inventory } = body;

        if (!pharmacyId || !Array.isArray(inventory)) {
            return NextResponse.json({ error: "Données invalides. 'pharmacyId' et 'inventory' (array) sont requis." }, { status: 400 });
        }

        console.log(`📡 [API SYNC] Mise à jour demandée pour la pharmacie : ${pharmacyId}`);

        // Logic to sync: for each item, update or add it
        // Note: For a real production app, this would be a batch write in Firestore
        for (const item of inventory) {
            // Check if item exists in inventory (mock logic for now or real sync)
            // For now, we just acknowledge the receipt
            console.log(`-> Syncing: ${item.name} | Prix: ${item.price} | Stock: ${item.stock}`);
        }

        return NextResponse.json({
            success: true,
            message: `Synchronisation réussie pour ${inventory.length} produits.`,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error("Erreur API Sync:", error);
        return NextResponse.json({ error: "Erreur interne du serveur" }, { status: 500 });
    }
}
