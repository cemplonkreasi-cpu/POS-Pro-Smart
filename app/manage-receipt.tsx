import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, Switch, Image,
} from 'react-native';
import { Stack } from 'expo-router';
import { Save, Receipt, Image as ImageIcon, FileText, Type } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import Colors from '@/constants/colors';
import { useStore } from '@/contexts/StoreContext';

export default function ManageReceiptScreen() {
  const { settings, updateSettings } = useStore();
  const receipt = settings.receipt;

  const [logoUrl, setLogoUrl] = useState<string>(receipt.logoUrl);
  const [showLogo, setShowLogo] = useState<boolean>(receipt.showLogo);
  const [headerText, setHeaderText] = useState<string>(receipt.headerText);
  const [footerText, setFooterText] = useState<string>(receipt.footerText);
  const [paperSize, setPaperSize] = useState<'58mm' | '80mm'>(receipt.paperSize);

  const handleSave = useCallback(() => {
    updateSettings({
      ...settings,
      receipt: {
        logoUrl: logoUrl.trim(),
        showLogo,
        headerText: headerText.trim(),
        footerText: footerText.trim(),
        paperSize,
      },
    });
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Alert.alert('Berhasil', 'Pengaturan struk telah disimpan');
  }, [logoUrl, showLogo, headerText, footerText, paperSize, settings, updateSettings]);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Stack.Screen options={{ title: 'Pengaturan Struk' }} />

      <View style={styles.previewCard}>
        <Text style={styles.previewTitle}>Preview Struk</Text>
        <View style={styles.receiptPreview}>
          <View style={styles.receiptPaper}>
            {showLogo && logoUrl ? (
              <Image source={{ uri: logoUrl }} style={styles.previewLogo} resizeMode="contain" />
            ) : showLogo ? (
              <View style={styles.previewLogoPlaceholder}>
                <ImageIcon size={24} color={Colors.textMuted} />
                <Text style={styles.placeholderText}>Logo</Text>
              </View>
            ) : null}
            <Text style={styles.receiptStoreName}>{settings.name}</Text>
            <Text style={styles.receiptAddress}>{settings.address}</Text>
            <Text style={styles.receiptAddress}>{settings.phone}</Text>
            <View style={styles.receiptDivider} />
            <Text style={styles.receiptHeader}>{headerText || 'Header text'}</Text>
            <View style={styles.receiptDivider} />
            <View style={styles.receiptItemRow}>
              <Text style={styles.receiptItemText}>1x Cappuccino</Text>
              <Text style={styles.receiptItemText}>Rp 25.000</Text>
            </View>
            <View style={styles.receiptItemRow}>
              <Text style={styles.receiptItemText}>2x Nasi Goreng</Text>
              <Text style={styles.receiptItemText}>Rp 70.000</Text>
            </View>
            <View style={styles.receiptDivider} />
            <View style={styles.receiptItemRow}>
              <Text style={styles.receiptTotalLabel}>TOTAL</Text>
              <Text style={styles.receiptTotalValue}>Rp 95.000</Text>
            </View>
            <View style={styles.receiptDivider} />
            <Text style={styles.receiptFooter}>{footerText || 'Footer text'}</Text>
          </View>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Logo Toko</Text>
      <View style={styles.card}>
        <View style={styles.switchRow}>
          <View style={styles.switchInfo}>
            <ImageIcon size={16} color={Colors.textMuted} />
            <Text style={styles.switchLabel}>Tampilkan Logo</Text>
          </View>
          <Switch
            value={showLogo}
            onValueChange={setShowLogo}
            trackColor={{ false: Colors.border, true: Colors.accentLight }}
            thumbColor={showLogo ? Colors.accent : Colors.textMuted}
          />
        </View>
        {showLogo && (
          <View style={styles.formGroup}>
            <Text style={styles.fieldLabel}>URL Logo</Text>
            <TextInput
              style={styles.input}
              value={logoUrl}
              onChangeText={setLogoUrl}
              placeholder="https://example.com/logo.png"
              placeholderTextColor={Colors.textMuted}
              autoCapitalize="none"
            />
            {logoUrl ? (
              <View style={styles.logoPreviewWrap}>
                <Image source={{ uri: logoUrl }} style={styles.logoPreview} resizeMode="contain" />
              </View>
            ) : null}
          </View>
        )}
      </View>

      <Text style={styles.sectionTitle}>Teks Struk</Text>
      <View style={styles.card}>
        <View style={styles.formGroup}>
          <View style={styles.inputLabel}>
            <Type size={14} color={Colors.textMuted} />
            <Text style={styles.labelText}>Header Struk</Text>
          </View>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={headerText}
            onChangeText={setHeaderText}
            placeholder="Terima kasih atas kunjungan Anda!"
            placeholderTextColor={Colors.textMuted}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />
        </View>
        <View style={styles.formGroup}>
          <View style={styles.inputLabel}>
            <FileText size={14} color={Colors.textMuted} />
            <Text style={styles.labelText}>Footer Struk</Text>
          </View>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={footerText}
            onChangeText={setFooterText}
            placeholder="Barang yang sudah dibeli tidak dapat dikembalikan."
            placeholderTextColor={Colors.textMuted}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />
        </View>
      </View>

      <Text style={styles.sectionTitle}>Ukuran Kertas</Text>
      <View style={styles.card}>
        <View style={styles.paperRow}>
          <TouchableOpacity
            style={[styles.paperOption, paperSize === '58mm' && styles.paperOptionActive]}
            onPress={() => setPaperSize('58mm')}
          >
            <View style={[styles.paperIcon, paperSize === '58mm' && styles.paperIconActive]}>
              <Receipt size={20} color={paperSize === '58mm' ? Colors.white : Colors.textMuted} />
            </View>
            <Text style={[styles.paperLabel, paperSize === '58mm' && styles.paperLabelActive]}>58mm</Text>
            <Text style={styles.paperDesc}>Standar kecil</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.paperOption, paperSize === '80mm' && styles.paperOptionActive]}
            onPress={() => setPaperSize('80mm')}
          >
            <View style={[styles.paperIcon, paperSize === '80mm' && styles.paperIconActive]}>
              <Receipt size={24} color={paperSize === '80mm' ? Colors.white : Colors.textMuted} />
            </View>
            <Text style={[styles.paperLabel, paperSize === '80mm' && styles.paperLabelActive]}>80mm</Text>
            <Text style={styles.paperDesc}>Standar lebar</Text>
          </TouchableOpacity>
        </View>
      </View>

      <TouchableOpacity style={styles.saveBtn} onPress={handleSave} activeOpacity={0.8}>
        <Save size={18} color={Colors.white} />
        <Text style={styles.saveBtnText}>Simpan Pengaturan</Text>
      </TouchableOpacity>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { padding: 16 },
  previewCard: {
    backgroundColor: Colors.white, borderRadius: 16, padding: 16, marginBottom: 20,
    shadowColor: Colors.shadow, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 3,
  },
  previewTitle: { fontSize: 14, fontWeight: '700' as const, color: Colors.text, marginBottom: 12 },
  receiptPreview: { alignItems: 'center' },
  receiptPaper: {
    width: '100%', maxWidth: 260, backgroundColor: '#FAFAFA', borderRadius: 8,
    padding: 16, borderWidth: 1, borderColor: Colors.borderLight, borderStyle: 'dashed',
  },
  previewLogo: { width: 60, height: 40, alignSelf: 'center', marginBottom: 8 },
  previewLogoPlaceholder: {
    width: 60, height: 40, alignSelf: 'center', marginBottom: 8,
    backgroundColor: Colors.borderLight, borderRadius: 6,
    alignItems: 'center', justifyContent: 'center',
  },
  placeholderText: { fontSize: 9, color: Colors.textMuted },
  receiptStoreName: { fontSize: 14, fontWeight: '700' as const, color: Colors.text, textAlign: 'center' },
  receiptAddress: { fontSize: 10, color: Colors.textSecondary, textAlign: 'center', marginTop: 1 },
  receiptDivider: { borderBottomWidth: 1, borderBottomColor: Colors.border, borderStyle: 'dashed', marginVertical: 8 },
  receiptHeader: { fontSize: 10, color: Colors.textSecondary, textAlign: 'center', fontStyle: 'italic' },
  receiptItemRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 2 },
  receiptItemText: { fontSize: 11, color: Colors.text },
  receiptTotalLabel: { fontSize: 12, fontWeight: '700' as const, color: Colors.text },
  receiptTotalValue: { fontSize: 12, fontWeight: '700' as const, color: Colors.text },
  receiptFooter: { fontSize: 9, color: Colors.textMuted, textAlign: 'center', marginTop: 4 },
  sectionTitle: { fontSize: 15, fontWeight: '700' as const, color: Colors.text, marginBottom: 10 },
  card: {
    backgroundColor: Colors.white, borderRadius: 16, padding: 16, marginBottom: 20,
    shadowColor: Colors.shadow, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 3,
  },
  switchRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 4 },
  switchInfo: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  switchLabel: { fontSize: 14, fontWeight: '600' as const, color: Colors.text },
  formGroup: { marginTop: 12 },
  fieldLabel: { fontSize: 13, fontWeight: '600' as const, color: Colors.textSecondary, marginBottom: 6 },
  inputLabel: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 6 },
  labelText: { fontSize: 13, fontWeight: '600' as const, color: Colors.text },
  input: {
    backgroundColor: Colors.surface, borderRadius: 12, height: 48,
    paddingHorizontal: 14, fontSize: 14, color: Colors.text,
    borderWidth: 1, borderColor: Colors.border,
  },
  textArea: { height: 80, paddingTop: 12 },
  logoPreviewWrap: {
    marginTop: 10, padding: 12, borderRadius: 12,
    backgroundColor: Colors.surface, alignItems: 'center',
  },
  logoPreview: { width: 120, height: 60 },
  paperRow: { flexDirection: 'row', gap: 12 },
  paperOption: {
    flex: 1, alignItems: 'center', paddingVertical: 16, borderRadius: 14,
    backgroundColor: Colors.surface, borderWidth: 2, borderColor: Colors.border,
  },
  paperOptionActive: { borderColor: Colors.accent, backgroundColor: Colors.accentSoft },
  paperIcon: {
    width: 48, height: 48, borderRadius: 14, backgroundColor: Colors.borderLight,
    alignItems: 'center', justifyContent: 'center', marginBottom: 8,
  },
  paperIconActive: { backgroundColor: Colors.accent },
  paperLabel: { fontSize: 16, fontWeight: '700' as const, color: Colors.text },
  paperLabelActive: { color: Colors.accent },
  paperDesc: { fontSize: 11, color: Colors.textMuted, marginTop: 2 },
  saveBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: Colors.accent, borderRadius: 14, height: 52,
    shadowColor: Colors.accent, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 6,
  },
  saveBtnText: { fontSize: 16, fontWeight: '700' as const, color: Colors.white },
});
