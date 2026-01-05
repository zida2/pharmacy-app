"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, CheckCircle, Package, Truck, Home, Phone, Timer, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import Map from "@/components/Map";
import { firebaseService } from "@/services/firebaseService";
import { Order } from "@/services/types";
import AssistanceModal from "@/components/AssistanceModal";

export default function TrackingPage() {
    const router = useRouter();
    const [order, setOrder] = useState<Order | null>(null);
    const [status, setStatus] = useState<string>("pending");
    const [eta, setEta] = useState(15);
    const [driverLocation, setDriverLocation] = useState<[number, number]>([-1.5197, 12.3714]);
    const [showAssistance, setShowAssistance] = useState(false);

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
            <AssistanceModal
                isOpen={showAssistance}
                onClose={() => setShowAssistance(false)}
            />
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
                <button
                    onClick={() => setShowAssistance(true)}
                    className="p-3 bg-red-500 shadow-lg shadow-red-500/20 text-white rounded-full animate-pulse ml-2"
                >
                    <AlertTriangle size={24} />
                </button>
            </header>

            {/* Bottom Sheet */}
            <div className="mt-auto z-10 bg-card dark:bg-zinc-900 rounded-t-[2rem] shadow-[0_-8px_30px_rgba(0,0,0,0.12)] p-4 pb-safe border-t border-border/50">

                <div className="w-10 h-1 bg-muted rounded-full mx-auto mb-4 opacity-50" />

                <div className="flex justify-between items-start mb-6">
                    <div>
                        <h1 className="text-lg font-black italic text-foreground leading-tight mb-1">
                            {status === 'completed' ? 'Commande Livrée !' : 'Livraison en cours...'}
                        </h1>
                        <p className="text-muted-foreground text-[11px] font-bold uppercase tracking-wider">
                            {status === 'completed' ? 'Merci de votre confiance' : `Arrivée estimée: ${eta} MIN`}
                        </p>
                    </div>
                    <div className="bg-primary/10 text-primary p-2.5 rounded-xl animate-pulse">
                        <Timer size={20} />
                    </div>
                </div>

                <div className="flex justify-between items-center relative mb-8 px-1">
                    <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-1 bg-muted/30 -z-10 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-primary transition-all duration-1000 ease-out"
                            style={{ width: `${(currentStepIndex / (steps.length - 1)) * 100}%` }}
                        />
                    </div>

                    {steps.map((step, i) => {
                        const isActive = i <= currentStepIndex;
                        const isCurrent = i === currentStepIndex;
                        return (
                            <div key={step.id} className="flex flex-col items-center gap-1.5">
                                <div className={cn(
                                    "w-7 h-7 rounded-full flex items-center justify-center border-2 transition-all duration-500 z-10",
                                    isActive ? "bg-primary border-primary text-white shadow-md shadow-primary/20" : "bg-card border-border text-muted-foreground",
                                    isCurrent && "scale-110 ring-4 ring-primary/10"
                                )}>
                                    {isActive ? <CheckCircle size={12} /> : <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground/20" />}
                                </div>
                                <span className={cn(
                                    "text-[8px] font-black uppercase tracking-tighter transition-colors duration-300",
                                    isActive ? "text-primary" : "text-muted-foreground/60"
                                )}>{step.label}</span>
                            </div>
                        )
                    })}
                </div>

                <div className="bg-secondary/50 dark:bg-zinc-800/30 rounded-2xl p-3 flex items-center gap-3 border border-border/40">
                    <div className="relative">
                        <div className="w-12 h-12 bg-zinc-200 dark:bg-zinc-800 rounded-xl overflow-hidden shadow-inner">
                            <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" alt="Driver" className="w-full h-full object-cover" />
                        </div>
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-card rounded-full flex items-center justify-center text-[7px] text-white font-black">★</div>
                    </div>
                    <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-sm text-foreground truncate">Moussa Koné</h3>
                        <p className="text-[10px] text-muted-foreground font-black uppercase tracking-wider leading-none">Livreur • Yamaha Crypton</p>
                    </div>
                    <button className="w-11 h-11 bg-primary text-primary-foreground rounded-xl flex items-center justify-center shadow-lg shadow-primary/20 active:scale-95 transition">
                        <Phone size={20} />
                    </button>
                </div>

            </div>
        </main>
    );
}
