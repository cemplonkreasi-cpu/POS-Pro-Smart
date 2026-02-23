import React, { useState, useCallback, useMemo } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, Switch,
} from 'react-native';
import { Stack } from 'expo-router';
import { Image } from 'expo-image';
import { Plus, Pencil, Trash2, Tag, X, Check, Layers, Coffee, AlertTriangle } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import Colors from '@/constants/colors';
import { useStore } from '@/contexts/StoreContext';
import { Category, Variant, Product } from '@/types';
import { formatCurrency } from '@/utils/format';

const ICON_OPTIONS = ['coffee', 'cup-soda', 'utensils', 'cookie', 'cake', 'pizza', 'salad', 'sandwich', 'beer', 'wine', 'ice-cream', 'soup'];

export default function ManageCategoriesScreen() {
  const {
    categories, products, variants,
    addCategory, updateCategory, deleteCategory,
    addVariant, updateVariant, deleteVariant,
    addProduct, updateProduct, deleteProduct,
  } = useStore();

  const [activeTab, setActiveTab] = useState<'menu' | 'categories' | 'variants'>('menu');

  const [showCatForm, setShowCatForm] = useState<boolean>(false);
  const [editingCat, setEditingCat] = useState<Category | null>(null);
  const [catName, setCatName] = useState<string>('');
  const [catIcon, setCatIcon] = useState<string>('coffee');

  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [showVarForm, setShowVarForm] = useState<boolean>(false);
  const [editingVar, setEditingVar] = useState<Variant | null>(null);
  const [varName, setVarName] = useState<string>('');
  const [varPrice, setVarPrice] = useState<string>('');

  const [showMenuForm, setShowMenuForm] = useState<boolean>(false);
  const [editingMenu, setEditingMenu] = useState<Product | null>(null);
  const [menuName, setMenuName] = useState<string>('');
  const [menuSku, setMenuSku] = useState<string>('');
  const [menuCategoryId, setMenuCategoryId] = useState<string>(categories[0]?.id || '');
  const [menuImage, setMenuImage] = useState<string>('');
  const [menuBuyPrice, setMenuBuyPrice] = useState<string>('');
  const [menuSellPrice, setMenuSellPrice] = useState<string>('');
  const [menuStock, setMenuStock] = useState<string>('');
  const [menuMinStock, setMenuMinStock] = useState<string>('5');
  const [menuFilterCat, setMenuFilterCat] = useState<string>('all');

  const filteredProducts = useMemo(() => {
    if (menuFilterCat === 'all') return products;
    return products.filter(p => p.categoryId === menuFilterCat);
  }, [products, menuFilterCat]);

  const resetCatForm = useCallback(() => {
    setShowCatForm(false);
    setEditingCat(null);
    setCatName('');
    setCatIcon('coffee');
  }, []);

  const resetVarForm = useCallback(() => {
    setShowVarForm(false);
    setEditingVar(null);
    setVarName('');
    setVarPrice('');
  }, []);

  const resetMenuForm = useCallback(() => {
    setShowMenuForm(false);
    setEditingMenu(null);
    setMenuName('');
    setMenuSku('');
    setMenuCategoryId(categories[0]?.id || '');
    setMenuImage('');
    setMenuBuyPrice('');
    setMenuSellPrice('');
    setMenuStock('');
    setMenuMinStock('5');
  }, [categories]);

  const handleEditCat = useCallback((cat: Category) => {
    setEditingCat(cat);
    setCatName(cat.name);
    setCatIcon(cat.icon);
    setShowCatForm(true);
  }, []);

  const handleSaveCat = useCallback(() => {
    if (!catName.trim()) {
      Alert.alert('Error', 'Nama kategori wajib diisi');
      return;
    }
    if (editingCat) {
      updateCategory({ ...editingCat, name: catName.trim(), icon: catIcon });
    } else {
      addCategory({ id: 'cat_' + Date.now(), name: catName.trim(), icon: catIcon });
    }
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    resetCatForm();
  }, [catName, catIcon, editingCat, addCategory, updateCategory, resetCatForm]);

  const handleDeleteCat = useCallback((cat: Category) => {
    const hasProducts = products.some(p => p.categoryId === cat.id);
    if (hasProducts) {
      Alert.alert('Perhatian', 'Kategori ini masih memiliki produk. Pindahkan produk terlebih dahulu.');
      return;
    }
    Alert.alert('Hapus Kategori', `Hapus "${cat.name}"?`, [
      { text: 'Batal', style: 'cancel' },
      {
        text: 'Hapus', style: 'destructive', onPress: () => {
          deleteCategory(cat.id);
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        },
      },
    ]);
  }, [products, deleteCategory]);

  const handleEditVar = useCallback((v: Variant) => {
    setEditingVar(v);
    setVarName(v.name);
    setVarPrice(v.priceAdjustment.toString());
    setShowVarForm(true);
  }, []);

  const handleSaveVar = useCallback(() => {
    if (!varName.trim()) {
      Alert.alert('Error', 'Nama varian wajib diisi');
      return;
    }
    if (!selectedProductId) return;
    if (editingVar) {
      updateVariant({ ...editingVar, name: varName.trim(), priceAdjustment: parseFloat(varPrice) || 0 });
    } else {
      addVariant({
        id: 'var_' + Date.now(),
        productId: selectedProductId,
        name: varName.trim(),
        priceAdjustment: parseFloat(varPrice) || 0,
      });
    }
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    resetVarForm();
  }, [varName, varPrice, selectedProductId, editingVar, addVariant, updateVariant, resetVarForm]);

  const handleDeleteVar = useCallback((v: Variant) => {
    Alert.alert('Hapus Varian', `Hapus "${v.name}"?`, [
      { text: 'Batal', style: 'cancel' },
      {
        text: 'Hapus', style: 'destructive', onPress: () => {
          deleteVariant(v.id);
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        },
      },
    ]);
  }, [deleteVariant]);

  const handleEditMenu = useCallback((product: Product) => {
    setEditingMenu(product);
    setMenuName(product.name);
    setMenuSku(product.sku);
    setMenuCategoryId(product.categoryId);
    setMenuImage(product.image);
    setMenuBuyPrice(product.buyPrice.toString());
    setMenuSellPrice(product.sellPrice.toString());
    setMenuStock(product.stock.toString());
    setMenuMinStock(product.minStock.toString());
    setShowMenuForm(true);
  }, []);

  const handleSaveMenu = useCallback(() => {
    if (!menuName.trim()) {
      Alert.alert('Error', 'Nama menu wajib diisi');
      return;
    }
    if (!menuSku.trim()) {
      Alert.alert('Error', 'SKU wajib diisi');
      return;
    }
    if (!menuSellPrice || parseFloat(menuSellPrice) <= 0) {
      Alert.alert('Error', 'Harga jual wajib diisi');
      return;
    }

    const product: Product = {
      id: editingMenu ? editingMenu.id : 'prod_' + Date.now(),
      name: menuName.trim(),
      sku: menuSku.trim(),
      categoryId: menuCategoryId,
      image: menuImage.trim() || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=200&h=200&fit=crop',
      buyPrice: parseFloat(menuBuyPrice) || 0,
      sellPrice: parseFloat(menuSellPrice) || 0,
      stock: parseInt(menuStock) || 0,
      minStock: parseInt(menuMinStock) || 5,
      isActive: editingMenu?.isActive ?? true,
    };

    if (editingMenu) {
      updateProduct(product);
    } else {
      addProduct(product);
    }
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    resetMenuForm();
  }, [menuName, menuSku, menuCategoryId, menuImage, menuBuyPrice, menuSellPrice, menuStock, menuMinStock, editingMenu, addProduct, updateProduct, resetMenuForm]);

  const handleDeleteMenu = useCallback((product: Product) => {
    Alert.alert('Hapus Menu', `Yakin hapus "${product.name}"?`, [
      { text: 'Batal', style: 'cancel' },
      {
        text: 'Hapus', style: 'destructive', onPress: () => {
          deleteProduct(product.id);
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        },
      },
    ]);
  }, [deleteProduct]);

  const handleToggleActive = useCallback((product: Product) => {
    updateProduct({ ...product, isActive: !product.isActive });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, [updateProduct]);

  const getCategoryName = useCallback((catId: string) => {
    return categories.find(c => c.id === catId)?.name || '-';
  }, [categories]);

  const productVariants = selectedProductId ? variants.filter(v => v.productId === selectedProductId) : [];
  const selectedProduct = products.find(p => p.id === selectedProductId);

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'Menu & Kategori' }} />

      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'menu' && styles.tabActive]}
          onPress={() => setActiveTab('menu')}
        >
          <Coffee size={16} color={activeTab === 'menu' ? Colors.white : Colors.textSecondary} />
          <Text style={[styles.tabText, activeTab === 'menu' && styles.tabTextActive]}>Menu</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'categories' && styles.tabActive]}
          onPress={() => setActiveTab('categories')}
        >
          <Tag size={16} color={activeTab === 'categories' ? Colors.white : Colors.textSecondary} />
          <Text style={[styles.tabText, activeTab === 'categories' && styles.tabTextActive]}>Kategori</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'variants' && styles.tabActive]}
          onPress={() => setActiveTab('variants')}
        >
          <Layers size={16} color={activeTab === 'variants' ? Colors.white : Colors.textSecondary} />
          <Text style={[styles.tabText, activeTab === 'variants' && styles.tabTextActive]}>Varian</Text>
        </TouchableOpacity>
      </View>

      {activeTab === 'menu' ? (
        <ScrollView contentContainerStyle={styles.content}>
          {showMenuForm && (
            <View style={styles.formCard}>
              <Text style={styles.formTitle}>{editingMenu ? 'Edit Menu' : 'Tambah Menu Baru'}</Text>

              <Text style={styles.fieldLabel}>Nama Menu *</Text>
              <TextInput
                style={styles.input}
                value={menuName}
                onChangeText={setMenuName}
                placeholder="Nama menu"
                placeholderTextColor={Colors.textMuted}
              />

              <Text style={styles.fieldLabel}>SKU / Barcode *</Text>
              <TextInput
                style={styles.input}
                value={menuSku}
                onChangeText={setMenuSku}
                placeholder="SKU001"
                placeholderTextColor={Colors.textMuted}
                autoCapitalize="characters"
              />

              <Text style={styles.fieldLabel}>Kategori</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}>
                {categories.map(cat => (
                  <TouchableOpacity
                    key={cat.id}
                    style={[styles.iconChip, menuCategoryId === cat.id && styles.iconChipActive]}
                    onPress={() => setMenuCategoryId(cat.id)}
                  >
                    <Text style={[styles.iconChipText, menuCategoryId === cat.id && styles.iconChipTextActive]}>{cat.name}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <Text style={styles.fieldLabel}>URL Gambar</Text>
              <TextInput
                style={styles.input}
                value={menuImage}
                onChangeText={setMenuImage}
                placeholder="https://..."
                placeholderTextColor={Colors.textMuted}
                autoCapitalize="none"
              />

              <View style={styles.rowInputs}>
                <View style={styles.halfInput}>
                  <Text style={styles.fieldLabel}>Harga Beli</Text>
                  <TextInput
                    style={styles.input}
                    value={menuBuyPrice}
                    onChangeText={setMenuBuyPrice}
                    placeholder="0"
                    placeholderTextColor={Colors.textMuted}
                    keyboardType="numeric"
                  />
                </View>
                <View style={styles.halfInput}>
                  <Text style={styles.fieldLabel}>Harga Jual *</Text>
                  <TextInput
                    style={styles.input}
                    value={menuSellPrice}
                    onChangeText={setMenuSellPrice}
                    placeholder="0"
                    placeholderTextColor={Colors.textMuted}
                    keyboardType="numeric"
                  />
                </View>
              </View>

              <View style={styles.rowInputs}>
                <View style={styles.halfInput}>
                  <Text style={styles.fieldLabel}>Stok</Text>
                  <TextInput
                    style={styles.input}
                    value={menuStock}
                    onChangeText={setMenuStock}
                    placeholder="0"
                    placeholderTextColor={Colors.textMuted}
                    keyboardType="numeric"
                  />
                </View>
                <View style={styles.halfInput}>
                  <Text style={styles.fieldLabel}>Stok Minimum</Text>
                  <TextInput
                    style={styles.input}
                    value={menuMinStock}
                    onChangeText={setMenuMinStock}
                    placeholder="5"
                    placeholderTextColor={Colors.textMuted}
                    keyboardType="numeric"
                  />
                </View>
              </View>

              <View style={styles.formActions}>
                <TouchableOpacity style={styles.cancelBtn} onPress={resetMenuForm}>
                  <X size={16} color={Colors.textSecondary} />
                  <Text style={styles.cancelBtnText}>Batal</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.confirmBtn} onPress={handleSaveMenu}>
                  <Check size={16} color={Colors.white} />
                  <Text style={styles.confirmBtnText}>Simpan</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {!showMenuForm && (
            <>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
                <TouchableOpacity
                  style={[styles.filterChip, menuFilterCat === 'all' && styles.filterChipActive]}
                  onPress={() => setMenuFilterCat('all')}
                >
                  <Text style={[styles.filterChipText, menuFilterCat === 'all' && styles.filterChipTextActive]}>
                    Semua ({products.length})
                  </Text>
                </TouchableOpacity>
                {categories.map(cat => {
                  const count = products.filter(p => p.categoryId === cat.id).length;
                  return (
                    <TouchableOpacity
                      key={cat.id}
                      style={[styles.filterChip, menuFilterCat === cat.id && styles.filterChipActive]}
                      onPress={() => setMenuFilterCat(cat.id)}
                    >
                      <Text style={[styles.filterChipText, menuFilterCat === cat.id && styles.filterChipTextActive]}>
                        {cat.name} ({count})
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </>
          )}

          {!showMenuForm && filteredProducts.map(product => (
            <View key={product.id} style={[styles.menuItem, !product.isActive && styles.menuItemInactive]}>
              <Image source={{ uri: product.image }} style={styles.menuImage} contentFit="cover" />
              <View style={styles.menuInfo}>
                <View style={styles.menuTopRow}>
                  <Text style={styles.menuName} numberOfLines={1}>{product.name}</Text>
                  <Switch
                    value={product.isActive}
                    onValueChange={() => handleToggleActive(product)}
                    trackColor={{ false: Colors.border, true: Colors.accentLight }}
                    thumbColor={product.isActive ? Colors.accent : Colors.textMuted}
                  />
                </View>
                <Text style={styles.menuMeta}>{product.sku} • {getCategoryName(product.categoryId)}</Text>
                <View style={styles.menuPriceRow}>
                  <Text style={styles.menuPrice}>{formatCurrency(product.sellPrice)}</Text>
                  {product.stock <= product.minStock && (
                    <View style={styles.lowStockBadge}>
                      <AlertTriangle size={10} color={Colors.warning} />
                      <Text style={styles.lowStockText}>Stok: {product.stock}</Text>
                    </View>
                  )}
                </View>
                <View style={styles.menuActions}>
                  <TouchableOpacity style={styles.editIconBtn} onPress={() => handleEditMenu(product)}>
                    <Pencil size={14} color={Colors.accent} />
                    <Text style={styles.editIconText}>Edit</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.deleteIconBtn} onPress={() => handleDeleteMenu(product)}>
                    <Trash2 size={14} color={Colors.danger} />
                    <Text style={styles.deleteIconText}>Hapus</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ))}

          {!showMenuForm && filteredProducts.length === 0 && (
            <View style={styles.emptyBox}>
              <Coffee size={32} color={Colors.textMuted} />
              <Text style={styles.emptyText}>Tidak ada menu</Text>
            </View>
          )}

          {!showMenuForm && (
            <TouchableOpacity style={styles.addBtn} onPress={() => setShowMenuForm(true)}>
              <Plus size={18} color={Colors.white} />
              <Text style={styles.addBtnText}>Tambah Menu</Text>
            </TouchableOpacity>
          )}
          <View style={{ height: 40 }} />
        </ScrollView>
      ) : activeTab === 'categories' ? (
        <ScrollView contentContainerStyle={styles.content}>
          {showCatForm && (
            <View style={styles.formCard}>
              <Text style={styles.formTitle}>{editingCat ? 'Edit Kategori' : 'Tambah Kategori'}</Text>
              <TextInput
                style={styles.input}
                value={catName}
                onChangeText={setCatName}
                placeholder="Nama kategori"
                placeholderTextColor={Colors.textMuted}
              />
              <Text style={styles.fieldLabel}>Icon</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}>
                {ICON_OPTIONS.map(icon => (
                  <TouchableOpacity
                    key={icon}
                    style={[styles.iconChip, catIcon === icon && styles.iconChipActive]}
                    onPress={() => setCatIcon(icon)}
                  >
                    <Text style={[styles.iconChipText, catIcon === icon && styles.iconChipTextActive]}>{icon}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
              <View style={styles.formActions}>
                <TouchableOpacity style={styles.cancelBtn} onPress={resetCatForm}>
                  <X size={16} color={Colors.textSecondary} />
                  <Text style={styles.cancelBtnText}>Batal</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.confirmBtn} onPress={handleSaveCat}>
                  <Check size={16} color={Colors.white} />
                  <Text style={styles.confirmBtnText}>Simpan</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {categories.map(cat => {
            const count = products.filter(p => p.categoryId === cat.id).length;
            return (
              <View key={cat.id} style={styles.listItem}>
                <View style={styles.listItemLeft}>
                  <View style={styles.catIconCircle}>
                    <Tag size={18} color={Colors.accent} />
                  </View>
                  <View>
                    <Text style={styles.listItemTitle}>{cat.name}</Text>
                    <Text style={styles.listItemSub}>{count} produk</Text>
                  </View>
                </View>
                <View style={styles.listItemActions}>
                  <TouchableOpacity style={styles.editBtn} onPress={() => handleEditCat(cat)}>
                    <Pencil size={15} color={Colors.accent} />
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.deleteBtn} onPress={() => handleDeleteCat(cat)}>
                    <Trash2 size={15} color={Colors.danger} />
                  </TouchableOpacity>
                </View>
              </View>
            );
          })}

          {!showCatForm && (
            <TouchableOpacity style={styles.addBtn} onPress={() => setShowCatForm(true)}>
              <Plus size={18} color={Colors.white} />
              <Text style={styles.addBtnText}>Tambah Kategori</Text>
            </TouchableOpacity>
          )}
          <View style={{ height: 40 }} />
        </ScrollView>
      ) : (
        <ScrollView contentContainerStyle={styles.content}>
          <Text style={styles.sectionLabel}>Pilih Produk</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.productScroll}>
            {products.filter(p => p.isActive).map(p => (
              <TouchableOpacity
                key={p.id}
                style={[styles.productChip, selectedProductId === p.id && styles.productChipActive]}
                onPress={() => { setSelectedProductId(p.id); resetVarForm(); }}
              >
                <Text style={[styles.productChipText, selectedProductId === p.id && styles.productChipTextActive]}>{p.name}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {selectedProduct && (
            <>
              <Text style={styles.sectionLabel}>Varian untuk "{selectedProduct.name}"</Text>

              {showVarForm && (
                <View style={styles.formCard}>
                  <Text style={styles.formTitle}>{editingVar ? 'Edit Varian' : 'Tambah Varian'}</Text>
                  <TextInput
                    style={styles.input}
                    value={varName}
                    onChangeText={setVarName}
                    placeholder="Nama varian (contoh: Hot, Iced, Large)"
                    placeholderTextColor={Colors.textMuted}
                  />
                  <View style={{ height: 10 }} />
                  <Text style={styles.fieldLabel}>Selisih Harga (Rp)</Text>
                  <TextInput
                    style={styles.input}
                    value={varPrice}
                    onChangeText={setVarPrice}
                    placeholder="0"
                    placeholderTextColor={Colors.textMuted}
                    keyboardType="numeric"
                  />
                  <View style={styles.formActions}>
                    <TouchableOpacity style={styles.cancelBtn} onPress={resetVarForm}>
                      <X size={16} color={Colors.textSecondary} />
                      <Text style={styles.cancelBtnText}>Batal</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.confirmBtn} onPress={handleSaveVar}>
                      <Check size={16} color={Colors.white} />
                      <Text style={styles.confirmBtnText}>Simpan</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}

              {productVariants.length === 0 && !showVarForm && (
                <View style={styles.emptyBox}>
                  <Text style={styles.emptyText}>Belum ada varian untuk produk ini</Text>
                </View>
              )}

              {productVariants.map(v => (
                <View key={v.id} style={styles.listItem}>
                  <View style={styles.listItemLeft}>
                    <View style={[styles.catIconCircle, { backgroundColor: Colors.warningLight }]}>
                      <Layers size={18} color={Colors.warning} />
                    </View>
                    <View>
                      <Text style={styles.listItemTitle}>{v.name}</Text>
                      <Text style={styles.listItemSub}>
                        {v.priceAdjustment > 0 ? `+Rp ${v.priceAdjustment.toLocaleString('id-ID')}` : 'Tanpa tambahan harga'}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.listItemActions}>
                    <TouchableOpacity style={styles.editBtn} onPress={() => handleEditVar(v)}>
                      <Pencil size={15} color={Colors.accent} />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.deleteBtn} onPress={() => handleDeleteVar(v)}>
                      <Trash2 size={15} color={Colors.danger} />
                    </TouchableOpacity>
                  </View>
                </View>
              ))}

              {!showVarForm && (
                <TouchableOpacity style={styles.addBtn} onPress={() => setShowVarForm(true)}>
                  <Plus size={18} color={Colors.white} />
                  <Text style={styles.addBtnText}>Tambah Varian</Text>
                </TouchableOpacity>
              )}
            </>
          )}

          {!selectedProduct && (
            <View style={styles.emptyBox}>
              <Layers size={32} color={Colors.textMuted} />
              <Text style={styles.emptyText}>Pilih produk untuk mengelola varian</Text>
            </View>
          )}
          <View style={{ height: 40 }} />
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  tabBar: { flexDirection: 'row', paddingHorizontal: 16, paddingTop: 12, gap: 6 },
  tab: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 5, paddingVertical: 10, borderRadius: 12,
    backgroundColor: Colors.white, borderWidth: 1, borderColor: Colors.border,
  },
  tabActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  tabText: { fontSize: 13, fontWeight: '600' as const, color: Colors.textSecondary },
  tabTextActive: { color: Colors.white },
  content: { padding: 16 },
  sectionLabel: { fontSize: 14, fontWeight: '700' as const, color: Colors.text, marginBottom: 10, marginTop: 4 },
  filterScroll: { marginBottom: 14 },
  filterChip: {
    paddingHorizontal: 14, paddingVertical: 7, borderRadius: 10,
    backgroundColor: Colors.white, borderWidth: 1, borderColor: Colors.border, marginRight: 8,
  },
  filterChipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  filterChipText: { fontSize: 12, fontWeight: '500' as const, color: Colors.textSecondary },
  filterChipTextActive: { color: Colors.white },
  productScroll: { marginBottom: 16 },
  productChip: {
    paddingHorizontal: 16, paddingVertical: 8, borderRadius: 10,
    backgroundColor: Colors.white, borderWidth: 1, borderColor: Colors.border, marginRight: 8,
  },
  productChipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  productChipText: { fontSize: 13, fontWeight: '500' as const, color: Colors.textSecondary },
  productChipTextActive: { color: Colors.white },
  formCard: {
    backgroundColor: Colors.white, borderRadius: 16, padding: 16, marginBottom: 16,
    shadowColor: Colors.shadow, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 3,
  },
  formTitle: { fontSize: 15, fontWeight: '700' as const, color: Colors.text, marginBottom: 12 },
  fieldLabel: { fontSize: 13, fontWeight: '600' as const, color: Colors.textSecondary, marginBottom: 6, marginTop: 10 },
  input: {
    backgroundColor: Colors.surface, borderRadius: 12, height: 48,
    paddingHorizontal: 14, fontSize: 14, color: Colors.text,
    borderWidth: 1, borderColor: Colors.border,
  },
  chipScroll: { marginBottom: 8, marginTop: 4 },
  iconChip: {
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10,
    backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border, marginRight: 8,
  },
  iconChipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  iconChipText: { fontSize: 12, fontWeight: '500' as const, color: Colors.textSecondary },
  iconChipTextActive: { color: Colors.white },
  rowInputs: { flexDirection: 'row', gap: 10 },
  halfInput: { flex: 1 },
  formActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 10, marginTop: 14 },
  cancelBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 16, paddingVertical: 10, borderRadius: 10,
    backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border,
  },
  cancelBtnText: { fontSize: 13, fontWeight: '600' as const, color: Colors.textSecondary },
  confirmBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 16, paddingVertical: 10, borderRadius: 10, backgroundColor: Colors.accent,
  },
  confirmBtnText: { fontSize: 13, fontWeight: '700' as const, color: Colors.white },
  menuItem: {
    flexDirection: 'row',
    backgroundColor: Colors.white, borderRadius: 14, overflow: 'hidden', marginBottom: 10,
    shadowColor: Colors.shadow, shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 4, elevation: 2,
  },
  menuItemInactive: { opacity: 0.5 },
  menuImage: { width: 80, height: 'auto', minHeight: 96, backgroundColor: Colors.surface },
  menuInfo: { flex: 1, padding: 12 },
  menuTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  menuName: { fontSize: 14, fontWeight: '700' as const, color: Colors.text, flex: 1, marginRight: 8 },
  menuMeta: { fontSize: 11, color: Colors.textMuted, marginTop: 2 },
  menuPriceRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 6 },
  menuPrice: { fontSize: 14, fontWeight: '700' as const, color: Colors.accent },
  lowStockBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 3,
    paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6, backgroundColor: Colors.warningLight,
  },
  lowStockText: { fontSize: 10, fontWeight: '600' as const, color: Colors.warning },
  menuActions: { flexDirection: 'row', gap: 8, marginTop: 8 },
  editIconBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 10, paddingVertical: 5, borderRadius: 6, backgroundColor: Colors.accentSoft,
  },
  editIconText: { fontSize: 12, fontWeight: '600' as const, color: Colors.accent },
  deleteIconBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 10, paddingVertical: 5, borderRadius: 6, backgroundColor: Colors.dangerLight,
  },
  deleteIconText: { fontSize: 12, fontWeight: '600' as const, color: Colors.danger },
  listItem: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: Colors.white, borderRadius: 14, padding: 14, marginBottom: 10,
    shadowColor: Colors.shadow, shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 4, elevation: 2,
  },
  listItemLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  catIconCircle: {
    width: 40, height: 40, borderRadius: 12, backgroundColor: Colors.accentSoft,
    alignItems: 'center', justifyContent: 'center',
  },
  listItemTitle: { fontSize: 15, fontWeight: '600' as const, color: Colors.text },
  listItemSub: { fontSize: 12, color: Colors.textSecondary, marginTop: 2 },
  listItemActions: { flexDirection: 'row', gap: 8 },
  editBtn: {
    width: 36, height: 36, borderRadius: 10, backgroundColor: Colors.accentSoft,
    alignItems: 'center', justifyContent: 'center',
  },
  deleteBtn: {
    width: 36, height: 36, borderRadius: 10, backgroundColor: Colors.dangerLight,
    alignItems: 'center', justifyContent: 'center',
  },
  addBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: Colors.accent, borderRadius: 14, height: 50, marginTop: 8,
    shadowColor: Colors.accent, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 6,
  },
  addBtnText: { fontSize: 15, fontWeight: '700' as const, color: Colors.white },
  emptyBox: {
    alignItems: 'center', justifyContent: 'center', paddingVertical: 32,
    backgroundColor: Colors.white, borderRadius: 16, marginBottom: 16, gap: 8,
  },
  emptyText: { fontSize: 14, color: Colors.textMuted },
});
