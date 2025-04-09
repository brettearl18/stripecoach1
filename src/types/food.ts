export interface NutritionInfo {
  calories: number;
  protein: number;
  carbohydrates: number;
  fat: number;
  fiber: number;
  sugar: number;
  servingSize: string;
  servingSizeGrams: number;
}

export interface FoodItem {
  id: string;
  barcode: string;
  name: string;
  brand: string;
  nutrition: NutritionInfo;
  ingredients: string[];
  allergens: string[];
  image?: string;
  verified: boolean;
  lastUpdated: string;
}

export interface FoodSearchResult {
  items: FoodItem[];
  total: number;
  page: number;
  perPage: number;
} 