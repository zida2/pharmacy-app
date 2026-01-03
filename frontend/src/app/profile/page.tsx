"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Bell, Plus, Clock, Settings, User, CreditCard, Shield, ChevronRight, FileText, Heart, Users, MapPin, Globe, HelpCircle, Lock, ClipboardList, Zap, Phone, X, Check, Edit, ShieldCheck, Trash2, Cloud, CloudOff, Loader2, Truck, LayoutDashboard, Crown, Gift, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { firebaseService } from "@/services/firebaseService";
import { auth } from "@/services/firebase";
import AuthPrompt from "@/components/AuthPrompt";

export default function ProfilePage() {
    const router = useRouter();

    // States
    const [reminders, setReminders] = useState<any[]>([]);
    const [userInfo, setUserInfo] = useState({ name: "Chargement...", level: "Bronze", location: "Ouaga 2000" });
    const [medicalInfo, setMedicalInfo] = useState({ blood: "---", weight: "---", allergies: [] as string[], conditions: [] as string[] });
    const [family, setFamily] = useState<any[]>([]);
    const [addresses, setAddresses] = useState<any[]>([]);
    const [subscriptions, setSubscriptions] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [currentUid, setCurrentUid] = useState<string | null>(null);
    const [showAuthPrompt, setShowAuthPrompt] = useState(false);

    const [isAdding, setIsAdding] = useState(false);
    const [newMed, setNewMed] = useState("");
    const [newTime, setNewTime] = useState("08:00");
    const [editingIndex, setEditingIndex] = useState<number | null>(null);
    const [newDose, setNewDose] = useState("1 comprimé");
    const [newInstruction, setNewInstruction] = useState("Après repas");

    const [showPayments, setShowPayments] = useState(false);
    const [showInsurance, setShowInsurance] = useState(false);
    const [showNotifications, setShowNotifications] = useState(false);
    const [showMedicalProfile, setShowMedicalProfile] = useState(false);
    const [showHealthBook, setShowHealthBook] = useState(false);
    const [showFamily, setShowFamily] = useState(false);
    const [showSubscriptions, setShowSubscriptions] = useState(false);
    const [showAddresses, setShowAddresses] = useState(false);
    const [showSecurity, setShowSecurity] = useState(false);
    const [showHelp, setShowHelp] = useState(false);
    const [isEditingUser, setIsEditingUser] = useState(false);
    const [notificationSettings, setNotificationSettings] = useState({
        pillReminders: true,
        orderUpdates: true,
        pharmacyGuard: false,
        promotions: false
    });
    const [securitySettings, setSecuritySettings] = useState({
        biometrics: true,
        pin: false,
        twoFactor: false
    });
    const [newDays, setNewDays] = useState<string[]>(["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"]);

    const [activeDocument, setActiveDocument] = useState<any>(null);
    const [isAddingEntry, setIsAddingEntry] = useState(false);
    const [healthEntries, setHealthEntries] = useState<any[]>([
        { id: 1, date: "15 Dec 2025", type: "Ordonnance", provider: "Dr. Sawadogo", icon: <FileText className="text-primary" /> },
        { id: 2, date: "02 Dec 2025", type: "Rapport Bio", provider: "Labo Saint-Jean", icon: <ClipboardList className="text-emerald-500" /> },
        { id: 3, date: "10 Nov 2025", type: "Ordonnance", provider: "Clinique Suka", icon: <FileText className="text-primary" /> }
    ]);
    const [newHealthEntry, setNewHealthEntry] = useState({ type: "Consultation", provider: "", date: new Date().toISOString().split('T')[0], notes: "" });

    // Premium Logic
    const [premiumState, setPremiumState] = useState({ isPremium: false, isTrial: false, daysLeft: 0 });
    const [showPremiumModal, setShowPremiumModal] = useState(false);
    const [isUpgrading, setIsUpgrading] = useState(false);

    // Track Auth & Load Data
    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged(async (user: any) => {
            if (!user) {
                setCurrentUid(null);
                setUserInfo({ name: "Visiteur", level: "---", location: "Non connecté" });
                setReminders([]);
                setMedicalInfo({ blood: "---", weight: "---", allergies: [], conditions: [] });
                setFamily([]);
                setAddresses([]);
                setSubscriptions([]);
                setIsLoading(false);
                setShowAuthPrompt(true);
                return;
            }

            const uid = user.uid;
            setCurrentUid(uid);
            setIsLoading(true);

            const profile = await firebaseService.getUserProfile(uid) as any;
            
            // Core logic for premium calculating
            const isSubscribed = profile?.userInfo?.isPremium === true;
            const creationTime = user.metadata.creationTime ? new Date(user.metadata.creationTime) : new Date();
            const now = new Date();
            const diffTime = Math.abs(now.getTime() - creationTime.getTime());
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            const trialRemaining = Math.max(0, 15 - diffDays);
            const isTrial = !isSubscribed && trialRemaining > 0;

            const pState = {
                isPremium: isSubscribed,
                isTrial: isTrial,
                daysLeft: isTrial ? trialRemaining : 0
            };
            setPremiumState(pState);

            let currentLevel = profile?.userInfo?.level || "Bronze";
            if (isSubscribed) currentLevel = "Platinum 👑";
            else if (isTrial) currentLevel = "Essai Gratuit ✨";

            if (profile) {
                if (profile.reminders) setReminders(profile.reminders);
                if (profile.medicalInfo) setMedicalInfo(profile.medicalInfo);
                if (profile.family) setFamily(profile.family);
                if (profile.addresses) setAddresses(profile.addresses);
                if (profile.subscriptions) setSubscriptions(profile.subscriptions);
                if (profile.notificationSettings) setNotificationSettings(profile.notificationSettings);
                if (profile.securitySettings) setSecuritySettings(profile.securitySettings);
                
                setUserInfo({
                    name: profile.userInfo?.name || user.displayName || "Utilisateur",
                    level: currentLevel,
                    location: profile.userInfo?.location || "Burkina Faso"
                });
            } else {
                setUserInfo({ 
                    name: user.displayName || "Utilisateur", 
                    level: isTrial ? "Essai Gratuit ✨" : "Bronze", 
                    location: "Burkina Faso" 
                });
            }
            setIsLoading(false);
        });

        return () => unsubscribe();
    }, []);

    // Save to Cloud (Debounced effect)
    useEffect(() => {
        if (!currentUid || isLoading) return;
        const timer = setTimeout(() => {
            firebaseService.saveUserProfile(currentUid, {
                reminders,
                userInfo,
                medicalInfo,
                family,
                addresses,
                subscriptions,
                notificationSettings,
                securitySettings
            });
        }, 1000);
        return () => clearTimeout(timer);
    }, [reminders, userInfo, medicalInfo, family, addresses, subscriptions, notificationSettings, securitySettings, currentUid, isLoading]);

    const addReminder = () => {
        if (!auth.currentUser) return setShowAuthPrompt(true);
        if (!newMed) return;
        const daysLabel = newDays.length === 7 ? "Tous les jours" : newDays.join(", ");
        const reminderData = { med: newMed, time: newTime, dose: newDose, instruction: newInstruction, active: true, days: daysLabel, selectedDays: newDays };
        if (editingIndex !== null) {
            const updated = [...reminders];
            updated[editingIndex] = reminderData;
            setReminders(updated);
            setEditingIndex(null);
        } else {
            setReminders([...reminders, reminderData]);
        }
        setNewMed("");
        setIsAdding(false);
    };

    const deleteReminder = (index: number) => {
        if (confirm("Supprimer ce rappel ?")) {
            setReminders(reminders.filter((_, i) => i !== index));
        }
    };

    return (
        <main className="min-h-screen bg-background pb-nav">
            <header className="p-6 pt-safe flex flex-col gap-6">
                <div className="flex items-center justify-between">
                    <button onClick={() => router.back()} className="p-3 bg-secondary rounded-2xl">
                        <ArrowLeft size={24} />
                    </button>
                    <button className="p-3 bg-secondary rounded-2xl">
                        <Settings size={24} />
                    </button>
                </div>

                <div className="flex items-center gap-5">
                    <div className="w-20 h-20 bg-secondary rounded-[2rem] overflow-hidden grayscale border-4 border-background shadow-xl flex items-center justify-center">
                        <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${userInfo.name}`} alt="Avatar" />
                    </div>
                    <div>
                        <div className="flex flex-col">
                            <h1 className="text-2xl font-black italic text-foreground flex items-center gap-2">
                                {userInfo.name}
                                <Edit size={16} className="text-muted-foreground cursor-pointer" onClick={() => setIsEditingUser(true)} />
                            </h1>
                            <div className="flex items-center gap-2 mt-1">
                                {auth.currentUser ? (
                                    <div className="flex items-center gap-1 text-[8px] font-black uppercase text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                                        <Cloud size={10} /> Cloud Sync
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-1 text-[8px] font-black uppercase text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-full">
                                        <CloudOff size={10} /> Mode Invité
                                    </div>
                                )}
                                {!premiumState.isPremium && (
                                    <button 
                                        onClick={() => setShowPremiumModal(true)}
                                        className="flex items-center gap-1 text-[8px] font-black uppercase text-amber-600 bg-amber-500/20 px-2 py-0.5 rounded-full border border-amber-500/30"
                                    >
                                        <Crown size={10} /> {premiumState.isTrial ? 'Essai Premium' : 'Activer Premium'}
                                    </button>
                                )}
                            </div>
                        </div>
                        <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest mt-1">
                            {userInfo.level} • v5.0-FORCE
                        </p>
                    </div>
                </div>
            </header>

            {/* Premium Banner - High Priority */}
            {!premiumState.isPremium && (
                <div className="px-6 mb-8">
                    <div
                        onClick={() => setShowPremiumModal(true)}
                        className="w-full p-5 rounded-[2rem] bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-between cursor-pointer shadow-xl shadow-amber-500/20 relative overflow-hidden"
                    >
                        <div className="flex items-center gap-4 relative z-10 text-white">
                            <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-md">
                                <Crown size={28} />
                            </div>
                            <div>
                                <div className="text-[10px] font-black uppercase bg-black/20 px-2 py-0.5 rounded-lg mb-1 tracking-[0.2em]">
                                    {premiumState.isTrial ? "Essai Gratuit Actif" : "Offre Spéciale"}
                                </div>
                                <div className="text-sm font-black leading-none">
                                    {premiumState.isTrial ? `Fini dans ${premiumState.daysLeft} jours` : "Passez Premium maintenant"}
                                </div>
                            </div>
                        </div>
                        <ChevronRight className="text-white" />
                    </div>
                </div>
            )}

            <div className="px-6 space-y-8">
                <section className="space-y-4">
                    <h2 className="font-bold text-lg italic text-foreground">Ma Santé & Suivi 🏥</h2>
                    <div className="glass-card overflow-hidden">
                        {[
                            { icon: <Heart className="text-red-500" />, label: "Profil Médical", sub: "Allergies, Groupe Sanguin", action: () => setShowMedicalProfile(true) },
                            { icon: <ClipboardList className="text-blue-500" />, label: "Carnet de Santé", sub: "Analyse & Rapports", isPremium: true, action: () => (premiumState.isPremium || premiumState.isTrial) ? setShowHealthBook(true) : setShowPremiumModal(true) },
                            { icon: <Users className="text-purple-500" />, label: "Cercle Familial", sub: "Gérer vos proches", isPremium: true, action: () => (premiumState.isPremium || premiumState.isTrial) ? setShowFamily(true) : setShowPremiumModal(true) },
                        ].map((item, i) => (
                            <button key={i} onClick={item.action} className="w-full p-5 flex items-center justify-between border-b border-border/30 last:border-0">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 bg-secondary/50 rounded-xl flex items-center justify-center relative">
                                        {item.icon}
                                        {item.isPremium && !(premiumState.isPremium || premiumState.isTrial) && <Lock size={10} className="absolute -top-1 -right-1 text-amber-500" />}
                                    </div>
                                    <div className="text-left">
                                        <div className="font-bold text-sm text-foreground flex items-center gap-2">
                                            {item.label}
                                            {item.isPremium && !(premiumState.isPremium || premiumState.isTrial) && <span className="text-[8px] font-black bg-amber-500/10 text-amber-600 px-1.5 py-0.5 rounded">PREMIUM</span>}
                                        </div>
                                        <div className="text-[10px] text-muted-foreground font-bold">{item.sub}</div>
                                    </div>
                                </div>
                                <ChevronRight size={16} className="text-muted-foreground opacity-30" />
                            </button>
                        ))}
                    </div>
                </section>
            </div>

            {showPremiumModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-md">
                    <div className="glass-card w-full max-w-sm rounded-[2.5rem] relative overflow-hidden bg-background">
                        <button onClick={() => setShowPremiumModal(false)} className="absolute top-6 right-6 p-2 bg-secondary rounded-full z-10">
                            <X size={20} />
                        </button>
                        <div className="h-40 bg-gradient-to-br from-amber-400 to-orange-600 flex flex-col items-center justify-center text-white p-6">
                            <Crown size={48} className="mb-2" />
                            <h3 className="text-2xl font-black italic">Pharma Premium</h3>
                        </div>
                        <div className="p-8 space-y-6">
                            <div className="space-y-4">
                                {[
                                    { text: "Carnet de Santé Illimité", color: "text-blue-500" },
                                    { text: "Gestion de 5 Familiers", color: "text-purple-500" },
                                    { text: "Rappels IA Intelligents", color: "text-amber-500" }
                                ].map((f, i) => (
                                    <div key={i} className="flex items-center gap-3">
                                        <Check className={f.color} size={18} />
                                        <span className="text-sm font-bold">{f.text}</span>
                                    </div>
                                ))}
                            </div>
                            <div className="bg-primary/5 p-4 rounded-3xl border border-primary/10 text-center">
                                <div className="text-2xl font-black text-primary">5 000 FCFA</div>
                                <div className="text-[10px] font-black uppercase text-muted-foreground">Par An</div>
                            </div>
                            <button 
                                onClick={() => { setIsUpgrading(true); setTimeout(() => { firebaseService.upgradeUserToPremium(currentUid!, 'yearly'); setPremiumState({ ...premiumState, isPremium: true }); setShowPremiumModal(false); setIsUpgrading(false); }, 1500); }} 
                                className="w-full py-4 bg-primary text-white font-black rounded-2xl shadow-xl shadow-primary/30"
                            >
                                {isUpgrading ? <Loader2 className="animate-spin mx-auto" /> : "ACTIVER MON PREMIUM"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <AuthPrompt isOpen={showAuthPrompt} onClose={() => setShowAuthPrompt(false)} />
        </main>
    );
}
