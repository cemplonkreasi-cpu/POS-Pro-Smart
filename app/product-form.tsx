import React, { useState, useCallback, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Stack } from 'expo-router';
import { Save } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import Colors from '@/constants/colors';
import { useStore } from '@/contexts/StoreContext';
import { Product } from '@/types';

export default function ProductFormScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { products, categories, addProduct, updateProduct } = useStore();
  const isEdit = !!id;

  const existing = isEdit ? products.find(p => p.id === id) : null;

  const [name, setName] = useState<string>(existing?.name || '');
  const [sku, setSku] = useState<string>(existing?.sku || '');
  const [categoryId, setCategoryId] = useState<string>(existing?.categoryId || categories[0]?.id || '');
  const [image, setImage] = useState<string>(existing?.image || '');
  const [buyPrice, setBuyPrice] = useState<string>(existing ? existing.buyPrice.toString() : '');
  const [sellPrice, setSellPrice] = useState<string>(existing ? existing.sellPrice.toString() : '');
  const [stock, setStock] = useState<string>(existing ? existing.stock.toString() : '');
  const [minStock, setMinStock] = useState<string>(existing ? existing.minStock.toString() : '5');

  const handleSave = useCallback(() => {
    if (!name.trim()) { Alert.alert('Error', 'Nama produk wajib diisi'); return; }
    if (!sku.trim()) { Alert.alert('Error', 'SKU wajib diisi'); return; }
    if (!sellPrice || parseFloat(sellPrice) <= 0) { Alert.alert('Error', 'Harga jual wajib diisi'); return; }

    const product: Product = {
      id: isEdit ? id! : 'prod_' + Date.now(),
      name: name.trim(),
      sku: sku.trim(),
      categoryId,
      image: image.trim() || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=200&h=200&fit=crop',
      buyPrice: parseFloat(buyPrice) || 0,
      sellPrice: parseFloat(sellPrice) || 0,
      stock: parseInt(stock) || 0,
      minStock: parseInt(minStock) || 5,
      isActive: existing?.isActive ?? true,
    };

    if (isEdit) {
      updateProduct(product);
    } else {
      addProduct(product);
    }

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    router.back();
  }, [name, sku, categoryId, image, buyPrice, sellPrice, stock, minStock, isEdit, id, existing, addProduct, updateProduct]);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Stack.Screen options={{ title: isEdit ? 'Edit Produk' : 'Tambah Produk' }} />

      <View style={styles.formGroup}>
        <Text style={styles.label}>Nama Produk *</Text>
        <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="Nama produk" placeholderTextColor={Colors.textMuted} />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>SKU / Barcode *</Text>
        <TextInput style={styles.input} value={sku} onChangeText={setSku} placeholder="SKU001" placeholderTextColor={Colors.textMuted} autoCapitalize="characters" />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Kategori</Text>
        <View style={styles.catRow}>
          {categories.map(cat => (
            <TouchableOpacity
              key={cat.id}
              style={[styles.catChip, categoryId === cat.id && styles.catChipActive]}
              onPress={() => setCategoryId(cat.id)}
            >
              <Text style={[styles.catChipText, categoryId === cat.id && styles.catChipTextActive]}>{cat.name}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>URL Gambar</Text>
        <TextInput style={styles.input} value={image} onChangeText={setImage} placeholder="https://..." placeholderTextColor={Colors.textMuted} autoCapitalize="none" />
      </View>

      <View style={styles.rowGroup}>
        <View style={[styles.formGroup, { flex: 1 }]}>
          <Text style={styles.label}>Harga Beli</Text>
          <TextInput style={styles.input} value={buyPrice} onChangeText={setBuyPrice} placeholder="0" placeholderTextColor={Colors.textMuted} keyboardType="numeric" />
        </View>
        <View style={[styles.formGroup, { flex: 1 }]}>
          <Text style={styles.label}>Harga Jual *</Text>
          <TextInput style={styles.input} value={sellPrice} onChangeText={setSellPrice} placeholder="0" placeholderTextColor={Colors.textMuted} keyboardType="numeric" />
        </View>
      </View>

      <View style={styles.rowGroup}>
        <View style={[styles.formGroup, { flex: 1 }]}>
          <Text style={styles.label}>Stok</Text>
          <TextInput style={styles.input} value={stock} onChangeText={setStock} placeholder="0" placeholderTextColor={Colors.textMuted} keyboardType="numeric" />
        </View>
        <View style={[styles.formGroup, { flex: 1 }]}>
          <Text style={styles.label}>Stok Minimum</Text>
          <TextInput style={styles.input} value={minStock} onChangeText={setMinStock} placeholder="5" placeholderTextColor={Colors.textMuted} keyboardType="numeric" />
        </View>
      </View>

      <TouchableOpacity style={styles.saveBtn} onPress={handleSave} activeOpacity={0.8}>
        <Save size={18} color={Colors.white} />
        <Text style={styles.saveBtnText}>{isEdit ? 'Simpan Perubahan' : 'Tambah Produk'}</Text>
      </TouchableOpacity>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    padding: 16,
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: Colors.text,
    marginBottom: 6,
  },
  input: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    height: 48,
    paddingHorizontal: 14,
    fontSize: 14,
    color: Colors.text,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  rowGroup: {
    flexDirection: 'row',
    gap: 12,
  },
  catRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  catChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  catChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  catChipText: {
    fontSize: 13,
    fontWeight: '500' as const,
    color: Colors.textSecondary,
  },
  catChipTextActive: {
    color: Colors.white,
  },
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.accent,
    borderRadius: 14,
    height: 52,
    gap: 8,
    marginTop: 8,
    shadowColor: Colors.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  saveBtnText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.white,
  },
});
