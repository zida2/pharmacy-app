"use client";

import React, { useState, useEffect } from "react";
import { firebaseService } from "@/services/firebaseService";
import { auth } from "@/services/firebase";
import { HealthProvider, Appointment } from "@/services/types";
import { MapPin, Save, Clock, Check, X, User } from "lucide-react";
import { useRouter } from "next/navigation";
import ValidationMap from "@/components/admin/ValidationMap";

export default function ProviderDashboard() {
    const [provider, setProvider] = useState<HealthProvider | null>(null);
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingGps, setEditingGps] = useState(false);
    const [newLocation, setNewLocation] = useState<{ lat: number, lng: number } | null>(null);

    // Simulation d'un login prestataire pour la démo si non connecté
    // Dans la vraie vie, on récupère le provider lié au user auth
    useEffect(() => {
        loadDashboard();
    }, []);

    const loadDashboard = async () => {
        try {
            let myProvider: HealthProvider | null = null;
            const user = auth.currentUser;

            if (user) {
                myProvider = await firebaseService.getMyProvider(user.uid);
            }

            // Fallback Mock for Demo if no provider linked
            if (!myProvider) {
                const pharms = await firebaseService.getPharmacies();
                if (pharms.length > 0) {
                    myProvider = pharms[0];
                }
            }

            if (myProvider) {
                setProvider(myProvider);
                setNewLocation(myProvider.location);

                // Load appointments (Mock for now as backend logic for real appointments is complex)
                setAppointments([
                    {
                        id: "1", userId: "u1", userName: "Jean Ouédraogo", userPhone: "70000000",
                        providerId: myProvider.id, providerType: "pharmacy", providerName: myProvider.name,
                        appointmentDate: "2024-02-20", appointmentTime: "10:00",
                        consultationType: "Consultation générale", status: "pending",
                        createdAt: new Date(), updatedAt: new Date()
                    }
                ]);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const handleSaveGps = async () => {
        if (!provider || !newLocation) return;

        try {
            // Update in Firestore
            // await firebaseService.updateProviderLocation(provider.id, provider.type, newLocation);

            // Local update
            setProvider({
                ...provider,
                location: { ...provider.location, ...newLocation },
                gps_validated: true
            });
            setEditingGps(false);
            alert("Position GPS mise à jour avec succès !");
        } catch (e) {
            alert("Erreur lors de la mise à jour");
        }
    };

    if (loading) return <div className="p-8 text-center">Chargement de votre espace...</div>;
    if (!provider) return <div className="p-8 text-center">Accès refusé. Vous n'êtes pas prestataire.</div>;

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900 p-6">
            <header className="mb-8 flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-black">{provider.name}</h1>
                    <span className="text-sm text-zinc-500 uppercase font-bold tracking-wider">{provider.type}</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${provider.status === 'open' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {provider.status === 'open' ? 'Ouvert' : 'Fermé'}
                    </div>
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* 📍 Gestion GPS */}
                <div className="bg-white dark:bg-zinc-800 p-6 rounded-3xl shadow-sm border border-zinc-200 dark:border-zinc-700">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="font-bold flex items-center gap-2">
                            <MapPin className="text-primary" />
                            Ma Position GPS
                        </h2>
                        {provider.gps_validated && (
                            <span className="text-[10px] bg-blue-100 text-blue-600 px-2 py-1 rounded font-bold uppercase">Validée</span>
                        )}
                    </div>

                    <div className="h-64 rounded-xl overflow-hidden relative mb-4 border border-border">
                        <ValidationMap
                            initialLat={provider.location.lat}
                            initialLng={provider.location.lng}
                            onLocationSelect={(lat, lng) => setNewLocation({ lat, lng })}
                            className="w-full h-full"
                        />
                        {!editingGps && (
                            <div className="absolute inset-0 bg-white/10 z-10 cursor-not-allowed" title="Cliquez sur 'Corriger' pour modifier" />
                        )}
                    </div>

                    {editingGps ? (
                        <div className="flex gap-2">
                            <button onClick={handleSaveGps} className="btn btn-primary flex-1 py-2 rounded-xl flex items-center justify-center gap-2">
                                <Save size={16} /> Enregistrer
                            </button>
                            <button onClick={() => setEditingGps(false)} className="btn btn-secondary flex-1 py-2 rounded-xl bg-gray-200 dark:bg-gray-700">
                                Annuler
                            </button>
                        </div>
                    ) : (
                        <button onClick={() => setEditingGps(true)} className="btn btn-secondary w-full py-2 rounded-xl bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 transition-colors">
                            Corriger ma position
                        </button>
                    )}
                </div>

                {/* 📅 Rendez-vous */}
                <div className="bg-white dark:bg-zinc-800 p-6 rounded-3xl shadow-sm border border-zinc-200 dark:border-zinc-700">
                    <h2 className="font-bold flex items-center gap-2 mb-4">
                        <Clock className="text-primary" />
                        Rendez-vous Entrants
                    </h2>

                    <div className="space-y-3">
                        {appointments.length === 0 ? (
                            <p className="text-zinc-500 text-sm italic">Aucun rendez-vous en attente.</p>
                        ) : (
                            appointments.map(app => (
                                <div key={app.id} className="p-4 bg-zinc-50 dark:bg-zinc-900/50 rounded-2xl flex justify-between items-center">
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <User size={14} className="text-zinc-400" />
                                            <span className="font-bold text-sm">{app.userName}</span>
                                        </div>
                                        <div className="text-xs text-zinc-500">
                                            {app.appointmentDate} à {app.appointmentTime}
                                        </div>
                                        <div className="text-xs font-medium text-primary mt-1">
                                            {app.consultationType}
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <button className="p-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200">
                                            <Check size={16} />
                                        </button>
                                        <button className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200">
                                            <X size={16} />
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
