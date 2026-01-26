"use client";

import React, { useState } from "react";
import { X, Star, MessageSquare } from "lucide-react";
import { firebaseService } from "@/services/firebaseService";
import { cn } from "@/lib/utils";

interface MealRatingModalProps {
    isOpen: boolean;
    onClose: () => void;
    meal: any;
    logId: string;
}

export default function MealRatingModal({ isOpen, onClose, meal, logId }: MealRatingModalProps) {
    const [rating, setRating] = useState<number>(0);
    const [notes, setNotes] = useState("");
    const [saving, setSaving] = useState(false);

    const handleSave = async () => {
        setSaving(true);
        try {
            await firebaseService.updateMealLog(logId, {
                rating,
                notes,
                eaten: true
            });
            onClose();
        } catch (error) {
            console.error("Error saving rating:", error);
            alert("Erreur lors de la sauvegarde");
        } finally {
            setSaving(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
            <div className="bg-background w-full max-w-md rounded-3xl p-6 shadow-2xl animate-in slide-in-from-bottom-10">
                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h2 className="text-xl font-black">Comment était ce repas ?</h2>
                        <p className="text-sm text-muted-foreground">{meal?.name}</p>
                    </div>
                    <button onClick={onClose} className="p-2 bg-secondary rounded-full hover:bg-accent">
                        <X size={20} />
                    </button>
                </div>

                {/* Meal Image */}
                <div className="flex justify-center mb-6">
                    <div className="text-6xl">{meal?.image || "🍽️"}</div>
                </div>

                {/* Rating */}
                <div className="mb-6">
                    <label className="block text-sm font-bold mb-3 text-center">Votre note</label>
                    <div className="flex justify-center gap-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <button
                                key={star}
                                onClick={() => setRating(star)}
                                className="transition-transform hover:scale-110 active:scale-95"
                            >
                                <Star
                                    size={40}
                                    className={cn(
                                        "transition-colors",
                                        star <= rating
                                            ? "fill-amber-400 text-amber-400"
                                            : "text-border"
                                    )}
                                />
                            </button>
                        ))}
                    </div>
                </div>

                {/* Notes */}
                <div className="mb-6">
                    <label className="block text-sm font-bold mb-2">
                        <MessageSquare size={16} className="inline mr-2" />
                        Notes (optionnel)
                    </label>
                    <textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Comment vous êtes-vous senti après ce repas ?"
                        className="input-standard min-h-[100px] resize-none"
                    />
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 btn btn-secondary py-3"
                    >
                        Annuler
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={saving || rating === 0}
                        className="flex-1 btn btn-primary py-3 disabled:opacity-50"
                    >
                        {saving ? "Enregistrement..." : "Valider"}
                    </button>
                </div>
            </div>
        </div>
    );
}
