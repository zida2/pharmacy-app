"use client";
import { useEffect, useState } from "react";
import { seedDatabase } from "@/services/seed";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

import { auth } from "@/services/firebase";

export default function SetupPage() {
    const [status, setStatus] = useState("En attente...");
    const [logs, setLogs] = useState<string[]>([]);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged((user) => {
            setIsLoggedIn(!!user);
            if (!user) {
                addLog("⚠️ Attention : Vous n'êtes pas connecté. L'écriture risque d'être refusée par Firebase.");
            } else {
                addLog(`Connecté en tant que ${user.email || 'Anonyme'}`);
            }
        });
        return () => unsubscribe();
    }, []);

    const runSeed = async () => {
        setStatus("Injection des données réelles dans Firebase...");
        addLog("Démarrage de l'initialisation...");
        try {
            await seedDatabase();
            addLog("Base de données synchronisée avec succès !");
            setStatus("Terminé !");
            setTimeout(() => router.push("/map"), 3000);
        } catch (e: any) {
            setStatus("Erreur");
            addLog("Erreur critique: " + e.message);
            console.error(e);
        }
    };

    const addLog = (msg: string) => setLogs(prev => [...prev, `${new Date().toLocaleTimeString()} - ${msg}`]);

    return (
        <div className="min-h-screen bg-zinc-950 text-white p-8 flex flex-col items-center justify-center space-y-6">
            <h1 className="text-3xl font-bold text-primary">Configuration des Données</h1>

            <div className="bg-zinc-900 p-6 rounded-2xl border border-zinc-800 w-full max-w-md shadow-2xl">
                <p className="text-zinc-400 mb-6 text-center">
                    Cette étape va charger les vraies pharmacies du Burkina Faso (ONPBF) dans votre base de données en temps réel.
                </p>

                {status === "En attente..." ? (
                    <button
                        onClick={runSeed}
                        className="w-full py-4 bg-primary hover:bg-primary/90 text-white font-bold rounded-xl transition-all shadow-lg shadow-primary/20 animate-pulse"
                    >
                        CHARGER LES DONNÉES RÉELLES
                    </button>
                ) : (
                    <div className="space-y-4">
                        <div className="text-center font-mono text-lg text-emerald-400 font-bold animate-bounce">
                            {status}
                        </div>
                        <div className="h-40 bg-black/50 rounded-lg p-3 font-mono text-xs text-zinc-500 overflow-y-auto border border-white/5">
                            {logs.map((l, i) => <div key={i}>{l}</div>)}
                        </div>
                    </div>
                )}
            </div>

            <Link href="/map" className="flex items-center gap-2 text-zinc-500 hover:text-white transition-colors text-sm">
                <ArrowLeft size={16} /> Retour à la carte
            </Link>
        </div>
    );
}
