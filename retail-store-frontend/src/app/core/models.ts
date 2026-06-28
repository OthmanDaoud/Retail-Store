export type Role = 'manager' | 'employee';

export interface User {
  id: number;
  name: string;
  email: string;
  role: Role;
  createdAt?: string;
  createdBy?: number;
  modifiedAt?: string;
  modifiedBy?: number;
  isActive?: boolean;
}

export interface Category {
  id: number;
  name: string;
  createdAt?: string;
  createdBy?: number;
  modifiedAt?: string;
  modifiedBy?: number;
  isActive?: boolean;
}

export interface Product {
  id: number;
  name: string;
  price: number;
  stockQuantity: number;
  categoryId: number;
  category?: Category;
  createdAt?: string;
  createdBy?: number;
  modifiedAt?: string;
  modifiedBy?: number;
  isActive?: boolean;
}

export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface SaleItem {
  id: number;
  productId: number;
  product?: Product;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
  createdAt?: string;
  createdBy?: number;
  modifiedAt?: string;
  modifiedBy?: number;
  isActive?: boolean;
}

export interface Sale {
  id: number;
  total: number;
  cashier?: User;
  items: SaleItem[];
  createdAt: string;
  createdBy?: number;
  modifiedAt?: string;
  modifiedBy?: number;
  isActive?: boolean;
}

export interface TopProduct {
  productId: number;
  name: string;
  unitsSold: number;
  revenue: number;
}

export interface ReportSummary {
  totalRevenue: number;
  salesCount: number;
  totalProducts: number;
  lowStockThreshold: number;
  lowStockProducts: Product[];
  topProducts: TopProduct[];
}

export interface LoginResponse {
  accessToken: string;
  user: User;
}

export interface ProductQuery {
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  categoryId?: number;
  page?: number;
  limit?: number;
  sortBy?: 'name' | 'price' | 'stockQuantity' | 'createdAt';
  sortOrder?: 'ASC' | 'DESC';
}

export interface ProductInput {
  name: string;
  price: number;
  stockQuantity: number;
  categoryId: number;
}
