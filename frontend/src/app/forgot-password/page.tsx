"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Mail } from "lucide-react";
import { auth } from "@/services/firebase";
import { sendPasswordResetEmail } from "firebase/auth";

export default function ForgotPasswordPage() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isSent, setIsSent] = useState(false);

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            await sendPasswordResetEmail(auth, email);
            setIsSent(true);
        } catch (error: any) {
            console.error("Reset error:", error);
            let message = "Une erreur est survenue.";
            if (error.code === "auth/user-not-found") message = "Aucun utilisateur trouvé avec cet email.";
            if (error.code === "auth/invalid-email") message = "Email invalide.";
            alert(message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <main className="h-screen w-full flex flex-col items-center justify-center p-4 bg-slate-900 relative overflow-hidden font-sans">
            {/* Cinematic Background Image */}
            <div className="absolute inset-0 z-0">
                <img
                    src="/login-bg.png"
                    alt="Background"
                    className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-slate-950/40" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-slate-950/40" />
            </div>

            <div className="w-full max-w-sm flex flex-col items-center relative z-10 animate-in fade-in zoom-in duration-500">

                {/* Back Button */}
                <button
                    onClick={() => router.back()}
                    className="absolute -top-12 left-0 flex items-center gap-2 text-white/60 hover:text-white transition-colors text-xs font-bold uppercase tracking-widest"
                >
                    <ArrowLeft size={16} />
                    Retour
                </button>

                {/* Header Logo Section */}
                <div className="flex flex-col items-center text-center mb-6 relative scale-90">
                    <div className="w-16 h-16 mb-4 relative drop-shadow-2xl">
                        <div className="absolute inset-0 bg-white/10 backdrop-blur-xl rounded-[1.2rem] border border-white/20" />
                        <div className="relative w-full h-full bg-white rounded-[1.1rem] p-2.5 flex items-center justify-center z-10">
                            <img src="/logo.png" alt="PharmaBF Logo" className="w-full h-full object-contain" />
                        </div>
                    </div>
                </div>

                {/* Glassmorphism Card (for Reset) */}
                <div className="w-full bg-white/5 backdrop-blur-3xl rounded-[2.5rem] shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)] p-8 border border-white/10 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent pointer-events-none" />

                    {!isSent ? (
                        <>
                            <div className="text-center mb-8 relative z-10 text-white">
                                <h2 className="text-2xl font-[900] italic tracking-tight mb-2">Mot de passe ?</h2>
                                <p className="text-white/50 text-xs font-medium px-4">Entrez votre email pour recevoir un lien de réinitialisation.</p>
                            </div>

                            <form onSubmit={handleResetPassword} className="space-y-6 relative z-10">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-white/50 ml-1">Email</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                            <Mail className="h-4 w-4 text-white/30" />
                                        </div>
                                        <input
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            placeholder="Email"
                                            className="w-full h-12 pl-11 pr-4 bg-white/5 border border-white/10 rounded-xl text-white text-sm font-bold focus:outline-none focus:ring-2 focus:ring-[#6366f1]/50 transition-all"
                                            required
                                        />
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full py-4 bg-[#6366f1] text-white font-black rounded-2xl shadow-xl shadow-indigo-500/20 hover:shadow-indigo-500/40 hover:-translate-y-0.5 active:translate-y-0 transition-all text-[11px] tracking-[0.2em] uppercase"
                                >
                                    {isLoading ? "Envoi..." : "ENVOYER LE LIEN"}
                                </button>
                            </form>
                        </>
                    ) : (
                        <div className="text-center py-6 relative z-10">
                            <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6 border border-green-500/30">
                                <Mail className="text-green-400" size={32} />
                            </div>
                            <h2 className="text-xl font-[900] text-white mb-4">Email Envoyé !</h2>
                            <p className="text-white/60 text-sm mb-8">Consultez votre boîte de réception pour réinitialiser votre mot de passe.</p>
                            <button
                                onClick={() => router.push("/login")}
                                className="w-full py-4 bg-white/10 hover:bg-white/20 text-white font-black rounded-2xl border border-white/10 transition-all text-[11px] tracking-[0.2em]"
                            >
                                RETOUR À LA CONNEXION
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </main>
    );
}
