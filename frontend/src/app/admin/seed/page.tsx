"use client";

import React, { useState } from "react";
import { firebaseService } from "@/services/firebaseService";
import { Upload, Database, CheckCircle, AlertCircle, Loader2, Trash2 } from "lucide-react";

export default function SeedPage() {
    const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
    const [stats, setStats] = useState<{ success: number; failed: number } | null>(null);
    const [message, setMessage] = useState("");

    const handleImport = async () => {
        setStatus("loading");
        setMessage("Chargement du fichier JSON...");

        try {
            // Fetch le fichier JSON qui est dans /public
            const response = await fetch("/pharmacies_seed.json");
            if (!response.ok) {
                throw new Error("Impossible de trouver le fichier pharmacies_seed.json dans public/");
            }

            const data = await response.json();
            setMessage(`Fichier chargé. Importation de ${data.length} pharmacies vers Firestore en cours...`);

            // Lancer l'import
            const result = await firebaseService.importPharmacies(data);

            setStats(result);
            setStatus("success");
            setMessage(`Import terminé !`);
        } catch (error: any) {
            console.error(error);
            setStatus("error");
            setMessage(error.message || "Une erreur est survenue");
        }
    };

    const handleClear = async () => {
        if (!confirm("⚠️ ATTENTION : Cela va SUPPRIMER toutes les pharmacies de la base de données. Êtes-vous sûr ?")) return;

        setStatus("loading");
        setMessage("Suppression des pharmacies en cours...");

        try {
            const count = await firebaseService.clearPharmacies();
            setStatus("success");
            setMessage(`Base de données nettoyée. ${count} pharmacies supprimées.`);
        } catch (error: any) {
            console.error(error);
            setStatus("error");
            setMessage(error.message || "Erreur lors de la suppression");
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
                <div className="flex flex-col items-center text-center mb-8">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                        <Database className="w-8 h-8 text-blue-600" />
                    </div>
                    <h1 className="text-2xl font-bold text-slate-800">Seed Database</h1>
                    <p className="text-slate-500 mt-2">
                        Import des pharmacies depuis le scraper Python vers Firebase Firestore.
                    </p>
                </div>

                <div className="space-y-6">
                    {/* Status Box */}
                    {status === "success" && (
                        <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-start gap-3">
                            <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                            <div>
                                <h3 className="font-bold text-green-800">Succès !</h3>
                                <p className="text-sm text-green-700 mt-1">
                                    {message}
                                </p>
                                {stats && (
                                    <div className="mt-2 text-xs font-mono bg-green-100 px-2 py-1 rounded">
                                        Success: {stats.success} | Failed: {stats.failed}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {status === "error" && (
                        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
                            <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
                            <div>
                                <h3 className="font-bold text-red-800">Erreur</h3>
                                <p className="text-sm text-red-700 mt-1">{message}</p>
                            </div>
                        </div>
                    )}

                    {status === "loading" && (
                        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex flex-col items-center gap-3 text-center">
                            <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                            <div>
                                <h3 className="font-bold text-blue-800">Importation en cours...</h3>
                                <p className="text-xs text-blue-600 mt-1">{message}</p>
                                <p className="text-xs text-slate-400 mt-2">Ne fermez pas cette page.</p>
                            </div>
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className="space-y-3">
                        <button
                            onClick={handleClear}
                            disabled={status === "loading"}
                            className={`w-full py-4 rounded-xl flex items-center justify-center gap-2 font-bold transition-all transform active:scale-95 ${status === "loading"
                                ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                                : "bg-red-50 hover:bg-red-100 text-red-600 border border-red-200"
                                }`}
                        >
                            <Trash2 size={20} />
                            Vider la base de données
                        </button>
                        <button
                            onClick={handleImport}
                            disabled={status === "loading"}
                            className={`w-full py-4 rounded-xl flex items-center justify-center gap-2 font-bold transition-all transform active:scale-95 ${status === "loading"
                                ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                                : "bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-blue-500/25"
                                }`}
                        >
                            {status === "loading" ? (
                                "Traitement..."
                            ) : (
                                <>
                                    <Upload size={20} />
                                    Lancer l'import Firestore
                                </>
                            )}
                        </button>
                    </div>

                    <p className="text-xs text-center text-slate-400">
                        Assurez-vous que le fichier <code>/public/pharmacies_seed.json</code> existe.
                    </p>
                </div>
            </div>
        </div>
    );
}
