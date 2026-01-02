"use client";

import React, { useState, Suspense, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { ArrowLeft, MapPin, Truck, CheckCircle, Camera } from "lucide-react";
import { cn } from "@/lib/utils";
import { firebaseService } from "@/services/firebaseService";
import { auth } from "@/services/firebase";
import AuthPrompt from "@/components/AuthPrompt";
import { useCart } from "@/context/CartContext";

export default function CheckoutPage() {
    return (
        <Suspense fallback={<div className="p-10 text-center">Chargement...</div>}>
            <CheckoutContent />
        </Suspense>
    );
}

function CheckoutContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { items, totalPrice, clearCart } = useCart();

    const pharmacyId = searchParams.get("pharmacyId");

    const [deliveryMode, setDeliveryMode] = useState<"delivery" | "pickup">("delivery");
    const [paymentMethod, setPaymentMethod] = useState<"orange" | "moov" | "mtn" | "card">("orange");
    const [agentCode, setAgentCode] = useState("");
    const [step, setStep] = useState<"payment" | "success">("payment");
    const [isProcessing, setIsProcessing] = useState(false);
    const [isChronic, setIsChronic] = useState(false);
    const [showAuthPrompt, setShowAuthPrompt] = useState(false);
    const [userInsurance, setUserInsurance] = useState<any>(null);

    useEffect(() => {
        const fetchInsurance = async () => {
            if (auth.currentUser) {
                const profile = await firebaseService.getUserProfile(auth.currentUser.uid) as any;
                if (profile?.insurance) {
                    setUserInsurance(profile.insurance);
                }
            }
        };
        fetchInsurance();
    }, []);

    const handleOrder = async () => {
        if (!auth.currentUser) {
            setShowAuthPrompt(true);
            return;
        }
        if (!agentCode.trim()) {
            alert("Veuillez saisir le code agent de la pharmacie pour continuer.");
            return;
        }
        setIsProcessing(true);

        try {
            const deliveryFee = deliveryMode === "delivery" ? 1000 : 0;
            const finalTotal = totalPrice + deliveryFee;

            const orderId = await firebaseService.createOrder({
                pharmacyId: pharmacyId || "pharm-patte-oie",
                items: items.map(i => ({
                    productId: i.product.id || "unknown",
                    productName: i.product.name || "Produit",
                    quantity: i.quantity,
                    unitPrice: i.product.price || 0,
                    totalPrice: (i.product.price || 0) * i.quantity
                })),
                total: finalTotal,
                subtotal: totalPrice,
                deliveryFee: deliveryFee,
                deliveryMode: deliveryMode,
                paymentMethod: paymentMethod,
                pharmacyName: items[0]?.pharmacyName,
                isChronic: isChronic
            });

            // If chronic, also add to user profile subscriptions
            if (isChronic && auth.currentUser) {
                const profile = await firebaseService.getUserProfile(auth.currentUser.uid) as any;
                const currentSubscriptions = profile?.subscriptions || [];

                const newSubscription = {
                    id: `sub-${Math.random().toString(36).substring(7)}`,
                    pharmacyId: pharmacyId || "pharm-patte-oie",
                    pharmacyName: items[0]?.pharmacyName || "Pharmacie",
                    items: items.map(i => ({
                        productId: i.product.id,
                        productName: i.product.name,
                        quantity: i.quantity,
                        price: i.product.price
                    })),
                    total: finalTotal,
                    nextDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
                    status: "active",
                    createdAt: new Date().toISOString()
                };

                await firebaseService.saveUserProfile(auth.currentUser.uid, {
                    subscriptions: [...currentSubscriptions, newSubscription]
                });
            }

            setIsProcessing(false);
            setStep("success");
            clearCart();
        } catch (error) {
            console.error("Order creation failed:", error);
            alert("Erreur lors de la création de la commande.");
            setIsProcessing(false);
        }
    };

    if (step === "success") {
        return (
            <main className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-700">
                <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mb-6 animate-bounce">
                    <CheckCircle className="w-12 h-12 text-primary" />
                </div>
                <h1 className="text-3xl font-bold text-foreground mb-3">Commande Confirmée !</h1>
                <p className="text-muted-foreground mb-8 max-w-sm">
                    Votre paiement a été validé avec succès (Agent: <span className="font-bold text-primary">{agentCode}</span>).
                    La pharmacie prépare vos médicaments.
                </p>
                <div className="flex flex-col gap-3 w-full max-w-xs">
                    <button
                        onClick={() => router.push("/tracking")}
                        className="w-full py-5 bg-primary text-white rounded-2xl font-black shadow-xl hover:brightness-110 transition active:scale-95 flex items-center justify-center gap-2"
                    >
                        SUIVRE MA LIVRAISON 🛵
                    </button>
                    <button
                        onClick={() => router.push("/")}
                        className="w-full py-4 bg-secondary text-foreground rounded-2xl font-bold transition hover:bg-secondary/80"
                    >
                        Retour à l'accueil
                    </button>
                </div>
            </main>
        )
    }

    const deliveryFee = deliveryMode === "delivery" ? 1000 : 0;
    const finalTotal = totalPrice + deliveryFee;

    return (
        <main className="min-h-screen bg-background pb-nav">
            {/* Header */}
            <header className="bg-background/80 backdrop-blur-md p-4 sticky top-0 z-30 border-b border-border/50 flex items-center gap-4 pt-safe">
                <button onClick={() => router.back()} className="p-2 hover:bg-secondary rounded-full transition-colors">
                    <ArrowLeft className="w-6 h-6 text-foreground" />
                </button>
                <h1 className="text-xl font-bold tracking-tight">Finaliser ma commande</h1>
            </header>

            <div className="p-4 space-y-6 max-w-lg mx-auto text-foreground">

                {/* Product Summary */}
                <section className="glass-card p-5 rounded-3xl animate-in slide-in-from-bottom-2 duration-500 border border-border/30">
                    <div className="flex justify-between items-start mb-4">
                        <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Mon Panier</h2>
                        <span className="bg-primary/10 text-primary text-[10px] font-bold px-2 py-1 rounded-full uppercase">Burkina Faso</span>
                    </div>

                    <div className="space-y-4 mb-4">
                        {items.length > 0 ? items.map((item, i) => (
                            <div key={i} className="flex justify-between items-center pb-3 border-b border-border/10 last:border-b-0">
                                <div>
                                    <div className="font-bold text-base text-foreground underline decoration-primary/20">{item.product.name}</div>
                                    <div className="text-[10px] text-muted-foreground font-bold uppercase">Quantité: {item.quantity} • {item.pharmacyName}</div>
                                </div>
                                <div className="font-black text-lg text-primary font-mono whitespace-nowrap">{(item.product.price || 0) * item.quantity} <span className="text-[10px]">FCFA</span></div>
                            </div>
                        )) : (
                            <div className="text-center py-4 text-muted-foreground italic text-sm">Votre panier est vide</div>
                        )}
                    </div>

                    <div className="space-y-2 pt-4 border-t border-dashed border-border/40">
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-muted-foreground">Frais de livraison ({deliveryMode === 'delivery' ? 'Express' : 'En point'})</span>
                            <span className="font-bold">{deliveryFee} FCFA</span>
                        </div>
                        <div className="flex justify-between items-center text-2xl font-black pt-2 border-t border-border/10 mt-2">
                            <span>Total Net</span>
                            <span className="text-primary">{finalTotal} FCFA</span>
                        </div>
                    </div>
                </section>

                {/* Agent Code Input */}
                <section className="space-y-3 animate-in slide-in-from-bottom-4 duration-500 delay-100">
                    <div className="flex items-center gap-2 mb-1 px-1">
                        <div className="w-1.5 h-6 bg-primary rounded-full" />
                        <h2 className="font-bold text-lg italic text-foreground">Code Agent Pharmacie</h2>
                    </div>
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Entrez le code de l'agent... (ex: AG-402)"
                            value={agentCode}
                            onChange={(e) => setAgentCode(e.target.value)}
                            className="w-full p-5 bg-secondary/50 dark:bg-zinc-900/60 border-2 border-border/30 rounded-2xl focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all text-lg font-bold placeholder:text-muted-foreground/50 text-foreground shadow-sm"
                        />
                        {agentCode && (
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 bg-green-500 text-white p-1 rounded-full">
                                <CheckCircle size={16} />
                            </div>
                        )}
                    </div>
                    <p className="text-xs text-muted-foreground px-2">
                        Le code agent est indispensable pour valider la transaction auprès de la pharmacie.
                    </p>
                </section>

                {/* Delivery Mode */}
                <section className="animate-in slide-in-from-bottom-6 duration-500 delay-200">
                    <h2 className="font-bold text-lg mb-3 ml-1">Mode de service</h2>
                    <div className="grid grid-cols-2 gap-4">
                        <button
                            onClick={() => setDeliveryMode("delivery")}
                            className={cn(
                                "p-6 rounded-3xl border-2 flex flex-col items-center gap-3 transition-all transform active:scale-95 duration-200",
                                deliveryMode === "delivery" ? "border-primary bg-primary/10 text-primary shadow-lg ring-4 ring-primary/5" : "border-border/40 bg-secondary/30 dark:bg-zinc-900/40 text-muted-foreground"
                            )}
                        >
                            <Truck className={cn("w-8 h-8", deliveryMode === "delivery" ? "text-primary" : "text-muted-foreground")} />
                            <span className="text-sm font-bold uppercase tracking-tight text-foreground/80">Livraison</span>
                        </button>
                        <button
                            onClick={() => setDeliveryMode("pickup")}
                            className={cn(
                                "p-6 rounded-3xl border-2 flex flex-col items-center gap-3 transition-all transform active:scale-95 duration-200",
                                deliveryMode === "pickup" ? "border-primary bg-primary/10 text-primary shadow-lg ring-4 ring-primary/5" : "border-border/40 bg-secondary/30 dark:bg-zinc-900/40 text-muted-foreground"
                            )}
                        >
                            <MapPin className={cn("w-8 h-8", deliveryMode === "pickup" ? "text-primary" : "text-muted-foreground")} />
                            <span className="text-sm font-bold uppercase tracking-tight text-foreground/80">Retrait</span>
                        </button>
                    </div>
                </section>

                {/* Insurance Integration */}
                <section className="space-y-3 animate-in slide-in-from-bottom-6 duration-500 delay-400">
                    <div className="flex items-center justify-between px-1">
                        <div className="flex items-center gap-2">
                            <div className="w-1.5 h-6 bg-primary rounded-full" />
                            <h2 className="font-bold text-lg italic text-foreground">Assurance (Tiers-Payant)</h2>
                        </div>
                    </div>

                    {userInsurance ? (
                        <div className="p-5 bg-gradient-to-br from-primary/10 to-transparent border border-primary/20 rounded-3xl relative overflow-hidden">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <div className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Assurance Active</div>
                                    <div className="text-xl font-black text-foreground">{userInsurance.provider}</div>
                                </div>
                                <CheckCircle className="text-primary" size={24} />
                            </div>
                            <div className="flex items-center gap-4 text-sm font-medium text-foreground/80">
                                <div className="bg-background/50 px-3 py-1.5 rounded-lg border border-border/50">
                                    <span className="text-[10px] text-muted-foreground block">MATRICULE</span>
                                    {userInsurance.number}
                                </div>
                                <div className="bg-background/50 px-3 py-1.5 rounded-lg border border-border/50">
                                    <span className="text-[10px] text-muted-foreground block">TAUX</span>
                                    <span className="text-green-500 font-black">{userInsurance.coverage}%</span>
                                </div>
                            </div>
                            <button onClick={() => setUserInsurance(null)} className="absolute bottom-2 right-2 p-2 bg-background/50 rounded-full hover:bg-background transition-colors text-xs text-muted-foreground">Modifier</button>
                        </div>
                    ) : (
                        <div
                            onClick={() => router.push('/scanner?mode=insurance&returnUrl=/checkout')}
                            className="p-5 bg-secondary/40 dark:bg-zinc-900/60 border-2 border-dashed border-border/50 rounded-3xl flex flex-col items-center gap-3 hover:border-primary/50 transition-all cursor-pointer group backdrop-blur-sm"
                        >
                            <div className="w-12 h-12 bg-white/5 dark:bg-white/5 rounded-2xl flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                                <Camera className="text-primary" />
                            </div>
                            <div className="text-center">
                                <span className="text-sm font-bold block text-foreground">Scanner ma carte</span>
                                <span className="text-[10px] text-muted-foreground font-extrabold uppercase tracking-widest mt-1 block">
                                    SONAR • UAB • Allianz • Mutuelles
                                </span>
                            </div>
                        </div>
                    )}
                </section>

                {/* Chronic Treatment Subscription */}
                <section className="animate-in slide-in-from-bottom-8 duration-500 delay-500">
                    <div className="glass-card p-5 rounded-3xl border-primary/20 bg-gradient-to-br from-primary/5 to-transparent border border-border/20">
                        <div className="flex items-start justify-between mb-4">
                            <div>
                                <h3 className="font-black italic text-primary">Abonnement Chronique 🔄</h3>
                                <p className="text-xs text-muted-foreground font-medium max-w-[200px] leading-relaxed">Livraison automatique chaque mois pour vos traitements réguliers.</p>
                            </div>
                            <div className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    className="sr-only peer"
                                    checked={isChronic}
                                    onChange={(e) => setIsChronic(e.target.checked)}
                                />
                                <div className="w-11 h-6 bg-gray-200 dark:bg-zinc-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                            </div>
                        </div>
                        <div className="text-[10px] font-black text-primary px-3 py-1 bg-primary/10 rounded-full inline-block">ÉCONOMISEZ 10% SUR LA LIVRAISON</div>
                    </div>
                </section>

                {/* Payment Methods */}
                <section className="animate-in slide-in-from-bottom-8 duration-500 delay-600 pb-10">
                    <div className="flex justify-between items-center mb-4 px-1">
                        <h2 className="font-bold text-lg">Paiement Mobile Money</h2>
                        <span className="text-[10px] bg-secondary dark:bg-zinc-800 text-muted-foreground px-2 py-1 rounded-md font-bold uppercase italic border border-border/20">Sécurisé</span>
                    </div>
                    <div className="space-y-4">
                        {[
                            { id: "orange", label: "Orange Money", color: "bg-[#FF6600]", short: "OM" },
                            { id: "moov", label: "Moov Money", color: "bg-[#002B7F]", short: "MOOV" },
                            { id: "mtn", label: "MTN Mobile Money", color: "bg-[#FFCC00]", short: "MTN" }
                        ].map((method) => (
                            <button
                                key={method.id}
                                onClick={() => setPaymentMethod(method.id as any)}
                                className={cn(
                                    "w-full p-5 rounded-2xl bg-secondary/30 dark:bg-zinc-900/40 border-2 flex items-center justify-between transition-all group active:scale-[0.98] duration-200",
                                    paymentMethod === method.id ? "border-primary shadow-lg shadow-primary/5 bg-primary/5" : "border-border/30 hover:border-muted-foreground/30"
                                )}
                            >
                                <div className="flex items-center gap-4">
                                    <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center text-white font-black text-[10px] shadow-inner", method.color)}>
                                        {method.short}
                                    </div>
                                    <span className="font-bold text-foreground text-lg">{method.label}</span>
                                </div>
                                <div className={cn(
                                    "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all",
                                    paymentMethod === method.id ? "border-primary bg-primary" : "border-border/50"
                                )}>
                                    {paymentMethod === method.id && <div className="w-2.5 h-2.5 rounded-full bg-white animate-in zoom-in" />}
                                </div>
                            </button>
                        ))}
                    </div>
                </section>

            </div>

            {/* Sticky Floating Footer Action */}
            <div className="fixed bottom-0 left-0 right-0 p-4 pb-safe bg-background/80 backdrop-blur-xl border-t border-border/50 z-40">
                <div className="max-w-lg mx-auto flex gap-4 items-center">
                    <div className="flex-1 flex flex-col">
                        <span className="text-[10px] text-muted-foreground font-black uppercase tracking-widest">À PAYER</span>
                        <span className="text-2xl font-black text-primary font-mono">{finalTotal} <span className="text-xs">FCFA</span></span>
                    </div>
                    <button
                        onClick={handleOrder}
                        disabled={isProcessing || items.length === 0}
                        className={cn(
                            "flex-[2] py-3.5 text-white text-sm font-black rounded-xl shadow-2xl transition transform active:scale-95 flex items-center justify-center gap-3 duration-300 tracking-widest",
                            (isProcessing || items.length === 0) ? "bg-muted cursor-not-allowed opacity-50 grayscale" : "bg-primary hover:brightness-110 shadow-primary/30"
                        )}
                    >
                        {isProcessing ? (
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        ) : (
                            <>
                                <CheckCircle size={18} />
                                CONFIRMER
                            </>
                        )}
                    </button>
                </div>
            </div>

            <AuthPrompt
                isOpen={showAuthPrompt}
                onClose={() => setShowAuthPrompt(false)}
                message="Vous devez être connecté pour finaliser votre commande et bénéficier du suivi en temps réel."
            />
        </main>
    );
}
