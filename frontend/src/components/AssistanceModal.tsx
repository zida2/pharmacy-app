"use client";

import React from "react";
import { Phone, ShieldAlert, Heart, X, MessageSquare, MapPin, Activity, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface AssistanceModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function AssistanceModal({ isOpen, onClose }: AssistanceModalProps) {
    if (!isOpen) return null;

    const emergencyNumbers = [
        { label: "SAMU", number: "112", desc: "Médical", color: "bg-rose-600", shadow: "shadow-rose-500/20" },
        { label: "Pompiers", number: "18", desc: "Secours", color: "bg-orange-600", shadow: "shadow-orange-500/20" },
        { label: "Police", number: "17", desc: "Sécurité", color: "bg-blue-700", shadow: "shadow-blue-500/20" },
        { label: "Gendarme", number: "16", desc: "Assistance", color: "bg-emerald-700", shadow: "shadow-emerald-500/20" },
    ];

    return (
        <div className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center p-0 sm:p-6 bg-zinc-950/60 backdrop-blur-md animate-in fade-in duration-300">
            <div className="w-full max-w-lg bg-white dark:bg-zinc-950 rounded-t-[3rem] sm:rounded-[3rem] shadow-2xl overflow-hidden animate-in slide-in-from-bottom-20 duration-500 border-t sm:border border-white/10">

                {/* Compact Premium Header */}
                <div className="relative p-7 bg-gradient-to-br from-red-600 to-red-800 text-white overflow-hidden">
                    <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -mr-20 -mt-20 blur-3xl opacity-50" />
                    <button
                        onClick={onClose}
                        className="absolute top-5 right-5 w-10 h-10 flex items-center justify-center bg-black/20 hover:bg-black/40 rounded-full transition-all z-20"
                    >
                        <X size={20} />
                    </button>

                    <div className="relative z-10 flex items-center gap-5 mb-5">
                        <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-[1.5rem] flex items-center justify-center shadow-inner animate-pulse">
                            <ShieldAlert size={34} />
                        </div>
                        <div>
                            <h2 className="text-3xl font-black italic leading-none tracking-tight">Centre SOS</h2>
                            <p className="text-white/70 text-[10px] font-black uppercase tracking-[0.2em] mt-1.5">Action Immédiate • 24h/24</p>
                        </div>
                    </div>

                    <div className="relative z-10 bg-white/10 backdrop-blur-xl rounded-[1.8rem] p-5 border border-white/20 shadow-lg">
                        <div className="flex items-center gap-2 mb-2">
                            <Activity size={16} className="text-red-200" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-red-100">Besoin d'aide ?</span>
                        </div>
                        <p className="text-sm font-bold leading-snug">
                            Contactez les secours officiels du Burkina ou discutez avec nos pharmaciens partenaires.
                        </p>
                    </div>
                </div>

                <div className="p-7 space-y-8 overflow-y-auto max-h-[55vh] bg-background">

                    {/* Emergency Grid with Fixed Colors */}
                    <div>
                        <div className="flex items-center justify-between mb-5 px-1">
                            <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-muted-foreground/60">Numéros SOS</h3>
                            <div className="w-12 h-0.5 bg-red-500/20 rounded-full" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            {emergencyNumbers.map((num) => (
                                <a
                                    key={num.label}
                                    href={`tel:${num.number}`}
                                    className="flex flex-col p-5 bg-card border border-border/50 rounded-[2.2rem] hover:border-red-500/30 transition-all active:scale-[0.97] group shadow-sm items-center text-center"
                                >
                                    <div className={cn("w-14 h-14 rounded-2xl mb-4 flex items-center justify-center text-white shadow-xl transition-transform group-hover:scale-110", num.color, num.shadow)}>
                                        <Phone size={22} />
                                    </div>
                                    <span className="text-2xl font-black italic leading-none text-foreground tracking-tighter">{num.number}</span>
                                    <span className="text-[9px] font-black uppercase text-muted-foreground tracking-widest mt-2">{num.label}</span>
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Chat Support */}
                    <div>
                        <div className="flex items-center justify-between mb-5 px-1">
                            <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-muted-foreground/60">Assistance Privée</h3>
                            <div className="w-12 h-0.5 bg-emerald-500/20 rounded-full" />
                        </div>
                        <div className="gap-4 flex flex-col">
                            <a
                                href="https://wa.me/22670000000"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-5 p-5 bg-emerald-500/5 dark:bg-emerald-500/10 border border-emerald-500/20 rounded-[2.2rem] hover:bg-emerald-500/10 transition-all group active:scale-[0.98]"
                            >
                                <div className="w-14 h-14 bg-[#25D366] text-white rounded-[1.2rem] flex items-center justify-center shadow-lg shadow-emerald-500/20 flex-shrink-0 group-hover:rotate-6 transition-transform">
                                    <MessageSquare size={26} />
                                </div>
                                <div className="flex-1">
                                    <h4 className="font-black text-base text-emerald-800 dark:text-emerald-400 italic">Conseil Pharmacien</h4>
                                    <p className="text-[10px] font-black uppercase text-emerald-600/70 tracking-widest mt-0.5">Contact WhatsApp 24h/24</p>
                                </div>
                                <ChevronRight className="text-emerald-500/40 group-hover:translate-x-1 transition-transform" />
                            </a>

                            <div className="p-6 bg-zinc-50 dark:bg-zinc-900 border border-border/40 rounded-[2.2rem] flex items-center gap-4 border-dashed">
                                <div className="w-12 h-12 bg-white dark:bg-zinc-800 rounded-full flex items-center justify-center shadow-sm flex-shrink-0">
                                    <Heart size={20} className="text-red-500 animate-pulse" />
                                </div>
                                <p className="text-[11px] font-bold text-muted-foreground leading-relaxed">
                                    Votre santé est notre priorité unique. Nos équipes sont mobilisées pour garantir votre sécurité.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="p-5 bg-secondary/20 dark:bg-zinc-900/40 text-center border-t border-border/50">
                    <p className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground/40">Pharmabf • Toujours à vos côtés</p>
                </div>
            </div>
        </div>
    );
}
