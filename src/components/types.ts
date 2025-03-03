export interface Nutrient {
    name: string;
    amount: number;
    unit: string;
}

export interface NutrientCategories {
    macronutrients: Nutrient[];
    vitamins: Nutrient[];
    minerals: Nutrient[];
    other: Nutrient[];
}

export interface BasicInfo {
    name: string;
    brand: string;
    id: number;
    calories: number;
}

export interface HealthMetrics {
    is_low_fat: boolean;
    is_low_sodium: boolean;
    is_high_fiber: boolean;
}

export interface Analysis {
    health_metrics: HealthMetrics;
    key_highlights: string[];
}

export interface NutrientDisplayProps {
    name: string;
    amount: number;
    unit: string;
    daily_value_percent?: number;
}

export interface FoodData {
    basic_info: {
        name: string;
        brand: string;
        id: number | null;
        upc: string | null;
        category: string | null;
        ingredients: string | null;
        serving_size: number | null;
        serving_unit: string | null;
        household_serving: string | null;
        calories: number | null;
        published_date: string | null;
    };
    nutrients: {
        macronutrients: NutrientDisplayProps[];
        vitamins: NutrientDisplayProps[];
        minerals: NutrientDisplayProps[];
        other: NutrientDisplayProps[];
    };
    analysis: {
        health_metrics: {
            is_low_fat: boolean;
            is_low_sodium: boolean;
            is_high_fiber: boolean;
            is_low_calorie: boolean;
            is_high_protein: boolean;
        };
        nutritional_profile: {
            calories_per_serving?: number;
            fat_calories_percent?: number;
            protein_calories_percent?: number;
            carbs_calories_percent?: number;
        };
        key_highlights: string[];
    };
}

export const DEFAULT_FOOD_DATA: FoodData = {
    basic_info: {
        name: "Unknown",
        brand: "Unknown",
        id: null,
        upc: null,
        category: "Unknown",
        ingredients: "Not available",
        serving_size: null,
        serving_unit: "g",
        household_serving: "Not available",
        calories: null,
        published_date: null,
    },
    nutrients: {
        macronutrients: [],
        vitamins: [],
        minerals: [],
        other: [],
    },
    analysis: {
        health_metrics: {
            is_low_fat: false,
            is_low_sodium: false,
            is_high_fiber: false,
            is_low_calorie: false,
            is_high_protein: false,
        },
        nutritional_profile: {
            calories_per_serving: undefined,
            fat_calories_percent: undefined,
            protein_calories_percent: undefined,
            carbs_calories_percent: undefined,
        },
        key_highlights: [],
    },
};
