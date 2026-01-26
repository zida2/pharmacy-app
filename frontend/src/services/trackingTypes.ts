export interface MealLog {
    id: string;
    userId: string;
    mealId: string;
    mealName: string;
    date: string; // YYYY-MM-DD
    time: string; // HH:mm
    calories: number;
    eaten: boolean;
    rating?: 1 | 2 | 3 | 4 | 5;
    notes?: string;
    createdAt: any;
}

export interface DailyCalories {
    date: string;
    target: number;
    consumed: number;
    remaining: number;
    meals: MealLog[];
}

export interface MealReminder {
    id: string;
    userId: string;
    mealType: "petit-dejeuner" | "dejeuner" | "diner" | "collation";
    time: string; // HH:mm
    enabled: boolean;
    days: number[]; // 0-6 (dimanche-samedi)
}
