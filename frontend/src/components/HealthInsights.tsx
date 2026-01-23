"use client";

import React, { useState, useEffect } from "react";
import {
    Activity, Wind, CloudRain, Sun, Thermometer,
    TrendingUp, ArrowRight, X, Heart, Leaf, Apple, Coffee, Droplets, Zap
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function HealthInsights() {
    const [activeMagazineIndex, setActiveMagazineIndex] = useState(0);
    const [activeTipIndex, setActiveTipIndex] = useState(0);
    const [showModal, setShowModal] = useState(false);

    // --- Data Sources ---

    // 1. Seasonal / Contextual Tips
    const healthTips = [
        {
            id: "season",
            get content() {
                const month = new Date().getMonth();
                if (month <= 1 || month === 11) { // Harmattan
                    return {
                        title: "Alerte Harmattan",
                        desc: "L'air est sec. Protégez vos voies respiratoires et hydratez-vous.",
                        icon: Wind,
                        bg: "bg-blue-600",
                        textColor: "text-white"
                    };
                } else if (month >= 5 && month <= 9) { // Rain
                    return {
                        title: "Saison des Pluies",
                        desc: "Risque de paludisme élevé. Dormez sous moustiquaire.",
                        icon: CloudRain,
                        bg: "bg-emerald-600",
                        textColor: "text-white"
                    };
                } else {
                    return {
                        title: "Chaleur & Soleil",
                        desc: "Évitez le soleil direct entre 12h et 15h. Hydratez-vous.",
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
                desc: "Privilégiez le fer (légumes verts, foie) contre la fatigue.",
                icon: Zap,
                bg: "bg-indigo-600",
                textColor: "text-white"
            }
        },
        {
            id: "hydration",
            content: {
                title: "Hydratation",
                desc: "Buvez au moins 2L d'eau par jour pour rester en forme.",
                icon: Droplets,
                bg: "bg-cyan-600",
                textColor: "text-white"
            }
        }
    ];

    // 2. Diets & Regimes
    const diets = [
        {
            title: "Régime Anti-inflammatoire",
            desc: "Réduisez les douleurs chroniques avec curcuma, gingembre et oméga-3.",
            icon: Heart,
            color: "text-rose-500",
            bg: "bg-rose-50"
        },
        {
            title: "Détox Naturelle",
            desc: "Jus de bissap et tamarin pour purifier l'organisme naturellement.",
            icon: Leaf,
            color: "text-emerald-500",
            bg: "bg-emerald-50"
        },
        {
            title: "Diabète & Sucre",
            desc: "Contrôlez votre glycémie : privilégiez les fibres et évitez les sodas.",
            icon: Activity,
            color: "text-blue-500",
            bg: "bg-blue-50"
        }
    ];

    // 3. Food as Medicine (Aliments Remèdes)
    const foodRemedies = [
        { name: "Gingembre", u: "Nausées & Digestion", icon: "🫚" },
        { name: "Ail", u: "Hypertension", icon: "🧄" },
        { name: "Miel", u: "Maux de gorge", icon: "🍯" },
        { name: "Moringa", u: "Fatigue & Carences", icon: "🌿" },
        { name: "Citron", u: "Immunité", icon: "🍋" },
        { name: "Papaye", u: "Digestion Difficile", icon: "🍈" },
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

    // Auto rotate Tips (Carousel)
    useEffect(() => {
        if (!showModal) {
            const timer = setInterval(() => {
                setActiveTipIndex((prev) => (prev + 1) % healthTips.length);
            }, 8000);
            return () => clearInterval(timer);
        }
    }, [showModal]);

    const currentCarouselTip = healthTips[activeTipIndex].content;

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">

            {/* --- SECTION 1: Focus Santé (Carousel) --- */}
            <div>
                <div className="flex justify-between items-center px-1 mb-2">
                    <h2 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                        <Activity size={16} className="text-primary" /> Focus Santé
                    </h2>

                    {/* Button trigger Popup */}
                    <button
                        onClick={() => setShowModal(true)}
                        className="text-[10px] font-bold text-primary flex items-center gap-1 bg-primary/10 px-3 py-1.5 rounded-full hover:bg-primary/20 transition-all active:scale-95"
                    >
                        VOIR TOUT <ArrowRight size={10} />
                    </button>
                </div>

                <div
                    onClick={() => setShowModal(true)}
                    className={cn(
                        "p-5 rounded-3xl shadow-lg relative overflow-hidden transition-all duration-500 min-h-[140px] flex flex-col justify-center cursor-pointer active:scale-[0.98]",
                        currentCarouselTip.bg
                    )}
                >
                    <div className="absolute right-[-20px] top-[-20px] opacity-10 rotate-12 animate-pulse">
                        <currentCarouselTip.icon size={120} />
                    </div>

                    <div className="relative z-10 flex gap-4 items-start">
                        <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center shrink-0 backdrop-blur-md shadow-inner border border-white/10">
                            <currentCarouselTip.icon size={24} className="text-white animate-bounce-slow" />
                        </div>
                        <div className="flex-1">
                            <h3 className="font-black text-white text-lg leading-tight mb-1">
                                {currentCarouselTip.title}
                            </h3>
                            <p className="text-white/90 text-sm font-medium leading-relaxed">
                                {currentCarouselTip.desc}
                            </p>
                        </div>
                    </div>

                    {/* Dots indicator */}
                    <div className="absolute bottom-3 right-4 flex gap-1">
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
            </div>

            {/* --- SECTION 2: Magazine Slider --- */}
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
                    {/* Indicators */}
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

            {/* --- MODAL POPUP: Sanctuaire Santé --- */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <div
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300"
                        onClick={() => setShowModal(false)}
                    />

                    {/* Modal Content - Greenery Theme */}
                    <div className="w-full max-w-lg h-[85vh] bg-[#f0fdf4] dark:bg-[#022c22] rounded-[2.5rem] shadow-2xl relative overflow-hidden flex flex-col animate-in zoom-in-95 slide-in-from-bottom-5 duration-300 border border-emerald-500/20">

                        {/* Animated Greenery Background */}
                        <div className="absolute inset-0 pointer-events-none overflow-hidden">
                            <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[40%] bg-emerald-400/20 blur-[80px] rounded-full animate-blob mix-blend-multiply dark:mix-blend-screen" />
                            <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-green-500/20 blur-[80px] rounded-full animate-blob animation-delay-2000 mix-blend-multiply dark:mix-blend-screen" />
                            <div className="absolute top-[30%] right-[10%] w-[40%] h-[30%] bg-teal-400/10 blur-[60px] rounded-full animate-blob animation-delay-4000 mix-blend-multiply dark:mix-blend-screen" />
                            {/* Falling Leaves Effect (Simulated with simple dots/icons for now or CSS) */}
                            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/leaf.png')] opacity-5" />
                        </div>

                        {/* Header */}
                        <div className="relative z-10 p-6 pb-2 flex justify-between items-center shrink-0">
                            <div>
                                <h2 className="text-2xl font-black text-emerald-900 dark:text-emerald-50 tracking-tight flex items-center gap-2">
                                    <Leaf className="text-emerald-500 animate-bounce-slow" size={24} />
                                    Sanctuaire Santé
                                </h2>
                                <p className="text-emerald-700/60 dark:text-emerald-200/60 text-xs font-semibold">Conseils, Régimes & Remèdes Naturels</p>
                            </div>
                            <button
                                onClick={() => setShowModal(false)}
                                className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 flex items-center justify-center hover:bg-emerald-200 transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Scrollable Body */}
                        <div className="relative z-10 overflow-y-auto p-6 space-y-8 scrollbar-hide">

                            {/* Section 1: Conseils du Moment */}
                            <section className="space-y-3">
                                <h3 className="text-sm font-black uppercase tracking-widest text-emerald-800 dark:text-emerald-200 flex items-center gap-2">
                                    <Sun size={14} /> Conseils du Moment
                                </h3>
                                <div className="grid grid-cols-1 gap-3">
                                    {healthTips.map((tip, i) => (
                                        <div key={i} className={`p-4 rounded-2xl flex items-start gap-4 shadow-sm border border-transparent hover:scale-[1.01] transition-transform ${tip.content.bg} text-white`}>
                                            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                                                <tip.content.icon size={20} />
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-base">{tip.content.title}</h4>
                                                <p className="text-sm text-white/90 leading-relaxed max-w-[90%]">
                                                    {tip.content.desc}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </section>

                            {/* Section 2: Régimes & Nutrition */}
                            <section className="space-y-3">
                                <h3 className="text-sm font-black uppercase tracking-widest text-emerald-800 dark:text-emerald-200 flex items-center gap-2">
                                    <Apple size={14} /> Nutrition & Régimes
                                </h3>
                                <div className="grid grid-cols-1 gap-3">
                                    {diets.map((diet, i) => (
                                        <div key={i} className={`p-4 rounded-2xl border flex items-center gap-4 transition-all hover:bg-white dark:hover:bg-white/5 ${diet.bg} border-emerald-100 dark:border-emerald-800/30 dark:bg-transparent`}>
                                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center bg-white shadow-sm ${diet.color}`}>
                                                <diet.icon size={24} />
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-slate-900 dark:text-emerald-50 text-sm">{diet.title}</h4>
                                                <p className="text-xs text-slate-600 dark:text-emerald-200/70 mt-0.5 leading-snug">
                                                    {diet.desc}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </section>

                            {/* Section 3: Aliments Remèdes (Grid) */}
                            <section className="space-y-3">
                                <h3 className="text-sm font-black uppercase tracking-widest text-emerald-800 dark:text-emerald-200 flex items-center gap-2">
                                    <Coffee size={14} /> Pharmacie Naturelle
                                </h3>
                                <div className="grid grid-cols-2 gap-3">
                                    {foodRemedies.map((item, i) => (
                                        <div key={i} className="bg-white dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-800/20 p-3 rounded-2xl shadow-sm flex flex-col items-center text-center gap-2 hover:shadow-md transition-shadow">
                                            <span className="text-3xl animate-in zoom-in duration-500 delay-[100ms]">{item.icon}</span>
                                            <div>
                                                <h4 className="font-bold text-slate-900 dark:text-emerald-50 text-sm">{item.name}</h4>
                                                <p className="text-[10px] uppercase font-bold text-emerald-600 dark:text-emerald-400 mt-1 bg-emerald-50 dark:bg-emerald-900/50 px-2 py-0.5 rounded-full inline-block">
                                                    {item.u}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </section>

                            <div className="h-10" /> {/* Spacer */}
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
}
