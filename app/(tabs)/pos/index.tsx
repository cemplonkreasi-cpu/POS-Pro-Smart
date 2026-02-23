import React, { useState, useCallback, useMemo } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput,
  FlatList, Alert,
} from 'react-native';
import { router } from 'expo-router';
import { Image } from 'expo-image';
import {
  Search, X, Plus, Minus, Trash2, ShoppingBag,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import Colors from '@/constants/colors';
import { useStore } from '@/contexts/StoreContext';
import { formatCurrency } from '@/utils/format';
import { Product } from '@/types';

export default function POSScreen() {
  const {
    products, categories, cart, cartTotals,
    addToCart, updateCartQty, removeFromCart,
  } = useStore();
  const [search, setSearch] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showCart, setShowCart] = useState<boolean>(false);

  const filteredProducts = useMemo(() => {
    let list = products.filter(p => p.isActive);
    if (selectedCategory !== 'all') {
      list = list.filter(p => p.categoryId === selectedCategory);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(p =>
        p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q)
      );
    }
    return list;
  }, [products, selectedCategory, search]);

  const handleAddToCart = useCallback((product: Product) => {
    if (product.stock <= 0) {
      Alert.alert('Stok Habis', 'Produk ini sedang tidak tersedia');
      return;
    }
    addToCart(product);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, [addToCart]);

  const handleCheckout = useCallback(() => {
    if (cart.length === 0) {
      Alert.alert('Keranjang Kosong', 'Tambahkan produk terlebih dahulu');
      return;
    }
    router.push('/checkout' as any);
  }, [cart]);

  const getCartQty = useCallback((productId: string): number => {
    const item = cart.find(c => c.product.id === productId);
    return item?.qty || 0;
  }, [cart]);

  const renderProduct = useCallback(({ item }: { item: Product }) => {
    const qty = getCartQty(item.id);
    return (
      <TouchableOpacity
        style={[styles.productCard, qty > 0 && styles.productCardInCart]}
        onPress={() => handleAddToCart(item)}
        activeOpacity={0.7}
      >
        <Image
          source={{ uri: item.image }}
          style={styles.productImage}
          contentFit="cover"
        />
        {qty > 0 && (
          <View style={styles.qtyBadge}>
            <Text style={styles.qtyBadgeText}>{qty}</Text>
          </View>
        )}
        <View style={styles.productInfo}>
          <Text style={styles.productName} numberOfLines={1}>{item.name}</Text>
          <Text style={styles.productPrice}>{formatCurrency(item.sellPrice)}</Text>
          <Text style={styles.productStock}>Stok: {item.stock}</Text>
        </View>
      </TouchableOpacity>
    );
  }, [getCartQty, handleAddToCart]);

  return (
    <View style={styles.container}>
      <View style={styles.searchBar}>
        <Search size={18} color={Colors.textMuted} />
        <TextInput
          style={styles.searchInput}
          placeholder="Cari produk..."
          placeholderTextColor={Colors.textMuted}
          value={search}
          onChangeText={setSearch}
          testID="search-input"
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch('')}>
            <X size={18} color={Colors.textMuted} />
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.categoryRow}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryScroll}>
          <TouchableOpacity
            style={[styles.categoryChip, selectedCategory === 'all' && styles.categoryChipActive]}
            onPress={() => setSelectedCategory('all')}
            activeOpacity={0.7}
          >
            <Text style={[styles.categoryChipText, selectedCategory === 'all' && styles.categoryChipTextActive]}>Semua</Text>
          </TouchableOpacity>
          {categories.map(cat => (
            <TouchableOpacity
              key={cat.id}
              style={[styles.categoryChip, selectedCategory === cat.id && styles.categoryChipActive]}
              onPress={() => setSelectedCategory(cat.id)}
              activeOpacity={0.7}
            >
              <Text style={[styles.categoryChipText, selectedCategory === cat.id && styles.categoryChipTextActive]}>{cat.name}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <FlatList
        data={filteredProducts}
        renderItem={renderProduct}
        keyExtractor={item => item.id}
        numColumns={3}
        contentContainerStyle={styles.productGrid}
        columnWrapperStyle={styles.productRow}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>Produk tidak ditemukan</Text>
          </View>
        }
      />

      {cart.length > 0 && !showCart && (
        <TouchableOpacity
          style={styles.cartFloating}
          onPress={() => setShowCart(true)}
          activeOpacity={0.85}
        >
          <View style={styles.cartFloatingLeft}>
            <ShoppingBag size={20} color={Colors.white} />
            <View style={styles.cartBadge}>
              <Text style={styles.cartBadgeText}>{cartTotals.itemCount}</Text>
            </View>
          </View>
          <Text style={styles.cartFloatingTotal}>{formatCurrency(cartTotals.grandTotal)}</Text>
          <Text style={styles.cartFloatingBtn}>Lihat</Text>
        </TouchableOpacity>
      )}

      {showCart && (
        <View style={styles.cartPanel}>
          <View style={styles.cartHeader}>
            <Text style={styles.cartTitle}>Keranjang ({cartTotals.itemCount})</Text>
            <TouchableOpacity onPress={() => setShowCart(false)}>
              <X size={22} color={Colors.text} />
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.cartList} showsVerticalScrollIndicator={false}>
            {cart.map(item => (
              <View key={item.product.id} style={styles.cartItem}>
                <View style={styles.cartItemInfo}>
                  <Text style={styles.cartItemName} numberOfLines={1}>{item.product.name}</Text>
                  <Text style={styles.cartItemPrice}>{formatCurrency(item.product.sellPrice)}</Text>
                </View>
                <View style={styles.cartItemActions}>
                  <TouchableOpacity
                    style={styles.qtyBtn}
                    onPress={() => updateCartQty(item.product.id, item.qty - 1)}
                  >
                    <Minus size={14} color={Colors.text} />
                  </TouchableOpacity>
                  <Text style={styles.qtyText}>{item.qty}</Text>
                  <TouchableOpacity
                    style={styles.qtyBtn}
                    onPress={() => updateCartQty(item.product.id, item.qty + 1)}
                  >
                    <Plus size={14} color={Colors.text} />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.removeBtn}
                    onPress={() => {
                      removeFromCart(item.product.id);
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                    }}
                  >
                    <Trash2 size={14} color={Colors.danger} />
                  </TouchableOpacity>
                </View>
                <Text style={styles.cartItemTotal}>
                  {formatCurrency(item.product.sellPrice * item.qty)}
                </Text>
              </View>
            ))}
          </ScrollView>
          <View style={styles.cartSummary}>
            <View style={styles.cartSummaryRow}>
              <Text style={styles.cartSummaryLabel}>Subtotal</Text>
              <Text style={styles.cartSummaryValue}>{formatCurrency(cartTotals.subtotal)}</Text>
            </View>
            {cartTotals.totalDiscount > 0 && (
              <View style={styles.cartSummaryRow}>
                <Text style={styles.cartSummaryLabel}>Diskon</Text>
                <Text style={[styles.cartSummaryValue, { color: Colors.danger }]}>-{formatCurrency(cartTotals.totalDiscount)}</Text>
              </View>
            )}
            {cartTotals.taxAmount > 0 && (
              <View style={styles.cartSummaryRow}>
                <Text style={styles.cartSummaryLabel}>Pajak</Text>
                <Text style={styles.cartSummaryValue}>{formatCurrency(cartTotals.taxAmount)}</Text>
              </View>
            )}
            {cartTotals.serviceCharge > 0 && (
              <View style={styles.cartSummaryRow}>
                <Text style={styles.cartSummaryLabel}>Service</Text>
                <Text style={styles.cartSummaryValue}>{formatCurrency(cartTotals.serviceCharge)}</Text>
              </View>
            )}
            <View style={[styles.cartSummaryRow, styles.cartTotalRow]}>
              <Text style={styles.cartTotalLabel}>Total</Text>
              <Text style={styles.cartTotalValue}>{formatCurrency(cartTotals.grandTotal)}</Text>
            </View>
            <TouchableOpacity
              style={styles.checkoutBtn}
              onPress={handleCheckout}
              activeOpacity={0.8}
            >
              <Text style={styles.checkoutBtnText}>Bayar</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    marginHorizontal: 12,
    marginTop: 12,
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 44,
    gap: 8,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: Colors.text,
  },
  categoryRow: {
    marginTop: 12,
  },
  categoryScroll: {
    paddingHorizontal: 12,
    gap: 8,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  categoryChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  categoryChipText: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: Colors.textSecondary,
  },
  categoryChipTextActive: {
    color: Colors.white,
  },
  productGrid: {
    padding: 12,
    paddingBottom: 100,
  },
  productRow: {
    gap: 8,
  },
  productCard: {
    flex: 1,
    backgroundColor: Colors.white,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 8,
    maxWidth: '32%',
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  productCardInCart: {
    borderWidth: 2,
    borderColor: Colors.accent,
  },
  productImage: {
    width: '100%',
    height: 80,
    backgroundColor: Colors.surface,
  },
  qtyBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: Colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qtyBadgeText: {
    fontSize: 11,
    fontWeight: '700' as const,
    color: Colors.white,
  },
  productInfo: {
    padding: 8,
  },
  productName: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: Colors.text,
  },
  productPrice: {
    fontSize: 12,
    fontWeight: '700' as const,
    color: Colors.accent,
    marginTop: 2,
  },
  productStock: {
    fontSize: 10,
    color: Colors.textMuted,
    marginTop: 2,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 14,
    color: Colors.textMuted,
  },
  cartFloating: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 18,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 10,
  },
  cartFloatingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cartBadge: {
    backgroundColor: Colors.accent,
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: -6,
    marginTop: -10,
  },
  cartBadgeText: {
    fontSize: 10,
    fontWeight: '700' as const,
    color: Colors.white,
  },
  cartFloatingTotal: {
    flex: 1,
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.white,
    textAlign: 'center',
  },
  cartFloatingBtn: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: Colors.accentLight,
  },
  cartPanel: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '70%',
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: -8 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 20,
  },
  cartHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  cartTitle: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.text,
  },
  cartList: {
    maxHeight: 200,
    paddingHorizontal: 20,
  },
  cartItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  cartItemInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  cartItemName: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.text,
    flex: 1,
  },
  cartItemPrice: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  cartItemActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  qtyBtn: {
    width: 30,
    height: 30,
    borderRadius: 8,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  qtyText: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: Colors.text,
    minWidth: 24,
    textAlign: 'center',
  },
  removeBtn: {
    marginLeft: 8,
    padding: 6,
  },
  cartItemTotal: {
    fontSize: 13,
    fontWeight: '700' as const,
    color: Colors.accent,
    textAlign: 'right',
    marginTop: 4,
  },
  cartSummary: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  cartSummaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  cartSummaryLabel: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  cartSummaryValue: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: Colors.text,
  },
  cartTotalRow: {
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: 10,
    marginTop: 4,
    marginBottom: 12,
  },
  cartTotalLabel: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.text,
  },
  cartTotalValue: {
    fontSize: 18,
    fontWeight: '800' as const,
    color: Colors.accent,
  },
  checkoutBtn: {
    backgroundColor: Colors.accent,
    borderRadius: 14,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  checkoutBtnText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.white,
  },
});
