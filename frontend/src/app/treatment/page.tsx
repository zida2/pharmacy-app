"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
    Plus,
    Trash2,
    Clock,
    Calendar,
    ArrowLeft,
    Bell,
    Pill,
    CheckCircle2,
    AlertCircle,
    ChevronRight,
    Play,
    X
} from "lucide-react";
import { firebaseService } from "@/services/firebaseService";
import { Treatment } from "@/services/types";
import { auth } from "@/services/firebase";
import { cn } from "@/lib/utils";
import AuthPrompt from "@/components/AuthPrompt";

export default function TreatmentPage() {
    const router = useRouter();
    const [treatments, setTreatments] = useState<Treatment[]>([]);
    const [loading, setLoading] = useState(true);
    const [showAddForm, setShowAddForm] = useState(false);
    const [showAuthPrompt, setShowAuthPrompt] = useState(false);
    const [activeNotification, setActiveNotification] = useState<string | null>(null);
    const [isOfflineMode, setIsOfflineMode] = useState(false);

    // Form state
    const [newMed, setNewMed] = useState({
        medicineName: "",
        dosage: "1 comprimé",
        frequency: "3 fois par jour",
        duration: "7 jours",
        startDate: new Date().toISOString().split('T')[0]
    });

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged((user: any) => {
            fetchTreatments();
        });

        // Network status listeners
        const handleStatus = () => setIsOfflineMode(!navigator.onLine);
        window.addEventListener('online', handleStatus);
        window.addEventListener('offline', handleStatus);
        handleStatus();

        return () => {
            unsubscribe();
            window.removeEventListener('online', handleStatus);
            window.removeEventListener('offline', handleStatus);
        }
    }, []);

    // Simulation de notification push
    useEffect(() => {
        if (treatments.length > 0 && !activeNotification) {
            const timer = setTimeout(() => {
                setActiveNotification(`🔔 Rappel : Il est temps de prendre votre ${treatments[0].medicineName}`);
            }, 6000);
            return () => clearTimeout(timer);
        }
    }, [treatments]);

    const fetchTreatments = async () => {
        setLoading(true);
        try {
            const data = await firebaseService.getUserTreatments();
            setTreatments(data);
            localStorage.setItem('cached_treatments', JSON.stringify(data));
            setIsOfflineMode(false);
        } catch (error) {
            console.warn("Using offline treatment cache");
            const cached = localStorage.getItem('cached_treatments');
            if (cached) setTreatments(JSON.parse(cached));
            setIsOfflineMode(true);
        } finally {
            setLoading(false);
        }
    };

    const handleAddTreatment = async (e: React.FormEvent) => {
        e.preventDefault();

        // Optimistic / Local update for offline
        const localData = {
            ...newMed,
            id: 'local-' + Date.now(),
            isActive: true,
            times: ["08:00", "14:00", "20:00"]
        };
        const newList = [...treatments, localData as any];
        setTreatments(newList);
        localStorage.setItem('cached_treatments', JSON.stringify(newList));

        if (!auth.currentUser || !navigator.onLine) {
            setShowAddForm(false);
            if (!auth.currentUser) setShowAuthPrompt(true);
            return;
        }

        try {
            await firebaseService.createTreatment({
                ...newMed,
                times: ["08:00", "14:00", "20:00"]
            });
            setShowAddForm(false);
            setNewMed({
                medicineName: "",
                dosage: "1 comprimé",
                frequency: "3 fois par jour",
                duration: "7 jours",
                startDate: new Date().toISOString().split('T')[0]
            });
            fetchTreatments();
        } catch (error) {
            console.error(error);
            setShowAddForm(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (confirm("Supprimer ce traitement ?")) {
            await firebaseService.deleteTreatment(id);
            fetchTreatments();
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <main className="min-h-screen bg-background pb-nav overflow-x-hidden">
            {/* Notification Toast */}
            {activeNotification && (
                <div className="fixed top-6 left-4 right-4 z-[100] animate-in slide-in-from-top-10 duration-500">
                    <div className="bg-slate-900 text-white p-5 rounded-[2rem] shadow-2xl border border-primary/30 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center text-primary">
                                <Bell className="animate-ring" size={20} />
                            </div>
                            <p className="text-xs font-bold leading-tight">{activeNotification}</p>
                        </div>
                        <button onClick={() => setActiveNotification(null)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                            <X size={18} />
                        </button>
                    </div>
                    <style jsx>{`
                        @keyframes ring {
                            0%, 100% { transform: rotate(0) }
                            25% { transform: rotate(15deg) }
                            75% { transform: rotate(-15deg) }
                        }
                        .animate-ring {
                            animation: ring 0.5s ease-in-out infinite;
                        }
                    `}</style>
                </div>
            )}

            {/* Header */}
            <header className="p-6 bg-slate-900 text-white rounded-b-[3rem] shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-48 h-48 bg-primary/20 rounded-full blur-3xl -mr-20 -mt-20" />

                <div className="flex items-center justify-between relative z-10 mb-8">
                    <button onClick={() => router.back()} className="p-2 bg-white/10 rounded-full">
                        <ArrowLeft size={20} />
                    </button>
                    <button className="p-2 bg-white/10 rounded-full relative">
                        <Bell size={20} />
                        <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full ring-2 ring-slate-900" />
                    </button>
                </div>

                <div className="relative z-10">
                    <h1 className="text-3xl font-black italic tracking-tighter">Mon Pillulier <br /><span className="text-primary">Connecté</span></h1>
                    <p className="text-slate-400 text-xs mt-2 font-bold uppercase tracking-widest">Ne ratez plus jamais une prise</p>
                </div>
            </header>

            {/* Offline Status indicator */}
            {isOfflineMode && (
                <div className="mx-6 mt-4 p-3 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex items-center gap-3 animate-in slide-in-from-top-2">
                    <div className="w-8 h-8 bg-amber-500 rounded-xl flex items-center justify-center text-white">
                        <AlertCircle size={18} />
                    </div>
                    <div>
                        <p className="text-[10px] font-black uppercase text-amber-600 tracking-widest">Mode Hors-Ligne</p>
                        <p className="text-[9px] font-bold text-amber-700/70 leading-tight">Accès limité aux données locales. Synchronisation dès reconnexion.</p>
                    </div>
                </div>
            )}

            <div className="p-6 -mt-6">
                {!showAddForm ? (
                    <div className="space-y-6">
                        {/* Summary Card */}
                        <div className="bg-primary/5 border border-primary/20 rounded-[2.5rem] p-6 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-primary text-white rounded-2xl flex items-center justify-center shadow-lg">
                                    <Clock size={24} />
                                </div>
                                <div>
                                    <h2 className="font-black text-sm text-foreground">Prochaine prise</h2>
                                    <p className="text-primary font-black text-lg">Dans 45 min</p>
                                </div>
                            </div>
                            <Play size={24} className="text-primary fill-current" />
                        </div>

                        {treatments.length === 0 ? (
                            <div className="py-20 flex flex-col items-center text-center px-10">
                                <div className="w-20 h-20 bg-secondary rounded-full flex items-center justify-center mb-6 opacity-30">
                                    <Pill size={40} />
                                </div>
                                <h3 className="font-black text-xl text-foreground">Pillulier vide</h3>
                                <p className="text-sm text-muted-foreground mt-2">
                                    Ajoutez vos médicaments pour recevoir des notifications de rappel.
                                </p>
                                <button
                                    onClick={() => setShowAddForm(true)}
                                    className="mt-8 btn btn-primary px-10 py-4 text-xs tracking-widest"
                                >
                                    AJOUTER UN MÉDICAMENT
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <div className="flex justify-between items-center px-2">
                                    <h3 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Traitements en cours</h3>
                                    <button
                                        onClick={() => setShowAddForm(true)}
                                        className="text-primary font-black text-[10px] uppercase tracking-widest flex items-center gap-1"
                                    >
                                        <Plus size={14} /> Ajouter
                                    </button>
                                </div>
                                {treatments.map((t) => (
                                    <div key={t.id} className="glass-card p-5 rounded-3xl border-border hover:border-primary/30 transition-all flex flex-col gap-4">
                                        <div className="flex justify-between items-start">
                                            <div className="flex gap-4">
                                                <div className="w-12 h-12 bg-secondary rounded-2xl flex items-center justify-center text-primary shadow-sm">
                                                    <Pill size={24} />
                                                </div>
                                                <div>
                                                    <h4 className="font-black text-foreground">{t.medicineName}</h4>
                                                    <div className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground uppercase">
                                                        <Clock size={10} />
                                                        <span>{t.frequency}</span>
                                                        <span className="opacity-30">•</span>
                                                        <span>{t.dosage}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <button onClick={() => handleDelete(t.id)} className="p-2 text-muted-foreground hover:text-red-500 transition-colors">
                                                <Trash2 size={18} />
                                            </button>
                                        </div>

                                        <div className="flex items-center justify-between pt-2 border-t border-border/10">
                                            <div className="flex items-center gap-2">
                                                <Calendar size={12} className="text-muted-foreground" />
                                                <span className="text-[10px] font-black text-muted-foreground">Prévu pour : {t.duration}</span>
                                            </div>
                                            <div className="flex items-center gap-1 text-[10px] font-black text-green-500 uppercase tracking-tighter">
                                                <CheckCircle2 size={12} /> Prochaine : 14:00
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="animate-in slide-in-from-bottom-5 duration-500">
                        <div className="glass-card p-8 rounded-[3rem] border-primary/20 flex flex-col gap-6">
                            <div className="flex items-center gap-4 mb-2">
                                <div className="p-3 bg-primary text-white rounded-2xl">
                                    <Plus size={24} />
                                </div>
                                <h3 className="text-xl font-black">Nouveau Traitement</h3>
                            </div>

                            <form onSubmit={handleAddTreatment} className="space-y-6">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-2">Médicament</label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="ex: Paracétamol"
                                        className="input-standard w-full"
                                        value={newMed.medicineName}
                                        onChange={e => setNewMed({ ...newMed, medicineName: e.target.value })}
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-2">Dosage</label>
                                        <input
                                            type="text"
                                            required
                                            className="input-standard w-full"
                                            value={newMed.dosage}
                                            onChange={e => setNewMed({ ...newMed, dosage: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-2">Durée</label>
                                        <input
                                            type="text"
                                            required
                                            className="input-standard w-full"
                                            value={newMed.duration}
                                            onChange={e => setNewMed({ ...newMed, duration: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-2">Fréquence</label>
                                    <select
                                        className="input-standard w-full"
                                        value={newMed.frequency}
                                        onChange={e => setNewMed({ ...newMed, frequency: e.target.value })}
                                    >
                                        <option value="1 fois par jour">1 fois par jour</option>
                                        <option value="2 fois par jour">2 fois par jour</option>
                                        <option value="3 fois par jour">3 fois par jour</option>
                                        <option value="Toutes les 8h">Toutes les 8h</option>
                                    </select>
                                </div>

                                <div className="pt-4 flex gap-4">
                                    <button
                                        type="button"
                                        onClick={() => setShowAddForm(false)}
                                        className="flex-1 py-4 bg-secondary text-foreground rounded-2xl font-black text-xs uppercase tracking-widest border border-border"
                                    >
                                        ANNULER
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-[2] py-4 bg-primary text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-primary/20"
                                    >
                                        ENREGISTRER 💾
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>

            {showAuthPrompt && <AuthPrompt isOpen={showAuthPrompt} onClose={() => setShowAuthPrompt(false)} />}
        </main>
    );
}
