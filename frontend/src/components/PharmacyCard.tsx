"use client";

import React from "react";
import { Pharmacy } from "@/services/types";
import { MapPin, Clock, Phone, Star, Navigation2, ShoppingBag } from "lucide-react";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";

interface PharmacyCardProps {
    pharmacy: Pharmacy;
    product?: {
        name: string;
        price: number;
        id: string;
    };
    onSelect?: () => void;
    isSelected?: boolean;
    showActions?: boolean;
}

export default function PharmacyCard({
    pharmacy,
    product,
    onSelect,
    isSelected,
    showActions = true
}: PharmacyCardProps) {
    const router = useRouter();
    const { addToCart } = useCart();

    const getStatusColor = (status: string) => {
        switch (status) {
            case "open": return "text-green-600 dark:text-green-400 bg-green-500/10";
            case "guard": return "text-purple-600 dark:text-purple-400 bg-purple-500/10";
            case "closed": return "text-red-600 dark:text-red-400 bg-red-500/10";
            default: return "text-muted-foreground bg-secondary/50";
        }
    };

    const getStatusText = (status: string) => {
        switch (status) {
            case "open": return "🟢 Ouverte";
            case "guard": return "🟣 De Garde";
            case "closed": return "🔴 Fermée";
            default: return status;
        }
    };

    return (
        <div
            onClick={onSelect}
            className={cn(
                "snap-center min-w-[300px] p-4 rounded-3xl bg-white border border-border/60 shadow-lg transition-all cursor-pointer hover:shadow-xl active:scale-[0.98] duration-300",
                isSelected ? "ring-4 ring-primary/20 border-primary" : ""
            )}
        >
            {/* Header */}
            <div className="flex justify-between items-start mb-3">
                <div className="flex-1 min-w-0">
                    <h3 className="font-black text-lg text-zinc-900 mb-1 leading-tight truncate">{pharmacy.name}</h3>
                    <div className="flex flex-wrap gap-1.5">
                        <span className={cn("inline-block px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider", getStatusColor(pharmacy.status))}>
                            {getStatusText(pharmacy.status)}
                        </span>
                        {pharmacy.isVerified && (
                            <span className="bg-blue-500/10 text-blue-500 dark:text-blue-400 px-2 py-0.5 rounded-full text-[9px] font-black uppercase">VÉRIFIÉ</span>
                        )}
                    </div>
                </div>
                {pharmacy.rating && (
                    <div className="flex items-center gap-1 bg-amber-500/10 px-2.5 py-1 rounded-xl shrink-0">
                        <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                        <span className="text-[11px] font-black text-amber-700 dark:text-amber-500">{pharmacy.rating.toFixed(1)}</span>
                    </div>
                )}
            </div>

            {/* Address & Distance */}
            <div className="grid grid-cols-1 gap-1.5 mb-4">
                {pharmacy.location.address && (
                    <div className="flex items-center gap-2.5 text-[11px] text-zinc-500 font-medium">
                        <div className="w-7 h-7 rounded-xl bg-zinc-100 flex items-center justify-center shrink-0">
                            <MapPin className="w-3.5 h-3.5" />
                        </div>
                        <span className="line-clamp-1 italic">{pharmacy.location.address}</span>
                    </div>
                )}
                <div className="flex items-center gap-3">
                    {pharmacy.distance && (
                        <div className="flex flex-col gap-0.5">
                            <div className="flex items-center gap-1.5 text-[10px] font-black text-primary bg-primary/5 px-2.5 py-0.5 rounded-full w-fit">
                                <Navigation2 className="w-2.5 h-2.5" />
                                <span>{pharmacy.distance.toFixed(1)} km</span>
                            </div>
                            {(pharmacy as any).isStraightLine && (
                                <span className="text-[7px] font-bold text-zinc-400 uppercase tracking-tighter pl-1">À vol d'oiseau</span>
                            )}
                        </div>
                    )}
                    {pharmacy.phone && (
                        <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground font-bold italic opacity-70">
                            <Phone className="w-2.5 h-2.5" />
                            <span>{pharmacy.phone}</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Product Info - Modern Highlight */}
            {product && (
                <div className="mb-4 p-3.5 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent rounded-2xl border border-primary/20 shadow-inner relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-12 h-12 bg-primary/5 rounded-full -mr-6 -mt-6 blur-2xl" />
                    <div className="relative z-10 flex justify-between items-center gap-4">
                        <div className="min-w-0">
                            <div className="text-[8px] font-black text-primary uppercase tracking-[0.15em] mb-0.5">DISPONIBILITÉ SCAN</div>
                            <div className="font-black text-zinc-900 text-sm truncate uppercase tracking-tighter">{product.name}</div>
                        </div>
                        <div className="text-right shrink-0">
                            <div className="text-xl font-black text-primary font-mono leading-none">{product.price}</div>
                            <div className="text-[8px] font-black text-muted-foreground uppercase opacity-60">FCFA</div>
                        </div>
                    </div>
                </div>
            )}

            {/* Actions - Premium Buttons */}
            {showActions && (
                <div className="flex gap-2">
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            router.push(`/pharmacy?id=${pharmacy.id}`);
                        }}
                        className="btn btn-secondary flex-1 py-1.5"
                    >
                        Explorer
                    </button>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            if (product) {
                                addToCart({
                                    id: product.id,
                                    name: product.name,
                                    price: product.price,
                                    image: undefined
                                } as any, pharmacy);
                                router.push(`/cart`);
                            } else {
                                router.push(`/pharmacy?id=${pharmacy.id}`);
                            }
                        }}
                        className="btn btn-primary flex-[1.4] py-1.5 gap-1.5"
                    >
                        <ShoppingBag size={14} />
                        COMMANDER
                    </button>
                </div>
            )}
        </div>
    );
}
