import { NextResponse } from 'next/server';
// import { adminDb } from '@/lib/firebaseAdmin'; // Pas encore utilisé mais prêt

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { orderId, phoneNumber } = body;

        console.log(`[API] Envoi SMS pour la commande ${orderId} au ${phoneNumber}`);

        // Ici, vous pourriez intégrer Twilio ou un autre service SMS
        // Pour l'instant on garde le comportement Mock du backend original

        return NextResponse.json({
            success: true,
            message: "Notification envoyée (Mock via Next.js API)",
            orderId
        });
    } catch (error) {
        console.error('API Error:', error);
        return NextResponse.json(
            { success: false, error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}

export async function GET() {
    return NextResponse.json({ message: "PharmaCI API is running... 🚀" });
}
