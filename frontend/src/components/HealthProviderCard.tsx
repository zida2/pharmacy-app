"use client";

import React from "react";
import { HealthProvider } from "@/services/types";
import { MapPin, Phone, Star, Navigation2, ShoppingBag, Calendar, Activity, ShieldCheck, Stethoscope } from "lucide-react";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

interface HealthProviderCardProps {
    provider: HealthProvider;
    onSelect?: () => void;
    onBook?: (provider: HealthProvider) => void;
    onReport?: (provider: HealthProvider) => void;
    isSelected?: boolean;
    showActions?: boolean;
}

export default function HealthProviderCard({
    provider,
    onSelect,
    onBook,
    onReport,
    isSelected,
    showActions = true
}: HealthProviderCardProps) {
    const router = useRouter();

    const getStatusColor = (status: string) => {
        switch (status) {
            case "open": return "text-green-600 dark:text-green-400 bg-green-500/10";
            case "guard": return "text-purple-600 dark:text-purple-400 bg-purple-500/10";
            case "closed": return "text-red-600 dark:text-red-400 bg-red-500/10";
            case "available": return "text-blue-600 dark:text-blue-400 bg-blue-500/10";
            default: return "text-muted-foreground bg-secondary/50";
        }
    };

    const getStatusText = (status: string) => {
        switch (status) {
            case "open": return "🟢 Ouvert";
            case "guard": return "🟣 De Garde";
            case "closed": return "🔴 Fermé";
            case "available": return "🔵 Disponible";
            default: return status;
        }
    };

    const getTypeIcon = (type: string) => {
        switch (type) {
            case "pharmacy": return <ShoppingBag className="w-3.5 h-3.5" />;
            case "clinic":
            case "hospital": return <Activity className="w-3.5 h-3.5" />;
            case "dentist": return <Stethoscope className="w-3.5 h-3.5" />;
            case "insurance": return <ShieldCheck className="w-3.5 h-3.5" />;
            default: return <MapPin className="w-3.5 h-3.5" />;
        }
    };

    const getTypeLabel = (type: string) => {
        switch (type) {
            case "pharmacy": return "PHARMACIE";
            case "clinic": return "CLINIQUE";
            case "hospital": return "HÔPITAL";
            case "dentist": return "DENTISTE";
            case "insurance": return "ASSURANCE";
            default: return type;
        }
    };

    return (
        <div
            onClick={onSelect}
            className={cn(
                "snap-center min-w-[300px] p-4 rounded-3xl bg-card border border-border/60 shadow-lg transition-all cursor-pointer hover:shadow-xl active:scale-[0.98] duration-300 relative",
                isSelected ? "ring-4 ring-primary/20 border-primary" : ""
            )}
        >
            {/* Header */}
            <div className="flex justify-between items-start mb-3">
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                        <span className="flex items-center gap-1 text-[9px] font-black uppercase text-muted-foreground bg-secondary px-1.5 py-0.5 rounded">
                            {getTypeIcon(provider.type)}
                            {getTypeLabel(provider.type)}
                        </span>
                        {provider.gps_validated && (
                            <span className="text-[9px] font-black text-blue-500 bg-blue-500/10 px-1.5 py-0.5 rounded uppercase">
                                GPS PRÉCIS
                            </span>
                        )}
                    </div>
                    <h3 className="font-black text-lg text-foreground mb-1 leading-tight truncate">{provider.name}</h3>
                    <div className="flex flex-wrap gap-1.5">
                        <span className={cn("inline-block px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider", getStatusColor(provider.status))}>
                            {getStatusText(provider.status)}
                        </span>
                        {provider.isVerified && (
                            <span className="bg-amber-500/10 text-amber-600 dark:text-amber-500 px-2 py-0.5 rounded-full text-[9px] font-black uppercase">OFFICIEL</span>
                        )}
                    </div>
                </div>
                {provider.rating && (
                    <div className="flex items-center gap-1 bg-amber-500/10 px-2.5 py-1 rounded-xl shrink-0">
                        <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                        <span className="text-[11px] font-black text-amber-700 dark:text-amber-500">{provider.rating.toFixed(1)}</span>
                    </div>
                )}
            </div>

            {/* Address */}
            <div className="grid grid-cols-1 gap-1.5 mb-4">
                <div className="flex items-center gap-2.5 text-[11px] text-zinc-500 dark:text-zinc-400 font-medium">
                    <div className="w-7 h-7 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center shrink-0">
                        <MapPin className="w-3.5 h-3.5 text-zinc-600 dark:text-zinc-300" />
                    </div>
                    <span className="line-clamp-1 italic">{provider.location.address || provider.location.city || "Adresse non disponible"}</span>
                </div>

                {/* Info Bar */}
                <div className="flex items-center justify-between mt-1">
                    {/* Distance (Fake for now if not calculated) */}
                    <div className="flex items-center gap-1.5 text-[10px] font-black text-primary bg-primary/5 px-2.5 py-1 rounded-full w-fit">
                        <Navigation2 className="w-2.5 h-2.5" />
                        <span>-- km</span>
                    </div>

                    {provider.phone && (
                        <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground font-bold italic opacity-70">
                            <Phone className="w-2.5 h-2.5" />
                            <span>{provider.phone}</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Actions */}
            {showActions && (
                <div className="flex gap-2">
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            // Detail logic would go here
                        }}
                        className="btn btn-secondary flex-1 py-1.5 text-[11px]"
                    >
                        Explorer
                    </button>

                    {provider.type === 'pharmacy' ? (
                        <button
                            className="btn btn-primary flex-[1.4] py-1.5 gap-1.5 text-[11px]"
                            onClick={(e) => {
                                e.stopPropagation();
                                router.push(`/pharmacy?id=${provider.id}`);
                            }}
                        >
                            <ShoppingBag size={12} />
                            COMMANDER
                        </button>
                    ) : (
                        <button
                            className="btn btn-primary flex-[1.4] py-1.5 gap-1.5 text-[11px] bg-blue-600 hover:bg-blue-700 text-white border-none"
                            onClick={(e) => {
                                e.stopPropagation();
                                if (onBook) onBook(provider);
                            }}
                        >
                            <Calendar size={12} />
                            RENDEZ-VOUS
                        </button>
                    )}

                    {/* Report small button */}
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            if (onReport) onReport(provider);
                        }}
                        className="absolute top-4 right-4 p-1.5 text-zinc-300 hover:bg-red-50 hover:text-red-500 rounded-full transition-colors"
                        title="Signaler un problème"
                    >
                        <ShieldCheck size={14} />
                    </button>
                </div>
            )}
        </div>
    );
}
