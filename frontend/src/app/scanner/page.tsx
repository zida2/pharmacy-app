"use client";

import React, { useState, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Camera, RefreshCw, CheckCircle, Search, FileText, CreditCard, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { firebaseService } from "@/services/firebaseService";
import { auth } from "@/services/firebase";

function ScannerContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const modeParam = searchParams.get("mode");
    const mode = modeParam === "insurance" ? "insurance" : modeParam === "document" ? "document" : "prescription";
    const returnUrl = searchParams.get("returnUrl") || "/";

    const [step, setStep] = useState<"upload" | "scanning" | "results">("upload");
    const [preview, setPreview] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Prescription State
    const [scannedMeds, setScannedMeds] = useState<{ name: string, confidence: number }[]>([]);

    // Insurance State
    const [scannedCard, setScannedCard] = useState<{ provider: string, number: string, coverage: number } | null>(null);

    // Document State
    const [scannedDoc, setScannedDoc] = useState<{ type: string, date: string, preview: string } | null>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const url = URL.createObjectURL(file);
            setPreview(url);
            startScan();
        }
    };

    const startScan = () => {
        setStep("scanning");
        // Simulate IA Analysis
        setTimeout(() => {
            if (mode === "insurance") {
                setScannedCard({
                    provider: "SONAR ASSURANCES",
                    number: "MAT-" + Math.floor(Math.random() * 10000000),
                    coverage: 80
                });
            } else if (mode === "document") {
                setScannedDoc({
                    type: "Rapport Médical",
                    date: new Date().toLocaleDateString('fr-FR'),
                    preview: "Doc #88392"
                });
            } else {
                setScannedMeds([
                    { name: "Doliprane 1000mg", confidence: 0.98 },
                    { name: "Amoxicilline 500mg", confidence: 0.92 },
                    { name: "Spasfon Lyoc", confidence: 0.85 }
                ]);
            }
            setStep("results");
        }, 3000);
    };

    const handleSaveInsurance = async () => {
        if (!scannedCard || !auth.currentUser) {
            router.push(returnUrl);
            return;
        }

        // Save to User Profile
        await firebaseService.saveUserProfile(auth.currentUser.uid, {
            insurance: {
                provider: scannedCard.provider,
                number: scannedCard.number,
                coverage: scannedCard.coverage,
                verified: true
            }
        });

        alert("Carte d'assurance enregistrée avec succès !");
        router.push(returnUrl);
    };

    const handleSaveDocument = () => {
        alert("Document sauvegardé dans votre Carnet de Santé !");
        router.push(returnUrl);
    };

    return (
        <div className="container mx-auto max-w-lg min-h-screen flex flex-col pt-safe p-4">
            {/* Header */}
            <header className="py-4 flex items-center gap-4">
                <button onClick={() => router.back()} className="p-3 bg-secondary rounded-2xl">
                    <ArrowLeft size={24} />
                </button>
                <h1 className="text-xl font-black italic tracking-tight">
                    {mode === "insurance" ? "Scanner Carte Assurance" : mode === "document" ? "Scanner Document" : "Scanner Ordonnance"}
                </h1>
            </header>

            <div className="flex-1 flex flex-col gap-6 w-full pb-10">

                {step === "upload" && (
                    <div className="flex-1 flex flex-col items-center justify-center gap-8 animate-in fade-in duration-700">
                        <div className="w-64 h-48 bg-primary/5 rounded-[2rem] border-4 border-dashed border-primary/20 flex items-center justify-center relative overflow-hidden group hover:bg-primary/10 transition-colors">
                            {mode === "insurance" ? <CreditCard size={64} className="text-primary/40" /> : mode === "document" ? <FileText size={64} className="text-primary/40" /> : <FileText size={64} className="text-primary/40" />}
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleFileChange}
                                accept="image/*"
                                className="absolute inset-0 opacity-0 cursor-pointer"
                            />
                        </div>
                        <div className="text-center space-y-2">
                            <h2 className="text-2xl font-black">
                                {mode === "insurance" ? "Photo de la carte" : mode === "document" ? "Photo du document" : "Photo de l'ordonnance"}
                            </h2>
                            <p className="text-muted-foreground text-sm max-w-[250px] mx-auto">
                                {mode === "insurance"
                                    ? "Cadrez bien votre carte d'assurance pour extraire les informations."
                                    : mode === "document"
                                        ? "Numérisez vos rapports médicaux pour votre carnet de santé."
                                        : "Notre IA va déchiffrer l'écriture du médecin et trouver vos médicaments."}
                            </p>
                        </div>
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            className="w-full py-3.5 bg-primary text-white text-base font-black rounded-2xl shadow-xl shadow-primary/20 transition hover:brightness-110 active:scale-95 tracking-widest mt-4"
                        >
                            DÉMARRER LE SCAN 📸
                        </button>
                    </div>
                )}

                {step === "scanning" && (
                    <div className="flex-1 flex flex-col items-center justify-center gap-8 animate-in fade-in duration-500">
                        <div className="relative w-full aspect-[3/4] rounded-[2rem] overflow-hidden border-2 border-primary/30 shadow-2xl">
                            {preview && <img src={preview} className="w-full h-full object-cover grayscale opacity-50" alt="Preview" />}
                            <div className="absolute inset-x-0 h-1 bg-primary shadow-[0_0_20px_#6366f1] animate-scan-line top-0 z-10" />
                            <div className="absolute inset-0 bg-gradient-to-b from-primary/20 to-transparent" />
                        </div>
                        <div className="flex flex-col items-center gap-2">
                            <RefreshCw size={48} className="text-primary animate-spin" />
                            <h2 className="text-2xl font-black italic animate-pulse">Analyse Gemini IA...</h2>
                            <p className="text-xs text-muted-foreground uppercase tracking-widest font-bold">Extraction des données</p>
                        </div>
                    </div>
                )}

                {step === "results" && (
                    <div className="flex-1 flex flex-col gap-6 animate-in slide-in-from-bottom-5 duration-700 pt-10">
                        {mode === "insurance" && scannedCard ? (
                            // INSURANCE RESULT
                            <>
                                <div className="glass-card p-6 rounded-3xl border-primary/30 relative overflow-hidden bg-gradient-to-br from-primary/10 to-transparent">
                                    <div className="flex justify-between items-start mb-6">
                                        <div>
                                            <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">Assurance Détectée</div>
                                            <h3 className="text-2xl font-black text-foreground">{scannedCard.provider}</h3>
                                        </div>
                                        <ShieldCheck size={32} className="text-primary" />
                                    </div>
                                    <div className="space-y-4">
                                        <div className="p-4 bg-background/50 rounded-2xl border border-border/50">
                                            <div className="text-[10px] uppercase font-bold text-muted-foreground">Numéro Matricule</div>
                                            <div className="text-lg font-mono font-bold text-foreground">{scannedCard.number}</div>
                                        </div>
                                        <div className="flex gap-4">
                                            <div className="flex-1 p-4 bg-background/50 rounded-2xl border border-border/50">
                                                <div className="text-[10px] uppercase font-bold text-muted-foreground">Taux Couverture</div>
                                                <div className="text-xl font-black text-green-500">{scannedCard.coverage}%</div>
                                            </div>
                                            <div className="flex-1 p-4 bg-background/50 rounded-2xl border border-border/50">
                                                <div className="text-[10px] uppercase font-bold text-muted-foreground">Statut</div>
                                                <div className="text-sm font-bold text-primary flex items-center gap-1">
                                                    <CheckCircle size={14} /> ACTIF
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <button
                                    onClick={handleSaveInsurance}
                                    className="w-full py-4 bg-primary text-white text-base font-black rounded-2xl shadow-xl shadow-primary/20 hover:brightness-110 transition active:scale-95 tracking-widest"
                                >
                                    CONFIRMER & UTILISER
                                </button>
                            </>
                        ) : mode === "document" && scannedDoc ? (
                            // DOCUMENT RESULT
                            <>
                                <div className="glass-card p-6 rounded-3xl border-primary/30 relative overflow-hidden bg-gradient-to-br from-primary/10 to-transparent flex flex-col items-center text-center">
                                    <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center mb-6">
                                        <CheckCircle size={40} className="text-primary" />
                                    </div>
                                    <h3 className="text-2xl font-black text-foreground mb-2">Document Numérisé !</h3>
                                    <p className="text-muted-foreground font-medium mb-6">Votre document a été traité et converti au format PDF sécurisé.</p>

                                    <div className="w-full p-4 bg-background/50 rounded-2xl border border-border/50 flex items-center gap-4">
                                        <div className="w-12 h-12 bg-white dark:bg-zinc-800 rounded-xl flex items-center justify-center shadow-sm">
                                            <FileText className="text-primary" />
                                        </div>
                                        <div className="text-left">
                                            <div className="font-bold text-foreground">{scannedDoc.type}</div>
                                            <div className="text-xs text-muted-foreground">{scannedDoc.date} • 1.2 MB</div>
                                        </div>
                                    </div>
                                </div>
                                <button
                                    onClick={handleSaveDocument}
                                    className="w-full py-4 bg-primary text-white text-base font-black rounded-2xl shadow-xl shadow-primary/20 hover:brightness-110 transition active:scale-95 tracking-widest"
                                >
                                    ENREGISTRER 📂
                                </button>
                            </>
                        ) : (
                            // PRESCRIPTION RESULT (Existing Logic)
                            <>
                                <div className="glass-card p-6 rounded-3xl border-primary/30 relative overflow-hidden">
                                    <div className="absolute -top-10 -right-10 w-32 h-32 bg-green-500/10 blur-3xl rounded-full" />
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="p-2 bg-green-500 text-white rounded-lg">
                                            <CheckCircle size={20} />
                                        </div>
                                        <h3 className="font-extrabold text-lg">Médicaments Identifiés</h3>
                                    </div>

                                    <div className="space-y-4">
                                        {scannedMeds.map((med, i) => (
                                            <div key={i} className="flex items-center justify-between p-4 bg-secondary/30 rounded-2xl border border-border group hover:border-primary/30 transition-all">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 bg-white dark:bg-zinc-800 rounded-xl flex items-center justify-center shadow-sm">
                                                        <FileText size={18} className="text-primary" />
                                                    </div>
                                                    <div>
                                                        <div className="font-bold text-foreground">{med.name}</div>
                                                        <div className="text-[10px] text-muted-foreground font-bold uppercase tracking-tighter">Fiabilité: {(med.confidence * 100).toFixed(0)}%</div>
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => router.push(`/results?q=${encodeURIComponent(med.name)}`)}
                                                    className="p-3 bg-primary text-white rounded-xl opacity-0 group-hover:opacity-100 transition-opacity"
                                                >
                                                    <Search size={18} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <button
                                        onClick={() => router.push(`/results?q=${encodeURIComponent(scannedMeds[0]?.name || '')}`)}
                                        className="w-full py-4 bg-primary text-white text-sm font-black rounded-2xl shadow-xl shadow-primary/20 hover:brightness-110 transition active:scale-95 tracking-widest uppercase"
                                    >
                                        Trouver en pharmacie 💊
                                    </button>
                                </div>
                            </>
                        )}

                        <button
                            onClick={() => setStep("upload")}
                            className="w-full py-3 bg-secondary/50 text-muted-foreground font-bold rounded-xl transition hover:bg-secondary/80 text-xs uppercase"
                        >
                            REPRENDRE LA PHOTO
                        </button>
                    </div>
                )}
            </div>
            <style jsx>{`
                @keyframes scan-line {
                    0% { top: 0% }
                    100% { top: 100% }
                }
                .animate-scan-line {
                    animation: scan-line 2s linear infinite;
                }
            `}</style>
        </div>
    );
}

export default function ScannerPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="animate-spin w-8 h-8 border-2 border-primary rounded-full border-t-transparent" /></div>}>
            <ScannerContent />
        </Suspense>
    );
}
