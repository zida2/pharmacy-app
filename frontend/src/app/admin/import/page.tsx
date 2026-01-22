"use client";

import React, { useState } from "react";
import { firebaseService } from "@/services/firebaseService";
import { Upload, CheckCircle, AlertCircle, FileJson, Loader2, Database, Download } from "lucide-react";

// Import local data
import defaultPharmacies from "@/data/pharmacies_import.json";

export default function ImportDataPage() {
    const [isLoading, setIsLoading] = useState(false);
    const [status, setStatus] = useState<string>("");
    const [stats, setStats] = useState<{ success: number; failed: number } | null>(null);

    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;
        processImport(file);
    };

    const processImport = (file: File) => {
        setIsLoading(true);
        setStatus("Lecture du fichier...");
        setStats(null);

        const reader = new FileReader();
        reader.onload = async (e) => {
            try {
                const json = JSON.parse(e.target?.result as string);
                await runImport(json);
            } catch (error) {
                console.error(error);
                setStatus("Erreur lors de l'import: " + (error as any).message);
                setIsLoading(false);
            }
        };
        reader.readAsText(file);
    };

    const handleLocalImport = async () => {
        if (!confirm(`Voulez-vous importer les ${defaultPharmacies.length} pharmacies préparées ?`)) return;
        setIsLoading(true);
        setStats(null);
        await runImport(defaultPharmacies);
        setIsLoading(false);
    };

    const runImport = async (data: any[]) => {
        if (!Array.isArray(data)) {
            throw new Error("Le format des données n'est pas valide (tableau attendu).");
        }

        setStatus(`Importation de ${data.length} pharmacies en cours... (Cela peut prendre quelques minutes)`);

        try {
            const result = await firebaseService.importPharmacies(data);
            setStats(result);
            setStatus("Importation terminée avec succès !");
        } catch (error) {
            console.error(error);
            setStatus("Erreur lors de l'import Firebase: " + (error as any).message);
        }
    };

    return (
        <main className="min-h-screen bg-background p-8 flex flex-col items-center justify-center">
            <div className="max-w-2xl w-full space-y-8">
                <div className="text-center">
                    <h1 className="text-3xl font-black text-primary mb-2">Mise à jour des Données 🏥</h1>
                    <p className="text-muted-foreground">
                        Utilisez ce panneau pour mettre à jour la base de données avec les dernières informations de l'ONPBF.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Option 1: Upload File */}
                    <div className="bg-card border border-border rounded-3xl p-6 shadow-xl flex flex-col items-center text-center gap-4 relative group">
                        <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center group-hover:scale-110 transition-transform">
                            {isLoading ? <Loader2 className="animate-spin text-primary" /> : <Upload className="text-foreground" />}
                        </div>
                        <div>
                            <h3 className="font-bold text-lg">Uploader un JSON</h3>
                            <p className="text-xs text-muted-foreground mt-1">Glissez votre fichier ici</p>
                        </div>
                        <input
                            type="file"
                            accept=".json"
                            onChange={handleFileUpload}
                            disabled={isLoading}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                        />
                    </div>

                    {/* Option 2: Use Local Data */}
                    <button
                        onClick={handleLocalImport}
                        disabled={isLoading}
                        className="bg-primary/5 border border-primary/20 rounded-3xl p-6 shadow-xl flex flex-col items-center text-center gap-4 hover:bg-primary/10 transition-colors active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center">
                            {isLoading ? <Loader2 className="animate-spin text-primary" /> : <Database className="text-primary" />}
                        </div>
                        <div>
                            <h3 className="font-bold text-lg text-primary">Import Automatique</h3>
                            <p className="text-xs text-primary/70 mt-1">
                                Utiliser les {defaultPharmacies.length} pharmacies récupérées
                            </p>
                        </div>
                    </button>
                </div>

                {status && (
                    <div className={`p-6 rounded-2xl flex flex-col items-center text-center gap-3 animate-in fade-in slide-in-from-bottom-4 ${stats ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-secondary text-foreground'}`}>
                        {stats ? <CheckCircle size={32} className="shrink-0 text-emerald-600" /> : <Loader2 className="animate-spin shrink-0" />}
                        <div className="font-medium text-lg">
                            {status}
                        </div>
                        {stats && (
                            <div className="flex gap-8 mt-2">
                                <div className="text-center">
                                    <div className="text-3xl font-black text-emerald-600">{stats.success}</div>
                                    <div className="text-[10px] font-bold uppercase tracking-widest text-emerald-600/60">Succès</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-3xl font-black text-red-500">{stats.failed}</div>
                                    <div className="text-[10px] font-bold uppercase tracking-widest text-red-500/60">Échecs</div>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                <div className="text-center text-xs text-muted-foreground p-4 bg-secondary/30 rounded-xl">
                    <p>
                        <strong>Note:</strong> L'importation vérifie les doublons et met à jour les statuts de garde si spécifiés.
                    </p>
                </div>
            </div>
        </main>
    );
}
