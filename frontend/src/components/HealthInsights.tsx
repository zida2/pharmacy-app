"use client";

import React from "react";
import { Sparkles, Thermometer, CloudRain, Sun, Moon, Wind, ArrowRight, BookOpen, Activity, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

export default function HealthInsights() {
    const hour = new Date().getHours();

    // Contextual logic based on time AND season (Burkina Faso climate)
    const getContextualAdvice = () => {
        const month = new Date().getMonth(); // 0 = Jan, 1 = Feb, etc.

        // 1. Harmattan Season (December - February) - CURRENT
        if (month <= 1 || month === 11) {
            return {
                title: "Alerte Harmattan",
                desc: "Le vent sec et la poussière sont présents. Protégez vos voies respiratoires.",
                fullContent: "La saison de l'Harmattan (décembre à février) apporte un vent sec chargé de poussière fine. \n\nPrécautions :\n• Portez un masque en extérieur pour éviter d'inhaler les poussières.\n• Hydratez votre peau avec du beurre de karité pour éviter les gerçures.\n• Buvez beaucoup d'eau, même si vous n'avez pas chaud, pour maintenir vos muqueuses hydratées.\n• Protégez les enfants et les personnes âgées, plus vulnérables aux infections respiratoires et à la méningite.",
                icon: Wind,
                color: "text-blue-500",
                bg: "bg-blue-500/10"
            };
        }

        // 2. Heatwave Season (March - May)
        if (month >= 2 && month <= 4) {
            return {
                title: "Pic de Chaleur",
                desc: "Températures extrêmes. Risque de déshydratation sévère.",
                fullContent: "Pendant la période de forte chaleur (mars à mai), les températures peuvent dépasser 40°C. \n\nPrécautions :\n• Buvez au moins 3 litres d'eau par jour.\n• Évitez les efforts physiques entre 11h et 16h.\n• Restez à l'ombre et portez des vêtements légers en coton.\n• En cas de vertiges ou maux de tête intenses, consultez immédiatement : c'est peut-être un coup de chaleur.",
                icon: Thermometer,
                color: "text-orange-600",
                bg: "bg-orange-600/10"
            };
        }

        // 3. Rainy Season (June - October)
        if (month >= 5 && month <= 9) {
            return {
                title: "Saison Pluvieuse",
                desc: "Humidité élevée. Multiplication des moustiques et risques d'eau.",
                fullContent: "L'hivernage (juin à octobre) est la période de haute transmission du paludisme. \n\nPrécautions :\n• Dormez systématiquement sous une moustiquaire imprégnée.\n• Éliminez les eaux stagnantes autour de votre concession.\n• Veillez à l'hygiène alimentaire pour éviter les maladies diarrhéiques.\n• En cas de fièvre, faites immédiatement un test (TDR) en pharmacie ou au CSPS.",
                icon: CloudRain,
                color: "text-emerald-500",
                bg: "bg-emerald-500/10"
            };
        }

        // Fallback by hour if no specific season logic (November)
        return {
            title: "Énergie & Santé",
            desc: "Une alimentation équilibrée renforce votre système immunitaire.",
            fullContent: "Prendre soin de sa santé passe avant tout par la prévention. Assurez-vous d'avoir un sommeil suffisant (7-8h) et de consommer des fruits de saison riches en vitamines pour rester en forme toute l'année.",
            icon: Activity,
            color: "text-primary",
            bg: "bg-primary/10"
        };
    };

    const advice = getContextualAdvice();

    const magazineTips = [
        {
            category: "Évolution",
            title: "Le nouveau vaccin anti-paludique R21",
            desc: "Le Burkina Faso lance le déploiement national du vaccin R21/Matrix-M en 2025 pour protéger 1,7 million d'enfants.",
            fullContent: "Le Burkina Faso marque une étape historique avec le lancement national du vaccin R21/Matrix-M en août 2025. Déjà déployé dans 70 districts sanitaires, ce vaccin rejoint le RTS,S pour offrir une protection robuste. Administré gratuitement, le schéma vaccinal comprend 3 doses (5e, 6e, 7e mois) et un rappel au 15e mois. Les essais cliniques à Nanoro ont montré une efficacité de 77%, offrant un espoir immense contre le paludisme, qui touche encore des milliers de familles burkinabè.",
            image: "🦟",
            color: "from-emerald-500/20 to-emerald-500/5"
        },
        {
            category: "Nutrition",
            title: "Le Moringa : L'Arbre Miracle local",
            desc: "Riche en fer et vitamines, le Moringa est une arme de choix contre la malnutrition et pour booster l'immunité.",
            fullContent: "Surnommé 'l'arbre miracle', le Moringa est un super-aliment d'exception cultivé au Burkina Faso. Ses feuilles contiennent 7 fois plus de vitamine C que les oranges et 4 fois plus de calcium que le lait. Utilisé pour combattre la malnutrition infantile et l'anémie, il aide aussi à réguler la glycémie. Conseils : Intégrez une cuillère à café de poudre de Moringa dans vos bouillies ou sauces locales pour un apport nutritionnel optimal au quotidien.",
            image: "🌿",
            color: "from-green-500/20 to-green-500/5"
        },
        {
            category: "Prévention",
            title: "Hypertension : Le Tueur Silencieux",
            desc: "Près d'un adulte sur trois au Burkina Faso est hypertendu. Apprenez à surveiller votre tension régulièrement.",
            fullContent: "L'hypertension artérielle (HTA) touche environ 30% des adultes au Burkina Faso, mais beaucoup l'ignorent. Sans symptômes précis, elle peut causer des AVC ou des crises cardiaques. Prévention : Réduisez le sel, évitez les cubes de bouillon trop salés, et pratiquez une marche rapide quotidienne. Conseil PharmaBF : Faites mesurer votre tension au moins une fois par trimestre en pharmacie ou en centre de santé. Un diagnostic précoce sauve des vies.",
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
                    fullContent: advice.fullContent,
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
                            <p className="text-sm text-muted-foreground leading-relaxed font-medium whitespace-pre-wrap">
                                {selectedTip.fullContent}
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
