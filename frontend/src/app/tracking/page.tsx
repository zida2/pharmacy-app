"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, CheckCircle, Package, Truck, Home, Phone, Timer } from "lucide-react";
import { cn } from "@/lib/utils";
import Map from "@/components/Map";
import { firebaseService } from "@/services/firebaseService";
import { Order } from "@/services/types";

export default function TrackingPage() {
    const router = useRouter();
    const [order, setOrder] = useState<Order | null>(null);
    const [status, setStatus] = useState<string>("pending");
    const [eta, setEta] = useState(15);
    const [driverLocation, setDriverLocation] = useState<[number, number]>([-1.5197, 12.3714]);

    useEffect(() => {
        const fetchLatestOrder = async () => {
            const orders = await firebaseService.getUserOrders();
            if (orders.length > 0) {
                setOrder(orders[0]);
                setStatus(orders[0].status);
            }
        };
        fetchLatestOrder();

        // Simulate Driver Movement
        const interval = setInterval(() => {
            setDriverLocation(prev => [
                prev[0] + (Math.random() - 0.5) * 0.001,
                prev[1] + (Math.random() - 0.5) * 0.001
            ]);
            setEta(prev => Math.max(1, prev - 1));
        }, 3000);
        return () => clearInterval(interval);
    }, []);

    // Polling for status updates
    useEffect(() => {
        if (!order) return;
        const interval = setInterval(async () => {
            const updated = await firebaseService.getOrderById(order.id);
            if (updated) setStatus(updated.status);
        }, 5000);
        return () => clearInterval(interval);
    }, [order]);

    const steps = [
        { id: "pending", label: "Attente", icon: <CheckCircle size={16} /> },
        { id: "preparing", label: "Préparé", icon: <Package size={16} /> },
        { id: "delivering", label: "En route", icon: <Truck size={16} /> },
        { id: "completed", label: "Livré", icon: <Home size={16} /> },
    ];

    const currentStepIndex = steps.findIndex(s => s.id === status);

    return (
        <main className="min-h-screen bg-background flex flex-col relative">
            {/* Map Background */}
            <div className="absolute inset-0 z-0">
                <Map
                    initialCenter={driverLocation}
                    initialZoom={14}
                    userLocation={driverLocation}
                />
            </div>

            {/* Header */}
            <header className="absolute top-0 left-0 right-0 z-10 p-4 pt-safe">
                <button
                    onClick={() => router.push('/')}
                    className="p-3 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md rounded-full shadow-lg border border-border/20"
                >
                    <ArrowLeft size={24} className="text-foreground" />
                </button>
            </header>

            {/* Bottom Sheet */}
            <div className="mt-auto z-10 bg-background/90 backdrop-blur-xl rounded-t-[2.5rem] shadow-[0_-10px_40px_rgba(0,0,0,0.1)] p-6 pb-safe border-t border-white/20">

                <div className="w-12 h-1.5 bg-muted rounded-full mx-auto mb-6 opacity-50" />

                <div className="flex justify-between items-start mb-8">
                    <div>
                        <h1 className="text-2xl font-black italic text-foreground mb-1">
                            {status === 'completed' ? 'Commande Livrée' : 'Livraison en cours'}
                        </h1>
                        <p className="text-muted-foreground text-sm font-medium">
                            {status === 'completed' ? 'Merci de votre confiance' : `Votre commande arrive dans ${eta} min`}
                        </p>
                    </div>
                    <div className="bg-primary/10 text-primary p-3 rounded-2xl animate-pulse">
                        <Timer size={24} />
                    </div>
                </div>

                <div className="flex justify-between items-center relative mb-8 px-2">
                    <div className="absolute left-0 right-0 top-1/2 h-1 bg-muted -z-10 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-primary transition-all duration-1000 ease-out"
                            style={{ width: `${(currentStepIndex / (steps.length - 1)) * 100}%` }}
                        />
                    </div>

                    {steps.map((step, i) => {
                        const isActive = i <= currentStepIndex;
                        const isCurrent = i === currentStepIndex;
                        return (
                            <div key={step.id} className="flex flex-col items-center gap-2">
                                <div className={cn(
                                    "w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all duration-500 z-10",
                                    isActive ? "bg-primary border-primary text-white shadow-lg shadow-primary/30" : "bg-background border-muted text-muted-foreground",
                                    isCurrent && "scale-125 ring-4 ring-primary/20"
                                )}>
                                    {isActive ? <CheckCircle size={14} /> : <div className="w-2 h-2 rounded-full bg-muted-foreground/30" />}
                                </div>
                                <span className={cn(
                                    "text-[10px] font-bold uppercase tracking-wider transition-colors duration-300",
                                    isActive ? "text-primary" : "text-muted-foreground"
                                )}>{step.label}</span>
                            </div>
                        )
                    })}
                </div>

                <div className="bg-secondary/30 rounded-3xl p-4 flex items-center gap-4 border border-border/50">
                    <div className="relative">
                        <div className="w-14 h-14 bg-zinc-200 rounded-2xl overflow-hidden">
                            <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" alt="Driver" />
                        </div>
                        <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 border-2 border-white rounded-full flex items-center justify-center text-[8px] text-white font-bold">★</div>
                    </div>
                    <div className="flex-1">
                        <h3 className="font-bold text-foreground">Moussa Koné</h3>
                        <p className="text-xs text-muted-foreground font-medium">Livreur • Yamaha Crypton</p>
                    </div>
                    <button className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center text-white shadow-lg shadow-primary/30 active:scale-95 transition">
                        <Phone size={24} />
                    </button>
                </div>

            </div>
        </main>
    );
}
