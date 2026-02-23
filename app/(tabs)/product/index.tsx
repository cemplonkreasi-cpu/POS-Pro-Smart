import React, { useState, useMemo, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, Alert, Switch,
} from 'react-native';
import { router } from 'expo-router';
import { Image } from 'expo-image';
import {
  Search, Plus, Edit3, Trash2, Package, X, AlertTriangle,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import Colors from '@/constants/colors';
import { useStore } from '@/contexts/StoreContext';
import { formatCurrency } from '@/utils/format';
import { Product } from '@/types';

export default function ProductsScreen() {
  const { products, categories, deleteProduct, updateProduct } = useStore();
  const [search, setSearch] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const filtered = useMemo(() => {
    let list = [...products];
    if (selectedCategory !== 'all') {
      list = list.filter(p => p.categoryId === selectedCategory);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q)
      );
    }
    return list;
  }, [products, selectedCategory, search]);

  const handleDelete = useCallback((product: Product) => {
    Alert.alert(
      'Hapus Produk',
      `Yakin hapus "${product.name}"?`,
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Hapus', style: 'destructive',
          onPress: () => {
            deleteProduct(product.id);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          }
        },
      ]
    );
  }, [deleteProduct]);

  const toggleActive = useCallback((product: Product) => {
    updateProduct({ ...product, isActive: !product.isActive });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, [updateProduct]);

  const getCategoryName = useCallback((catId: string) => {
    return categories.find(c => c.id === catId)?.name || '-';
  }, [categories]);

  const renderProduct = useCallback(({ item }: { item: Product }) => (
    <View style={[styles.productCard, !item.isActive && styles.productCardInactive]}>
      <Image source={{ uri: item.image }} style={styles.productImage} contentFit="cover" />
      <View style={styles.productInfo}>
        <View style={styles.productHeader}>
          <Text style={styles.productName} numberOfLines={1}>{item.name}</Text>
          <Switch
            value={item.isActive}
            onValueChange={() => toggleActive(item)}
            trackColor={{ false: Colors.border, true: Colors.accentLight }}
            thumbColor={item.isActive ? Colors.accent : Colors.textMuted}
          />
        </View>
        <Text style={styles.productSku}>{item.sku} • {getCategoryName(item.categoryId)}</Text>
        <View style={styles.priceRow}>
          <View>
            <Text style={styles.priceLabel}>Beli</Text>
            <Text style={styles.buyPrice}>{formatCurrency(item.buyPrice)}</Text>
          </View>
          <View>
            <Text style={styles.priceLabel}>Jual</Text>
            <Text style={styles.sellPrice}>{formatCurrency(item.sellPrice)}</Text>
          </View>
          <View style={[styles.stockBadge, item.stock <= item.minStock && styles.stockBadgeLow]}>
            {item.stock <= item.minStock && <AlertTriangle size={12} color={Colors.warning} />}
            <Text style={[styles.stockText, item.stock <= item.minStock && styles.stockTextLow]}>
              Stok: {item.stock}
            </Text>
          </View>
        </View>
        <View style={styles.actionRow}>
          <TouchableOpacity
            style={styles.editBtn}
            onPress={() => router.push({ pathname: '/product-form' as any, params: { id: item.id } })}
            activeOpacity={0.7}
          >
            <Edit3 size={14} color={Colors.accent} />
            <Text style={styles.editBtnText}>Edit</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.deleteBtn}
            onPress={() => handleDelete(item)}
            activeOpacity={0.7}
          >
            <Trash2 size={14} color={Colors.danger} />
            <Text style={styles.deleteBtnText}>Hapus</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  ), [getCategoryName, handleDelete, toggleActive]);

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <View style={styles.searchBar}>
          <Search size={18} color={Colors.textMuted} />
          <TextInput
            style={styles.searchInput}
            placeholder="Cari produk..."
            placeholderTextColor={Colors.textMuted}
            value={search}
            onChangeText={setSearch}
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch('')}>
              <X size={18} color={Colors.textMuted} />
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => router.push('/product-form' as any)}
          activeOpacity={0.7}
        >
          <Plus size={20} color={Colors.white} />
        </TouchableOpacity>
      </View>

      <View style={styles.categoryRow}>
        <TouchableOpacity
          style={[styles.catChip, selectedCategory === 'all' && styles.catChipActive]}
          onPress={() => setSelectedCategory('all')}
        >
          <Text style={[styles.catChipText, selectedCategory === 'all' && styles.catChipTextActive]}>
            Semua ({products.length})
          </Text>
        </TouchableOpacity>
        {categories.map(cat => {
          const count = products.filter(p => p.categoryId === cat.id).length;
          return (
            <TouchableOpacity
              key={cat.id}
              style={[styles.catChip, selectedCategory === cat.id && styles.catChipActive]}
              onPress={() => setSelectedCategory(cat.id)}
            >
              <Text style={[styles.catChipText, selectedCategory === cat.id && styles.catChipTextActive]}>
                {cat.name} ({count})
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <FlatList
        data={filtered}
        renderItem={renderProduct}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Package size={48} color={Colors.textMuted} />
            <Text style={styles.emptyText}>Tidak ada produk</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingTop: 12,
    gap: 10,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 44,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: Colors.text,
  },
  addBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: Colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 12,
    paddingTop: 12,
    gap: 6,
  },
  catChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  catChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  catChipText: {
    fontSize: 12,
    fontWeight: '500' as const,
    color: Colors.textSecondary,
  },
  catChipTextActive: {
    color: Colors.white,
  },
  list: {
    padding: 12,
    paddingBottom: 24,
  },
  productCard: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    borderRadius: 14,
    overflow: 'hidden',
    marginBottom: 10,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  productCardInactive: {
    opacity: 0.5,
  },
  productImage: {
    width: 90,
    height: 'auto',
    minHeight: 100,
    backgroundColor: Colors.surface,
  },
  productInfo: {
    flex: 1,
    padding: 12,
  },
  productHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  productName: {
    fontSize: 15,
    fontWeight: '700' as const,
    color: Colors.text,
    flex: 1,
    marginRight: 8,
  },
  productSku: {
    fontSize: 11,
    color: Colors.textMuted,
    marginTop: 2,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginTop: 8,
  },
  priceLabel: {
    fontSize: 10,
    color: Colors.textMuted,
  },
  buyPrice: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: Colors.textSecondary,
  },
  sellPrice: {
    fontSize: 13,
    fontWeight: '700' as const,
    color: Colors.accent,
  },
  stockBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    backgroundColor: Colors.surface,
  },
  stockBadgeLow: {
    backgroundColor: Colors.warningLight,
  },
  stockText: {
    fontSize: 11,
    fontWeight: '600' as const,
    color: Colors.textSecondary,
  },
  stockTextLow: {
    color: Colors.warning,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 10,
  },
  editBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    backgroundColor: Colors.accentSoft,
  },
  editBtnText: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: Colors.accent,
  },
  deleteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    backgroundColor: Colors.dangerLight,
  },
  deleteBtnText: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: Colors.danger,
  },
  empty: {
    alignItems: 'center',
    paddingVertical: 60,
    gap: 12,
  },
  emptyText: {
    fontSize: 14,
    color: Colors.textMuted,
  },
});
