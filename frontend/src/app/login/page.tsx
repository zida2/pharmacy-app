"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Phone, Lock } from "lucide-react";
import { cn } from "@/lib/utils";

import { auth } from "@/services/firebase";

export default function LoginPage() {
    const router = useRouter();
    const [mode, setMode] = useState<"login" | "register">("login");
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [phone, setPhone] = useState("");
    const [otp, setOtp] = useState("");
    const [step, setStep] = useState<"phone" | "otp">("phone");
    const [isLoading, setIsLoading] = useState(false);

    const handleGoogleLogin = async () => {
        setIsLoading(true);
        try {
            const { GoogleAuthProvider, signInWithPopup } = await import("firebase/auth");
            const provider = new GoogleAuthProvider();
            provider.setCustomParameters({ prompt: 'select_account' });

            const result = await signInWithPopup(auth, provider);
            const user = result.user;

            // Sync with our database
            const { firebaseService } = await import("@/services/firebaseService");
            const existingProfile = await firebaseService.getUserProfile(user.uid);

            if (!existingProfile) {
                await firebaseService.saveUserProfile(user.uid, {
                    userInfo: {
                        name: user.displayName || "Utilisateur Google",
                        email: user.email || "",
                        level: "Bronze",
                        location: "Burkina Faso"
                    },
                    createdAt: new Date().toISOString()
                });
            }

            router.push("/");
        } catch (error: any) {
            console.error("Google login error:", error);
            let message = "Erreur lors de la connexion Google.";

            if (error.code === 'auth/popup-blocked') {
                message = "Le popup de connexion a été bloqué par votre navigateur. Veuillez l'autoriser.";
            } else if (error.code === 'auth/unauthorized-domain') {
                message = "Ce domaine (URL) n'est pas autorisé dans la console Firebase. Veuillez l'ajouter aux domaines autorisés.";
            } else if (error.code === 'auth/cancelled-popup-request') {
                message = "La connexion a été annulée.";
            }

            alert(`${message}\n\n(Détail: ${error.code})`);
        } finally {
            setIsLoading(false);
        }
    };

    const handleEmailAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const {
                createUserWithEmailAndPassword,
                signInWithEmailAndPassword,
                updateProfile
            } = await import("firebase/auth");
            const { firebaseService } = await import("@/services/firebaseService");

            if (mode === "register") {
                if (!name) {
                    alert("Veuillez entrer votre nom complet.");
                    setIsLoading(false);
                    return;
                }
                const userCredential = await createUserWithEmailAndPassword(auth, email, password);
                await updateProfile(userCredential.user, { displayName: name });

                await firebaseService.saveUserProfile(userCredential.user.uid, {
                    userInfo: {
                        name: name,
                        email: email,
                        level: "Bronze",
                        location: "Burkina Faso"
                    }
                });
            } else {
                await signInWithEmailAndPassword(auth, email, password);
            }

            router.push("/");
        } catch (error: any) {
            console.error("Email auth error:", error);
            let message = "Une erreur est survenue.";
            if (error.code === "auth/email-already-in-use") message = "Cet email est déjà utilisé.";
            if (error.code === "auth/invalid-credential") message = "Email ou mot de passe incorrect.";
            if (error.code === "auth/weak-password") message = "Le mot de passe est trop faible.";
            alert(message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <main className="min-h-screen w-full flex flex-col items-center justify-center p-6 bg-[#F8FAFC] relative overflow-hidden font-sans">
            {/* Subtle background pattern (grid) */}
            <div className="absolute inset-0 z-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03] pointer-events-none" />

            <div className="w-full max-w-sm flex flex-col items-center relative z-10 animate-in fade-in zoom-in duration-500">

                {/* Header Logo Section */}
                <div className="flex flex-col items-center text-center mb-8 relative">
                    <div className="absolute inset-0 bg-gradient-to-b from-[#6366f1]/20 to-transparent blur-3xl -z-10 rounded-full w-40 h-40 mx-auto" />

                    <div className="w-28 h-28 mb-6 relative">
                        <div className="absolute inset-0 bg-white/80 backdrop-blur-xl rounded-[2rem] shadow-2xl rotate-3 border border-white/50" />
                        <div className="absolute inset-0 bg-white/80 backdrop-blur-xl rounded-[2rem] shadow-lg -rotate-3 border border-white/50" />
                        <div className="relative w-full h-full bg-white rounded-[1.8rem] p-5 shadow-[0_15px_30px_-10px_rgba(0,0,0,0.1)] flex items-center justify-center z-10 border border-slate-100">
                            <img
                                src="/logo.png"
                                alt="PharmaBF Logo"
                                className="w-full h-full object-contain filter drop-shadow-sm"
                            />
                        </div>
                    </div>

                    <h1 className="text-4xl font-[900] italic tracking-tighter text-[#0F172A] mb-1 relative">
                        Pharma<span className="text-[#6366f1]">BF</span>
                        <span className="absolute -top-1 -right-2 w-2 h-2 bg-[#10b981] rounded-full animate-pulse" />
                    </h1>
                    <div className="flex items-center gap-2 opacity-60">
                        <span className="w-8 h-[1px] bg-slate-400" />
                        <p className="text-[10px] text-slate-500 font-extrabold uppercase tracking-[0.2em]">Santé Connectée</p>
                        <span className="w-8 h-[1px] bg-slate-400" />
                    </div>
                </div>

                {/* Main Card */}
                <div className="w-full bg-white rounded-[2.5rem] shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] p-8 relative">

                    <div className="text-center mb-8">
                        <h2 className="text-2xl font-[900] italic text-[#0F172A] mb-2">Bienvenue !</h2>
                        <p className="text-xs text-slate-400 font-bold leading-relaxed px-4">
                            Connectez-vous pour accéder à vos ordonnances et vos points santé.
                        </p>
                    </div>

                    {/* Google Button */}
                    <button
                        type="button"
                        onClick={handleGoogleLogin}
                        disabled={isLoading}
                        className="w-full h-14 bg-white border-2 border-slate-100 rounded-2xl flex items-center justify-center gap-3 text-sm font-bold text-slate-600 shadow-sm hover:bg-slate-50 hover:border-slate-200 active:scale-[0.98] transition-all mb-8 group"
                    >
                        <svg className="w-6 h-6 grayscale group-hover:grayscale-0 transition-all" viewBox="0 0 24 24">
                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                        </svg>
                        Continuer avec Google
                    </button>

                    {/* Divider */}
                    <div className="relative mb-8">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t border-slate-100" />
                        </div>
                        <div className="relative flex justify-center text-[10px] uppercase">
                            <span className="bg-white px-4 text-slate-300 font-black tracking-widest">Méthode Recommandée</span>
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="flex bg-slate-50 p-1.5 rounded-2xl mb-6">
                        <button
                            onClick={() => setMode("login")}
                            className={cn(
                                "flex-1 h-10 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                                mode === "login"
                                    ? "bg-[#6366f1] text-white shadow-lg shadow-indigo-500/30"
                                    : "text-slate-400 hover:text-slate-600"
                            )}
                        >
                            Connexion
                        </button>
                        <button
                            onClick={() => setMode("register")}
                            className={cn(
                                "flex-1 h-10 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                                mode === "register"
                                    ? "bg-[#6366f1] text-white shadow-lg shadow-indigo-500/30"
                                    : "text-slate-400 hover:text-slate-600"
                            )}
                        >
                            Inscription
                        </button>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleEmailAuth} className="space-y-4">
                        {mode === "register" && (
                            <div className="group animate-in slide-in-from-top-2 duration-300">
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <svg className="h-5 w-5 text-slate-300 group-focus-within:text-[#6366f1] transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                        </svg>
                                    </div>
                                    <input
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        placeholder="Nom complet"
                                        className="w-full h-14 pl-12 pr-4 bg-slate-50 rounded-2xl border-none text-sm font-bold text-slate-700 placeholder:text-slate-300 focus:ring-2 focus:ring-[#6366f1]/20 transition-all"
                                        required={mode === "register"}
                                    />
                                </div>
                            </div>
                        )}

                        <div className="group">
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <svg className="h-5 w-5 text-slate-300 group-focus-within:text-[#6366f1] transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                    </svg>
                                </div>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="Email"
                                    className="w-full h-14 pl-12 pr-4 bg-slate-50 rounded-2xl border-none text-sm font-bold text-slate-700 placeholder:text-slate-300 focus:ring-2 focus:ring-[#6366f1]/20 transition-all"
                                    required
                                />
                            </div>
                        </div>

                        <div className="group">
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <Lock className="h-5 w-5 text-slate-300 group-focus-within:text-[#6366f1] transition-colors" />
                                </div>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Mot de passe"
                                    className="w-full h-14 pl-12 pr-4 bg-slate-50 rounded-2xl border-none text-sm font-bold text-slate-700 placeholder:text-slate-300 focus:ring-2 focus:ring-[#6366f1]/20 transition-all"
                                    required
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full py-4 mt-4 bg-[#6366f1] text-white font-black rounded-2xl shadow-xl shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:-translate-y-0.5 active:translate-y-0 transition-all text-xs tracking-[0.2em] uppercase"
                        >
                            {isLoading ? "Chargement..." : mode === "register" ? "S'inscrire" : "Connexion"}
                        </button>

                        <div className="text-center pt-4">
                            <button
                                type="button"
                                onClick={() => router.push("/forgot-password")}
                                className="text-[10px] font-black uppercase text-[#6366f1] tracking-widest hover:underline"
                            >
                                Mot de passe oublié ?
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            {/* Floating AI Bot */}
            <div className="fixed bottom-6 right-6 z-50">
                <button
                    onClick={() => router.push('/teleconsultation')}
                    className="w-16 h-16 bg-[#6366f1] rounded-full shadow-[0_8px_30px_rgb(99,102,241,0.4)] flex items-center justify-center relative hover:scale-110 transition-transform duration-300 group"
                >
                    <div className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 rounded-full border-2 border-white flex items-center justify-center text-[8px] font-black text-white animate-bounce">
                        AI
                    </div>
                    {/* Robot Icon */}
                    <svg className="w-8 h-8 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 8V4H8" />
                        <rect x="4" y="8" width="16" height="12" rx="2" />
                        <path d="M2 14h2" />
                        <path d="M20 14h2" />
                        <path d="M15 13v2" />
                        <path d="M9 13v2" />
                    </svg>

                    {/* Ripple Effect */}
                    <div className="absolute inset-0 rounded-full border-2 border-[#6366f1] animate-ping opacity-20" />
                </button>
            </div>
        </main>
    );
}
