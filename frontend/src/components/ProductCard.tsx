"use client";

import React from "react";
import { Product } from "@/services/types";
import { ShoppingCart, Heart, Info, Package, AlertCircle, CheckCircle2, Plus, Minus, Trash2, Star } from "lucide-react";
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
                "flex gap-4 p-4 rounded-2xl border transition-all",
                isAvailable
                    ? "bg-background border-border hover:border-primary/30 hover:shadow-lg"
                    : "bg-secondary/30 border-border/50 opacity-60"
            )}>
                {/* Product Image */}
                <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-primary/10 to-secondary/20 flex items-center justify-center shrink-0 relative overflow-hidden">
                    {product.images && product.images[0] ? (
                        <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
                    ) : (
                        <Package size={32} className="text-primary/40" />
                    )}
                    {!isAvailable && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                            <AlertCircle size={24} className="text-white" />
                        </div>
                    )}
                </div>

                {/* Product Info */}
                <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-foreground line-clamp-1 mb-1">{product.name}</h3>
                    {product.description && (
                        <p className="text-xs text-muted-foreground line-clamp-1 mb-2">{product.description}</p>
                    )}
                    <div className="flex items-center gap-2">
                        <span className="text-lg font-black text-primary font-mono">{product.price}</span>
                        <span className="text-xs font-bold text-muted-foreground">FCFA</span>
                        {product.stock !== undefined && (
                            <span className={cn(
                                "text-[9px] font-black uppercase px-2 py-0.5 rounded-full",
                                product.stock > 10
                                    ? "bg-green-500/10 text-green-600"
                                    : product.stock > 0
                                        ? "bg-amber-500/10 text-amber-600"
                                        : "bg-red-500/10 text-red-600"
                            )}>
                                {product.stock > 0 ? `${product.stock} en stock` : "Rupture"}
                            </span>
                        )}
                    </div>
                </div>

                {/* Actions */}
                {showCart && (
                    <div className="flex flex-col gap-2 shrink-0">
                        {quantity === 0 ? (
                            <button
                                onClick={onAddToCart}
                                disabled={!isAvailable}
                                className={cn(
                                    "btn-icon transition-all",
                                    isAvailable
                                        ? "bg-primary text-white"
                                        : "bg-secondary text-muted-foreground cursor-not-allowed"
                                )}
                            >
                                <ShoppingCart size={18} />
                            </button>
                        ) : (
                            <div className="flex items-center gap-1">
                                <button
                                    onClick={onDecrement}
                                    className="w-8 h-8 bg-red-100 dark:bg-red-900/20 text-red-600 rounded-lg hover:bg-red-200 transition-all flex items-center justify-center"
                                >
                                    {quantity === 1 ? <Trash2 size={14} /> : <Minus size={14} />}
                                </button>
                                <div className="w-8 text-center font-bold text-sm">{quantity}</div>
                                <button
                                    onClick={onIncrement}
                                    className="w-8 h-8 bg-primary text-white rounded-lg hover:brightness-110 transition-all flex items-center justify-center"
                                >
                                    <Plus size={14} />
                                </button>
                            </div>
                        )}
                        <button
                            onClick={() => setIsFavorite(!isFavorite)}
                            className="p-2.5 rounded-xl bg-secondary hover:bg-secondary/80 transition-all"
                        >
                            <Heart size={18} className={cn(isFavorite && "fill-red-500 text-red-500")} />
                        </button>
                    </div>
                )}
            </div>
        );
    }

    // Grid variant (default)
    return (
        <div className={cn(
            "group relative rounded-[1.5rem] overflow-hidden transition-all duration-300",
            isAvailable
                ? "bg-background border-2 border-border hover:border-primary/30 hover:shadow-2xl hover:-translate-y-1"
                : "bg-secondary/30 border-2 border-border/50 opacity-70"
        )}>
            {/* Product Image */}
            <div className="relative aspect-square bg-gradient-to-br from-primary/10 via-secondary/10 to-background overflow-hidden">
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
                        className="ml-auto p-2 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-sm rounded-full shadow-lg hover:scale-110 transition-transform"
                    >
                        <Heart size={16} className={cn(isFavorite && "fill-red-500 text-red-500")} />
                    </button>
                </div>

                {/* Quick info button */}
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        setShowInfo(!showInfo);
                    }}
                    className="absolute bottom-3 right-3 p-2 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-sm rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all"
                >
                    <Info size={16} />
                </button>
            </div>

            {/* Product Details */}
            <div className="p-4 space-y-3">
                {/* Name */}
                <h3 className="font-extrabold text-foreground line-clamp-2 leading-tight min-h-[2.5rem]">
                    {product.name}
                </h3>

                {/* Description */}
                {product.description && (
                    <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                        {product.description}
                    </p>
                )}

                {/* Category & Stock */}
                <div className="flex items-center gap-2 flex-wrap">
                    {product.category && (
                        <span className="text-[9px] font-bold uppercase px-2 py-1 bg-secondary rounded-full text-muted-foreground">
                            {product.category}
                        </span>
                    )}
                    {product.stock !== undefined && isAvailable && (
                        <span className={cn(
                            "text-[9px] font-black uppercase px-2 py-1 rounded-full flex items-center gap-1",
                            product.stock > 10
                                ? "bg-green-500/10 text-green-600"
                                : "bg-amber-500/10 text-amber-600"
                        )}>
                            <CheckCircle2 size={10} />
                            {product.stock} dispo
                        </span>
                    )}
                </div>

                {/* Price & Action */}
                <div className="flex items-center justify-between pt-2 border-t border-border/50">
                    <div>
                        <div className="text-2xl font-black text-primary font-mono leading-none">
                            {product.price}
                        </div>
                        <div className="text-[9px] font-bold text-muted-foreground uppercase">FCFA</div>
                    </div>

                    {showCart && (
                        quantity === 0 ? (
                            <button
                                onClick={onAddToCart}
                                disabled={!isAvailable}
                                className={cn(
                                    "btn px-3 py-2",
                                    isAvailable
                                        ? "bg-primary text-white shadow-lg shadow-primary/20"
                                        : "bg-secondary text-muted-foreground cursor-not-allowed"
                                )}
                            >
                                <ShoppingCart size={16} />
                                <span className="text-xs">Ajouter</span>
                            </button>
                        ) : (
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={onDecrement}
                                    className="w-8 h-8 bg-red-100 dark:bg-red-900/20 text-red-600 rounded-lg hover:bg-red-200 transition-all flex items-center justify-center"
                                >
                                    {quantity === 1 ? <Trash2 size={16} /> : <Minus size={16} />}
                                </button>
                                <div className="w-8 text-center font-bold">{quantity}</div>
                                <button
                                    onClick={onIncrement}
                                    className="w-8 h-8 bg-primary text-white rounded-lg hover:brightness-110 transition-all flex items-center justify-center"
                                >
                                    <Plus size={16} />
                                </button>
                            </div>
                        )
                    )}
                </div>
            </div>

            {/* Info Popup */}
            {showInfo && (
                <div className="absolute inset-0 bg-background/95 backdrop-blur-sm p-4 flex flex-col justify-center animate-in fade-in zoom-in duration-200 z-10">
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            setShowInfo(false);
                        }}
                        className="absolute top-3 right-3 p-2 bg-secondary rounded-full hover:bg-secondary/80 transition"
                    >
                        <Info size={16} />
                    </button>
                    <h4 className="font-bold text-sm mb-3">Informations produit</h4>
                    <div className="space-y-2 text-xs text-muted-foreground">
                        {product.description && <p className="leading-relaxed">{product.description}</p>}
                        {product.category && <p><strong>Catégorie:</strong> {product.category}</p>}
                        {product.requiresPrescription && (
                            <p className="text-amber-600 dark:text-amber-500 font-bold flex items-center gap-1">
                                <AlertCircle size={14} />
                                Ordonnance requise
                            </p>
                        )}
                        {product.stock !== undefined && (
                            <p><strong>Stock disponible:</strong> {product.stock} unités</p>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
