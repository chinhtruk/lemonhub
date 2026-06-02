import { create } from 'zustand';

export type CategoryId = 
  | 'phone-tablet'
  | 'laptop'
  | 'audio'
  | 'watch-camera'
  | 'pc-monitor'
  | 'tv'
  | 'trade-in'
  | null;

interface CategoryStore {
  selectedCategory: CategoryId;
  setSelectedCategory: (category: CategoryId) => void;
}

export const useCategory = create<CategoryStore>((set) => ({
  selectedCategory: null,
  setSelectedCategory: (category) => set({ selectedCategory: category }),
})); 