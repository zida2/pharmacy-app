"use client";

import { useState } from 'react';
import { Activity, RefreshCw, CheckCircle, AlertCircle } from 'lucide-react';

export default function GuardPharmaciesManager() {
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);

    const updateGuardPharmacies = async () => {
        setLoading(true);
        setError(null);
        setResult(null);

        try {
            // L'URL de votre Cloud Function - SCRAPE LES VRAIES DONNÉES DEPUIS ANAC
            // TODO: Remplacer par l'URL réelle de votre projet Firebase
            const functionUrl = 'https://europe-west1-YOUR_PROJECT_ID.cloudfunctions.net/manualUpdateRealGuardPharmacies';

            const response = await fetch(functionUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            if (!response.ok) {
                throw new Error(`Erreur HTTP: ${response.status}`);
            }

            const data = await response.json();
            setResult(data);

        } catch (err: any) {
            console.error('Erreur:', err);
            setError(err.message || 'Une erreur est survenue');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 dark:from-gray-900 dark:to-gray-800 p-8">
            <div className="max-w-4xl mx-auto">
                <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-8">
                    {/* Header */}
                    <div className="flex items-center gap-4 mb-8">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
                            <Activity className="text-white" size={28} />
                        </div>
                        <div>
                            <h1 className="text-3xl font-black text-gray-900 dark:text-white">
                                Gestion des Pharmacies de Garde
                            </h1>
                            <p className="text-gray-500 dark:text-gray-400 text-sm">
                                Mise à jour manuelle des pharmacies de garde
                            </p>
                        </div>
                    </div>

                    {/* Info Box */}
                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-2xl p-4 mb-6">
                        <p className="text-sm text-blue-800 dark:text-blue-200">
                            <strong>ℹ️ Information:</strong> Ce bouton scrape les <strong>VRAIES pharmacies de garde</strong> depuis
                            le site officiel <strong>ANAC Burkina Faso</strong> (anacburkina.org). Les données sont synchronisées
                            automatiquement chaque jour à 6h du matin.
                        </p>
                    </div>

                    {/* Update Button */}
                    <button
                        onClick={updateGuardPharmacies}
                        disabled={loading}
                        className="w-full py-4 px-6 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold rounded-2xl shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                    >
                        <RefreshCw className={loading ? 'animate-spin' : ''} size={20} />
                        {loading ? 'Mise à jour en cours...' : 'Mettre à jour les pharmacies de garde'}
                    </button>

                    {/* Success Result */}
                    {result && result.success && (
                        <div className="mt-6 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-2xl p-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="flex items-start gap-3 mb-4">
                                <CheckCircle className="text-green-600 dark:text-green-400 shrink-0" size={24} />
                                <div>
                                    <h3 className="font-bold text-green-900 dark:text-green-100 text-lg">
                                        Mise à jour réussie !
                                    </h3>
                                    <p className="text-green-700 dark:text-green-300 text-sm">
                                        {result.message}
                                    </p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 mt-4">
                                <div className="bg-white dark:bg-gray-700 p-4 rounded-xl">
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Total Pharmacies</p>
                                    <p className="text-2xl font-black text-gray-900 dark:text-white">{result.total}</p>
                                </div>
                                <div className="bg-white dark:bg-gray-700 p-4 rounded-xl">
                                    <p className="text-sm text-gray-500 dark:text-gray-400">De Garde Aujourd'hui</p>
                                    <p className="text-2xl font-black text-green-600 dark:text-green-400">{result.guardCount}</p>
                                </div>
                            </div>

                            {/* Liste des pharmacies de garde */}
                            {result.guardPharmacies && result.guardPharmacies.length > 0 && (
                                <div className="mt-6">
                                    <h4 className="font-bold text-green-900 dark:text-green-100 mb-3 text-sm uppercase tracking-wider">
                                        🌙 Pharmacies de garde aujourd'hui:
                                    </h4>
                                    <div className="space-y-2">
                                        {result.guardPharmacies.map((pharmacy: any, index: number) => (
                                            <div
                                                key={pharmacy.id}
                                                className="bg-white dark:bg-gray-700 p-3 rounded-xl flex items-center gap-3 border border-green-100 dark:border-green-800"
                                            >
                                                <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 flex items-center justify-center font-bold text-sm">
                                                    {index + 1}
                                                </div>
                                                <div className="flex-1">
                                                    <p className="font-semibold text-gray-900 dark:text-white text-sm">
                                                        {pharmacy.name}
                                                    </p>
                                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                                        ID: {pharmacy.id}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Error Result */}
                    {error && (
                        <div className="mt-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl p-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="flex items-start gap-3">
                                <AlertCircle className="text-red-600 dark:text-red-400 shrink-0" size={24} />
                                <div>
                                    <h3 className="font-bold text-red-900 dark:text-red-100 text-lg">
                                        Erreur lors de la mise à jour
                                    </h3>
                                    <p className="text-red-700 dark:text-red-300 text-sm">
                                        {error}
                                    </p>
                                    <p className="text-red-600 dark:text-red-400 text-xs mt-2">
                                        Vérifiez que la Cloud Function est déployée et accessible.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Instructions */}
                    <div className="mt-8 p-6 bg-gray-50 dark:bg-gray-700/50 rounded-2xl">
                        <h3 className="font-bold text-gray-900 dark:text-white mb-3">
                            📝 Instructions de déploiement
                        </h3>
                        <ol className="text-sm text-gray-700 dark:text-gray-300 space-y-2 list-decimal list-inside">
                            <li>Déployez les Cloud Functions: <code className="bg-gray-200 dark:bg-gray-700 px-2 py-0.5 rounded text-xs">firebase deploy --only functions</code></li>
                            <li>Récupérez l'URL de la fonction <code className="bg-gray-200 dark:bg-gray-700 px-2 py-0.5 rounded text-xs">manualUpdateRealGuardPharmacies</code></li>
                            <li>Mettez à jour l'URL dans ce fichier (ligne 19)</li>
                            <li>Le scraping automatique s'exécutera quotidiennement à 6h du matin</li>
                            <li>Source: Site officiel ANAC (anacburkina.org)</li>
                        </ol>
                    </div>
                </div>
            </div>
        </div>
    );
}
