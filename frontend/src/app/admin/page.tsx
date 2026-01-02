"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, LayoutDashboard, ShoppingCart, Database, TrendingUp, Settings, Plus, Edit, Trash2, Check, X, Package, Clock, User, Phone, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";
import { firebaseService } from "@/services/firebaseService";
import { Pharmacy, Order, Product } from "@/services/types";
import { auth } from "@/services/firebase";

export default function AdminPage() {
    const router = useRouter();
    const [pharmacies, setPharmacies] = useState<Pharmacy[]>([]);
    const [selectedPharmacyId, setSelectedPharmacyId] = useState<string>("");
    const [activeTab, setActiveTab] = useState<"dashboard" | "orders" | "stock">("dashboard");

    const [orders, setOrders] = useState<Order[]>([]);
    const [filterStatus, setFilterStatus] = useState<string>("all");
    const [inventory, setInventory] = useState<Product[]>([]);
    const [todaySales, setTodaySales] = useState<number>(0);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadPharmacies();
    }, []);

    useEffect(() => {
        if (selectedPharmacyId) {
            loadPharmacyData();
        }
    }, [selectedPharmacyId, activeTab]);

    const loadPharmacies = async () => {
        const data = await firebaseService.getPharmacies();
        setPharmacies(data);
        if (data.length > 0) setSelectedPharmacyId(data[0].id);
    };

    const loadPharmacyData = async () => {
        if (!selectedPharmacyId) return;
        setIsLoading(true);
        try {
            if (activeTab === "orders" || activeTab === "dashboard") {
                const ords = await firebaseService.getPharmacyOrders(selectedPharmacyId);
                setOrders(ords);
            }
            if (activeTab === "stock" || activeTab === "dashboard") {
                const stock = await firebaseService.getPharmacyInventory(selectedPharmacyId);
                setInventory(stock);
            }

            // Always update sales for dashboard
            const sales = await firebaseService.getTodaySales(selectedPharmacyId);
            setTodaySales(sales);
        } catch (error) {
            console.error("Error loading pharmacy data:", error);
        }
        setIsLoading(false);
    };

    const updateOrderStatus = async (orderId: string, status: string) => {
        await firebaseService.updateOrderStatus(orderId, status);
        loadPharmacyData();
    };

    const updateStock = async (invId: string, stock: number, price: number, inStock: boolean) => {
        await firebaseService.updateInventoryItem(invId, { stock, price, inStock });
        loadPharmacyData();
    };

    const handleCancelOrder = async (orderId: string) => {
        if (confirm("Voulez-vous vraiment annuler cette commande ?")) {
            await firebaseService.cancelOrder(orderId);
            loadPharmacyData();
        }
    };

    const handleDeleteInventory = async (invId: string) => {
        if (confirm("Supprimer ce produit de votre inventaire ?")) {
            await firebaseService.deleteInventoryItem(invId);
            loadPharmacyData();
        }
    };

    const handleAddProduct = async () => {
        const name = prompt("Nom du médicament :");
        if (!name) return;
        const price = Number(prompt("Prix (FCFA) :", "1500"));
        const stock = Number(prompt("Quantité en stock :", "20"));

        setIsLoading(true);
        await firebaseService.addInventoryItem(selectedPharmacyId, {
            name,
            price,
            stock,
            category: "medicament"
        });
        loadPharmacyData();
    };

    const stats = [
        { label: "Ventes Aujourd'hui", value: `${todaySales.toLocaleString()} F`, icon: <TrendingUp className="text-emerald-500" />, color: "bg-emerald-500/10" },
        { label: "Commandes Actives", value: orders.filter(o => o.status !== 'completed' && o.status !== 'cancelled').length.toString(), icon: <ShoppingCart className="text-primary" />, color: "bg-primary/10" },
        { label: "Produits en Stock", value: inventory.length.toString(), icon: <Package className="text-amber-500" />, color: "bg-amber-500/10" },
    ];

    const getStatusLabel = (status: string) => {
        const labels: Record<string, string> = {
            pending: "En attente",
            confirmed: "Confirmée",
            preparing: "En préparation",
            ready: "Prête",
            delivering: "En livraison",
            completed: "Terminée",
            cancelled: "Annulée"
        };
        return labels[status] || status;
    };

    return (
        <main className="min-h-screen bg-background flex flex-col md:flex-row pb-safe">
            {/* Sidebar - Desktop / Nav - Mobile */}
            <aside className="w-full md:w-64 bg-secondary/30 border-r border-border p-6 flex flex-col gap-8 md:sticky md:top-0 md:h-screen">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white font-black italic shadow-lg">P+</div>
                    <div className="font-black italic text-xl tracking-tighter">PharmaManager</div>
                </div>

                <div className="space-y-4">
                    <div className="space-y-1">
                        <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest px-2">Ma Pharmacie</label>
                        <select
                            value={selectedPharmacyId}
                            onChange={(e) => setSelectedPharmacyId(e.target.value)}
                            className="w-full bg-white dark:bg-zinc-800 border-border p-3 rounded-2xl font-bold text-sm outline-none focus:ring-2 focus:ring-primary/20"
                        >
                            {pharmacies.map(p => (
                                <option key={p.id} value={p.id}>{p.name}</option>
                            ))}
                        </select>
                    </div>

                    <nav className="space-y-2">
                        {[
                            { id: "dashboard", label: "Tableau de Bord", icon: <LayoutDashboard size={20} /> },
                            { id: "orders", label: "Commandes", icon: <ShoppingCart size={20} /> },
                            { id: "stock", label: "Inventaire & Stock", icon: <Database size={20} /> },
                        ].map(item => (
                            <button
                                key={item.id}
                                onClick={() => setActiveTab(item.id as any)}
                                className={cn(
                                    "w-full flex items-center gap-3 p-3 rounded-xl font-black text-xs transition-all",
                                    activeTab === item.id
                                        ? "bg-primary text-white shadow-xl shadow-primary/20"
                                        : "hover:bg-secondary text-muted-foreground"
                                )}
                            >
                                {item.icon}
                                {item.label}
                            </button>
                        ))}
                    </nav>
                </div>

                <div className="mt-auto space-y-2">
                    <button onClick={() => router.push('/')} className="w-full flex items-center gap-3 p-3 hover:bg-red-500/10 text-red-500 rounded-xl font-bold text-[10px] transition-all">
                        <ArrowLeft size={16} />
                        Quitter l'Admin
                    </button>
                </div>
            </aside>

            {/* Content Area */}
            <div className="flex-1 p-6 md:p-10 space-y-8 max-w-6xl mx-auto w-full">

                {activeTab === "dashboard" && (
                    <div className="space-y-8 animate-in fade-in duration-700">
                        <div className="flex justify-between items-end">
                            <div>
                                <h1 className="text-4xl font-black italic tracking-tighter text-foreground">Tableau de Bord</h1>
                                <p className="text-muted-foreground font-medium">Bon retour, Pharmacien manager ! 👋</p>
                            </div>
                            <div className="text-right">
                                <span className="text-[10px] font-black uppercase text-primary tracking-widest">Aujourd'hui</span>
                                <p className="text-xl font-black">{new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                            </div>
                        </div>

                        {/* Stats Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {stats.map((stat, i) => (
                                <div key={i} className="glass-card p-6 rounded-[2.5rem] border-border/40 hover:border-primary/20 transition-all group">
                                    <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110", stat.color)}>
                                        {stat.icon}
                                    </div>
                                    <div className="text-[10px] font-black uppercase text-muted-foreground tracking-widest mb-1">{stat.label}</div>
                                    <div className="text-3xl font-black text-foreground font-mono">{stat.value}</div>
                                </div>
                            ))}
                        </div>

                        {/* Recent Orders Preview */}
                        <div className="space-y-4">
                            <h2 className="text-xl font-black italic">Dernières Activités</h2>
                            <div className="glass-card overflow-hidden">
                                {isLoading ? (
                                    <div className="p-10 text-center animate-pulse italic">Chargement des commandes...</div>
                                ) : orders.slice(0, 5).map((order) => (
                                    <div key={order.id} className="p-6 border-b border-border/30 last:border-b-0 flex items-center justify-between hover:bg-secondary/20 transition-colors">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 bg-secondary rounded-xl flex items-center justify-center font-black text-xs">
                                                CMD
                                            </div>
                                            <div>
                                                <div className="font-black text-sm">{order.orderNumber}</div>
                                                <div className="text-[10px] font-bold text-muted-foreground uppercase">{order.total} FCFA • {order.items.length} articles</div>
                                            </div>
                                        </div>
                                        <span className={cn(
                                            "px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest",
                                            order.status === 'pending' ? "bg-amber-500/10 text-amber-500" :
                                                order.status === 'completed' ? "bg-emerald-500/10 text-emerald-500" :
                                                    order.status === 'cancelled' ? "bg-red-500/10 text-red-500" :
                                                        "bg-primary/10 text-primary"
                                        )}>
                                            {getStatusLabel(order.status)}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === "orders" && (
                    <div className="space-y-6 animate-in slide-in-from-right-5 duration-500">
                        <div className="flex justify-between items-center">
                            <h1 className="text-3xl font-black italic tracking-tighter">Gestion Commandes</h1>
                            <div className="flex gap-2">
                                <select
                                    value={filterStatus}
                                    onChange={(e) => setFilterStatus(e.target.value)}
                                    className="px-4 py-2.5 bg-secondary text-foreground text-xs font-black rounded-xl border border-border outline-none"
                                >
                                    <option value="all">TOUT</option>
                                    <option value="pending">EN ATTENTE</option>
                                    <option value="preparing">PRÉPARATION</option>
                                    <option value="delivering">EN LIVRAISON</option>
                                    <option value="completed">TERMINÉE</option>
                                    <option value="cancelled">ANNULÉE</option>
                                </select>
                                <button
                                    onClick={() => window.print()}
                                    className="px-5 py-2.5 bg-primary text-white text-xs font-black rounded-xl shadow-lg hover:brightness-110"
                                >
                                    IMPRIMER LISTE
                                </button>
                            </div>
                        </div>

                        <div className="space-y-4">
                            {isLoading ? (
                                <div className="text-center py-20 italic">Chargement...</div>
                            ) : (orders.filter(o => filterStatus === "all" || o.status === filterStatus)).length === 0 ? (
                                <div className="text-center py-20 bg-secondary/20 rounded-[3rem] border-2 border-dashed">Aucune commande</div>
                            ) : (orders.filter(o => filterStatus === "all" || o.status === filterStatus)).map((order) => (
                                <div key={order.id} className="glass-card p-6 rounded-[2rem] border-border/40 space-y-4 hover:shadow-2xl transition-all">
                                    <div className="flex justify-between items-start">
                                        <div className="flex gap-4">
                                            <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
                                                <Package size={24} />
                                            </div>
                                            <div>
                                                <div className="font-black text-lg">{order.orderNumber}</div>
                                                <div className="text-[10px] font-bold text-muted-foreground uppercase">{order.createdAt?.seconds ? new Date(order.createdAt.seconds * 1000).toLocaleString() : 'Date inconnue'}</div>
                                            </div>
                                        </div>
                                        <div className="flex flex-col items-end">
                                            <div className="text-xl font-black text-foreground">{order.total} F</div>
                                            <span className="text-[8px] font-black text-emerald-500 uppercase bg-emerald-500/10 px-2 py-0.5 rounded-full">PAYÉ</span>
                                        </div>
                                    </div>

                                    <div className="p-4 bg-secondary/30 rounded-2xl space-y-2">
                                        {order.items.map((item, idx) => (
                                            <div key={idx} className="flex justify-between text-sm font-bold">
                                                <span>{item.quantity}x {item.productName}</span>
                                                <span className="opacity-50 font-mono">{item.totalPrice} F</span>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="flex items-center justify-between border-t border-border/30 pt-4 mt-2">
                                        <div className="flex gap-2 items-center">
                                            <div className="w-8 h-8 rounded-full bg-secondary overflow-hidden">
                                                <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${order.userId}`} alt="User" />
                                            </div>
                                            <div className="text-[10px] font-bold text-muted-foreground uppercase">Client : <span className="text-foreground italic">{order.userId.slice(0, 8)}...</span></div>
                                        </div>

                                        <div className="flex gap-2">
                                            {order.status === 'pending' && (
                                                <button
                                                    onClick={() => updateOrderStatus(order.id, 'preparing')}
                                                    className="px-4 py-2 bg-primary text-white text-[10px] font-black uppercase rounded-xl hover:brightness-110"
                                                >
                                                    CONFIRMER PREP.
                                                </button>
                                            )}
                                            {order.status === 'preparing' && (
                                                <button
                                                    onClick={() => updateOrderStatus(order.id, 'delivering')}
                                                    className="px-4 py-2 bg-amber-500 text-white text-[10px] font-black uppercase rounded-xl"
                                                >
                                                    ENVOYER LIVREUR
                                                </button>
                                            )}
                                            {order.status === 'delivering' && (
                                                <button
                                                    disabled
                                                    className="px-4 py-2 bg-secondary text-muted-foreground text-[10px] font-black uppercase rounded-xl flex items-center gap-2"
                                                >
                                                    <Clock size={12} /> EN TRANSIT
                                                </button>
                                            )}
                                            {order.status !== 'completed' && order.status !== 'cancelled' && (
                                                <button
                                                    onClick={() => updateOrderStatus(order.id, 'completed')}
                                                    className="p-2.5 bg-emerald-500/10 text-emerald-500 rounded-xl hover:bg-emerald-500 hover:text-white transition"
                                                >
                                                    <Check size={18} />
                                                </button>
                                            )}
                                            <button
                                                onClick={() => handleCancelOrder(order.id)}
                                                className="p-2.5 bg-red-500/10 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition"
                                            >
                                                <X size={18} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {activeTab === "stock" && (
                    <div className="space-y-6 animate-in slide-in-from-right-5 duration-500">
                        <div className="flex justify-between items-center">
                            <h1 className="text-3xl font-black italic tracking-tighter">Inventaire Médicaments</h1>
                            <button
                                onClick={handleAddProduct}
                                className="px-6 py-3 bg-primary text-white text-xs font-black rounded-2xl flex items-center gap-2 shadow-xl shadow-primary/20 hover:brightness-110 active:scale-95 transition-all"
                            >
                                <Plus size={18} /> AJOUTER UN PRODUIT
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {isLoading ? (
                                <div className="col-span-2 text-center py-20 italic">Chargement du stock...</div>
                            ) : inventory.map((prod) => (
                                <div key={prod.id} className="glass-card p-6 rounded-[2.5rem] border-border/40 hover:border-primary/20 transition-all flex flex-col gap-6 group">
                                    <div className="flex justify-between items-start">
                                        <div className="flex gap-4">
                                            <div className="w-14 h-14 bg-secondary rounded-2xl flex items-center justify-center text-primary group-hover:bg-primary/10 transition-colors">
                                                <Package size={28} />
                                            </div>
                                            <div>
                                                <div className="font-black text-xl leading-tight">{prod.name}</div>
                                                <div className="text-[10px] font-bold text-muted-foreground uppercase">{prod.category || 'Générique'}</div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className={cn(
                                                "w-3 h-3 rounded-full animate-pulse",
                                                prod.inStock ? "bg-emerald-500 shadow-[0_0_10px_#10b981]" : "bg-red-500 shadow-[0_0_10px_#ef4444]"
                                            )} />
                                            <span className="text-[10px] font-black uppercase tracking-widest">{prod.inStock ? 'En Stock' : 'Rupture'}</span>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="p-4 bg-secondary/50 rounded-2xl border border-transparent group-hover:border-primary/10 transition-all">
                                            <span className="text-[8px] font-black uppercase opacity-50 block mb-1">Prix Unitaire</span>
                                            <div className="flex items-end gap-1">
                                                <input
                                                    type="number"
                                                    defaultValue={prod.price}
                                                    onBlur={(e) => updateStock(prod.inventoryId!, prod.stock!, Number(e.target.value), prod.inStock!)}
                                                    className="bg-transparent border-none p-0 text-xl font-mono font-black text-primary w-full outline-none focus:ring-0"
                                                />
                                                <span className="text-[10px] font-bold opacity-30">F</span>
                                            </div>
                                        </div>
                                        <div className="p-4 bg-secondary/50 rounded-2xl border border-transparent group-hover:border-primary/10 transition-all">
                                            <span className="text-[8px] font-black uppercase opacity-50 block mb-1">Quantité Stock</span>
                                            <div className="flex items-center justify-between">
                                                <input
                                                    type="number"
                                                    defaultValue={prod.stock}
                                                    onBlur={(e) => updateStock(prod.inventoryId!, Number(e.target.value), prod.price!, prod.inStock!)}
                                                    className="bg-transparent border-none p-0 text-xl font-mono font-black text-foreground w-full outline-none focus:ring-0"
                                                />
                                                <span className="text-[10px] font-bold text-muted-foreground">UNITÉS</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => updateStock(prod.inventoryId!, prod.stock!, prod.price!, !prod.inStock)}
                                            className={cn(
                                                "flex-1 py-3 px-4 rounded-xl font-black text-[10px] uppercase transition-all",
                                                prod.inStock ? "bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white" : "bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-white"
                                            )}
                                        >
                                            {prod.inStock ? 'DÉSACTIVER' : 'RÉACTIVER'}
                                        </button>
                                        <button
                                            onClick={() => alert("Edition bientôt disponible !")}
                                            className="p-3 bg-secondary rounded-xl hover:bg-secondary/80 transition-all"
                                        >
                                            <Edit size={16} />
                                        </button>
                                        <button
                                            onClick={() => handleDeleteInventory(prod.inventoryId!)}
                                            className="p-3 bg-red-500/10 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </main>
    );
}
