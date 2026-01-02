"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { User, LogIn, X, LogIn as LoginIcon } from "lucide-react";

interface AuthPromptProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    message?: string;
}

export default function AuthPrompt({ isOpen, onClose, title = "Connexion Requise", message = "Vous devez être connecté pour effectuer cette action." }: AuthPromptProps) {
    const router = useRouter();

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
            <div className="glass-card w-full max-w-sm p-8 rounded-[2.5rem] border-primary/30 relative shadow-2xl animate-in zoom-in duration-300">
                <button
                    onClick={onClose}
                    className="absolute top-6 right-6 p-2 bg-secondary rounded-full hover:bg-secondary/80 transition-colors"
                >
                    <X size={20} className="text-foreground" />
                </button>

                <div className="flex flex-col items-center text-center">
                    <div className="w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center text-primary mb-6">
                        <User size={40} />
                    </div>

                    <h3 className="text-2xl font-black italic mb-3 text-foreground">{title}</h3>
                    <p className="text-sm text-muted-foreground font-medium mb-8 leading-relaxed">
                        {message}
                    </p>

                    <div className="flex flex-col gap-3 w-full">
                        <button
                            onClick={() => {
                                router.push("/login");
                                onClose();
                            }}
                            className="w-full py-5 bg-primary text-white rounded-2xl font-black shadow-xl shadow-primary/20 hover:brightness-110 transition active:scale-[0.98] flex items-center justify-center gap-3"
                        >
                            <LoginIcon size={20} />
                            SE CONNECTER
                        </button>
                        <button
                            onClick={onClose}
                            className="w-full py-4 bg-secondary text-foreground rounded-2xl font-bold hover:bg-secondary/80 transition active:scale-[0.98]"
                        >
                            Plus tard
                        </button>
                    </div>
                </div>

                <div className="mt-8 flex justify-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                    <div className="w-1.5 h-1.5 rounded-full bg-primary/30" />
                    <div className="w-1.5 h-1.5 rounded-full bg-primary/30" />
                </div>
            </div>
        </div>
    );
}
