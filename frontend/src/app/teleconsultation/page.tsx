"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
    MessageSquare,
    Video,
    History,
    Plus,
    Stethoscope,
    User,
    ChevronRight,
    Clock,
    AlertCircle,
    Info,
    Search,
    Filter
} from "lucide-react";
import { firebaseService } from "@/services/firebaseService";
import { Consultation } from "@/services/types";
import { auth } from "@/services/firebase";
import { cn } from "@/lib/utils";
import AuthPrompt from "@/components/AuthPrompt";

const SPECIALTIES = [
    { id: "general", label: "Général", icon: Stethoscope, color: "bg-blue-500" },
    { id: "pediatrie", label: "Pédiatrie", icon: User, color: "bg-pink-500" },
    { id: "dermatologie", label: "Peau", icon: AlertCircle, color: "bg-orange-500" },
    { id: "allergie", label: "Allergies", icon: Info, color: "bg-purple-500" },
];

export default function TeleconsultationPage() {
    const router = useRouter();
    const [consultations, setConsultations] = useState<Consultation[]>([]);
    const [loading, setLoading] = useState(true);
    const [isStarting, setIsStarting] = useState(false);
    const [activeTab, setActiveTab] = useState<"new" | "history">("new");
    const [showAuthPrompt, setShowAuthPrompt] = useState(false);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged((user: any) => {
            setIsAuthenticated(!!user);
            if (user) {
                fetchConsultations();
            } else {
                setLoading(false);
            }
        });
        return () => unsubscribe();
    }, []);

    const fetchConsultations = async () => {
        setLoading(true);
        try {
            const data = await firebaseService.getUserConsultations();
            setConsultations(data || []);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleStartConsultation = async (type: "chat" | "video", subject: string) => {
        const user = auth.currentUser;
        if (!user) {
            setShowAuthPrompt(true);
            return;
        }

        setIsStarting(true);
        try {
            const id = await firebaseService.createConsultation(type, subject);
            router.push(`/teleconsultation/chat?id=${id}`);
        } catch (error) {
            console.error("Failed to start consultation", error);
            alert("Erreur lors de la création de la consultation. Veuillez réessayer.");
        } finally {
            setIsStarting(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-background flex flex-col items-center justify-center">
                <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin mb-4" />
                <p className="text-muted-foreground animate-pulse">Chargement de votre espace santé...</p>
            </div>
        );
    }

    return (
        <main className="min-h-screen bg-background pb-nav">
            {/* Header */}
            <div className="relative h-64 bg-slate-900 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-slate-900/50 to-background" />

                {/* Background Animation */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-3xl -mr-20 -mt-20 animate-pulse" />

                <div className="relative z-10 px-6 pt-12">
                    <h1 className="text-3xl font-black text-white mb-2 leading-tight">
                        Conseil Expert <br />
                        <span className="text-primary italic">en Direct</span>
                    </h1>
                    <p className="text-slate-400 text-sm max-w-[250px]">
                        Échangez instantanément avec un pharmacien diplômé pour vos questions de santé.
                    </p>
                </div>

                {/* Tab Switcher */}
                <div className="absolute bottom-6 left-6 right-6 flex bg-background/20 backdrop-blur-xl p-1 rounded-2xl border border-white/10 z-20">
                    <button
                        onClick={() => setActiveTab("new")}
                        className={cn(
                            "flex-1 py-3 px-4 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2",
                            activeTab === "new" ? "bg-white text-slate-900 shadow-lg" : "text-white/60 hover:text-white"
                        )}
                    >
                        <Plus size={16} />
                        NOUVEAU
                    </button>
                    <button
                        onClick={() => setActiveTab("history")}
                        className={cn(
                            "flex-1 py-3 px-4 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2 relative",
                            activeTab === "history" ? "bg-white text-slate-900 shadow-lg" : "text-white/60 hover:text-white"
                        )}
                    >
                        <History size={16} />
                        HISTORIQUE
                        {consultations.some(c => c.unreadCount && c.unreadCount > 0) && (
                            <span className="absolute top-2 right-4 w-2 h-2 bg-red-500 rounded-full animate-ping" />
                        )}
                    </button>
                </div>
            </div>

            <div className="px-6 -mt-2 relative z-10">
                {isStarting ? (
                    <div className="flex-1 flex flex-col items-center justify-center py-20 text-center animate-in fade-in duration-500">
                        <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4" />
                        <h2 className="text-xl font-black italic">Connexion au service...</h2>
                        <p className="text-sm text-muted-foreground mt-2">Nous préparons votre salle de consultation sécurisée.</p>
                    </div>
                ) : activeTab === "new" ? (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {/* Instant Options */}
                        <div className="grid grid-cols-2 gap-4">
                            <button
                                onClick={() => handleStartConsultation("chat", "Conseil Général")}
                                className="bg-primary/5 hover:bg-primary/10 border border-primary/20 p-6 rounded-3xl flex flex-col items-center gap-4 transition-all group active:scale-95"
                            >
                                <div className="w-14 h-14 bg-primary text-white rounded-2xl flex items-center justify-center shadow-lg group-hover:rotate-12 transition-transform">
                                    <MessageSquare size={28} />
                                </div>
                                <div className="text-center">
                                    <span className="block font-black text-foreground">Chat Direct</span>
                                    <span className="text-[10px] text-primary font-bold uppercase tracking-wider">Instantané</span>
                                </div>
                            </button>

                            <button
                                onClick={() => handleStartConsultation("video", "Appel Vidéo")}
                                className="bg-secondary/50 hover:bg-secondary border border-border p-6 rounded-3xl flex flex-col items-center gap-4 transition-all group active:scale-95 opacity-50 cursor-not-allowed"
                                title="Bientôt disponible"
                            >
                                <div className="w-14 h-14 bg-slate-200 text-slate-500 rounded-2xl flex items-center justify-center shadow-md">
                                    <Video size={28} />
                                </div>
                                <div className="text-center text-slate-400">
                                    <span className="block font-black">Appel Vidéo</span>
                                    <span className="text-[10px] font-bold uppercase tracking-wider">Bientôt</span>
                                </div>
                            </button>
                        </div>

                        {/* Specialties */}
                        <div>
                            <h2 className="text-sm font-black uppercase tracking-widest text-muted-foreground mb-4">Par Spécialité</h2>
                            <div className="grid grid-cols-4 gap-3">
                                {SPECIALTIES.map(spec => (
                                    <button
                                        key={spec.id}
                                        onClick={() => handleStartConsultation("chat", spec.label)}
                                        className="flex flex-col items-center gap-2 group active:scale-90 transition-all font-medium"
                                    >
                                        <div className={cn("w-16 h-16 rounded-full flex items-center justify-center text-white shadow-xl transition-all group-hover:scale-110", spec.color)}>
                                            <spec.icon size={26} />
                                        </div>
                                        <span className="text-[11px] text-center font-bold text-foreground">{spec.label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Why Use? */}
                        <div className="bg-primary/5 rounded-3xl p-6 border border-primary/10 flex gap-4 items-start">
                            <div className="bg-primary/20 p-2 rounded-xl text-primary">
                                <Info size={20} />
                            </div>
                            <div className="space-y-1">
                                <h3 className="font-bold text-sm text-foreground">Besoin d'aide ?</h3>
                                <p className="text-xs text-muted-foreground leading-relaxed">
                                    Nos pharmaciens répondent à vos questions sous 5 minutes : posologie, interactions médicamenteuses ou premier conseil.
                                </p>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {consultations.length > 0 ? (
                            consultations.map(consult => (
                                <button
                                    key={consult.id}
                                    onClick={() => router.push(`/teleconsultation/chat?id=${consult.id}`)}
                                    className="w-full bg-card hover:bg-secondary/30 border border-border p-5 rounded-3xl flex items-center justify-between transition-all group active:scale-[0.98]"
                                >
                                    <div className="flex gap-4 items-center">
                                        <div className={cn(
                                            "w-12 h-12 rounded-2xl flex items-center justify-center text-white",
                                            consult.status === "active" ? "bg-green-500" : "bg-slate-400"
                                        )}>
                                            <MessageSquare size={20} />
                                        </div>
                                        <div className="text-left">
                                            <h4 className="font-bold text-foreground group-hover:text-primary transition-colors">{consult.subject || "Consultation"}</h4>
                                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                <Clock size={12} />
                                                <span>{new Date(consult.updatedAt?.seconds * 1000).toLocaleDateString()}</span>
                                                <span className="mx-1 opacity-30 px-1">•</span>
                                                <span className={cn(
                                                    "capitalize font-bold",
                                                    consult.status === "active" ? "text-green-500" : ""
                                                )}>{consult.status === "active" ? "En cours" : "Terminée"}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <ChevronRight size={20} className="text-muted-foreground group-hover:translate-x-1 transition-transform" />
                                </button>
                            ))
                        ) : (
                            <div className="py-20 flex flex-col items-center justify-center text-center px-8">
                                <div className="w-20 h-20 bg-secondary rounded-full flex items-center justify-center mb-6 opacity-40">
                                    <History size={32} />
                                </div>
                                <h3 className="font-bold text-xl mb-2">Aucun historique</h3>
                                <p className="text-sm text-muted-foreground">
                                    Vous n'avez pas encore effectué de téléconsultation. Lancez votre premier chat !
                                </p>
                                <button
                                    onClick={() => setActiveTab("new")}
                                    className="mt-6 px-8 py-3 bg-primary text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-primary/20"
                                >
                                    COMMENCER
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {showAuthPrompt && <AuthPrompt isOpen={showAuthPrompt} onClose={() => setShowAuthPrompt(false)} />}
        </main>
    );
}
