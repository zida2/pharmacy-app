"use client";

import React, { useState, useEffect } from "react";
import {
    Activity, Wind, CloudRain, Sun, Thermometer,
    TrendingUp, ArrowRight, X, Heart, Leaf, Apple, Coffee, Droplets, Zap,
    Building2, Stethoscope, MapPin, Phone, Search, ChevronRight, ChevronLeft, Loader2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { firebaseService } from "@/services/firebaseService";
import { Clinic, Dentist } from "@/services/types";

export default function HealthInsights() {
    const [activeMagazineIndex, setActiveMagazineIndex] = useState(0);
    const [activeTipIndex, setActiveTipIndex] = useState(0);
    const [showModal, setShowModal] = useState(false);

    // --- Directory Data States ---
    const [clinics, setClinics] = useState<Clinic[]>([]);
    const [dentists, setDentists] = useState<Dentist[]>([]);
    const [isLoadingDirectories, setIsLoadingDirectories] = useState(false);

    // Directory UI States
    const [directoryTab, setDirectoryTab] = useState<'clinics' | 'dentists'>('clinics');
    const [dirPage, setDirPage] = useState(1);
    const [dirSearch, setDirSearch] = useState("");
    const ITEMS_PER_PAGE = 5;

    // Load data on mount to ensure readiness
    useEffect(() => {
        // Prevent double loading
        if (clinics.length > 0 || isLoadingDirectories) return;

        const loadData = async () => {
            console.log("🔄 Chargement des annuaires médicaux...");
            setIsLoadingDirectories(true);
            try {
                // Parallel fetch
                const [cData, dData] = await Promise.all([
                    firebaseService.getClinics(50), // Limit 50 hardcoded in service for safety
                    firebaseService.getDentists(50)
                ]);
                console.log(`✅ ${cData.length} cliniques et ${dData.length} dentistes chargés.`);
                setClinics(cData);
                setDentists(dData);
            } catch (e) {
                console.error("Failed to load health directories", e);
            } finally {
                setIsLoadingDirectories(false);
            }
        };
        loadData();
    }, []); // Empty dependency array = load once on mount

    // Filtering & Pagination Logic
    const getFilteredData = () => {
        const source = directoryTab === 'clinics' ? clinics : dentists;
        if (!dirSearch.trim()) return source;
        const q = dirSearch.toLowerCase();
        return source.filter(item =>
            item.name.toLowerCase().includes(q) ||
            item.location.city?.toLowerCase().includes(q)
        );
    };

    const filteredData = getFilteredData();
    const totalPages = Math.ceil(filteredData.length / ITEMS_PER_PAGE);
    const paginatedData = filteredData.slice((dirPage - 1) * ITEMS_PER_PAGE, dirPage * ITEMS_PER_PAGE);

    // Reset page on tab/search change
    useEffect(() => {
        setDirPage(1);
    }, [directoryTab, dirSearch]);


    // --- Existing Static Data ---
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
                                <div
                                    onClick={() => setShowModal(true)}
                                    className={cn(
                                        "p-5 h-32 flex justify-between items-center cursor-pointer bg-gradient-to-br transition-all hover:scale-[1.01] active:scale-[0.99]",
                                        tip.color
                                    )}>
                                    <div className="flex flex-col justify-center h-full max-w-[75%]">
                                        <span className="text-[10px] font-black uppercase tracking-widest opacity-70 mb-1">
                                            {tip.category}
                                        </span>
                                        <h3 className="font-bold text-lg leading-tight mb-2">
                                            {tip.title}
                                        </h3>
                                        <div className="flex items-center gap-1 text-[10px] font-bold bg-white/20 w-fit px-2 py-1 rounded-full backdrop-blur-sm hover:bg-white/30 transition-colors">
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

                    {/* Modal Content - Enhanced Scale */}
                    <div className="w-full max-w-lg h-[90vh] bg-[#f0fdf4] dark:bg-[#022c22] rounded-[2.5rem] shadow-2xl relative overflow-hidden flex flex-col animate-in zoom-in-95 slide-in-from-bottom-5 duration-300 border border-emerald-500/20">

                        {/* Enhanced Animated Greenery Background */}
                        <div className="absolute inset-0 pointer-events-none overflow-hidden">
                            {/* Floating gradient blobs */}
                            <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[40%] bg-emerald-400/20 blur-[80px] rounded-full animate-blob mix-blend-multiply dark:mix-blend-screen" />
                            <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-green-500/20 blur-[80px] rounded-full animate-blob animation-delay-2000 mix-blend-multiply dark:mix-blend-screen" />
                            <div className="absolute top-[30%] right-[10%] w-[40%] h-[30%] bg-teal-400/10 blur-[60px] rounded-full animate-blob animation-delay-4000 mix-blend-multiply dark:mix-blend-screen" />
                        </div>

                        {/* Header with Enhanced Animations */}
                        <div className="relative z-10 p-6 pb-2 flex justify-between items-center shrink-0">
                            <div className="animate-slide-up-fade">
                                <h2 className="text-2xl font-black text-emerald-900 dark:text-emerald-50 tracking-tight flex items-center gap-2">
                                    <Leaf className="text-emerald-500 animate-gentle-rotate" size={24} />
                                    Sanctuaire Santé
                                </h2>
                                <p className="text-emerald-700/60 dark:text-emerald-200/60 text-xs font-semibold">Conseils, Annuaires & Remèdes</p>
                            </div>
                            <button
                                onClick={() => setShowModal(false)}
                                className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 flex items-center justify-center hover:bg-emerald-200 transition-all active:scale-90 hover:rotate-90 duration-200"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Scrollable Body */}
                        <div className="relative z-10 overflow-y-auto p-6 space-y-8 custom-scrollbar">

                            {/* Section 1: Conseils du Moment */}
                            <section className="space-y-3 animate-cascade-in" style={{ animationDelay: '0.1s' }}>
                                <h3 className="text-sm font-black uppercase tracking-widest text-emerald-800 dark:text-emerald-200 flex items-center gap-2">
                                    <Sun size={14} className="animate-pulse-glow" /> Conseils du Moment
                                </h3>
                                <div className="grid grid-cols-1 gap-3">
                                    {healthTips.map((tip, i) => (
                                        <div
                                            key={i}
                                            className={`p-4 rounded-2xl flex items-start gap-4 shadow-sm border border-transparent hover:scale-[1.02] transition-all cursor-pointer animate-breathe ${tip.content.bg} text-white`}
                                            style={{ animationDelay: `${i * 0.2}s` }}
                                        >
                                            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center shrink-0 animate-pulse-glow">
                                                <tip.content.icon size={20} className="animate-gentle-rotate" />
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

                            {/* Section 4: ANNUAIRE SANTE (NEW) */}
                            <section className="space-y-4 animate-cascade-in bg-white/40 dark:bg-black/20 p-4 rounded-3xl border border-emerald-100 dark:border-emerald-800/20 backdrop-blur-sm" style={{ animationDelay: '0.2s' }}>
                                <h3 className="text-sm font-black uppercase tracking-widest text-emerald-800 dark:text-emerald-200 flex items-center gap-2">
                                    <Building2 size={14} /> Annuaire Établissements
                                </h3>

                                {/* Tabs */}
                                <div className="flex p-1 bg-emerald-100/50 dark:bg-emerald-900/30 rounded-xl">
                                    <button
                                        onClick={() => setDirectoryTab('clinics')}
                                        className={cn(
                                            "flex-1 py-2 text-xs font-bold rounded-lg transition-all",
                                            directoryTab === 'clinics' ? "bg-white dark:bg-emerald-800 text-emerald-700 dark:text-white shadow-sm" : "text-emerald-600/70 hover:bg-white/50"
                                        )}
                                    >
                                        CLINIQUES {clinics.length > 0 && `(${clinics.length})`}
                                    </button>
                                    <button
                                        onClick={() => setDirectoryTab('dentists')}
                                        className={cn(
                                            "flex-1 py-2 text-xs font-bold rounded-lg transition-all",
                                            directoryTab === 'dentists' ? "bg-white dark:bg-emerald-800 text-emerald-700 dark:text-white shadow-sm" : "text-emerald-600/70 hover:bg-white/50"
                                        )}
                                    >
                                        DENTISTES {dentists.length > 0 && `(${dentists.length})`}
                                    </button>
                                </div>

                                {/* Search */}
                                <div className="relative">
                                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-400" />
                                    <input
                                        type="text"
                                        placeholder={`Rechercher un ${directoryTab === 'clinics' ? 'hôpital' : 'dentiste'}...`}
                                        className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-white dark:bg-emerald-950/50 border border-emerald-100 dark:border-emerald-800/30 text-xs focus:ring-2 focus:ring-emerald-500 outline-none"
                                        value={dirSearch}
                                        onChange={(e) => setDirSearch(e.target.value)}
                                    />
                                </div>

                                {/* List Content */}
                                <div className="space-y-2 min-h-[200px]">
                                    {isLoadingDirectories ? (
                                        <div className="flex flex-col items-center justify-center py-10 gap-2 text-emerald-600/60">
                                            <Loader2 className="animate-spin" />
                                            <span className="text-xs">Chargement...</span>
                                        </div>
                                    ) : paginatedData.length === 0 ? (
                                        <div className="text-center py-10 text-emerald-600/50 text-xs italic">
                                            Aucun résultat trouvé
                                        </div>
                                    ) : (
                                        paginatedData.map((item) => (
                                            <div key={item.id} className="group bg-white dark:bg-emerald-900/20 p-4 rounded-2xl border border-emerald-100/50 dark:border-emerald-800/10 flex flex-col gap-3 hover:bg-emerald-50 dark:hover:bg-emerald-900/40 transition-all hover:shadow-md hover:scale-[1.01]">
                                                {/* Header & Info */}
                                                <div className="flex items-start gap-4">
                                                    <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-800/50 flex items-center justify-center shrink-0 text-emerald-600 dark:text-emerald-300 group-hover:scale-110 transition-transform">
                                                        {directoryTab === 'clinics' ? <Building2 size={20} /> : <Stethoscope size={20} />}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <h4 className="text-sm font-bold text-slate-900 dark:text-emerald-50 truncate leading-tight">{item.name}</h4>

                                                        {/* Location Display Logic */}
                                                        <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-emerald-200/60 mt-1">
                                                            <MapPin size={12} className="shrink-0" />
                                                            <span className="truncate">
                                                                {item.location?.address && item.location.address.length > 2
                                                                    ? item.location.address
                                                                    : (item.location?.city && item.location.city !== "Burkina Faso"
                                                                        ? item.location.city
                                                                        : `Zone GPS: ${item.location?.lat?.toFixed(3)}, ${item.location?.lng?.toFixed(3)}`)
                                                                }
                                                            </span>
                                                        </div>

                                                        <div className="flex gap-2 mt-1.5">
                                                            <span className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-emerald-100/50 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300">
                                                                {directoryTab === 'clinics' ? 'Clinique' : 'Dentiste'}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Actions */}
                                                <div className="flex gap-2 mt-1">
                                                    {item.phone && item.phone !== "NC" && item.phone.length > 3 ? (
                                                        <a
                                                            href={`tel:${item.phone}`}
                                                            className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-xs font-bold transition-all shadow-sm shadow-emerald-200 dark:shadow-none"
                                                        >
                                                            <Phone size={14} /> Appeler
                                                        </a>
                                                    ) : null}

                                                    <a
                                                        href={`https://www.google.com/maps/search/?api=1&query=${item.location?.lat},${item.location?.lng}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl bg-white border border-emerald-200 hover:bg-emerald-50 active:scale-95 text-emerald-700 text-xs font-bold transition-all dark:bg-emerald-950 dark:border-emerald-800 dark:text-emerald-300"
                                                    >
                                                        <MapPin size={14} /> Voir sur la carte
                                                    </a>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>

                                {/* Pagination */}
                                {totalPages > 1 && (
                                    <div className="flex items-center justify-between pt-2">
                                        <button
                                            disabled={dirPage === 1}
                                            onClick={() => setDirPage(p => Math.max(1, p - 1))}
                                            className="p-2 rounded-lg hover:bg-emerald-100/50 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
                                        >
                                            <ChevronLeft size={16} className="text-emerald-700" />
                                        </button>
                                        <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300">
                                            Page {dirPage} sur {totalPages}
                                        </span>
                                        <button
                                            disabled={dirPage === totalPages}
                                            onClick={() => setDirPage(p => Math.min(totalPages, p + 1))}
                                            className="p-2 rounded-lg hover:bg-emerald-100/50 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
                                        >
                                            <ChevronRight size={16} className="text-emerald-700" />
                                        </button>
                                    </div>
                                )}
                            </section>

                            {/* Section 2: Nutrition & Régimes */}
                            <section className="space-y-3 animate-cascade-in" style={{ animationDelay: '0.3s' }}>
                                <h3 className="text-sm font-black uppercase tracking-widest text-emerald-800 dark:text-emerald-200 flex items-center gap-2">
                                    <Apple size={14} className="animate-heartbeat" /> Nutrition & Régimes
                                </h3>
                                <div className="grid grid-cols-1 gap-3">
                                    {diets.map((diet, i) => (
                                        <div
                                            key={i}
                                            className={`p-4 rounded-2xl border flex items-center gap-4 transition-all hover:bg-white dark:hover:bg-white/5 cursor-pointer hover:shadow-lg hover:scale-[1.02] animate-breathe ${diet.bg} border-emerald-100 dark:border-emerald-800/30 dark:bg-transparent`}
                                            style={{ animationDelay: `${1 + i * 0.2}s` }}
                                        >
                                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center bg-white shadow-sm animate-pulse-glow ${diet.color}`}>
                                                <diet.icon size={24} className="animate-gentle-rotate" />
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

                            {/* Section 3: Pharmacie Naturelle */}
                            <section className="space-y-3 animate-cascade-in" style={{ animationDelay: '0.5s' }}>
                                <h3 className="text-sm font-black uppercase tracking-widest text-emerald-800 dark:text-emerald-200 flex items-center gap-2">
                                    <Coffee size={14} className="animate-pulse-glow" /> Pharmacie Naturelle
                                </h3>
                                <div className="grid grid-cols-2 gap-3">
                                    {foodRemedies.map((item, i) => (
                                        <div
                                            key={i}
                                            className="bg-white dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-800/20 p-3 rounded-2xl shadow-sm flex flex-col items-center text-center gap-2 hover:shadow-lg hover:scale-105 transition-all cursor-pointer animate-breathe hover:animate-glow-border"
                                            style={{ animationDelay: `${1.5 + i * 0.1}s` }}
                                        >
                                            <span className="text-3xl animate-in zoom-in duration-500" style={{ animationDelay: `${100 + i * 50}ms` }}>{item.icon}</span>
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
