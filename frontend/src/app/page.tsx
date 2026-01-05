"use client";

import React, { useState, useEffect } from "react";
import SearchBar from "@/components/SearchBar";
import PharmacyCard from "@/components/PharmacyCard";
import { firebaseService } from "@/services/firebaseService";
import { Pharmacy, Product } from "@/services/types";
import { MapPin, User, Home, Search, SlidersHorizontal, Camera, AlertTriangle, Moon, Sun, ShoppingCart, Database, Crown, Gift, Sparkles, ChevronRight } from "lucide-react";
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
  const [locationStatus, setLocationStatus] = useState<'loading' | 'success' | 'denied' | 'default'>('loading');
  const [premiumState, setPremiumState] = useState({ isPremium: false, isTrial: false, daysLeft: 0 });
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  // Default to Ouagadougou center
  const DEFAULT_CENTER = { lat: 12.3714, lng: -1.5197 };

  // Initial load & Location Tracking
  useEffect(() => {
    setLocationStatus('loading');
    let watchId: number | null = null;

    if ("geolocation" in navigator) {
      watchId = navigator.geolocation.watchPosition(
        (position) => {
          const loc = { lat: position.coords.latitude, lng: position.coords.longitude };
          setUserLocation(loc);
          setLocationStatus('success');
        },
        (error) => {
          console.warn("Geolocation tracking error:", error.code, error.message);
          if (error.code === 1) {
            setLocationStatus('denied');
            setAuthMessage("📍 Activez la géolocalisation pour voir les pharmacies les plus proches de vous.");
          } else if (locationStatus === 'loading') {
            setLocationStatus('default');
            setUserLocation(DEFAULT_CENTER);
          }
        },
        {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 0 // Force fresh location tracking
        }
      );
    } else {
      setLocationStatus('default');
      setUserLocation(DEFAULT_CENTER);
    }

    return () => {
      if (watchId !== null) navigator.geolocation.clearWatch(watchId);
    };
  }, []);

  // Update results when location changes
  useEffect(() => {
    if (userLocation) {
      handleSearch(searchQuery);
    }
  }, [userLocation]);

  // Check Premium Status
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user: any) => {
      setIsAuthLoading(true);
      if (user) {
        const profile = await firebaseService.getUserProfile(user.uid) as any;
        const isSubscribed = profile?.userInfo?.isPremium === true;

        const creationTime = user.metadata.creationTime ? new Date(user.metadata.creationTime) : new Date();
        const now = new Date();
        const diffTime = Math.abs(now.getTime() - creationTime.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        const trialRemaining = Math.max(0, 15 - diffDays);
        const isTrial = !isSubscribed && trialRemaining > 0;

        setPremiumState({
          isPremium: isSubscribed,
          isTrial: isTrial,
          daysLeft: isTrial ? trialRemaining : 0
        });
      } else {
        setPremiumState({ isPremium: false, isTrial: false, daysLeft: 0 });
      }
      setIsAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const retryGeolocation = () => {
    setLocationStatus('loading');
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const loc = { lat: position.coords.latitude, lng: position.coords.longitude };
          setUserLocation(loc);
          setLocationStatus('success');
          handleSearch(searchQuery, loc);
        },
        (error) => {
          console.warn("Geolocation retry error:", error);
          setLocationStatus(error.code === 1 ? 'denied' : 'default');
          setUserLocation(DEFAULT_CENTER);
        },
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 } // Force fresh location
      );
    }
  };


  // Offline Cache Logic
  useEffect(() => {
    const cachedResults = localStorage.getItem('offline_pharmacies_cache');
    if (cachedResults && results.length === 0) {
      try {
        const parsed = JSON.parse(cachedResults);
        setResults(parsed);
      } catch (e) {
        console.error("Failed to parse cached pharmacies", e);
      }
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
        processedData = data.map(item => {
          const pharmLat = item.pharmacy.location?.lat || 0;
          const pharmLng = item.pharmacy.location?.lng || 0;
          const userLat = loc.lat || (loc as any).latitude || 0;
          const userLng = loc.lng || (loc as any).longitude || 0;

          return {
            ...item,
            pharmacy: {
              ...item.pharmacy,
              distance: calculateDistance(
                { latitude: userLat, longitude: userLng },
                { latitude: pharmLat, longitude: pharmLng }
              ),
              isStraightLine: true
            }
          };
        }).sort((a, b) => (a.pharmacy.distance || 0) - (b.pharmacy.distance || 0));
      }

      setResults(processedData);

      // Cache the first 10 results for offline mode
      if (processedData.length > 0) {
        localStorage.setItem('offline_pharmacies_cache', JSON.stringify(processedData.slice(0, 10)));
      }
    } catch (error) {
      console.error("Search failed", error);
      // On failure, keep the current results (which might be the cached ones)
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
      <div className="absolute top-0 left-0 right-0 z-20 pt-safe px-4 pb-4 bg-gradient-to-b from-background via-background/90 to-transparent">
        <div className="max-w-7xl mx-auto space-y-3">
          {/* Greeting & Quick Actions */}
          <div className="flex justify-between items-start pt-3">
            <div>
              <h1 className="text-xl font-black italic tracking-tight text-foreground leading-none">
                Bonjour 👋
              </h1>
              <p className="text-[9px] font-black uppercase tracking-widest text-primary mt-1">
                Quelle pharmacie cherchez-vous ?
              </p>
              <div className="flex items-center gap-2 mt-2 px-1">
                {locationStatus === 'loading' && <span className="text-[10px] text-muted-foreground animate-pulse font-bold">Localisation en cours...</span>}
                {locationStatus === 'success' && (
                  <div className="flex items-center gap-3">
                    <div className="flex items-center text-emerald-500 gap-1.5">
                      <MapPin size={12} />
                      <span className="text-[10px] font-black uppercase tracking-wider">Position précise</span>
                    </div>
                    <div className="flex items-center bg-primary/10 text-primary px-2 py-0.5 rounded-full border border-primary/20">
                      <Sparkles size={10} className="mr-1" />
                      <span className="text-[9px] font-black uppercase tracking-widest">Recherche Gratuite</span>
                    </div>
                  </div>
                )}
                {locationStatus === 'default' && <div className="flex items-center text-amber-500 gap-1.5"><AlertTriangle size={12} /><span className="text-[10px] font-black uppercase tracking-wider">Position approximative</span></div>}
                {locationStatus === 'denied' && (
                  <button onClick={retryGeolocation} className="flex items-center text-red-500 gap-1.5 hover:underline decoration-2 underline-offset-2 transition-all">
                    <AlertTriangle size={12} />
                    <span className="text-[10px] font-black uppercase tracking-wider">Activer GPS</span>
                  </button>
                )}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => toggleTheme()}
                className="btn-icon bg-secondary shadow-sm text-foreground"
              >
                {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
              </button>
              <button
                onClick={() => router.push('/profile')}
                className="btn-icon bg-secondary shadow-sm text-foreground relative"
              >
                <User size={20} />
                {premiumState.isPremium && (
                  <div className="absolute -top-1 -right-1 bg-amber-500 text-white p-0.5 rounded-full border-2 border-background">
                    <Crown size={8} />
                  </div>
                )}
              </button>
            </div>
          </div>

          {/* Premium/Trial Banner on Home */}
          {premiumState.isTrial && (
            <div className="px-6 mb-4">
              <div
                onClick={() => router.push('/profile')}
                className="p-3 bg-gradient-to-r from-amber-500/20 to-orange-500/20 rounded-2xl border border-amber-500/30 flex items-center justify-between cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <Gift className="text-amber-500 animate-bounce" size={18} />
                  <span className="text-[10px] font-black uppercase text-amber-600 tracking-widest">
                    Essai Premium : {premiumState.daysLeft} jours restants
                  </span>
                </div>
                <ChevronRight size={14} className="text-amber-500 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          )}

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
              className="btn-icon bg-primary text-white shadow-lg shadow-primary/20 shrink-0"
            >
              <Camera size={20} />
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
                className="flex items-center gap-1.5 px-3 py-1.5 bg-card border border-border rounded-lg whitespace-nowrap shadow-sm text-[8px] font-extrabold uppercase tracking-wider text-foreground/80 active:scale-95 transition-all outline-none"
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
        <div className="max-w-xl mx-auto px-4 pt-[13rem] space-y-6">
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
