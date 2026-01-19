"use client";

import React, { useState } from "react";
import { firebaseService } from "@/services/firebaseService";
import { Upload, CheckCircle, AlertCircle, FileJson, Loader2 } from "lucide-react";

export default function ImportDataPage() {
    const [isLoading, setIsLoading] = useState(false);
    const [status, setStatus] = useState<string>("");
    const [stats, setStats] = useState<{ success: number; failed: number } | null>(null);

    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setIsLoading(true);
        setStatus("Lecture du fichier...");
        setStats(null);

        const reader = new FileReader();
        reader.onload = async (e) => {
            try {
                const json = JSON.parse(e.target?.result as string);

                if (!Array.isArray(json)) {
                    throw new Error("Le fichier ne contient pas une liste de pharmacies valide.");
                }

                setStatus(`Importation de ${json.length} pharmacies en cours... (Cela peut prendre quelques minutes)`);

                // Use the service to import
                const result = await firebaseService.importPharmacies(json);

                setStats(result);
                setStatus("Importation terminée !");
            } catch (error) {
                console.error(error);
                setStatus("Erreur lors de l'import: " + (error as any).message);
            } finally {
                setIsLoading(false);
            }
        };
        reader.readAsText(file);
    };

    return (
        <main className="min-h-screen bg-background p-8 flex flex-col items-center justify-center">
            <div className="max-w-md w-full space-y-8">
                <div className="text-center">
                    <h1 className="text-3xl font-black text-primary mb-2">Mise à jour des Données 🏥</h1>
                    <p className="text-muted-foreground">
                        Utilisez ce panneau pour mettre à jour la base de données avec les dernières informations de l'ONPBF.
                    </p>
                </div>

                <div className="bg-card border border-border rounded-3xl p-8 shadow-xl">
                    <div className="space-y-6">
                        <div className="flex flex-col items-center justify-center gap-4 p-8 border-2 border-dashed border-border rounded-2xl bg-secondary/20 hover:bg-secondary/40 transition-colors relative cursor-pointer group">
                            <input
                                type="file"
                                accept=".json"
                                onChange={handleFileUpload}
                                disabled={isLoading}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                            />

                            {isLoading ? (
                                <Loader2 className="w-12 h-12 text-primary animate-spin" />
                            ) : (
                                <Upload className="w-12 h-12 text-muted-foreground group-hover:text-primary transition-colors" />
                            )}

                            <div className="text-center">
                                <span className="font-bold text-foreground block">
                                    {isLoading ? "Traitement en cours..." : "Cliquez pour upload le JSON"}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                    Fichier: pharmacies_onpbf.json
                                </span>
                            </div>
                        </div>

                        {status && (
                            <div className={`p-4 rounded-xl flex items-start gap-3 ${stats ? 'bg-green-500/10 text-green-600' : 'bg-secondary text-foreground'}`}>
                                {stats ? <CheckCircle className="shrink-0" /> : <AlertCircle className="shrink-0" />}
                                <div className="text-sm font-medium">
                                    {status}
                                </div>
                            </div>
                        )}

                        {stats && (
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 bg-green-500/10 rounded-2xl border border-green-500/20 text-center">
                                    <div className="text-2xl font-black text-green-600">{stats.success}</div>
                                    <div className="text-xs font-bold uppercase text-green-600/70">Succès</div>
                                </div>
                                <div className="p-4 bg-red-500/10 rounded-2xl border border-red-500/20 text-center">
                                    <div className="text-2xl font-black text-red-600">{stats.failed}</div>
                                    <div className="text-xs font-bold uppercase text-red-600/70">Échecs</div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="text-center text-xs text-muted-foreground p-4 bg-secondary/30 rounded-xl">
                    <p>
                        <strong>Note:</strong> Le fichier JSON doit être généré par le script de scraping.
                        L'importation écrase les données existantes si les noms correspondent.
                    </p>
                </div>
            </div>
        </main>
    );
}
