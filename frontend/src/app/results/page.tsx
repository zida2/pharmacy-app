"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { firebaseService } from "@/services/firebaseService";
import { Pharmacy, Product } from "@/services/types";
import PharmacyCard from "@/components/PharmacyCard";
import { ArrowLeft, SlidersHorizontal, MapIcon, Search } from "lucide-react";
import { cn } from "@/lib/utils";

export default function ResultsPage() {
    return (
        <Suspense fallback={<div className="p-4 text-center">Chargement...</div>}>
            <ResultsContent />
        </Suspense>
    );
}

function ResultsContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const query = searchParams.get("q") || "";

    const [results, setResults] = useState<{ pharmacy: Pharmacy; product?: Product }[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filterDistance, setFilterDistance] = useState<number>(10);
    const [filterOpenOnly, setFilterOpenOnly] = useState(false);
    const [showFilters, setShowFilters] = useState(false);

    useEffect(() => {
        loadResults();
    }, [query]);

    const loadResults = async () => {
        setIsLoading(true);
        try {
            const data = await firebaseService.searchMedicines(query);
            setResults(data);
        } catch (error) {
            console.error("Search failed", error);
        } finally {
            setIsLoading(false);
        }
    };

    const filteredResults = results.filter(r => {
        if (filterOpenOnly && r.pharmacy.status !== "open") return false;
        if (r.pharmacy.distance && r.pharmacy.distance > filterDistance) return false;
        return true;
    });

    return (
        <main className="min-h-screen bg-background pb-nav overflow-x-hidden">
            {/* Header */}
            <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-xl border-b border-border pt-safe">
                <div className="flex items-center gap-4 p-4 max-w-lg mx-auto">
                    <button
                        onClick={() => router.back()}
                        className="btn-icon hover:bg-secondary text-foreground"
                    >
                        <ArrowLeft className="w-6 h-6" />
                    </button>
                    <div className="flex-1">
                        <h1 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground mb-0.5">Résultats</h1>
                        <p className="text-xl font-black text-foreground max-w-[150px] truncate leading-none italic">"{query}"</p>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className={cn(
                                "btn-icon relative",
                                showFilters ? "bg-primary text-white shadow-lg" : "hover:bg-secondary text-foreground"
                            )}
                        >
                            <SlidersHorizontal className="w-6 h-6" />
                            {(filterOpenOnly || filterDistance < 10) && (
                                <div className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></div>
                            )}
                        </button>
                        <button
                            onClick={() => router.push(`/map?q=${encodeURIComponent(query)}`)}
                            className="btn-icon hover:bg-secondary text-foreground bg-secondary/50"
                        >
                            <MapIcon className="w-6 h-6" />
                        </button>
                    </div>
                </div>

                {/* Filters Panel - Modern Glass */}
                {showFilters && (
                    <div className="p-5 border-t border-border animate-in slide-in-from-top-4 duration-300 max-w-lg mx-auto">
                        <div className="space-y-6">
                            <div>
                                <div className="flex justify-between items-center mb-3">
                                    <label className="text-sm font-black uppercase tracking-widest text-muted-foreground">
                                        Distance: <span className="text-primary">{filterDistance} km</span>
                                    </label>
                                </div>
                                <input
                                    type="range"
                                    min="2"
                                    max="20"
                                    step="1"
                                    value={filterDistance}
                                    onChange={(e) => setFilterDistance(Number(e.target.value))}
                                    className="w-full accent-primary h-2 bg-secondary rounded-lg appearance-none cursor-pointer"
                                />
                            </div>

                            <label className="flex items-center justify-between p-4 rounded-2xl bg-secondary/30 border border-border cursor-pointer transition-all hover:bg-secondary/50">
                                <span className="font-bold text-foreground italic">Pharmacies de garde uniquement</span>
                                <input
                                    type="checkbox"
                                    checked={filterOpenOnly}
                                    onChange={(e) => setFilterOpenOnly(e.target.checked)}
                                    className="w-6 h-6 rounded-lg accent-primary border-2 border-border"
                                />
                            </label>
                        </div>
                    </div>
                )}
            </header>

            {/* Results Header */}
            <div className="p-6 max-w-lg mx-auto">
                <div className="flex items-center gap-3">
                    <div className="h-[1px] flex-1 bg-border" />
                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                        {isLoading ? (
                            "Recherche..."
                        ) : (
                            `${filteredResults.length} RÉSULTATS DÉTECTÉS`
                        )}
                    </p>
                    <div className="h-[1px] flex-1 bg-border" />
                </div>
            </div>

            {/* Results List */}
            <div className="px-4 space-y-6 max-w-lg mx-auto">
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-32 space-y-4">
                        <div className="flex gap-2">
                            <div className="w-4 h-4 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                            <div className="w-4 h-4 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                            <div className="w-4 h-4 bg-primary rounded-full animate-bounce"></div>
                        </div>
                        <p className="font-black text-primary italic animate-pulse">Scanning Ouagadougou...</p>
                    </div>
                ) : filteredResults.length === 0 ? (
                    <div className="text-center py-32 animate-in fade-in duration-700">
                        <div className="w-24 h-24 bg-secondary rounded-full flex items-center justify-center mx-auto mb-6">
                            <Search className="w-10 h-10 text-muted-foreground opacity-20" />
                        </div>
                        <h3 className="text-2xl font-black mb-2 italic">Aucun scan concluant</h3>
                        <p className="text-muted-foreground max-w-[200px] mx-auto text-sm">
                            Veuillez ajuster vos filtres de recherche.
                        </p>
                    </div>
                ) : (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-5 duration-700">
                        {filteredResults.map(({ pharmacy, product }) => (
                            <PharmacyCard
                                key={`${pharmacy.id}-${product?.id || 'no-product'}`}
                                pharmacy={pharmacy}
                                product={product ? {
                                    name: product.name,
                                    price: product.price || 0,
                                    id: product.id
                                } : undefined}
                            />
                        ))}
                    </div>
                )}
            </div>
        </main>
    );
}
