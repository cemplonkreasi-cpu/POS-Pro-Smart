import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert,
} from 'react-native';
import { router } from 'expo-router';
import {
  Banknote, QrCode, Building2, Wallet, Check, X,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import Colors from '@/constants/colors';
import { useStore } from '@/contexts/StoreContext';
import { useAuth } from '@/contexts/AuthContext';
import { formatCurrency } from '@/utils/format';
import { PaymentMethod, PaymentSplit } from '@/types';

const PAYMENT_METHODS: { key: PaymentMethod; label: string; icon: React.ReactNode; color: string }[] = [
  { key: 'cash', label: 'Cash', icon: <Banknote size={20} color={Colors.cashMethod} />, color: Colors.cashMethod },
  { key: 'qris', label: 'QRIS', icon: <QrCode size={20} color={Colors.qrisMethod} />, color: Colors.qrisMethod },
  { key: 'transfer', label: 'Transfer', icon: <Building2 size={20} color={Colors.transferMethod} />, color: Colors.transferMethod },
  { key: 'ewallet', label: 'E-Wallet', icon: <Wallet size={20} color={Colors.ewalletMethod} />, color: Colors.ewalletMethod },
];

export default function CheckoutScreen() {
  const { cart, cartTotals, globalDiscount, setGlobalDiscount, completeTransaction } = useStore();
  const { user } = useAuth();
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>('cash');
  const [cashAmount, setCashAmount] = useState<string>('');
  const [discountInput, setDiscountInput] = useState<string>(globalDiscount.toString());

  const handleDiscountChange = useCallback((text: string) => {
    setDiscountInput(text);
    const val = parseFloat(text) || 0;
    setGlobalDiscount(Math.min(100, Math.max(0, val)));
  }, [setGlobalDiscount]);

  const change = selectedMethod === 'cash'
    ? Math.max(0, (parseFloat(cashAmount) || 0) - cartTotals.grandTotal)
    : 0;

  const handleComplete = useCallback(() => {
    if (cart.length === 0) {
      Alert.alert('Error', 'Keranjang kosong');
      return;
    }
    if (selectedMethod === 'cash') {
      const paid = parseFloat(cashAmount) || 0;
      if (paid < cartTotals.grandTotal) {
        Alert.alert('Kurang Bayar', 'Jumlah bayar kurang dari total');
        return;
      }
    }

    const payments: PaymentSplit[] = [{ method: selectedMethod, amount: cartTotals.grandTotal }];
    const txn = completeTransaction(user?.id || '', user?.name || '', payments);

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    Alert.alert(
      'Transaksi Berhasil',
      `Invoice: ${txn.invoiceNo}\nTotal: ${formatCurrency(txn.grandTotal)}${selectedMethod === 'cash' ? `\nKembalian: ${formatCurrency(change)}` : ''}`,
      [{ text: 'OK', onPress: () => router.back() }]
    );
  }, [cart, selectedMethod, cashAmount, cartTotals, completeTransaction, user, change]);

  const quickAmounts = [50000, 100000, 200000, 500000];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.summaryCard}>
        <Text style={styles.summaryTitle}>Ringkasan Pesanan</Text>
        {cart.map(item => (
          <View key={item.product.id} style={styles.summaryItem}>
            <Text style={styles.summaryItemName}>{item.qty}x {item.product.name}</Text>
            <Text style={styles.summaryItemPrice}>{formatCurrency(item.product.sellPrice * item.qty)}</Text>
          </View>
        ))}
        <View style={styles.divider} />
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Subtotal</Text>
          <Text style={styles.summaryValue}>{formatCurrency(cartTotals.subtotal)}</Text>
        </View>

        <View style={styles.discountRow}>
          <Text style={styles.summaryLabel}>Diskon (%)</Text>
          <TextInput
            style={styles.discountInput}
            value={discountInput}
            onChangeText={handleDiscountChange}
            keyboardType="numeric"
            placeholder="0"
            placeholderTextColor={Colors.textMuted}
          />
        </View>

        {cartTotals.totalDiscount > 0 && (
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Total Diskon</Text>
            <Text style={[styles.summaryValue, { color: Colors.danger }]}>-{formatCurrency(cartTotals.totalDiscount)}</Text>
          </View>
        )}
        {cartTotals.taxAmount > 0 && (
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Pajak (11%)</Text>
            <Text style={styles.summaryValue}>{formatCurrency(cartTotals.taxAmount)}</Text>
          </View>
        )}
        {cartTotals.serviceCharge > 0 && (
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Service (5%)</Text>
            <Text style={styles.summaryValue}>{formatCurrency(cartTotals.serviceCharge)}</Text>
          </View>
        )}
        <View style={[styles.summaryRow, styles.grandTotalRow]}>
          <Text style={styles.grandTotalLabel}>Grand Total</Text>
          <Text style={styles.grandTotalValue}>{formatCurrency(cartTotals.grandTotal)}</Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Metode Pembayaran</Text>
      <View style={styles.methodGrid}>
        {PAYMENT_METHODS.map(m => (
          <TouchableOpacity
            key={m.key}
            style={[styles.methodCard, selectedMethod === m.key && { borderColor: m.color, borderWidth: 2 }]}
            onPress={() => {
              setSelectedMethod(m.key);
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }}
            activeOpacity={0.7}
          >
            {m.icon}
            <Text style={[styles.methodLabel, selectedMethod === m.key && { color: m.color, fontWeight: '700' as const }]}>{m.label}</Text>
            {selectedMethod === m.key && (
              <View style={[styles.methodCheck, { backgroundColor: m.color }]}>
                <Check size={12} color={Colors.white} />
              </View>
            )}
          </TouchableOpacity>
        ))}
      </View>

      {selectedMethod === 'cash' && (
        <View style={styles.cashSection}>
          <Text style={styles.cashLabel}>Jumlah Bayar</Text>
          <TextInput
            style={styles.cashInput}
            value={cashAmount}
            onChangeText={setCashAmount}
            keyboardType="numeric"
            placeholder="0"
            placeholderTextColor={Colors.textMuted}
          />
          <View style={styles.quickAmounts}>
            {quickAmounts.map(amt => (
              <TouchableOpacity
                key={amt}
                style={styles.quickAmountBtn}
                onPress={() => setCashAmount(amt.toString())}
                activeOpacity={0.7}
              >
                <Text style={styles.quickAmountText}>{formatCurrency(amt)}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <TouchableOpacity
            style={styles.exactBtn}
            onPress={() => setCashAmount(Math.ceil(cartTotals.grandTotal).toString())}
            activeOpacity={0.7}
          >
            <Text style={styles.exactBtnText}>Uang Pas</Text>
          </TouchableOpacity>
          {parseFloat(cashAmount) >= cartTotals.grandTotal && (
            <View style={styles.changeBox}>
              <Text style={styles.changeLabel}>Kembalian</Text>
              <Text style={styles.changeValue}>{formatCurrency(change)}</Text>
            </View>
          )}
        </View>
      )}

      <TouchableOpacity
        style={styles.payBtn}
        onPress={handleComplete}
        activeOpacity={0.8}
      >
        <Text style={styles.payBtnText}>Bayar {formatCurrency(cartTotals.grandTotal)}</Text>
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
  summaryCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 18,
    marginBottom: 20,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.text,
    marginBottom: 12,
  },
  summaryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  summaryItemName: {
    fontSize: 13,
    color: Colors.textSecondary,
    flex: 1,
  },
  summaryItemPrice: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: Colors.text,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  summaryLabel: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  summaryValue: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: Colors.text,
  },
  discountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  discountInput: {
    width: 60,
    height: 32,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    textAlign: 'center',
    fontSize: 13,
    color: Colors.text,
    backgroundColor: Colors.surface,
  },
  grandTotalRow: {
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: 10,
    marginTop: 4,
  },
  grandTotalLabel: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.text,
  },
  grandTotalValue: {
    fontSize: 20,
    fontWeight: '800' as const,
    color: Colors.accent,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.text,
    marginBottom: 12,
  },
  methodGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 20,
  },
  methodCard: {
    width: '48%',
    backgroundColor: Colors.white,
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  methodLabel: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: Colors.textSecondary,
  },
  methodCheck: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cashSection: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 18,
    marginBottom: 20,
  },
  cashLabel: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.text,
    marginBottom: 8,
  },
  cashInput: {
    height: 52,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
    paddingHorizontal: 16,
    fontSize: 20,
    fontWeight: '700' as const,
    color: Colors.text,
    textAlign: 'center',
  },
  quickAmounts: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
  },
  quickAmountBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: Colors.accentSoft,
  },
  quickAmountText: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: Colors.accent,
  },
  exactBtn: {
    alignSelf: 'flex-start',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: Colors.primaryLight,
    marginTop: 8,
  },
  exactBtnText: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: Colors.white,
  },
  changeBox: {
    backgroundColor: Colors.successLight,
    borderRadius: 12,
    padding: 14,
    marginTop: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  changeLabel: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.success,
  },
  changeValue: {
    fontSize: 20,
    fontWeight: '800' as const,
    color: Colors.success,
  },
  payBtn: {
    backgroundColor: Colors.accent,
    borderRadius: 16,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.accent,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 8,
  },
  payBtnText: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.white,
  },
});
