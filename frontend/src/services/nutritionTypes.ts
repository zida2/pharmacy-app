
export type DietCondition =
    | "diabete"
    | "hypertension"
    | "ulcere"
    | "perte-poids"
    | "prise-masse"
    | "enceinte"
    | "normal";

export interface Meal {
    id: string;
    name: string;
    time: "petit-dejeuner" | "dejeuner" | "diner" | "collation";
    description: string;
    calories: number;
    ingredients: string[];
    tips?: string;
    image?: string; // Emoji or URL
}

export interface DailyPlan {
    date: string; // YYYY-MM-DD
    theme: string; // e.g., "Journée Detox", "Faible Indice Glycémique"
    meals: Meal[];
}

export interface UserDietProfile {
    id: string; // user UID
    condition: DietCondition;
    allergies: string[];
    weight?: number;
    height?: number;
    age?: number;
    gender?: "homme" | "femme";
    goal?: string;
    startDate: string;
}
