"use client";

import React, { useState } from "react";
import { X, AlertTriangle, CheckCircle } from "lucide-react";
import { firebaseService } from "@/services/firebaseService";
import { HealthProvider } from "@/services/types";

interface ReportModalProps {
    provider: HealthProvider;
    onClose: () => void;
}

export default function ReportModal({ provider, onClose }: ReportModalProps) {
    const [type, setType] = useState<any>("closed");
    const [description, setDescription] = useState("");
    const [loading, setLoading] = useState(false);
    const [done, setDone] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await firebaseService.createReport({
                providerId: provider.id,
                providerName: provider.name,
                providerType: provider.type,
                type,
                description
            });
            setDone(true);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    if (done) {
        return (
            <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
                <div className="bg-white dark:bg-zinc-900 rounded-3xl p-8 max-w-sm w-full text-center">
                    <div className="mx-auto w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-4">
                        <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
                    </div>
                    <h3 className="text-xl font-black mb-2">Signalement Reçu</h3>
                    <p className="text-sm text-zinc-500 mb-6">
                        Merci de votre contribution ! Notre équipe va vérifier ces informations rapidement.
                    </p>
                    <button onClick={onClose} className="btn btn-secondary w-full py-3 rounded-xl">
                        Fermer
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
            <div className="bg-white dark:bg-zinc-900 w-full sm:max-w-md rounded-t-[2rem] sm:rounded-[2rem] p-6 shadow-2xl animate-in slide-in-from-bottom-full sm:slide-in-from-bottom-10 duration-300">
                <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center gap-2">
                        <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-full">
                            <AlertTriangle className="w-5 h-5 text-red-600" />
                        </div>
                        <div>
                            <h3 className="text-xl font-black leading-none">Signaler un Problème</h3>
                            <p className="text-xs text-zinc-500 mt-1">{provider.name}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 bg-zinc-100 dark:bg-zinc-800 rounded-full hover:bg-zinc-200">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                        <ReportOption
                            label="Fermé actuellement"
                            selected={type === 'closed'}
                            onClick={() => setType('closed')}
                        />
                        <ReportOption
                            label="Horaires faux"
                            selected={type === 'wrong_hours'}
                            onClick={() => setType('wrong_hours')}
                        />
                        <ReportOption
                            label="Localisation fausse"
                            selected={type === 'wrong_location'}
                            onClick={() => setType('wrong_location')}
                        />
                        <ReportOption
                            label="Numéro invalide"
                            selected={type === 'phone_error'}
                            onClick={() => setType('phone_error')}
                        />
                    </div>

                    <textarea
                        className="w-full bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-xl p-4 font-medium outline-none h-24 text-sm resize-none"
                        placeholder="Détails supplémentaires (optionnel)..."
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                    />

                    <button
                        type="submit"
                        disabled={loading}
                        className="btn bg-zinc-900 text-white dark:bg-white dark:text-black w-full py-4 rounded-xl text-base font-bold"
                    >
                        {loading ? "Envoi..." : "Envoyer le Signalement"}
                    </button>
                </form>
            </div>
        </div>
    );
}

function ReportOption({ label, selected, onClick }: any) {
    return (
        <div
            onClick={onClick}
            className={`
                p-3 rounded-xl border-2 cursor-pointer transition-all text-center flex flex-col items-center justify-center gap-1
                ${selected
                    ? "border-red-500 bg-red-50 dark:bg-red-900/20 text-red-700"
                    : "border-zinc-100 dark:border-zinc-800 bg-transparent text-zinc-500 hover:border-zinc-300"}
            `}
        >
            <span className="text-xs font-bold leading-tight">{label}</span>
        </div>
    )
}
