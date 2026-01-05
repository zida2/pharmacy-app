"use client";

import React, { useState, useEffect, useRef } from "react";
import { MessageCircle, X, Send, Phone, User, Check, Bot, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface Message {
    text: string;
    isUser: boolean;
    timestamp: Date;
    typing?: boolean;
}

export default function LiveChat() {
    const [isOpen, setIsOpen] = useState(false);
    const [message, setMessage] = useState("");
    const [chat, setChat] = useState<Message[]>([
        {
            text: "Bonjour ! 👋 Je suis Pharmy, votre compagnon santé. \n\nIci, la recherche de médicaments est **100% GRATUITE**. \n\nComment puis-je vous aider aujourd'hui ?",
            isUser: false,
            timestamp: new Date()
        }
    ]);
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to bottom
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [chat, isTyping]);

    // Intelligent response system
    const getIntelligentResponse = (userMessage: string): string => {
        const msg = userMessage.toLowerCase().trim();

        // Greetings
        if (/^(bonjour|salut|hello|hi|bonsoir|hey)/i.test(msg)) {
            return "Bonjour ! 😊 Je suis là pour vous aider avec vos questions sur les médicaments, les pharmacies de garde, ou toute autre question de santé. Comment puis-je vous assister ?";
        }

        // Pharmacy guard/emergency
        if (/(garde|urgence|nuit|dimanche|férié|ouvert maintenant)/i.test(msg)) {
            return "🚨 Pour trouver les pharmacies de garde les plus proches de vous :\n\n1. Activez votre géolocalisation\n2. Cliquez sur l'onglet 'Carte' en bas\n3. Les pharmacies de garde sont marquées en violet 🟣\n\nVoulez-vous que je vous redirige vers la carte ?";
        }

        // Medication search
        if (/(cherche|trouver|besoin|acheter|commander).*(médicament|médoc|traitement|pilule)/i.test(msg)) {
            return "🔍 Pour rechercher un médicament :\n\n1. Utilisez la barre de recherche sur la page d'accueil\n2. Tapez le nom du médicament ou scannez votre ordonnance 📸\n3. Je vous montrerai les pharmacies qui l'ont en stock avec les prix\n\nQuel médicament recherchez-vous ?";
        }

        // Price/cost questions
        if (/(prix|coût|combien|tarif|cher)/i.test(msg)) {
            return "💰 Les prix varient selon les pharmacies. Pour voir les meilleurs prix :\n\n1. Recherchez votre médicament\n2. Comparez les prix affichés\n3. Vous pouvez filtrer par proximité ou par prix\n\nVoulez-vous rechercher un médicament spécifique ?";
        }

        // Delivery questions
        if (/(livraison|livrer|domicile|envoyer)/i.test(msg)) {
            return "🚚 Oui, nous proposons la livraison à domicile !\n\n📍 Ajoutez votre adresse dans votre profil\n⏱️ Livraison en 30-60 minutes\n💳 Paiement à la livraison ou en ligne\n\nVoulez-vous passer une commande maintenant ?";
        }

        // Insurance/tiers-payant
        if (/(assurance|mutuelle|tiers.payant|cnss|inam|remboursement)/i.test(msg)) {
            return "🛡️ Nous acceptons plusieurs assurances :\n\n✅ CNSS\n✅ INAM\n✅ SONAR\n✅ UAB\n✅ Allianz\n\nPour activer le tiers-payant :\n1. Allez dans Profil > Assurances\n2. Ajoutez votre assurance\n3. Activez 'Tiers-Payant'\n\nVoulez-vous que je vous guide ?";
        }

        // Prescription/ordonnance
        if (/(ordonnance|prescription|docteur|médecin)/i.test(msg)) {
            return "📋 Pour utiliser votre ordonnance :\n\n1. Cliquez sur l'icône 📸 Scanner\n2. Prenez une photo de votre ordonnance\n3. Nous détecterons automatiquement les médicaments\n4. Choisissez votre pharmacie et commandez\n\nC'est rapide et sécurisé ! Voulez-vous essayer ?";
        }

        // Payment methods
        if (/(payer|paiement|orange.money|moov|mtn|mobile.money)/i.test(msg)) {
            return "💳 Moyens de paiement acceptés :\n\n📱 Orange Money\n📱 Moov Money\n📱 MTN Mobile Money\n💵 Espèces à la livraison\n\nVous pouvez enregistrer vos numéros dans Profil > Paiements pour aller plus vite !";
        }

        // Chronic treatment/subscription
        if (/(chronique|diabète|hypertension|abonnement|récurrent|tous les mois)/i.test(msg)) {
            return "💊 Pour les traitements chroniques, nous proposons des abonnements :\n\n✅ Livraison automatique mensuelle\n✅ Rappels de prise\n✅ -10% sur le prix\n✅ Priorité de livraison\n\nIntéressé ? Je peux vous aider à configurer votre abonnement.";
        }

        // Allergies/contraindications
        if (/(allergie|allergique|contre.indication|effet.secondaire)/i.test(msg)) {
            return "⚠️ Important ! Pour votre sécurité :\n\n1. Ajoutez vos allergies dans Profil > Profil Médical\n2. Nous vous alerterons automatiquement\n3. Consultez toujours un pharmacien ou médecin\n\n🚨 En cas d'urgence, appelez le 112 ou rendez-vous aux urgences.";
        }

        // Symptoms (basic triage)
        if (/(mal|douleur|fièvre|toux|grippe|rhume|maux de tête)/i.test(msg)) {
            return "🩺 Je comprends que vous ne vous sentez pas bien. Voici quelques conseils :\n\n⚠️ **Important** : Je ne peux pas poser de diagnostic. Pour des symptômes graves ou persistants, consultez un médecin.\n\nPour des symptômes légers :\n1. Recherchez des médicaments en vente libre\n2. Suivez les conseils d'un pharmacien\n3. Reposez-vous et hydratez-vous\n\nVoulez-vous que je vous aide à trouver une pharmacie ou un médicament ?";
        }

        // Help/assistance
        if (/(aide|aider|comment|problème|bug|marche pas)/i.test(msg)) {
            return "🆘 Je suis là pour vous aider ! Voici ce que je peux faire :\n\n🔍 Rechercher des médicaments\n📍 Trouver des pharmacies de garde\n🚚 Commander avec livraison\n💊 Gérer vos traitements chroniques\n🛡️ Configurer vos assurances\n📱 Assistance technique\n\nQue puis-je faire pour vous ?";
        }

        // Thanks
        if (/(merci|thank|remercie)/i.test(msg)) {
            return "De rien ! 😊 C'est un plaisir de vous aider. N'hésitez pas si vous avez d'autres questions. Bonne santé ! 🌟";
        }

        // Goodbye
        if (/(au revoir|bye|à plus|à bientôt|salut)/i.test(msg)) {
            return "Au revoir ! 👋 Prenez soin de vous. Je reste disponible 24h/24 si vous avez besoin. À bientôt ! 💚";
        }

        // Default response with suggestions
        return `Je ne suis pas sûr de comprendre votre question. 🤔\n\nJe peux vous aider avec :\n\n💊 Recherche de médicaments\n🏥 Pharmacies de garde\n🚚 Livraison à domicile\n🛡️ Assurances et tiers-payant\n📋 Scan d'ordonnances\n\nPouvez-vous reformuler votre question ?`;
    };

    const handleSend = () => {
        if (!message.trim()) return;

        // Add user message
        const userMsg: Message = {
            text: message,
            isUser: true,
            timestamp: new Date()
        };
        setChat(prev => [...prev, userMsg]);
        setMessage("");
        setIsTyping(true);

        // Simulate typing delay (realistic)
        const typingDelay = Math.min(1000 + message.length * 20, 3000);

        setTimeout(() => {
            const response = getIntelligentResponse(message);
            const botMsg: Message = {
                text: response,
                isUser: false,
                timestamp: new Date()
            };
            setChat(prev => [...prev, botMsg]);
            setIsTyping(false);
        }, typingDelay);
    };

    return (
        <div className="fixed bottom-36 right-4 z-[100] flex flex-col items-end gap-3 pointer-events-none">

            {/* Chat Window */}
            {isOpen && (
                <div className="w-[calc(100vw-2rem)] sm:w-80 h-[28rem] sm:h-[32rem] max-h-[70vh] glass-card rounded-[2rem] border-primary/20 shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-10 pointer-events-auto">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-primary to-primary/80 p-4 text-white flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="relative">
                                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                                    <Bot size={20} />
                                </div>
                                <div className="absolute -bottom-1 -right-1 bg-green-500 w-3 h-3 rounded-full border-2 border-primary animate-pulse" />
                            </div>
                            <div>
                                <div className="font-bold text-sm">Pharmy AI</div>
                                <div className="text-[10px] font-medium opacity-80 uppercase tracking-widest">Assistant Intelligent</div>
                            </div>
                        </div>
                        <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-white/10 rounded-xl transition-all active:scale-95">
                            <X size={20} />
                        </button>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-secondary/30 dark:bg-zinc-900/50">
                        {chat.map((msg, i) => (
                            <div key={i} className={cn(
                                "flex gap-2 animate-in fade-in slide-in-from-bottom-2",
                                msg.isUser ? "flex-row-reverse" : "flex-row"
                            )}>
                                {!msg.isUser && (
                                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                                        <Bot size={16} className="text-primary" />
                                    </div>
                                )}
                                <div className={cn(
                                    "max-w-[80%] p-3 rounded-2xl text-sm font-medium whitespace-pre-line",
                                    msg.isUser
                                        ? "bg-primary text-white rounded-tr-none shadow-lg"
                                        : "bg-card dark:bg-zinc-800 text-foreground shadow-sm border border-border rounded-tl-none"
                                )}>
                                    {msg.text}
                                    <div className={cn(
                                        "text-[9px] mt-1 opacity-50",
                                        msg.isUser ? "text-right" : "text-left"
                                    )}>
                                        {msg.timestamp.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                                    </div>
                                </div>
                            </div>
                        ))}
                        {isTyping && (
                            <div className="flex gap-2 animate-in fade-in">
                                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                                    <Bot size={16} className="text-primary" />
                                </div>
                                <div className="bg-card dark:bg-zinc-800 p-3 rounded-2xl rounded-tl-none border border-border">
                                    <div className="flex gap-1">
                                        <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                        <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                        <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                    </div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input */}
                    <div className="p-3 bg-card dark:bg-zinc-900 border-t border-border flex gap-2 items-center">
                        <input
                            type="text"
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                            placeholder="Écrivez votre question..."
                            className="input-standard flex-1 bg-secondary/50 dark:bg-zinc-800 border-none"
                            disabled={isTyping}
                        />
                        <button
                            onClick={handleSend}
                            disabled={!message.trim() || isTyping}
                            className="btn-icon bg-primary text-white shadow-lg shrink-0"
                        >
                            {isTyping ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                        </button>
                    </div>

                    {/* Quick Actions & WhatsApp */}
                    <div className="p-3 bg-secondary/30 dark:bg-zinc-900/30 border-t border-border/50">
                        <div className="flex gap-2 overflow-x-auto scrollbar-hide mb-2">
                            {[
                                { label: "Pharmacie de garde", icon: "🚨" },
                                { label: "Livraison", icon: "🚚" },
                                { label: "Assurance", icon: "🛡️" },
                                { label: "Scanner ordonnance", icon: "📸" }
                            ].map((action, i) => (
                                <button
                                    key={i}
                                    onClick={() => {
                                        setMessage(action.label);
                                        setTimeout(() => handleSend(), 100);
                                    }}
                                    className="px-3 py-1.5 bg-white dark:bg-zinc-800 border border-border rounded-full text-[10px] font-black whitespace-nowrap hover:bg-primary/5 transition-all active:scale-95 flex items-center gap-1 shadow-sm"
                                >
                                    <span>{action.icon}</span>
                                    {action.label}
                                </button>
                            ))}
                        </div>

                        <a
                            href="https://wa.me/22670000000" // Remplacez par votre numéro réel
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full flex items-center justify-center gap-2 py-2 bg-[#25D366] text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-xl active:scale-95 transition-all"
                        >
                            <Phone size={14} />
                            Urgence WhatsApp
                        </a>
                    </div>
                </div>
            )}

            {/* Floating Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={cn(
                    "w-16 h-16 rounded-full shadow-2xl flex items-center justify-center transition-all active:scale-90 pointer-events-auto relative",
                    isOpen ? "bg-card dark:bg-zinc-800 text-primary scale-90" : "bg-gradient-to-br from-primary to-primary/80 text-white hover:scale-110"
                )}
            >
                {isOpen ? <X size={32} /> : <Bot size={32} />}
                {!isOpen && (
                    <>
                        <div className="absolute top-0 right-0 w-5 h-5 bg-red-500 rounded-full border-2 border-white flex items-center justify-center text-[10px] font-bold text-white animate-pulse">
                            AI
                        </div>
                        <div className="absolute inset-0 rounded-full bg-primary animate-ping opacity-20" />
                    </>
                )}
            </button>
        </div>
    );
}
