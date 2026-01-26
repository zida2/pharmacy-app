"use client";

import React, { useState } from "react";
import { X, ChevronRight, Clock, Flame, Users, ChefHat } from "lucide-react";
import { getRecipe } from "@/services/recipeData";
import { cn } from "@/lib/utils";

interface RecipeModalProps {
    isOpen: boolean;
    onClose: () => void;
    meal: any;
}

export default function RecipeModal({ isOpen, onClose, meal }: RecipeModalProps) {
    const recipe = meal ? getRecipe(meal.id) : null;

    if (!isOpen || !meal || !recipe) return null;

    const difficultyColors = {
        facile: "bg-green-500",
        moyen: "bg-amber-500",
        difficile: "bg-red-500"
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
            <div className="bg-background w-full sm:max-w-2xl h-[90vh] sm:h-auto sm:max-h-[90vh] rounded-t-3xl sm:rounded-3xl overflow-hidden shadow-2xl animate-in slide-in-from-bottom-full sm:slide-in-from-bottom-10 flex flex-col">
                {/* Header */}
                <div className="p-6 border-b border-border shrink-0">
                    <div className="flex justify-between items-start mb-4">
                        <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="text-4xl">{meal.image}</div>
                                <div>
                                    <h2 className="text-2xl font-black leading-tight">{meal.name}</h2>
                                    <p className="text-sm text-muted-foreground">{meal.description}</p>
                                </div>
                            </div>
                        </div>
                        <button onClick={onClose} className="p-2 bg-secondary rounded-full hover:bg-accent shrink-0">
                            <X size={20} />
                        </button>
                    </div>

                    {/* Quick Info */}
                    <div className="grid grid-cols-3 gap-3">
                        <div className="p-3 bg-secondary rounded-xl text-center">
                            <Clock size={20} className="mx-auto mb-1 text-primary" />
                            <p className="text-xs font-bold text-muted-foreground">Préparation</p>
                            <p className="text-sm font-black">{recipe.prepTime} min</p>
                        </div>
                        <div className="p-3 bg-secondary rounded-xl text-center">
                            <Flame size={20} className="mx-auto mb-1 text-orange-500" />
                            <p className="text-xs font-bold text-muted-foreground">Cuisson</p>
                            <p className="text-sm font-black">{recipe.cookTime} min</p>
                        </div>
                        <div className="p-3 bg-secondary rounded-xl text-center">
                            <ChefHat size={20} className="mx-auto mb-1 text-emerald-500" />
                            <p className="text-xs font-bold text-muted-foreground">Difficulté</p>
                            <div className={cn("inline-block px-2 py-0.5 rounded-full text-xs font-black text-white mt-1", difficultyColors[recipe.difficulty])}>
                                {recipe.difficulty}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    {/* Ingredients */}
                    <div>
                        <h3 className="text-lg font-black mb-3 flex items-center gap-2">
                            <Users size={20} className="text-primary" />
                            Ingrédients
                        </h3>
                        <div className="space-y-2">
                            {recipe.ingredients.map((ing, idx) => (
                                <div key={idx} className="flex items-center gap-3 p-3 bg-secondary rounded-xl">
                                    <div className="w-2 h-2 rounded-full bg-primary shrink-0" />
                                    <span className="text-sm font-bold flex-1">{ing.item}</span>
                                    <span className="text-sm text-primary font-black">{ing.quantity}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Steps */}
                    <div>
                        <h3 className="text-lg font-black mb-3 flex items-center gap-2">
                            <ChefHat size={20} className="text-primary" />
                            Préparation
                        </h3>
                        <div className="space-y-3">
                            {recipe.steps.map((step, idx) => (
                                <div key={idx} className="flex gap-4">
                                    <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-black text-sm shrink-0">
                                        {idx + 1}
                                    </div>
                                    <p className="text-sm leading-relaxed pt-1">{step}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Tips */}
                    {recipe.tips && recipe.tips.length > 0 && (
                        <div>
                            <h3 className="text-lg font-black mb-3">💡 Astuces</h3>
                            <div className="space-y-2">
                                {recipe.tips.map((tip, idx) => (
                                    <div key={idx} className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-200 dark:border-amber-800/30">
                                        <p className="text-sm text-amber-900 dark:text-amber-100">{tip}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Nutrition Info */}
                    <div className="p-4 bg-gradient-to-br from-primary/10 to-primary/5 rounded-2xl border border-primary/20">
                        <h3 className="text-sm font-black mb-2">Informations Nutritionnelles</h3>
                        <div className="flex items-center gap-2">
                            <Flame size={16} className="text-orange-500" />
                            <span className="text-2xl font-black text-primary">{meal.calories}</span>
                            <span className="text-sm text-muted-foreground">kcal par portion</span>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-border shrink-0">
                    <button
                        onClick={onClose}
                        className="btn btn-primary w-full py-3"
                    >
                        Fermer
                    </button>
                </div>
            </div>
        </div>
    );
}
