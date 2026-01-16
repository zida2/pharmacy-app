"use client";

import React, { useState, useEffect, Suspense, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Map from "@/components/Map";
import { firebaseService } from "@/services/firebaseService";
import { Pharmacy } from "@/services/types";
import { ArrowLeft, Navigation as NavigationIcon, MapPin, X, Search, Layers, Clock, Camera, SortAsc, Zap, ChevronRight, Target, Locate, ShieldAlert, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import AssistanceModal from "@/components/AssistanceModal";

// Nominatim Geocoding Response Type
interface GeocodingResult {
    lat: string;
    lon: string;
    display_name: string;
}

export default function MapPage() {
    return (
        <Suspense fallback={<div className="p-4 flex h-screen items-center justify-center bg-background"><div className="animate-spin text-primary">↻</div></div>}>
            <MapContent />
        </Suspense>
    );
}

function MapContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const initialQuery = searchParams.get("q") || "";

    // Product Search State
    const [productQuery, setProductQuery] = useState(initialQuery);
    const [sortBy, setSortBy] = useState<"distance" | "price">("distance");

    // Pharmacy Data
    interface PharmacyDisplay extends Pharmacy {
        distance?: number;
        foundProductPrice?: number;
        inStock?: boolean;
    }

    const [pharmacies, setPharmacies] = useState<PharmacyDisplay[]>([]);
    const [selectedPharmacy, setSelectedPharmacy] = useState<Pharmacy | null>(null);
    const [transportMode, setTransportMode] = useState<"walking" | "motorcycle" | "car">("motorcycle");

    // Localization & Routing state
    const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
    const [permissionStatus, setPermissionStatus] = useState<"prompt" | "granted" | "denied">("prompt");
    const [isLocating, setIsLocating] = useState(false);
    const [destinationCoords, setDestinationCoords] = useState<[number, number] | null>(null);
    const [isScanning, setIsScanning] = useState(false);
    const [isMinimized, setIsMinimized] = useState(false);

    // Location Search State
    const [locationQuery, setLocationQuery] = useState("");
    const [isSearchingLocation, setIsSearchingLocation] = useState(false);
    const [searchMarkerPos, setSearchMarkerPos] = useState<[number, number] | null>(null);
    const [mapView, setMapView] = useState<{ center: [number, number], zoom: number, pitch: number }>({
        center: [-1.5197, 12.3714], // Default Ouaga
        zoom: 13,
        pitch: 0
    });
    const [showFullList, setShowFullList] = useState(false);
    const [showAssistance, setShowAssistance] = useState(false);

    // 1. Initial Load & Background Location Tracking
    useEffect(() => {
        let watchId: number | null = null;

        if ("geolocation" in navigator) {
            watchId = navigator.geolocation.watchPosition(
                (position) => {
                    const { longitude, latitude } = position.coords;
                    setUserLocation([longitude, latitude]);
                    setPermissionStatus("granted");
                },
                (error) => {
                    console.warn("Background location error:", error);
                },
                { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
            );
        }

        const handleSelect = (e: any) => {
            setSelectedPharmacy(e.detail);
        };

        window.addEventListener('pharmacySelected', handleSelect);
        return () => {
            if (watchId !== null) navigator.geolocation.clearWatch(watchId);
            window.removeEventListener('pharmacySelected', handleSelect);
        };
    }, []);

    // 2. Load Pharmacies when location or search changes
    useEffect(() => {
        loadPharmacies();
    }, [userLocation, productQuery, sortBy]);

    const requestLocation = (silent = false) => {
        if (!silent) setIsLocating(true);

        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { longitude, latitude } = position.coords;
                    const newPos: [number, number] = [longitude, latitude];
                    setUserLocation(newPos);
                    setMapView({ center: newPos, zoom: 15, pitch: 0 });
                    setIsLocating(false);
                },
                (error) => {
                    if (!silent) alert("Pardon, activez votre GPS.");
                    setIsLocating(false);
                },
                { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
            );
        }
    };

    const loadPharmacies = async () => {
        // center coordinate mapping
        const center = userLocation || [-1.5197, 12.3714];

        const data = await firebaseService.searchMedicines(
            productQuery,
            { latitude: center[1], longitude: center[0] }
        );

        let pharms: PharmacyDisplay[] = data.map(r => ({
            ...r.pharmacy,
            foundProductPrice: r.product?.price,
            inStock: r.product?.inStock
        }));

        // Distance & Sort
        pharms.sort((a, b) => (a.distance || 0) - (b.distance || 0));
        if (sortBy === 'price') {
            pharms.sort((a, b) => (a.foundProductPrice || 99999) - (b.foundProductPrice || 99999));
        }

        setPharmacies(pharms);
    };

    const handleScan = () => {
        setIsScanning(true);
        setTimeout(() => {
            setIsScanning(false);
            setProductQuery("Paracétamol");
        }, 2500);
    };

    const getEstimatedTime = (distance: number, durationSeconds?: number) => {
        if (!distance) return "--";
        if (durationSeconds) {
            const mins = Math.round(durationSeconds / 60);
            return mins < 60 ? `${mins} min` : `${Math.floor(mins / 60)}h ${mins % 60}min`;
        }
        const speed = transportMode === "walking" ? 5 : transportMode === "motorcycle" ? 35 : 25;
        const mins = Math.round((distance / speed) * 60 + 2); // +2 for buffers
        return mins < 60 ? `${mins} min` : `${Math.floor(mins / 60)}h ${mins % 60}min`;
    };

    // State for real road info
    const [roadInfo, setRoadInfo] = useState<{ distance: number, duration: number } | null>(null);

    // Fetch real road distance when selection or transport mode changes
    useEffect(() => {
        if (selectedPharmacy?.location?.lng && selectedPharmacy?.location?.lat && userLocation) {
            const profile = transportMode === 'walking' ? 'foot' : 'driving';
            fetch(`https://router.project-osrm.org/route/v1/${profile}/${userLocation[0]},${userLocation[1]};${selectedPharmacy.location.lng},${selectedPharmacy.location.lat}?overview=false`)
                .then(res => res.json())
                .then(data => {
                    if (data.routes && data.routes[0]) {
                        setRoadInfo({
                            distance: data.routes[0].distance / 1000, // meters to km
                            duration: data.routes[0].duration
                        });
                    }
                })
                .catch(err => console.error("Road distance error:", err));
        } else {
            setRoadInfo(null);
        }
    }, [selectedPharmacy, transportMode, userLocation]);

    const handleLocationSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!locationQuery.trim()) return;

        setIsSearchingLocation(true);
        try {
            const searchQuery = `${locationQuery}, Burkina Faso`;
            const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&countrycodes=bf&limit=1`);
            const data: GeocodingResult[] = await response.json();

            if (data && data.length > 0) {
                const { lat, lon } = data[0];
                const newCenter: [number, number] = [parseFloat(lon), parseFloat(lat)];
                setSearchMarkerPos(newCenter);
                setMapView({ center: newCenter, zoom: 16, pitch: 45 });
                loadPharmacies();
            } else {
                alert("Lieu introuvable au Burkina.");
            }
        } catch (error) {
            console.error(error);
        } finally {
            setIsSearchingLocation(false);
        }
    };

    return (
        <main className="relative w-full h-screen overflow-hidden bg-zinc-950">
            <AssistanceModal
                isOpen={showAssistance}
                onClose={() => setShowAssistance(false)}
            />
            {/* --- TOP HUD (AÉRÉ & STRUCTURÉ) --- */}
            <div className="absolute top-0 left-0 right-0 z-30 p-4 pt-10 pointer-events-none">
                <div className="max-w-xl mx-auto space-y-3">
                    {/* Header Row: Back + Search + Scan */}
                    <div className="flex items-center gap-2 pointer-events-auto">
                        <button
                            onClick={() => router.back()}
                            className="flex-shrink-0 w-10 h-10 flex items-center justify-center bg-white rounded-xl shadow-xl border border-zinc-200 text-zinc-900 active:scale-90 transition-transform"
                        >
                            <ArrowLeft size={20} />
                        </button>

                        <div className="flex-1 relative group">
                            <div className="absolute inset-y-0 left-3.5 flex items-center text-primary">
                                <Search size={18} />
                            </div>
                            <input
                                type="text"
                                value={productQuery}
                                onChange={(e) => setProductQuery(e.target.value)}
                                placeholder="Recherche..."
                                className="w-full h-10 pl-11 pr-4 bg-white border border-zinc-200 rounded-xl shadow-xl text-zinc-900 focus:ring-2 focus:ring-primary/50 outline-none transition-all placeholder:text-zinc-400 text-[10px] font-black uppercase tracking-widest"
                            />
                        </div>

                        <button
                            onClick={handleScan}
                            className="flex-shrink-0 w-10 h-10 flex items-center justify-center bg-primary rounded-xl shadow-xl shadow-primary/20 text-white active:scale-90 transition-transform"
                        >
                            <Camera size={20} />
                        </button>
                    </div>

                    {/* Secondary Row: Quick Filters (Better Spacing) */}
                    <div className="flex items-center gap-2 pointer-events-auto">
                        <button
                            onClick={() => setSortBy('distance')}
                            className={cn(
                                "flex items-center gap-2 px-3 h-8 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all shadow-md border",
                                sortBy === 'distance' ? "bg-primary text-white border-primary" : "bg-white text-zinc-600 border-zinc-200"
                            )}
                        >
                            <Locate size={12} /> Proche
                        </button>
                        <button
                            onClick={() => setSortBy('price')}
                            className={cn(
                                "flex items-center gap-2 px-3 h-8 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all shadow-md border",
                                sortBy === 'price' ? "bg-emerald-600 text-white border-emerald-500" : "bg-white text-zinc-600 border-zinc-200"
                            )}
                        >
                            <Zap size={12} /> Moins Cher
                        </button>

                        <div className="hidden sm:flex flex-1" />

                        <div className="px-3 h-8 flex items-center bg-zinc-900 border border-zinc-800 text-[8px] font-black text-white/90 rounded-lg uppercase tracking-widest">
                            {pharmacies.length} DISPONIBLES
                        </div>
                    </div>
                </div>
            </div>

            {/* --- MAP CANVAS --- */}
            <div className="absolute inset-0 z-0">
                <Map
                    pharmacies={pharmacies}
                    userLocation={userLocation}
                    searchLocation={searchMarkerPos}
                    destination={destinationCoords}
                    initialCenter={mapView.center}
                    initialZoom={mapView.zoom}
                    initialPitch={mapView.pitch}
                    transportMode={transportMode}
                    className="w-full h-full border-none rounded-none"
                />
            </div>

            {/* --- SIDEBAR TOOLS --- */}
            <div className="absolute right-4 top-[40%] -translate-y-1/2 z-30 flex flex-col gap-2.5">
                <button
                    onClick={() => setShowAssistance(true)}
                    className="w-10 h-10 flex items-center justify-center bg-red-500 text-white rounded-xl shadow-xl animate-pulse shadow-red-500/20 active:scale-95 transition-all"
                >
                    <AlertTriangle size={24} />
                </button>
                <button
                    onClick={() => requestLocation()}
                    className={cn(
                        "w-10 h-10 flex items-center justify-center rounded-xl shadow-xl transition-all active:scale-95 border",
                        isLocating ? "bg-primary text-white" : "bg-white text-primary border-zinc-200"
                    )}
                >
                    <Target size={22} />
                </button>
                <button
                    onClick={() => setMapView(p => ({ ...p, pitch: p.pitch === 60 ? 0 : 60 }))}
                    className="w-10 h-10 flex items-center justify-center bg-white text-zinc-600 rounded-xl shadow-xl border border-zinc-200 active:scale-95 transition-all"
                >
                    <Layers size={21} />
                </button>
            </div>

            {/* --- BOTTOM SHEET (LIFTED FURTHER FOR NAVIGATION BAR) --- */}
            <div className="absolute bottom-[125px] left-0 right-0 z-30 p-4 pointer-events-none">
                <div className="max-w-xl mx-auto pointer-events-auto">

                    {selectedPharmacy ? (
                        /* Selected Pharmacy Panel */
                        <div className="bg-white rounded-[2.5rem] p-6 shadow-2xl border border-zinc-100 animate-in slide-in-from-bottom-20 duration-500">
                            <div className="flex justify-between items-start mb-6">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                        <span className={cn("px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-tighter",
                                            selectedPharmacy.status === 'guard' ? "bg-primary text-white" : "bg-emerald-500 text-white"
                                        )}>
                                            {selectedPharmacy.status === 'guard' ? 'Garde' : 'Ouvert'}
                                        </span>
                                        <h3 className="text-xl font-black italic text-black tracking-tight">{selectedPharmacy.name}</h3>
                                    </div>
                                    <p className="text-xs text-zinc-600 flex items-center gap-1">
                                        <MapPin size={12} className="text-primary" /> {selectedPharmacy.location?.address || 'Localisation disponible'}
                                    </p>
                                </div>
                                <button onClick={() => setSelectedPharmacy(null)} className="p-2 bg-zinc-100 rounded-full text-zinc-600">
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="grid grid-cols-2 gap-3 mb-6">
                                <div className="p-4 bg-zinc-50 rounded-3xl border border-zinc-100">
                                    <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest block mb-1">{roadInfo ? "Distance Route" : "Vol d'oiseau"}</span>
                                    <div className="flex items-baseline gap-1">
                                        <span className="text-2xl font-black text-primary italic">{(roadInfo?.distance || selectedPharmacy.distance || 0).toFixed(1)}</span>
                                        <span className="text-[10px] font-bold text-zinc-400">KM</span>
                                    </div>
                                </div>
                                <div className="p-4 bg-zinc-50 rounded-3xl border border-zinc-100">
                                    <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest block mb-1">Estimation Trajet</span>
                                    <div className="flex items-baseline gap-1">
                                        <span className="text-2xl font-black text-foreground italic">{getEstimatedTime(roadInfo?.distance || selectedPharmacy.distance || 0, roadInfo?.duration)}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <button
                                    onClick={() => {
                                        if (selectedPharmacy?.location) {
                                            const { lat, lng } = selectedPharmacy.location;
                                            // Ouvrir Google Maps avec la destination
                                            window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`, '_blank');
                                        }
                                    }}
                                    className="flex-[2] h-14 bg-primary text-white font-black rounded-2xl shadow-xl shadow-primary/20 flex items-center justify-center gap-3 uppercase tracking-widest text-xs active:scale-95 transition-transform"
                                >
                                    <NavigationIcon size={20} fill="currentColor" /> Itinéraire
                                </button>
                                <button
                                    onClick={() => router.push(`/pharmacy?id=${selectedPharmacy.id}`)}
                                    className="flex-1 h-14 bg-secondary text-foreground font-black rounded-2xl active:scale-95 transition-all text-xs uppercase tracking-widest"
                                >
                                    Fiche
                                </button>
                            </div>
                        </div>
                    ) : (
                        /* Horizontal Pharmacy List */
                        <div className="space-y-4">
                            <div className="flex items-center justify-between px-2">
                                <div className="bg-zinc-900/80 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/5 flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />
                                    <span className="text-[9px] font-black uppercase tracking-widest text-white">À proximité</span>
                                </div>
                                <button onClick={() => setShowFullList(true)} className="text-[10px] font-black uppercase text-primary tracking-widest hover:underline">
                                    Voir Tout →
                                </button>
                            </div>

                            <div className="flex gap-3 overflow-x-auto pb-4 px-1 scrollbar-hide snap-x">
                                {pharmacies.slice(0, 6).map((p) => (
                                    <div
                                        key={p.id}
                                        onClick={() => {
                                            setSelectedPharmacy(p);
                                            setMapView({ center: [p.location.lng, p.location.lat], zoom: 16, pitch: 45 });
                                        }}
                                        className="min-w-[210px] bg-white rounded-2xl p-3 shadow-xl border border-zinc-200 snap-center active:scale-95 transition-all outline-none"
                                    >
                                        <div className="flex justify-between items-start mb-1.5">
                                            <div className={cn("w-7 h-7 rounded-lg flex items-center justify-center text-xs",
                                                p.status === 'guard' ? "bg-primary/10" : "bg-emerald-500/10"
                                            )}>
                                                {p.status === 'guard' ? '🟣' : '🟢'}
                                            </div>
                                            <span className="text-[9px] font-black text-primary px-2 py-0.5 bg-primary/10 rounded-md italic">
                                                {p.distance?.toFixed(1)} KM
                                            </span>
                                        </div>
                                        <h4 className="font-black text-sm text-zinc-900 truncate mb-1 italic">{p.name}</h4>
                                        <div className="flex items-center justify-between text-[9px] text-zinc-500 font-black">
                                            <span className="flex items-center gap-1 italic uppercase tracking-tighter">
                                                <Clock size={10} /> {getEstimatedTime(p.distance || 0)}
                                            </span>
                                            {p.foundProductPrice && (
                                                <span className="text-emerald-500">{p.foundProductPrice} FCFA</span>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* --- SCANNER OVERLAY (Existing) --- */}
            {isScanning && (
                <div className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center animate-in fade-in duration-300">
                    <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1576602976047-174e57a47881?auto=format&fit=crop&q=80')] bg-cover bg-center opacity-40"></div>
                    <div className="relative z-10 w-full h-full flex flex-col items-center justify-between p-8 pt-safe pb-safe">
                        <h2 className="text-white text-xl font-black italic tracking-tighter bg-black/40 px-6 py-3 rounded-2xl border border-white/10 backdrop-blur-md">Analyse de l'ordonnance...</h2>
                        <div className="w-64 h-64 border-2 border-primary rounded-[2.5rem] relative overflow-hidden flex items-center justify-center">
                            <div className="absolute inset-x-0 h-1 bg-primary shadow-[0_0_20px_primary] animate-[bounce_2s_infinite]" />
                            <Zap size={48} className="text-primary/20" />
                        </div>
                        <div className="w-16 h-16 rounded-full border-4 border-white/30 animate-pulse" />
                    </div>
                </div>
            )}

            {/* FULL LIST MODAL (Optimisée) */}
            {showFullList && (
                <div className="fixed inset-0 z-[100] bg-background animate-in slide-in-from-bottom duration-500 flex flex-col">
                    <div className="p-8 border-b border-white/5 flex items-center justify-between bg-card/50 backdrop-blur-xl">
                        <div className="flex items-center gap-4">
                            <button onClick={() => setShowFullList(false)} className="w-12 h-12 flex items-center justify-center bg-secondary rounded-2xl">
                                <X size={24} />
                            </button>
                            <div>
                                <h2 className="text-2xl font-black italic tracking-tighter">Liste des Pharmacies</h2>
                                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">{pharmacies.length} pharmacies de garde trouvées</p>
                            </div>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-6 space-y-4">
                        {pharmacies.map((p) => (
                            <div
                                key={p.id}
                                onClick={() => {
                                    setSelectedPharmacy(p);
                                    setMapView({ center: [p.location.lng, p.location.lat], zoom: 16, pitch: 45 });
                                    setShowFullList(false);
                                }}
                                className="p-6 bg-white border border-zinc-200 rounded-3xl flex items-center justify-between group active:scale-[0.98] transition-all"
                            >
                                <div className="flex items-center gap-5">
                                    <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center text-2xl",
                                        p.status === 'guard' ? "bg-primary/10" : "bg-emerald-500/10"
                                    )}>
                                        {p.status === 'guard' ? '🟣' : '🟢'}
                                    </div>
                                    <div className="space-y-1">
                                        <h4 className="font-black text-lg italic text-black tracking-tight group-hover:text-primary transition-colors">{p.name}</h4>
                                        <div className="flex gap-2">
                                            <span className="text-[9px] font-black px-2 py-1 bg-zinc-900 rounded-lg text-muted-foreground uppercase">{p.distance?.toFixed(1)} KM</span>
                                            <span className="text-[9px] font-black px-2 py-1 bg-zinc-900 rounded-lg text-muted-foreground uppercase">{getEstimatedTime(p.distance || 0)}</span>
                                        </div>
                                    </div>
                                </div>
                                <ChevronRight size={20} className="text-muted-foreground/30 group-hover:text-primary" />
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </main>
    );
}
