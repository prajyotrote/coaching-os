import type { FoodItem } from './food';

export type BasketItem = {
  item: FoodItem;
  quantity: number;
  unit: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  fiber: number;
};

type Listener = (items: BasketItem[]) => void;

let basket: BasketItem[] = [];
let listeners: Listener[] = [];

export function getBasket() {
  return basket;
}

export function addToBasket(entry: BasketItem) {
  basket = [entry, ...basket];
  listeners.forEach(fn => fn(basket));
}

export function clearBasket() {
  basket = [];
  listeners.forEach(fn => fn(basket));
}

export function subscribeBasket(fn: Listener) {
  listeners = [...listeners, fn];
  return () => {
    listeners = listeners.filter(x => x !== fn);
  };
}
