"use client";

import React, { useEffect, useState } from 'react';
import { collection, query, where, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db } from '@/services/firebase';
import { Check, X, MapPin, AlertCircle, RefreshCw } from 'lucide-react';
import ValidationMap from '@/components/admin/ValidationMap';
import { toast } from 'sonner';

interface PendingProvider {
    id: string;
    name: string;
    type: string;
    location: {
        lat: number;
        lng: number;
        address: string;
    };
    gps_validated: boolean;
}

export default function GPSValidationPage() {
    const [pendingProviders, setPendingProviders] = useState<PendingProvider[]>([]);
    const [selectedProvider, setSelectedProvider] = useState<PendingProvider | null>(null);
    const [newLocation, setNewLocation] = useState<{ lat: number, lng: number } | null>(null);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);

    const fetchPending = async () => {
        setLoading(true);
        try {
            // Fetch unvalidated pharmacies
            const q = query(collection(db, "pharmacies"), where("gps_validated", "==", false));
            const snapshot = await getDocs(q);

            const items: PendingProvider[] = [];
            snapshot.forEach((doc: any) => {
                const data = doc.data();
                // Ensure legacy data has structure
                if (data.location?.lat) {
                    items.push({
                        id: doc.id,
                        name: data.name || data.nom_pharmacie || "Unknown",
                        type: 'pharmacy',
                        location: {
                            lat: data.location.lat,
                            lng: data.location.lng,
                            address: data.location.address || data.adresse_complete || ""
                        },
                        gps_validated: false
                    });
                }
            });
            setPendingProviders(items);
            if (items.length > 0 && !selectedProvider) {
                setSelectedProvider(items[0]);
                setNewLocation({ lat: items[0].location.lat, lng: items[0].location.lng });
            }
        } catch (error) {
            console.error("Error fetching pending:", error);
            toast.error("Erreur lors du chargement des données.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPending();
    }, []);

    const handleSelect = (provider: PendingProvider) => {
        setSelectedProvider(provider);
        setNewLocation({ lat: provider.location.lat, lng: provider.location.lng });
    };

    const handleLocationUpdate = (lat: number, lng: number) => {
        setNewLocation({ lat, lng });
    };

    const handleValidate = async () => {
        if (!selectedProvider || !newLocation) return;
        setProcessing(true);

        try {
            const docRef = doc(db, "pharmacies", selectedProvider.id);
            await updateDoc(docRef, {
                "location.lat": newLocation.lat,
                "location.lng": newLocation.lng,
                gps_validated: true,
                gps_source: 'admin_validation',
                updatedAt: new Date()
            });

            toast.success(`${selectedProvider.name} validé !`);

            // Remove from list
            const updatedList = pendingProviders.filter(p => p.id !== selectedProvider.id);
            setPendingProviders(updatedList);

            if (updatedList.length > 0) {
                handleSelect(updatedList[0]);
            } else {
                setSelectedProvider(null);
            }

        } catch (error) {
            console.error("Validation error:", error);
            toast.error("Erreur lors de la validation.");
        } finally {
            setProcessing(false);
        }
    };

    return (
        <div className="h-[calc(100vh-120px)] flex flex-col gap-4">
            <header className="flex justify-between items-center bg-card p-4 rounded-xl border border-border shadow-sm">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <MapPin className="text-primary" /> Validation GPS
                    </h1>
                    <p className="text-muted-foreground text-sm">
                        {pendingProviders.length} prestataires en attente de validation
                    </p>
                </div>
                <button
                    onClick={fetchPending}
                    className="p-2 hover:bg-secondary rounded-lg transition-colors"
                >
                    <RefreshCw size={20} className={loading ? "animate-spin" : ""} />
                </button>
            </header>

            <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6 overflow-hidden">
                {/* Scrollable List */}
                <div className="bg-card rounded-xl border border-border flex flex-col overflow-hidden">
                    <div className="p-4 border-b border-border bg-secondary/20 font-semibold">
                        Liste d'attente
                    </div>
                    <div className="flex-1 overflow-y-auto p-2 space-y-2">
                        {pendingProviders.length === 0 && !loading && (
                            <div className="p-8 text-center text-muted-foreground flex flex-col items-center gap-2">
                                <Check size={32} className="text-green-500" />
                                <p>Tout est validé !</p>
                            </div>
                        )}

                        {pendingProviders.map(provider => (
                            <button
                                key={provider.id}
                                onClick={() => handleSelect(provider)}
                                className={`w-full text-left p-3 rounded-lg border transition-all hover:bg-primary/5 ${selectedProvider?.id === provider.id
                                    ? "border-primary bg-primary/10 shadow-sm"
                                    : "border-transparent hover:border-border"
                                    }`}
                            >
                                <div className="font-semibold text-sm truncate">{provider.name}</div>
                                <div className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                                    <MapPin size={10} />
                                    <span className="truncate">{provider.location.address || "Adresse inconnue"}</span>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Editor Area */}
                <div className="lg:col-span-2 flex flex-col gap-4">
                    {selectedProvider && newLocation ? (
                        <>
                            <div className="bg-card p-4 rounded-xl border border-border shadow-sm flex items-center justify-between">
                                <div>
                                    <h2 className="font-bold text-lg">{selectedProvider.name}</h2>
                                    <p className="text-sm text-muted-foreground">{selectedProvider.location.address}</p>
                                    <div className="flex gap-4 mt-2 text-xs font-mono">
                                        <div className="bg-secondary px-2 py-1 rounded">
                                            Original: {selectedProvider.location.lat.toFixed(6)}, {selectedProvider.location.lng.toFixed(6)}
                                        </div>
                                        <div className="bg-primary/20 text-primary-foreground px-2 py-1 rounded">
                                            Nouveau: {newLocation.lat.toFixed(6)}, {newLocation.lng.toFixed(6)}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={handleValidate}
                                        disabled={processing}
                                        className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-xl font-bold flex items-center gap-2 transition-all disabled:opacity-50"
                                    >
                                        <Check size={18} />
                                        {processing ? "..." : "Valider"}
                                    </button>
                                </div>
                            </div>

                            <ValidationMap
                                key={selectedProvider.id} // Reset map on change
                                initialLat={selectedProvider.location.lat}
                                initialLng={selectedProvider.location.lng}
                                onLocationSelect={handleLocationUpdate}
                                className="flex-1 min-h-[400px]"
                            />

                            <div className="bg-amber-50 border border-amber-200 p-3 rounded-lg flex gap-3 items-start text-amber-800 text-sm">
                                <AlertCircle size={18} className="shrink-0 mt-0.5" />
                                <p>Déplacez le marqueur rouge pour corriger la position GPS. Assurez-vous d'utiliser la vue satellite ou les repères de rue pour plus de précision.</p>
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 bg-card rounded-xl border border-border flex items-center justify-center text-muted-foreground">
                            Sélectionnez un prestataire pour valider sa position
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
