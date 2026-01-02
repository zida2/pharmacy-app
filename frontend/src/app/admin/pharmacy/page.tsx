"use client";

import React, { useState } from "react";
import {
    Package,
    TrendingUp,
    Clock,
    DollarSign,
    Settings,
    Users,
    BarChart3,
    Plus,
    Edit,
    Trash2,
    CheckCircle,
    Database
} from "lucide-react";
import { cn } from "@/lib/utils";
import { seedDatabase } from "@/services/seed";

interface PharmacyProduct {
    id: string;
    name: string;
    price: number;
    stock: number;
    inStock: boolean;
}

export default function PharmacyAdminPage() {
    const [activeTab, setActiveTab] = useState<"dashboard" | "products" | "orders" | "settings">("dashboard");
    const [products, setProducts] = useState<PharmacyProduct[]>([
        { id: "1", name: "Doliprane 1000mg", price: 1500, stock: 45, inStock: true },
        { id: "2", name: "Amoxicilline", price: 2500, stock: 12, inStock: true },
        { id: "3", name: "Efferalgan", price: 1800, stock: 0, inStock: false },
    ]);

    const stats = [
        { label: "Commandes aujourd'hui", value: "24", icon: Package, color: "text-blue-600 bg-blue-50" },
        { label: "Revenus du jour", value: "45,000 FCFA", icon: DollarSign, color: "text-green-600 bg-green-50" },
        { label: "Produits en stock", value: "157", icon: TrendingUp, color: "text-purple-600 bg-purple-50" },
        { label: "Commandes en attente", value: "8", icon: Clock, color: "text-orange-600 bg-orange-50" }
    ];

    const recentOrders = [
        { id: "1", customer: "Kouadio Jean", amount: 3500, status: "preparing", time: "Il y a 10 min" },
        { id: "2", customer: "Adjoua Marie", amount: 5200, status: "ready", time: "Il y a 25 min" },
        { id: "3", customer: "Yao Patrick", amount: 1500, status: "completed", time: "Il y a 1h" }
    ];

    const toggleProductStock = (id: string) => {
        setProducts(products.map(p =>
            p.id === id ? { ...p, inStock: !p.inStock } : p
        ));
    };

    const handleSeed = async () => {
        if (confirm("Attention: Cela va créer des données de test dans votre base Firebase. Continuer ?")) {
            try {
                await seedDatabase();
                alert("Données initialisées avec succès ! 🚀");
            } catch (error) {
                console.error(error);
                alert("Erreur lors de l'initialisation. Vérifiez la console.");
            }
        }
    };

    return (
        <main className="min-h-screen bg-secondary/20 pb-24">
            {/* Header */}
            <header className="bg-gradient-to-r from-primary to-primary/80 p-6 text-white">
                <h1 className="text-2xl font-bold mb-1">Pharmacie du Plateau</h1>
                <p className="text-white/90 text-sm">Admin - Back Office</p>
            </header>

            {/* Tabs */}
            <div className="sticky top-0 z-20 bg-white border-b border-border overflow-x-auto">
                <div className="flex">
                    {[
                        { id: "dashboard", label: "Tableau de bord", icon: BarChart3 },
                        { id: "products", label: "Produits", icon: Package },
                        { id: "orders", label: "Commandes", icon: Users },
                        { id: "settings", label: "Paramètres", icon: Settings }
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={cn(
                                "flex items-center gap-2 px-6 py-4 font-semibold whitespace-nowrap transition-all",
                                activeTab === tab.id
                                    ? "text-primary border-b-2 border-primary"
                                    : "text-muted-foreground hover:text-foreground"
                            )}
                        >
                            <tab.icon size={18} />
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Content */}
            <div className="p-4">
                {activeTab === "dashboard" && (
                    <div className="space-y-6">
                        {/* Stats Grid */}
                        <div className="grid grid-cols-2 gap-4">
                            {stats.map((stat, index) => (
                                <div key={index} className="bg-white rounded-2xl p-5 shadow-sm">
                                    <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center mb-3", stat.color)}>
                                        <stat.icon className="w-6 h-6" />
                                    </div>
                                    <div className="text-2xl font-bold text-foreground mb-1">{stat.value}</div>
                                    <div className="text-xs text-muted-foreground">{stat.label}</div>
                                </div>
                            ))}
                        </div>

                        {/* Recent Orders */}
                        <div className="bg-white rounded-2xl p-5 shadow-sm">
                            <h3 className="font-bold text-lg mb-4">Commandes récentes</h3>
                            <div className="space-y-3">
                                {recentOrders.map(order => (
                                    <div key={order.id} className="flex items-center gap-4 p-3 bg-secondary/20 rounded-xl">
                                        <div className="flex-1">
                                            <div className="font-semibold">{order.customer}</div>
                                            <div className="text-sm text-muted-foreground">{order.time}</div>
                                        </div>
                                        <div className="text-right">
                                            <div className="font-bold text-primary">{order.amount} FCFA</div>
                                            <div className={cn(
                                                "text-xs px-2 py-1 rounded-full font-medium inline-block mt-1",
                                                order.status === "completed" ? "bg-green-100 text-green-700" :
                                                    order.status === "ready" ? "bg-blue-100 text-blue-700" :
                                                        "bg-orange-100 text-orange-700"
                                            )}>
                                                {order.status === "completed" ? "Terminée" : order.status === "ready" ? "Prête" : "En cours"}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === "products" && (
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <h2 className="text-xl font-bold">Gestion des produits</h2>
                            <button className="px-4 py-2 bg-primary text-primary-foreground rounded-xl font-semibold flex items-center gap-2 shadow-lg hover:opacity-90">
                                <Plus size={18} />
                                Ajouter
                            </button>
                        </div>

                        <div className="space-y-3">
                            {products.map(product => (
                                <div key={product.id} className="bg-white rounded-2xl p-4 shadow-sm">
                                    <div className="flex items-start gap-4">
                                        <div className="w-16 h-16 bg-gradient-to-br from-primary/10 to-primary/5 rounded-xl flex items-center justify-center text-2xl">
                                            💊
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="font-bold mb-1">{product.name}</h3>
                                            <div className="flex items-center gap-4 text-sm">
                                                <span className="text-primary font-bold">{product.price} FCFA</span>
                                                <span className={cn(
                                                    "px-2 py-1 rounded-full text-xs font-medium",
                                                    product.stock > 10 ? "bg-green-100 text-green-700" :
                                                        product.stock > 0 ? "bg-orange-100 text-orange-700" :
                                                            "bg-red-100 text-red-700"
                                                )}>
                                                    Stock: {product.stock}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="flex flex-col gap-2">
                                            <button
                                                onClick={() => toggleProductStock(product.id)}
                                                className={cn(
                                                    "px-3 py-1.5 rounded-lg text-xs font-semibold transition-all",
                                                    product.inStock
                                                        ? "bg-green-100 text-green-700 hover:bg-green-200"
                                                        : "bg-red-100 text-red-700 hover:bg-red-200"
                                                )}
                                            >
                                                {product.inStock ? "Disponible" : "Rupture"}
                                            </button>
                                            <div className="flex gap-1">
                                                <button className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100">
                                                    <Edit size={16} />
                                                </button>
                                                <button className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100">
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {activeTab === "settings" && (
                    <div className="space-y-4">
                        {/* Database Actions */}
                        <div className="bg-white rounded-2xl p-5 shadow-sm border border-primary/20 bg-primary/5">
                            <h3 className="font-bold text-lg mb-2 text-primary">Zone Technique</h3>
                            <p className="text-sm text-muted-foreground mb-4">
                                Utilisez ce bouton uniquement lors de la première configuration pour remplir la base de données.
                            </p>
                            <button
                                onClick={handleSeed}
                                className="w-full py-3 bg-white border-2 border-primary text-primary font-bold rounded-xl hover:bg-primary hover:text-white transition-all shadow-sm flex items-center justify-center gap-2"
                            >
                                <Database size={18} />
                                Initialiser la Base de Données (Seed)
                            </button>
                        </div>

                        <div className="bg-white rounded-2xl p-5 shadow-sm">
                            <h3 className="font-bold text-lg mb-4">Informations de la pharmacie</h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-semibold mb-2">Nom</label>
                                    <input
                                        type="text"
                                        defaultValue="Pharmacie du Plateau"
                                        className="w-full px-4 py-3 bg-secondary rounded-xl border-2 border-transparent focus:border-primary focus:outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold mb-2">Téléphone</label>
                                    <input
                                        type="tel"
                                        defaultValue="+225 01 01 01 01 01"
                                        className="w-full px-4 py-3 bg-secondary rounded-xl border-2 border-transparent focus:border-primary focus:outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold mb-2">Adresse</label>
                                    <textarea
                                        defaultValue="Boulevard de la République, Plateau"
                                        rows={3}
                                        className="w-full px-4 py-3 bg-secondary rounded-xl border-2 border-transparent focus:border-primary focus:outline-none resize-none"
                                    />
                                </div>
                                <button className="w-full py-3 bg-primary text-primary-foreground font-semibold rounded-xl shadow-lg hover:opacity-90">
                                    Enregistrer les modifications
                                </button>
                            </div>
                        </div>

                        <div className="bg-white rounded-2xl p-5 shadow-sm">
                            <h3 className="font-bold text-lg mb-4">Horaires d'ouverture</h3>
                            <div className="space-y-3">
                                {["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"].map(day => (
                                    <div key={day} className="flex items-center gap-4">
                                        <div className="w-24 font-medium">{day}</div>
                                        <input type="time" defaultValue="08:00" className="px-3 py-2 bg-secondary rounded-lg" />
                                        <span>-</span>
                                        <input type="time" defaultValue="20:00" className="px-3 py-2 bg-secondary rounded-lg" />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </main>
    );
}
