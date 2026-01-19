"use client";

import React from "react";
import { Sparkles, Thermometer, CloudRain, Sun, Moon, Wind, ArrowRight, BookOpen, Activity, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

export default function HealthInsights() {
    const hour = new Date().getHours();

    // Simple contextual logic based on time (Burkina Faso context)
    const getContextualAdvice = () => {
        if (hour >= 5 && hour < 11) {
            return {
                title: "Énergie du matin",
                desc: "Un grand verre d'eau au réveil aide à éliminer les toxines.",
                icon: Sun,
                color: "text-amber-500",
                bg: "bg-amber-500/10"
            };
        } else if (hour >= 11 && hour < 16) {
            return {
                title: "Forte Chaleur",
                desc: "Il fait chaud à Ouaga. Buvez au moins 2.5L d'eau aujourd'hui.",
                icon: Thermometer,
                color: "text-orange-500",
                bg: "bg-orange-500/10"
            };
        } else if (hour >= 16 && hour < 20) {
            return {
                title: "Détente du soir",
                desc: "Préparez votre corps au repos. Évitez les écrans après 21h.",
                icon: Moon,
                color: "text-indigo-500",
                bg: "bg-indigo-500/10"
            };
        } else {
            return {
                title: "Sommeil Réparateur",
                desc: "Le sommeil renforce votre système immunitaire. Reposez-vous bien.",
                icon: Activity,
                color: "text-purple-500",
                bg: "bg-purple-500/10"
            };
        }
    };

    const advice = getContextualAdvice();

    const magazineTips = [
        {
            category: "Évolution",
            title: "Le nouveau vaccin anti-paludique",
            desc: "Tout savoir sur son déploiement à Ouagadougou et Bobo.",
            image: "🦟",
            color: "from-emerald-500/20 to-emerald-500/5"
        },
        {
            category: "Nutrition",
            title: "Les vertus du Moringa",
            desc: "Comment intégrer ce super-aliment local dans vos plats.",
            image: "🌿",
            color: "from-green-500/20 to-green-500/5"
        },
        {
            category: "Prévention",
            title: "Hypertension : Le tueur silencieux",
            desc: "Conseils pour surveiller votre tension au quotidien.",
            image: "💓",
            color: "from-red-500/20 to-red-500/5"
        }
    ];

    const [selectedTip, setSelectedTip] = React.useState<typeof magazineTips[0] | null>(null);
    const [showAll, setShowAll] = React.useState(false);

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-4">
            {/* Advice Header */}
            <div className="flex justify-between items-end px-1">
                <div className="flex items-center gap-2">
                    <Sparkles className="text-primary" size={18} />
                    <h2 className="text-lg font-bold text-foreground tracking-tight">Focus Santé</h2>
                </div>
                <button
                    onClick={() => setShowAll(true)}
                    className="text-[10px] font-black uppercase text-primary tracking-widest hover:underline flex items-center gap-1 active:scale-95 transition-transform"
                >
                    Tout voir <ArrowRight size={12} />
                </button>
            </div>

            {/* Contextual Card - High Visual Impact */}
            <div
                onClick={() => setSelectedTip({
                    category: "Conseil du moment",
                    title: advice.title,
                    desc: advice.desc,
                    image: "✨",
                    color: advice.bg
                })}
                className={cn("relative p-5 rounded-3xl border border-white/10 overflow-hidden shadow-sm transition-all cursor-pointer hover:brightness-110 active:scale-[0.98]", advice.bg)}
            >
                <div className="absolute -right-4 -top-4 opacity-10">
                    <advice.icon size={120} />
                </div>
                <div className="relative z-10 flex gap-4 items-start">
                    <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 bg-white dark:bg-zinc-900 shadow-sm border border-white/20", advice.color)}>
                        <advice.icon size={24} strokeWidth={2.5} />
                    </div>
                    <div>
                        <h3 className="font-black text-sm text-foreground mb-1 uppercase tracking-tight">{advice.title}</h3>
                        <p className="text-xs text-muted-foreground font-medium leading-relaxed">
                            {advice.desc}
                        </p>
                    </div>
                </div>
            </div>

            {/* Magazine Feed - Horizontal Scroll */}
            <div className="space-y-4">
                <div className="flex items-center gap-2 px-1">
                    <TrendingUp className="text-primary" size={18} />
                    <h2 className="text-sm font-black text-foreground tracking-tighter uppercase italic">Magazine & Évolution</h2>
                </div>

                <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide -mx-6 px-6">
                    {magazineTips.map((tip, i) => (
                        <div
                            key={i}
                            onClick={() => setSelectedTip(tip)}
                            className={cn(
                                "min-w-[240px] p-5 rounded-[2rem] bg-gradient-to-br border border-white/5 flex flex-col justify-between h-44 shadow-sm active:scale-95 transition-all cursor-pointer group",
                                tip.color
                            )}
                        >
                            <div>
                                <span className="text-[9px] font-black uppercase tracking-[0.2em] text-foreground/40 mb-2 block">
                                    {tip.category}
                                </span>
                                <h4 className="font-black text-sm text-foreground leading-tight group-hover:text-primary transition-colors">
                                    {tip.title}
                                </h4>
                                <p className="text-[10px] text-muted-foreground mt-2 line-clamp-2 font-medium">
                                    {tip.desc}
                                </p>
                            </div>
                            <div className="flex justify-between items-end">
                                <span className="text-2xl">{tip.image}</span>
                                <div className="w-8 h-8 rounded-full bg-white dark:bg-zinc-800 flex items-center justify-center shadow-sm">
                                    <ArrowRight size={14} className="text-primary" />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Detail Modal */}
            {selectedTip && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 animate-in fade-in duration-300">
                    <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={() => setSelectedTip(null)} />
                    <div className="relative w-full max-w-sm bg-card dark:bg-zinc-900 rounded-[2.5rem] border border-white/10 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
                        <div className={cn("h-32 w-full bg-gradient-to-br flex items-center justify-center text-5xl", selectedTip.color)}>
                            {selectedTip.image}
                        </div>
                        <div className="p-8 space-y-4">
                            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">{selectedTip.category}</span>
                            <h3 className="text-2xl font-black text-foreground leading-tight tracking-tight">{selectedTip.title}</h3>
                            <p className="text-sm text-muted-foreground leading-relaxed font-medium">
                                {selectedTip.desc}
                                {"\n\n"}
                                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
                            </p>
                            <button
                                onClick={() => setSelectedTip(null)}
                                className="w-full py-4 bg-primary text-white font-black rounded-2xl shadow-lg shadow-primary/20 active:scale-95 transition-all uppercase tracking-widest text-[10px]"
                            >
                                J'ai compris
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
