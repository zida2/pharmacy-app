"use client";

import React, { useState, useEffect } from "react";
import {
    Package, TrendingUp, Clock, DollarSign, Settings, Users, BarChart3,
    Plus, Edit, Trash2, CheckCircle, Database, AlertCircle, ShoppingBag,
    ChevronRight, Search, Filter, RefreshCw
} from "lucide-react";
import { cn } from "@/lib/utils";
import { firebaseService } from "@/services/firebaseService";
import { Order, Product } from "@/services/types";

export default function PharmacyPortal() {
    const [activeTab, setActiveTab] = useState<"orders" | "inventory" | "dashboard" | "settings">("orders");
    const [orders, setOrders] = useState<Order[]>([]);
    const [inventory, setInventory] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [pharmacyId] = useState("pharm-patte-oie");
    const [mounted, setMounted] = useState(false);
    const [syncTime, setSyncTime] = useState("");

    // Modal state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [productForm, setProductForm] = useState({
        name: "",
        category: "medicament" as "medicament" | "parapharmacie" | "materiel",
        price: 0,
        stock: 0,
        description: "",
        requiresPrescription: false
    });
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        setMounted(true);
        setSyncTime(new Date().toLocaleTimeString());
        loadData();
    }, [activeTab]);

    const loadData = async () => {
        setIsLoading(true);
        try {
            if (activeTab === "orders" || activeTab === "dashboard") {
                const fetchedOrders = await firebaseService.getPharmacyOrders(pharmacyId);
                setOrders(fetchedOrders);
            }
            if (activeTab === "inventory") {
                const fetchedInv = await firebaseService.getPharmacyInventory(pharmacyId);
                setInventory(fetchedInv);
            }
        } catch (error) {
            console.error("Firebase fetch failed:", error);
        }
        setIsLoading(false);
    };

    const handleUpdateStatus = async (orderId: string, newStatus: string) => {
        try {
            await firebaseService.updateOrderStatus(orderId, newStatus);
            setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus as any } : o));
        } catch (error) {
            alert("Erreur lors de la mise à jour");
        }
    };

    const toggleStockLevel = async (product: Product) => {
        if (!product.inventoryId) return;
        const newStockStatus = !product.inStock;
        try {
            await firebaseService.updateInventoryItem(product.inventoryId, { inStock: newStockStatus });
            setInventory(prev => prev.map(p => p.id === product.id ? { ...p, inStock: newStockStatus } : p));
        } catch (error) {
            alert("Erreur");
        }
    };

    const openAddModal = () => {
        setEditingProduct(null);
        setProductForm({
            name: "",
            category: "medicament",
            price: 0,
            stock: 0,
            description: "",
            requiresPrescription: false
        });
        setIsModalOpen(true);
    };

    const openEditModal = (product: Product) => {
        setEditingProduct(product);
        setProductForm({
            name: product.name,
            category: product.category || "medicament",
            price: product.price || 0,
            stock: product.stock || 0,
            description: product.description || "",
            requiresPrescription: product.requiresPrescription || false
        });
        setIsModalOpen(true);
    };

    const handleSaveProduct = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            if (editingProduct) {
                if (editingProduct.inventoryId) {
                    await firebaseService.updateInventoryItem(editingProduct.inventoryId, {
                        price: Number(productForm.price),
                        stock: Number(productForm.stock),
                        inStock: Number(productForm.stock) > 0
                    });
                    // Also update product details
                    await firebaseService.updateProduct(editingProduct.id, {
                        name: productForm.name,
                        category: productForm.category,
                        description: productForm.description,
                        requiresPrescription: productForm.requiresPrescription
                    });
                }
            } else {
                await firebaseService.addInventoryItem(pharmacyId, {
                    ...productForm,
                    price: Number(productForm.price),
                    stock: Number(productForm.stock)
                });
            }
            setIsModalOpen(false);
            loadData();
        } catch (error) {
            alert("Erreur lors de l'enregistrement");
        }
        setIsLoading(false);
    };

    const handleDeleteProduct = async (product: Product) => {
        if (!product.inventoryId) return;
        if (confirm(`Êtes-vous sûr de vouloir supprimer "${product.name}" ?`)) {
            setIsLoading(true);
            try {
                await firebaseService.deleteInventoryItem(product.inventoryId);
                loadData();
            } catch (error) {
                alert("Erreur lors de la suppression");
            }
            setIsLoading(false);
        }
    };

    const filteredInventory = inventory.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.category?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#000000] flex flex-col md:flex-row text-foreground">

            {/* Sidebar Navigation - Fixed for Desktop */}
            <aside className="w-full md:w-72 bg-white dark:bg-zinc-900 border-r border-border/50 flex flex-col z-40">
                <div className="p-8 pb-4">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="w-10 h-10 bg-primary rounded-2xl flex items-center justify-center text-white shadow-lg shadow-primary/20">
                            <ShoppingBag size={20} />
                        </div>
                        <h1 className="text-xl font-black italic tracking-tighter uppercase text-primary">PharmaCI <span className="text-foreground font-black not-italic text-xs block -mt-1 opacity-50">PRO PORTAL</span></h1>
                    </div>

                    <nav className="space-y-2">
                        {[
                            { id: "dashboard", label: "Tableau de Bord", icon: BarChart3 },
                            { id: "orders", label: "Commandes Client", icon: ShoppingBag, count: orders.filter(o => o.status === 'pending').length },
                            { id: "inventory", label: "Gestion de Stock", icon: Package },
                            { id: "settings", label: "Configuration", icon: Settings }
                        ].map(item => (
                            <button
                                key={item.id}
                                onClick={() => setActiveTab(item.id as any)}
                                className={cn(
                                    "w-full flex items-center justify-between p-4 rounded-2xl transition-all duration-300 font-bold text-sm",
                                    activeTab === item.id
                                        ? "bg-primary text-white shadow-xl shadow-primary/20 translate-x-1"
                                        : "hover:bg-secondary/50 text-muted-foreground hover:text-foreground"
                                )}
                            >
                                <div className="flex items-center gap-3">
                                    <item.icon size={20} className={cn(activeTab === item.id ? "text-white" : "text-primary")} />
                                    {item.label}
                                </div>
                                {item.count !== undefined && item.count > 0 && (
                                    <span className={cn(
                                        "px-2 py-0.5 rounded-full text-[10px] font-black",
                                        activeTab === item.id ? "bg-white text-primary" : "bg-red-500 text-white animate-pulse"
                                    )}>
                                        {item.count}
                                    </span>
                                )}
                            </button>
                        ))}
                    </nav>
                </div>

                <div className="mt-auto p-8 border-t border-border/30">
                    <div className="bg-secondary/50 dark:bg-zinc-800/50 p-4 rounded-2xl flex items-center gap-3">
                        <div className="w-10 h-10 bg-zinc-200 dark:bg-zinc-700 rounded-full flex items-center justify-center overflow-hidden">
                            <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Pharmacist" alt="User" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="text-xs font-black truncate">Dr. Diallo</div>
                            <div className="text-[10px] text-muted-foreground truncate font-bold">Patte d'Oie</div>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 flex flex-col min-h-screen max-h-screen overflow-hidden">

                {/* Top Header Barra */}
                <header className="h-20 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border-b border-border/30 flex items-center justify-between px-8 z-30">
                    <div className="flex items-center gap-4">
                        <h2 className="text-xl font-bold uppercase tracking-tight">{activeTab}</h2>
                        <div className="h-6 w-px bg-border/40 mx-2" />
                        <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                            <Clock size={14} />
                            Dernière synchro : {mounted ? syncTime : "--:--:--"}
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <button
                            onClick={loadData}
                            className="p-2 hover:bg-secondary rounded-full transition-colors group"
                            title="Rafraîchir"
                        >
                            <RefreshCw size={20} className={cn("text-muted-foreground", isLoading && "animate-spin")} />
                        </button>
                    </div>
                </header>

                {/* Dashboard Scrollable View */}
                <div className="flex-1 overflow-y-auto p-8">

                    {isLoading && (
                        <div className="flex flex-col items-center justify-center h-full opacity-50">
                            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4" />
                            <p className="font-bold animate-pulse">Synchronisation des données...</p>
                        </div>
                    )}

                    {!isLoading && activeTab === "orders" && (
                        <div className="space-y-6 max-w-5xl">
                            <div className="flex justify-between items-end mb-4">
                                <div>
                                    <h3 className="text-2xl font-black mb-1">Gérer les commandes</h3>
                                    <p className="text-sm text-muted-foreground">Suivi des demandes de médicaments en temps réel</p>
                                </div>
                                <div className="flex gap-2">
                                    <button className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-zinc-800 border border-border rounded-xl text-xs font-bold shadow-sm">
                                        <Filter size={14} /> TOUTES
                                    </button>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-4">
                                {orders.length > 0 ? orders.map((order, i) => (
                                    <div key={i} className="bg-white dark:bg-zinc-900 rounded-[2rem] p-6 border border-border/40 shadow-sm hover:shadow-xl transition-all duration-500 group">
                                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <span className="text-[10px] font-black bg-secondary dark:bg-zinc-800 px-3 py-1 rounded-full uppercase tracking-widest">{order.orderNumber}</span>
                                                    <span className={cn(
                                                        "text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest",
                                                        order.status === 'pending' ? 'bg-amber-100 text-amber-700 animate-pulse' :
                                                            order.status === 'confirmed' ? 'bg-blue-100 text-blue-700' :
                                                                order.status === 'completed' ? 'bg-green-100 text-green-700' :
                                                                    'bg-gray-100 text-gray-700'
                                                    )}>
                                                        {order.status}
                                                    </span>
                                                </div>
                                                <h4 className="text-lg font-bold mb-1">Client: {order.userId.substring(0, 8)}...</h4>
                                                <div className="text-sm text-muted-foreground italic mb-4">Commandé à {new Date(order.createdAt?.seconds * 1000).toLocaleTimeString()}</div>

                                                <div className="space-y-2 pt-4 border-t border-border/30">
                                                    {order.items?.map((item, idx) => (
                                                        <div key={idx} className="flex justify-between text-sm font-medium">
                                                            <span>{item.quantity}x {item.productName}</span>
                                                            <span className="font-bold">{item.totalPrice} FCFA</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            <div className="h-px md:h-20 w-full md:w-px bg-border/40" />

                                            <div className="flex flex-col gap-3 min-w-[200px]">
                                                <div className="text-right mb-2">
                                                    <div className="text-xs text-muted-foreground font-black uppercase">Total à encaisser</div>
                                                    <div className="text-2xl font-black text-primary font-mono">{order.total} FCFA</div>
                                                </div>

                                                {order.status === 'pending' && (
                                                    <button
                                                        onClick={() => handleUpdateStatus(order.id, 'confirmed')}
                                                        className="w-full py-4 bg-primary text-white rounded-2xl font-black text-xs hover:brightness-110 shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-2"
                                                    >
                                                        CONFIRMER L'ORDRE <ChevronRight size={14} />
                                                    </button>
                                                )}
                                                {order.status === 'confirmed' && (
                                                    <button
                                                        onClick={() => handleUpdateStatus(order.id, 'preparing')}
                                                        className="w-full py-4 bg-amber-500 text-white rounded-2xl font-black text-xs hover:brightness-110 shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-2"
                                                    >
                                                        MANTENANT EN PRÉPARATION
                                                    </button>
                                                )}
                                                {order.status === 'preparing' && (
                                                    <button
                                                        onClick={() => handleUpdateStatus(order.id, 'ready')}
                                                        className="w-full py-4 bg-green-500 text-white rounded-2xl font-black text-xs hover:brightness-110 shadow-lg shadow-green-500/20 transition-all flex items-center justify-center gap-2"
                                                    >
                                                        MARQUER COMME PRÊT ✅
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )) : (
                                    <div className="py-20 text-center bg-white dark:bg-zinc-900 rounded-[2rem] border border-dashed border-border/50">
                                        <div className="w-16 h-16 bg-secondary/50 dark:bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <ShoppingBag className="text-muted-foreground opacity-30" />
                                        </div>
                                        <h4 className="font-bold text-lg mb-1">Aucune commande en attente</h4>
                                        <p className="text-sm text-muted-foreground max-w-xs mx-auto">Toutes les commandes ont été traitées ou aucune n'est arrivée pour le moment.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {!isLoading && activeTab === "inventory" && (
                        <div className="space-y-6 max-w-6xl">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                                <div>
                                    <h3 className="text-2xl font-black mb-1">Gestion du Stock</h3>
                                    <p className="text-sm text-muted-foreground">Mettre à jour les prix et la disponibilité des médicaments</p>
                                </div>
                                <div className="flex gap-3">
                                    <div className="relative">
                                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                                        <input
                                            type="text"
                                            placeholder="Rechercher dans mon stock..."
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            className="pl-12 pr-6 py-3 bg-white dark:bg-zinc-900 border border-border rounded-2xl text-xs font-bold w-full md:w-64 focus:border-primary outline-none focus:ring-4 focus:ring-primary/5 transition-all"
                                        />
                                    </div>
                                    <button
                                        onClick={openAddModal}
                                        className="px-6 py-3 bg-primary text-white rounded-2xl font-black text-xs flex items-center gap-2 shadow-lg shadow-primary/20 hover:brightness-110 transition-all">
                                        <Plus size={16} /> AJOUTER UN PRODUIT
                                    </button>
                                </div>
                            </div>

                            <div className="bg-white dark:bg-zinc-900 rounded-[2rem] border border-border/40 overflow-hidden shadow-sm">
                                <table className="w-full text-left border-collapse">
                                    <thead className="bg-[#F8FAFC] dark:bg-zinc-800/50">
                                        <tr className="border-b border-border/30">
                                            <th className="p-6 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Médicament</th>
                                            <th className="p-6 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Catégorie</th>
                                            <th className="p-6 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Prix (FCFA)</th>
                                            <th className="p-6 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Stock</th>
                                            <th className="p-6 text-[10px] font-black uppercase tracking-widest text-muted-foreground text-center">Statut</th>
                                            <th className="p-6 text-[10px] font-black uppercase tracking-widest text-muted-foreground text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredInventory.map((item, i) => (
                                            <tr key={i} className="border-b border-border/10 hover:bg-secondary/10 dark:hover:bg-zinc-800/20 transition-colors group">
                                                <td className="p-6">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-xl">💊</div>
                                                        <div>
                                                            <div className="font-bold text-foreground">{item.name}</div>
                                                            <div className="text-[10px] text-muted-foreground/60 font-medium tracking-tight">ID: {item.id}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="p-6">
                                                    <span className="text-[10px] font-bold px-2 py-1 bg-secondary dark:bg-zinc-800 rounded-lg uppercase">{item.category}</span>
                                                </td>
                                                <td className="p-6">
                                                    <span className="font-black text-primary font-mono">{item.price}</span>
                                                </td>
                                                <td className="p-6">
                                                    <span className={cn(
                                                        "font-bold text-sm",
                                                        (item.stock || 0) < 10 ? "text-red-500 font-black" : "text-foreground"
                                                    )}>
                                                        {item.stock}
                                                    </span>
                                                </td>
                                                <td className="p-6 text-center">
                                                    <button
                                                        onClick={() => toggleStockLevel(item)}
                                                        className={cn(
                                                            "px-4 py-1.5 rounded-full text-[10px] font-black tracking-widest uppercase transition-all",
                                                            item.inStock
                                                                ? "bg-green-100 text-green-700 dark:bg-green-500/20"
                                                                : "bg-red-100 text-red-700 dark:bg-red-500/20 animate-pulse"
                                                        )}
                                                    >
                                                        {item.inStock ? "Disponible" : "Rupture"}
                                                    </button>
                                                </td>
                                                <td className="p-6 text-right">
                                                    <div className="flex justify-end gap-2">
                                                        <button
                                                            onClick={() => openEditModal(item)}
                                                            className="p-2 hover:bg-white border-border border rounded-xl hover:shadow-md transition-all">
                                                            <Edit size={14} className="text-muted-foreground" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteProduct(item)}
                                                            className="p-2 hover:bg-red-50 border-red-100 border rounded-xl hover:shadow-md transition-all group/delete">
                                                            <Trash2 size={14} className="text-muted-foreground group-hover/delete:text-red-500" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {!isLoading && activeTab === "dashboard" && (
                        <div className="space-y-8 max-w-6xl">
                            <h3 className="text-3xl font-black italic tracking-tight">Performance Commerciale 📈</h3>

                            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                                {[
                                    { label: "Ventes du Jour", value: "84,000 FCFA", icon: DollarSign, trend: "+12%", color: "bg-green-500" },
                                    { label: "Commandes Neuves", value: orders.length.toString(), icon: ShoppingBag, trend: "Aujourd'hui", color: "bg-primary" },
                                    { label: "Ruptures Stock", value: inventory.filter(p => !p.inStock).length.toString(), icon: AlertCircle, trend: "Action requise", color: "bg-red-500" },
                                    { label: "Clients Fidèles", value: "247", icon: Users, trend: "+3", color: "bg-purple-500" }
                                ].map((stat, i) => (
                                    <div key={i} className="bg-white dark:bg-zinc-900 p-6 rounded-[2.5rem] border border-border/40 shadow-sm relative overflow-hidden group">
                                        <div className={cn("absolute top-0 right-0 w-24 h-24 opacity-5 translate-x-1/2 -translate-y-1/2 rounded-full", stat.color)} />
                                        <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center text-white mb-6 shadow-lg", stat.color)}>
                                            <stat.icon size={22} />
                                        </div>
                                        <div className="text-2xl font-black text-foreground mb-1">{stat.value}</div>
                                        <div className="text-[10px] text-muted-foreground font-black uppercase tracking-widest flex items-center justify-between">
                                            {stat.label}
                                            <span className="text-green-500">{stat.trend}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-10">
                                <div className="bg-white dark:bg-zinc-900 p-8 rounded-[3rem] border border-border/30">
                                    <h4 className="font-bold text-lg mb-6 flex items-center justify-between">
                                        Flux des Ventes
                                        <TrendingUp size={18} className="text-green-500" />
                                    </h4>
                                    <div className="h-48 flex items-end gap-2 px-2">
                                        {[40, 70, 45, 90, 65, 80, 55, 95, 30, 85].map((h, i) => (
                                            <div key={i} className="flex-1 bg-primary/10 rounded-t-lg relative group transition-all">
                                                <div
                                                    className="absolute bottom-0 left-0 right-0 bg-primary rounded-t-lg group-hover:brightness-110 transition-all cursor-pointer"
                                                    style={{ height: `${h}%` }}
                                                >
                                                    <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-zinc-900 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                                        {h * 1000} FCFA
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="flex justify-between mt-4 text-[10px] font-bold text-muted-foreground uppercase px-2">
                                        <span>08h</span>
                                        <span>12h</span>
                                        <span>16h</span>
                                        <span>20h</span>
                                    </div>
                                </div>

                                <div className="bg-white dark:bg-zinc-900 p-8 rounded-[3rem] border border-border/30">
                                    <h4 className="font-bold text-lg mb-6">Alertes de Stock</h4>
                                    <div className="space-y-4">
                                        {inventory.filter(p => (p.stock || 0) < 10).map((item, i) => (
                                            <div key={i} className="flex items-center justify-between p-4 bg-red-50 dark:bg-red-500/5 rounded-2xl border border-red-200/50 dark:border-red-500/20">
                                                <div className="flex items-center gap-3">
                                                    <AlertCircle className="text-red-500" size={18} />
                                                    <div>
                                                        <div className="text-sm font-bold">{item.name}</div>
                                                        <div className="text-[10px] text-red-500/70 font-black uppercase">Plus que {item.stock} unités</div>
                                                    </div>
                                                </div>
                                                <button className="px-4 py-2 bg-red-500 text-white text-[10px] font-black rounded-xl shadow-lg shadow-red-500/20">RÉAPPROVISIONNER</button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                </div>
            </main>

            {/* Product Add/Edit Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
                    <div className="relative bg-white dark:bg-zinc-900 w-full max-w-xl rounded-[2.5rem] shadow-2xl overflow-hidden border border-border/50 animate-in fade-in zoom-in duration-300">
                        <div className="p-8 border-b border-border/30 flex justify-between items-center bg-gradient-to-r from-primary/5 to-transparent">
                            <div>
                                <h3 className="text-2xl font-black italic tracking-tight uppercase">
                                    {editingProduct ? "Modifier Produit" : "Ajouter un Produit"}
                                </h3>
                                <p className="text-xs text-muted-foreground font-bold mt-1 uppercase tracking-widest">
                                    {editingProduct ? `ID: ${editingProduct.id}` : "Nouveau médicament dans le stock"}
                                </p>
                            </div>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="w-10 h-10 rounded-full bg-secondary hover:bg-secondary/80 flex items-center justify-center transition-all"
                            >
                                <Plus className="rotate-45" size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSaveProduct} className="p-8 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="md:col-span-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground block mb-2 px-1">Nom du Médicament</label>
                                    <input
                                        required
                                        type="text"
                                        placeholder="Ex: Paracétamol 500mg"
                                        className="w-full px-6 py-4 bg-secondary/50 dark:bg-zinc-800 border-none rounded-2xl font-bold focus:ring-4 focus:ring-primary/10 outline-none transition-all"
                                        value={productForm.name}
                                        onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                                    />
                                </div>

                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground block mb-2 px-1">Catégorie</label>
                                    <select
                                        className="w-full px-6 py-4 bg-secondary/50 dark:bg-zinc-800 border-none rounded-2xl font-bold focus:ring-4 focus:ring-primary/10 outline-none transition-all appearance-none"
                                        value={productForm.category}
                                        onChange={(e) => setProductForm({ ...productForm, category: e.target.value as any })}
                                    >
                                        <option value="medicament">Médicament</option>
                                        <option value="parapharmacie">Parapharmacie</option>
                                        <option value="materiel">Matériel Médical</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground block mb-2 px-1">Prix (FCFA)</label>
                                    <input
                                        required
                                        type="number"
                                        placeholder="0"
                                        className="w-full px-6 py-4 bg-secondary/50 dark:bg-zinc-800 border-none rounded-2xl font-bold focus:ring-4 focus:ring-primary/10 outline-none transition-all"
                                        value={productForm.price || ""}
                                        onChange={(e) => setProductForm({ ...productForm, price: Number(e.target.value) })}
                                    />
                                </div>

                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground block mb-2 px-1">Stock Initial</label>
                                    <input
                                        required
                                        type="number"
                                        placeholder="0"
                                        className="w-full px-6 py-4 bg-secondary/50 dark:bg-zinc-800 border-none rounded-2xl font-bold focus:ring-4 focus:ring-primary/10 outline-none transition-all"
                                        value={productForm.stock || ""}
                                        onChange={(e) => setProductForm({ ...productForm, stock: Number(e.target.value) })}
                                    />
                                </div>

                                <div className="flex items-center gap-3 bg-secondary/30 p-4 rounded-2xl">
                                    <input
                                        type="checkbox"
                                        id="prescription"
                                        className="w-5 h-5 accent-primary"
                                        checked={productForm.requiresPrescription}
                                        onChange={(e) => setProductForm({ ...productForm, requiresPrescription: e.target.checked })}
                                    />
                                    <label htmlFor="prescription" className="text-xs font-bold cursor-pointer">Ordonnance Obligatoire ?</label>
                                </div>

                                <div className="md:col-span-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground block mb-2 px-1">Description (Optionnel)</label>
                                    <textarea
                                        rows={3}
                                        placeholder="Détails du produit..."
                                        className="w-full px-6 py-4 bg-secondary/50 dark:bg-zinc-800 border-none rounded-2xl font-bold focus:ring-4 focus:ring-primary/10 outline-none transition-all resize-none"
                                        value={productForm.description}
                                        onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="pt-4 flex gap-4">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="flex-1 py-4 bg-secondary text-foreground rounded-2xl font-black text-xs hover:brightness-95 transition-all"
                                >
                                    ANNULER
                                </button>
                                <button
                                    disabled={isLoading}
                                    type="submit"
                                    className="flex-[2] py-4 bg-primary text-white rounded-2xl font-black text-xs hover:brightness-110 shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-2"
                                >
                                    {isLoading ? <RefreshCw className="animate-spin" size={16} /> : <CheckCircle size={16} />}
                                    {editingProduct ? "ENREGISTRER LES MODIFICATIONS" : "AJOUTER AU STOCK"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
