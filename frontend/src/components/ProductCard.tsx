"use client";

import React from "react";
import { Product } from "@/services/types";
import { ShoppingCart, Heart, Info, Package, AlertCircle, CheckCircle2, Plus, Minus, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProductCardProps {
    product: Product & {
        stock?: number;
        inStock?: boolean;
    };
    quantity?: number;
    onAddToCart?: () => void;
    onIncrement?: () => void;
    onDecrement?: () => void;
    showCart?: boolean;
    variant?: "grid" | "list";
}

export default function ProductCard({
    product,
    quantity = 0,
    onAddToCart,
    onIncrement,
    onDecrement,
    showCart = true,
    variant = "grid"
}: ProductCardProps) {
    const [isFavorite, setIsFavorite] = React.useState(false);
    const [showInfo, setShowInfo] = React.useState(false);

    const isAvailable = product.inStock !== false && (product.stock === undefined || product.stock > 0);

    if (variant === "list") {
        return (
            <div className={cn(
                "flex gap-4 p-4 rounded-2xl border transition-all h-full",
                isAvailable
                    ? "bg-card border-border hover:border-primary/30 hover:shadow-lg"
                    : "bg-secondary/30 border-border/50 opacity-60"
            )}>
                {/* Product Image */}
                <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-primary/10 to-secondary/20 flex items-center justify-center shrink-0 relative overflow-hidden">
                    {product.images && product.images[0] ? (
                        <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
                    ) : (
                        <Package size={32} className="text-primary/40" />
                    )}
                </div>

                {/* Product Info */}
                <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                        <h3 className="font-bold text-foreground line-clamp-1 mb-1">{product.name}</h3>
                        {product.description && (
                            <p className="text-xs text-muted-foreground line-clamp-1 mb-2">{product.description}</p>
                        )}
                        <div className="flex items-center gap-2">
                            <span className="text-lg font-black text-primary font-mono">{product.price}</span>
                            <span className="text-xs font-bold text-muted-foreground uppercase">FCFA</span>
                        </div>
                    </div>

                    {/* Actions In List */}
                    {showCart && (
                        <div className="flex items-center gap-2 mt-2">
                            {quantity === 0 ? (
                                <button
                                    onClick={onAddToCart}
                                    disabled={!isAvailable}
                                    className={cn(
                                        "btn px-4 py-1",
                                        isAvailable ? "bg-primary text-white" : "bg-secondary text-muted-foreground"
                                    )}
                                >
                                    <ShoppingCart size={14} />
                                    <span className="text-[10px]">ACHETER</span>
                                </button>
                            ) : (
                                <div className="flex items-center gap-2 bg-secondary/50 rounded-lg p-0.5">
                                    <button onClick={onDecrement} className="p-1 text-red-500"><Minus size={14} /></button>
                                    <span className="text-xs font-bold">{quantity}</span>
                                    <button onClick={onIncrement} className="p-1 text-primary"><Plus size={14} /></button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        );
    }

    // Grid variant (default)
    return (
        <div className={cn(
            "group relative rounded-[1.5rem] overflow-hidden transition-all duration-300 flex flex-col h-full",
            isAvailable
                ? "bg-card border-2 border-border hover:border-primary/30 hover:shadow-2xl hover:-translate-y-1"
                : "bg-secondary/30 border-2 border-border/50 opacity-70"
        )}>
            {/* Product Image */}
            <div className="relative aspect-square bg-gradient-to-br from-primary/10 via-secondary/10 to-background overflow-hidden shrink-0">
                {product.images && product.images[0] ? (
                    <img
                        src={product.images[0]}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center">
                        <Package size={64} className="text-primary/20" />
                    </div>
                )}

                {/* Overlay badges */}
                <div className="absolute top-3 left-3 right-3 flex justify-between items-start">
                    {!isAvailable && (
                        <span className="px-3 py-1 bg-red-500 text-white text-[9px] font-black uppercase rounded-full shadow-lg flex items-center gap-1">
                            <AlertCircle size={12} />
                            Rupture
                        </span>
                    )}
                    {isAvailable && product.stock !== undefined && product.stock <= 5 && product.stock > 0 && (
                        <span className="px-3 py-1 bg-amber-500 text-white text-[9px] font-black uppercase rounded-full shadow-lg">
                            Derniers stocks
                        </span>
                    )}
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            setIsFavorite(!isFavorite);
                        }}
                        className="ml-auto p-2 bg-white dark:bg-zinc-900 rounded-full shadow-lg hover:scale-110 transition-transform"
                    >
                        <Heart size={16} className={cn(isFavorite && "fill-red-500 text-red-500")} />
                    </button>
                </div>
            </div>

            {/* Product Details */}
            <div className="p-3 flex-1 flex flex-col">
                <div className="flex-1 space-y-2 mb-3">
                    <h3 className="font-extrabold text-foreground line-clamp-2 leading-tight min-h-[2.2rem] text-sm">
                        {product.name}
                    </h3>

                    {product.description && (
                        <p className="text-[11px] text-muted-foreground line-clamp-2 leading-relaxed h-[2.2rem]">
                            {product.description}
                        </p>
                    )}

                    <div className="flex items-center gap-1.5 flex-wrap">
                        {product.category && (
                            <span className="text-[8px] font-bold uppercase px-2 py-0.5 bg-secondary rounded-full text-muted-foreground border border-border/50">
                                {product.category}
                            </span>
                        )}
                        {product.stock !== undefined && isAvailable && (
                            <span className={cn(
                                "text-[8px] font-black uppercase px-2 py-0.5 rounded-full",
                                product.stock > 10
                                    ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                                    : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                            )}>
                                {product.stock} dispo
                            </span>
                        )}
                    </div>
                </div>

                {/* Bottom Row: Price & Actions */}
                <div className="space-y-3 pt-3 border-t border-border/50">
                    <div className="flex items-baseline gap-1">
                        <span className="text-xl font-black text-primary font-mono">{product.price}</span>
                        <span className="text-[9px] font-bold text-muted-foreground uppercase">FCFA</span>
                    </div>

                    {showCart && (
                        quantity === 0 ? (
                            <button
                                onClick={onAddToCart}
                                disabled={!isAvailable}
                                className={cn(
                                    "btn w-full",
                                    isAvailable
                                        ? "bg-primary text-white shadow-lg"
                                        : "bg-secondary text-muted-foreground cursor-not-allowed"
                                )}
                            >
                                <ShoppingCart size={14} />
                                <span className="text-[10px]">ACHETER</span>
                            </button>
                        ) : (
                            <div className="flex items-center justify-between bg-secondary/30 rounded-xl p-1">
                                <button
                                    onClick={onDecrement}
                                    className="w-8 h-8 bg-card text-foreground rounded-lg shadow-sm hover:text-red-500 transition-all flex items-center justify-center"
                                >
                                    {quantity === 1 ? <Trash2 size={14} /> : <Minus size={14} />}
                                </button>
                                <span className="font-black text-sm">{quantity}</span>
                                <button
                                    onClick={onIncrement}
                                    className="w-8 h-8 bg-primary text-white rounded-lg shadow-md hover:brightness-110 transition-all flex items-center justify-center"
                                >
                                    <Plus size={14} />
                                </button>
                            </div>
                        )
                    )}
                </div>
            </div>
        </div>
    );
}
