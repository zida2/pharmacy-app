"use client";

import React, { useState, useEffect } from "react";
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
    <main className="relative w-full h-screen flex flex-col bg-background">
      {/* Dynamic Background Gradient - Smoother */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-primary/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-emerald-500/5 rounded-full blur-[120px]" />
      </div>

      {/* Top Bar / Search */}
      <div className="absolute top-0 left-0 right-0 z-20 pt-safe px-4 pb-8 bg-gradient-to-b from-background via-background/90 to-transparent">
        <div className="max-w-7xl mx-auto space-y-4">
          {/* Greeting & Quick Actions */}
          <div className="flex justify-between items-start pt-4">
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
              className="p-3 bg-primary text-white rounded-xl shadow-lg shadow-primary/20 hover:brightness-110 transition-all active:scale-95 shrink-0"
            >
              <Camera size={18} />
            </button>
          </div>

          {/* Categories Quick Filter */}
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {[
              { id: "garde", label: "Garde", icon: "🟣" },
              { id: "urgent", label: "Urgent", icon: "🚨" },
              { id: "promo", label: "Promos", icon: "🏷️" },
              { id: "bebe", label: "Bébé", icon: "🍼" },
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => cat.id === "urgent" ? handleSearch("pharmacie de garde") : handleSearch(cat.label)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-card border border-border rounded-xl whitespace-nowrap shadow-sm text-[10px] font-black uppercase tracking-widest text-foreground/80"
              >
                <span>{cat.icon}</span>
                {cat.label}
              </button>
            ))}
          </div>

          {isLoading && (
            <div className="flex justify-center -mb-2">
              <div className="px-3 py-1 bg-primary/10 rounded-full border border-primary/20 flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" />
                <span className="text-[8px] font-black uppercase text-primary tracking-widest">Recherche...</span>
              </div>
            </div>
          )}
        </div>
      </div>


      {/* Content Area - Scrollable Feed */}
      <div className="flex-1 overflow-y-auto pb-nav">
        <div className="max-w-xl mx-auto px-4 pt-[15rem] space-y-6">
          <div className="flex justify-between items-center px-1">
            <h2 className="text-xl font-black italic text-foreground tracking-tight">Pharmacies à proximité</h2>
            <div className="bg-primary/10 px-3 py-1 rounded-full border border-primary/20">
              <span className="text-[10px] font-black text-primary uppercase">{results.length} trouvées</span>
            </div>
          </div>

          <div className="space-y-4">
            {results.length === 0 ? (
              <div className="text-center py-20 bg-card/50 rounded-[2.5rem] border border-dashed border-border flex flex-col items-center">
                <div className="w-20 h-20 bg-secondary/50 rounded-full flex items-center justify-center mb-4">
                  <Search size={32} className="text-muted-foreground/50" />
                </div>
                <h3 className="text-xl font-black text-foreground mb-2">Aucun résultat</h3>
                <p className="text-sm text-muted-foreground max-w-[200px]">Essayez de rechercher un autre médicament ou changez de filtre.</p>
              </div>
            ) : (
              results.map(({ pharmacy, product }, index) => (
                <div
                  key={`${pharmacy.id}-${product?.id || 'no-product'}-${index}`}
                  className="animate-in fade-in slide-in-from-bottom-4 duration-700"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <PharmacyCard
                    pharmacy={pharmacy}
                    product={product ? {
                      name: product.name,
                      price: product.price || 0,
                      id: product.id
                    } : undefined}
                    showActions={true}
                  />
                </div>
              ))
            )}
          </div>

          {/* Help Card */}
          <div className="p-6 bg-primary rounded-[2.5rem] text-white shadow-xl shadow-primary/20 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl" />
            <div className="relative z-10">
              <h3 className="text-xl font-black italic mb-2">Besoin d'aide ? 🚑</h3>
              <p className="text-sm font-medium text-white/80 mb-4 leading-relaxed">Notre assistant est là pour vous 24h/24.</p>
              <button className="px-6 py-2.5 bg-white text-primary font-black rounded-xl text-xs uppercase tracking-widest hover:scale-105 active:scale-95 transition-all">Contacter</button>
            </div>
          </div>
        </div>
      </div>

      <AuthPrompt
        isOpen={showAuthPrompt}
        onClose={() => setShowAuthPrompt(false)}
        message={authMessage}
      />
    </main>
  );
}
