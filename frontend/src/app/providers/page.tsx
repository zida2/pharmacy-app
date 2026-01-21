"use client";

import React, { useState, useEffect } from "react";
import { firebaseService } from "@/services/firebaseService";
import { HealthProvider } from "@/services/types";
import HealthProviderCard from "@/components/HealthProviderCard";
import BottomNav from "@/components/BottomNav";
import SearchBar from "@/components/SearchBar";
import { getUserLocation, calculateDistance, Coordinates } from "@/lib/geolocation";
import {
    MapPin, Filter, Activity, Stethoscope, ShoppingBag, ShieldCheck, Siren,
    Sparkles, Thermometer, CloudRain, Wind, ArrowRight, Zap, TrendingUp, BookOpen
} from "lucide-react";
import { cn } from "@/lib/utils";

// Start of Integrated HealthInsights Logic
// We integrate it directly to control styles better within the page context
function IntegratedHealthInsights() {
    const [activeIndex, setActiveIndex] = useState(0);
    const [selectedTip, setSelectedTip] = useState<any>(null);
    const [showAll, setShowAll] = useState(false);

    // Magazine Data hardcoded for reliability
    const magazineTips = [
        {
            category: "Évolution",
            title: "Le nouveau vaccin anti-paludique R21",
            desc: "Le Burkina Faso lance le déploiement national du vaccin R21/Matrix-M en 2025.",
            fullContent: "Le Burkina Faso marque une étape historique...",
            image: "🦟",
            color: "from-emerald-600 to-emerald-800 text-white",
            border: "border-emerald-500/30"
        },
        {
            category: "Alerte",
            title: "Dengue : Vigilance renforcée",
            desc: "L'épidémie persiste au Burkina. Apprenez à reconnaître les signes.",
            fullContent: "La dengue reste un défi majeur...",
            image: "🚨",
            color: "from-orange-600 to-orange-800 text-white",
            border: "border-orange-500/30"
        },
        {
            category: "Nutrition",
            title: "Le Moringa : L'Arbre Miracle",
            desc: "Riche en fer et vitamines, le Moringa est une arme contre la malnutrition.",
            fullContent: "Surnommé 'l'arbre miracle'...",
            image: "🌿",
            color: "from-green-600 to-green-800 text-white",
            border: "border-green-500/30"
        }
    ];

    // Auto rotate
    useEffect(() => {
        const timer = setInterval(() => {
            setActiveIndex((prev) => (prev + 1) % magazineTips.length);
        }, 5000);
        return () => clearInterval(timer);
    }, []);

    // Season Logic
    const month = new Date().getMonth();
    let advice = {
        title: "Énergie & Santé",
        desc: "Une alimentation équilibrée renforce votre système immunitaire.",
        icon: Activity,
        bg: "bg-blue-600 text-white",
        textColor: "text-white"
    };

    if (month <= 1 || month === 11) { // Harmattan
        advice = {
            title: "Alerte Harmattan",
            desc: "Le vent sec est présent. Protégez vos voies respiratoires.",
            icon: Wind,
            bg: "bg-blue-600 text-white",
            textColor: "text-white"
        };
    } else if (month >= 5 && month <= 9) { // Rain
        advice = {
            title: "Saison Pluvieuse",
            desc: "Humidité élevée. Attention aux moustiques.",
            icon: CloudRain,
            bg: "bg-emerald-600 text-white",
            textColor: "text-white"
        };
    }

    return (
        <div className="mb-8 space-y-4">
            {/* Seasonal Card - High Contrast */}
            <div className={cn("p-5 rounded-3xl shadow-lg relative overflow-hidden", advice.bg)}>
                <div className="absolute right-[-20px] top-[-20px] opacity-10">
                    <advice.icon size={100} />
                </div>
                <div className="relative z-10 flex gap-4 items-center">
                    <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center shrink-0 backdrop-blur-sm">
                        <advice.icon size={24} className="text-white" />
                    </div>
                    <div>
                        <h3 className="font-black text-white text-lg leading-tight mb-1">{advice.title}</h3>
                        <p className="text-white/90 text-sm font-medium leading-snug">{advice.desc}</p>
                    </div>
                </div>
            </div>

            {/* Magazine Slider - High Contrast Cards */}
            <div>
                <div className="flex justify-between items-center px-1 mb-2">
                    <h2 className="text-sm font-black text-foreground uppercase tracking-wider flex items-center gap-2">
                        <TrendingUp size={16} /> Magazine
                    </h2>
                </div>

                <div className="relative overflow-hidden">
                    <div
                        className="flex transition-transform duration-500"
                        style={{ transform: `translateX(-${activeIndex * 100}%)` }}
                    >
                        {magazineTips.map((tip, i) => (
                            <div key={i} className="min-w-full px-1">
                                <div className={cn("p-5 rounded-3xl bg-gradient-to-br shadow-md h-32 flex flex-col justify-between cursor-pointer", tip.color)}>
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <span className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-1 block">{tip.category}</span>
                                            <h3 className="font-bold text-lg leading-tight">{tip.title}</h3>
                                        </div>
                                        <span className="text-2xl">{tip.image}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-xs font-bold opacity-80">
                                        Lire l'article <ArrowRight size={12} />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="flex justify-center gap-1.5 mt-3">
                        {magazineTips.map((_, i) => (
                            <div key={i} className={cn("h-1.5 rounded-full transition-all", activeIndex === i ? "w-6 bg-primary" : "w-1.5 bg-zinc-300 dark:bg-zinc-700")} />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

// Modals
import AppointmentModal from "@/components/AppointmentModal";
import ReportModal from "@/components/ReportModal";

export default function ProvidersPage() {
    const [providers, setProviders] = useState<HealthProvider[]>([]);
    const [filteredProviders, setFilteredProviders] = useState<HealthProvider[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeFilter, setActiveFilter] = useState<string>("all");
    const [searchQuery, setSearchQuery] = useState("");
    const [userLocation, setUserLocation] = useState<Coordinates | null>(null);
    const [sosMode, setSosMode] = useState(false);

    // Modal States
    const [selectedProviderForBook, setSelectedProviderForBook] = useState<HealthProvider | null>(null);
    const [selectedProviderForReport, setSelectedProviderForReport] = useState<HealthProvider | null>(null);

    useEffect(() => {
        getUserLocation().then(coords => {
            setUserLocation(coords);
        });
        loadData();
    }, []);

    useEffect(() => {
        filterAndSortData();
    }, [activeFilter, searchQuery, providers, userLocation, sosMode]);

    const loadData = async () => {
        setLoading(true);
        try {
            const [pharmacies, clinics, dentists, insurances] = await Promise.all([
                firebaseService.getPharmacies(),
                firebaseService.getClinics(),
                firebaseService.getDentists(),
                firebaseService.getInsuranceProviders()
            ]);

            const all = [
                ...pharmacies.map(p => ({ ...p, type: 'pharmacy' as const })),
                ...clinics.map(c => ({ ...c, type: 'clinic' as const })),
                ...dentists.map(d => ({ ...d, type: 'dentist' as const })),
                ...insurances.map(i => ({ ...i, type: 'insurance' as const }))
            ];
            setProviders(all);
        } catch (error) {
            console.error("Failed to load providers", error);
        } finally {
            setLoading(false);
        }
    };

    const filterAndSortData = () => {
        let res = [...providers];

        if (sosMode) {
            res = res.filter(p =>
                p.status === 'guard' ||
                (p.type === 'clinic' && (p as any).hasEmergency) ||
                (p.type === 'hospital')
            );
        }
        else if (activeFilter !== "all") {
            res = res.filter(p => {
                if (activeFilter === 'clinic') return p.type === 'clinic' || p.type === 'hospital';
                return p.type === activeFilter;
            });
        }

        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            res = res.filter(p =>
                p.name.toLowerCase().includes(q) ||
                p.location.address?.toLowerCase().includes(q) ||
                p.location.city?.toLowerCase().includes(q)
            );
        }

        if (userLocation) {
            res = res.map(p => ({
                ...p,
                distance: calculateDistance(
                    userLocation,
                    { latitude: p.location.lat, longitude: p.location.lng }
                )
            })).sort((a, b) => (a.distance || 9999) - (b.distance || 9999));
        }

        setFilteredProviders(res);
    };

    const toggleSos = () => {
        setSosMode(!sosMode);
        if (!sosMode) {
            setActiveFilter("all");
            setSearchQuery("");
        }
    };

    return (
        <div className="min-h-screen bg-background pb-20">
            <main className="pt-8 px-4 max-w-md mx-auto">
                <div className="mb-6 flex justify-between items-end">
                    <div>
                        <h1 className="text-2xl font-black mb-1">Dossier Santé</h1>
                        <p className="text-zinc-500 text-sm">Écosystème médical complet BF</p>
                    </div>
                </div>

                {/* Focus Santé Integration */}
                <IntegratedHealthInsights />

                {/* SOS Button */}
                <button
                    onClick={toggleSos}
                    className={`
                        w-full mb-6 py-3 rounded-2xl flex items-center justify-center gap-2 font-black shadow-lg transition-all
                        ${sosMode
                            ? "bg-red-600 text-white shadow-red-500/30 scale-[1.02]"
                            : "bg-red-50 text-red-600 border border-red-100 hover:bg-red-100 dark:bg-red-900/10 dark:text-red-400 dark:border-red-900/30"}
                    `}
                >
                    <Siren className={sosMode ? "animate-pulse" : ""} />
                    {sosMode ? "MODE URGENCE ACTIVÉ" : "URGENCE / GARDE"}
                </button>

                {/* Search */}
                {!sosMode && (
                    <div className="mb-6">
                        <SearchBar
                            onSearch={(q) => setSearchQuery(q)}
                            placeholder="Rechercher clinique, docteur..."
                        />
                    </div>
                )}

                {/* Filters */}
                {!sosMode && (
                    <div className="flex gap-2 overflow-x-auto pb-4 no-scrollbar mb-2">
                        <FilterButton
                            active={activeFilter === 'all'}
                            onClick={() => setActiveFilter('all')}
                            label="Tous" icon={<Filter size={14} />}
                        />
                        <FilterButton
                            active={activeFilter === 'pharmacy'}
                            onClick={() => setActiveFilter('pharmacy')}
                            label="Pharmacies" icon={<ShoppingBag size={14} />}
                        />
                        <FilterButton
                            active={activeFilter === 'clinic'}
                            onClick={() => setActiveFilter('clinic')}
                            label="Cliniques" icon={<Activity size={14} />}
                        />
                        <FilterButton
                            active={activeFilter === 'dentist'}
                            onClick={() => setActiveFilter('dentist')}
                            label="Dentistes" icon={<Stethoscope size={14} />}
                        />
                        <FilterButton
                            active={activeFilter === 'insurance'}
                            onClick={() => setActiveFilter('insurance')}
                            label="Assurances" icon={<ShieldCheck size={14} />}
                        />
                    </div>
                )}

                {/* Count & Location Status */}
                <div className="flex justify-between items-center mb-4">
                    <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest">{filteredProviders.length} RÉSULTATS</span>
                    <div className="flex items-center gap-1.5 bg-primary/5 px-2 py-1 rounded-full">
                        <MapPin size={10} className={userLocation ? "text-green-500" : "text-zinc-400"} />
                        <span className="text-[10px] font-bold text-primary">
                            {userLocation ? "GPS ACTIF" : "GPS INACTIF"}
                        </span>
                    </div>
                </div>

                {/* List */}
                {loading ? (
                    <div className="flex flex-col gap-4">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="h-32 bg-secondary/50 rounded-3xl animate-pulse" />
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col gap-4">
                        {filteredProviders.length > 0 ? (
                            filteredProviders.map(provider => (
                                <HealthProviderCard
                                    key={provider.id}
                                    provider={provider}
                                    onBook={() => setSelectedProviderForBook(provider)}
                                    onReport={() => setSelectedProviderForReport(provider)}
                                />
                            ))
                        ) : (
                            <div className="text-center py-10 text-zinc-500">
                                <p>Aucun résultat trouvé.</p>
                                {sosMode && <button onClick={toggleSos} className="text-primary text-sm font-bold mt-2">Désactiver Urgence</button>}
                            </div>
                        )}
                    </div>
                )}
            </main>

            <BottomNav />

            {/* Modals */}
            {selectedProviderForBook && (
                <AppointmentModal
                    provider={selectedProviderForBook}
                    onClose={() => setSelectedProviderForBook(null)}
                />
            )}
            {selectedProviderForReport && (
                <ReportModal
                    provider={selectedProviderForReport}
                    onClose={() => setSelectedProviderForReport(null)}
                />
            )}
        </div>
    );
}

function FilterButton({ active, onClick, label, icon }: any) {
    return (
        <button
            onClick={onClick}
            className={`
                flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all
                ${active
                    ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25 scale-105"
                    : "bg-surface border border-border/50 text-zinc-500 hover:bg-secondary"}
            `}
        >
            {icon}
            {label}
        </button>
    );
}
