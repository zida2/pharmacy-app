"use client";

import React, { Suspense, useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { firebaseService } from "@/services/firebaseService";
import { Order } from "@/services/types";
import { cn } from "@/lib/utils";

function OrderContent() {
    const router = useRouter();
    const [orders, setOrders] = useState<Order[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const data = await firebaseService.getUserOrders();
                setOrders(data);
            } catch (error) {
                console.error("Error fetching orders:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchOrders();
    }, []);

    return (
        <main className="min-h-screen bg-background p-6 pb-nav overflow-x-hidden">
            <header className="flex items-center gap-4 mb-8 pt-safe">
                <button onClick={() => router.back()} className="p-3 bg-secondary rounded-2xl transition hover:brightness-110 active:scale-95">
                    <ArrowLeft size={24} />
                </button>
                <h1 className="text-2xl font-black italic">Mes Commandes</h1>
            </header>

            <div className="space-y-4 max-w-lg mx-auto">
                {isLoading ? (
                    <div className="text-center py-20 animate-pulse font-bold text-muted-foreground italic">Chargement de votre historique...</div>
                ) : orders.length === 0 ? (
                    <div className="text-center py-20 bg-secondary/20 rounded-[2.5rem] border-2 border-dashed border-border/50">
                        <p className="font-bold text-muted-foreground">Aucune commande trouvée.</p>
                        <button onClick={() => router.push('/')} className="mt-4 text-primary font-black uppercase text-[10px] tracking-widest">Commencer mes achats</button>
                    </div>
                ) : (
                    orders.map(order => (
                        <div key={order.id} className="glass-card p-6 rounded-[2rem] border-primary/10 hover:border-primary/30 transition-all flex flex-col gap-4">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-[10px] font-black uppercase text-primary tracking-widest mb-1">{order.orderNumber}</p>
                                    <h3 className="font-black text-lg italic leading-tight">{order.items[0]?.productName || "Commande Pharmacie"}</h3>
                                    <p className="text-[10px] text-muted-foreground font-bold uppercase">{order.pharmacyName}</p>
                                </div>
                                <span className={cn(
                                    "px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest shadow-sm",
                                    order.status === 'completed' ? "bg-emerald-500/10 text-emerald-500" :
                                        order.status === 'cancelled' ? "bg-red-500/10 text-red-500" :
                                            "bg-amber-500/10 text-amber-500 animate-pulse"
                                )}>
                                    {order.status}
                                </span>
                            </div>

                            <div className="bg-secondary/30 p-4 rounded-2xl">
                                {order.items.slice(0, 2).map((item, idx) => (
                                    <div key={idx} className="flex justify-between text-xs font-bold mb-1 last:mb-0">
                                        <span className="opacity-70">{item.quantity}x {item.productName}</span>
                                        <span className="font-mono text-foreground/50">{item.totalPrice} F</span>
                                    </div>
                                ))}
                                {order.items.length > 2 && <p className="text-[9px] text-muted-foreground italic mt-1">+ {order.items.length - 2} autres articles</p>}
                            </div>

                            <div className="flex justify-between items-center pt-2 border-t border-border/20">
                                <div className="text-xl font-black text-primary font-mono">
                                    {order.total} <span className="text-[10px]">FCFA</span>
                                </div>
                                <button
                                    onClick={() => router.push("/tracking")}
                                    className="px-4 py-2 bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-primary hover:text-white transition-all shadow-lg shadow-primary/5"
                                >
                                    Suivre →
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </main>
    );
}

export default function OrderPage() {
    return (
        <Suspense fallback={<div className="p-10 text-center font-black italic animate-pulse">PharmaBF...</div>}>
            <OrderContent />
        </Suspense>
    );
}
