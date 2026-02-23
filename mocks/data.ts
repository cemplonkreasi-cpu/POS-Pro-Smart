import { User, Category, Product, Transaction, DailySales, Variant, Ingredient, ProductIngredient, PrinterConfig, ReceiptSettings, StoreSettings } from '@/types';

export const USERS: User[] = [
  { id: '1', name: 'Admin Utama', email: 'admin@pospro.com', role: 'admin', pin: '1234', isActive: true },
  { id: '2', name: 'Supervisor Andi', email: 'andi@pospro.com', role: 'supervisor', pin: '5678', isActive: true },
  { id: '3', name: 'Kasir Dewi', email: 'dewi@pospro.com', role: 'kasir', pin: '9012', isActive: true },
  { id: '4', name: 'Kasir Budi', email: 'budi@pospro.com', role: 'kasir', pin: '3456', isActive: true },
];

export const CATEGORIES: Category[] = [
  { id: 'cat1', name: 'Kopi', icon: 'coffee' },
  { id: 'cat2', name: 'Non-Kopi', icon: 'cup-soda' },
  { id: 'cat3', name: 'Makanan', icon: 'utensils' },
  { id: 'cat4', name: 'Snack', icon: 'cookie' },
  { id: 'cat5', name: 'Dessert', icon: 'cake' },
];

