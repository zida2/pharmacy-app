import React, { useState, useEffect } from "react";
import { Sparkles, Thermometer, CloudRain, Sun, Moon, Wind, ArrowRight, BookOpen, Activity, TrendingUp, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

export default function HealthInsights() {
    const hour = new Date().getHours();
    const [activeIndex, setActiveIndex] = useState(0);

    // Auto-rotate magazine tips
    useEffect(() => {
        const timer = setInterval(() => {
            setActiveIndex((prev) => (prev + 1) % magazineTips.length);
        }, 5000);
        return () => clearInterval(timer);
    }, []);

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
            category: "Alerte",
            title: "Dengue : Vigilance renforcée",
            desc: "L'épidémie persiste au Burkina. Apprenez à reconnaître les signes et à éliminer les gîtes larvaires.",
            fullContent: "La dengue reste un défi majeur avec plus de 100 000 cas suspectés en 2024. Le moustique 'Aedes aegypti' pique principalement le jour. \n\nConseils Prévention :\n• Éliminez les eaux stagnantes (pneus, pots de fleurs).\n• Portez des vêtements longs la journée.\n• Utilisez des répulsifs et dormez sous moustiquaire.\n\nSymptômes : Forte fièvre brutale, maux de tête intenses, douleurs articulaires. Attention : Évitez l'Aspirine et le Diclofénac sans avis médical, privilégiez le Paracétamol.",
            image: "🚨",
            color: "from-orange-500/20 to-orange-500/5"
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
            category: "Santé",
            title: "Diabète : Mangez Local & Équilibré",
            desc: "Le Fonio, le Soumbala et le Mil sont vos alliés pour réguler votre glycémie naturellement.",
            fullContent: "La gestion du diabète au Burkina peut être optimisée grâce à nos produits locaux. \n\nLes meilleurs choix :\n• Le Fonio : Index glycémique bas, idéal pour remplacer le riz blanc.\n• Le Soumbala : Riche en protéines, il aide à la santé cardiovasculaire.\n• Le Mil et le Sorgho : Consommés en grains entiers, ils apportent des fibres essentielles.\n\nConseil : Remplissez la moitié de votre assiette avec des feuilles locales (Boulvanka, Oseille) pour ralentir l'absorption des sucres.",
            image: "🥗",
            color: "from-amber-600/20 to-amber-600/5"
        },
        {
            category: "Prévention",
            title: "Méningite : Risque Saisonnier",
            desc: "Pendant l'Harmattan, le risque de méningite augmente. Assurez-vous d'être à jour pour vos vaccins.",
            fullContent: "Le Burkina Faso est dans la 'ceinture de la méningite'. Le vent sec et la poussière de l'Harmattan fragilisent vos voies respiratoires. \n\nPrévention :\n• Vaccination : Le MenAfriVac protège contre le sérogroupe A.\n• Hygiène : Lavez-vous les mains et évitez les lieux trop confinés et poussiéreux.\n\nSignes d'alerte : Raideur de la nuque, forte fièvre, maux de tête insupportables et vomissements en jet. En cas de doute, une consultation immédiate est vitale.",
            image: "🛡️",
            color: "from-blue-500/20 to-blue-500/5"
        },
        {
            category: "Psychologie",
            title: "Briser le Tabou : Santé Mentale",
            desc: "Le bien-être émotionnel est aussi important que la santé physique. Ne restez pas seul avec votre détresse.",
            fullContent: "La santé mentale n'est pas un signe de faiblesse. Face au stress, à l'anxiété ou au deuil, parler est le premier pas vers la guérison. \n\nAu Burkina, des organisations comme 'SOS Santé Mentale' offrent un soutien gratuit. \n\nSignes à surveiller :\n• Fatigue persistante et perte d'intérêt.\n• Troubles du sommeil fréquents.\n• Isolement inhabituel.\n\nVotre pharmacien peut aussi vous orienter vers des structures de soutien psychologique spécialisées.",
            image: "🧠",
            color: "from-purple-500/20 to-purple-500/5"
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
            {/* Breaking News Ticker - "Bande Annonce" Style */}
            <div className="relative -mx-6 bg-primary/10 py-2 overflow-hidden border-y border-primary/10">
                <div className="flex items-center gap-4 animate-marquee whitespace-nowrap px-6">
                    <div className="flex items-center gap-2 text-primary font-black text-[9px] uppercase tracking-tighter shrink-0">
                        <Zap size={10} className="fill-current" />
                        FLASH SANTÉ :
                    </div>
                    <span className="text-[10px] font-bold text-foreground inline-flex gap-8">
                        <span>• Nouveau vaccin R21 disponible dans 70 districts</span>
                        <span>• Alerte Harmattan : Protégez vos yeux et vos lèvres</span>
                        <span>• Nutrition : Le Moringa, super-aliment local à privilégier</span>
                        <span>• Urgence : Numéro SOS Pharmacie 01 01 01 01</span>
                    </span>
                    {/* Duplicate for seamless loop */}
                    <span className="text-[10px] font-bold text-foreground inline-flex gap-8 ml-8">
                        <span>• Nouveau vaccin R21 disponible dans 70 districts</span>
                        <span>• Alerte Harmattan : Protégez vos yeux et vos lèvres</span>
                        <span>• Nutrition : Le Moringa, super-aliment local à privilégier</span>
                        <span>• Urgence : Numéro SOS Pharmacie 01 01 01 01</span>
                    </span>
                </div>
            </div>

            {/* Advice Header */}
            <div className="flex justify-between items-end px-1 pt-2">
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

            {/* Magazine Feed - Automatic Animated Slider */}
            <div className="space-y-4">
                <div className="flex items-center gap-2 px-1">
                    <TrendingUp className="text-primary" size={18} />
                    <h2 className="text-sm font-black text-foreground tracking-tighter uppercase italic">Magazine & Évolution</h2>
                </div>

                <div className="relative overflow-hidden -mx-6 px-6">
                    <div
                        className="flex gap-4 transition-all duration-700 ease-in-out pb-4"
                        style={{ transform: `translateX(-${activeIndex * (240 + 16)}px)` }}
                    >
                        {magazineTips.map((tip, i) => (
                            <div
                                key={i}
                                onClick={() => setSelectedTip(tip)}
                                className={cn(
                                    "min-w-[240px] p-5 rounded-[2rem] bg-gradient-to-br border border-white/5 flex flex-col justify-between h-44 shadow-sm active:scale-95 transition-all cursor-pointer group",
                                    tip.color,
                                    activeIndex === i ? "scale-100 opacity-100 ring-2 ring-primary/20" : "scale-95 opacity-50"
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
                    {/* Dots indicator */}
                    <div className="flex justify-center gap-1.5 mt-2">
                        {magazineTips.map((_, i) => (
                            <div key={i} className={cn("h-1 rounded-full transition-all duration-500", activeIndex === i ? "w-6 bg-primary" : "w-1.5 bg-border")} />
                        ))}
                    </div>
                </div>
            </div>

            {/* Show All Magazine Tips Modal */}
            {showAll && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-in fade-in duration-300">
                    <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-md" onClick={() => setShowAll(false)} />
                    <div className="relative w-full max-w-lg bg-card dark:bg-zinc-900 rounded-[2.5rem] border border-white/10 shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-300">
                        {/* Modal Header */}
                        <div className="p-6 border-b border-white/5 flex justify-between items-center bg-zinc-900/50">
                            <div>
                                <h3 className="text-xl font-black text-foreground tracking-tight">Focus Santé & Magazine</h3>
                                <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest mt-0.5">Tout le contenu préventif</p>
                            </div>
                            <button
                                onClick={() => setShowAll(false)}
                                className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                            >
                                <Zap size={18} />
                            </button>
                        </div>

                        {/* Modal Content - Scrollable List */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                            {/* Current Seasonal Advice first */}
                            <div className="px-2 py-2">
                                <span className="text-[10px] font-black uppercase tracking-widest text-primary/60">Conseil de saison</span>
                            </div>
                            <div
                                onClick={() => {
                                    setSelectedTip({
                                        category: "Conseil du moment",
                                        title: advice.title,
                                        desc: advice.desc,
                                        fullContent: advice.fullContent,
                                        image: "✨",
                                        color: advice.bg
                                    });
                                }}
                                className={cn("p-5 rounded-3xl border border-white/10 flex gap-4 cursor-pointer hover:brightness-110 transition-all", advice.bg)}
                            >
                                <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 bg-white dark:bg-zinc-900 shadow-sm", advice.color)}>
                                    <advice.icon size={24} strokeWidth={2.5} />
                                </div>
                                <div>
                                    <h4 className="font-black text-sm text-foreground mb-1 uppercase tracking-tight">{advice.title}</h4>
                                    <p className="text-xs text-muted-foreground line-clamp-2">{advice.desc}</p>
                                </div>
                            </div>

                            {/* Magazine Tips */}
                            <div className="px-2 pt-4 pb-2">
                                <span className="text-[10px] font-black uppercase tracking-widest text-primary/60">Magazine & Évènements</span>
                            </div>
                            {magazineTips.map((tip, i) => (
                                <div
                                    key={i}
                                    onClick={() => setSelectedTip(tip)}
                                    className={cn(
                                        "p-5 rounded-3xl border border-white/5 flex flex-col justify-between cursor-pointer hover:scale-[1.02] active:scale-[0.98] transition-all relative overflow-hidden group",
                                        tip.color
                                    )}
                                >
                                    <div className="absolute -right-2 -bottom-2 text-4xl opacity-10 group-hover:scale-125 transition-transform duration-500">
                                        {tip.image}
                                    </div>
                                    <div className="relative z-10">
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
                                </div>
                            ))}
                        </div>

                        {/* Modal Footer */}
                        <div className="p-4 bg-zinc-900/80 backdrop-blur-md border-t border-white/5">
                            <button
                                onClick={() => setShowAll(false)}
                                className="w-full py-4 bg-primary text-white font-black rounded-2xl shadow-lg shadow-primary/20 active:scale-95 transition-all uppercase tracking-widest text-[11px]"
                            >
                                Revenir à l'accueil
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Detail Modal */}
            {selectedTip && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 animate-in fade-in duration-300">
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
