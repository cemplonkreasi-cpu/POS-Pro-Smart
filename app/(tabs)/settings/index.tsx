import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Switch, Alert,
} from 'react-native';
import { router } from 'expo-router';
import {
  Store, MapPin, Phone, FileText, Percent, HandCoins, LogOut, Shield, Save,
  Tag, Printer, FlaskConical, Receipt, ChevronRight,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import Colors from '@/constants/colors';
import { useStore } from '@/contexts/StoreContext';
import { useAuth } from '@/contexts/AuthContext';

export default function SettingsScreen() {
  const { settings, updateSettings, categories, printers, ingredients } = useStore();
  const { user, logout } = useAuth();

  const [name, setName] = useState<string>(settings.name);
  const [address, setAddress] = useState<string>(settings.address);
  const [phone, setPhone] = useState<string>(settings.phone);
  const [npwp, setNpwp] = useState<string>(settings.npwp);
  const [taxEnabled, setTaxEnabled] = useState<boolean>(settings.taxEnabled);
  const [taxPercent, setTaxPercent] = useState<string>(settings.taxPercent.toString());
  const [scEnabled, setScEnabled] = useState<boolean>(settings.serviceChargeEnabled);
  const [scPercent, setScPercent] = useState<string>(settings.serviceChargePercent.toString());

  const handleSave = useCallback(() => {
    updateSettings({
      ...settings,
      name: name.trim(),
      address: address.trim(),
      phone: phone.trim(),
      npwp: npwp.trim(),
      taxEnabled,
      taxPercent: parseFloat(taxPercent) || 0,
      serviceChargeEnabled: scEnabled,
      serviceChargePercent: parseFloat(scPercent) || 0,
    });
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Alert.alert('Berhasil', 'Pengaturan telah disimpan');
  }, [name, address, phone, npwp, taxEnabled, taxPercent, scEnabled, scPercent, settings, updateSettings]);

  const handleLogout = useCallback(() => {
    Alert.alert(
      'Keluar',
      'Yakin ingin keluar dari akun?',
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Keluar',
          style: 'destructive',
          onPress: () => {
            logout();
            router.replace('/');
          },
        },
      ]
    );
  }, [logout]);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.profileCard}>
        <View style={styles.avatarCircle}>
          <Text style={styles.avatarText}>{user?.name?.charAt(0) || '?'}</Text>
        </View>
        <View style={styles.profileInfo}>
          <Text style={styles.profileName}>{user?.name}</Text>
          <Text style={styles.profileEmail}>{user?.email}</Text>
          <View style={styles.roleBadge}>
            <Shield size={12} color={Colors.accent} />
            <Text style={styles.roleText}>{user?.role === 'admin' ? 'Administrator' : user?.role === 'supervisor' ? 'Supervisor' : 'Kasir'}</Text>
          </View>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Kelola</Text>
      <View style={styles.card}>
        <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/manage-categories' as never)} activeOpacity={0.7}>
          <View style={styles.menuItemLeft}>
            <View style={[styles.menuIconCircle, { backgroundColor: Colors.accentSoft }]}>
              <Tag size={18} color={Colors.accent} />
            </View>
            <View>
              <Text style={styles.menuItemTitle}>Menu, Kategori & Varian</Text>
              <Text style={styles.menuItemSub}>{categories.length} kategori</Text>
            </View>
          </View>
          <ChevronRight size={18} color={Colors.textMuted} />
        </TouchableOpacity>

        <View style={styles.menuDivider} />

        <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/manage-printers' as never)} activeOpacity={0.7}>
          <View style={styles.menuItemLeft}>
            <View style={[styles.menuIconCircle, { backgroundColor: Colors.infoLight }]}>
              <Printer size={18} color={Colors.info} />
            </View>
            <View>
              <Text style={styles.menuItemTitle}>Printer Kasir Bluetooth</Text>
              <Text style={styles.menuItemSub}>{printers.length} printer</Text>
            </View>
          </View>
          <ChevronRight size={18} color={Colors.textMuted} />
        </TouchableOpacity>

        <View style={styles.menuDivider} />

        <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/manage-ingredients' as never)} activeOpacity={0.7}>
          <View style={styles.menuItemLeft}>
            <View style={[styles.menuIconCircle, { backgroundColor: Colors.successLight }]}>
              <FlaskConical size={18} color={Colors.success} />
            </View>
            <View>
              <Text style={styles.menuItemTitle}>HPP & Bahan Baku</Text>
              <Text style={styles.menuItemSub}>{ingredients.length} bahan</Text>
            </View>
          </View>
          <ChevronRight size={18} color={Colors.textMuted} />
        </TouchableOpacity>

        <View style={styles.menuDivider} />

        <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/manage-receipt' as never)} activeOpacity={0.7}>
          <View style={styles.menuItemLeft}>
            <View style={[styles.menuIconCircle, { backgroundColor: Colors.warningLight }]}>
              <Receipt size={18} color={Colors.warning} />
            </View>
            <View>
              <Text style={styles.menuItemTitle}>Pengaturan Struk</Text>
              <Text style={styles.menuItemSub}>Logo, footer, ukuran kertas</Text>
            </View>
          </View>
          <ChevronRight size={18} color={Colors.textMuted} />
        </TouchableOpacity>
      </View>

      <Text style={styles.sectionTitle}>Informasi Toko</Text>
      <View style={styles.card}>
        <View style={styles.formGroup}>
          <View style={styles.inputLabel}>
            <Store size={16} color={Colors.textMuted} />
            <Text style={styles.labelText}>Nama Toko</Text>
          </View>
          <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="Nama toko" placeholderTextColor={Colors.textMuted} />
        </View>
        <View style={styles.formGroup}>
          <View style={styles.inputLabel}>
            <MapPin size={16} color={Colors.textMuted} />
            <Text style={styles.labelText}>Alamat</Text>
          </View>
          <TextInput style={styles.input} value={address} onChangeText={setAddress} placeholder="Alamat" placeholderTextColor={Colors.textMuted} />
        </View>
        <View style={styles.formGroup}>
          <View style={styles.inputLabel}>
            <Phone size={16} color={Colors.textMuted} />
            <Text style={styles.labelText}>Telepon</Text>
          </View>
          <TextInput style={styles.input} value={phone} onChangeText={setPhone} placeholder="021-xxxx" placeholderTextColor={Colors.textMuted} keyboardType="phone-pad" />
        </View>
        <View style={styles.formGroup}>
          <View style={styles.inputLabel}>
            <FileText size={16} color={Colors.textMuted} />
            <Text style={styles.labelText}>NPWP</Text>
          </View>
          <TextInput style={styles.input} value={npwp} onChangeText={setNpwp} placeholder="xx.xxx.xxx.x-xxx.xxx" placeholderTextColor={Colors.textMuted} />
        </View>
      </View>

      <Text style={styles.sectionTitle}>Pajak & Service Charge</Text>
      <View style={styles.card}>
        <View style={styles.switchRow}>
          <View style={styles.switchInfo}>
            <Percent size={16} color={Colors.textMuted} />
            <Text style={styles.switchLabel}>Pajak</Text>
          </View>
          <Switch
            value={taxEnabled}
            onValueChange={setTaxEnabled}
            trackColor={{ false: Colors.border, true: Colors.accentLight }}
            thumbColor={taxEnabled ? Colors.accent : Colors.textMuted}
          />
        </View>
        {taxEnabled && (
          <View style={styles.percentRow}>
            <Text style={styles.percentLabel}>Persentase Pajak</Text>
            <View style={styles.percentInputWrap}>
              <TextInput
                style={styles.percentInput}
                value={taxPercent}
                onChangeText={setTaxPercent}
                keyboardType="numeric"
              />
              <Text style={styles.percentSign}>%</Text>
            </View>
          </View>
        )}
        <View style={styles.divider} />
        <View style={styles.switchRow}>
          <View style={styles.switchInfo}>
            <HandCoins size={16} color={Colors.textMuted} />
            <Text style={styles.switchLabel}>Service Charge</Text>
          </View>
          <Switch
            value={scEnabled}
            onValueChange={setScEnabled}
            trackColor={{ false: Colors.border, true: Colors.accentLight }}
            thumbColor={scEnabled ? Colors.accent : Colors.textMuted}
          />
        </View>
        {scEnabled && (
          <View style={styles.percentRow}>
            <Text style={styles.percentLabel}>Persentase SC</Text>
            <View style={styles.percentInputWrap}>
              <TextInput
                style={styles.percentInput}
                value={scPercent}
                onChangeText={setScPercent}
                keyboardType="numeric"
              />
              <Text style={styles.percentSign}>%</Text>
            </View>
          </View>
        )}
      </View>

      <TouchableOpacity style={styles.saveBtn} onPress={handleSave} activeOpacity={0.8}>
        <Save size={18} color={Colors.white} />
        <Text style={styles.saveBtnText}>Simpan Pengaturan</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout} activeOpacity={0.7}>
        <LogOut size={18} color={Colors.danger} />
        <Text style={styles.logoutBtnText}>Keluar</Text>
      </TouchableOpacity>

      <View style={{ height: 32 }} />
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
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 18,
    marginBottom: 24,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  avatarCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: Colors.white,
    fontSize: 22,
    fontWeight: '700' as const,
  },
  profileInfo: {
    flex: 1,
    marginLeft: 14,
  },
  profileName: {
    fontSize: 17,
    fontWeight: '700' as const,
    color: Colors.text,
  },
  profileEmail: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    alignSelf: 'flex-start',
    backgroundColor: Colors.accentSoft,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginTop: 6,
  },
  roleText: {
    fontSize: 11,
    fontWeight: '600' as const,
    color: Colors.accent,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700' as const,
    color: Colors.text,
    marginBottom: 10,
  },
  card: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  menuIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuItemTitle: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.text,
  },
  menuItemSub: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 1,
  },
  menuDivider: {
    height: 1,
    backgroundColor: Colors.borderLight,
  },
  formGroup: {
    marginBottom: 14,
  },
  inputLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  labelText: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: Colors.text,
  },
  input: {
    height: 44,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 12,
    fontSize: 14,
    color: Colors.text,
    backgroundColor: Colors.surface,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  switchInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  switchLabel: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.text,
  },
  percentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  percentLabel: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  percentInputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  percentInput: {
    width: 56,
    height: 36,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    textAlign: 'center' as const,
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.text,
    backgroundColor: Colors.surface,
  },
  percentSign: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: '600' as const,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.borderLight,
    marginVertical: 14,
  },
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.accent,
    borderRadius: 14,
    height: 50,
    gap: 8,
    marginBottom: 12,
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
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.dangerLight,
    borderRadius: 14,
    height: 50,
    gap: 8,
  },
  logoutBtnText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.danger,
  },
});
