"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
    ArrowLeft, LayoutDashboard, ShoppingCart, Database, TrendingUp,
    Settings, Plus, Edit, Trash2, Check, X, Package, Clock,
    User, Phone, MapPin, Shield, Activity, Globe, Zap, Key
} from "lucide-react";
import { cn } from "@/lib/utils";
import { firebaseService } from "@/services/firebaseService";
import { Pharmacy, Order, Product } from "@/services/types";
import { auth } from "@/services/firebase";

export default function AdminPage() {
    const router = useRouter();
    const [pharmacies, setPharmacies] = useState<Pharmacy[]>([]);
    const [selectedPharmacyId, setSelectedPharmacyId] = useState<string>("global");
    const [activeTab, setActiveTab] = useState<"dashboard" | "orders" | "pharmacies" | "api">("dashboard");

    const [orders, setOrders] = useState<Order[]>([]);
    const [globalStats, setGlobalStats] = useState({
        totalPharmacies: 0,
        totalUsers: 0,
        totalOrders: 0,
        totalRevenue: 0
    });
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadInitialData();
    }, []);

    useEffect(() => {
        refreshTabContent();
    }, [selectedPharmacyId, activeTab]);

    const loadInitialData = async () => {
        setIsLoading(true);
        const [pharms, stats] = await Promise.all([
            firebaseService.getPharmacies(),
            firebaseService.getGlobalSystemStats()
        ]);
        setPharmacies(pharms);
        setGlobalStats(stats);
        setIsLoading(false);
    };

    const refreshTabContent = async () => {
        setIsLoading(true);
        try {
            if (activeTab === "dashboard") {
                const stats = await firebaseService.getGlobalSystemStats();
                setGlobalStats(stats);
                const recent = await firebaseService.getGlobalRecentOrders(5);
                setOrders(recent);
            } else if (activeTab === "orders") {
                if (selectedPharmacyId === "global") {
                    const allOrders = await firebaseService.getGlobalRecentOrders(50);
                    setOrders(allOrders);
                } else {
                    const pharmOrders = await firebaseService.getPharmacyOrders(selectedPharmacyId);
                    setOrders(pharmOrders);
                }
            }
        } catch (error) {
            console.error("Error refreshing content:", error);
        }
        setIsLoading(false);
    };

    const stats = [
        { label: "Chiffre d'Affaire Global", value: `${globalStats.totalRevenue.toLocaleString()} F`, icon: <TrendingUp className="text-emerald-400" />, color: "bg-emerald-500/10" },
        { label: "Utilisateurs Inscrits", value: globalStats.totalUsers.toString(), icon: <User className="text-blue-400" />, color: "bg-blue-500/10" },
        { label: "Pharmacies Partenaires", value: globalStats.totalPharmacies.toString(), icon: <Globe className="text-primary" />, color: "bg-primary/10" },
        { label: "Transactions Totales", value: globalStats.totalOrders.toString(), icon: <Zap className="text-amber-400" />, color: "bg-amber-500/10" },
    ];

    return (
        <main className="min-h-screen bg-[#020617] text-slate-100 flex flex-col md:flex-row overflow-hidden">
            {/* Control Tower Sidebar */}
            <aside className="w-full md:w-72 bg-slate-900 border-r border-white/5 p-6 flex flex-col gap-8 md:sticky md:top-0 md:h-screen z-50">
                <div className="flex items-center gap-3 px-2">
                    <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center text-white shadow-[0_0_20px_rgba(99,102,241,0.4)] animate-pulse">
                        <Shield size={24} />
                    </div>
                    <div>
                        <div className="font-black italic text-xl tracking-tighter leading-none">TOUR DE</div>
                        <div className="font-black text-xs text-primary tracking-[.3em] uppercase opacity-80">Contrôle</div>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest px-2">Secteur d'Action</label>
                        <select
                            value={selectedPharmacyId}
                            onChange={(e) => setSelectedPharmacyId(e.target.value)}
                            className="w-full bg-slate-800 border border-white/5 p-3.5 rounded-2xl font-bold text-sm outline-none focus:ring-2 focus:ring-primary/40 appearance-none shadow-xl cursor-pointer"
                        >
                            <option value="global">🌐 SYSTÈME GLOBAL</option>
                            <optgroup label="Pharmacies Individuelles">
                                {pharmacies.map(p => (
                                    <option key={p.id} value={p.id}>🏥 {p.name}</option>
                                ))}
                            </optgroup>
                        </select>
                    </div>

                    <nav className="space-y-2">
                        {[
                            { id: "dashboard", label: "Dashboard Royal", icon: <Activity size={20} /> },
                            { id: "orders", label: "Flux Commandes", icon: <ShoppingCart size={20} /> },
                            { id: "pharmacies", label: "Réseau Pharmacies", icon: <Globe size={20} /> },
                            { id: "api", label: "API & Marché", icon: <Key size={20} /> },
                        ].map(item => (
                            <button
                                key={item.id}
                                onClick={() => setActiveTab(item.id as any)}
                                className={cn(
                                    "w-full flex items-center gap-3 p-4 rounded-2xl font-black text-xs transition-all border border-transparent",
                                    activeTab === item.id
                                        ? "bg-primary text-white shadow-[0_10px_30px_rgba(99,102,241,0.3)] border-white/10"
                                        : "hover:bg-white/5 text-slate-400"
                                )}
                            >
                                {item.icon}
                                <span className="uppercase tracking-widest">{item.label}</span>
                            </button>
                        ))}
                    </nav>
                </div>

                <div className="mt-auto pt-6 border-t border-white/5 space-y-4">
                    <div className="flex items-center gap-3 p-4 bg-white/5 rounded-2xl">
                        <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center overflow-hidden">
                            <img src="https://api.dicebear.com/7.x/bottts/svg?seed=KingAdmin" alt="Admin" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="text-xs font-black truncate uppercase tracking-tighter text-white">Administrateur Roi</div>
                            <div className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Connecté</div>
                        </div>
                    </div>
                    <button onClick={() => router.push('/')} className="w-full flex items-center justify-center gap-2 p-3 text-red-400 hover:text-red-300 transition-colors font-black text-[10px] uppercase tracking-widest">
                        <ArrowLeft size={16} /> Quitter le Siège
                    </button>
                </div>
            </aside>

            {/* Main Command Center */}
            <div className="flex-1 p-6 md:p-12 overflow-y-auto w-full custom-scrollbar">

                {activeTab === "dashboard" && (
                    <div className="max-w-7xl mx-auto space-y-12 animate-in fade-in duration-1000">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                            <div>
                                <h1 className="text-6xl font-black italic tracking-tighter text-white drop-shadow-2xl">TABLEAU MAÎTRE</h1>
                                <p className="text-slate-400 font-bold tracking-widest uppercase text-sm mt-2 flex items-center gap-2">
                                    <span className="w-2 h-2 bg-emerald-500 rounded-full animate-ping" />
                                    Statistiques vitales du système Burkina Faso
                                </p>
                            </div>
                            <div className="bg-white/5 p-4 rounded-3xl border border-white/10 backdrop-blur-3xl text-right">
                                <span className="text-[10px] font-black uppercase text-primary tracking-widest">Temps Réel SYNC</span>
                                <p className="text-2xl font-black font-mono">{new Date().toLocaleTimeString('fr-FR')}</p>
                            </div>
                        </div>

                        {/* Stats Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {stats.map((stat, i) => (
                                <div key={i} className="bg-slate-900/50 backdrop-blur-xl p-8 rounded-[3rem] border border-white/10 hover:border-primary/40 transition-all group relative overflow-hidden">
                                    <div className="absolute -right-4 -top-4 w-32 h-32 bg-primary/5 rounded-full blur-3xl group-hover:bg-primary/10 transition-all" />
                                    <div className={cn("w-16 h-16 rounded-2xl flex items-center justify-center mb-6 transition-all group-hover:scale-110 group-hover:shadow-[0_0_30px_rgba(99,102,241,0.2)]", stat.color)}>
                                        {stat.icon}
                                    </div>
                                    <div className="text-[10px] font-black uppercase text-slate-500 tracking-[.2em] mb-2">{stat.label}</div>
                                    <div className="text-4xl font-black text-white font-mono tracking-tighter">{stat.value}</div>
                                </div>
                            ))}
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            {/* Feed Commandes */}
                            <div className="lg:col-span-2 space-y-6">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-2xl font-black italic uppercase tracking-tighter">Flux des Activités</h2>
                                    <button className="text-[10px] font-black uppercase text-primary tracking-widest hover:underline">Voir tout le flux</button>
                                </div>
                                <div className="bg-slate-900/50 rounded-[3rem] border border-white/10 overflow-hidden divide-y divide-white/5">
                                    {isLoading ? (
                                        <div className="p-20 text-center animate-pulse italic text-slate-500 uppercase tracking-widest">Scan du flux en cours...</div>
                                    ) : orders.map((order) => (
                                        <div key={order.id} className="p-8 flex items-center justify-between hover:bg-white/5 transition-colors group">
                                            <div className="flex items-center gap-6">
                                                <div className="w-16 h-16 bg-slate-800 rounded-3xl flex items-center justify-center font-black text-sm text-primary group-hover:scale-110 transition-transform">
                                                    #{order.orderNumber.split('-')[1]}
                                                </div>
                                                <div>
                                                    <div className="font-black text-lg text-white mb-0.5">{order.pharmacyName || "Pharmacie Locale"}</div>
                                                    <div className="text-[10px] font-black text-slate-500 uppercase tracking-[.2em]">{order.total} FCFA • {order.items.length} articles</div>
                                                </div>
                                            </div>
                                            <div className="flex flex-col items-end gap-2">
                                                <span className={cn(
                                                    "px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg",
                                                    order.status === 'pending' ? "bg-amber-500/10 text-amber-500 border border-amber-500/20" :
                                                        order.status === 'completed' ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20" :
                                                            order.status === 'cancelled' ? "bg-red-500/10 text-red-500 border border-red-500/20" :
                                                                "bg-primary/20 text-primary border border-primary/30"
                                                )}>
                                                    {order.status}
                                                </span>
                                                <div className="text-[9px] font-bold text-slate-600 font-mono">ID: {order.id.slice(0, 8)}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Système Health */}
                            <div className="space-y-6">
                                <h2 className="text-2xl font-black italic uppercase tracking-tighter">Santé Système</h2>
                                <div className="bg-slate-900/50 p-8 rounded-[3.5rem] border border-white/10 space-y-8">
                                    {[
                                        { label: "Base de Données", value: 98.4, color: "bg-emerald-500" },
                                        { label: "Connexions SMS", value: 100, color: "bg-blue-500" },
                                        { label: "Précision Mapping", value: 94.2, color: "bg-primary" },
                                        { label: "Sync Pharmacies", value: 89, color: "bg-amber-500" },
                                    ].map((service, i) => (
                                        <div key={i} className="space-y-3">
                                            <div className="flex justify-between items-end">
                                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{service.label}</span>
                                                <span className="font-black text-sm font-mono text-white">{service.value}%</span>
                                            </div>
                                            <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                                                <div className={cn("h-full rounded-full shadow-[0_0_10px_rgba(0,0,0,0.5)]", service.color)} style={{ width: `${service.value}%` }} />
                                            </div>
                                        </div>
                                    ))}
                                    <div className="pt-4 border-t border-white/5">
                                        <button className="w-full py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all">
                                            Lancer Diagnostic Complet
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === "api" && (
                    <div className="max-w-5xl mx-auto space-y-12 animate-in slide-in-from-bottom-5 duration-700">
                        <div className="text-center space-y-4">
                            <h1 className="text-6xl font-black italic tracking-tighter uppercase underline decoration-primary decoration-8 underline-offset-8">Intégration Stock API</h1>
                            <p className="text-slate-400 max-w-2xl mx-auto font-bold text-lg">Connectez n'importe quel logiciel de gestion de pharmacie au réseau national pour une mise à jour en temps réel.</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="bg-slate-900/80 p-10 rounded-[3rem] border border-primary/20 shadow-2xl space-y-6">
                                <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
                                    <Zap size={32} fill="currentColor" />
                                </div>
                                <h3 className="text-3xl font-black italic">API Master Key</h3>
                                <div className="bg-black/50 p-6 rounded-2xl border border-white/5 font-mono text-xs text-primary break-all">
                                    sk_bf_maitre_control_tower_v1_{Math.random().toString(36).substring(2, 12)}
                                </div>
                                <p className="text-sm text-slate-500 leading-relaxed font-medium">
                                    Utilisez cette clé pour autoriser les serveurs externes à synchroniser leur stock. Ne partagez jamais cette clé publiquement.
                                </p>
                            </div>

                            <div className="bg-slate-900/50 p-10 rounded-[3rem] border border-white/10 space-y-8">
                                <h3 className="text-2xl font-black uppercase tracking-tighter leading-none mb-6">Endpoint de Synchronisation</h3>
                                <div className="space-y-4 text-sm font-bold">
                                    <div className="flex items-center gap-3">
                                        <span className="px-3 py-1 bg-emerald-500/20 text-emerald-500 rounded text-[10px]">POST</span>
                                        <span className="text-slate-300">/api/external/sync-stock</span>
                                    </div>
                                    <div className="p-4 bg-black/30 rounded-xl text-[10px] font-mono whitespace-pre text-slate-400">
                                        {`{
  "pharmacyId": "ID_DE_LA_PHARMACIE",
  "inventory": [
    { "name": "Doliprane 1g", "price": 1500, "stock": 50 },
    { "name": "Spasfon", "price": 2300, "stock": 24 }
  ]
}`}
                                    </div>
                                </div>
                                <button className="w-full py-4 bg-primary text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-lg shadow-primary/30">
                                    Générer une Documentation PDF
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Other tabs would go here (pharmacies, orders detail, etc.) */}
                {activeTab === "orders" && (
                    <div className="max-w-7xl mx-auto py-10 text-center">
                        <ShoppingCart size={48} className="mx-auto mb-4 text-primary" />
                        <h2 className="text-2xl font-black italic uppercase">Exploration des Commandes</h2>
                        <p className="text-slate-500 mt-2">La vue détaillée des commandes système est en cours d'optimisation...</p>
                    </div>
                )}
            </div>

            <style jsx global>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 6px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: rgba(255, 255, 255, 0.1);
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: rgba(255, 255, 255, 0.2);
                }
            `}</style>
        </main>
    );
}
