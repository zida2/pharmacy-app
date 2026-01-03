"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Bell, Plus, Clock, Settings, User, CreditCard, Shield, ChevronRight, FileText, Heart, Users, MapPin, Globe, HelpCircle, Lock, ClipboardList, Zap, Phone, X, Check, Edit, ShieldCheck, Trash2, Cloud, CloudOff, Loader2, Truck, LayoutDashboard } from "lucide-react";
import { cn } from "@/lib/utils";
import { firebaseService } from "@/services/firebaseService";
import { auth } from "@/services/firebase";
import AuthPrompt from "@/components/AuthPrompt";

export default function ProfilePage() {
    const router = useRouter();

    // States
    const [reminders, setReminders] = useState<any[]>([]);
    const [userInfo, setUserInfo] = useState({ name: "Chargement...", level: "Gold", location: "Ouaga 2000" });
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

    // New Modal States for better UX (Replacing prompts)
    const [isAddingFamily, setIsAddingFamily] = useState(false);
    const [newFamilyMember, setNewFamilyMember] = useState({ name: "", role: "" });

    const [isAddingAddress, setIsAddingAddress] = useState(false);
    const [newAddressInput, setNewAddressInput] = useState({ label: "", address: "" });

    const [isAddingAllergy, setIsAddingAllergy] = useState(false);
    const [newAllergyInput, setNewAllergyInput] = useState("");

    const [isAddingCondition, setIsAddingCondition] = useState(false);
    const [newConditionInput, setNewConditionInput] = useState("");

    // Insurance Management States
    const [insurances, setInsurances] = useState<any[]>([]);
    const [isAddingInsurance, setIsAddingInsurance] = useState(false);
    const [editingInsuranceIndex, setEditingInsuranceIndex] = useState<number | null>(null);
    const [newInsurance, setNewInsurance] = useState({
        provider: "",
        policyNumber: "",
        coverageRate: "80",
        expiryDate: "",
        beneficiaries: [] as string[],
        isActive: true,
        tierPayant: false
    });

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
                setNotificationSettings({
                    pillReminders: true,
                    orderUpdates: true,
                    pharmacyGuard: false,
                    promotions: false
                });
                setSecuritySettings({
                    biometrics: true,
                    pin: false,
                    twoFactor: false
                });
                setIsLoading(false);
                setShowAuthPrompt(true);
                return;
            }

            const uid = user.uid;
            setCurrentUid(uid);

            setIsLoading(true);
            const profile = await firebaseService.getUserProfile(uid) as any;

            if (profile) {
                if (profile.reminders) setReminders(profile.reminders);
                if (profile.userInfo) setUserInfo(profile.userInfo);
                if (profile.medicalInfo) setMedicalInfo(profile.medicalInfo);
                if (profile.family) setFamily(profile.family);
                if (profile.addresses) setAddresses(profile.addresses);
                if (profile.subscriptions) setSubscriptions(profile.subscriptions);
                if (profile.notificationSettings) setNotificationSettings(profile.notificationSettings);
                if (profile.securitySettings) setSecuritySettings(profile.securitySettings);
                if (profile.insurances) setInsurances(profile.insurances);
            } else {
                setUserInfo({ name: user.displayName || "Utilisateur", level: "Bronze", location: "Burkina Faso" });
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
                securitySettings,
                insurances
            });
        }, 1000); // Wait 1s after last change to sync

        return () => clearTimeout(timer);
    }, [reminders, userInfo, medicalInfo, family, addresses, subscriptions, notificationSettings, securitySettings, insurances, currentUid]);

    const addReminder = () => {
        if (!auth.currentUser) {
            setShowAuthPrompt(true);
            return;
        }
        if (!newMed) return;

        const daysLabel = newDays.length === 7 ? "Tous les jours" : newDays.join(", ");
        const reminderData = {
            med: newMed,
            time: newTime,
            dose: newDose,
            instruction: newInstruction,
            active: true,
            days: daysLabel,
            selectedDays: newDays
        };

        if (editingIndex !== null) {
            const updated = [...reminders];
            updated[editingIndex] = { ...updated[editingIndex], ...reminderData };
            setReminders(updated);
            setEditingIndex(null);
        } else {
            setReminders([...reminders, reminderData]);
        }

        // Reset
        setNewMed("");
        setNewDose("1 comprimé");
        setNewInstruction("Après repas");
        setNewDays(["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"]); // Reset to all
        setIsAdding(false);
    };

    const startEdit = (index: number) => {
        const r = reminders[index];
        setNewMed(r.med);
        setNewTime(r.time);
        setNewDose(r.dose || "1 comprimé");
        setNewInstruction(r.instruction || "Après repas");
        setNewDays(r.selectedDays || ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"]);
        setEditingIndex(index);
        setIsAdding(true);
    };

    const deleteReminder = (index: number) => {
        if (confirm("Supprimer ce rappel ?")) {
            setReminders(reminders.filter((_, i) => i !== index));
            if (editingIndex === index) {
                setIsAdding(false);
                setEditingIndex(null);
            }
        }
    };

    const addFamilyMember = () => {
        if (!auth.currentUser) {
            setShowAuthPrompt(true);
            return;
        }
        if (newFamilyMember.name && newFamilyMember.role) {
            setFamily([...family, {
                name: newFamilyMember.name,
                role: newFamilyMember.role,
                img: `https://api.dicebear.com/7.x/avataaars/svg?seed=${newFamilyMember.name}`
            }]);
            setNewFamilyMember({ name: "", role: "" });
            setIsAddingFamily(false);
        }
    };

    const addAddress = () => {
        if (!auth.currentUser) {
            setShowAuthPrompt(true);
            return;
        }
        if (newAddressInput.label && newAddressInput.address) {
            setAddresses([...addresses, { label: newAddressInput.label, address: newAddressInput.address }]);
            setNewAddressInput({ label: "", address: "" });
            setIsAddingAddress(false);
        }
    };

    const addHealthEntry = () => {
        if (!newHealthEntry.provider) return alert("Veuillez entrer le nom du médecin/structure.");

        const entry = {
            id: Date.now(),
            date: new Date(newHealthEntry.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' }),
            type: newHealthEntry.type,
            provider: newHealthEntry.provider,
            notes: newHealthEntry.notes,
            icon: newHealthEntry.type === "Ordonnance" ? <FileText className="text-primary" /> : <ClipboardList className="text-emerald-500" />
        };

        setHealthEntries([entry, ...healthEntries]);
        setIsAddingEntry(false);
        setNewHealthEntry({ type: "Consultation", provider: "", date: new Date().toISOString().split('T')[0], notes: "" });
    };

    return (
        <main className="min-h-screen bg-background pb-nav">
            {/* Header */}
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
                        {isLoading ? (
                            <Loader2 className="animate-spin text-primary" />
                        ) : (
                            <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${userInfo.name}`} alt="Avatar" />
                        )}
                    </div>
                    <div>
                        {isEditingUser ? (
                            <input
                                autoFocus
                                autoComplete="off"
                                className="text-2xl font-black italic bg-transparent outline-none border-b-2 border-primary w-fit"
                                value={userInfo.name}
                                onChange={(e) => setUserInfo({ ...userInfo, name: e.target.value })}
                                onBlur={() => setIsEditingUser(false)}
                                onKeyDown={(e) => e.key === "Enter" && setIsEditingUser(false)}
                            />
                        ) : (
                            <div className="flex flex-col">
                                <h1 className="text-2xl font-black italic text-foreground flex items-center gap-2">
                                    {isLoading ? "---" : userInfo.name}
                                    <Edit size={16} className="text-muted-foreground cursor-pointer" onClick={() => setIsEditingUser(true)} />
                                </h1>
                                <div className="flex items-center gap-2">
                                    {auth.currentUser ? (
                                        <div className="flex items-center gap-1 text-[8px] font-black uppercase text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                                            <Cloud size={10} /> Cloud Sync
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-1 text-[8px] font-black uppercase text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-full">
                                            <CloudOff size={10} /> Mode Invité
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                        <p className="text-sm text-muted-foreground font-bold uppercase tracking-tighter">Membre {userInfo.level} • {userInfo.location}</p>
                    </div>
                </div>
            </header>

            <div className="px-6 space-y-8">

                {/* PILULIER INTELLIGENT */}
                <section className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="w-1.5 h-6 bg-primary rounded-full" />
                            <h2 className="font-bold text-lg italic text-foreground">Mon Pilulier Intelligent 🔔</h2>
                        </div>
                        <button
                            onClick={() => {
                                setIsAdding(true);
                                setEditingIndex(null);
                                setNewMed("");
                                setNewDose("1 comprimé");
                                setNewInstruction("Après repas");
                                setNewTime("08:00");
                                setNewDays(["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"]);
                            }}
                            className="p-2 bg-primary/10 text-primary rounded-xl transition hover:bg-primary/20 active:scale-95"
                        >
                            <Plus size={20} />
                        </button>
                    </div>

                    {isAdding && (
                        <div className="glass-card p-6 rounded-3xl border-primary/40 animate-in fade-in slide-in-from-top-4">
                            <h3 className="font-black mb-4 text-foreground">{editingIndex !== null ? "Modifier le Rappel" : "Nouveau Rappel"}</h3>
                            <input
                                type="text"
                                autoComplete="off"
                                placeholder="Nom du médicament"
                                className="w-full p-4 bg-secondary dark:bg-zinc-800 rounded-2xl mb-3 outline-none focus:ring-2 font-bold focus:ring-primary/20 text-foreground"
                                value={newMed}
                                onChange={(e) => setNewMed(e.target.value)}
                            />

                            <div className="grid grid-cols-2 gap-3 mb-3">
                                <input
                                    type="time"
                                    autoComplete="off"
                                    className="w-full p-4 bg-secondary dark:bg-zinc-800 rounded-2xl outline-none focus:ring-2 font-bold focus:ring-primary/20 text-foreground"
                                    value={newTime}
                                    onChange={(e) => setNewTime(e.target.value)}
                                />
                                <input
                                    type="text"
                                    autoComplete="off"
                                    placeholder="Dose (ex: 1 cp)"
                                    className="w-full p-4 bg-secondary dark:bg-zinc-800 rounded-2xl outline-none focus:ring-2 font-bold focus:ring-primary/20 text-foreground"
                                    value={newDose}
                                    onChange={(e) => setNewDose(e.target.value)}
                                />
                            </div>

                            <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
                                {["Avant repas", "Après repas", "A jeun", "Coucher"].map(opt => (
                                    <button
                                        key={opt}
                                        onClick={() => setNewInstruction(opt)}
                                        className={cn("px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all", newInstruction === opt ? "bg-primary text-white" : "bg-secondary text-muted-foreground")}
                                    >
                                        {opt}
                                    </button>
                                ))}
                            </div>

                            {/* Day Selector */}
                            <div className="flex justify-between mb-4 gap-1">
                                {["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"].map((d) => (
                                    <button
                                        key={d}
                                        onClick={() => {
                                            if (newDays.includes(d)) {
                                                setNewDays(newDays.filter(day => day !== d));
                                            } else {
                                                setNewDays([...newDays, d]);
                                            }
                                        }}
                                        className={cn(
                                            "w-8 h-8 rounded-full text-[10px] font-black flex items-center justify-center transition-all",
                                            newDays.includes(d) ? "bg-primary text-white" : "bg-secondary text-muted-foreground"
                                        )}
                                    >
                                        {d[0]}
                                    </button>
                                ))}
                            </div>

                            <div className="flex gap-2">
                                <button
                                    onClick={() => { setIsAdding(false); setEditingIndex(null); }}
                                    className="flex-1 py-3 bg-secondary rounded-xl font-bold text-sm text-foreground"
                                >
                                    Annuler
                                </button>
                                <button
                                    onClick={addReminder}
                                    className="flex-1 py-3 bg-primary text-white rounded-xl font-black text-sm"
                                >
                                    {editingIndex !== null ? "Enregistrer" : "Ajouter"}
                                </button>
                            </div>
                        </div>
                    )}

                    <div className="space-y-4">
                        {reminders.length === 0 ? (
                            <div className="text-center py-10 opacity-30 italic font-bold">Aucun rappel configuré</div>
                        ) : reminders.map((rem, i) => (
                            <div key={i} onClick={() => startEdit(i)} className={cn("glass-card p-5 rounded-3xl border-primary/20 flex items-center justify-between group transition-all hover:translate-x-1 cursor-pointer active:scale-95", !rem.active && "opacity-60")}>
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
                                        <Clock size={24} />
                                    </div>
                                    <div>
                                        <div className="font-black text-lg leading-tight text-foreground flex items-center gap-2">
                                            {rem.med}
                                            <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full uppercase">{rem.dose || "1 cp"}</span>
                                        </div>
                                        <div className="text-xs text-muted-foreground font-bold">{rem.time} • {rem.days}</div>
                                        {rem.instruction && <div className="text-[10px] text-muted-foreground font-medium italic mt-0.5">{rem.instruction}</div>}
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <button
                                        onClick={(e) => { e.stopPropagation(); deleteReminder(i); }}
                                        className="p-2 text-red-500 hover:bg-red-500/10 rounded-full transition-all"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                    <label className="relative inline-flex items-center cursor-pointer" onClick={(e) => e.stopPropagation()}>
                                        <input
                                            type="checkbox"
                                            checked={rem.active}
                                            className="sr-only peer"
                                            onChange={() => {
                                                const newRem = [...reminders];
                                                newRem[i].active = !newRem[i].active;
                                                setReminders(newRem);
                                            }}
                                        />
                                        <div className="w-11 h-6 bg-gray-200 dark:bg-zinc-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                                    </label>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* MA SANTÉ */}
                <section className="space-y-3">
                    <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground px-1 opacity-60">Ma Santé & Suivi</h2>
                    <div className="glass-card overflow-hidden">
                        {[
                            { icon: <Heart className="text-red-500" />, label: "Profil Médical", sub: "Groupe sanguin, Allergies", action: () => { if (!auth.currentUser) return setShowAuthPrompt(true); setShowMedicalProfile(true); } },
                            { icon: <ClipboardList className="text-blue-500" />, label: "Carnet de Santé Digital", sub: "Analyses et Ordonnances", action: () => { if (!auth.currentUser) return setShowAuthPrompt(true); setShowHealthBook(true); } },
                            { icon: <Users className="text-purple-500" />, label: "Cercle Familial", sub: "Gérer la santé de vos proches", action: () => { if (!auth.currentUser) return setShowAuthPrompt(true); setShowFamily(true); } },
                            { icon: <Truck className="text-emerald-500" />, label: "Suivi de Livraison", sub: "Commandes en temps réel", action: () => router.push("/tracking") },
                        ].map((item, i) => (
                            <button key={i} onClick={item.action} className="w-full p-5 flex items-center justify-between hover:bg-secondary/30 dark:hover:bg-white/5 transition-colors border-b border-border/30 last:border-b-0">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 bg-secondary/50 rounded-xl flex items-center justify-center">{item.icon}</div>
                                    <div className="text-left">
                                        <div className="font-bold text-sm text-foreground">{item.label}</div>
                                        <div className="text-[10px] text-muted-foreground font-bold uppercase tracking-tight">{item.sub}</div>
                                    </div>
                                </div>
                                <ChevronRight size={16} className="text-muted-foreground opacity-30" />
                            </button>
                        ))}
                    </div>
                </section>

                {/* PARAMÈTRES APP */}
                <section className="space-y-3">
                    <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground px-1 opacity-60">Commandes & Logistique</h2>
                    <div className="glass-card overflow-hidden">
                        {[
                            { icon: <Zap className="text-amber-500" />, label: "Abonnements Chroniques", sub: "Traitements récurrents auto", action: () => { if (!auth.currentUser) return setShowAuthPrompt(true); setShowSubscriptions(true); } },
                            { icon: <MapPin className="text-emerald-500" />, label: "Adresses de Livraison", sub: "Maison, Bureau, Parents", action: () => { if (!auth.currentUser) return setShowAuthPrompt(true); setShowAddresses(true); } },
                            { icon: <CreditCard className="text-indigo-500" />, label: "Méthodes de Paiement", sub: "Orange, Moov, MTN", action: () => { if (!auth.currentUser) return setShowAuthPrompt(true); setShowPayments(true); } },
                            { icon: <Shield className="text-cyan-500" />, label: "Assurances & Tiers-Payant", sub: `${insurances.length} assurance${insurances.length > 1 ? 's' : ''} active${insurances.length > 1 ? 's' : ''}`, action: () => { if (!auth.currentUser) return setShowAuthPrompt(true); setShowInsurance(true); } },
                        ].map((item, i) => (
                            <button key={i} onClick={item.action} className="w-full p-5 flex items-center justify-between hover:bg-secondary/30 dark:hover:bg-white/5 transition-colors border-b border-border/30 last:border-b-0">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 bg-secondary/50 rounded-xl flex items-center justify-center">{item.icon}</div>
                                    <div className="text-left">
                                        <div className="font-bold text-sm text-foreground">{item.label}</div>
                                        <div className="text-[10px] text-muted-foreground font-bold uppercase tracking-tight">{item.sub}</div>
                                    </div>
                                </div>
                                <ChevronRight size={16} className="text-muted-foreground opacity-30" />
                            </button>
                        ))}
                    </div>
                </section>

                {/* SÉCURITÉ & SUPPORT */}
                <section className="space-y-3">
                    <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground px-1 opacity-60">Support & Confidentialité</h2>
                    <div className="glass-card overflow-hidden">
                        {[
                            { icon: <Bell className="text-orange-500" />, label: "Notifications & Alertes", sub: "Rappels pilulier & Suivi", action: () => { if (!auth.currentUser) return setShowAuthPrompt(true); setShowNotifications(true); } },
                            { icon: <Lock className="text-slate-500" />, label: "Sécurité & Biométrie", sub: "Code PIN, Empreinte", action: () => { if (!auth.currentUser) return setShowAuthPrompt(true); setShowSecurity(true); } },
                            { icon: <HelpCircle className="text-teal-500" />, label: "Aide & Centre Support", sub: "FAQ, Nous contacter", action: () => { if (!auth.currentUser) return setShowAuthPrompt(true); setShowHelp(true); } },
                        ].map((item, i) => (
                            <button key={i} onClick={item.action} className="w-full p-5 flex items-center justify-between hover:bg-secondary/30 dark:hover:bg-white/5 transition-colors border-b border-border/30 last:border-b-0">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 bg-secondary/50 rounded-xl flex items-center justify-center">{item.icon}</div>
                                    <div className="text-left">
                                        <div className="font-bold text-sm text-foreground">{item.label}</div>
                                        <div className="text-[10px] text-muted-foreground font-bold uppercase tracking-tight">{item.sub}</div>
                                    </div>
                                </div>
                                <ChevronRight size={16} className="text-muted-foreground opacity-30" />
                            </button>
                        ))}
                    </div>
                </section>

                {/* ESPACE PROFESSIONNEL */}
                <section className="space-y-3">
                    <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-primary px-1">Espace Professionnel</h2>
                    <button
                        onClick={() => router.push("/admin")}
                        className="w-full p-5 bg-gradient-to-br from-primary/20 to-secondary/30 rounded-2xl border border-primary/30 flex items-center justify-between group hover:shadow-2xl transition-all active:scale-[0.98]"
                    >
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white shadow-lg">
                                <LayoutDashboard size={20} />
                            </div>
                            <div className="text-left">
                                <div className="font-extrabold text-base text-foreground italic">PharmaManager</div>
                                <div className="text-[9px] font-black uppercase tracking-widest text-primary">Gestion Pharmacie & Stocks</div>
                            </div>
                        </div>
                        <ChevronRight size={18} className="text-primary group-hover:translate-x-1 transition-transform" />
                    </button>
                    <p className="text-[9px] text-center text-muted-foreground font-medium italic opacity-50 px-6">Accès réservé aux pharmaciens et agents agréés.</p>
                </section>

                <button
                    onClick={() => {
                        if (auth.currentUser) {
                            if (confirm("Voulez-vous vraiment vous déconnecter ?")) {
                                auth.signOut();
                                router.push("/");
                            }
                        } else {
                            router.push("/login");
                        }
                    }}
                    className="w-full py-3.5 text-red-500 font-black italic bg-red-500/10 rounded-2xl transition hover:bg-red-500/20 active:scale-[0.98] border border-red-500/20 text-xs tracking-widest"
                >
                    {auth.currentUser ? "DÉCONNEXION 👋" : "SE CONNECTER / S'INSCRIRE"}
                </button>
            </div>

            {/* MODALS */}
            {showMedicalProfile && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm animate-in fade-in">
                    <div className="glass-card w-full max-w-sm p-8 rounded-[2.5rem] border-primary/30 relative">
                        <button onClick={() => setShowMedicalProfile(false)} className="absolute top-6 right-6 p-2 bg-secondary rounded-full">
                            <X size={20} className="text-foreground" />
                        </button>
                        <h3 className="text-2xl font-black italic mb-6 text-foreground text-center">Profil Médical</h3>
                        <div className="space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 bg-secondary/50 rounded-2xl text-center border border-primary/10">
                                    <div className="text-[10px] font-black uppercase tracking-widest opacity-50 text-foreground">Groupe Sanguin</div>
                                    <input
                                        autoComplete="off"
                                        className="text-2xl font-black text-red-500 bg-transparent text-center w-full outline-none"
                                        value={medicalInfo.blood}
                                        onChange={(e) => setMedicalInfo({ ...medicalInfo, blood: e.target.value })}
                                        placeholder="O+"
                                    />
                                </div>
                                <div className="p-4 bg-secondary/50 rounded-2xl text-center border border-primary/10">
                                    <div className="text-[10px] font-black uppercase tracking-widest opacity-50 text-foreground">Poids</div>
                                    <input
                                        autoComplete="off"
                                        className="text-2xl font-black text-primary bg-transparent text-center w-full outline-none"
                                        value={medicalInfo.weight}
                                        onChange={(e) => setMedicalInfo({ ...medicalInfo, weight: e.target.value })}
                                        placeholder="70 kg"
                                    />
                                </div>
                            </div>
                            <div>
                                <h4 className="text-[10px] font-black uppercase tracking-tighter mb-2 opacity-50 text-foreground">Allergies connues</h4>
                                <div className="flex flex-wrap gap-2">
                                    {medicalInfo.allergies.length === 0 && <span className="text-[10px] italic">Aucune</span>}
                                    {medicalInfo.allergies.map(a => (
                                        <span key={a} className="px-3 py-1 bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400 text-xs font-bold rounded-full flex items-center gap-1">
                                            {a} <X size={10} className="cursor-pointer" onClick={() => setMedicalInfo({ ...medicalInfo, allergies: medicalInfo.allergies.filter(x => x !== a) })} />
                                        </span>
                                    ))}
                                    <button
                                        onClick={() => {
                                            if (!auth.currentUser) return setShowAuthPrompt(true);
                                            setIsAddingAllergy(true);
                                        }}
                                        className="px-3 py-1 bg-secondary text-foreground text-xs font-bold rounded-full border border-dashed border-border"
                                    >
                                        +
                                    </button>
                                </div>
                            </div>
                            <div>
                                <h4 className="text-[10px] font-black uppercase tracking-tighter mb-2 opacity-50 text-foreground">Conditions Chroniques</h4>
                                <div className="space-y-2">
                                    {medicalInfo.conditions.map(c => (
                                        <div key={c} className="p-3 bg-secondary/30 rounded-xl text-sm font-bold text-foreground flex items-center justify-between">
                                            <div className="flex items-center gap-2"><ShieldCheck size={16} className="text-emerald-500" /> {c}</div>
                                            <Trash2 size={14} className="text-red-500 cursor-pointer opacity-30 hover:opacity-100" onClick={() => setMedicalInfo({ ...medicalInfo, conditions: medicalInfo.conditions.filter(x => x !== c) })} />
                                        </div>
                                    ))}
                                    <button
                                        onClick={() => {
                                            if (!auth.currentUser) return setShowAuthPrompt(true);
                                            setIsAddingCondition(true);
                                        }}
                                        className="w-full py-2 border border-dashed border-border text-[10px] font-black rounded-lg"
                                    >
                                        + AJOUTER UNE CONDITION
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* NEW MINI-MODALS FOR INPUTS */}
            {isAddingAllergy && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-6 bg-black/40 backdrop-blur-[2px] animate-in fade-in">
                    <div className="glass-card w-full max-w-[280px] p-6 rounded-[2rem] border-primary/30 shadow-2xl">
                        <h4 className="font-black text-center mb-4">Nouvelle Allergie</h4>
                        <input
                            autoFocus
                            autoComplete="off"
                            placeholder="ex: Pénicilline"
                            className="w-full p-4 bg-secondary rounded-2xl mb-4 font-bold outline-none border-2 border-transparent focus:border-primary/20"
                            value={newAllergyInput}
                            onChange={(e) => setNewAllergyInput(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && newAllergyInput && (setMedicalInfo({ ...medicalInfo, allergies: [...medicalInfo.allergies, newAllergyInput] }), setNewAllergyInput(""), setIsAddingAllergy(false))}
                        />
                        <div className="flex gap-2">
                            <button onClick={() => setIsAddingAllergy(false)} className="flex-1 py-3 bg-secondary rounded-xl font-bold text-xs">Annuler</button>
                            <button
                                onClick={() => {
                                    if (newAllergyInput) {
                                        setMedicalInfo({ ...medicalInfo, allergies: [...medicalInfo.allergies, newAllergyInput] });
                                        setNewAllergyInput("");
                                        setIsAddingAllergy(false);
                                    }
                                }}
                                className="flex-1 py-3 bg-primary text-white rounded-xl font-black text-xs"
                            >
                                Ajouter
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {isAddingCondition && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-6 bg-black/40 backdrop-blur-[2px] animate-in fade-in">
                    <div className="glass-card w-full max-w-[280px] p-6 rounded-[2rem] border-primary/30 shadow-2xl">
                        <h4 className="font-black text-center mb-4">Condition Chronique</h4>
                        <input
                            autoFocus
                            autoComplete="off"
                            placeholder="ex: Diabète Type 2"
                            className="w-full p-4 bg-secondary rounded-2xl mb-4 font-bold outline-none border-2 border-transparent focus:border-primary/20"
                            value={newConditionInput}
                            onChange={(e) => setNewConditionInput(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && newConditionInput && (setMedicalInfo({ ...medicalInfo, conditions: [...medicalInfo.conditions, newConditionInput] }), setNewConditionInput(""), setIsAddingCondition(false))}
                        />
                        <div className="flex gap-2">
                            <button onClick={() => setIsAddingCondition(false)} className="flex-1 py-3 bg-secondary rounded-xl font-bold text-xs">Annuler</button>
                            <button
                                onClick={() => {
                                    if (newConditionInput) {
                                        setMedicalInfo({ ...medicalInfo, conditions: [...medicalInfo.conditions, newConditionInput] });
                                        setNewConditionInput("");
                                        setIsAddingCondition(false);
                                    }
                                }}
                                className="flex-1 py-3 bg-primary text-white rounded-xl font-black text-xs"
                            >
                                Ajouter
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {isAddingFamily && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-6 bg-black/40 backdrop-blur-[2px] animate-in fade-in">
                    <div className="glass-card w-full max-w-[320px] p-6 rounded-[2rem] border-primary/30 shadow-2xl">
                        <h4 className="font-black text-center mb-4 italic">Nouveau Proche</h4>
                        <input
                            autoFocus
                            autoComplete="off"
                            placeholder="Nom complet"
                            className="w-full p-4 bg-secondary rounded-2xl mb-3 font-bold outline-none border-2 border-transparent focus:border-primary/20"
                            value={newFamilyMember.name}
                            onChange={(e) => setNewFamilyMember({ ...newFamilyMember, name: e.target.value })}
                        />
                        <select
                            className="w-full p-4 bg-secondary rounded-2xl mb-4 font-bold outline-none border-r-[16px] border-r-transparent"
                            value={newFamilyMember.role}
                            onChange={(e) => setNewFamilyMember({ ...newFamilyMember, role: e.target.value })}
                        >
                            <option value="">Sélectionner le rôle</option>
                            <option value="Conjoint(e)">Conjoint(e)</option>
                            <option value="Enfant">Enfant</option>
                            <option value="Parent">Parent</option>
                            <option value="Autre">Autre</option>
                        </select>
                        <div className="flex gap-2">
                            <button onClick={() => setIsAddingFamily(false)} className="flex-1 py-3 bg-secondary rounded-xl font-bold text-xs">Annuler</button>
                            <button
                                onClick={addFamilyMember}
                                className="flex-1 py-3 bg-primary text-white rounded-xl font-black text-xs"
                            >
                                Confirmer
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {isAddingAddress && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-6 bg-black/40 backdrop-blur-[2px] animate-in fade-in">
                    <div className="glass-card w-full max-w-[320px] p-6 rounded-[2rem] border-primary/30 shadow-2xl">
                        <h4 className="font-black text-center mb-4 italic">Nouvelle Adresse</h4>
                        <input
                            autoFocus
                            autoComplete="off"
                            placeholder="Nom (ex: Maison, Bureau)"
                            className="w-full p-4 bg-secondary rounded-2xl mb-3 font-bold outline-none border-2 border-transparent focus:border-primary/20"
                            value={newAddressInput.label}
                            onChange={(e) => setNewAddressInput({ ...newAddressInput, label: e.target.value })}
                        />
                        <textarea
                            autoComplete="off"
                            placeholder="Adresse complète"
                            className="w-full p-4 bg-secondary rounded-2xl mb-4 font-medium outline-none border-2 border-transparent focus:border-primary/20 h-24 resize-none"
                            value={newAddressInput.address}
                            onChange={(e) => setNewAddressInput({ ...newAddressInput, address: e.target.value })}
                        />
                        <div className="flex gap-2">
                            <button onClick={() => setIsAddingAddress(false)} className="flex-1 py-3 bg-secondary rounded-xl font-bold text-xs">Annuler</button>
                            <button
                                onClick={addAddress}
                                className="flex-1 py-3 bg-primary text-white rounded-xl font-black text-xs"
                            >
                                Enregistrer
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {showHealthBook && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm animate-in fade-in">
                    <div className="glass-card w-full max-w-sm p-8 rounded-[2.5rem] border-primary/30 relative max-h-[80vh] min-h-[500px] flex flex-col">
                        <button onClick={() => { setShowHealthBook(false); setActiveDocument(null); setIsAddingEntry(false); }} className="absolute top-6 right-6 p-2 bg-secondary rounded-full z-10">
                            <X size={20} className="text-foreground" />
                        </button>

                        {isAddingEntry ? (
                            // ADD ENTRY FORM
                            <div className="flex flex-col h-full animate-in slide-in-from-right space-y-4">
                                <h3 className="text-xl font-black italic text-foreground text-center mb-4">Nouvel Événement</h3>

                                <div className="space-y-4 flex-1 overflow-y-auto">
                                    <div>
                                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1 block">Type</label>
                                        <select
                                            className="w-full p-4 bg-secondary dark:bg-zinc-800 rounded-2xl font-bold outline-none border-r-[16px] border-r-transparent"
                                            value={newHealthEntry.type}
                                            onChange={(e) => setNewHealthEntry({ ...newHealthEntry, type: e.target.value })}
                                        >
                                            <option>Consultation</option>
                                            <option>Ordonnance</option>
                                            <option>Rapport Bio</option>
                                            <option>Vaccination</option>
                                            <option>Examen Radio</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1 block">Date</label>
                                        <input
                                            type="date"
                                            autoComplete="off"
                                            className="w-full p-4 bg-secondary dark:bg-zinc-800 rounded-2xl font-bold outline-none"
                                            value={newHealthEntry.date}
                                            onChange={(e) => setNewHealthEntry({ ...newHealthEntry, date: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1 block">Médecin / Structure</label>
                                        <input
                                            type="text"
                                            autoComplete="off"
                                            placeholder="ex: Dr. Ouédraogo"
                                            className="w-full p-4 bg-secondary dark:bg-zinc-800 rounded-2xl font-bold outline-none"
                                            value={newHealthEntry.provider}
                                            onChange={(e) => setNewHealthEntry({ ...newHealthEntry, provider: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1 block">Notes (Optionnel)</label>
                                        <textarea
                                            placeholder="Détails, dosage, remarques..."
                                            className="w-full p-4 bg-secondary dark:bg-zinc-800 rounded-2xl font-medium outline-none h-24 resize-none"
                                            value={newHealthEntry.notes}
                                            onChange={(e) => setNewHealthEntry({ ...newHealthEntry, notes: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="flex gap-3 pt-2">
                                    <button
                                        onClick={() => setIsAddingEntry(false)}
                                        className="flex-1 py-4 bg-secondary text-foreground font-black rounded-2xl"
                                    >
                                        Annuler
                                    </button>
                                    <button
                                        onClick={addHealthEntry}
                                        className="flex-1 py-4 bg-primary text-white font-black rounded-2xl shadow-xl shadow-primary/20"
                                    >
                                        Enregistrer
                                    </button>
                                </div>
                            </div>
                        ) : activeDocument ? (
                            // DOCUMENT VIEWER
                            <div className="flex flex-col h-full animate-in slide-in-from-right">
                                <h3 className="text-xl font-black italic mb-2 text-foreground text-center">{activeDocument.type}</h3>
                                <p className="text-center text-xs font-bold text-muted-foreground mb-6 uppercase tracking-widest">{activeDocument.date} • {activeDocument.provider}</p>

                                <div className="flex-1 bg-secondary/50 rounded-2xl mb-6 relative overflow-hidden flex items-center justify-center border-2 border-dashed border-primary/20 group">
                                    <div className="absolute inset-0 flex items-center justify-center opacity-10 font-black text-6xl -rotate-45 pointer-events-none">
                                        PREVIEW
                                    </div>
                                    <FileText size={64} className="text-primary/20" />
                                </div>

                                {activeDocument.notes && (
                                    <div className="mb-4 p-4 bg-secondary/30 rounded-xl text-sm italic text-muted-foreground border border-border/50">
                                        "{activeDocument.notes}"
                                    </div>
                                )}

                                <button
                                    onClick={() => setActiveDocument(null)}
                                    className="w-full py-4 bg-secondary text-foreground font-black rounded-2xl uppercase tracking-widest text-xs"
                                >
                                    Retour à la liste
                                </button>
                            </div>
                        ) : (
                            // LIST VIEW
                            <>
                                <h3 className="text-2xl font-black italic mb-6 text-foreground text-center">Carnet de Santé</h3>
                                <div className="flex-1 overflow-y-auto space-y-4 pr-2">
                                    {healthEntries.length === 0 ? (
                                        <div className="text-center py-10 opacity-30 italic font-bold">Carnet vide</div>
                                    ) : healthEntries.map((doc, i) => (
                                        <div
                                            key={i}
                                            onClick={() => setActiveDocument(doc)}
                                            className="p-4 bg-secondary/50 rounded-2xl flex items-center justify-between group cursor-pointer hover:bg-primary/5 border border-transparent hover:border-primary/20 transition-all"
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 bg-white dark:bg-zinc-800 rounded-xl flex items-center justify-center shadow-sm">
                                                    {doc.icon || <FileText className="text-primary" />}
                                                </div>
                                                <div>
                                                    <div className="font-bold text-sm text-foreground">{doc.type}</div>
                                                    <div className="text-[10px] font-bold opacity-50 text-foreground">{doc.date} • {doc.provider}</div>
                                                </div>
                                            </div>
                                            <ChevronRight size={16} className="text-muted-foreground group-hover:translate-x-1 transition-transform" />
                                        </div>
                                    ))}
                                </div>
                                <div className="mt-6 flex gap-3">
                                    <button
                                        onClick={() => router.push('/scanner?mode=document&returnUrl=/profile')}
                                        className="flex-1 py-4 bg-secondary text-foreground font-black rounded-2xl flex flex-col items-center justify-center gap-1 hover:bg-secondary/80 transition active:scale-95"
                                    >
                                        <div className="w-8 h-8 rounded-full bg-background flex items-center justify-center"><Plus size={16} /></div>
                                        <span className="text-[10px] uppercase tracking-widest">Scanner</span>
                                    </button>
                                    <button
                                        onClick={() => setIsAddingEntry(true)}
                                        className="flex-[2] py-4 bg-primary text-white font-black rounded-2xl flex items-center justify-center gap-2 shadow-xl shadow-primary/20 hover:brightness-110 transition active:scale-95 text-xs uppercase tracking-widest"
                                    >
                                        <Edit size={16} /> SAISIE MANUELLE
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}

            {showFamily && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm animate-in fade-in">
                    <div className="glass-card w-full max-w-sm p-8 rounded-[2.5rem] border-primary/30 relative">
                        <button onClick={() => setShowFamily(false)} className="absolute top-6 right-6 p-2 bg-secondary rounded-full">
                            <X size={20} className="text-foreground" />
                        </button>
                        <h3 className="text-2xl font-black italic mb-6 text-foreground text-center">Cercle Familial</h3>
                        <div className="space-y-4">
                            {family.length === 0 && <div className="text-center py-5 opacity-30 italic text-sm">Aucun membre enregistré</div>}
                            {family.map((f, i) => (
                                <div key={i} className="p-4 bg-secondary/50 rounded-2xl flex items-center justify-between border border-primary/5 group">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 bg-white dark:bg-zinc-800 rounded-full overflow-hidden border-2 border-primary/20">
                                            <img src={f.img} alt={f.name} />
                                        </div>
                                        <div>
                                            <div className="font-bold text-foreground">{f.name}</div>
                                            <div className="text-[10px] font-black uppercase tracking-widest text-primary">{f.role}</div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Trash2 size={16} className="text-red-500 cursor-pointer opacity-0 group-hover:opacity-100" onClick={() => setFamily(family.filter((_, idx) => idx !== i))} />
                                        <Settings size={16} className="text-muted-foreground opacity-50" />
                                    </div>
                                </div>
                            ))}
                            <button onClick={() => setIsAddingFamily(true)} className="w-full py-5 border-2 border-dashed border-primary/20 rounded-2xl text-primary font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-primary/5 transition-all">
                                <Plus size={20} /> Ajouter un proche
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {showSubscriptions && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm animate-in fade-in">
                    <div className="glass-card w-full max-w-sm p-8 rounded-[2.5rem] border-primary/30 relative">
                        <button onClick={() => setShowSubscriptions(false)} className="absolute top-6 right-6 p-2 bg-secondary rounded-full">
                            <X size={20} className="text-foreground" />
                        </button>
                        <h3 className="text-2xl font-black italic mb-6 text-foreground text-center tracking-tighter leading-tight">Traitements Chroniques</h3>
                        <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
                            {subscriptions.length === 0 ? (
                                <div className="text-center py-10 opacity-30 italic font-bold">Aucun abonnement actif</div>
                            ) : subscriptions.map((sub, i) => (
                                <div key={i} className="p-5 bg-gradient-to-br from-primary/10 to-transparent border border-primary/20 rounded-3xl relative overflow-hidden group">
                                    <div className="absolute top-0 right-0 p-3">
                                        <Zap size={24} className="text-primary opacity-20 group-hover:scale-110 transition-transform" />
                                    </div>
                                    <h4 className="font-black text-foreground">{sub.items[0]?.productName || "Abonnement"} {sub.items.length > 1 ? `(+${sub.items.length - 1})` : ""}</h4>
                                    <p className="text-[10px] text-muted-foreground font-bold mb-4">{sub.pharmacyName} • Livraison mensuelle</p>
                                    <div className="flex items-center justify-between">
                                        <span className="text-[10px] font-black bg-emerald-500/10 text-emerald-500 px-3 py-1 rounded-full uppercase">
                                            SUIVANT : {new Date(sub.nextDate).toLocaleDateString("fr-FR", { day: 'numeric', month: 'short' }).toUpperCase()}
                                        </span>
                                        <span className="font-black text-foreground">{sub.total} FCFA</span>
                                    </div>
                                    <button
                                        onClick={() => {
                                            if (confirm("Voulez-vous annuler cet abonnement ?")) {
                                                setSubscriptions(subscriptions.filter((_, idx) => idx !== i));
                                            }
                                        }}
                                        className="mt-4 w-full py-2 text-[10px] font-black text-red-500 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        Annuler l'abonnement
                                    </button>
                                </div>
                            ))}
                            <button onClick={() => { setShowSubscriptions(false); router.push("/"); }} className="w-full py-4 bg-secondary text-foreground rounded-2xl font-bold text-xs uppercase tracking-widest">Nouvelle Recherche</button>
                        </div>
                    </div>
                </div>
            )}

            {showAddresses && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm animate-in fade-in">
                    <div className="glass-card w-full max-w-sm p-8 rounded-[2.5rem] border-primary/30 relative">
                        <button onClick={() => setShowAddresses(false)} className="absolute top-6 right-6 p-2 bg-secondary rounded-full">
                            <X size={20} className="text-foreground" />
                        </button>
                        <h3 className="text-2xl font-black italic mb-6 text-foreground text-center">Mes Lieux</h3>
                        <div className="space-y-4">
                            {addresses.length === 0 && <div className="text-center py-5 opacity-30 italic text-sm">Aucune adresse enregistrée</div>}
                            {addresses.map((a, i) => (
                                <div key={i} className="p-4 bg-secondary/50 rounded-2xl flex items-center justify-between group cursor-pointer border-2 border-transparent hover:border-primary/20 transition-all">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 bg-white dark:bg-zinc-800 rounded-xl flex items-center justify-center shadow-sm">
                                            <MapPin size={20} className="text-primary" />
                                        </div>
                                        <div>
                                            <div className="font-bold text-sm text-foreground">{a.label}</div>
                                            <div className="text-[10px] font-bold opacity-50 text-foreground truncate max-w-[150px]">{a.address}</div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Trash2 size={14} className="text-red-500 opacity-0 group-hover:opacity-100 cursor-pointer" onClick={() => setAddresses(addresses.filter((_, idx) => idx !== i))} />
                                        <Edit size={14} className="text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </div>
                                </div>
                            ))}
                            <button onClick={() => setIsAddingAddress(true)} className="w-full py-4 bg-primary text-white font-black rounded-2xl flex items-center justify-center gap-2 shadow-xl shadow-primary/20">
                                <Plus size={20} /> AJOUTER UNE ADRESSE
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {showSecurity && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm animate-in fade-in">
                    <div className="glass-card w-full max-w-sm p-8 rounded-[2.5rem] border-primary/30 relative">
                        <button onClick={() => setShowSecurity(false)} className="absolute top-6 right-6 p-2 bg-secondary rounded-full">
                            <X size={20} className="text-foreground" />
                        </button>
                        <h3 className="text-2xl font-black italic mb-6 text-foreground text-center">Sécurité</h3>
                        <div className="space-y-6">
                            {[
                                { key: "biometrics", title: "Authentification Biométrique", desc: "Utiliser FaceID ou Empreinte", icon: <ShieldCheck size={20} /> },
                                { key: "pin", title: "Code PIN de Sécurité", desc: "Requis pour chaque transaction", icon: <Lock size={20} /> },
                                { key: "twoFactor", title: "Double Authentification", desc: "Validation par SMS/Email", icon: <Shield size={20} /> }
                            ].map((s: any, i) => (
                                <div key={i} className="flex items-center justify-between">
                                    <div className="flex items-center gap-3 max-w-[180px]">
                                        <div className="text-primary">{s.icon}</div>
                                        <div>
                                            <div className="font-bold text-foreground text-sm">{s.title}</div>
                                            <div className="text-[10px] text-muted-foreground font-medium">{s.desc}</div>
                                        </div>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={securitySettings[s.key as keyof typeof securitySettings]}
                                            onChange={() => setSecuritySettings({ ...securitySettings, [s.key]: !securitySettings[s.key as keyof typeof securitySettings] })}
                                            className="sr-only peer"
                                        />
                                        <div className="w-9 h-5 bg-gray-200 dark:bg-zinc-800 rounded-full peer peer-checked:bg-primary after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-4"></div>
                                    </label>
                                </div>
                            ))}
                            <button className="w-full py-4 text-primary font-black text-xs uppercase tracking-widest bg-primary/5 rounded-2xl">Changer mon mot de passe</button>
                        </div>
                    </div>
                </div>
            )}

            {showHelp && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm animate-in fade-in">
                    <div className="glass-card w-full max-w-sm p-8 rounded-[2.5rem] border-primary/30 relative">
                        <button onClick={() => setShowHelp(false)} className="absolute top-6 right-6 p-2 bg-secondary rounded-full">
                            <X size={20} className="text-foreground" />
                        </button>
                        <h3 className="text-2xl font-black italic mb-6 text-foreground text-center">Besoin d'aide ?</h3>
                        <div className="space-y-4">
                            <button className="w-full p-4 bg-emerald-500/10 text-emerald-600 rounded-[1.5rem] flex items-center gap-3 hover:bg-emerald-500/20 transition-all">
                                <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center text-white">
                                    <Phone size={20} />
                                </div>
                                <div className="text-left">
                                    <div className="font-bold text-sm">Contacter par WhatsApp</div>
                                    <div className="text-[10px] font-medium opacity-70">Réponse en moins de 5 min</div>
                                </div>
                            </button>
                            <button className="w-full p-4 bg-primary/10 text-primary rounded-[1.5rem] flex items-center gap-3 hover:bg-primary/20 transition-all">
                                <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white">
                                    <HelpCircle size={20} />
                                </div>
                                <div className="text-left">
                                    <div className="font-bold text-sm">Centre d'aide (FAQ)</div>
                                    <div className="text-[10px] font-medium opacity-70">Toutes les réponses à vos questions</div>
                                </div>
                            </button>
                            <div className="p-4 bg-secondary/50 rounded-2xl">
                                <div className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-2 text-foreground">A propos</div>
                                <div className="text-xs font-bold text-foreground">PharmaBF Version 2.4.0 (Build 502)</div>
                                <div className="text-[10px] font-medium text-muted-foreground mt-1">FIEREMENT DEVELOPPE AU BURKINA FASO 🇧🇫</div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {showPayments && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm animate-in fade-in">
                    <div className="glass-card w-full max-w-sm p-8 rounded-[2.5rem] border-primary/30 relative">
                        <button onClick={() => setShowPayments(false)} className="absolute top-6 right-6 p-2 bg-secondary rounded-full">
                            <X size={20} className="text-foreground" />
                        </button>
                        <h3 className="text-2xl font-black italic mb-6 text-foreground">Mes Paiements</h3>
                        <div className="space-y-4">
                            {[
                                { name: "Orange Money", num: "76 xx xx 12", color: "bg-[#FF6600]" },
                                { name: "Moov Money", num: "60 xx xx 45", color: "bg-[#002B7F]" }
                            ].map((p, i) => (
                                <div key={i} className="flex items-center justify-between p-4 bg-secondary/50 rounded-2xl">
                                    <div className="flex items-center gap-3">
                                        <div className={cn("w-8 h-8 rounded-lg", p.color)} />
                                        <div className="font-bold text-foreground text-sm">{p.name}</div>
                                    </div>
                                    <div className="text-xs font-mono font-bold opacity-60 text-foreground">{p.num}</div>
                                </div>
                            ))}
                            <button className="w-full py-4 border-2 border-dashed border-primary/30 text-primary font-black rounded-2xl text-xs uppercase tracking-widest hover:bg-primary/5">
                                + Ajouter un numéro
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {showInsurance && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm animate-in fade-in">
                    <div className="glass-card w-full max-w-sm p-8 rounded-[2.5rem] border-primary/30 relative max-h-[85vh] flex flex-col">
                        <button onClick={() => { setShowInsurance(false); setIsAddingInsurance(false); setEditingInsuranceIndex(null); }} className="absolute top-6 right-6 p-2 bg-secondary rounded-full z-10">
                            <X size={20} className="text-foreground" />
                        </button>
                        <h3 className="text-2xl font-black italic mb-6 text-foreground text-center">Mes Assurances</h3>

                        {isAddingInsurance || editingInsuranceIndex !== null ? (
                            <div className="space-y-4 flex-1 overflow-y-auto pr-2">
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2 block">Assureur</label>
                                    <select
                                        className="w-full p-4 bg-secondary dark:bg-zinc-800 rounded-2xl font-bold outline-none border-r-[16px] border-r-transparent"
                                        value={newInsurance.provider}
                                        onChange={(e) => setNewInsurance({ ...newInsurance, provider: e.target.value })}
                                    >
                                        <option value="">Sélectionner...</option>
                                        <option value="CNSS">CNSS (Caisse Nationale de Sécurité Sociale)</option>
                                        <option value="INAM">INAM (Institut National d'Assurance Maladie)</option>
                                        <option value="SONAR">SONAR Assurances</option>
                                        <option value="UAB">UAB Assurances</option>
                                        <option value="Allianz">Allianz Burkina</option>
                                        <option value="NSIA">NSIA Assurances</option>
                                        <option value="Autre">Autre</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2 block">N° de Police</label>
                                    <input
                                        type="text"
                                        autoComplete="off"
                                        placeholder="ex: BF-2024-123456"
                                        className="w-full p-4 bg-secondary dark:bg-zinc-800 rounded-2xl font-bold outline-none"
                                        value={newInsurance.policyNumber}
                                        onChange={(e) => setNewInsurance({ ...newInsurance, policyNumber: e.target.value })}
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2 block">Taux (%)</label>
                                        <input
                                            type="number"
                                            autoComplete="off"
                                            min="0"
                                            max="100"
                                            placeholder="80"
                                            className="w-full p-4 bg-secondary dark:bg-zinc-800 rounded-2xl font-bold outline-none"
                                            value={newInsurance.coverageRate}
                                            onChange={(e) => setNewInsurance({ ...newInsurance, coverageRate: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2 block">Expiration</label>
                                        <input
                                            type="date"
                                            autoComplete="off"
                                            className="w-full p-4 bg-secondary dark:bg-zinc-800 rounded-2xl font-bold outline-none"
                                            value={newInsurance.expiryDate}
                                            onChange={(e) => setNewInsurance({ ...newInsurance, expiryDate: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2 block">Bénéficiaires couverts</label>
                                    <div className="flex flex-wrap gap-2 mb-2">
                                        {newInsurance.beneficiaries.map((b, idx) => (
                                            <span key={idx} className="px-3 py-1 bg-primary/10 text-primary text-xs font-bold rounded-full flex items-center gap-1">
                                                {b} <X size={10} className="cursor-pointer" onClick={() => setNewInsurance({ ...newInsurance, beneficiaries: newInsurance.beneficiaries.filter((_, i) => i !== idx) })} />
                                            </span>
                                        ))}
                                    </div>
                                    <select
                                        className="w-full p-3 bg-secondary/50 rounded-xl text-xs font-bold outline-none border-r-[12px] border-r-transparent"
                                        onChange={(e) => {
                                            if (e.target.value && !newInsurance.beneficiaries.includes(e.target.value)) {
                                                setNewInsurance({ ...newInsurance, beneficiaries: [...newInsurance.beneficiaries, e.target.value] });
                                                e.target.value = "";
                                            }
                                        }}
                                    >
                                        <option value="">+ Ajouter un bénéficiaire</option>
                                        <option value="Moi-même">Moi-même</option>
                                        {family.map((f, i) => <option key={i} value={f.name}>{f.name} ({f.role})</option>)}
                                    </select>
                                </div>

                                <div className="space-y-3">
                                    <div className="flex items-center justify-between p-4 bg-secondary/30 rounded-xl">
                                        <div>
                                            <div className="font-bold text-sm text-foreground">Tiers-Payant</div>
                                            <div className="text-[10px] text-muted-foreground font-medium">Paiement direct par l'assurance</div>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={newInsurance.tierPayant}
                                                onChange={() => setNewInsurance({ ...newInsurance, tierPayant: !newInsurance.tierPayant })}
                                                className="sr-only peer"
                                            />
                                            <div className="w-9 h-5 bg-gray-200 dark:bg-zinc-800 rounded-full peer peer-checked:bg-primary after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-4"></div>
                                        </label>
                                    </div>
                                    <div className="flex items-center justify-between p-4 bg-secondary/30 rounded-xl">
                                        <div>
                                            <div className="font-bold text-sm text-foreground">Statut</div>
                                            <div className="text-[10px] text-muted-foreground font-medium">Assurance active</div>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={newInsurance.isActive}
                                                onChange={() => setNewInsurance({ ...newInsurance, isActive: !newInsurance.isActive })}
                                                className="sr-only peer"
                                            />
                                            <div className="w-9 h-5 bg-gray-200 dark:bg-zinc-800 rounded-full peer peer-checked:bg-emerald-500 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-4"></div>
                                        </label>
                                    </div>
                                </div>

                                <div className="flex gap-3 pt-4">
                                    <button
                                        onClick={() => {
                                            setIsAddingInsurance(false);
                                            setEditingInsuranceIndex(null);
                                            setNewInsurance({ provider: "", policyNumber: "", coverageRate: "80", expiryDate: "", beneficiaries: [], isActive: true, tierPayant: false });
                                        }}
                                        className="flex-1 py-4 bg-secondary text-foreground font-black rounded-2xl"
                                    >
                                        Annuler
                                    </button>
                                    <button
                                        onClick={() => {
                                            if (!newInsurance.provider || !newInsurance.policyNumber) {
                                                alert("Veuillez remplir au minimum l'assureur et le numéro de police.");
                                                return;
                                            }
                                            if (editingInsuranceIndex !== null) {
                                                const updated = [...insurances];
                                                updated[editingInsuranceIndex] = { ...newInsurance };
                                                setInsurances(updated);
                                                setEditingInsuranceIndex(null);
                                            } else {
                                                setInsurances([...insurances, { ...newInsurance }]);
                                            }
                                            setIsAddingInsurance(false);
                                            setNewInsurance({ provider: "", policyNumber: "", coverageRate: "80", expiryDate: "", beneficiaries: [], isActive: true, tierPayant: false });
                                        }}
                                        className="flex-1 py-4 bg-primary text-white font-black rounded-2xl shadow-xl shadow-primary/20"
                                    >
                                        {editingInsuranceIndex !== null ? "Enregistrer" : "Ajouter"}
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <>
                                <div className="flex-1 overflow-y-auto space-y-4 pr-2">
                                    {insurances.length === 0 ? (
                                        <div className="text-center py-10 opacity-30 italic font-bold">Aucune assurance enregistrée</div>
                                    ) : insurances.map((ins, i) => (
                                        <div key={i} className="p-5 bg-gradient-to-br from-primary/5 to-transparent border-2 border-primary/20 rounded-3xl relative overflow-hidden group">
                                            <div className="absolute top-4 right-4 flex items-center gap-2">
                                                <button
                                                    onClick={() => {
                                                        setNewInsurance(ins);
                                                        setEditingInsuranceIndex(i);
                                                        setIsAddingInsurance(true);
                                                    }}
                                                    className="p-2 bg-secondary rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                                >
                                                    <Edit size={14} className="text-primary" />
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        if (confirm("Supprimer cette assurance ?")) {
                                                            setInsurances(insurances.filter((_, idx) => idx !== i));
                                                        }
                                                    }}
                                                    className="p-2 bg-red-500/10 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                                >
                                                    <Trash2 size={14} className="text-red-500" />
                                                </button>
                                            </div>
                                            <div className="flex items-start gap-4 mb-4">
                                                <div className="w-12 h-12 bg-white dark:bg-zinc-800 rounded-xl flex items-center justify-center font-black text-lg text-primary shadow-lg">
                                                    {ins.provider[0]}
                                                </div>
                                                <div className="flex-1">
                                                    <div className="font-black text-lg text-foreground">{ins.provider}</div>
                                                    <div className="text-[10px] font-mono font-bold text-muted-foreground">{ins.policyNumber}</div>
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-2 gap-3 mb-3">
                                                <div className="p-3 bg-secondary/50 rounded-xl">
                                                    <div className="text-[9px] font-black uppercase tracking-widest text-muted-foreground mb-1">Couverture</div>
                                                    <div className="text-xl font-black text-primary">{ins.coverageRate}%</div>
                                                </div>
                                                <div className="p-3 bg-secondary/50 rounded-xl">
                                                    <div className="text-[9px] font-black uppercase tracking-widest text-muted-foreground mb-1">Expire le</div>
                                                    <div className="text-sm font-black text-foreground">{ins.expiryDate ? new Date(ins.expiryDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: '2-digit' }) : "N/A"}</div>
                                                </div>
                                            </div>
                                            {ins.beneficiaries.length > 0 && (
                                                <div className="mb-3">
                                                    <div className="text-[9px] font-black uppercase tracking-widest text-muted-foreground mb-2">Bénéficiaires</div>
                                                    <div className="flex flex-wrap gap-1">
                                                        {ins.beneficiaries.map((b: string, idx: number) => (
                                                            <span key={idx} className="px-2 py-0.5 bg-primary/10 text-primary text-[10px] font-bold rounded-full">{b}</span>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                            <div className="flex items-center gap-2">
                                                {ins.tierPayant && (
                                                    <span className="px-3 py-1 bg-emerald-500/10 text-emerald-500 text-[10px] font-black rounded-full uppercase tracking-widest">Tiers-Payant</span>
                                                )}
                                                <span className={cn("px-3 py-1 text-[10px] font-black rounded-full uppercase tracking-widest", ins.isActive ? "bg-emerald-500/10 text-emerald-500" : "bg-gray-500/10 text-gray-500")}>
                                                    {ins.isActive ? "Active" : "Inactive"}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <button
                                    onClick={() => {
                                        setNewInsurance({ provider: "", policyNumber: "", coverageRate: "80", expiryDate: "", beneficiaries: [], isActive: true, tierPayant: false });
                                        setIsAddingInsurance(true);
                                        setEditingInsuranceIndex(null);
                                    }}
                                    className="w-full py-4 bg-primary text-white font-black rounded-2xl flex items-center justify-center gap-2 shadow-xl shadow-primary/20 hover:brightness-110 transition-all active:scale-95"
                                >
                                    <Plus size={20} /> AJOUTER UNE ASSURANCE
                                </button>
                            </>
                        )}
                    </div>
                </div>
            )}

            {showNotifications && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm animate-in fade-in">
                    <div className="glass-card w-full max-w-sm p-8 rounded-[2.5rem] border-primary/30 relative">
                        <button onClick={() => setShowNotifications(false)} className="absolute top-6 right-6 p-2 bg-secondary rounded-full">
                            <X size={20} className="text-foreground" />
                        </button>
                        <h3 className="text-2xl font-black italic mb-6 text-foreground">Alertes & Rappels</h3>
                        <div className="space-y-6">
                            {[
                                { key: "pillReminders", title: "Rappels Pilulier", desc: "Alertes quotidiennes pour médicaments" },
                                { key: "orderUpdates", title: "Commandes", desc: "Suivi de livraison en temps réel" },
                                { key: "pharmacyGuard", title: "Pharmacies de garde", desc: "Mise à jour hebdomadaire" },
                                { key: "promotions", title: "Promotions & Offres", desc: "Réductions exclusives" }
                            ].map((n: any, i) => (
                                <div key={i} className="flex items-center justify-between">
                                    <div className="max-w-[180px]">
                                        <div className="font-bold text-foreground text-sm">{n.title}</div>
                                        <div className="text-[10px] text-muted-foreground font-medium">{n.desc}</div>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={notificationSettings[n.key as keyof typeof notificationSettings]}
                                            onChange={() => setNotificationSettings({ ...notificationSettings, [n.key]: !notificationSettings[n.key as keyof typeof notificationSettings] })}
                                            className="sr-only peer"
                                        />
                                        <div className="w-9 h-5 bg-gray-200 dark:bg-zinc-800 rounded-full peer peer-checked:bg-primary after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-4"></div>
                                    </label>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
            <AuthPrompt
                isOpen={showAuthPrompt}
                onClose={() => setShowAuthPrompt(false)}
                message="Connectez-vous pour sauvegarder votre profil médical, vos rappels de pilulier et vos adresses en toute sécurité."
            />
        </main>
    );
}
