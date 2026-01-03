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
        <main className="min-h-screen bg-background flex flex-col items-center justify-center p-6 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-fixed">
            <div className="w-full max-w-sm space-y-8 animate-in fade-in zoom-in duration-500">

                {/* Logo & Intro */}
                <div className="flex flex-col items-center text-center gap-2">
                    <div className="w-32 h-32 mb-4 relative">
                        <img
                            src="/logo.png"
                            alt="PharmaBF Logo"
                            className="w-full h-full object-contain drop-shadow-2xl"
                        />
                    </div>
                    <h1 className="text-4xl font-black italic tracking-tighter text-foreground">PharmaBF</h1>
                    <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest opacity-60">La santé connectée du Burkina Faso</p>
                </div>

                {/* Card */}
                <div className="glass-card p-8 rounded-[3rem] border-primary/20 shadow-2xl space-y-8">

                    {/* Main Content */}
                    <div className="space-y-6">
                        <div className="space-y-2 text-center">
                            <h2 className="text-2xl font-black italic">Bienvenue !</h2>
                            <p className="text-xs text-muted-foreground font-medium italic">
                                Connectez-vous pour accéder à vos ordonnances et vos points santé.
                            </p>
                        </div>

                        {/* Google Login - PRIMARY */}
                        <button
                            type="button"
                            onClick={handleGoogleLogin}
                            disabled={isLoading}
                            className="w-full py-4 bg-card dark:bg-zinc-800 text-foreground font-bold rounded-2xl border-2 border-border hover:bg-secondary dark:hover:bg-zinc-700 active:scale-[0.98] transition-all disabled:opacity-50 text-base flex items-center justify-center gap-3 relative overflow-hidden group shadow-lg"
                        >
                            <svg className="w-6 h-6" viewBox="0 0 24 24">
                                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                            </svg>
                            <span>Continuer avec Google</span>
                        </button>

                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <span className="w-full border-t border-muted-foreground/20" />
                            </div>
                            <div className="relative flex justify-center text-[10px] uppercase">
                                <span className="bg-background px-2 text-muted-foreground font-black tracking-widest">Ou via téléphone</span>
                            </div>
                        </div>

                        {/* Login/Register Toggle */}
                        <div className="flex bg-secondary/50 p-1 rounded-2xl border border-white/10">
                            <button
                                onClick={() => setMode("login")}
                                className={cn("flex-1 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all", mode === "login" ? "bg-primary text-white shadow-sm" : "text-muted-foreground")}
                            >
                                Connexion
                            </button>
                            <button
                                onClick={() => setMode("register")}
                                className={cn("flex-1 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all", mode === "register" ? "bg-primary text-white shadow-sm" : "text-muted-foreground")}
                            >
                                Inscription
                            </button>
                        </div>

                        {/* Email Auth Section */}
                        <div className="space-y-4 pt-2">
                            <form onSubmit={handleEmailAuth} className="space-y-4">
                                {mode === "register" && (
                                    <div className="animate-in slide-in-from-top-2 duration-300">
                                        <input
                                            type="text"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            placeholder="Votre nom complet"
                                            className="w-full p-4 bg-secondary/50 rounded-xl border-2 border-transparent focus:border-primary/30 focus:outline-none transition-all font-bold text-sm"
                                            required={mode === "register"}
                                        />
                                    </div>
                                )}
                                <div className="space-y-3">
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="Email"
                                        className="w-full p-4 bg-secondary/50 rounded-xl border-2 border-transparent focus:border-primary/30 focus:outline-none transition-all font-bold text-sm"
                                        required
                                    />
                                    <input
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="Mot de passe"
                                        className="w-full p-4 bg-secondary/50 rounded-xl border-2 border-transparent focus:border-primary/30 focus:outline-none transition-all font-bold text-sm"
                                        required
                                    />
                                </div>
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full py-4 bg-primary text-white font-black rounded-xl hover:brightness-110 shadow-lg shadow-primary/20 transition-all text-sm tracking-widest uppercase"
                                >
                                    {isLoading ? "Action en cours..." : mode === "register" ? "Créer mon compte" : "Se Connecter"}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>

                {/* Footer link */}
                <div className="text-center animate-in fade-in slide-in-from-bottom-2 duration-1000 delay-500">
                    <button
                        onClick={() => router.push("/")}
                        className="text-[10px] font-black uppercase text-muted-foreground/60 hover:text-foreground transition-colors tracking-[0.2em]"
                    >
                        Continuer en mode visiteur →
                    </button>
                </div>
            </div>
        </main>
    );
}
