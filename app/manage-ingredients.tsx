import React, { useState, useCallback, useMemo } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert,
} from 'react-native';
import { Stack } from 'expo-router';
import { Plus, Pencil, Trash2, X, Check, FlaskConical, Package, ChevronDown, ChevronUp } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import Colors from '@/constants/colors';
import { useStore } from '@/contexts/StoreContext';
import { Ingredient, ProductIngredient } from '@/types';
import { formatCurrency } from '@/utils/format';

export default function ManageIngredientsScreen() {
  const {
    ingredients, products, productIngredients,
    addIngredient, updateIngredient, deleteIngredient,
    setProductIngredientList, getProductHPP,
  } = useStore();

  const [activeTab, setActiveTab] = useState<'ingredients' | 'assign'>('ingredients');

  const [showForm, setShowForm] = useState<boolean>(false);
  const [editing, setEditing] = useState<Ingredient | null>(null);
  const [ingName, setIngName] = useState<string>('');
  const [ingUnit, setIngUnit] = useState<string>('');
  const [ingCost, setIngCost] = useState<string>('');

  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [expandedProduct, setExpandedProduct] = useState<string | null>(null);
  const [addIngId, setAddIngId] = useState<string>('');
  const [addIngQty, setAddIngQty] = useState<string>('');

  const resetForm = useCallback(() => {
    setShowForm(false);
    setEditing(null);
    setIngName('');
    setIngUnit('');
    setIngCost('');
  }, []);

  const handleEdit = useCallback((ing: Ingredient) => {
    setEditing(ing);
    setIngName(ing.name);
    setIngUnit(ing.unit);
    setIngCost(ing.costPerUnit.toString());
    setShowForm(true);
  }, []);

  const handleSave = useCallback(() => {
    if (!ingName.trim()) { Alert.alert('Error', 'Nama bahan wajib diisi'); return; }
    if (!ingUnit.trim()) { Alert.alert('Error', 'Satuan wajib diisi'); return; }
    if (editing) {
      updateIngredient({ ...editing, name: ingName.trim(), unit: ingUnit.trim(), costPerUnit: parseFloat(ingCost) || 0 });
    } else {
      addIngredient({ id: 'ing_' + Date.now(), name: ingName.trim(), unit: ingUnit.trim(), costPerUnit: parseFloat(ingCost) || 0 });
    }
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    resetForm();
  }, [ingName, ingUnit, ingCost, editing, addIngredient, updateIngredient, resetForm]);

  const handleDelete = useCallback((ing: Ingredient) => {
    Alert.alert('Hapus Bahan', `Hapus "${ing.name}"?`, [
      { text: 'Batal', style: 'cancel' },
      {
        text: 'Hapus', style: 'destructive', onPress: () => {
          deleteIngredient(ing.id);
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        },
      },
    ]);
  }, [deleteIngredient]);

  const handleAddIngToProduct = useCallback((productId: string) => {
    if (!addIngId) { Alert.alert('Error', 'Pilih bahan baku'); return; }
    const qty = parseFloat(addIngQty);
    if (!qty || qty <= 0) { Alert.alert('Error', 'Jumlah harus lebih dari 0'); return; }
    const current = productIngredients[productId] || [];
    const exists = current.find(pi => pi.ingredientId === addIngId);
    if (exists) {
      Alert.alert('Error', 'Bahan sudah ditambahkan');
      return;
    }
    setProductIngredientList(productId, [...current, { ingredientId: addIngId, qty }]);
    setAddIngId('');
    setAddIngQty('');
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, [addIngId, addIngQty, productIngredients, setProductIngredientList]);

  const handleRemoveIngFromProduct = useCallback((productId: string, ingredientId: string) => {
    const current = productIngredients[productId] || [];
    setProductIngredientList(productId, current.filter(pi => pi.ingredientId !== ingredientId));
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, [productIngredients, setProductIngredientList]);

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'HPP & Bahan Baku' }} />

      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'ingredients' && styles.tabActive]}
          onPress={() => setActiveTab('ingredients')}
        >
          <FlaskConical size={16} color={activeTab === 'ingredients' ? Colors.white : Colors.textSecondary} />
          <Text style={[styles.tabText, activeTab === 'ingredients' && styles.tabTextActive]}>Bahan Baku</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'assign' && styles.tabActive]}
          onPress={() => setActiveTab('assign')}
        >
          <Package size={16} color={activeTab === 'assign' ? Colors.white : Colors.textSecondary} />
          <Text style={[styles.tabText, activeTab === 'assign' && styles.tabTextActive]}>HPP Produk</Text>
        </TouchableOpacity>
      </View>

      {activeTab === 'ingredients' ? (
        <ScrollView contentContainerStyle={styles.content}>
          {showForm && (
            <View style={styles.formCard}>
              <Text style={styles.formTitle}>{editing ? 'Edit Bahan' : 'Tambah Bahan Baku'}</Text>
              <Text style={styles.fieldLabel}>Nama Bahan</Text>
              <TextInput style={styles.input} value={ingName} onChangeText={setIngName} placeholder="Biji Kopi Arabica" placeholderTextColor={Colors.textMuted} />
              <View style={styles.rowGroup}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.fieldLabel}>Satuan</Text>
                  <TextInput style={styles.input} value={ingUnit} onChangeText={setIngUnit} placeholder="gram / ml / pcs" placeholderTextColor={Colors.textMuted} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.fieldLabel}>Harga / Satuan (Rp)</Text>
                  <TextInput style={styles.input} value={ingCost} onChangeText={setIngCost} placeholder="0" placeholderTextColor={Colors.textMuted} keyboardType="numeric" />
                </View>
              </View>
              <View style={styles.formActions}>
                <TouchableOpacity style={styles.cancelBtn} onPress={resetForm}>
                  <X size={16} color={Colors.textSecondary} />
                  <Text style={styles.cancelBtnText}>Batal</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.confirmBtn} onPress={handleSave}>
                  <Check size={16} color={Colors.white} />
                  <Text style={styles.confirmBtnText}>Simpan</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {ingredients.map(ing => (
            <View key={ing.id} style={styles.listItem}>
              <View style={styles.listItemLeft}>
                <View style={styles.iconCircle}>
                  <FlaskConical size={18} color={Colors.success} />
                </View>
                <View>
                  <Text style={styles.listItemTitle}>{ing.name}</Text>
                  <Text style={styles.listItemSub}>
                    Rp {ing.costPerUnit.toLocaleString('id-ID')} / {ing.unit}
                  </Text>
                </View>
              </View>
              <View style={styles.listItemActions}>
                <TouchableOpacity style={styles.editBtn} onPress={() => handleEdit(ing)}>
                  <Pencil size={15} color={Colors.accent} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.deleteBtn} onPress={() => handleDelete(ing)}>
                  <Trash2 size={15} color={Colors.danger} />
                </TouchableOpacity>
              </View>
            </View>
          ))}

          {!showForm && (
            <TouchableOpacity style={styles.addBtn} onPress={() => setShowForm(true)}>
              <Plus size={18} color={Colors.white} />
              <Text style={styles.addBtnText}>Tambah Bahan Baku</Text>
            </TouchableOpacity>
          )}
          <View style={{ height: 40 }} />
        </ScrollView>
      ) : (
        <ScrollView contentContainerStyle={styles.content}>
          {products.filter(p => p.isActive).map(p => {
            const hpp = getProductHPP(p.id);
            const list = productIngredients[p.id] || [];
            const isExpanded = expandedProduct === p.id;
            const margin = p.sellPrice - hpp;

            return (
              <View key={p.id} style={styles.productCard}>
                <TouchableOpacity
                  style={styles.productHeader}
                  onPress={() => setExpandedProduct(isExpanded ? null : p.id)}
                  activeOpacity={0.7}
                >
                  <View style={{ flex: 1 }}>
                    <Text style={styles.productName}>{p.name}</Text>
                    <View style={styles.hppRow}>
                      <Text style={styles.hppLabel}>HPP:</Text>
                      <Text style={styles.hppValue}>{formatCurrency(hpp)}</Text>
                      <Text style={styles.hppSep}>|</Text>
                      <Text style={styles.hppLabel}>Margin:</Text>
                      <Text style={[styles.hppValue, { color: margin >= 0 ? Colors.success : Colors.danger }]}>
                        {formatCurrency(margin)}
                      </Text>
                    </View>
                  </View>
                  {isExpanded ? (
                    <ChevronUp size={20} color={Colors.textMuted} />
                  ) : (
                    <ChevronDown size={20} color={Colors.textMuted} />
                  )}
                </TouchableOpacity>

                {isExpanded && (
                  <View style={styles.productBody}>
                    {list.map(pi => {
                      const ing = ingredients.find(i => i.id === pi.ingredientId);
                      if (!ing) return null;
                      return (
                        <View key={pi.ingredientId} style={styles.ingRow}>
                          <View style={{ flex: 1 }}>
                            <Text style={styles.ingName}>{ing.name}</Text>
                            <Text style={styles.ingDetail}>
                              {pi.qty} {ing.unit} x Rp {ing.costPerUnit.toLocaleString('id-ID')} = {formatCurrency(pi.qty * ing.costPerUnit)}
                            </Text>
                          </View>
                          <TouchableOpacity
                            style={styles.removeIngBtn}
                            onPress={() => handleRemoveIngFromProduct(p.id, pi.ingredientId)}
                          >
                            <Trash2 size={14} color={Colors.danger} />
                          </TouchableOpacity>
                        </View>
                      );
                    })}

                    <View style={styles.addIngRow}>
                      <View style={{ flex: 1 }}>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                          {ingredients.map(ing => (
                            <TouchableOpacity
                              key={ing.id}
                              style={[styles.ingChip, addIngId === ing.id && styles.ingChipActive]}
                              onPress={() => setAddIngId(ing.id)}
                            >
                              <Text style={[styles.ingChipText, addIngId === ing.id && styles.ingChipTextActive]}>
                                {ing.name}
                              </Text>
                            </TouchableOpacity>
                          ))}
                        </ScrollView>
                      </View>
                    </View>
                    <View style={styles.addIngControls}>
                      <TextInput
                        style={[styles.input, { flex: 1 }]}
                        value={addIngQty}
                        onChangeText={setAddIngQty}
                        placeholder="Jumlah"
                        placeholderTextColor={Colors.textMuted}
                        keyboardType="numeric"
                      />
                      <TouchableOpacity
                        style={styles.addIngBtn}
                        onPress={() => handleAddIngToProduct(p.id)}
                      >
                        <Plus size={16} color={Colors.white} />
                        <Text style={styles.addIngBtnText}>Tambah</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                )}
              </View>
            );
          })}
          <View style={{ height: 40 }} />
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  tabBar: { flexDirection: 'row', paddingHorizontal: 16, paddingTop: 12, gap: 8 },
  tab: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 6, paddingVertical: 10, borderRadius: 12,
    backgroundColor: Colors.white, borderWidth: 1, borderColor: Colors.border,
  },
  tabActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  tabText: { fontSize: 14, fontWeight: '600' as const, color: Colors.textSecondary },
  tabTextActive: { color: Colors.white },
  content: { padding: 16 },
  formCard: {
    backgroundColor: Colors.white, borderRadius: 16, padding: 16, marginBottom: 16,
    shadowColor: Colors.shadow, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 3,
  },
  formTitle: { fontSize: 15, fontWeight: '700' as const, color: Colors.text, marginBottom: 4 },
  fieldLabel: { fontSize: 13, fontWeight: '600' as const, color: Colors.textSecondary, marginBottom: 6, marginTop: 10 },
  input: {
    backgroundColor: Colors.surface, borderRadius: 12, height: 48,
    paddingHorizontal: 14, fontSize: 14, color: Colors.text,
    borderWidth: 1, borderColor: Colors.border,
  },
  rowGroup: { flexDirection: 'row', gap: 10 },
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
  listItem: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: Colors.white, borderRadius: 14, padding: 14, marginBottom: 10,
    shadowColor: Colors.shadow, shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 4, elevation: 2,
  },
  listItemLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  iconCircle: {
    width: 40, height: 40, borderRadius: 12, backgroundColor: Colors.successLight,
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
  productCard: {
    backgroundColor: Colors.white, borderRadius: 16, marginBottom: 12, overflow: 'hidden',
    shadowColor: Colors.shadow, shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 4, elevation: 2,
  },
  productHeader: {
    flexDirection: 'row', alignItems: 'center', padding: 14,
  },
  productName: { fontSize: 15, fontWeight: '700' as const, color: Colors.text },
  hppRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  hppLabel: { fontSize: 12, color: Colors.textMuted },
  hppValue: { fontSize: 12, fontWeight: '700' as const, color: Colors.text },
  hppSep: { fontSize: 12, color: Colors.border, marginHorizontal: 2 },
  productBody: {
    borderTopWidth: 1, borderTopColor: Colors.borderLight, padding: 14, paddingTop: 10,
  },
  ingRow: {
    flexDirection: 'row', alignItems: 'center', paddingVertical: 8,
    borderBottomWidth: 1, borderBottomColor: Colors.borderLight,
  },
  ingName: { fontSize: 13, fontWeight: '600' as const, color: Colors.text },
  ingDetail: { fontSize: 11, color: Colors.textSecondary, marginTop: 1 },
  removeIngBtn: {
    width: 30, height: 30, borderRadius: 8, backgroundColor: Colors.dangerLight,
    alignItems: 'center', justifyContent: 'center',
  },
  addIngRow: { marginTop: 10 },
  ingChip: {
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8,
    backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border, marginRight: 6,
  },
  ingChipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  ingChipText: { fontSize: 12, fontWeight: '500' as const, color: Colors.textSecondary },
  ingChipTextActive: { color: Colors.white },
  addIngControls: { flexDirection: 'row', gap: 8, marginTop: 8, alignItems: 'center' },
  addIngBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: Colors.success,
    paddingHorizontal: 14, height: 48, borderRadius: 12,
  },
  addIngBtnText: { fontSize: 13, fontWeight: '700' as const, color: Colors.white },
});
