"use client";

import React, { useState, useEffect } from "react";
import {
    Activity, Wind, CloudRain, Sun, Thermometer,
    TrendingUp, ArrowRight, ChevronLeft, ChevronRight
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function HealthInsights() {
    const [activeMagazineIndex, setActiveMagazineIndex] = useState(0);
    const [activeTipIndex, setActiveTipIndex] = useState(0);

    // Dynamic Health Tips (Carrousel)
    const healthTips = [
        {
            id: "season",
            get content() {
                const month = new Date().getMonth();
                if (month <= 1 || month === 11) { // Harmattan
                    return {
                        title: "Alerte Harmattan",
                        desc: "L'air est sec et poussiéreux. Protégez vos voies respiratoires et hydratez-vous souvent.",
                        icon: Wind,
                        bg: "bg-blue-600",
                        textColor: "text-white"
                    };
                } else if (month >= 5 && month <= 9) { // Rain
                    return {
                        title: "Saison des Pluies",
                        desc: "Risque de paludisme élevé. Dormez sous moustiquaire imprégnée et assainissez votre environnement.",
                        icon: CloudRain,
                        bg: "bg-emerald-600",
                        textColor: "text-white"
                    };
                } else {
                    return {
                        title: "Chaleur & Soleil",
                        desc: "Températures élevées. Évitez l'exposition directe au soleil entre 12h et 15h.",
                        icon: Sun,
                        bg: "bg-amber-500",
                        textColor: "text-white"
                    };
                }
            }
        },
        {
            id: "energy",
            content: {
                title: "Énergie Quotidienne",
                desc: "Une alimentation riche en fer (légumes verts, foie) combat la fatigue fréquente.",
                icon: Activity,
                bg: "bg-indigo-600",
                textColor: "text-white"
            }
        },
        {
            id: "hydration",
            content: {
                title: "Restez Hydraté",
                desc: "Buvez au moins 2L d'eau par jour, surtout en période de forte chaleur.",
                icon: Thermometer,
                bg: "bg-cyan-600",
                textColor: "text-white"
            }
        }
    ];

    // Magazine Data
    const magazineTips = [
        {
            category: "Évolution",
            title: "Le nouveau vaccin anti-paludique R21",
            image: "🦟",
            color: "from-emerald-600 to-emerald-800 text-white",
        },
        {
            category: "Alerte",
            title: "Dengue : Vigilance renforcée à Ouaga",
            image: "🚨",
            color: "from-orange-600 to-orange-800 text-white",
        },
        {
            category: "Nutrition",
            title: "Le Moringa : L'Arbre Miracle",
            image: "🌿",
            color: "from-green-600 to-green-800 text-white",
        }
    ];

    // Auto rotate Magazine
    useEffect(() => {
        const timer = setInterval(() => {
            setActiveMagazineIndex((prev) => (prev + 1) % magazineTips.length);
        }, 5000);
        return () => clearInterval(timer);
    }, []);

    // Rotate Tips Manually or Auto? Let's do auto for tips too for now, but slower
    useEffect(() => {
        const timer = setInterval(() => {
            setActiveTipIndex((prev) => (prev + 1) % healthTips.length);
        }, 8000);
        return () => clearInterval(timer);
    }, []);

    const currentTip = healthTips[activeTipIndex].content;

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">

            {/* Focus Santé - Animated Carousel */}
            <div>
                <div className="flex justify-between items-center px-1 mb-2">
                    <h2 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                        <Activity size={16} className="text-primary" /> Focus Santé
                    </h2>
                    <div className="flex gap-1">
                        {healthTips.map((_, i) => (
                            <div
                                key={i}
                                className={cn(
                                    "w-1.5 h-1.5 rounded-full transition-all duration-300",
                                    activeTipIndex === i ? "bg-primary w-3" : "bg-slate-300 dark:bg-zinc-700"
                                )}
                            />
                        ))}
                    </div>
                </div>

                <div
                    className={cn(
                        "p-5 rounded-3xl shadow-lg relative overflow-hidden transition-all duration-500 min-h-[140px] flex flex-col justify-center",
                        currentTip.bg
                    )}
                >
                    <div className="absolute right-[-20px] top-[-20px] opacity-10 rotate-12">
                        <currentTip.icon size={120} />
                    </div>

                    <div className="relative z-10 flex gap-4 items-start">
                        <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center shrink-0 backdrop-blur-md shadow-inner">
                            <currentTip.icon size={24} className="text-white" />
                        </div>
                        <div className="flex-1">
                            <h3 className="font-black text-white text-lg leading-tight mb-1">
                                {currentTip.title}
                            </h3>
                            <p className="text-white/90 text-sm font-medium leading-relaxed">
                                {currentTip.desc}
                            </p>
                        </div>
                    </div>

                    {/* Navigation Buttons for Tips */}
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            setActiveTipIndex((prev) => (prev - 1 + healthTips.length) % healthTips.length);
                        }}
                        className="absolute left-2 top-1/2 -translate-y-1/2 p-1 text-white/50 hover:text-white transition-colors"
                    >
                        <ChevronLeft size={20} />
                    </button>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            setActiveTipIndex((prev) => (prev + 1) % healthTips.length);
                        }}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-white/50 hover:text-white transition-colors"
                    >
                        <ChevronRight size={20} />
                    </button>
                </div>
            </div>

            {/* Magazine Slider */}
            <div>
                <div className="flex justify-between items-center px-1 mb-2">
                    <h2 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                        <TrendingUp size={16} className="text-indigo-500" /> Magazine
                    </h2>
                </div>

                <div className="relative overflow-hidden rounded-3xl">
                    <div
                        className="flex transition-transform duration-500 ease-out"
                        style={{ transform: `translateX(-${activeMagazineIndex * 100}%)` }}
                    >
                        {magazineTips.map((tip, i) => (
                            <div key={i} className="min-w-full">
                                <div className={cn(
                                    "p-5 h-32 flex justify-between items-center cursor-pointer bg-gradient-to-br",
                                    tip.color
                                )}>
                                    <div className="flex flex-col justify-center h-full max-w-[75%]">
                                        <span className="text-[10px] font-black uppercase tracking-widest opacity-70 mb-1">
                                            {tip.category}
                                        </span>
                                        <h3 className="font-bold text-lg leading-tight mb-2">
                                            {tip.title}
                                        </h3>
                                        <div className="flex items-center gap-1 text-[10px] font-bold bg-white/20 w-fit px-2 py-1 rounded-full backdrop-blur-sm">
                                            Lire maintenant <ArrowRight size={10} />
                                        </div>
                                    </div>
                                    <span className="text-4xl drop-shadow-md animate-in zoom-in duration-300">{tip.image}</span>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Magazine Indicators */}
                    <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5">
                        {magazineTips.map((_, i) => (
                            <div
                                key={i}
                                className={cn(
                                    "h-1 rounded-full transition-all shadow-sm",
                                    activeMagazineIndex === i ? "w-5 bg-white" : "w-1.5 bg-white/40"
                                )}
                            />
                        ))}
                    </div>
                </div>
            </div>

        </div>
    );
}
