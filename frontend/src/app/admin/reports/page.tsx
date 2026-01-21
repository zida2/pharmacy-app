"use client";

import React, { useEffect, useState } from 'react';
import { collection, query, where, getDocs, doc, updateDoc, orderBy } from 'firebase/firestore';
import { db } from '@/services/firebase';
import { AlertTriangle, Check, X, Clock, MapPin, Store } from 'lucide-react';
import { toast } from 'sonner';

interface Report {
    id: string;
    providerId: string;
    providerName?: string; // Might need to fetch
    type: string;
    description: string;
    status: 'pending' | 'resolved' | 'dismissed';
    createdAt: any;
    details?: string;
}

export default function ReportsPage() {
    const [reports, setReports] = useState<Report[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchReports = async () => {
        setLoading(true);
        try {
            const q = query(
                collection(db, "reports"),
                where("status", "==", "pending")
                // orderBy("createdAt", "desc") // Requires index
            );
            const snapshot = await getDocs(q);
            const items: Report[] = [];
            snapshot.forEach((doc: any) => {
                items.push({ id: doc.id, ...doc.data() } as Report);
            });
            setReports(items);
        } catch (error) {
            console.error("Error fetching reports:", error);
            // If index error, toast it
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReports();
    }, []);

    const handleAction = async (reportId: string, action: 'resolved' | 'dismissed') => {
        try {
            await updateDoc(doc(db, "reports", reportId), {
                status: action,
                resolvedAt: new Date()
            });
            toast.success(`Signalement ${action === 'resolved' ? 'résolu' : 'rejeté'}`);
            setReports(prev => prev.filter(r => r.id !== reportId));
        } catch (error) {
            toast.error("Erreur mise à jour");
        }
    };

    const getIcon = (type: string) => {
        switch (type) {
            case 'closed': return <Clock className="text-red-500" />;
            case 'location': return <MapPin className="text-blue-500" />;
            default: return <AlertTriangle className="text-amber-500" />;
        }
    };

    return (
        <div className="space-y-6">
            <header className="flex justify-between items-center">
                <h1 className="text-2xl font-bold">Signalements ({reports.length})</h1>
            </header>

            <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
                <table className="w-full text-left bg-card">
                    <thead>
                        <tr className="border-b border-border bg-secondary/30">
                            <th className="p-4 font-semibold">Type</th>
                            <th className="p-4 font-semibold">Prestataire (ID)</th>
                            <th className="p-4 font-semibold">Détails</th>
                            <th className="p-4 font-semibold">Date</th>
                            <th className="p-4 font-semibold text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {reports.length === 0 && !loading && (
                            <tr>
                                <td colSpan={5} className="p-8 text-center text-muted-foreground">
                                    Aucun signalement en attente.
                                </td>
                            </tr>
                        )}
                        {reports.map((report) => (
                            <tr key={report.id} className="hover:bg-secondary/10 transition-colors">
                                <td className="p-4">
                                    <div className="flex items-center gap-2 font-medium capitalize">
                                        {getIcon(report.type)}
                                        {report.type.replace('_', ' ')}
                                    </div>
                                </td>
                                <td className="p-4 font-mono text-xs">
                                    {report.providerId}
                                </td>
                                <td className="p-4 text-sm max-w-md truncate">
                                    {report.details || report.description || "Aucun détail"}
                                </td>
                                <td className="p-4 text-sm text-muted-foreground">
                                    {report.createdAt?.seconds ? new Date(report.createdAt.seconds * 1000).toLocaleDateString() : 'N/A'}
                                </td>
                                <td className="p-4 text-right space-x-2">
                                    <button
                                        onClick={() => handleAction(report.id, 'dismissed')}
                                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-secondary hover:bg-secondary/80 text-foreground transition-colors"
                                    >
                                        <X size={14} /> Rejeter
                                    </button>
                                    <button
                                        onClick={() => handleAction(report.id, 'resolved')}
                                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400 dark:hover:bg-green-900/50 transition-colors"
                                    >
                                        <Check size={14} /> Résoudre
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
