"use client";

import React, { useState, useEffect } from "react";
import Map from "@/components/Map";
import SearchBar from "@/components/SearchBar";
import PharmacyCard from "@/components/PharmacyCard";
import { firebaseService } from "@/services/firebaseService";
import { Pharmacy, Product } from "@/services/types";
import { MapPin, User, Home, Search, SlidersHorizontal, Camera, AlertTriangle, Moon, Sun, ShoppingCart, Database } from "lucide-react";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { useTheme } from "@/context/ThemeContext";
import { useCart } from "@/context/CartContext";
import { auth } from "@/services/firebase";
import AuthPrompt from "@/components/AuthPrompt";
import { calculateDistance } from "@/lib/geolocation";

export default function HomePage() {
  const { theme, toggleTheme } = useTheme();
  const { items } = useCart();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [results, setResults] = useState<{ pharmacy: Pharmacy, product?: Product }[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPharmacyId, setSelectedPharmacyId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"map" | "list">("map");
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [showAuthPrompt, setShowAuthPrompt] = useState(false);
  const [authMessage, setAuthMessage] = useState("");

  // Default to Ouagadougou center
  const DEFAULT_CENTER = { lat: 12.3714, lng: -1.5197 };

  // Initial load
  useEffect(() => {
    // 1. Load data immediately with default/fallback location so user sees something
    handleSearch("", DEFAULT_CENTER);

    // 2. Try to get real location to refine distances
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const loc = { lat: position.coords.latitude, lng: position.coords.longitude };
          setUserLocation(loc);
          // Refresh search with real location
          handleSearch(searchQuery, loc);
        },
        (error) => {
          console.warn("Geolocation denied/error, using default:", error);
          // Already loaded with default, so just maybe notify or stay as is
          setAuthMessage("Activation de la localisation recommandée pour les distances précises.");
          setUserLocation(DEFAULT_CENTER);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    }
  }, []);


  const handleSearch = async (query: string, locationOverride?: { lat: number; lng: number }) => {
    setSearchQuery(query);
    setIsLoading(true);
    const loc = locationOverride || userLocation;
    try {
      const data = await firebaseService.searchMedicines(query, loc ? { latitude: loc.lat, longitude: loc.lng } : undefined);

      let processedData = data;
      if (loc) {
        processedData = data.map(item => ({
          ...item,
          pharmacy: {
            ...item.pharmacy,
            distance: calculateDistance(
              { latitude: loc.lat, longitude: loc.lng },
              { latitude: item.pharmacy.location.lat, longitude: item.pharmacy.location.lng }
            )
          }
        })).sort((a, b) => (a.pharmacy.distance || 0) - (b.pharmacy.distance || 0));
      }

      setResults(processedData);
    } catch (error) {
      console.error("Search failed", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/results?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <main className="relative w-full h-screen overflow-hidden flex flex-col bg-background">
      {/* Dynamic Background Gradient */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-500/10 rounded-full blur-[120px] animate-pulse" />
      </div>

      {/* Top Bar / Search */}
      <div className="absolute top-0 left-0 right-0 z-20 pt-safe">
        <div className="p-3 bg-gradient-to-b from-background/80 via-background/40 to-transparent backdrop-blur-[2px]">
          <div className="flex gap-2 items-center max-w-7xl mx-auto">
            <form onSubmit={handleSearchSubmit} className="flex-1 min-w-0">
              <SearchBar
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </form>
            <div className="flex gap-2 shrink-0">
              <button
                onClick={toggleTheme}
                className="p-2.5 bg-white/20 dark:bg-zinc-900/40 backdrop-blur-xl rounded-xl border border-white/30 text-foreground shadow-lg hover:bg-white/30 transition-all active:scale-95"
                title="Changer le thème"
              >
                {theme === "dark" ? <Sun size={20} className="text-amber-400" /> : <Moon size={20} />}
              </button>
              <button
                onClick={() => router.push("/scanner")}
                className="p-2.5 bg-white/20 dark:bg-zinc-900/40 backdrop-blur-xl rounded-xl border border-white/30 text-foreground shadow-lg hover:bg-white/30 transition-all active:scale-95"
                title="Scanner une ordonnance"
              >
                <Camera size={20} />
              </button>
              <button
                onClick={() => {
                  if (!auth.currentUser) {
                    setAuthMessage("Vous devez être connecté pour activer le mode d'urgence et partager votre position avec les secours.");
                    setShowAuthPrompt(true);
                    return;
                  }
                  handleSearch("pharmacie de garde");
                  alert("🚨 MODE URGENCE: Recherche des pharmacies de garde les plus proches...");
                }}
                className="p-2.5 bg-red-600 rounded-xl text-white shadow-[0_0_20px_rgba(220,38,38,0.5)] animate-pulse hover:bg-red-700 transition-all active:scale-90"
                title="MODE URGENCE"
              >
                <AlertTriangle size={20} />
              </button>
            </div>
          </div>
          {isLoading && (
            <div className="text-center text-foreground text-xs mt-2 bg-background/30 backdrop-blur-sm rounded-full px-3 py-1 inline-block border border-border/50">
              Recherche en cours...
            </div>
          )}
        </div>
      </div>

      {/* View Toggle */}
      <div className="absolute top-24 right-4 z-20">
        <div className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl rounded-xl shadow-xl p-1 flex gap-1 border border-white/20">
          <button
            onClick={() => setViewMode("map")}
            className={cn(
              "px-3 py-1.5 rounded-lg text-sm font-bold transition-all flex items-center gap-1.5",
              viewMode === "map"
                ? "bg-primary text-primary-foreground shadow-lg"
                : "text-muted-foreground hover:bg-secondary/50"
            )}
          >
            <MapPin size={16} />
            Carte
          </button>
          <button
            onClick={() => setViewMode("list")}
            className={cn(
              "px-3 py-1.5 rounded-lg text-sm font-bold transition-all flex items-center gap-1.5",
              viewMode === "list"
                ? "bg-primary text-primary-foreground shadow-lg"
                : "text-muted-foreground hover:bg-secondary/50"
            )}
          >
            <SlidersHorizontal size={16} />
            Liste
          </button>
        </div>
      </div>

      {/* Map or List View */}
      {viewMode === "map" ? (
        <>
          <div className="flex-1 w-full h-full">
            <Map
              className="rounded-none border-none"
              pharmacies={results.map(r => r.pharmacy)}
              initialCenter={userLocation ? [userLocation.lng, userLocation.lat] : [-1.5197, 12.3714]} // Default to Ouaga
              userLocation={userLocation ? [userLocation.lng, userLocation.lat] : null}
            />
          </div>

          {/* Result Cards Carousel (Bottom) */}
          <div className="absolute bottom-24 left-0 right-0 z-20 px-4">
            <div className="flex items-center justify-between mb-2 px-2">
              <h2 className="text-xs font-black uppercase tracking-[0.2em] text-foreground/70 drop-shadow-sm">
                Pharmacies à proximité
              </h2>
              {userLocation && (
                <span className="text-[10px] font-bold text-primary animate-pulse">
                  GÉOLOCALISATION ACTIVE 🇧🇫
                </span>
              )}
            </div>
            <div className="flex gap-4 overflow-x-auto pb-4 pt-2 px-2 scrollbar-hide snap-x snap-mandatory">
              {results.map(({ pharmacy, product }, index) => (
                <div key={`${pharmacy.id}-${product?.id || 'no-product'}-${index}`} className="snap-start">
                  <PharmacyCard
                    pharmacy={pharmacy}
                    product={product ? {
                      name: product.name,
                      price: product.price || 0,
                      id: product.id
                    } : undefined}
                    onSelect={() => setSelectedPharmacyId(pharmacy.id)}
                    isSelected={selectedPharmacyId === pharmacy.id}
                  />
                </div>
              ))}
            </div>
          </div>
        </>
      ) : (
        <div className="flex-1 overflow-y-auto pt-24 pb-nav px-4 space-y-4 bg-secondary/5">
          {results.length === 0 ? (
            <div className="text-center py-20">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-xl font-bold mb-2">Aucun résultat</h3>
              <p className="text-muted-foreground">Essayez une autre recherche</p>
            </div>
          ) : (
            results.map(({ pharmacy, product }, index) => (
              <PharmacyCard
                key={`${pharmacy.id}-${product?.id || 'no-product'}-${index}`}
                pharmacy={pharmacy}
                product={product ? {
                  name: product.name,
                  price: product.price || 0,
                  id: product.id
                } : undefined}
              />
            ))
          )}
        </div>
      )}

      <AuthPrompt
        isOpen={showAuthPrompt}
        onClose={() => setShowAuthPrompt(false)}
        message={authMessage}
      />
    </main>
  );
}
