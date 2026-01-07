"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Pharmacy, Product } from "@/services/types";
import { firebaseService } from "@/services/firebaseService";
import { ArrowLeft, MapPin, Phone, Star, Info, Search, Filter, LayoutGrid, List } from "lucide-react";
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
            {/* Header / Banner */}
            <div className="relative h-72 bg-slate-900 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background" />

                {/* Abstract Background Shapes */}
                <div className="absolute -top-20 -right-20 w-96 h-96 bg-primary/20 rounded-full blur-3xl opacity-50 animate-pulse" />
                <div className="absolute top-20 -left-20 w-72 h-72 bg-purple-500/20 rounded-full blur-3xl opacity-50" />

                <div className="relative z-10 px-4 pt-6 h-full flex flex-col justify-between pb-8">
                    <button
                        onClick={() => router.back()}
                        className="w-10 h-10 bg-white/10 backdrop-blur-md border border-white/20 rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-all shadow-lg"
                    >
                        <ArrowLeft size={20} />
                    </button>

                    <div className="space-y-3 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="flex items-center gap-2 mb-2">
                            <span className={cn("px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest border backdrop-blur-md shadow-lg", getStatusColor(pharmacy.status))}>
                                {getStatusText(pharmacy.status)}
                            </span>
                            {pharmacy.rating && (
                                <div className="flex items-center gap-1 bg-amber-500/20 backdrop-blur-md border border-amber-500/30 px-2 py-1 rounded-full text-amber-400">
                                    <Star size={12} className="fill-amber-400" />
                                    <span className="text-xs font-bold">{pharmacy.rating}</span>
                                </div>
                            )}
                        </div>
                        <h1 className="text-3xl sm:text-4xl font-black text-white leading-tight drop-shadow-md">{pharmacy.name}</h1>
                        <div className="flex flex-col gap-2 text-white/90 text-sm font-medium">
                            {pharmacy.location.address && (
                                <div className="flex items-center gap-2 backdrop-blur-sm bg-black/10 w-fit px-2 py-1 rounded-lg">
                                    <MapPin size={14} className="text-primary" />
                                    <span>{pharmacy.location.address}</span>
                                </div>
                            )}
                            {pharmacy.phone && (
                                <div className="flex gap-2">
                                    <div className="flex items-center gap-2 backdrop-blur-sm bg-black/10 w-fit px-2 py-1 rounded-lg">
                                        <Phone size={14} className="text-primary" />
                                        <span>{pharmacy.phone}</span>
                                    </div>
                                    <a
                                        href={`https://wa.me/226${pharmacy.phone.replace(/[^0-9]/g, '')}?text=Bonjour ${pharmacy.name}, je voudrais vérifier la disponibilité d'un médicament.`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-1.5 bg-[#25D366] hover:bg-[#128C7E] text-white px-3 py-1 rounded-lg text-xs font-black uppercase tracking-wide transition-colors shadow-lg animate-pulse"
                                    >
                                        <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.355-5.298c0-5.457 4.432-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" /></svg>
                                        Dispo WhatsApp
                                    </a>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Content Body */}
            <div className="px-4 -mt-4 relative z-20">
                {/* Search & Filter */}
                <div className="sticky top-4 z-40 space-y-3 mb-6">
                    <div className="relative group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4 group-focus-within:text-primary transition-colors" />
                        <input
                            type="text"
                            placeholder="Rechercher un produit dans cette pharmacie..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="input-standard pl-10 bg-card border-none shadow-lg"
                        />
                    </div>

                    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide py-1">
                        {categories.map(cat => (
                            <button
                                key={cat.id}
                                onClick={() => setActiveCategory(cat.id)}
                                className={cn(
                                    "px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all border shadow-sm active:scale-95",
                                    activeCategory === cat.id
                                        ? "bg-primary text-white border-primary shadow-primary/25"
                                        : "bg-background border-border text-muted-foreground hover:bg-secondary"
                                )}
                            >
                                {cat.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Products Grid */}
                <div>
                    <div className="flex items-center justify-between mb-4 px-1">
                        <h2 className="font-bold text-lg flex items-center gap-2 text-foreground">
                            Nos produits
                            <span className="bg-primary/10 text-primary text-xs px-2.5 py-0.5 rounded-full font-black">
                                {filteredProducts.length}
                            </span>
                        </h2>
                        <div className="bg-secondary/50 p-1 rounded-xl flex gap-1">
                            <button
                                onClick={() => setDisplayMode("grid")}
                                className={cn("p-1.5 rounded-lg transition-all", displayMode === "grid" ? "bg-card shadow-sm text-primary" : "text-muted-foreground")}
                            >
                                <LayoutGrid size={18} />
                            </button>
                            <button
                                onClick={() => setDisplayMode("list")}
                                className={cn("p-1.5 rounded-lg transition-all", displayMode === "list" ? "bg-card shadow-sm text-primary" : "text-muted-foreground")}
                            >
                                <List size={18} />
                            </button>
                        </div>
                    </div>

                    {filteredProducts.length > 0 ? (
                        <div className={cn(
                            "grid gap-3",
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
                        <div className="py-20 flex flex-col items-center justify-center text-center opacity-60 bg-secondary/20 rounded-[2rem] border-2 border-dashed border-border/50">
                            <div className="w-16 h-16 bg-background rounded-full flex items-center justify-center mb-4 shadow-sm">
                                <Filter className="w-8 h-8 text-muted-foreground" />
                            </div>
                            <p className="font-bold text-lg text-foreground">Aucun produit trouvé</p>
                            <p className="text-sm text-muted-foreground mt-1 max-w-[200px]">
                                Aucune correspondance pour votre recherche dans cette catégorie.
                            </p>
                            <button
                                onClick={() => { setSearchQuery(""); setActiveCategory("all"); }}
                                className="mt-4 text-primary text-sm font-bold hover:underline"
                            >
                                Effacer les filtres
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
