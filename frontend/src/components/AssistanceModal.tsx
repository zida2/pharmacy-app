"use client";

import React from "react";
import { Phone, ShieldAlert, Heart, X, MessageSquare, MapPin, Activity } from "lucide-react";
import { cn } from "@/lib/utils";

interface AssistanceModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function AssistanceModal({ isOpen, onClose }: AssistanceModalProps) {
    if (!isOpen) return null;

    const emergencyNumbers = [
        { label: "SAMU", number: "112", description: "Urgences Médicales", color: "bg-red-500" },
        { label: "Pompiers", number: "18", description: "Secours & Incendies", color: "bg-orange-500" },
        { label: "Police", number: "17", description: "Sécurité & Assistance", color: "bg-blue-600" },
        { label: "Gendarmerie", number: "16", description: "Protection Civile", color: "bg-emerald-600" },
    ];

    return (
        <div className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center p-4 sm:p-6 bg-zinc-950/80 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="w-full max-w-lg glass-card rounded-[2.5rem] border-white/10 shadow-2xl overflow-hidden animate-in slide-in-from-bottom-10 duration-500">

                {/* Header Section */}
                <div className="relative p-6 bg-gradient-to-br from-red-600 to-red-800 text-white">
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-full transition-all"
                    >
                        <X size={20} />
                    </button>

                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center animate-pulse">
                            <ShieldAlert size={32} />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black italic leading-none">Centre SOS</h2>
                            <p className="text-white/80 text-[10px] font-bold uppercase tracking-widest mt-1">Vous n'êtes pas seul(e)</p>
                        </div>
                    </div>

                    <div className="bg-white/10 rounded-2xl p-4 border border-white/10">
                        <div className="flex items-center gap-2 mb-1">
                            <Activity size={14} className="text-red-300" />
                            <span className="text-[10px] font-black uppercase tracking-wider">Support Actif</span>
                        </div>
                        <p className="text-sm font-medium leading-relaxed">
                            Besoin d'aide immédiate ? Contactez les secours ou discutez avec notre équipe de garde.
                        </p>
                    </div>
                </div>

                <div className="p-6 space-y-6 overflow-y-auto max-h-[60vh] bg-background">

                    {/* Public Emergency Numbers */}
                    <div>
                        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground mb-4">Numéros d'Urgence (Burkina)</h3>
                        <div className="grid grid-cols-2 gap-3">
                            {emergencyNumbers.map((num) => (
                                <a
                                    key={num.label}
                                    href={`tel:${num.number}`}
                                    className="flex flex-col p-4 bg-card border border-border rounded-[1.5rem] hover:border-red-500/50 transition-all active:scale-95 group shadow-sm"
                                >
                                    <div className={cn("w-10 h-10 rounded-xl mb-3 flex items-center justify-center text-white shadow-lg", num.color)}>
                                        <Phone size={18} />
                                    </div>
                                    <span className="text-lg font-black italic leading-none text-foreground">{num.number}</span>
                                    <span className="text-[9px] font-bold uppercase text-muted-foreground mt-1">{num.label}</span>
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Private Concierge Support */}
                    <div>
                        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground mb-4">Assistance Pharmaceutique</h3>
                        <div className="space-y-3">
                            <a
                                href="https://wa.me/22670000000" // Real number placeholder
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-4 p-4 bg-emerald-500/5 border border-emerald-500/20 rounded-[2rem] hover:bg-emerald-500/10 transition-all group"
                            >
                                <div className="w-12 h-12 bg-[#25D366] text-white rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                                    <MessageSquare size={22} />
                                </div>
                                <div className="flex-1">
                                    <h4 className="font-black text-sm text-emerald-700 dark:text-emerald-400">Conseil Pharmacien</h4>
                                    <p className="text-[10px] font-medium text-emerald-600/80">Disponible 24h/24 sur WhatsApp</p>
                                </div>
                            </a>

                            <div className="flex flex-col items-center justify-center p-6 bg-zinc-50 dark:bg-zinc-900 border border-border rounded-[2rem] text-center border-dashed">
                                <Heart size={28} className="text-red-500 mb-3 animate-bounce" />
                                <p className="text-xs font-bold text-muted-foreground leading-relaxed">
                                    Votre santé est notre priorité. Nos livreurs et pharmaciens partenaires sont mobilisés pour vous.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer Quote */}
                <div className="p-4 bg-secondary/30 text-center border-t border-border">
                    <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Pharmabf • Toujours à vos côtés</p>
                </div>
            </div>
        </div>
    );
}
