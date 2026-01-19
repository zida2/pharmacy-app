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
        <main className="min-h-screen w-full flex flex-col items-center justify-center p-4 bg-slate-900 relative overflow-hidden font-sans">
            {/* Cinematic Background Image - Sharp and Clear */}
            <div className="absolute inset-0 z-0">
                <img
                    src="/login-bg.png"
                    alt="Background"
                    className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-slate-950/30" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-slate-950/30" />
            </div>

            <div className="w-full max-w-sm flex flex-col items-center relative z-10 animate-in fade-in zoom-in duration-500">

                {/* Header Logo Section */}
                <div className="flex flex-col items-center text-center mb-6 relative">
                    <div className="absolute inset-0 bg-gradient-to-b from-[#6366f1]/20 to-transparent blur-3xl -z-10 rounded-full w-32 h-32 mx-auto" />

                    <div className="w-20 h-20 mb-4 relative drop-shadow-2xl">
                        <div className="absolute inset-0 bg-white/10 backdrop-blur-xl rounded-[1.5rem] border border-white/20 rotate-3" />
                        <div className="relative w-full h-full bg-white rounded-[1.3rem] p-3 flex items-center justify-center z-10 border border-white/50 shadow-xl">
                            <img
                                src="/logo.png"
                                alt="PharmaBF Logo"
                                className="w-full h-full object-contain"
                            />
                        </div>
                    </div>

                    <h1 className="text-3xl font-[900] italic tracking-tighter text-white mb-1 drop-shadow-md">
                        Pharma<span className="text-[#6366f1]">BF</span>
                        <span className="absolute -top-1 -right-2 w-2 h-2 bg-[#10b981] rounded-full animate-pulse" />
                    </h1>
                </div>

                {/* Main Card - Enhanced Glassmorphism (More transparent & blurrier) */}
                <div className="w-full bg-white/5 backdrop-blur-3xl rounded-[2.5rem] shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)] p-8 border border-white/20 relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent pointer-events-none" />

                    <div className="text-center mb-8 relative z-10 text-white">
                        <h2 className="text-2xl font-[900] italic tracking-tight drop-shadow-sm">Bienvenue !</h2>
                    </div>

                    <button
                        type="button"
                        onClick={handleGoogleLogin}
                        disabled={isLoading}
                        className="w-full h-12 bg-white flex items-center justify-center gap-3 rounded-xl transition-all mb-8 shadow-lg active:scale-[0.98] hover:bg-slate-50"
                    >
                        <svg className="w-5 h-5" viewBox="0 0 24 24">
                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                        </svg>
                        <span className="text-slate-900 font-bold text-sm">Continuer avec Google</span>
                    </button>

                    <div className="relative mb-8">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t border-white/10" />
                        </div>
                        <div className="relative flex justify-center text-[10px] uppercase font-black tracking-widest text-white/30">
                            <span className="bg-transparent px-3">Ou email</span>
                        </div>
                    </div>

                    <div className="flex bg-white/5 p-1 rounded-xl mb-8 border border-white/5">
                        <button
                            onClick={() => setMode("login")}
                            className={cn(
                                "flex-1 h-10 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all",
                                mode === "login"
                                    ? "bg-[#6366f1] text-white shadow-lg"
                                    : "text-white/40 hover:text-white"
                            )}
                        >
                            Connexion
                        </button>
                        <button
                            onClick={() => setMode("register")}
                            className={cn(
                                "flex-1 h-10 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all",
                                mode === "register"
                                    ? "bg-[#6366f1] text-white shadow-lg"
                                    : "text-white/40 hover:text-white"
                            )}
                        >
                            Inscription
                        </button>
                    </div>

                    <form onSubmit={handleEmailAuth} className="space-y-4">
                        {mode === "register" && (
                            <div className="space-y-1">
                                <label className="text-[10px] font-black uppercase tracking-widest text-white/50 ml-1">Nom complet</label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="Votre nom"
                                    className="w-full h-11 px-4 bg-white/5 border border-white/10 rounded-xl text-white text-xs font-bold focus:outline-none focus:ring-2 focus:ring-[#6366f1]/50 transition-all placeholder:text-white/20"
                                    required={mode === "register"}
                                />
                            </div>
                        )}
                        <div className="space-y-1">
                            <label className="text-[10px] font-black uppercase tracking-widest text-white/50 ml-1">Email</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Email"
                                className="w-full h-11 px-4 bg-white/5 border border-white/10 rounded-xl text-white text-xs font-bold focus:outline-none focus:ring-2 focus:ring-[#6366f1]/50 transition-all placeholder:text-white/20"
                                required
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] font-black uppercase tracking-widest text-white/50 ml-1">Mot de passe</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Mot de passe"
                                className="w-full h-11 px-4 bg-white/5 border border-white/10 rounded-xl text-white text-xs font-bold focus:outline-none focus:ring-2 focus:ring-[#6366f1]/50 transition-all placeholder:text-white/20"
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full py-4 mt-4 bg-[#6366f1] text-white font-black rounded-2xl shadow-xl shadow-indigo-500/20 hover:shadow-indigo-500/40 hover:-translate-y-0.5 active:translate-y-0 transition-all text-[11px] tracking-[0.2em] uppercase"
                        >
                            {isLoading ? "Chargement..." : mode === "register" ? "S'inscrire" : "Connexion"}
                        </button>

                        <div className="text-center pt-2">
                            <button
                                type="button"
                                onClick={() => router.push("/forgot-password")}
                                className="text-[10px] font-black uppercase text-white/40 tracking-widest hover:text-white transition-colors underline underline-offset-4"
                            >
                                Mot de passe oublié ?
                            </button>
                        </div>
                    </form>
                </div>

                <div className="text-center mt-6">
                    <button
                        onClick={() => router.push("/")}
                        className="text-[9px] font-black uppercase text-white/40 hover:text-white transition-colors tracking-[0.2em]"
                    >
                        Continuer en mode visiteur →
                    </button>
                </div>
            </div>
        </main>
    );
}
