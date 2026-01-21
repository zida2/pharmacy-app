"use client";

import React, { useEffect, useState } from 'react';
import {
    Users,
    Store,
    MapPin,
    ShieldAlert,
    Activity,
    ArrowUpRight,
    Search
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { collection, getCountFromServer, query, where } from 'firebase/firestore';
import { db } from '@/services/firebase';

interface StatCardProps {
    title: string;
    value: string | number;
    icon: React.ElementType;
    trend?: string;
    trendUp?: boolean;
    color: string;
}

function StatCard({ title, value, icon: Icon, trend, trendUp, color }: StatCardProps) {
    return (
        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-300 group">
            <div className="flex justify-between items-start mb-4">
                <div className={cn("p-3 rounded-xl", color)}>
                    <Icon className="w-6 h-6 text-white" />
                </div>
                {trend && (
                    <div className={cn(
                        "flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full",
                        trendUp ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                    )}>
                        {trend}
                        <ArrowUpRight size={12} className={trendUp ? "" : "rotate-180"} />
                    </div>
                )}
            </div>
            <h3 className="text-muted-foreground text-sm font-medium mb-1">{title}</h3>
            <p className="text-3xl font-bold text-foreground">{value}</p>
        </div>
    );
}

export default function AdminDashboard() {
    const [stats, setStats] = useState({
        pharmacies: 0,
        clinics: 0,
        reports: 0,
        users: 1250 // Mocked for now
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchStats() {
            try {
                // Fetch counts from Firestore
                const pharmaciesSnapshot = await getCountFromServer(collection(db, "pharmacies"));
                const clinicsSnapshot = await getCountFromServer(collection(db, "clinics"));
                // For reports, maybe count only pending?
                const reportsQ = query(collection(db, "reports"), where("status", "==", "pending"));
                const reportsSnapshot = await getCountFromServer(reportsQ);

                setStats({
                    pharmacies: pharmaciesSnapshot.data().count,
                    clinics: clinicsSnapshot.data().count,
                    reports: reportsSnapshot.data().count,
                    users: 1250 // Placeholder
                });
            } catch (error) {
                console.error("Error fetching admin stats:", error);
            } finally {
                setLoading(false);
            }
        }

        fetchStats();
    }, []);

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-foreground">Vue d'ensemble</h2>
                    <p className="text-muted-foreground mt-1">Bienvenue sur le tableau de bord administrateur de PharmaBF.</p>
                </div>
                <div className="flex items-center gap-2">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
                        <input
                            type="text"
                            placeholder="Rechercher..."
                            className="pl-9 pr-4 py-2 rounded-xl border border-input bg-background/50 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-primary/20 w-64"
                        />
                    </div>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    title="Pharmacies Totales"
                    value={loading ? "..." : stats.pharmacies}
                    icon={Store}
                    trend="+12%"
                    trendUp={true}
                    color="bg-emerald-500"
                />
                <StatCard
                    title="Cliniques & Hôpitaux"
                    value={loading ? "..." : stats.clinics}
                    icon={Activity}
                    trend="+5%"
                    trendUp={true}
                    color="bg-blue-500"
                />
                <StatCard
                    title="Signalements en attente"
                    value={loading ? "..." : stats.reports}
                    icon={ShieldAlert}
                    trend={stats.reports > 0 ? "Action requise" : "Tout est calme"}
                    trendUp={stats.reports === 0}
                    color="bg-amber-500"
                />
                <StatCard
                    title="Validations GPS"
                    value="42"
                    icon={MapPin}
                    trend="+8 this week"
                    trendUp={true}
                    color="bg-purple-500"
                />
            </div>

            {/* Recent Activity / Charts Section Placeholder */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-card border border-border rounded-2xl p-6 min-h-[300px]">
                    <h3 className="font-semibold text-lg mb-4">Activité Récente</h3>
                    <div className="space-y-4">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="flex items-center gap-4 p-3 rounded-lg hover:bg-secondary/50 transition-colors">
                                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                                    PH
                                </div>
                                <div>
                                    <p className="font-medium">Nouvelle pharmacie ajoutée</p>
                                    <p className="text-xs text-muted-foreground">Il y a 2 heures</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-card border border-border rounded-2xl p-6 min-h-[300px]">
                    <h3 className="font-semibold text-lg mb-4">Répartition des Prestataires</h3>
                    <div className="flex items-center justify-center h-[200px] text-muted-foreground">
                        Graphique à venir...
                    </div>
                </div>
            </div>
        </div>
    );
}
