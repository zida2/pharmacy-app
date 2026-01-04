"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Plus, Minus, Trash2, MapPin, Truck } from "lucide-react";
import { cn } from "@/lib/utils";

interface CartItem {
    id: string;
    name: string;
    price: number;
    quantity: number;
    image?: string;
}

export default function CartPage() {
    const router = useRouter();

    const [items, setItems] = useState<CartItem[]>([
        { id: "1", name: "Doliprane 1000mg", price: 1500, quantity: 2 },
        { id: "2", name: "Amoxicilline 500mg", price: 2500, quantity: 1 },
    ]);

    const [deliveryMode, setDeliveryMode] = useState<"delivery" | "pickup">("delivery");
    const deliveryFee = deliveryMode === "delivery" ? 1000 : 0;

    const updateQuantity = (id: string, delta: number) => {
        setItems(items.map(item =>
            item.id === id
                ? { ...item, quantity: Math.max(0, item.quantity + delta) }
                : item
        ).filter(item => item.quantity > 0));
    };

    const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const total = subtotal + deliveryFee;

    return (
        <main className="min-h-screen bg-secondary/20 pb-32">
            {/* Header */}
            <header className="sticky top-0 z-20 bg-card dark:bg-zinc-900 shadow-sm border-b border-border p-4">
                <div className="flex items-center gap-4">
                    <button onClick={() => router.back()} className="btn-icon hover:bg-secondary">
                        <ArrowLeft className="w-6 h-6" />
                    </button>
                    <h1 className="text-xl font-bold">Mon Panier</h1>
                    <span className="ml-auto bg-primary text-primary-foreground w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold">
                        {items.length}
                    </span>
                </div>
            </header>

            <div className="p-4 space-y-4">
                {/* Cart Items */}
                <section className="bg-card dark:bg-zinc-900 rounded-3xl p-3 shadow-sm space-y-3">
                    {items.length === 0 ? (
                        <div className="text-center py-10">
                            <div className="text-5xl mb-3">🛒</div>
                            <h3 className="font-bold text-lg mb-1">Panier vide</h3>
                            <p className="text-xs text-muted-foreground mb-4">Ajoutez des produits pour commencer</p>
                            <button
                                onClick={() => router.push("/")}
                                className="btn btn-primary px-6 py-2 text-sm"
                            >
                                Commencer mes achats
                            </button>
                        </div>
                    ) : (
                        items.map(item => (
                            <div key={item.id} className="flex gap-3 pb-3 border-b border-border last:border-0 last:pb-0 items-center">
                                <div className="w-16 h-16 bg-gradient-to-br from-primary/10 to-primary/5 rounded-xl flex items-center justify-center flex-shrink-0 text-2xl">
                                    💊
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-bold text-sm truncate">{item.name}</h3>
                                    <div className="text-sm font-black text-primary mb-2">{item.price} <span className="text-[10px]">F</span></div>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => updateQuantity(item.id, -1)}
                                            className="w-7 h-7 bg-red-100 dark:bg-red-900/20 text-red-600 rounded-lg hover:bg-red-200 transition flex items-center justify-center"
                                        >
                                            {item.quantity === 1 ? <Trash2 size={12} /> : <Minus size={12} />}
                                        </button>
                                        <div className="w-6 text-center font-bold text-xs">{item.quantity}</div>
                                        <button
                                            onClick={() => updateQuantity(item.id, 1)}
                                            className="w-7 h-7 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition flex items-center justify-center"
                                        >
                                            <Plus size={12} />
                                        </button>
                                    </div>
                                </div>
                                <div className="text-right flex flex-col justify-center">
                                    <div className="text-[10px] text-muted-foreground">Total</div>
                                    <div className="text-sm font-black text-foreground">{item.price * item.quantity}</div>
                                    <div className="text-[8px] font-bold text-muted-foreground uppercase tracking-wider">FCFA</div>
                                </div>
                            </div>
                        ))
                    )}
                </section>

                {items.length > 0 && (
                    <>
                        {/* Delivery Mode */}
                        <section className="bg-card dark:bg-zinc-900 rounded-3xl p-4 shadow-sm">
                            <h2 className="font-black text-sm uppercase tracking-widest mb-3 opacity-60">Mode de récupération</h2>
                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    onClick={() => setDeliveryMode("delivery")}
                                    className={cn(
                                        "p-3 rounded-2xl border-2 flex flex-col items-center gap-1 transition-all",
                                        deliveryMode === "delivery"
                                            ? "border-primary bg-primary/5 ring-4 ring-primary/5"
                                            : "border-border bg-secondary/20"
                                    )}
                                >
                                    <Truck className={cn("w-6 h-6", deliveryMode === "delivery" ? "text-primary" : "text-muted-foreground")} />
                                    <span className="text-xs font-bold font-black">Livraison</span>
                                    <span className="text-[10px] text-muted-foreground">1000 F</span>
                                </button>
                                <button
                                    onClick={() => setDeliveryMode("pickup")}
                                    className={cn(
                                        "p-3 rounded-2xl border-2 flex flex-col items-center gap-1 transition-all",
                                        deliveryMode === "pickup"
                                            ? "border-primary bg-primary/5 ring-4 ring-primary/5"
                                            : "border-border bg-secondary/20"
                                    )}
                                >
                                    <MapPin className={cn("w-6 h-6", deliveryMode === "pickup" ? "text-primary" : "text-muted-foreground")} />
                                    <span className="text-xs font-bold font-black">Retrait</span>
                                    <span className="text-[10px] text-muted-foreground">Gratuit</span>
                                </button>
                            </div>
                        </section>

                        {/* Summary */}
                        <section className="bg-card dark:bg-zinc-900 rounded-3xl p-4 shadow-sm border border-border/40">
                            <h2 className="font-black text-sm uppercase tracking-widest mb-4 opacity-60">Facture</h2>
                            <div className="space-y-2">
                                <div className="flex justify-between text-xs font-medium text-muted-foreground">
                                    <span>Partielle</span>
                                    <span className="text-foreground">{subtotal} F</span>
                                </div>
                                <div className="flex justify-between text-xs font-medium text-muted-foreground">
                                    <span>Livraison</span>
                                    <span className="text-foreground">{deliveryFee > 0 ? `${deliveryFee} F` : "Gratuit"}</span>
                                </div>
                                <div className="border-t border-dashed border-border/50 pt-3 flex justify-between items-end">
                                    <span className="text-sm font-black uppercase tracking-tighter">Net à payer</span>
                                    <div className="text-right">
                                        <div className="text-2xl font-black text-primary leading-none">{total}</div>
                                        <div className="text-[10px] font-black text-muted-foreground uppercase mt-1">Francs CFA</div>
                                    </div>
                                </div>
                            </div>
                        </section>
                    </>
                )}
            </div>

            {/* Fixed Bottom Button */}
            {items.length > 0 && (
                <div className="fixed bottom-0 left-0 right-0 p-4 pb-safe bg-background/80 backdrop-blur-xl border-t border-border z-20">
                    <button
                        onClick={() => router.push("/checkout")}
                        className="btn btn-primary w-full py-3.5 text-sm font-black italic shadow-lg shadow-primary/30"
                    >
                        PASSER À LA CAISSE • {total} FCFA
                    </button>
                </div>
            )}
        </main>
    );
}
