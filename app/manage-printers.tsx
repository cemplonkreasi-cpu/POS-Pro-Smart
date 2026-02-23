import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, Switch,
} from 'react-native';
import { Stack } from 'expo-router';
import { Plus, Pencil, Trash2, Printer, X, Check, Bluetooth, Star } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import Colors from '@/constants/colors';
import { useStore } from '@/contexts/StoreContext';
import { PrinterConfig } from '@/types';

export default function ManagePrintersScreen() {
  const { printers, addPrinter, updatePrinter, deletePrinter } = useStore();

  const [showForm, setShowForm] = useState<boolean>(false);
  const [editing, setEditing] = useState<PrinterConfig | null>(null);
  const [name, setName] = useState<string>('');
  const [address, setAddress] = useState<string>('');
  const [paperSize, setPaperSize] = useState<'58mm' | '80mm'>('58mm');
  const [isDefault, setIsDefault] = useState<boolean>(false);

  const resetForm = useCallback(() => {
    setShowForm(false);
    setEditing(null);
    setName('');
    setAddress('');
    setPaperSize('58mm');
    setIsDefault(false);
  }, []);

  const handleEdit = useCallback((printer: PrinterConfig) => {
    setEditing(printer);
    setName(printer.name);
    setAddress(printer.address);
    setPaperSize(printer.paperSize);
    setIsDefault(printer.isDefault);
    setShowForm(true);
  }, []);

  const handleSave = useCallback(() => {
    if (!name.trim()) {
      Alert.alert('Error', 'Nama printer wajib diisi');
      return;
    }
    if (!address.trim()) {
      Alert.alert('Error', 'Alamat Bluetooth wajib diisi');
      return;
    }
    if (editing) {
      updatePrinter({ ...editing, name: name.trim(), address: address.trim(), paperSize, isDefault });
    } else {
      const shouldBeDefault = printers.length === 0 ? true : isDefault;
      addPrinter({
        id: 'ptr_' + Date.now(),
        name: name.trim(),
        address: address.trim(),
        paperSize,
        isDefault: shouldBeDefault,
      });
    }
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    resetForm();
  }, [name, address, paperSize, isDefault, editing, printers.length, addPrinter, updatePrinter, resetForm]);

  const handleDelete = useCallback((printer: PrinterConfig) => {
    Alert.alert('Hapus Printer', `Hapus "${printer.name}"?`, [
      { text: 'Batal', style: 'cancel' },
      {
        text: 'Hapus', style: 'destructive', onPress: () => {
          deletePrinter(printer.id);
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        },
      },
    ]);
  }, [deletePrinter]);

  const handleSetDefault = useCallback((printer: PrinterConfig) => {
    updatePrinter({ ...printer, isDefault: true });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, [updatePrinter]);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Stack.Screen options={{ title: 'Printer Kasir' }} />

      <View style={styles.infoCard}>
        <Bluetooth size={20} color={Colors.accent} />
        <Text style={styles.infoText}>
          Tambahkan printer Bluetooth untuk mencetak struk. Pastikan printer sudah di-pair dengan perangkat Anda.
        </Text>
      </View>

      {showForm && (
        <View style={styles.formCard}>
          <Text style={styles.formTitle}>{editing ? 'Edit Printer' : 'Tambah Printer'}</Text>

          <Text style={styles.fieldLabel}>Nama Printer</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="Contoh: Printer Kasir 1"
            placeholderTextColor={Colors.textMuted}
          />

          <Text style={styles.fieldLabel}>Alamat Bluetooth / MAC Address</Text>
          <TextInput
            style={styles.input}
            value={address}
            onChangeText={setAddress}
            placeholder="AA:BB:CC:DD:EE:FF"
            placeholderTextColor={Colors.textMuted}
            autoCapitalize="characters"
          />

          <Text style={styles.fieldLabel}>Ukuran Kertas</Text>
          <View style={styles.paperRow}>
            <TouchableOpacity
              style={[styles.paperChip, paperSize === '58mm' && styles.paperChipActive]}
              onPress={() => setPaperSize('58mm')}
            >
              <Text style={[styles.paperChipText, paperSize === '58mm' && styles.paperChipTextActive]}>58mm</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.paperChip, paperSize === '80mm' && styles.paperChipActive]}
              onPress={() => setPaperSize('80mm')}
            >
              <Text style={[styles.paperChipText, paperSize === '80mm' && styles.paperChipTextActive]}>80mm</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.switchRow}>
            <Text style={styles.switchLabel}>Jadikan Default</Text>
            <Switch
              value={isDefault}
              onValueChange={setIsDefault}
              trackColor={{ false: Colors.border, true: Colors.accentLight }}
              thumbColor={isDefault ? Colors.accent : Colors.textMuted}
            />
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

      {printers.length === 0 && !showForm && (
        <View style={styles.emptyBox}>
          <Printer size={40} color={Colors.textMuted} />
          <Text style={styles.emptyTitle}>Belum ada printer</Text>
          <Text style={styles.emptyText}>Tambahkan printer Bluetooth untuk mulai mencetak struk</Text>
        </View>
      )}

      {printers.map(printer => (
        <View key={printer.id} style={styles.listItem}>
          <View style={styles.listItemLeft}>
            <View style={[styles.iconCircle, printer.isDefault && styles.iconCircleDefault]}>
              <Printer size={20} color={printer.isDefault ? Colors.white : Colors.accent} />
            </View>
            <View style={{ flex: 1 }}>
              <View style={styles.nameRow}>
                <Text style={styles.listItemTitle}>{printer.name}</Text>
                {printer.isDefault && (
                  <View style={styles.defaultBadge}>
                    <Star size={10} color={Colors.warning} />
                    <Text style={styles.defaultBadgeText}>Default</Text>
                  </View>
                )}
              </View>
              <Text style={styles.listItemSub}>{printer.address}</Text>
              <Text style={styles.listItemSub}>Kertas: {printer.paperSize}</Text>
            </View>
          </View>
          <View style={styles.listItemActions}>
            {!printer.isDefault && (
              <TouchableOpacity style={styles.defaultBtn} onPress={() => handleSetDefault(printer)}>
                <Star size={15} color={Colors.warning} />
              </TouchableOpacity>
            )}
            <TouchableOpacity style={styles.editBtn} onPress={() => handleEdit(printer)}>
              <Pencil size={15} color={Colors.accent} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.deleteBtn} onPress={() => handleDelete(printer)}>
              <Trash2 size={15} color={Colors.danger} />
            </TouchableOpacity>
          </View>
        </View>
      ))}

      {!showForm && (
        <TouchableOpacity style={styles.addBtn} onPress={() => setShowForm(true)}>
          <Plus size={18} color={Colors.white} />
          <Text style={styles.addBtnText}>Tambah Printer</Text>
        </TouchableOpacity>
      )}

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { padding: 16 },
  infoCard: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 10,
    backgroundColor: Colors.accentSoft, borderRadius: 14, padding: 14, marginBottom: 16,
  },
  infoText: { flex: 1, fontSize: 13, color: Colors.primary, lineHeight: 18 },
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
  paperRow: { flexDirection: 'row', gap: 10, marginTop: 4 },
  paperChip: {
    flex: 1, paddingVertical: 12, borderRadius: 12, alignItems: 'center',
    backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border,
  },
  paperChipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  paperChipText: { fontSize: 14, fontWeight: '600' as const, color: Colors.textSecondary },
  paperChipTextActive: { color: Colors.white },
  switchRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    marginTop: 14, paddingVertical: 4,
  },
  switchLabel: { fontSize: 14, fontWeight: '600' as const, color: Colors.text },
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
  emptyBox: {
    alignItems: 'center', justifyContent: 'center', paddingVertical: 40,
    backgroundColor: Colors.white, borderRadius: 16, marginBottom: 16, gap: 8,
  },
  emptyTitle: { fontSize: 16, fontWeight: '700' as const, color: Colors.text },
  emptyText: { fontSize: 13, color: Colors.textMuted, textAlign: 'center', paddingHorizontal: 24 },
  listItem: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: Colors.white, borderRadius: 14, padding: 14, marginBottom: 10,
    shadowColor: Colors.shadow, shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 4, elevation: 2,
  },
  listItemLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  iconCircle: {
    width: 44, height: 44, borderRadius: 14, backgroundColor: Colors.accentSoft,
    alignItems: 'center', justifyContent: 'center',
  },
  iconCircleDefault: { backgroundColor: Colors.accent },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  listItemTitle: { fontSize: 15, fontWeight: '600' as const, color: Colors.text },
  listItemSub: { fontSize: 12, color: Colors.textSecondary, marginTop: 1 },
  defaultBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 3,
    backgroundColor: Colors.warningLight, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6,
  },
  defaultBadgeText: { fontSize: 10, fontWeight: '600' as const, color: Colors.warning },
  listItemActions: { flexDirection: 'row', gap: 6 },
  defaultBtn: {
    width: 36, height: 36, borderRadius: 10, backgroundColor: Colors.warningLight,
    alignItems: 'center', justifyContent: 'center',
  },
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
});
