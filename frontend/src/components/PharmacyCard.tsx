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
                "snap-center min-w-[320px] p-6 rounded-[2rem] glass-card transition-all cursor-pointer hover:shadow-2xl active:scale-95 duration-300",
                isSelected ? "ring-4 ring-primary/30 border-primary" : "border-border/40"
            )}
        >
            {/* Header */}
            <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                    <h3 className="font-extrabold text-xl text-foreground mb-1 leading-tight">{pharmacy.name}</h3>
                    <div className="flex gap-2">
                        <span className={cn("inline-block px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm", getStatusColor(pharmacy.status))}>
                            {getStatusText(pharmacy.status)}
                        </span>
                        {pharmacy.isVerified && (
                            <span className="bg-blue-500/10 text-blue-500 dark:text-blue-400 px-2 py-1 rounded-full text-[10px] font-bold">VÉRIFIÉ</span>
                        )}
                    </div>
                </div>
                {pharmacy.rating && (
                    <div className="flex items-center gap-1 bg-amber-500/10 px-3 py-1.5 rounded-2xl">
                        <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
                        <span className="text-sm font-black text-amber-700 dark:text-amber-500">{pharmacy.rating.toFixed(1)}</span>
                    </div>
                )}
            </div>

            {/* Address & Distance */}
            <div className="grid grid-cols-1 gap-2 mb-6">
                {pharmacy.location.address && (
                    <div className="flex items-center gap-3 text-sm text-muted-foreground/80 font-medium">
                        <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
                            <MapPin className="w-4 h-4" />
                        </div>
                        <span className="line-clamp-1 italic">{pharmacy.location.address}</span>
                    </div>
                )}
                <div className="flex items-center gap-4">
                    {pharmacy.distance && (
                        <div className="flex items-center gap-2 text-sm font-black text-primary bg-primary/5 px-3 py-1 rounded-full">
                            <Navigation2 className="w-3 h-3" />
                            <span>{pharmacy.distance.toFixed(1)} km</span>
                        </div>
                    )}
                    {pharmacy.phone && (
                        <div className="flex items-center gap-2 text-xs text-muted-foreground font-bold italic">
                            <Phone className="w-3 h-3" />
                            <span>{pharmacy.phone}</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Product Info - Modern Highlight */}
            {product && (
                <div className="mb-6 p-4 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent rounded-[1.5rem] border border-primary/20 shadow-inner relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-16 h-16 bg-primary/5 rounded-full -mr-8 -mt-8 blur-2xl" />
                    <div className="relative z-10 flex justify-between items-center">
                        <div>
                            <div className="text-[10px] font-black text-primary uppercase tracking-tighter mb-0.5">Disponibilité immédiate</div>
                            <div className="font-extrabold text-foreground text-lg">{product.name}</div>
                        </div>
                        <div className="text-right">
                            <div className="text-2xl font-black text-primary font-mono">{product.price}</div>
                            <div className="text-[10px] font-bold text-muted-foreground uppercase">FCFA</div>
                        </div>
                    </div>
                </div>
            )}

            {/* Actions - Premium Buttons */}
            {showActions && (
                <div className="flex gap-3">
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            router.push(`/pharmacy?id=${pharmacy.id}`);
                        }}
                        className="btn btn-secondary flex-1"
                    >
                        Explorer
                    </button>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            if (product) {
                                addToCart(product, pharmacy);
                                router.push(`/pharmacy?id=${pharmacy.id}`);
                            } else {
                                router.push(`/pharmacy?id=${pharmacy.id}`);
                            }
                        }}
                        className="btn btn-primary flex-[1.5]"
                    >
                        <ShoppingBag size={18} />
                        Commandez
                    </button>
                </div>
            )}
        </div>
    );
}
