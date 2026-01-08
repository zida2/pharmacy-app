"use client";

import React, { useState, useEffect, useRef, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
    Send,
    Image as ImageIcon,
    FileText,
    ArrowLeft,
    MoreVertical,
    CheckCircle2,
    ShieldCheck,
    Clock,
    Paperclip
} from "lucide-react";
import { firebaseService } from "@/services/firebaseService";
import { Consultation, ChatMessage } from "@/services/types";
import { auth, db } from "@/services/firebase";
import { collection, query, where, orderBy, onSnapshot, doc, getDoc } from "firebase/firestore";
import { cn } from "@/lib/utils";

function ChatContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const consultationId = searchParams.get("id");

    const [consultation, setConsultation] = useState<Consultation | null>(null);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [newMessage, setNewMessage] = useState("");
    const [loading, setLoading] = useState(true);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!consultationId) return;

        // Fetch Consultation Details
        const fetchDetails = async () => {
            const data = await firebaseService.getOrderById(consultationId); // Reusing getOrderById if it works for any doc, or use new one
            // Better to use dedicated function
            const docRef = doc(db, "consultations", consultationId);
            const d = await getDoc(docRef);
            if (d.exists()) {
                setConsultation({ id: d.id, ...d.data() } as Consultation);
            }
        };
        fetchDetails();

        // Real-time Messages
        const q = query(
            collection(db, "messages"),
            where("consultationId", "==", consultationId),
            orderBy("createdAt", "asc")
        );

        const unsubscribe = onSnapshot(q, (snap: any) => {
            const msgs = snap.docs.map((d: any) => ({ id: d.id, ...d.data() } as ChatMessage));
            setMessages(msgs);
            setLoading(false);

            // Auto scroll to bottom
            setTimeout(() => {
                scrollRef.current?.scrollIntoView({ behavior: "smooth" });
            }, 100);
        });

        return () => unsubscribe();
    }, [consultationId]);

    const handleSendMessage = async (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!newMessage.trim() || !consultationId) return;

        const text = newMessage;
        setNewMessage(""); // Clear input

        try {
            await firebaseService.sendChatMessage(consultationId, text);
        } catch (error) {
            console.error("Failed to send message", error);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="flex flex-col h-screen bg-background">
            {/* Header */}
            <header className="p-4 border-b bg-card/80 backdrop-blur-md sticky top-0 z-50 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <button onClick={() => router.back()} className="p-2 hover:bg-secondary rounded-full">
                        <ArrowLeft size={20} />
                    </button>
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary relative">
                            <ShieldCheck size={20} />
                            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-background rounded-full" />
                        </div>
                        <div>
                            <h2 className="font-black text-sm text-foreground">Pharmacien Conseil</h2>
                            <div className="flex items-center gap-1 text-[10px] text-green-500 font-bold uppercase tracking-wider">
                                <CheckCircle2 size={10} />
                                En ligne
                            </div>
                        </div>
                    </div>
                </div>
                <button className="p-2 hover:bg-secondary rounded-full">
                    <MoreVertical size={20} className="text-muted-foreground" />
                </button>
            </header>

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {/* Intro Message */}
                <div className="flex flex-col items-center py-8 text-center space-y-2 opacity-60">
                    <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mb-2">
                        <Clock size={24} />
                    </div>
                    <p className="text-xs font-bold text-foreground">Début de consultation sécurisée</p>
                    <p className="text-[10px] max-w-[200px] leading-relaxed">
                        Vos échanges sont cryptés et réservés à l'usage médical. <br />
                        Date : {new Date().toLocaleDateString()}
                    </p>
                </div>

                {messages.map((msg) => {
                    const isSystem = msg.senderRole === "pharmacist";
                    return (
                        <div
                            key={msg.id}
                            className={cn(
                                "flex flex-col max-w-[85%] animate-in fade-in slide-in-from-bottom-1 duration-300",
                                isSystem ? "self-start" : "self-end items-end"
                            )}
                        >
                            <div className={cn(
                                "p-4 rounded-[2rem] text-sm font-medium shadow-sm",
                                isSystem
                                    ? "bg-secondary text-foreground rounded-tl-none"
                                    : "bg-primary text-white rounded-tr-none shadow-primary/20"
                            )}>
                                {msg.text}
                            </div>
                            <span className="text-[9px] text-muted-foreground mt-1 px-2">
                                {new Date(msg.createdAt?.seconds * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                        </div>
                    );
                })}
                <div ref={scrollRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 bg-card border-t mb-2">
                <form
                    onSubmit={handleSendMessage}
                    className="flex bg-secondary/50 rounded-[2rem] p-1.5 pl-4 items-center gap-2 border border-border focus-within:border-primary transition-all shadow-sm"
                >
                    <button type="button" className="p-2 text-muted-foreground hover:text-primary transition-colors">
                        <Paperclip size={20} />
                    </button>
                    <input
                        type="text"
                        placeholder="Expliquez votre symptôme..."
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        className="flex-1 bg-transparent border-none focus:ring-0 text-sm py-2 font-medium"
                    />
                    <button
                        type="submit"
                        disabled={!newMessage.trim()}
                        className={cn(
                            "w-10 h-10 rounded-full flex items-center justify-center transition-all",
                            newMessage.trim() ? "bg-primary text-white shadow-lg active:scale-90" : "bg-transparent text-muted-foreground"
                        )}
                    >
                        <Send size={18} fill={newMessage.trim() ? "currentColor" : "none"} />
                    </button>
                </form>
                <p className="text-[9px] text-center mt-3 text-muted-foreground font-medium uppercase tracking-tight opacity-50">
                    Propulsé par la plateforme de Santé Burkina
                </p>
            </div>
        </div>
    );
}

export default function ConsultationChatPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
            </div>
        }>
            <ChatContent />
        </Suspense>
    );
}
