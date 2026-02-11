import type { FoodItem } from './food';

export type Meal = {
  id: string;
  title: string;
  items: FoodItem[];
};

type Listener = (meals: Meal[]) => void;

let mealsStore: Meal[] = [
  { id: 'meal-1', title: 'Meal 1', items: [] },
  { id: 'meal-2', title: 'Meal 2', items: [] },
  { id: 'meal-3', title: 'Meal 3', items: [] },
];
let listeners: Listener[] = [];

export function getMeals() {
  return mealsStore;
}

export function setMeals(next: Meal[]) {
  mealsStore = next;
  listeners.forEach(fn => fn(mealsStore));
}

export function subscribeMeals(fn: Listener) {
  listeners = [...listeners, fn];
  return () => {
    listeners = listeners.filter(x => x !== fn);
  };
}
