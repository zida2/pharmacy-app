"use client";

import React, { useState, useEffect } from "react";
import {
    Activity, Wind, CloudRain, Sun, Thermometer,
    TrendingUp, ArrowRight
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function HealthInsights() {
    const [activeMagazineIndex, setActiveMagazineIndex] = useState(0);
    const [activeTipIndex, setActiveTipIndex] = useState(0);
    const [showMenu, setShowMenu] = useState(false);

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
        },
        {
            id: "nutrition",
            content: {
                title: "Équilibre Alimentaire",
                desc: "Privilégiez les fruits et légumes locaux pour renforcer votre système immunitaire.",
                icon: TrendingUp, // Using TrendingUp as a placeholder for nutrition/growth
                bg: "bg-green-600",
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

    // Rotate Tips Manually or Auto
    useEffect(() => {
        if (!showMenu) {
            const timer = setInterval(() => {
                setActiveTipIndex((prev) => (prev + 1) % healthTips.length);
            }, 8000);
            return () => clearInterval(timer);
        }
    }, [showMenu]);

    const currentTip = healthTips[activeTipIndex].content;

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">

            {/* Focus Santé - Animated Carousel */}
            <div>
                <div className="flex justify-between items-center px-1 mb-2">
                    <h2 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                        <Activity size={16} className="text-primary" /> Focus Santé
                    </h2>

                    {/* Menu Button */}
                    <button
                        onClick={() => setShowMenu(!showMenu)}
                        className="text-xs font-bold text-primary flex items-center gap-1 bg-primary/10 px-2 py-1 rounded-full hover:bg-primary/20 transition-colors"
                    >
                        {showMenu ? "Fermer" : "Menu"}
                    </button>
                </div>

                {showMenu ? (
                    <div className="grid grid-cols-2 gap-3 animate-in zoom-in-95 duration-300">
                        {healthTips.map((tip, i) => (
                            <button
                                key={tip.id}
                                onClick={() => {
                                    setActiveTipIndex(i);
                                    setShowMenu(false);
                                }}
                                className={cn(
                                    "p-4 rounded-2xl flex flex-col items-center text-center gap-2 transition-all active:scale-95 shadow-sm border border-transparent hover:border-border",
                                    tip.content.bg,
                                    "bg-opacity-90"
                                )}
                            >
                                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm">
                                    <tip.content.icon size={20} className="text-white" />
                                </div>
                                <span className="font-bold text-white text-xs leading-tight">
                                    {tip.content.title}
                                </span>
                            </button>
                        ))}
                    </div>
                ) : (
                    <div
                        className={cn(
                            "p-5 rounded-3xl shadow-lg relative overflow-hidden transition-all duration-500 min-h-[140px] flex flex-col justify-center cursor-pointer",
                            currentTip.bg
                        )}
                        onClick={() => setShowMenu(true)}
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
                        <div className="absolute bottom-2 right-2 flex gap-1">
                            {healthTips.map((_, i) => (
                                <div
                                    key={i}
                                    className={cn(
                                        "w-1.5 h-1.5 rounded-full transition-all duration-300 bg-white/50",
                                        activeTipIndex === i ? "bg-white w-3" : ""
                                    )}
                                />
                            ))}
                        </div>
                    </div>
                )}
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
