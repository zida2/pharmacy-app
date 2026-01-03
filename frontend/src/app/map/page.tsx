"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Map from "@/components/Map";
import { searchMedicines } from "@/services/mockApi";
import { Pharmacy } from "@/services/types";
import { ArrowLeft, Navigation as NavigationIcon, MapPin, X } from "lucide-react";
import { cn } from "@/lib/utils";

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

    const [pharmacies, setPharmacies] = useState<Pharmacy[]>([]);
    const [selectedPharmacy, setSelectedPharmacy] = useState<Pharmacy | null>(null);
    const [transportMode, setTransportMode] = useState<"walking" | "motorcycle" | "car">("walking");

    // Localization & Routing state
    const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
    const [permissionStatus, setPermissionStatus] = useState<"prompt" | "granted" | "denied">("prompt");
    const [isLocating, setIsLocating] = useState(false);
    const [destinationCoords, setDestinationCoords] = useState<[number, number] | null>(null);
    const [isMinimized, setIsMinimized] = useState(false);

    useEffect(() => {
        // Only load if location is granted or if we want to show default
        loadPharmacies();

        const handleSelect = (e: any) => {
            setSelectedPharmacy(e.detail);
        };

        window.addEventListener('pharmacySelected', handleSelect);
        return () => window.removeEventListener('pharmacySelected', handleSelect);
    }, [query, userLocation]);

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

    const loadPharmacies = async () => {
        const data = await searchMedicines(query);
        let pharms = data.map(r => r.pharmacy);

        // Calculate distance if userLocation exists
        if (userLocation) {
            pharms = pharms.map(p => {
                const d = calculateDistance(userLocation[1], userLocation[0], p.location.lat, p.location.lng);
                return { ...p, distance: d };
            }).sort((a, b) => (a.distance || 0) - (b.distance || 0));
        }

        setPharmacies(pharms);
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

    return (
        <main className="relative w-full h-screen overflow-hidden bg-background">
            {/* Header - Glassmorphism */}
            <div className="absolute top-0 left-0 right-0 z-30 p-4 pt-safe">
                <div className="glass-card p-4 flex items-center gap-4 border-white/20 shadow-2xl">
                    <button
                        onClick={() => router.back()}
                        className="p-3 bg-secondary/50 hover:bg-secondary rounded-2xl transition-all active:scale-95"
                    >
                        <ArrowLeft className="w-6 h-6 text-foreground" />
                    </button>
                    <div className="flex-1">
                        <h1 className="font-black text-xl italic leading-none text-foreground">Carte & Itinéraire</h1>
                        <p className="text-[10px] font-black uppercase tracking-widest text-primary mt-1">
                            {pharmacies.length} pharmacies à proximité
                        </p>
                    </div>
                </div>
            </div>

            {/* Map */}
            <div className="w-full h-full grayscale-[0.2] brightness-[0.95]">
                <Map
                    className="rounded-none border-none shadow-none"
                    pharmacies={pharmacies}
                    userLocation={userLocation}
                    destination={destinationCoords}
                    initialCenter={userLocation || [-1.5197, 12.3714]}
                    initialZoom={userLocation ? 14 : 12}
                />
            </div>

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
        </main>
    );
}
