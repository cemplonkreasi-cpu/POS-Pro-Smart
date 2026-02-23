import { useState, useEffect, useCallback, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import createContextHook from '@nkzw/create-context-hook';
import { Product, Transaction, CartItem, StoreSettings, PaymentSplit, Category, Variant, Ingredient, ProductIngredient, PrinterConfig } from '@/types';
import { PRODUCTS, TRANSACTIONS, CATEGORIES, DEFAULT_STORE_SETTINGS, DEFAULT_VARIANTS, DEFAULT_INGREDIENTS, DEFAULT_PRODUCT_INGREDIENTS, DEFAULT_PRINTERS } from '@/mocks/data';
import { generateInvoiceNo } from '@/utils/format';

export const [StoreProvider, useStore] = createContextHook(() => {
  const [products, setProducts] = useState<Product[]>(PRODUCTS);
  const [transactions, setTransactions] = useState<Transaction[]>(TRANSACTIONS);
  const [categories, setCategories] = useState<Category[]>(CATEGORIES);
  const [variants, setVariants] = useState<Variant[]>(DEFAULT_VARIANTS);
  const [ingredients, setIngredients] = useState<Ingredient[]>(DEFAULT_INGREDIENTS);
  const [productIngredients, setProductIngredients] = useState<Record<string, ProductIngredient[]>>(DEFAULT_PRODUCT_INGREDIENTS);
  const [printers, setPrinters] = useState<PrinterConfig[]>(DEFAULT_PRINTERS);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [settings, setSettings] = useState<StoreSettings>(DEFAULT_STORE_SETTINGS);
  const [globalDiscount, setGlobalDiscount] = useState<number>(0);

  useEffect(() => {
    const load = async () => {
      try {
        const s = await AsyncStorage.getItem('pos_settings');
        if (s) setSettings(JSON.parse(s));
        const t = await AsyncStorage.getItem('pos_transactions');
        if (t) setTransactions(JSON.parse(t));
        const p = await AsyncStorage.getItem('pos_products');
        if (p) setProducts(JSON.parse(p));
        const c = await AsyncStorage.getItem('pos_categories');
        if (c) setCategories(JSON.parse(c));
        const v = await AsyncStorage.getItem('pos_variants');
        if (v) setVariants(JSON.parse(v));
        const ing = await AsyncStorage.getItem('pos_ingredients');
        if (ing) setIngredients(JSON.parse(ing));
        const pi = await AsyncStorage.getItem('pos_product_ingredients');
        if (pi) setProductIngredients(JSON.parse(pi));
        const pr = await AsyncStorage.getItem('pos_printers');
        if (pr) setPrinters(JSON.parse(pr));
      } catch (e) {
        console.log('Failed to load store data', e);
      }
    };
    load();
  }, []);

  const saveTransactions = useCallback(async (txns: Transaction[]) => {
    try { await AsyncStorage.setItem('pos_transactions', JSON.stringify(txns)); } catch (e) { console.log('Failed to save transactions', e); }
  }, []);

  const saveProducts = useCallback(async (prods: Product[]) => {
    try { await AsyncStorage.setItem('pos_products', JSON.stringify(prods)); } catch (e) { console.log('Failed to save products', e); }
  }, []);

  const saveCategories = useCallback(async (cats: Category[]) => {
    try { await AsyncStorage.setItem('pos_categories', JSON.stringify(cats)); } catch (e) { console.log('Failed to save categories', e); }
  }, []);

  const saveVariants = useCallback(async (vars: Variant[]) => {
    try { await AsyncStorage.setItem('pos_variants', JSON.stringify(vars)); } catch (e) { console.log('Failed to save variants', e); }
  }, []);

  const saveIngredients = useCallback(async (ings: Ingredient[]) => {
    try { await AsyncStorage.setItem('pos_ingredients', JSON.stringify(ings)); } catch (e) { console.log('Failed to save ingredients', e); }
  }, []);

  const saveProductIngredients = useCallback(async (pi: Record<string, ProductIngredient[]>) => {
    try { await AsyncStorage.setItem('pos_product_ingredients', JSON.stringify(pi)); } catch (e) { console.log('Failed to save product ingredients', e); }
  }, []);

  const savePrinters = useCallback(async (prs: PrinterConfig[]) => {
    try { await AsyncStorage.setItem('pos_printers', JSON.stringify(prs)); } catch (e) { console.log('Failed to save printers', e); }
  }, []);

  // Categories
  const addCategory = useCallback((cat: Category) => {
    const updated = [...categories, cat];
    setCategories(updated);
    saveCategories(updated);
  }, [categories, saveCategories]);

  const updateCategory = useCallback((cat: Category) => {
    const updated = categories.map(c => c.id === cat.id ? cat : c);
    setCategories(updated);
    saveCategories(updated);
  }, [categories, saveCategories]);

  const deleteCategory = useCallback((catId: string) => {
    const updated = categories.filter(c => c.id !== catId);
    setCategories(updated);
    saveCategories(updated);
  }, [categories, saveCategories]);

  // Variants
  const addVariant = useCallback((variant: Variant) => {
    const updated = [...variants, variant];
    setVariants(updated);
    saveVariants(updated);
  }, [variants, saveVariants]);

  const updateVariant = useCallback((variant: Variant) => {
    const updated = variants.map(v => v.id === variant.id ? variant : v);
    setVariants(updated);
    saveVariants(updated);
  }, [variants, saveVariants]);

  const deleteVariant = useCallback((variantId: string) => {
    const updated = variants.filter(v => v.id !== variantId);
    setVariants(updated);
    saveVariants(updated);
  }, [variants, saveVariants]);

  const getVariantsForProduct = useCallback((productId: string) => {
    return variants.filter(v => v.productId === productId);
  }, [variants]);

  // Ingredients
  const addIngredient = useCallback((ing: Ingredient) => {
    const updated = [...ingredients, ing];
    setIngredients(updated);
    saveIngredients(updated);
  }, [ingredients, saveIngredients]);

  const updateIngredient = useCallback((ing: Ingredient) => {
    const updated = ingredients.map(i => i.id === ing.id ? ing : i);
    setIngredients(updated);
    saveIngredients(updated);
  }, [ingredients, saveIngredients]);

  const deleteIngredient = useCallback((ingId: string) => {
    const updated = ingredients.filter(i => i.id !== ingId);
    setIngredients(updated);
    saveIngredients(updated);
    const updatedPI = { ...productIngredients };
    Object.keys(updatedPI).forEach(key => {
      updatedPI[key] = updatedPI[key].filter(pi => pi.ingredientId !== ingId);
    });
    setProductIngredients(updatedPI);
    saveProductIngredients(updatedPI);
  }, [ingredients, saveIngredients, productIngredients, saveProductIngredients]);

  const setProductIngredientList = useCallback((productId: string, list: ProductIngredient[]) => {
    const updated = { ...productIngredients, [productId]: list };
    setProductIngredients(updated);
    saveProductIngredients(updated);
  }, [productIngredients, saveProductIngredients]);

  const getProductHPP = useCallback((productId: string) => {
    const list = productIngredients[productId] || [];
    return list.reduce((sum, pi) => {
      const ing = ingredients.find(i => i.id === pi.ingredientId);
      return sum + (ing ? ing.costPerUnit * pi.qty : 0);
    }, 0);
  }, [productIngredients, ingredients]);

  // Printers
  const addPrinter = useCallback((printer: PrinterConfig) => {
    const updated = printer.isDefault
      ? [...printers.map(p => ({ ...p, isDefault: false })), printer]
      : [...printers, printer];
    setPrinters(updated);
    savePrinters(updated);
  }, [printers, savePrinters]);

  const updatePrinter = useCallback((printer: PrinterConfig) => {
    let updated = printers.map(p => p.id === printer.id ? printer : p);
    if (printer.isDefault) {
      updated = updated.map(p => p.id === printer.id ? p : { ...p, isDefault: false });
    }
    setPrinters(updated);
    savePrinters(updated);
  }, [printers, savePrinters]);

  const deletePrinter = useCallback((printerId: string) => {
    const updated = printers.filter(p => p.id !== printerId);
    setPrinters(updated);
    savePrinters(updated);
  }, [printers, savePrinters]);

  // Cart
  const addToCart = useCallback((product: Product) => {
    setCart(prev => {
      const existing = prev.find(c => c.product.id === product.id);
      if (existing) {
        return prev.map(c => c.product.id === product.id ? { ...c, qty: c.qty + 1 } : c);
      }
      return [...prev, { product, qty: 1, discountType: 'percent' as const, discountValue: 0 }];
    });
  }, []);

  const updateCartQty = useCallback((productId: string, qty: number) => {
    if (qty <= 0) {
      setCart(prev => prev.filter(c => c.product.id !== productId));
    } else {
      setCart(prev => prev.map(c => c.product.id === productId ? { ...c, qty } : c));
    }
  }, []);

  const updateCartDiscount = useCallback((productId: string, discountType: 'percent' | 'nominal', discountValue: number) => {
    setCart(prev => prev.map(c => c.product.id === productId ? { ...c, discountType, discountValue } : c));
  }, []);

  const removeFromCart = useCallback((productId: string) => {
    setCart(prev => prev.filter(c => c.product.id !== productId));
  }, []);

  const clearCart = useCallback(() => {
    setCart([]);
    setGlobalDiscount(0);
  }, []);

  const cartTotals = useMemo(() => {
    let subtotal = 0;
    let itemDiscounts = 0;
    cart.forEach(item => {
      const lineTotal = item.product.sellPrice * item.qty;
      subtotal += lineTotal;
      if (item.discountType === 'percent') {
        itemDiscounts += lineTotal * (item.discountValue / 100);
      } else {
        itemDiscounts += item.discountValue;
      }
    });
    const afterItemDiscount = subtotal - itemDiscounts;
    const globalDiscountAmount = afterItemDiscount * (globalDiscount / 100);
    const totalDiscount = itemDiscounts + globalDiscountAmount;
    const afterAllDiscount = subtotal - totalDiscount;
    const taxAmount = settings.taxEnabled ? afterAllDiscount * (settings.taxPercent / 100) : 0;
    const serviceCharge = settings.serviceChargeEnabled ? afterAllDiscount * (settings.serviceChargePercent / 100) : 0;
    const grandTotal = afterAllDiscount + taxAmount + serviceCharge;
    return { subtotal, totalDiscount, taxAmount, serviceCharge, grandTotal, itemCount: cart.reduce((a, c) => a + c.qty, 0) };
  }, [cart, globalDiscount, settings]);

  const completeTransaction = useCallback((cashierId: string, cashierName: string, payments: PaymentSplit[]) => {
    const txn: Transaction = {
      id: 'tx_' + Date.now(),
      invoiceNo: generateInvoiceNo(),
      date: new Date().toISOString(),
      cashierId,
      cashierName,
      items: [...cart],
      subtotal: cartTotals.subtotal,
      discountTotal: cartTotals.totalDiscount,
      taxAmount: cartTotals.taxAmount,
      serviceCharge: cartTotals.serviceCharge,
      grandTotal: cartTotals.grandTotal,
      payments,
      status: 'completed',
    };
    const updated = [txn, ...transactions];
    setTransactions(updated);
    saveTransactions(updated);

    const updatedProducts = products.map(p => {
      const cartItem = cart.find(c => c.product.id === p.id);
      if (cartItem) {
        return { ...p, stock: Math.max(0, p.stock - cartItem.qty) };
      }
      return p;
    });
    setProducts(updatedProducts);
    saveProducts(updatedProducts);

    clearCart();
    return txn;
  }, [cart, cartTotals, transactions, products, saveTransactions, saveProducts, clearCart]);

  const addProduct = useCallback((product: Product) => {
    const updated = [...products, product];
    setProducts(updated);
    saveProducts(updated);
  }, [products, saveProducts]);

  const updateProduct = useCallback((product: Product) => {
    const updated = products.map(p => p.id === product.id ? product : p);
    setProducts(updated);
    saveProducts(updated);
  }, [products, saveProducts]);

  const deleteProduct = useCallback((productId: string) => {
    const updated = products.filter(p => p.id !== productId);
    setProducts(updated);
    saveProducts(updated);
  }, [products, saveProducts]);

  const updateSettings = useCallback(async (newSettings: StoreSettings) => {
    setSettings(newSettings);
    try { await AsyncStorage.setItem('pos_settings', JSON.stringify(newSettings)); } catch (e) { console.log('Failed to save settings', e); }
  }, []);

  const todayTransactions = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    return transactions.filter(t => t.date.slice(0, 10) === today && t.status === 'completed');
  }, [transactions]);

  const todayTotal = useMemo(() => {
    return todayTransactions.reduce((sum, t) => sum + t.grandTotal, 0);
  }, [todayTransactions]);

  const lowStockProducts = useMemo(() => {
    return products.filter(p => p.stock <= p.minStock && p.isActive);
  }, [products]);

  const topProducts = useMemo(() => {
    const counts: Record<string, { product: Product; sold: number }> = {};
    transactions.forEach(t => {
      if (t.status === 'completed') {
        t.items.forEach(item => {
          if (!counts[item.product.id]) {
            counts[item.product.id] = { product: item.product, sold: 0 };
          }
          counts[item.product.id].sold += item.qty;
        });
      }
    });
    return Object.values(counts).sort((a, b) => b.sold - a.sold).slice(0, 5);
  }, [transactions]);

  return {
    products,
    transactions,
    categories,
    variants,
    ingredients,
    productIngredients,
    printers,
    cart,
    settings,
    globalDiscount,
    cartTotals,
    todayTransactions,
    todayTotal,
    lowStockProducts,
    topProducts,
    setGlobalDiscount,
    addToCart,
    updateCartQty,
    updateCartDiscount,
    removeFromCart,
    clearCart,
    completeTransaction,
    addProduct,
    updateProduct,
    deleteProduct,
    updateSettings,
    addCategory,
    updateCategory,
    deleteCategory,
    addVariant,
    updateVariant,
    deleteVariant,
    getVariantsForProduct,
    addIngredient,
    updateIngredient,
    deleteIngredient,
    setProductIngredientList,
    getProductHPP,
    addPrinter,
    updatePrinter,
    deletePrinter,
  };
});
