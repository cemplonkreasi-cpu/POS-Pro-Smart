export type UserRole = 'admin' | 'supervisor' | 'kasir';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  pin: string;
  avatar?: string;
  isActive: boolean;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
}

export interface Variant {
  id: string;
  productId: string;
  name: string;
  priceAdjustment: number;
}

export interface Ingredient {
  id: string;
  name: string;
  unit: string;
  costPerUnit: number;
}

export interface ProductIngredient {
  ingredientId: string;
  qty: number;
}

export interface PrinterConfig {
  id: string;
  name: string;
  address: string;
  paperSize: '58mm' | '80mm';
  isDefault: boolean;
}

export interface ReceiptSettings {
  logoUrl: string;
  headerText: string;
  footerText: string;
  showLogo: boolean;
  paperSize: '58mm' | '80mm';
}

export interface Product {
  id: string;
  name: string;
  sku: string;
  categoryId: string;
  image: string;
  buyPrice: number;
  sellPrice: number;
  stock: number;
  minStock: number;
  isActive: boolean;
}

export interface CartItem {
  product: Product;
  qty: number;
  discountType: 'percent' | 'nominal';
  discountValue: number;
}

export type PaymentMethod = 'cash' | 'qris' | 'transfer' | 'ewallet';

export interface PaymentSplit {
  method: PaymentMethod;
  amount: number;
}

export interface Transaction {
  id: string;
  invoiceNo: string;
  date: string;
  cashierId: string;
  cashierName: string;
  items: CartItem[];
  subtotal: number;
  discountTotal: number;
  taxAmount: number;
  serviceCharge: number;
  grandTotal: number;
  payments: PaymentSplit[];
  status: 'completed' | 'voided';
}

export interface StoreSettings {
  name: string;
  address: string;
  phone: string;
  npwp: string;
  taxEnabled: boolean;
  taxPercent: number;
  serviceChargeEnabled: boolean;
  serviceChargePercent: number;
  receipt: ReceiptSettings;
}

export interface DailySales {
  date: string;
  total: number;
  transactions: number;
}
