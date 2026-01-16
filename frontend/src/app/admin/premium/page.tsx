"use client";

import React, { useState, useEffect } from "react";
import { firebaseService } from "@/services/firebaseService";
import {
    CheckCircle2,
    XCircle,
    Clock,
    ShieldCheck,
    Smartphone,
    User,
    ArrowLeft,
    RefreshCcw,
    Loader2
} from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

export default function AdminPremiumPage() {
    const router = useRouter();
    const [requests, setRequests] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState<string | null>(null);

    const loadRequests = async () => {
        setIsLoading(true);
        const data = await firebaseService.getPendingPremiumRequests();
        setRequests(data);
        setIsLoading(false);
    };

    useEffect(() => {
        loadRequests();
    }, []);

    const handleApprove = async (requestId: string, userId: string, plan: string) => {
        if (!confirm("Voulez-vous valider cet ID de transaction ?")) return;
        setActionLoading(requestId);
        try {
            await firebaseService.validatePremiumRequest(requestId, userId, plan);
            setRequests(requests.filter(r => r.id !== requestId));
        } catch (error) {
            alert("Erreur lors de la validation");
        } finally {
            setActionLoading(null);
        }
    };

    const handleReject = async (requestId: string, userId: string) => {
        if (!confirm("Voulez-vous rejeter cette demande ?")) return;
        setActionLoading(requestId);
        try {
            await firebaseService.rejectPremiumRequest(requestId, userId);
            setRequests(requests.filter(r => r.id !== requestId));
        } catch (error) {
            alert("Erreur lors du rejet");
        } finally {
            setActionLoading(null);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 p-6 pt-safe">
            <div className="max-w-4xl mx-auto space-y-8">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button onClick={() => router.back()} className="p-2 bg-white dark:bg-zinc-900 rounded-xl shadow-sm">
                            <ArrowLeft size={20} />
                        </button>
                        <div>
                            <h1 className="text-2xl font-black italic tracking-tighter">Gestion Premium</h1>
                            <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest">Validation des transferts manuels</p>
                        </div>
                    </div>
                    <button
                        onClick={loadRequests}
                        disabled={isLoading}
                        className="p-3 bg-white dark:bg-zinc-900 rounded-xl shadow-sm hover:rotate-180 transition-transform duration-500"
                    >
                        {isLoading ? <Loader2 className="animate-spin" size={20} /> : <RefreshCcw size={20} />}
                    </button>
                </div>

                {/* Requests List */}
                <div className="space-y-4">
                    {isLoading ? (
                        Array.from({ length: 3 }).map((_, i) => (
                            <div key={i} className="h-32 bg-white dark:bg-zinc-900 rounded-[2rem] border border-border animate-pulse" />
                        ))
                    ) : requests.length === 0 ? (
                        <div className="text-center py-20 bg-white dark:bg-zinc-900 rounded-[2rem] border-2 border-dashed border-border/50">
                            <ShieldCheck size={48} className="mx-auto text-slate-200 mb-4" />
                            <h3 className="font-black text-slate-400 italic">Aucune demande en attente</h3>
                            <p className="text-xs text-slate-300 font-bold uppercase tracking-widest mt-1">Tout est à jour !</p>
                        </div>
                    ) : (
                        requests.map((req) => (
                            <div key={req.id} className="bg-white dark:bg-zinc-900 rounded-[2rem] border border-border overflow-hidden shadow-sm hover:shadow-md transition-all">
                                <div className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
                                    <div className="flex items-center gap-4">
                                        <div className="w-14 h-14 bg-amber-100 dark:bg-amber-500/10 rounded-2xl flex items-center justify-center text-amber-600">
                                            <Smartphone size={28} />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-[10px] font-black bg-amber-100 text-amber-700 px-2 py-0.5 rounded uppercase">{req.plan}</span>
                                                <span className="text-[10px] font-black text-muted-foreground">ID: {req.userId.substring(0, 8)}...</span>
                                            </div>
                                            <h3 className="font-black text-lg italic text-foreground tracking-tight">ID Transaction: {req.transactionId}</h3>
                                            <div className="flex items-center gap-2 text-xs text-muted-foreground font-bold uppercase tracking-tight mt-1">
                                                <Clock size={12} />
                                                {req.createdAt?.toDate ? req.createdAt.toDate().toLocaleString('fr-FR') : 'Date inconnue'}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <button
                                            onClick={() => handleReject(req.id, req.userId)}
                                            disabled={actionLoading === req.id}
                                            className="flex-1 md:flex-none px-6 py-3 bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-red-100 transition-colors flex items-center justify-center gap-2"
                                        >
                                            {actionLoading === req.id ? <Loader2 className="animate-spin" size={16} /> : <XCircle size={16} />}
                                            Rejeter
                                        </button>
                                        <button
                                            onClick={() => handleApprove(req.id, req.userId, req.plan)}
                                            disabled={actionLoading === req.id}
                                            className="flex-1 md:flex-none px-6 py-3 bg-emerald-600 text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-emerald-700 shadow-lg shadow-emerald-500/20 active:scale-95 transition-all flex items-center justify-center gap-2"
                                        >
                                            {actionLoading === req.id ? <Loader2 className="animate-spin" size={16} /> : <CheckCircle2 size={16} />}
                                            Valider
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
