"use client";

import React, { useState } from "react";
import { X, ChevronRight, Clock, Users, Bell, BellOff } from "lucide-react";
import { firebaseService } from "@/services/firebaseService";
import { cn } from "@/lib/utils";

interface ReminderModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: () => void;
}

export default function ReminderModal({ isOpen, onClose, onSave }: ReminderModalProps) {
    const [reminders, setReminders] = useState([
        { type: "petit-dejeuner", time: "07:00", enabled: true, label: "Petit-déjeuner" },
        { type: "dejeuner", time: "13:00", enabled: true, label: "Déjeuner" },
        { type: "diner", time: "19:00", enabled: true, label: "Dîner" },
        { type: "collation", time: "16:00", enabled: false, label: "Collation" }
    ]);

    const [selectedDays, setSelectedDays] = useState<number[]>([1, 2, 3, 4, 5]); // Lun-Ven par défaut

    const days = [
        { id: 0, label: "Dim" },
        { id: 1, label: "Lun" },
        { id: 2, label: "Mar" },
        { id: 3, label: "Mer" },
        { id: 4, label: "Jeu" },
        { id: 5, label: "Ven" },
        { id: 6, label: "Sam" }
    ];

    const toggleDay = (dayId: number) => {
        setSelectedDays(prev =>
            prev.includes(dayId) ? prev.filter(d => d !== dayId) : [...prev, dayId]
        );
    };

    const toggleReminder = (index: number) => {
        setReminders(prev =>
            prev.map((r, i) => (i === index ? { ...r, enabled: !r.enabled } : r))
        );
    };

    const updateTime = (index: number, time: string) => {
        setReminders(prev =>
            prev.map((r, i) => (i === index ? { ...r, time } : r))
        );
    };

    const handleSave = async () => {
        try {
            // Delete existing reminders first
            const existing = await firebaseService.getMealReminders();
            await Promise.all(existing.map(r => firebaseService.deleteMealReminder(r.id)));

            // Create new reminders
            for (const reminder of reminders) {
                if (reminder.enabled) {
                    await firebaseService.createMealReminder({
                        mealType: reminder.type,
                        time: reminder.time,
                        enabled: true,
                        days: selectedDays
                    });
                }
            }

            onSave();
            onClose();
        } catch (error) {
            console.error("Error saving reminders:", error);
            alert("Erreur lors de la sauvegarde des rappels");
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
            <div className="bg-background w-full max-w-md rounded-3xl p-6 shadow-2xl animate-in slide-in-from-bottom-10">
                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h2 className="text-2xl font-black">Rappels Repas</h2>
                        <p className="text-sm text-muted-foreground">Configurez vos notifications</p>
                    </div>
                    <button onClick={onClose} className="p-2 bg-secondary rounded-full hover:bg-accent">
                        <X size={20} />
                    </button>
                </div>

                {/* Days Selection */}
                <div className="mb-6">
                    <label className="block text-sm font-bold mb-3">Jours actifs</label>
                    <div className="flex gap-2">
                        {days.map(day => (
                            <button
                                key={day.id}
                                onClick={() => toggleDay(day.id)}
                                className={cn(
                                    "flex-1 py-2 rounded-xl text-xs font-bold transition-all",
                                    selectedDays.includes(day.id)
                                        ? "bg-primary text-white"
                                        : "bg-secondary text-muted-foreground"
                                )}
                            >
                                {day.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Reminders List */}
                <div className="space-y-3 mb-6">
                    {reminders.map((reminder, index) => (
                        <div
                            key={index}
                            className={cn(
                                "p-4 rounded-2xl border transition-all",
                                reminder.enabled
                                    ? "bg-primary/5 border-primary/20"
                                    : "bg-secondary border-border"
                            )}
                        >
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-3">
                                    <div className={cn(
                                        "w-10 h-10 rounded-xl flex items-center justify-center",
                                        reminder.enabled ? "bg-primary/10 text-primary" : "bg-secondary text-muted-foreground"
                                    )}>
                                        {reminder.enabled ? <Bell size={20} /> : <BellOff size={20} />}
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold">{reminder.label}</p>
                                        <p className="text-xs text-muted-foreground">
                                            {reminder.enabled ? "Activé" : "Désactivé"}
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => toggleReminder(index)}
                                    className={cn(
                                        "w-12 h-6 rounded-full transition-all relative",
                                        reminder.enabled ? "bg-primary" : "bg-border"
                                    )}
                                >
                                    <div
                                        className={cn(
                                            "absolute top-1 w-4 h-4 bg-white rounded-full transition-all",
                                            reminder.enabled ? "right-1" : "left-1"
                                        )}
                                    />
                                </button>
                            </div>

                            {reminder.enabled && (
                                <div className="flex items-center gap-2">
                                    <Clock size={16} className="text-muted-foreground" />
                                    <input
                                        type="time"
                                        value={reminder.time}
                                        onChange={(e) => updateTime(index, e.target.value)}
                                        className="flex-1 input-standard py-2"
                                    />
                                </div>
                            )}
                        </div>
                    ))}
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
                        className="flex-1 btn btn-primary py-3"
                    >
                        Enregistrer
                    </button>
                </div>
            </div>
        </div>
    );
}
