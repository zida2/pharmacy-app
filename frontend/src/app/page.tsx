"use client";

import React, { useState, useEffect } from "react";
import SearchBar from "@/components/SearchBar";
import PharmacyCard from "@/components/PharmacyCard";
import { firebaseService } from "@/services/firebaseService";
import { Pharmacy, Product } from "@/services/types";
import { MapPin, User, Home, Search, SlidersHorizontal, Camera, AlertTriangle, Moon, Sun, ShoppingCart, Database, Crown, Gift, Sparkles, ChevronRight, ShieldAlert, Clock, Stethoscope, Plus, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { useTheme } from "@/context/ThemeContext";
import { useCart } from "@/context/CartContext";
import { auth } from "@/services/firebase";
import AuthPrompt from "@/components/AuthPrompt";
import AssistanceModal from "@/components/AssistanceModal";
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
  const [showAssistance, setShowAssistance] = useState(false);
  const [isOffline, setIsOffline] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [treatments, setTreatments] = useState<any[]>([]);
  const [userName, setUserName] = useState<string>("Visiteur");
  const [lastConsultation, setLastConsultation] = useState<any>(null);
  const [hasInitialLoad, setHasInitialLoad] = useState(false);

  // Network listener & Install Prompt
  useEffect(() => {
    const handleStatus = () => setIsOffline(!navigator.onLine);
    const handleInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('online', handleStatus);
    window.addEventListener('offline', handleStatus);
    window.addEventListener('beforeinstallprompt', handleInstallPrompt);
    handleStatus();

    return () => {
      window.removeEventListener('online', handleStatus);
      window.removeEventListener('offline', handleStatus);
      window.removeEventListener('beforeinstallprompt', handleInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
    }
  };

  // Fetch User Data & Treatments
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user: any) => {
      if (user) {
        setUserName(user.displayName || "Utilisateur");
        try {
          const treatData = await firebaseService.getUserTreatments();
          setTreatments(treatData);

          const consultData = await firebaseService.getUserConsultations();
          if (consultData && consultData.length > 0) {
            setLastConsultation(consultData[0]);
          }

          // Sync premium state
          const profile = await firebaseService.getUserProfile(user.uid) as any;
          if (profile?.userInfo) {
            setUserName(profile.userInfo.name || user.displayName || "Utilisateur");

            const isSubscribed = profile.userInfo?.isPremium === true;
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
          }
        } catch (e) {
          console.error("Home data fetch error:", e);
        }
      } else {
        setUserName("Visiteur");
        setTreatments([]);
        setPremiumState({ isPremium: false, isTrial: false, daysLeft: 0 });
      }
      setIsAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Debounced Search Effect
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery.trim() !== "") {
        handleSearch(searchQuery);
      } else if (results.length > 0 && searchQuery === "") {
        // If query cleared, show default (nearby)
        handleSearch("");
      }
    }, 400); // 400ms debounce

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 18 || hour < 5) return "Bonsoir";
    return "Bonjour";
  };

  const getNextDoseInfo = () => {
    if (treatments.length === 0) return "Aucun traitement";

    const now = new Date();
    const currentHour = now.getHours();
    const currentMin = now.getMinutes();
    const currentTimeMinutes = currentHour * 60 + currentMin;

    let nearestTimeValue = 24 * 60 + 1;
    let nearestDose = "";

    treatments.forEach(t => {
      if (t.times && Array.isArray(t.times)) {
        t.times.forEach((timeStr: string) => {
          const [h, m] = timeStr.split(':').map(Number);
          const timeVal = h * 60 + m;

          if (timeVal > currentTimeMinutes && timeVal < nearestTimeValue) {
            nearestTimeValue = timeVal;
            nearestDose = `${t.medicineName} à ${timeStr}`;
          }
        });
      }
    });

    if (!nearestDose && treatments.length > 0) {
      // Find first dose of tomorrow
      return `Prochaine : Demain matin`;
    }

    return nearestDose ? `Prochaine : ${nearestDose}` : "Aucune prise prévue";
  };

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

  // Initial load of nearby pharmacies - Only once when location is first obtained
  useEffect(() => {
    if (userLocation && !hasInitialLoad && !isLoading) {
      setHasInitialLoad(true);
      handleSearch(""); // Load nearby pharmacies once
    }
  }, [userLocation, hasInitialLoad]);

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
    // Prevent duplicate simultaneous searches
    if (isLoading) {
      console.log("⏭️ Search already in progress, skipping...");
      return;
    }

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
    // No redirect anymore, search is handled by useEffect debounce
    handleSearch(searchQuery);
  };



  return (
    <main className="relative w-full h-screen flex flex-col bg-background font-sans transition-colors duration-500 overflow-hidden">

      {/* Premium Background - Dynamic Mesh Gradient & Grid */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-grid-slate-900/[0.04] dark:bg-grid-white/[0.02] [mask-image:radial-gradient(ellipse_at_center,black,transparent)]" />
        <div className="absolute top-0 -left-4 w-72 h-72 bg-primary/10 rounded-full blur-[120px] dark:bg-primary/20 animate-pulse" />
        <div className="bottom-0 -right-4 w-96 h-96 bg-indigo-500/10 rounded-full blur-[140px] dark:bg-indigo-500/10 animate-pulse" />
      </div>

      <AssistanceModal
        isOpen={showAssistance}
        onClose={() => setShowAssistance(false)}
      />

      {/* Premium Header / Search - Full Glassmorphism */}
      <div className="relative z-20 pt-safe px-5 pb-6 bg-background/40 backdrop-blur-2xl border-b border-border transition-all duration-500">
        <div className="max-w-3xl mx-auto space-y-6">

          {isOffline && (
            <div className="bg-amber-500/10 text-amber-600 border border-amber-500/20 text-[10px] font-black uppercase tracking-widest py-2 px-4 rounded-xl flex items-center justify-center gap-2 animate-in slide-in-from-top-2">
              <ShieldAlert size={14} />
              <span>Mode Hors-Ligne activé</span>
            </div>
          )}

          {/* Greeting & Header Actions - Enhanced Typography */}
          <div className="flex justify-between items-center pt-6">
            <div className="space-y-0.5">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/80 dark:text-primary animate-in fade-in slide-in-from-bottom-2 duration-500">
                {getGreeting()} <span className="animate-wave inline-block ml-1">👋</span>
              </p>
              <h1 className="text-2xl font-black tracking-tighter text-foreground leading-none animate-in fade-in slide-in-from-left-4 duration-700">
                Salut, <span className="text-primary italic">{userName}</span>
              </h1>
              <div className="flex items-center gap-2 pt-1">
                {locationStatus === 'loading' && <span className="text-[10px] text-muted-foreground animate-pulse font-bold uppercase tracking-widest">Localisation...</span>}
                {locationStatus === 'success' && (
                  <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-bold">
                    <MapPin size={10} strokeWidth={3} className="animate-bounce" />
                    <span className="text-[10px] uppercase tracking-wider">Ouagadougou, BF</span>
                  </div>
                )}
                {locationStatus === 'default' && <div className="flex items-center text-amber-500 gap-1"><AlertTriangle size={10} /><span className="text-[10px] font-bold uppercase">Position Approx.</span></div>}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowAssistance(true)}
                className="w-10 h-10 rounded-xl bg-red-50 text-red-500 hover:bg-red-100 dark:bg-red-500/10 dark:text-red-400 flex items-center justify-center transition-all active:scale-90 border border-red-100/50 dark:border-red-500/20 shadow-sm"
              >
                <AlertTriangle size={20} strokeWidth={2.5} />
              </button>
              <button
                onClick={() => toggleTheme()}
                className="w-10 h-10 rounded-xl bg-secondary text-foreground hover:bg-accent flex items-center justify-center transition-all active:scale-90 border border-border/50 shadow-sm"
              >
                {theme === 'dark' ? <Sun size={20} strokeWidth={2.5} /> : <Moon size={20} strokeWidth={2.5} />}
              </button>
            </div>
          </div>

          {/* Search Bar - Ultra Modern & Glassy */}
          <div className="flex gap-3 items-center">
            <form onSubmit={handleSearchSubmit} className="flex-1 transition-all">
              <div className="relative group">
                <SearchBar
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </form>
            <button
              onClick={() => router.push("/scanner")}
              className="w-12 h-12 bg-slate-900 dark:bg-primary text-white rounded-2xl flex items-center justify-center shadow-xl active:scale-95 transition-all hover:rotate-3 border border-white/10"
            >
              <Camera size={24} strokeWidth={2.5} className="text-white" />
            </button>
          </div>

          {/* Categories Quick Filter - Stylish Pills */}
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {[
              { id: "garde", label: "De Garde", icon: "🌙" },
              { id: "urgent", label: "Ouvertes", icon: "🚨" },
              { id: "palu", label: "Paludisme", icon: "🦟" },
              { id: "douleur", label: "Douleurs", icon: "💊" },
            ].map((cat) => {
              const isActive = searchQuery.toLowerCase().includes(cat.id) || searchQuery.toLowerCase().includes(cat.label.toLowerCase());
              return (
                <button
                  key={cat.id}
                  onClick={() => {
                    const term = cat.id === "garde" ? "pharmacie de garde" : cat.id === "urgent" ? "ouvert" : cat.label;
                    setSearchQuery(isActive ? "" : term);
                  }}
                  className={cn(
                    "flex items-center gap-2 px-5 py-2.5 border rounded-2xl whitespace-nowrap shadow-sm text-xs font-black uppercase tracking-wider transition-all outline-none active:scale-95",
                    isActive
                      ? "bg-primary text-white border-primary shadow-lg shadow-primary/20"
                      : "bg-card/50 backdrop-blur-md text-foreground border-border hover:bg-card"
                  )}
                >
                  <span className="text-sm">{cat.icon}</span>
                  {cat.label}
                </button>
              )
            })}
          </div>

        </div>

        {/* Absolute Progress Bar Loader - Smooth & Glowing */}
        {isLoading && (
          <div className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-transparent overflow-hidden">
            <div className="h-full bg-primary animate-progress-flow w-full shadow-[0_0_12px_rgba(99,102,241,0.8)]" />
          </div>
        )}
      </div>


      {/* Content Area - Scrollable Feed */}
      <div className="flex-1 overflow-y-auto bg-background scrollbar-hide">
        <div className="max-w-2xl mx-auto px-5 pt-4 pb-32 space-y-8">

          {/* Health Dashboard Section */}
          <div className="space-y-4">
            <div className="flex justify-between items-end px-1">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">Votre Santé</h2>
              {treatments.filter(t => t.isActive).length > 0 && (
                <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md">
                  {treatments.filter(t => t.isActive).length} actifs
                </span>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => router.push("/treatment")}
                className="bg-card dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 p-5 rounded-2xl flex flex-col items-start gap-3 shadow-sm hover:shadow-md transition-all active:scale-[0.98] text-left group"
              >
                <div className="w-10 h-10 bg-indigo-50 text-indigo-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Clock size={20} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">Traitements</h3>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-1">{getNextDoseInfo()}</p>
                </div>
              </button>

              <button
                onClick={() => {
                  if (lastConsultation?.id) {
                    router.push(`/teleconsultation/chat?id=${lastConsultation.id}`);
                  } else {
                    router.push("/teleconsultation");
                  }
                }}
                className="bg-card dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 p-5 rounded-2xl flex flex-col items-start gap-3 shadow-sm hover:shadow-md transition-all active:scale-[0.98] text-left group"
              >
                <div className="w-10 h-10 bg-blue-50 text-blue-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Stethoscope size={20} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">Consultation</h3>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-1">
                    {lastConsultation ? "Poursuivre le chat" : "Parler à un médecin"}
                  </p>
                </div>
              </button>
            </div>

            {/* Emergency Banner */}
            <div
              onClick={() => setShowAssistance(true)}
              className="w-full bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30 p-4 rounded-2xl flex items-center gap-4 cursor-pointer active:scale-[0.98] transition-all"
            >
              <div className="w-10 h-10 rounded-full bg-red-100 text-red-600 flex items-center justify-center shrink-0 animate-pulse">
                <AlertTriangle size={20} />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-bold text-red-800 dark:text-red-400">Urgence Médicale ?</h3>
                <p className="text-xs text-red-600/80 mt-0.5">Appuyez ici pour une assistance immédiate 24/7</p>
              </div>
              <ChevronRight className="text-red-400" size={18} />
            </div>
          </div>

          {/* Divider */}
          <div className="h-px bg-slate-100 dark:bg-zinc-800 w-full" />

          {/* Pharmacies Results */}
          <div>
            <div className="flex justify-between items-center px-1 mb-4">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">Pharmacies à proximité</h2>
              <span className="text-xs font-medium text-slate-400">
                {results.length} résultats
              </span>
            </div>

            <div className="space-y-4">
              {isLoading && results.length === 0 ? (
                // Skeletons to maintain height and stability
                Array.from({ length: 3 }).map((_, i) => (
                  <div key={`skel-${i}`} className="w-full h-40 bg-card rounded-3xl border border-border animate-pulse flex flex-col p-4 gap-4">
                    <div className="flex justify-between">
                      <div className="w-2/3 h-6 bg-muted rounded-lg" />
                      <div className="w-12 h-6 bg-muted rounded-lg" />
                    </div>
                    <div className="w-full h-4 bg-muted/60 rounded-lg" />
                    <div className="w-1/2 h-4 bg-muted/60 rounded-lg" />
                    <div className="flex gap-2 mt-auto">
                      <div className="flex-1 h-10 bg-muted/40 rounded-xl" />
                      <div className="flex-[1.4] h-10 bg-muted/40 rounded-xl" />
                    </div>
                  </div>
                ))
              ) : results.length === 0 ? (
                <div className="text-center py-16 flex flex-col items-center">
                  <div className="w-16 h-16 bg-slate-50 dark:bg-zinc-900 rounded-full flex items-center justify-center mb-4">
                    <Search size={24} className="text-slate-300" />
                  </div>
                  <h3 className="text-base font-bold text-slate-700 dark:text-slate-300">Aucune pharmacie trouvée</h3>
                  <p className="text-sm text-slate-400 mt-1 max-w-[200px]">Essayez de modifier votre recherche ou activez la localisation.</p>
                </div>
              ) : (
                results.map(({ pharmacy, product }, index) => (
                  <div
                    key={`${pharmacy.id}-${product?.id || 'no-product'}-${index}`}
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
