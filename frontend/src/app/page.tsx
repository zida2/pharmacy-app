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
      <div className="absolute top-0 left-0 right-0 z-20 pt-safe px-4 pb-8 bg-gradient-to-b from-background via-background/90 to-transparent">
        <div className="max-w-7xl mx-auto space-y-4">
          {/* Greeting & Quick Actions */}
          <div className="flex justify-between items-end pt-4">
            <div>
              <h1 className="text-2xl font-black italic tracking-tight text-foreground">
                Bonjour 👋
              </h1>
              <p className="text-[10px] font-black uppercase tracking-widest text-primary">
                Quelle pharmacie cherchez-vous ?
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={toggleTheme}
                className="p-2.5 bg-card backdrop-blur-xl rounded-xl border border-border text-foreground shadow-sm hover:bg-secondary/50 transition-all active:scale-95"
              >
                {theme === "dark" ? <Sun size={20} className="text-amber-400" /> : <Moon size={20} />}
              </button>
              <button
                onClick={() => router.push("/profile")}
                className="p-2.5 bg-card backdrop-blur-xl rounded-xl border border-border text-foreground shadow-sm hover:bg-secondary/50 transition-all active:scale-95"
              >
                <User size={20} />
              </button>
            </div>
          </div>

          {/* Search Row */}
          <div className="flex gap-2 items-center">
            <form onSubmit={handleSearchSubmit} className="flex-1 min-w-0">
              <SearchBar
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </form>
            <button
              onClick={() => router.push("/scanner")}
              className="p-3.5 bg-primary text-white rounded-2xl shadow-lg shadow-primary/30 hover:brightness-110 transition-all active:scale-95 flex items-center justify-center aspect-square"
            >
              <Camera size={22} />
            </button>
          </div>

          {/* Categories Quick Filter */}
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide px-0.5">
            {[
              { id: "garde", label: "De Garde", icon: "🟣", color: "purple" },
              { id: "urgent", label: "Urgence", icon: "🚨", color: "red" },
              { id: "promo", label: "Promos", icon: "🏷️", color: "amber" },
              { id: "bebe", label: "Bébé", icon: "🍼", color: "blue" },
              { id: "soin", label: "Soin", icon: "🧼", color: "emerald" },
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => {
                  if (cat.id === "urgent") {
                    handleSearch("pharmacie de garde");
                  } else {
                    handleSearch(cat.label);
                  }
                }}
                className="flex items-center gap-2 px-4 py-2 bg-card border border-border rounded-xl whitespace-nowrap shadow-sm hover:bg-secondary/50 transition-all active:scale-95"
              >
                <span className="text-sm">{cat.icon}</span>
                <span className="text-[10px] font-black uppercase tracking-widest">{cat.label}</span>
              </button>
            ))}
          </div>
          {isLoading && (
            <div className="flex justify-center">
              <div className="px-4 py-1 bg-primary/10 rounded-full border border-primary/20 flex items-center gap-2">
                <div className="w-2 h-2 bg-primary rounded-full animate-bounce" />
                <span className="text-[9px] font-black uppercase text-primary tracking-widest">Recherche...</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* View Toggle */}
      <div className="absolute top-[12.5rem] right-4 z-20">
        <div className="bg-card/90 backdrop-blur-xl rounded-2xl shadow-xl p-1.5 flex gap-1 border border-border/50">
          <button
            onClick={() => setViewMode("map")}
            className={cn(
              "p-2 rounded-xl transition-all flex items-center justify-center",
              viewMode === "map"
                ? "bg-primary text-white shadow-lg"
                : "text-muted-foreground hover:bg-secondary/50"
            )}
            title="Vue Carte"
          >
            <MapPin size={20} />
          </button>
          <button
            onClick={() => setViewMode("list")}
            className={cn(
              "p-2 rounded-xl transition-all flex items-center justify-center",
              viewMode === "list"
                ? "bg-primary text-white shadow-lg"
                : "text-muted-foreground hover:bg-secondary/50"
            )}
            title="Vue Liste"
          >
            <SlidersHorizontal size={20} />
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
          <div className="absolute bottom-24 left-0 right-0 z-20">
            <div className="mx-4 mb-3">
              <div className="glass-card p-3 flex items-center justify-between border-primary/10 shadow-lg">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[10px] font-black uppercase tracking-wider text-foreground/80">
                    {results.length} Pharmacies prêtes à vous servir
                  </span>
                </div>
                {userLocation && (
                  <span className="text-[9px] font-black italic text-primary">
                    Proximité calculée 🏛️
                  </span>
                )}
              </div>
            </div>

            <div className="flex gap-4 overflow-x-auto pb-4 pt-2 px-4 scrollbar-hide snap-x snap-mandatory">
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
        <div className="flex-1 overflow-y-auto pt-[18rem] pb-nav px-4 space-y-4 bg-secondary/5">
          {results.length === 0 ? (
            <div className="text-center py-20 bg-card/50 rounded-3xl border border-dashed border-border m-4">
              <div className="text-6xl mb-4 grayscale">🔍</div>
              <h3 className="text-xl font-bold mb-2">Aucune pharmacie trouvée</h3>
              <p className="text-muted-foreground text-sm max-w-[200px] mx-auto">
                Essayez d'ajuster votre recherche ou vos filtres.
              </p>
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
