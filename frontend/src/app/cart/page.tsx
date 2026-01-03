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
                    <button onClick={() => router.back()} className="p-2 hover:bg-secondary rounded-full">
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
                <section className="bg-card dark:bg-zinc-900 rounded-3xl p-4 shadow-sm space-y-4">
                    {items.length === 0 ? (
                        <div className="text-center py-12">
                            <div className="text-6xl mb-4">🛒</div>
                            <h3 className="font-bold text-xl mb-2">Panier vide</h3>
                            <p className="text-muted-foreground mb-6">Ajoutez des produits pour commencer</p>
                            <button
                                onClick={() => router.push("/")}
                                className="px-6 py-3 bg-primary text-primary-foreground rounded-xl font-semibold"
                            >
                                Commencer mes achats
                            </button>
                        </div>
                    ) : (
                        items.map(item => (
                            <div key={item.id} className="flex gap-4 pb-4 border-b border-border last:border-0">
                                <div className="w-20 h-20 bg-gradient-to-br from-primary/10 to-primary/5 rounded-xl flex items-center justify-center flex-shrink-0">
                                    💊
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-bold mb-1">{item.name}</h3>
                                    <div className="text-lg font-bold text-primary mb-2">{item.price} FCFA</div>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => updateQuantity(item.id, -1)}
                                            className="w-8 h-8 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition flex items-center justify-center"
                                        >
                                            {item.quantity === 1 ? <Trash2 size={16} /> : <Minus size={16} />}
                                        </button>
                                        <div className="w-12 text-center font-bold">{item.quantity}</div>
                                        <button
                                            onClick={() => updateQuantity(item.id, 1)}
                                            className="w-8 h-8 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition flex items-center justify-center"
                                        >
                                            <Plus size={16} />
                                        </button>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-sm text-muted-foreground mb-1">Sous-total</div>
                                    <div className="text-xl font-bold">{item.price * item.quantity}</div>
                                    <div className="text-xs text-muted-foreground">FCFA</div>
                                </div>
                            </div>
                        ))
                    )}
                </section>

                {items.length > 0 && (
                    <>
                        {/* Delivery Mode */}
                        <section className="bg-white rounded-3xl p-5 shadow-sm">
                            <h2 className="font-bold text-lg mb-4">Mode de récupération</h2>
                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    onClick={() => setDeliveryMode("delivery")}
                                    className={cn(
                                        "p-4 rounded-2xl border-2 flex flex-col items-center gap-2 transition-all",
                                        deliveryMode === "delivery"
                                            ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                                            : "border-border bg-secondary/30"
                                    )}
                                >
                                    <Truck className={cn("w-8 h-8", deliveryMode === "delivery" ? "text-primary" : "text-muted-foreground")} />
                                    <span className="font-semibold">Livraison</span>
                                    <span className="text-xs text-muted-foreground">1000 FCFA</span>
                                </button>
                                <button
                                    onClick={() => setDeliveryMode("pickup")}
                                    className={cn(
                                        "p-4 rounded-2xl border-2 flex flex-col items-center gap-2 transition-all",
                                        deliveryMode === "pickup"
                                            ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                                            : "border-border bg-secondary/30"
                                    )}
                                >
                                    <MapPin className={cn("w-8 h-8", deliveryMode === "pickup" ? "text-primary" : "text-muted-foreground")} />
                                    <span className="font-semibold">Retrait</span>
                                    <span className="text-xs text-muted-foreground">Gratuit</span>
                                </button>
                            </div>
                        </section>

                        {/* Summary */}
                        <section className="bg-white rounded-3xl p-5 shadow-sm">
                            <h2 className="font-bold text-lg mb-4">Récapitulatif</h2>
                            <div className="space-y-3">
                                <div className="flex justify-between text-muted-foreground">
                                    <span>Sous-total</span>
                                    <span className="font-semibold">{subtotal} FCFA</span>
                                </div>
                                <div className="flex justify-between text-muted-foreground">
                                    <span>Livraison</span>
                                    <span className="font-semibold">{deliveryFee > 0 ? `${deliveryFee} FCFA` : "Gratuit"}</span>
                                </div>
                                <div className="border-t border-dashed pt-3 flex justify-between text-xl font-bold">
                                    <span>Total</span>
                                    <span className="text-primary">{total} FCFA</span>
                                </div>
                            </div>
                        </section>
                    </>
                )}
            </div>

            {/* Fixed Bottom Button */}
            {items.length > 0 && (
                <div className="fixed bottom-0 left-0 right-0 p-4 bg-card dark:bg-zinc-900 border-t border-border z-20">
                    <button
                        onClick={() => router.push("/checkout")}
                        className="w-full py-4 bg-primary text-primary-foreground text-lg font-bold rounded-2xl shadow-2xl hover:opacity-90 transition active:scale-[0.98]"
                    >
                        Passer au paiement • {total} FCFA
                    </button>
                </div>
            )}
        </main>
    );
}