export const PRODUCTS: Product[] = [
  { id: 'p1', name: 'Espresso', sku: 'KP001', categoryId: 'cat1', image: 'https://images.unsplash.com/photo-1510707577719-ae7c14805e3a?w=200&h=200&fit=crop', buyPrice: 5000, sellPrice: 18000, stock: 100, minStock: 10, isActive: true },
  { id: 'p2', name: 'Cappuccino', sku: 'KP002', categoryId: 'cat1', image: 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=200&h=200&fit=crop', buyPrice: 7000, sellPrice: 25000, stock: 80, minStock: 10, isActive: true },
  { id: 'p3', name: 'Latte', sku: 'KP003', categoryId: 'cat1', image: 'https://images.unsplash.com/photo-1561882468-9110e03e0f78?w=200&h=200&fit=crop', buyPrice: 7000, sellPrice: 28000, stock: 75, minStock: 10, isActive: true },
  { id: 'p4', name: 'Americano', sku: 'KP004', categoryId: 'cat1', image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefda?w=200&h=200&fit=crop', buyPrice: 5000, sellPrice: 20000, stock: 90, minStock: 10, isActive: true },
  { id: 'p5', name: 'Mocha', sku: 'KP005', categoryId: 'cat1', image: 'https://images.unsplash.com/photo-1578314675249-a6910f80cc4e?w=200&h=200&fit=crop', buyPrice: 8000, sellPrice: 30000, stock: 60, minStock: 10, isActive: true },
  { id: 'p6', name: 'Matcha Latte', sku: 'NK001', categoryId: 'cat2', image: 'https://images.unsplash.com/photo-1536256263959-770b48d82b0a?w=200&h=200&fit=crop', buyPrice: 8000, sellPrice: 28000, stock: 50, minStock: 10, isActive: true },
  { id: 'p7', name: 'Taro Milk', sku: 'NK002', categoryId: 'cat2', image: 'https://images.unsplash.com/photo-1625865636074-8d tried3c62a8?w=200&h=200&fit=crop', buyPrice: 7000, sellPrice: 25000, stock: 45, minStock: 10, isActive: true },
  { id: 'p8', name: 'Thai Tea', sku: 'NK003', categoryId: 'cat2', image: 'https://images.unsplash.com/photo-1558857563-b371033873b8?w=200&h=200&fit=crop', buyPrice: 6000, sellPrice: 22000, stock: 55, minStock: 10, isActive: true },
  { id: 'p9', name: 'Nasi Goreng', sku: 'MK001', categoryId: 'cat3', image: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=200&h=200&fit=crop', buyPrice: 12000, sellPrice: 35000, stock: 30, minStock: 5, isActive: true },
  { id: 'p10', name: 'Mie Goreng', sku: 'MK002', categoryId: 'cat3', image: 'https://images.unsplash.com/photo-1585032226651-759b368d7246?w=200&h=200&fit=crop', buyPrice: 10000, sellPrice: 30000, stock: 25, minStock: 5, isActive: true },
  { id: 'p11', name: 'Sandwich', sku: 'MK003', categoryId: 'cat3', image: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=200&h=200&fit=crop', buyPrice: 12000, sellPrice: 32000, stock: 20, minStock: 5, isActive: true },
  { id: 'p12', name: 'French Fries', sku: 'SN001', categoryId: 'cat4', image: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=200&h=200&fit=crop', buyPrice: 8000, sellPrice: 22000, stock: 40, minStock: 10, isActive: true },
  { id: 'p13', name: 'Roti Bakar', sku: 'SN002', categoryId: 'cat4', image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=200&h=200&fit=crop', buyPrice: 6000, sellPrice: 18000, stock: 35, minStock: 10, isActive: true },
  { id: 'p14', name: 'Cheesecake', sku: 'DS001', categoryId: 'cat5', image: 'https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=200&h=200&fit=crop', buyPrice: 15000, sellPrice: 38000, stock: 15, minStock: 5, isActive: true },
  { id: 'p15', name: 'Brownies', sku: 'DS002', categoryId: 'cat5', image: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=200&h=200&fit=crop', buyPrice: 10000, sellPrice: 28000, stock: 20, minStock: 5, isActive: true },
];

export const TRANSACTIONS: Transaction[] = [
  {
    id: 't1', invoiceNo: 'INV-20260223-001', date: '2026-02-23T08:30:00',
    cashierId: '3', cashierName: 'Kasir Dewi',
    items: [
      { product: PRODUCTS[0], qty: 2, discountType: 'percent', discountValue: 0 },
      { product: PRODUCTS[11], qty: 1, discountType: 'percent', discountValue: 0 },
    ],
    subtotal: 58000, discountTotal: 0, taxAmount: 6380, serviceCharge: 2900, grandTotal: 67280,
    payments: [{ method: 'cash', amount: 67280 }], status: 'completed',
  },
  {
    id: 't2', invoiceNo: 'INV-20260223-002', date: '2026-02-23T09:15:00',
    cashierId: '3', cashierName: 'Kasir Dewi',
    items: [
      { product: PRODUCTS[1], qty: 1, discountType: 'percent', discountValue: 0 },
      { product: PRODUCTS[8], qty: 1, discountType: 'percent', discountValue: 0 },
      { product: PRODUCTS[13], qty: 1, discountType: 'percent', discountValue: 0 },
    ],
    subtotal: 98000, discountTotal: 0, taxAmount: 10780, serviceCharge: 4900, grandTotal: 113680,
    payments: [{ method: 'qris', amount: 113680 }], status: 'completed',
  },
  {
    id: 't3', invoiceNo: 'INV-20260223-003', date: '2026-02-23T10:00:00',
    cashierId: '4', cashierName: 'Kasir Budi',
    items: [
      { product: PRODUCTS[2], qty: 3, discountType: 'percent', discountValue: 10 },
      { product: PRODUCTS[5], qty: 2, discountType: 'percent', discountValue: 0 },
    ],
    subtotal: 140000, discountTotal: 8400, taxAmount: 14476, serviceCharge: 6580, grandTotal: 152656,
    payments: [{ method: 'cash', amount: 100000 }, { method: 'ewallet', amount: 52656 }], status: 'completed',
  },
  {
    id: 't4', invoiceNo: 'INV-20260223-004', date: '2026-02-23T11:30:00',
    cashierId: '3', cashierName: 'Kasir Dewi',
    items: [
      { product: PRODUCTS[3], qty: 2, discountType: 'percent', discountValue: 0 },
      { product: PRODUCTS[9], qty: 1, discountType: 'percent', discountValue: 0 },
    ],
    subtotal: 70000, discountTotal: 0, taxAmount: 7700, serviceCharge: 3500, grandTotal: 81200,
    payments: [{ method: 'transfer', amount: 81200 }], status: 'completed',
  },
  {
    id: 't5', invoiceNo: 'INV-20260223-005', date: '2026-02-23T12:45:00',
    cashierId: '4', cashierName: 'Kasir Budi',
    items: [
      { product: PRODUCTS[4], qty: 1, discountType: 'percent', discountValue: 0 },
      { product: PRODUCTS[10], qty: 2, discountType: 'percent', discountValue: 0 },
      { product: PRODUCTS[14], qty: 1, discountType: 'percent', discountValue: 0 },
    ],
    subtotal: 122000, discountTotal: 0, taxAmount: 13420, serviceCharge: 6100, grandTotal: 141520,
    payments: [{ method: 'ewallet', amount: 141520 }], status: 'completed',
  },
];

export const DAILY_SALES: DailySales[] = [
  { date: '2026-02-17', total: 1850000, transactions: 42 },
  { date: '2026-02-18', total: 2100000, transactions: 48 },
  { date: '2026-02-19', total: 1920000, transactions: 44 },
  { date: '2026-02-20', total: 2350000, transactions: 52 },
  { date: '2026-02-21', total: 2580000, transactions: 58 },
  { date: '2026-02-22', total: 2180000, transactions: 50 },
  { date: '2026-02-23', total: 556336, transactions: 5 },
];

export const DEFAULT_VARIANTS: Variant[] = [
  { id: 'v1', productId: 'p1', name: 'Hot', priceAdjustment: 0 },
  { id: 'v2', productId: 'p1', name: 'Iced', priceAdjustment: 3000 },
  { id: 'v3', productId: 'p2', name: 'Hot', priceAdjustment: 0 },
  { id: 'v4', productId: 'p2', name: 'Iced', priceAdjustment: 3000 },
  { id: 'v5', productId: 'p2', name: 'Large', priceAdjustment: 5000 },
];

export const DEFAULT_INGREDIENTS: Ingredient[] = [
  { id: 'ing1', name: 'Biji Kopi Arabica', unit: 'gram', costPerUnit: 150 },
  { id: 'ing2', name: 'Susu Segar', unit: 'ml', costPerUnit: 25 },
  { id: 'ing3', name: 'Gula Aren', unit: 'gram', costPerUnit: 40 },
  { id: 'ing4', name: 'Es Batu', unit: 'pcs', costPerUnit: 500 },
  { id: 'ing5', name: 'Whipped Cream', unit: 'gram', costPerUnit: 80 },
  { id: 'ing6', name: 'Cokelat Bubuk', unit: 'gram', costPerUnit: 120 },
];

export const DEFAULT_PRODUCT_INGREDIENTS: Record<string, ProductIngredient[]> = {
  'p1': [{ ingredientId: 'ing1', qty: 18 }],
  'p2': [{ ingredientId: 'ing1', qty: 18 }, { ingredientId: 'ing2', qty: 150 }],
  'p3': [{ ingredientId: 'ing1', qty: 18 }, { ingredientId: 'ing2', qty: 200 }],
  'p5': [{ ingredientId: 'ing1', qty: 18 }, { ingredientId: 'ing2', qty: 150 }, { ingredientId: 'ing6', qty: 20 }],
};

export const DEFAULT_PRINTERS: PrinterConfig[] = [];

export const DEFAULT_RECEIPT_SETTINGS: ReceiptSettings = {
  logoUrl: '',
  headerText: 'Terima kasih atas kunjungan Anda!',
  footerText: 'Barang yang sudah dibeli tidak dapat dikembalikan.',
  showLogo: true,
  paperSize: '58mm',
};

export const DEFAULT_STORE_SETTINGS: StoreSettings = {
  name: 'POS Pro Smart Cafe',
  address: 'Jl. Sudirman No. 123, Jakarta',
  phone: '021-1234567',
  npwp: '12.345.678.9-012.000',
  taxEnabled: true,
  taxPercent: 11,
  serviceChargeEnabled: true,
  serviceChargePercent: 5,
  receipt: DEFAULT_RECEIPT_SETTINGS,
};
