export type FoodItem = {
  id: string;
  name: string;
  brand?: string;
  serving: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  fiber?: number;
};

export type MealType = 'Breakfast' | 'Lunch' | 'Dinner' | 'Snacks';

const FOODS: FoodItem[] = [
  { id: '1', name: 'Poha', serving: '1 bowl (150g)', calories: 230, protein: 5, carbs: 40, fats: 6, fiber: 3 },
  { id: '2', name: 'Idli', serving: '2 pieces (100g)', calories: 150, protein: 4, carbs: 30, fats: 2, fiber: 2 },
  { id: '3', name: 'Masala Dosa', serving: '1 medium (180g)', calories: 320, protein: 8, carbs: 45, fats: 12, fiber: 4 },
  { id: '4', name: 'Dal Tadka', serving: '1 bowl (200g)', calories: 210, protein: 12, carbs: 28, fats: 6, fiber: 6 },
  { id: '5', name: 'Paneer Butter Masala', serving: '1 bowl (200g)', calories: 390, protein: 16, carbs: 12, fats: 30, fiber: 2 },
  { id: '6', name: 'Chapati', serving: '2 pieces (80g)', calories: 160, protein: 4, carbs: 30, fats: 2, fiber: 4 },
  { id: '7', name: 'Rice (cooked)', serving: '1 cup (180g)', calories: 205, protein: 4, carbs: 45, fats: 1, fiber: 1 },
  { id: '8', name: 'Chicken Biryani', serving: '1 plate (300g)', calories: 520, protein: 25, carbs: 60, fats: 18, fiber: 3 },
  { id: '9', name: 'Egg Bhurji', serving: '2 eggs (120g)', calories: 210, protein: 14, carbs: 4, fats: 14, fiber: 0 },
  { id: '10', name: 'Amul Masti Dahi', brand: 'Amul', serving: '100g', calories: 75, protein: 3, carbs: 5, fats: 4, fiber: 0 },
  { id: '11', name: 'Haldiram Bhujia', brand: 'Haldiram', serving: '30g', calories: 170, protein: 4, carbs: 14, fats: 10, fiber: 2 },
  { id: '12', name: 'Maggi 2-Minute Noodles', brand: 'Maggi', serving: '1 pack (70g)', calories: 320, protein: 7, carbs: 47, fats: 12, fiber: 2 },
  { id: '13', name: 'Banana', serving: '1 medium', calories: 105, protein: 1, carbs: 27, fats: 0, fiber: 3 },
  { id: '14', name: 'Whey Protein', brand: 'Myprotein', serving: '1 scoop (30g)', calories: 120, protein: 24, carbs: 3, fats: 2, fiber: 0 },
];

export function searchFoods(query: string): FoodItem[] {
  const q = query.trim().toLowerCase();
  if (!q) return FOODS.slice(0, 8);
  return FOODS.filter(item =>
    `${item.name} ${item.brand ?? ''}`.toLowerCase().includes(q)
  ).slice(0, 20);
}

export function getTrendingFoods(): FoodItem[] {
  return [FOODS[0], FOODS[2], FOODS[4], FOODS[8], FOODS[12], FOODS[13]];
}
