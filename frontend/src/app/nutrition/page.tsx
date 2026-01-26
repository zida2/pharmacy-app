"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { auth } from "@/services/firebase";
import { firebaseService } from "@/services/firebaseService";
import { DietCondition } from "@/services/nutritionTypes";
import { generateWeeklyPlan } from "@/services/nutritionData";
import { nutritionTips } from "@/services/recipeData";
import {
    Apple, ChevronRight, Calendar, TrendingUp, Heart,
    Activity, Droplets, Flame, User, ArrowLeft,
    Utensils, Clock, Info, Bell, BookOpen, CheckCircle2,
    Circle, Sparkles, TrendingDown
} from "lucide-react";
import { cn } from "@/lib/utils";
import BottomNav from "@/components/BottomNav";
import RecipeModal from "@/components/nutrition/RecipeModal";
import ReminderModal from "@/components/nutrition/ReminderModal";
import MealRatingModal from "@/components/nutrition/MealRatingModal";

export default function NutritionPage() {
    const router = useRouter();
    const [user, setUser] = useState<any>(null);
    const [userProfile, setUserProfile] = useState<any>(null);
    const [selectedCondition, setSelectedCondition] = useState<DietCondition | null>(null);
    const [currentPlan, setCurrentPlan] = useState<any[]>([]);
    const [todayMeals, setTodayMeals] = useState<any>(null);
    const [step, setStep] = useState<"select" | "profile" | "plan">("select");
    const [loading, setLoading] = useState(true);

    // New states for tracking
    const [mealLogs, setMealLogs] = useState<any[]>([]);
    const [dailyCalories, setDailyCalories] = useState({ consumed: 0, target: 2000 });
    const [showRecipeModal, setShowRecipeModal] = useState(false);
    const [showReminderModal, setShowReminderModal] = useState(false);
    const [showRatingModal, setShowRatingModal] = useState(false);
    const [selectedMeal, setSelectedMeal] = useState<any>(null);
    const [selectedLogId, setSelectedLogId] = useState<string>("");

    // Form state for profile
    const [formData, setFormData] = useState({
        weight: "",
        height: "",
        age: "",
        gender: "homme" as "homme" | "femme",
        allergies: [] as string[],
        goal: ""
    });

    useEffect(() => {
        let mounted = true;

        // 🚀 FAST LOAD: Check Local Cache immediately
        const cached = localStorage.getItem("nutrition_profile");
        if (cached) {
            try {
                const p = JSON.parse(cached);
                if (p && p.condition) {
                    console.log("⚡ Loaded from cache");
                    setUserProfile(p);
                    setSelectedCondition(p.condition);

                    // Generate plan immediately from cache
                    const plan = generateWeeklyPlan(p.condition, new Date());
                    setCurrentPlan(plan);
                    const today = new Date().toISOString().split('T')[0];
                    setTodayMeals(plan.find(p => p.date === today));

                    setStep("plan");
                    setLoading(false); // Immediate display
                }
            } catch (e) {
                console.error("Cache parse error", e);
            }
        }

        // Fail-safe timeout
        const timeoutId = setTimeout(() => {
            if (mounted && loading) {
                setLoading(false);
            }
        }, 5000);

        const unsubscribe = auth.onAuthStateChanged(async (currentUser: any) => {
            try {
                if (currentUser) {
                    setUser(currentUser);
                    // Fetch fresh data in background
                    const profile = await firebaseService.getUserProfile(currentUser.uid).catch(() => null);

                    if (profile?.nutritionProfile) {
                        // Update cache
                        localStorage.setItem("nutrition_profile", JSON.stringify(profile.nutritionProfile));

                        // Update state if different (or just ensure consistency)
                        setUserProfile(profile.nutritionProfile);
                        setSelectedCondition(profile.nutritionProfile.condition);
                        try {
                            await loadPlan(profile.nutritionProfile.condition);
                            await loadTodayLogs();
                        } catch (err) {
                            console.error("Error loading plan details", err);
                        }
                        setStep("plan");
                    }
                } else {
                    router.push("/login");
                }
            } catch (error) {
                console.error("Error in auth/profile load:", error);
            } finally {
                if (mounted) setLoading(false);
                clearTimeout(timeoutId);
            }
        });

        return () => {
            mounted = false;
            unsubscribe();
            clearTimeout(timeoutId);
        };
    }, []);

    const loadPlan = async (condition: DietCondition) => {
        const plan = generateWeeklyPlan(condition, new Date());
        setCurrentPlan(plan);

        const today = new Date().toISOString().split('T')[0];
        const todayPlan = plan.find(p => p.date === today);
        setTodayMeals(todayPlan);

        if (todayPlan) {
            const existingLogs = await firebaseService.getMealLogs(today);

            if (existingLogs.length === 0) {
                for (const meal of todayPlan.meals) {
                    await firebaseService.logMeal({
                        mealId: meal.id,
                        mealName: meal.name,
                        date: today,
                        time: new Date().toTimeString().slice(0, 5),
                        calories: meal.calories,
                        eaten: false
                    });
                }
            }
        }
    };

    const loadTodayLogs = async () => {
        const today = new Date().toISOString().split('T')[0];
        const logs = await firebaseService.getMealLogs(today);
        setMealLogs(logs);

        const calories = await firebaseService.getDailyCalories(today);
        setDailyCalories({
            consumed: calories.consumed,
            target: 2000
        });
    };

    const handleConditionSelect = (condition: DietCondition) => {
        setSelectedCondition(condition);
        setStep("profile");
    };

    const handleProfileSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user || !selectedCondition) return;

        const nutritionProfile = {
            condition: selectedCondition,
            weight: parseFloat(formData.weight),
            height: parseFloat(formData.height),
            age: parseInt(formData.age),
            gender: formData.gender,
            allergies: formData.allergies,
            goal: formData.goal,
            startDate: new Date().toISOString()
        };

        await firebaseService.saveUserProfile(user.uid, { nutritionProfile });
        setUserProfile(nutritionProfile);
        await loadPlan(selectedCondition);
        await loadTodayLogs();
        setStep("plan");
    };

    const toggleMealEaten = async (meal: any) => {
        // OPTIMISTIC UPDATE: Visually toggle immediately
        const isCurrentlyEaten = mealLogs.some(l => l.mealId === meal.id && l.eaten);
        const optimisticStatus = !isCurrentlyEaten;

        // Force update UI locally first
        setMealLogs(prevLogs => {
            const existing = prevLogs.find(l => l.mealId === meal.id);
            if (existing) {
                return prevLogs.map(l => l.mealId === meal.id ? { ...l, eaten: optimisticStatus } : l);
            }
            // If phantom log needed for UI
            return [...prevLogs, { id: 'temp-' + meal.id, mealId: meal.id, eaten: optimisticStatus, date: new Date().toISOString() }];
        });

        // Vibrate on mobile for feedback
        if (typeof navigator !== 'undefined' && navigator.vibrate) {
            navigator.vibrate(50);
        }

        let log = mealLogs.find(l => l.mealId === meal.id);

        // If log doesn't exist, create it in background
        if (!log) {
            try {
                const today = new Date().toISOString().split('T')[0];
                const newLogId = await firebaseService.logMeal({
                    mealId: meal.id,
                    mealName: meal.name,
                    date: today,
                    time: new Date().toTimeString().slice(0, 5),
                    calories: meal.calories,
                    eaten: optimisticStatus
                });

                // Update the temp log with real ID
                setMealLogs(prev => prev.map(l => l.mealId === meal.id ? { ...l, id: newLogId } : l));
                log = { id: newLogId, mealId: meal.id, mealName: meal.name, date: today, eaten: optimisticStatus };
            } catch (error) {
                console.error("Failed to create log", error);
                // Revert optimistic update on error
                setMealLogs(prevLogs => prevLogs.map(l => l.mealId === meal.id ? { ...l, eaten: !optimisticStatus } : l));
                return;
            }
        } else {
            // Normal update
            try {
                if (optimisticStatus) {
                    await firebaseService.updateMealLog(log.id, { eaten: true });

                    // Trigger rating modal slightly after to not block "checking" flow
                    if (!log.rating) {
                        setTimeout(() => {
                            setSelectedMeal(meal);
                            setSelectedLogId(log!.id);
                            setShowRatingModal(true);
                        }, 500);
                    }
                } else {
                    await firebaseService.updateMealLog(log.id, { eaten: false });
                }
                loadTodayLogs(); // Sync completely
            } catch (e) {
                // Revert
                setMealLogs(prevLogs => prevLogs.map(l => l.mealId === meal.id ? { ...l, eaten: !optimisticStatus } : l));
            }
        }
    };

    const openRecipe = (meal: any) => {
        setSelectedMeal(meal);
        setShowRecipeModal(true);
    };

    const conditions = [
        { id: "diabete", label: "Diabète", icon: Activity, color: "bg-blue-500", desc: "Contrôle de la glycémie" },
        { id: "hypertension", label: "Hypertension", icon: Heart, color: "bg-red-500", desc: "Régulation de la tension" },
        { id: "ulcere", label: "Ulcère / Gastrite", icon: Droplets, color: "bg-amber-500", desc: "Protection gastrique" },
        { id: "perte-poids", label: "Perte de Poids", icon: TrendingDown, color: "bg-green-500", desc: "Déficit calorique sain" },
        { id: "prise-masse", label: "Prise de Masse", icon: Flame, color: "bg-orange-500", desc: "Surplus calorique" },
        { id: "enceinte", label: "Grossesse", icon: User, color: "bg-pink-500", desc: "Nutrition maman & bébé" },
        { id: "normal", label: "Équilibre Général", icon: Apple, color: "bg-emerald-500", desc: "Alimentation saine" }
    ] as const;

    if (loading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    // STEP 1: Condition Selection
    if (step === "select") {
        return (
            <div className="min-h-screen bg-background pb-24 animate-in fade-in duration-500">
                <div className="max-w-2xl mx-auto px-4 pt-8">
                    <button onClick={() => router.back()} className="mb-6 flex items-center gap-2 text-sm font-bold text-muted-foreground hover:text-foreground transition-colors">
                        <ArrowLeft size={16} /> Retour
                    </button>

                    <div className="mb-8 animate-in slide-in-from-bottom-4 duration-500 delay-100 fill-mode-backwards">
                        <h1 className="text-3xl font-black mb-2">Guide Alimentaire</h1>
                        <p className="text-muted-foreground">Choisissez votre profil de santé pour un plan personnalisé</p>
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                        {conditions.map((condition, index) => (
                            <button
                                key={condition.id}
                                onClick={() => handleConditionSelect(condition.id as DietCondition)}
                                className="group p-6 bg-card border border-border rounded-3xl hover:shadow-lg transition-all active:scale-[0.98] text-left animate-in slide-in-from-bottom-8 duration-500 fill-mode-backwards"
                                style={{ animationDelay: `${index * 100}ms` }}
                            >
                                <div className="flex items-center gap-4">
                                    <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-current/20 transition-transform group-hover:scale-110", condition.color)}>
                                        <condition.icon size={28} />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="text-lg font-black mb-1">{condition.label}</h3>
                                        <p className="text-sm text-muted-foreground">{condition.desc}</p>
                                    </div>
                                    <ChevronRight className="text-muted-foreground group-hover:text-primary transition-colors group-hover:translate-x-1" />
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
                <BottomNav />
            </div>
        );
    }

    // STEP 2: Profile Form
    if (step === "profile") {
        return (
            <div className="min-h-screen bg-background pb-24 animate-in fade-in slide-in-from-right-8 duration-500">
                <div className="max-w-2xl mx-auto px-4 pt-8">
                    <button onClick={() => setStep("select")} className="mb-6 flex items-center gap-2 text-sm font-bold text-muted-foreground hover:text-foreground transition-colors">
                        <ArrowLeft size={16} /> Retour
                    </button>

                    <div className="mb-8">
                        <h1 className="text-3xl font-black mb-2">Votre Profil</h1>
                        <p className="text-muted-foreground">Quelques informations pour personnaliser votre plan</p>
                    </div>

                    <form onSubmit={handleProfileSubmit} className="space-y-6">
                        <div className="grid grid-cols-2 gap-4 animate-in slide-in-from-bottom-4 duration-500 delay-100 fill-mode-backwards">
                            <div>
                                <label className="block text-sm font-bold mb-2">Poids (kg)</label>
                                <input
                                    type="number"
                                    required
                                    value={formData.weight}
                                    onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                                    className="input-standard transition-all focus:scale-[1.02]"
                                    placeholder="70"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold mb-2">Taille (cm)</label>
                                <input
                                    type="number"
                                    required
                                    value={formData.height}
                                    onChange={(e) => setFormData({ ...formData, height: e.target.value })}
                                    className="input-standard transition-all focus:scale-[1.02]"
                                    placeholder="170"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 animate-in slide-in-from-bottom-4 duration-500 delay-200 fill-mode-backwards">
                            <div>
                                <label className="block text-sm font-bold mb-2">Âge</label>
                                <input
                                    type="number"
                                    required
                                    value={formData.age}
                                    onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                                    className="input-standard transition-all focus:scale-[1.02]"
                                    placeholder="30"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold mb-2">Sexe</label>
                                <select
                                    value={formData.gender}
                                    onChange={(e) => setFormData({ ...formData, gender: e.target.value as "homme" | "femme" })}
                                    className="input-standard transition-all focus:scale-[1.02]"
                                >
                                    <option value="homme">Homme</option>
                                    <option value="femme">Femme</option>
                                </select>
                            </div>
                        </div>

                        <div className="animate-in slide-in-from-bottom-4 duration-500 delay-300 fill-mode-backwards">
                            <label className="block text-sm font-bold mb-2">Objectif (optionnel)</label>
                            <textarea
                                value={formData.goal}
                                onChange={(e) => setFormData({ ...formData, goal: e.target.value })}
                                className="input-standard min-h-[80px] transition-all focus:scale-[1.02]"
                                placeholder="Ex: Perdre 5kg en 2 mois"
                            />
                        </div>

                        <button
                            type="submit"
                            className="btn btn-primary w-full py-4 text-base shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all active:scale-[0.98] animate-in slide-in-from-bottom-4 duration-500 delay-400 fill-mode-backwards"
                        >
                            Générer Mon Plan <ChevronRight size={20} />
                        </button>
                    </form>
                </div>
                <BottomNav />
            </div>
        );
    }

    return (
        <div className="min-h-screen pb-24 animate-in fade-in duration-700 relative overflow-hidden">
            {/* Animated Background */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[70%] h-[70%] bg-emerald-400/20 blur-[100px] rounded-full animate-blob mix-blend-multiply dark:mix-blend-screen opacity-70" />
                <div className="absolute top-[20%] right-[-10%] w-[70%] h-[70%] bg-teal-400/20 blur-[100px] rounded-full animate-blob animation-delay-2000 mix-blend-multiply dark:mix-blend-screen opacity-70" />
                <div className="absolute bottom-[-10%] left-[20%] w-[70%] h-[70%] bg-green-400/20 blur-[100px] rounded-full animate-blob animation-delay-4000 mix-blend-multiply dark:mix-blend-screen opacity-70" />
            </div>

            <div className="max-w-2xl mx-auto px-4 pt-8 relative z-10">
                <div className="mb-6 animate-in slide-in-from-top-4 duration-500">
                    <div className="flex items-center justify-between mb-4">
                        <h1 className="text-3xl font-black">Mon Plan Nutrition</h1>
                        <button
                            onClick={() => setShowReminderModal(true)}
                            className="p-3 bg-primary/10 text-primary rounded-xl hover:bg-primary/20 transition-all hover:rotate-12 active:scale-90"
                        >
                            <Bell size={20} />
                        </button>
                    </div>

                    {selectedCondition && (
                        <div className="flex items-center gap-3 p-4 bg-primary/10 rounded-2xl animate-in zoom-in-95 duration-500 delay-100 fill-mode-backwards">
                            {(() => {
                                const cond = conditions.find(c => c.id === selectedCondition);
                                return cond ? (
                                    <>
                                        <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center text-white", cond.color)}>
                                            <cond.icon size={20} />
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-sm font-black">{cond.label}</p>
                                            <p className="text-xs text-muted-foreground">{cond.desc}</p>
                                        </div>
                                        <button
                                            onClick={() => setStep("select")}
                                            className="text-xs font-bold text-primary hover:underline"
                                        >
                                            Changer
                                        </button>
                                    </>
                                ) : null;
                            })()}
                        </div>
                    )}
                </div>

                <div className="mb-6 p-6 bg-gradient-to-br from-primary/10 to-primary/5 rounded-3xl border border-primary/20 animate-in slide-in-from-bottom-4 duration-500 delay-200 fill-mode-backwards">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <p className="text-sm font-bold text-muted-foreground mb-1">Calories Aujourd'hui</p>
                            <div className="flex items-baseline gap-2">
                                <span className="text-4xl font-black text-primary animate-in zoom-in duration-700 delay-300">{dailyCalories.consumed}</span>
                                <span className="text-lg text-muted-foreground">/ {dailyCalories.target}</span>
                            </div>
                        </div>
                        <div className="w-20 h-20 rounded-full border-8 border-primary/20 flex items-center justify-center relative">
                            <div className="absolute inset-0 rounded-full border-8 border-primary border-t-transparent animate-spin-slow opacity-20"></div>
                            <div className="text-center">
                                <p className="text-2xl font-black text-primary">
                                    {Math.round((dailyCalories.consumed / dailyCalories.target) * 100)}%
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="h-3 bg-secondary rounded-full overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-primary to-primary/80 transition-all duration-1000 ease-out"
                            style={{ width: `${Math.min((dailyCalories.consumed / dailyCalories.target) * 100, 100)}%` }}
                        />
                    </div>
                </div>

                {todayMeals && (
                    <div className="mb-8 animate-in slide-in-from-bottom-8 duration-500 delay-300 fill-mode-backwards">
                        <div className="flex items-center gap-2 mb-4">
                            <Calendar size={20} className="text-primary" />
                            <h2 className="text-xl font-black">Aujourd'hui - {todayMeals.dayName}</h2>
                        </div>

                        <div className="p-4 bg-gradient-to-br from-emerald-500 to-emerald-700 text-white rounded-3xl mb-4 shadow-lg shadow-emerald-500/20">
                            <p className="text-sm font-bold opacity-80 mb-1">Thème du jour</p>
                            <p className="text-2xl font-black">{todayMeals.theme}</p>
                        </div>

                        <div className="space-y-4">
                            {todayMeals.meals.map((meal: any, idx: number) => {
                                const log = mealLogs.find(l => l.mealId === meal.id);
                                const isEaten = log?.eaten || false;

                                return (
                                    <div key={idx}
                                        className={cn(
                                            "bg-card border rounded-3xl p-5 transition-all duration-300 animate-in slide-in-from-bottom-4 fill-mode-backwards",
                                            isEaten ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-900/10 scale-[0.98] opacity-80" : "border-border hover:shadow-lg hover:scale-[1.01]"
                                        )}
                                        style={{ animationDelay: `${400 + (idx * 100)}ms` }}
                                    >
                                        <div className="flex items-start gap-4">
                                            <button
                                                onClick={() => toggleMealEaten(meal)}
                                                className={cn(
                                                    "w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300 shrink-0",
                                                    isEaten
                                                        ? "bg-emerald-500 text-white rotate-12 scale-110"
                                                        : "bg-secondary text-muted-foreground hover:bg-primary/10 hover:text-primary hover:scale-110"
                                                )}
                                            >
                                                {isEaten ? <CheckCircle2 size={24} /> : <Circle size={24} />}
                                            </button>

                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <Clock size={14} className="text-muted-foreground" />
                                                    <span className="text-xs font-bold text-muted-foreground uppercase">
                                                        {meal.time.replace("-", " ")}
                                                    </span>
                                                    <span className="ml-auto text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-md">{meal.calories} kcal</span>
                                                </div>

                                                <h3 className={cn("text-lg font-black mb-2 transition-all", isEaten && "line-through decoration-2 decoration-emerald-500/50 text-muted-foreground")}>{meal.name}</h3>
                                                <p className="text-sm text-muted-foreground mb-3">{meal.description}</p>

                                                {meal.tips && (
                                                    <div className="flex items-start gap-2 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-xl mb-3 border border-amber-100 dark:border-amber-800/30">
                                                        <Info size={14} className="text-amber-600 mt-0.5 shrink-0" />
                                                        <p className="text-xs text-amber-800 dark:text-amber-200">{meal.tips}</p>
                                                    </div>
                                                )}

                                                <button
                                                    onClick={() => openRecipe(meal)}
                                                    className="flex items-center gap-2 text-sm font-bold text-primary hover:underline group"
                                                >
                                                    <BookOpen size={16} className="group-hover:scale-110 transition-transform" />
                                                    Voir la recette complète
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {selectedCondition && nutritionTips[selectedCondition] && (
                    <div className="mb-8 animate-in slide-in-from-bottom-8 duration-500 delay-500 fill-mode-backwards">
                        <h2 className="text-xl font-black mb-4 flex items-center gap-2">
                            <Sparkles size={20} className="text-primary" />
                            Conseils Nutrition
                        </h2>
                        <div className="space-y-2">
                            {nutritionTips[selectedCondition].map((tip, idx) => (
                                <div key={idx} className="flex items-start gap-3 p-4 bg-card border border-border rounded-2xl hover:bg-accent/50 transition-colors">
                                    <div className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs shrink-0">
                                        {idx + 1}
                                    </div>
                                    <p className="text-sm leading-relaxed">{tip}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <div className="mb-8 animate-in slide-in-from-bottom-8 duration-500 delay-700 fill-mode-backwards">
                    <h2 className="text-xl font-black mb-4 flex items-center gap-2">
                        <Utensils size={20} className="text-primary" />
                        Plan de la Semaine
                    </h2>

                    <div className="grid grid-cols-1 gap-3">
                        {currentPlan.map((day, idx) => {
                            const isToday = day.date === new Date().toISOString().split('T')[0];
                            return (
                                <div
                                    key={idx}
                                    className={cn(
                                        "p-4 rounded-2xl border transition-all",
                                        isToday
                                            ? "bg-primary/10 border-primary scale-[1.02] ring-2 ring-primary/20"
                                            : "bg-card border-border hover:shadow-md hover:scale-[1.01]"
                                    )}
                                >
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-black">{day.dayName}</p>
                                            <p className="text-xs text-muted-foreground">{day.theme}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-xs font-bold text-muted-foreground">{day.meals.length} repas</p>
                                            {isToday && (
                                                <span className="text-xs font-black text-primary bg-primary/10 px-2 py-0.5 rounded-md mt-1 inline-block">Aujourd'hui</span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            <RecipeModal
                isOpen={showRecipeModal}
                onClose={() => setShowRecipeModal(false)}
                meal={selectedMeal}
            />

            <ReminderModal
                isOpen={showReminderModal}
                onClose={() => setShowReminderModal(false)}
                onSave={() => { }}
            />

            <MealRatingModal
                isOpen={showRatingModal}
                onClose={async () => {
                    setShowRatingModal(false);
                    await loadTodayLogs();
                }}
                meal={selectedMeal}
                logId={selectedLogId}
            />

            <BottomNav />
        </div>
    );
}
