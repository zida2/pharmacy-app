"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Map from "@/components/Map";
import { firebaseService } from "@/services/firebaseService";
import { Pharmacy } from "@/services/types";
import { ArrowLeft, Navigation as NavigationIcon, MapPin, X, Search, Layers, Clock, Camera, Filter, SortAsc, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

// Nominatim Geocoding Response Type
interface GeocodingResult {
    lat: string;
    lon: string;
    display_name: string;
}

export default function MapPage() {
    return (
        <Suspense fallback={<div className="p-4">Chargement...</div>}>
            <MapContent />
        </Suspense>
    );
}

function MapContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const query = searchParams.get("q") || "";

    // Product Search State
    const [productQuery, setProductQuery] = useState("");
    const [sortBy, setSortBy] = useState<"distance" | "price">("distance");

    // Augmented Pharmacy for display
    interface PharmacyDisplay extends Pharmacy {
        distance?: number;
        foundProductPrice?: number;
        inStock?: boolean;
    }

    const [pharmacies, setPharmacies] = useState<PharmacyDisplay[]>([]);
    const [selectedPharmacy, setSelectedPharmacy] = useState<Pharmacy | null>(null);
    const [transportMode, setTransportMode] = useState<"walking" | "motorcycle" | "car">("walking");

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
        zoom: 12,
        pitch: 0
    });

    useEffect(() => {
        // 1. Try to get location automatically on mount
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { longitude, latitude } = position.coords;
                    setUserLocation([longitude, latitude]);
                    setPermissionStatus("granted");
                    // Assuming map auto-updates center via other effects or pass userLocation to Map
                },
                (err) => {
                    // Silent fail: User will see the "Enable Location" prompt UI if this fails/times out
                    console.log("Auto-location check:", err.message);
                },
                { timeout: 5000, maximumAge: 60000 }
            );
        }

        // 2. Load pharmacies (initially with default or null location, will update when userLocation changes)
        loadPharmacies();

        const handleSelect = (e: any) => {
            setSelectedPharmacy(e.detail);
        };

        window.addEventListener('pharmacySelected', handleSelect);
        return () => window.removeEventListener('pharmacySelected', handleSelect);
    }, [query]); // Removed userLocation from dependency to avoid loop, loadPharmacies handles it via internal reference or re-calls

    // 3. React to user location updates
    useEffect(() => {
        if (userLocation) {
            loadPharmacies(userLocation);
            // Optional: Center map on user if no manual search is active
            if (!locationQuery) {
                setMapView(prev => ({ ...prev, center: userLocation, zoom: 14 }));
            }
        }
    }, [userLocation]);

    const requestLocation = () => {
        setIsLocating(true);
        if (!navigator.geolocation) {
            alert("La géolocalisation n'est pas supportée par votre navigateur.");
            setPermissionStatus("denied");
            setIsLocating(false);
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { longitude, latitude } = position.coords;
                setUserLocation([longitude, latitude]);
                setPermissionStatus("granted");
                setIsLocating(false);
            },
            (error) => {
                console.error("Location error:", error);
                setPermissionStatus("denied");
                setIsLocating(false);
                alert("Impossible d'accéder à votre position. Veuillez l'autoriser dans vos paramètres.");
            },
            { enableHighAccuracy: true }
        );
    };

    const loadPharmacies = async (centerOverride?: [number, number]) => {
        const center = centerOverride || userLocation;
        // Use productQuery if available, otherwise just location search
        const term = productQuery || query;

        // Pass coordinates to search service
        const data = await firebaseService.searchMedicines(term, center ? { latitude: center[1], longitude: center[0] } : undefined);

        let pharms: PharmacyDisplay[] = data.map(r => ({
            ...r.pharmacy,
            foundProductPrice: r.product?.price,
            inStock: r.product?.inStock
        }));

        // Calculate distance relative to View Center
        if (center) {
            pharms = pharms.map(p => {
                const d = calculateDistance(center[1], center[0], p.location.lat, p.location.lng);
                return { ...p, distance: d };
            });
        }

        // Sort based on user preference
        if (sortBy === 'price' && productQuery) {
            pharms.sort((a, b) => (a.foundProductPrice || 99999) - (b.foundProductPrice || 99999));
        } else {
            pharms.sort((a, b) => (a.distance || 0) - (b.distance || 0));
        }

        setPharmacies(pharms);
    };

    // Re-load when productQuery or sortBy changes
    useEffect(() => {
        // Debounce search slightly or just reload
        const timer = setTimeout(() => {
            if (mapView.center) loadPharmacies(mapView.center);
        }, 500);
        return () => clearTimeout(timer);
    }, [productQuery, sortBy]);

    const handleScan = () => {
        setIsScanning(true);
        // Simulate a 3-second scan process
        setTimeout(() => {
            setIsScanning(false);
            setProductQuery("Amoxicilline 500mg");
            // Optional: Auto-trigger search here if desired
        }, 3000);
    };

    // Haversine formula for distance
    const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
        const R = 6371; // Radius of the earth in km
        const dLat = deg2rad(lat2 - lat1);
        const dLon = deg2rad(lon2 - lon1);
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c; // Distance in km
    };

    const deg2rad = (deg: number) => deg * (Math.PI / 180);

    const getEstimatedTime = (distance: number) => {
        if (!distance) return "N/A";
        const speed = transportMode === "walking" ? 5 : transportMode === "motorcycle" ? 40 : 30;
        const hours = distance / speed;
        const minutes = Math.round(hours * 60);
        return minutes < 60 ? `${minutes} min` : `${Math.floor(minutes / 60)}h ${minutes % 60}min`;
    };

    const handleLocationSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!locationQuery.trim()) return;

        setIsSearchingLocation(true);
        try {
            // Enhanced Search: Append "Burkina Faso" and use viewbox for Burkina Faso to prioritize local results
            // Viewbox: West,South,East,North (-5.5,9.4,2.4,15.1)
            const searchQuery = locationQuery.toLowerCase().includes("burkina") ? locationQuery : `${locationQuery}, Burkina Faso`;
            const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&countrycodes=bf&viewbox=-5.5,15.1,2.4,9.4&bounded=1&limit=1`);
            const data: GeocodingResult[] = await response.json();

            if (data && data.length > 0) {
                const { lat, lon } = data[0];
                const newCenter: [number, number] = [parseFloat(lon), parseFloat(lat)];
                setSearchMarkerPos(newCenter);

                // Update map view to "3D Relief Mode" focused on the location
                setMapView({
                    center: newCenter,
                    zoom: 15.5, // Close zoom
                    pitch: 60, // High pitch for 3D effect
                });

                // Reload pharmacies around this new location to show what's nearby
                loadPharmacies(newCenter);

            } else {
                alert("Lieu introuvable. Essayez avec le nom d'une ville ou d'un quartier connu.");
            }
        } catch (error) {
            console.error("Geocoding error:", error);
            alert("Erreur de recherche. Vérifiez votre connexion.");
        } finally {
            setIsSearchingLocation(false);
        }
    };

    return (
        <main className="relative w-full h-screen overflow-hidden bg-background">
            {/* Header / Search Bar */}
            <div className="absolute top-0 left-0 right-0 z-30 p-4 pt-safe space-y-2">
                {/* Location Search + Back Button Row */}
                <div className="flex gap-2">
                    <button
                        onClick={() => router.back()}
                        className="p-3 bg-white/95 dark:bg-zinc-900/95 rounded-2xl shadow-xl border border-black/5 dark:border-white/10 active:scale-95 transition-transform"
                    >
                        <ArrowLeft className="w-5 h-5 text-foreground" />
                    </button>

                    <form onSubmit={handleLocationSearch} className="flex-1 relative shadow-xl">
                        <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                            <MapPin className="text-primary w-5 h-5" />
                        </div>
                        <input
                            type="search"
                            placeholder="Quartier, Ville (ex: Tampouy)..."
                            className="w-full pl-10 pr-12 py-3 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md rounded-2xl shadow-sm border border-black/5 dark:border-white/10 text-foreground text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                            value={locationQuery}
                            onChange={(e) => setLocationQuery(e.target.value)}
                        />
                        <button type="submit" className="absolute inset-y-0 right-3 flex items-center text-primary">
                            {isSearchingLocation ? <div className="animate-spin text-lg">↻</div> : <Search size={20} />}
                        </button>
                    </form>
                </div>

                {/* Product Search & Scan Row */}
                <div className="flex gap-2">
                    <div className="relative flex-1 shadow-xl">
                        <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                            <Search className="text-muted-foreground w-4 h-4" />
                        </div>
                        <input
                            type="search"
                            placeholder="Médicament (ex: Doliprane)..."
                            className="w-full pl-10 pr-4 py-3 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md rounded-2xl shadow-sm border border-black/5 dark:border-white/10 text-foreground text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/50"
                            value={productQuery}
                            onChange={(e) => setProductQuery(e.target.value)}
                        />
                    </div>
                    <button
                        onClick={handleScan}
                        className="bg-white/95 dark:bg-zinc-900/95 p-3 px-4 rounded-2xl shadow-xl border border-black/5 dark:border-white/10 text-primary active:scale-95 transition-transform flex items-center gap-2"
                        title="Scanner une ordonnance"
                    >
                        <Camera size={20} />
                    </button>
                </div>

                {/* Filters Row (Only visible if searching product) */}
                <div className="flex items-center justify-between">
                    {productQuery ? (
                        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                            <button
                                onClick={() => setSortBy('distance')}
                                className={cn(
                                    "px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1 transition-colors shadow-lg backdrop-blur-md",
                                    sortBy === 'distance' ? "bg-primary text-white" : "bg-white/90 dark:bg-zinc-900/90 text-foreground"
                                )}
                            >
                                <MapPin size={12} /> Proximité
                            </button>
                            <button
                                onClick={() => setSortBy('price')}
                                className={cn(
                                    "px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1 transition-colors shadow-lg backdrop-blur-md",
                                    sortBy === 'price' ? "bg-emerald-500 text-white" : "bg-white/90 dark:bg-zinc-900/90 text-foreground"
                                )}
                            >
                                <SortAsc size={12} /> Moins cher
                            </button>
                        </div>
                    ) : (
                        <div className="text-[10px] font-black uppercase tracking-widest text-primary/80 drop-shadow-md bg-white/50 px-2 py-1 rounded-lg backdrop-blur-sm">
                            {pharmacies.length} pharmacies trouvées
                        </div>
                    )}

                    {/* 3D button kept here but moved slightly */}
                    <button
                        onClick={() => setMapView(prev => ({ ...prev, pitch: prev.pitch === 0 ? 60 : 0, zoom: prev.pitch === 0 ? 15 : 12 }))}
                        className={cn("p-2 rounded-xl border transition-all shadow-lg ml-auto", mapView.pitch > 0 ? "bg-primary text-white border-primary" : "bg-white/90 dark:bg-zinc-900/90 border-transparent text-muted-foreground")}
                        title="Basculer vue 3D"
                    >
                        <Layers size={20} />
                    </button>
                </div>
            </div>

            {/* Map */}
            <div className="w-full h-full grayscale-[0.2] brightness-[0.95]">
                <Map
                    className="rounded-none border-none shadow-none"
                    pharmacies={pharmacies}
                    userLocation={userLocation}
                    searchLocation={searchMarkerPos}
                    destination={destinationCoords}
                    initialCenter={mapView.center} // Modified from fixed state
                    initialZoom={mapView.zoom} // Modified from fixed state
                    initialPitch={mapView.pitch} // Added 3D pitch
                />
            </div>

            {/* SCANNER OVERLAY */}
            {isScanning && (
                <div className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center animate-in fade-in duration-300">
                    {/* Camera Feed Simulation */}
                    <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1576602976047-174e57a47881?auto=format&fit=crop&q=80')] bg-cover bg-center opacity-40"></div>
                    <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/60"></div>

                    {/* Overlay UI */}
                    <div className="relative z-10 w-full h-full flex flex-col items-center justify-between p-8 pt-safe pb-safe">
                        <div className="w-full flex justify-between items-center text-white">
                            <button onClick={() => setIsScanning(false)} className="p-3 bg-black/40 rounded-full backdrop-blur-md active:scale-95 transition-transform">
                                <X size={24} />
                            </button>
                            <div className="px-4 py-1.5 bg-black/40 rounded-full backdrop-blur-md text-xs font-bold uppercase tracking-widest flex items-center gap-2 border border-white/10">
                                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse shadow-[0_0_10px_red]"></div>
                                Analyse en cours
                            </div>
                            <button className="p-3 bg-black/40 rounded-full backdrop-blur-md active:scale-95 transition-transform">
                                <Zap size={24} className="text-white" />
                            </button>
                        </div>

                        {/* Scanner Frame */}
                        <div className="w-72 h-72 border-2 border-primary/50 rounded-[2rem] relative overflow-hidden shadow-[0_0_100px_rgba(34,197,94,0.2)]">
                            <div className="absolute top-0 left-0 w-full h-0.5 bg-primary/80 shadow-[0_0_20px_rgba(34,197,94,1)] animate-[bounce_2s_infinite]"></div>

                            {/* Reticle Corners */}
                            <div className="absolute top-0 left-0 w-10 h-10 border-t-4 border-l-4 border-primary rounded-tl-2xl"></div>
                            <div className="absolute top-0 right-0 w-10 h-10 border-t-4 border-r-4 border-primary rounded-tr-2xl"></div>
                            <div className="absolute bottom-0 left-0 w-10 h-10 border-b-4 border-l-4 border-primary rounded-bl-2xl"></div>
                            <div className="absolute bottom-0 right-0 w-10 h-10 border-b-4 border-r-4 border-primary rounded-br-2xl"></div>

                            {/* Helper Text inside frame */}
                            <div className="absolute inset-0 flex items-center justify-center opacity-50">
                                <p className="text-white/80 text-[10px] uppercase font-black tracking-widest text-center px-8">Aligner le code-barres</p>
                            </div>
                        </div>

                        <div className="text-center space-y-6 w-full max-w-xs">
                            <p className="text-white/90 font-medium text-sm text-shadow-sm bg-black/20 p-4 rounded-xl backdrop-blur-sm">
                                Placez l'ordonnance ou le médicament dans le cadre pour l'analyser.
                            </p>
                            <div className="flex gap-4 justify-center">
                                <button className="w-20 h-20 rounded-full border-4 border-white/30 flex items-center justify-center bg-white/10 active:scale-95 transition-all backdrop-blur-md">
                                    <div className="w-16 h-16 bg-white rounded-full shadow-lg"></div>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* SCANNER OVERLAY */}
            {isScanning && (
                <div className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center animate-in fade-in duration-300">
                    {/* Camera Feed Simulation */}
                    <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1576602976047-174e57a47881?auto=format&fit=crop&q=80')] bg-cover bg-center opacity-40"></div>
                    <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/60"></div>

                    {/* Overlay UI */}
                    <div className="relative z-10 w-full h-full flex flex-col items-center justify-between p-8 pt-safe pb-safe">
                        <div className="w-full flex justify-between items-center text-white">
                            <button onClick={() => setIsScanning(false)} className="p-3 bg-black/40 rounded-full backdrop-blur-md active:scale-95 transition-transform">
                                <X size={24} />
                            </button>
                            <div className="px-4 py-1.5 bg-black/40 rounded-full backdrop-blur-md text-xs font-bold uppercase tracking-widest flex items-center gap-2 border border-white/10">
                                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse shadow-[0_0_10px_red]"></div>
                                Analyse en cours
                            </div>
                            <button className="p-3 bg-black/40 rounded-full backdrop-blur-md active:scale-95 transition-transform">
                                <Zap size={24} className="text-white" />
                            </button>
                        </div>

                        {/* Scanner Frame */}
                        <div className="w-72 h-72 border-2 border-primary/50 rounded-[2rem] relative overflow-hidden shadow-[0_0_100px_rgba(34,197,94,0.2)]">
                            <div className="absolute top-0 left-0 w-full h-0.5 bg-primary/80 shadow-[0_0_20px_rgba(34,197,94,1)] animate-[bounce_2s_infinite]"></div>

                            {/* Reticle Corners */}
                            <div className="absolute top-0 left-0 w-10 h-10 border-t-4 border-l-4 border-primary rounded-tl-2xl"></div>
                            <div className="absolute top-0 right-0 w-10 h-10 border-t-4 border-r-4 border-primary rounded-tr-2xl"></div>
                            <div className="absolute bottom-0 left-0 w-10 h-10 border-b-4 border-l-4 border-primary rounded-bl-2xl"></div>
                            <div className="absolute bottom-0 right-0 w-10 h-10 border-b-4 border-r-4 border-primary rounded-br-2xl"></div>

                            {/* Helper Text inside frame */}
                            <div className="absolute inset-0 flex items-center justify-center opacity-50">
                                <p className="text-white/80 text-[10px] uppercase font-black tracking-widest text-center px-8">Aligner le code-barres</p>
                            </div>
                        </div>

                        <div className="text-center space-y-6 w-full max-w-xs">
                            <p className="text-white/90 font-medium text-sm text-shadow-sm bg-black/20 p-4 rounded-xl backdrop-blur-sm">
                                Placez l'ordonnance ou le médicament dans le cadre pour l'analyser.
                            </p>
                            <div className="flex gap-4 justify-center">
                                <button className="w-20 h-20 rounded-full border-4 border-white/30 flex items-center justify-center bg-white/10 active:scale-95 transition-all backdrop-blur-md">
                                    <div className="w-16 h-16 bg-white rounded-full shadow-lg"></div>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Location Request Modal */}
            {permissionStatus !== "granted" && (
                <div className="absolute inset-0 z-[100] flex items-center justify-center p-6 bg-background/80 backdrop-blur-xl animate-in fade-in">
                    <div className="glass-card w-full max-w-sm p-8 border-primary/20 shadow-2xl text-center flex flex-col items-center">
                        <div className="w-20 h-20 bg-primary/10 rounded-[2.5rem] flex items-center justify-center mb-6 relative">
                            <div className="absolute inset-0 bg-primary/20 rounded-[2.5rem] animate-ping" />
                            <MapPin size={36} className="text-primary relative z-10" />
                        </div>

                        <h2 className="text-2xl font-black italic mb-2 text-foreground">Localisation Requise</h2>
                        <p className="text-sm text-muted-foreground font-medium mb-8 leading-relaxed">
                            Veuillez activer votre position pour trouver les pharmacies les plus proches de vous et obtenir un itinéraire précis.
                        </p>

                        <button
                            onClick={requestLocation}
                            disabled={isLocating}
                            className="w-full py-4 bg-primary text-white font-black rounded-2xl shadow-xl shadow-primary/20 flex items-center justify-center gap-3 transition active:scale-95 disabled:opacity-50"
                        >
                            {isLocating ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    LOCALISATION...
                                </>
                            ) : (
                                <>
                                    <NavigationIcon size={20} fill="currentColor" />
                                    ACTIVER MA POSITION
                                </>
                            )}
                        </button>

                        <button
                            onClick={() => setPermissionStatus("granted")} // Skip for now (default location)
                            className="mt-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors"
                        >
                            Continuer sans localisation
                        </button>
                    </div>
                </div>
            )}

            {/* Transport Mode Selector - Floating Pills */}
            <div className="absolute top-28 left-0 right-0 z-20 flex justify-center px-4">
                <div className="glass-card p-1.5 flex gap-1 border-white/10 shadow-xl">
                    {[
                        { id: "walking", label: "À pied", icon: "🚶" },
                        { id: "motorcycle", label: "Moto", icon: "🏍️" },
                        { id: "car", label: "Voiture", icon: "🚗" }
                    ].map((mode) => (
                        <button
                            key={mode.id}
                            onClick={() => setTransportMode(mode.id as any)}
                            className={cn(
                                "px-5 py-2.5 rounded-2xl font-black text-xs uppercase tracking-tighter transition-all flex items-center gap-2",
                                transportMode === mode.id
                                    ? "bg-primary text-white shadow-lg scale-105"
                                    : "text-muted-foreground hover:bg-secondary/50"
                            )}
                        >
                            <span className="text-lg">{mode.icon}</span>
                            {mode.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Selected Pharmacy Panel - Modern Slide Up Card */}
            {selectedPharmacy && (
                <div className={cn(
                    "absolute left-4 right-4 z-40 transition-all duration-500 ease-in-out",
                    isMinimized ? "bottom-24" : "bottom-24" // Panel is already at bottom-24, let's adjust
                )}>
                    <div className={cn(
                        "glass-card border-white/20 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] bg-white/90 dark:bg-black/80 backdrop-blur-3xl relative overflow-hidden transition-all duration-500",
                        isMinimized ? "h-20" : "p-6"
                    )}>
                        {/* Minimize/Maximize Button */}
                        <button
                            onClick={() => setIsMinimized(!isMinimized)}
                            className="absolute top-4 right-14 p-2 bg-secondary/50 hover:bg-secondary rounded-full transition-all flex items-center justify-center"
                        >
                            {isMinimized ? "🔼" : "🔽"}
                        </button>
                        {/* Decorative background element */}
                        <div className="absolute -top-10 -right-10 w-32 h-32 bg-primary/10 rounded-full blur-3xl pointer-events-none" />

                        <button
                            onClick={() => {
                                setSelectedPharmacy(null);
                                setDestinationCoords(null);
                            }}
                            className="absolute top-4 right-4 p-2 bg-secondary/50 hover:bg-secondary rounded-full transition-all"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        <div className={cn("flex items-center gap-3 mb-4", isMinimized && "mb-0")}>
                            <div className="w-1.5 h-6 bg-primary rounded-full transition-all" />
                            <h3 className={cn("font-black italic tracking-tight text-foreground transition-all", isMinimized ? "text-lg" : "text-2xl")}>{selectedPharmacy.name}</h3>
                            {isMinimized && (
                                <p className="text-[10px] font-bold text-primary ml-auto mr-12 px-2 py-1 bg-primary/10 rounded-lg">
                                    {selectedPharmacy.distance?.toFixed(1)} km • {getEstimatedTime(selectedPharmacy.distance || 0)}
                                </p>
                            )}
                        </div>

                        {!isMinimized && (
                            <>
                                <p className="text-sm text-muted-foreground mb-6 flex items-center gap-2 font-medium">
                                    <MapPin className="w-4 h-4 text-primary" />
                                    {selectedPharmacy.location.address || "Ouagadougou, Burkina Faso"}
                                </p>

                                <div className="grid grid-cols-2 gap-4 mb-8">
                                    <div className="p-4 bg-secondary/40 rounded-3xl border border-white/10">
                                        <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Distance</div>
                                        <div className="text-3xl font-black text-primary font-mono leading-none">
                                            {selectedPharmacy.distance?.toFixed(1) || "N/A"} <span className="text-sm">KM</span>
                                        </div>
                                    </div>
                                    <div className="p-4 bg-secondary/40 rounded-3xl border border-white/10">
                                        <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Temps estimé</div>
                                        <div className="text-3xl font-black text-foreground font-mono leading-none italic">
                                            {getEstimatedTime(selectedPharmacy.distance || 0)}
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}

                        {!isMinimized && (
                            <div className="flex gap-3">
                                <button
                                    onClick={() => {
                                        if (selectedPharmacy && userLocation) {
                                            setDestinationCoords([selectedPharmacy.location.lng, selectedPharmacy.location.lat]);
                                            setIsMinimized(true); // Automatically minimize to show route
                                        } else if (!userLocation) {
                                            setPermissionStatus("prompt");
                                        }
                                    }}
                                    className="flex-[2] py-4 bg-primary text-white font-black rounded-2xl shadow-xl shadow-primary/20 hover:brightness-110 transition active:scale-[0.98] flex items-center justify-center gap-3 uppercase tracking-widest text-xs"
                                >
                                    <NavigationIcon size={20} fill="currentColor" />
                                    Itinéraire
                                </button>
                                <button
                                    onClick={() => router.push(`/pharmacy/${selectedPharmacy.id}`)}
                                    className="flex-1 py-4 bg-secondary text-foreground font-black rounded-2xl hover:bg-secondary/80 transition active:scale-[0.98] uppercase tracking-widest text-[10px]"
                                >
                                    Détails
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Mini List - Horizontal Scroll */}
            {!selectedPharmacy && pharmacies.length > 0 && (
                <div className="absolute bottom-8 left-0 right-0 z-20">
                    <div className="px-4 pb-2">
                        <h3 className="text-xs font-black uppercase tracking-widest text-primary/80 mb-2 pl-2 drop-shadow-md">Pharmacies les plus proches</h3>
                    </div>
                    <div className="flex gap-3 overflow-x-auto px-4 pb-4 scrollbar-hide snap-x">
                        {pharmacies.slice(0, 5).map((pharmacy) => (
                            <div
                                key={pharmacy.id}
                                onClick={() => {
                                    setSelectedPharmacy(pharmacy);
                                    // Also center map on it
                                    setMapView(prev => ({ ...prev, center: [pharmacy.location.lng, pharmacy.location.lat], zoom: 16 }));
                                }}
                                className="min-w-[200px] w-[200px] bg-white dark:bg-zinc-900 rounded-2xl p-3 shadow-xl border border-white/20 snap-center active:scale-95 transition-all cursor-pointer"
                            >
                                <div className="flex justify-between items-start mb-2">
                                    <div className={cn(
                                        "w-8 h-8 rounded-full flex items-center justify-center text-lg shadow-sm",
                                        pharmacy.status === 'guard' ? "bg-primary/20" : "bg-emerald-500/20"
                                    )}>
                                        {pharmacy.status === 'guard' ? '🟣' : '🟢'}
                                    </div>
                                    <span className="text-[10px] font-bold text-muted-foreground bg-secondary px-2 py-1 rounded-lg">
                                        {pharmacy.distance?.toFixed(1)} km
                                    </span>
                                </div>
                                <h4 className="font-black text-sm text-foreground truncate mb-1">{pharmacy.name}</h4>
                                <p className="text-[10px] text-muted-foreground truncate flex items-center gap-1">
                                    <Clock size={10} />
                                    {getEstimatedTime(pharmacy.distance || 0)}
                                    {pharmacy.foundProductPrice && (
                                        <span className="ml-auto font-bold text-emerald-600 bg-emerald-100 dark:bg-emerald-900/30 px-1.5 py-0.5 rounded">
                                            {pharmacy.foundProductPrice} FCFA
                                        </span>
                                    )}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </main>
    );
}
