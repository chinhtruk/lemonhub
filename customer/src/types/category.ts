export interface Category {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  parentCategory?: Category;
  icon?: string;
  isFeatured?: boolean;
  order?: number;
  createdAt: string;
  updatedAt: string;
} 