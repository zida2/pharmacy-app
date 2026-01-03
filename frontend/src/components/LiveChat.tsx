"use client";

import React, { useState } from "react";
import { MessageCircle, X, Send, Phone, User, Check } from "lucide-react";
import { cn } from "@/lib/utils";

export default function LiveChat() {
    const [isOpen, setIsOpen] = useState(false);
    const [message, setMessage] = useState("");
    const [chat, setChat] = useState<{ text: string, isUser: boolean }[]>([
        { text: "Bonjour ! Je suis le Dr. Koné, pharmacien de garde. Comment puis-je vous aider ?", isUser: false }
    ]);

    const handleSend = () => {
        if (!message.trim()) return;
        setChat([...chat, { text: message, isUser: true }]);
        setMessage("");

        // Simulate response
        setTimeout(() => {
            setChat(prev => [...prev, { text: "Je vérifie cela pour vous tout de suite. Voulez-vous une alternative générique ?", isUser: false }]);
        }, 1500);
    };

    return (
        <div className="fixed bottom-24 right-6 z-50 flex flex-col items-end gap-4 pointer-events-none">

            {/* Chat Window */}
            {isOpen && (
                <div className="w-80 h-96 glass-card rounded-[2rem] border-primary/20 shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-10 pointer-events-auto">
                    {/* Header */}
                    <div className="bg-primary p-4 text-white flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="relative">
                                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                                    <User size={20} />
                                </div>
                                <div className="absolute -bottom-1 -right-1 bg-green-500 w-3 h-3 rounded-full border-2 border-primary" />
                            </div>
                            <div>
                                <div className="font-bold text-sm">Dr. Koné</div>
                                <div className="text-[10px] font-medium opacity-80 uppercase tracking-widest">Pharmacien Conseil</div>
                            </div>
                        </div>
                        <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-white/10 rounded-xl">
                            <X size={20} />
                        </button>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-secondary/30 dark:bg-zinc-900/50">
                        {chat.map((msg, i) => (
                            <div key={i} className={cn(
                                "max-w-[80%] p-3 rounded-2xl text-sm font-medium",
                                msg.isUser
                                    ? "ml-auto bg-primary text-white rounded-tr-none shadow-lg"
                                    : "bg-card dark:bg-zinc-800 text-foreground shadow-sm border border-border rounded-tl-none"
                            )}>
                                {msg.text}
                            </div>
                        ))}
                    </div>

                    {/* Input */}
                    <div className="p-3 bg-card dark:bg-zinc-900 border-t border-border flex gap-2">
                        <input
                            type="text"
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                            placeholder="Écrivez ici..."
                            className="flex-1 bg-secondary dark:bg-zinc-800 text-foreground border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 outline-none placeholder:text-muted-foreground"
                        />
                        <button
                            onClick={handleSend}
                            className="p-3 bg-primary text-white rounded-xl shadow-lg ring-4 ring-primary/10 hover:brightness-110 transition-all active:scale-95"
                        >
                            <Send size={18} />
                        </button>
                    </div>
                </div>
            )}

            {/* Floating Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={cn(
                    "w-16 h-16 rounded-full shadow-2xl flex items-center justify-center transition-all active:scale-90 pointer-events-auto",
                    isOpen ? "bg-white text-primary scale-90" : "bg-primary text-white hover:scale-110"
                )}
            >
                {isOpen ? <X size={32} /> : <MessageCircle size={32} />}
                {!isOpen && (
                    <div className="absolute top-0 right-0 w-5 h-5 bg-red-500 rounded-full border-2 border-white flex items-center justify-center text-[10px] font-bold text-white">
                        1
                    </div>
                )}
            </button>
        </div>
    );
}
