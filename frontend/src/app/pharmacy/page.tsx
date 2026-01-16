"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Pharmacy, Product } from "@/services/types";
import { firebaseService } from "@/services/firebaseService";
import { ArrowLeft, MapPin, Phone, Star, Info, Search, Filter, LayoutGrid, List, Navigation2 } from "lucide-react";
import { useCart } from "@/context/CartContext";
import ProductCard from "@/components/ProductCard";
import { cn } from "@/lib/utils";

function PharmacyContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const id = searchParams.get('id');

    const { addToCart, items, updateQuantity, removeFromCart } = useCart();

    const [pharmacy, setPharmacy] = useState<Pharmacy | null>(null);
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeCategory, setActiveCategory] = useState<string>("all");
    const [searchQuery, setSearchQuery] = useState("");
    const [displayMode, setDisplayMode] = useState<"grid" | "list">("grid");

    useEffect(() => {
        const fetchData = async () => {
            if (!id) return;
            try {
                const pharmData = await firebaseService.getPharmacyById(id);
                setPharmacy(pharmData);
                const invData = await firebaseService.getPharmacyInventory(id);
                setProducts(invData);
            } catch (error) {
                console.error("Error fetching pharmacy details:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id]);

    const categories = [
        { id: "all", label: "Tout" },
        { id: "medicament", label: "Médicaments" },
        { id: "parapharmacie", label: "Parapharmacie" },
        { id: "materiel", label: "Matériel" },
    ];

    const filteredProducts = products.filter(p => {
        const matchesCategory = activeCategory === "all" || p.category === activeCategory;
        const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (p.description && p.description.toLowerCase().includes(searchQuery.toLowerCase()));
        return matchesCategory && matchesSearch;
    });

    const getStatusColor = (status: string) => {
        switch (status) {
            case "open": return "text-green-400 bg-green-400/20 border-green-400/30";
            case "guard": return "text-purple-400 bg-purple-400/20 border-purple-400/30";
            case "closed": return "text-red-400 bg-red-400/20 border-red-400/30";
            default: return "text-muted-foreground bg-secondary/50";
        }
    };

    const getStatusText = (status: string) => {
        switch (status) {
            case "open": return "Ouverte";
            case "guard": return "De Garde";
            case "closed": return "Fermée";
            default: return status;
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-background flex flex-col items-center justify-center space-y-4">
                <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
                <p className="text-muted-foreground animate-pulse font-medium">Chargement de la pharmacie...</p>
            </div>
        );
    }

    if (!pharmacy) {
        return (
            <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center">
                <div className="w-20 h-20 bg-secondary rounded-full flex items-center justify-center mb-4">
                    <Info size={32} className="text-muted-foreground" />
                </div>
                <h1 className="text-2xl font-bold mb-2">Pharmacie introuvable</h1>
                <p className="text-muted-foreground mb-6">Impossible de charger les informations de cette pharmacie.</p>
                <div className="flex gap-4">
                    <button
                        onClick={() => router.back()}
                        className="px-6 py-3 bg-secondary text-foreground rounded-xl font-bold hover:brightness-110 transition-all"
                    >
                        Retour
                    </button>
                    <button
                        onClick={() => window.location.reload()}
                        className="px-6 py-3 bg-primary text-white rounded-xl font-bold hover:brightness-110 transition-all"
                    >
                        Réessayer
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background pb-nav">
            {/* Premium Sticky Header */}
            <div className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border transition-all duration-300">
                <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
                    <button
                        onClick={() => router.back()}
                        className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-secondary transition-colors"
                    >
                        <ArrowLeft size={20} className="text-foreground" />
                    </button>
                    <h2 className="text-sm font-bold text-foreground line-clamp-1 flex-1 px-4 text-center">
                        {pharmacy.name}
                    </h2>
                    <div className="w-10" /> {/* Spacer */}
                </div>
            </div>

            {/* Hero Section - Clean & Modern */}
            <div className="relative pt-6 px-5 pb-8 overflow-hidden bg-background">
                {/* Visual Accent */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -mr-32 -mt-32" />

                <div className="max-w-7xl mx-auto relative z-10 space-y-6">
                    <div className="flex flex-wrap items-center gap-3">
                        <span className={cn(
                            "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border shadow-sm",
                            getStatusColor(pharmacy.status)
                        )}>
                            {getStatusText(pharmacy.status)}
                        </span>
                        {pharmacy.rating && (
                            <div className="flex items-center gap-1.5 bg-amber-500/10 border border-amber-500/20 px-3 py-1 rounded-full text-amber-600 dark:text-amber-400">
                                <Star size={12} className="fill-current" />
                                <span className="text-[10px] font-black">{pharmacy.rating.toFixed(1)}</span>
                            </div>
                        )}
                        {pharmacy.isVerified && (
                            <span className="bg-blue-500/10 text-blue-600 border border-blue-500/20 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider">VÉRIFIÉ</span>
                        )}
                    </div>

                    <div className="space-y-2">
                        <h1 className="text-3xl md:text-4xl font-black text-foreground tracking-tight leading-tight">
                            {pharmacy.name}
                        </h1>
                        <div className="flex items-start gap-2 text-muted-foreground group">
                            <MapPin size={16} className="mt-0.5 shrink-0 text-primary" />
                            <p className="text-sm font-medium leading-relaxed italic">
                                {pharmacy.location.address || pharmacy.location.city}
                            </p>
                        </div>
                    </div>

                    {/* Quick Info & Action Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {pharmacy.phone && (
                            <div className="flex items-center justify-between p-4 bg-card border border-border rounded-2xl shadow-sm hover:shadow-md transition-shadow group">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-primary/5 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                                        <Phone size={18} />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider leading-none mb-1">Téléphone</span>
                                        <span className="text-sm font-black text-foreground">{pharmacy.phone}</span>
                                    </div>
                                </div>
                                <a
                                    href={`tel:${pharmacy.phone}`}
                                    className="px-4 py-2 bg-primary text-primary-foreground text-[10px] font-black rounded-lg hover:shadow-lg hover:shadow-primary/25 transition-all active:scale-95"
                                >
                                    APPELER
                                </a>
                            </div>
                        )}

                        <div className="flex items-center justify-between p-4 bg-card border border-border rounded-2xl shadow-sm hover:shadow-md transition-shadow group">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-primary/5 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                                    <Navigation2 size={18} />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider leading-none mb-1">Itinéraire</span>
                                    <span className="text-sm font-black text-foreground">Google Maps</span>
                                </div>
                            </div>
                            <a
                                href={`https://www.google.com/maps/dir/?api=1&destination=${pharmacy.location.lat || 12.3656},${pharmacy.location.lng || -1.5339}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-4 py-2 bg-secondary text-foreground text-[10px] font-black rounded-lg hover:bg-border transition-all active:scale-95"
                            >
                                Y ALLER
                            </a>
                        </div>
                    </div>

                    {/* Additional Options */}
                    {pharmacy.phone && (
                        <a
                            href={`https://wa.me/226${pharmacy.phone.replace(/[^0-9]/g, '')}?text=Bonjour ${pharmacy.name}, je voudrais vérifier la disponibilité d'un médicament.`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full py-4 bg-[#25D366] hover:bg-[#128C7E] text-white rounded-2xl flex items-center justify-center gap-3 shadow-lg shadow-green-500/20 active:scale-[0.98] transition-all group"
                        >
                            <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" className="group-hover:rotate-12 transition-transform"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.355-5.298c0-5.457 4.432-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" /></svg>
                            <span className="font-bold tracking-tight">Contact WhatsApp</span>
                        </a>
                    )}
                </div>
            </div>

            {/* Inventory Body */}
            <div className="px-5 space-y-6">
                {/* Search & Categories Container */}
                <div className="space-y-4">
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
                        <input
                            type="text"
                            placeholder="Chercher un médicament..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-card border border-border pl-11 pr-4 py-4 rounded-2xl text-sm font-medium focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                        />
                    </div>

                    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide py-1">
                        {categories.map(cat => (
                            <button
                                key={cat.id}
                                onClick={() => setActiveCategory(cat.id)}
                                className={cn(
                                    "px-5 py-2.5 rounded-full text-xs font-black whitespace-nowrap transition-all border shadow-sm active:scale-95 uppercase tracking-wider",
                                    activeCategory === cat.id
                                        ? "bg-primary text-primary-foreground border-primary"
                                        : "bg-card border-border text-muted-foreground hover:bg-secondary"
                                )}
                            >
                                {cat.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Products List Rendering */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between px-1">
                        <h2 className="font-black text-lg text-foreground tracking-tight">
                            Catalogue local
                        </h2>
                        <div className="flex items-center p-1 bg-secondary/50 rounded-xl gap-1">
                            <button
                                onClick={() => setDisplayMode("grid")}
                                className={cn("p-2 rounded-lg transition-all", displayMode === "grid" ? "bg-card shadow-sm text-primary" : "text-muted-foreground")}
                            >
                                <LayoutGrid size={18} />
                            </button>
                            <button
                                onClick={() => setDisplayMode("list")}
                                className={cn("p-2 rounded-lg transition-all", displayMode === "list" ? "bg-card shadow-sm text-primary" : "text-muted-foreground")}
                            >
                                <List size={18} />
                            </button>
                        </div>
                    </div>

                    {filteredProducts.length > 0 ? (
                        <div className={cn(
                            "grid gap-4",
                            displayMode === "grid" ? "grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" : "grid-cols-1"
                        )}>
                            {filteredProducts.map(product => {
                                const cartItem = items.find(item => item.product.id === product.id && item.pharmacyId === pharmacy!.id);
                                return (
                                    <ProductCard
                                        key={product.id}
                                        product={product as Product}
                                        variant={displayMode}
                                        quantity={cartItem?.quantity || 0}
                                        onAddToCart={() => addToCart(product, pharmacy!)}
                                        onIncrement={() => addToCart(product, pharmacy!)}
                                        onDecrement={() => {
                                            if (cartItem && cartItem.quantity > 1) {
                                                updateQuantity(product.id, cartItem.quantity - 1);
                                            } else {
                                                removeFromCart(product.id);
                                            }
                                        }}
                                    />
                                );
                            })}
                        </div>
                    ) : (
                        <div className="py-24 flex flex-col items-center justify-center text-center bg-card/40 rounded-[2.5rem] border border-dashed border-border/50">
                            <div className="w-20 h-20 bg-background rounded-full flex items-center justify-center mb-6 shadow-sm">
                                <Search className="w-8 h-8 text-muted-foreground/30" />
                            </div>
                            <h3 className="font-black text-xl text-foreground">Aucun produit</h3>
                            <p className="text-sm text-muted-foreground mt-2 max-w-[240px] font-medium leading-relaxed">
                                Nous n'avons trouvé aucun médicament correspondant à cette recherche.
                            </p>
                            <button
                                onClick={() => { setSearchQuery(""); setActiveCategory("all"); }}
                                className="mt-6 text-primary text-xs font-black uppercase tracking-widest hover:underline"
                            >
                                RÉINITIALISER
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default function PharmacyPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-background flex flex-col items-center justify-center space-y-4">
                <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
            </div>
        }>
            <PharmacyContent />
        </Suspense>
    );
}
