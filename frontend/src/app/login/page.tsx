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
        <main className="h-screen w-full flex flex-col items-center justify-center p-4 bg-slate-900 relative overflow-hidden font-sans">
            {/* Cinematic Background Image - Sharp and Clear */}
            <div className="absolute inset-0 z-0">
                <img
                    src="/login-bg.png"
                    alt="Background"
                    className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-slate-950/30" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-slate-950/40" />
            </div>

            <div className="w-full max-w-sm flex flex-col items-center relative z-10 animate-in fade-in zoom-in duration-500 overflow-hidden">

                {/* Header Logo Section - Compacted */}
                <div className="flex flex-col items-center text-center mb-4 relative scale-90">
                    <div className="absolute inset-0 bg-gradient-to-b from-[#6366f1]/20 to-transparent blur-3xl -z-10 rounded-full w-24 h-24 mx-auto" />

                    <div className="w-16 h-16 mb-2 relative drop-shadow-2xl">
                        <div className="absolute inset-0 bg-white/10 backdrop-blur-xl rounded-[1.2rem] border border-white/20 rotate-3" />
                        <div className="relative w-full h-full bg-white rounded-[1.1rem] p-2.5 flex items-center justify-center z-10 border border-white/50 shadow-xl">
                            <img
                                src="/logo.png"
                                alt="PharmaBF Logo"
                                className="w-full h-full object-contain"
                            />
                        </div>
                    </div>

                    <h1 className="text-2xl font-[900] italic tracking-tighter text-white mb-0 drop-shadow-md">
                        Pharma<span className="text-[#6366f1]">BF</span>
                        <span className="absolute -top-1 -right-2 w-1.5 h-1.5 bg-[#10b981] rounded-full animate-pulse" />
                    </h1>
                </div>

                {/* Login Elements - Compacted "Wet Glass" Redesign */}
                <div className="w-full relative z-10 py-4 px-6 flex flex-col items-center">

                    {/* Simulated Droplets (Subtle) */}
                    <div className="absolute inset-0 z-0 pointer-events-none opacity-30"
                        style={{
                            backgroundImage: `radial-gradient(circle at 1.5px 1.5px, rgba(255,255,255,0.7) 1px, transparent 0)`,
                            backgroundSize: '24px 24px'
                        }}>
                    </div>

                    <div className="text-center mb-4 relative z-10">
                        <h2 className="text-xl font-[900] italic text-white tracking-tight drop-shadow-md">
                            Bienvenue !
                        </h2>
                    </div>

                    {/* Google Button - Compact */}
                    <button
                        type="button"
                        onClick={handleGoogleLogin}
                        disabled={isLoading}
                        className="w-full h-11 bg-white shadow-xl flex items-center justify-center gap-3 rounded-xl transition-all mb-4 active:scale-[0.98] group/btn"
                    >
                        <svg className="w-5 h-5" viewBox="0 0 24 24">
                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                        </svg>
                        <span className="text-slate-900 font-extrabold text-sm">Continuer avec Google</span>
                    </button>

                    <div className="relative mb-4 w-full">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t border-white/10" />
                        </div>
                        <div className="relative flex justify-center text-[8px] uppercase font-black tracking-widest text-white/50">
                            <span className="bg-transparent px-3">Ou email</span>
                        </div>
                    </div>

                    {/* Tabs - Compact */}
                    <div className="flex bg-white/5 backdrop-blur-md p-1 rounded-xl mb-4 border border-white/10 w-full">
                        <button
                            onClick={() => setMode("login")}
                            className={cn(
                                "flex-1 h-9 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all",
                                mode === "login"
                                    ? "bg-white text-slate-900 shadow-lg"
                                    : "text-white/40 hover:text-white"
                            )}
                        >
                            Connexion
                        </button>
                        <button
                            onClick={() => setMode("register")}
                            className={cn(
                                "flex-1 h-9 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all",
                                mode === "register"
                                    ? "bg-white text-slate-900 shadow-lg"
                                    : "text-white/40 hover:text-white"
                            )}
                        >
                            Inscription
                        </button>
                    </div>

                    <form onSubmit={handleEmailAuth} className="space-y-3 w-full relative z-10">
                        {mode === "register" && (
                            <div className="space-y-0.5">
                                <label className="text-[9px] font-black uppercase tracking-widest text-white/70 ml-1">Nom</label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="Votre nom"
                                    className="w-full h-10 px-4 bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl text-white text-xs font-bold focus:outline-none focus:ring-1 focus:ring-white/50 placeholder:text-white/20"
                                    required={mode === "register"}
                                />
                            </div>
                        )}
                        <div className="space-y-0.5">
                            <label className="text-[9px] font-black uppercase tracking-widest text-white/70 ml-1">Email</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="votre@email.com"
                                className="w-full h-10 px-4 bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl text-white text-xs font-bold focus:outline-none focus:ring-1 focus:ring-white/50 placeholder:text-white/20"
                                required
                            />
                        </div>
                        <div className="space-y-0.5">
                            <label className="text-[9px] font-black uppercase tracking-widest text-white/70 ml-1">Pass</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                className="w-full h-10 px-4 bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl text-white text-xs font-bold focus:outline-none focus:ring-1 focus:ring-white/50 placeholder:text-white/20"
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-[#6366f1] hover:bg-[#4f46e5] text-white font-[900] italic h-12 rounded-xl shadow-xl shadow-indigo-500/30 transition-all active:scale-[0.98] mt-2 disabled:opacity-50 flex items-center justify-center gap-2 text-xs"
                        >
                            {isLoading ? (
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : mode === "register" ? "S'INSCRIRE" : "SE CONNECTER"}
                        </button>

                        <div className="text-center mt-2">
                            <button
                                type="button"
                                onClick={() => router.push("/forgot-password")}
                                className="text-[9px] font-black uppercase text-white/60 tracking-widest hover:text-white transition-colors"
                            >
                                Pass oublié ?
                            </button>
                        </div>
                    </form>
                </div>

                <div className="text-center mt-4">
                    <button
                        onClick={() => router.push("/")}
                        className="text-[8px] font-black uppercase text-white/30 hover:text-white transition-colors tracking-widest"
                    >
                        Visiteur →
                    </button>
                </div>
            </div>
        </main>
    );
}
