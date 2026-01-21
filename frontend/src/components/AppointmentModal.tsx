"use client";

import React, { useState } from "react";
import { X, Calendar, Clock, CheckCircle } from "lucide-react";
import { firebaseService } from "@/services/firebaseService";
import { HealthProvider } from "@/services/types";

interface AppointmentModalProps {
    provider: HealthProvider;
    onClose: () => void;
}

export default function AppointmentModal({ provider, onClose }: AppointmentModalProps) {
    const [step, setStep] = useState(1);
    const [date, setDate] = useState("");
    const [time, setTime] = useState("");
    const [reason, setReason] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await firebaseService.createAppointment({
                providerId: provider.id,
                providerName: provider.name,
                providerType: provider.type,
                appointmentDate: date,
                appointmentTime: time,
                consultationType: reason,
                status: "pending"
            });
            setStep(3); // Success state
        } catch (error) {
            console.error(error);
            alert("Erreur lors de la réservation. Connectez-vous d'abord.");
        } finally {
            setLoading(false);
        }
    };

    if (step === 3) {
        return (
            <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
                <div className="bg-white dark:bg-zinc-900 rounded-3xl p-8 max-w-sm w-full text-center relative overflow-hidden">
                    <div className="absolute top-0 left-0 right-0 h-2 bg-green-500" />
                    <div className="mx-auto w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-4">
                        <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
                    </div>
                    <h3 className="text-xl font-black mb-2">Demande Envoyée !</h3>
                    <p className="text-sm text-zinc-500 mb-6">
                        Votre demande de rendez-vous chez <br /><strong className="text-foreground">{provider.name}</strong> a bien été reçue. Vous recevrez une confirmation sous peu.
                    </p>
                    <button onClick={onClose} className="btn btn-primary w-full py-3 rounded-xl">
                        OK, Merci
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
            <div className="bg-white dark:bg-zinc-900 w-full sm:max-w-md rounded-t-[2rem] sm:rounded-[2rem] p-6 shadow-2xl animate-in slide-in-from-bottom-full sm:slide-in-from-bottom-10 duration-300">
                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h3 className="text-xl font-black leading-none">Prendre Rendez-vous</h3>
                        <p className="text-xs text-zinc-500 mt-1">Chez {provider.name}</p>
                    </div>
                    <button onClick={onClose} className="p-2 bg-zinc-100 dark:bg-zinc-800 rounded-full hover:bg-zinc-200">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Date Selection */}
                    <div className="space-y-1">
                        <label className="text-xs font-bold uppercase text-zinc-500 ml-1">Date souhaitée</label>
                        <div className="relative">
                            <Calendar className="absolute left-4 top-3.5 text-zinc-400 w-4 h-4" />
                            <input
                                type="date"
                                required
                                min={new Date().toISOString().split('T')[0]}
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                                className="w-full bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-xl py-3 pl-10 pr-4 font-medium focus:ring-2 focus:ring-primary/20 outline-none transition"
                            />
                        </div>
                    </div>

                    {/* Time Selection */}
                    <div className="space-y-1">
                        <label className="text-xs font-bold uppercase text-zinc-500 ml-1">Heure (Approximative)</label>
                        <div className="grid grid-cols-3 gap-2">
                            {['09:00', '11:00', '15:00', '17:00'].map(t => (
                                <button
                                    key={t}
                                    type="button"
                                    onClick={() => setTime(t)}
                                    className={`py-2 rounded-xl text-xs font-bold border transition ${time === t ? 'bg-primary text-white border-primary' : 'bg-transparent border-zinc-200 dark:border-zinc-700 hover:border-primary/50'}`}
                                >
                                    {t}
                                </button>
                            ))}
                        </div>
                        <div className="relative mt-2">
                            <Clock className="absolute left-4 top-3.5 text-zinc-400 w-4 h-4" />
                            <input
                                type="time"
                                value={time}
                                onChange={(e) => setTime(e.target.value)}
                                className="w-full bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-xl py-3 pl-10 pr-4 font-medium outline-none"
                            />
                        </div>
                    </div>

                    {/* Reason */}
                    <div className="space-y-1">
                        <label className="text-xs font-bold uppercase text-zinc-500 ml-1">Motif</label>
                        <select
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            required
                            className="w-full bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-xl py-3 px-4 font-medium outline-none appearance-none"
                        >
                            <option value="">Sélectionner un motif...</option>
                            <option value="Consultation générale">Consultation générale</option>
                            <option value="Urgence">Douleur / Urgence</option>
                            <option value="Suivi">Suivi / Contrôle</option>
                            <option value="Autre">Autre</option>
                        </select>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="btn btn-primary w-full py-4 rounded-xl text-base shadow-lg shadow-primary/25 mt-4"
                    >
                        {loading ? "Envoi..." : "Confirmer le Rendez-vous"}
                    </button>

                    <p className="text-[10px] text-center text-zinc-400">
                        Aucun paiement requis en ligne.
                    </p>
                </form>
            </div>
        </div>
    );
}
