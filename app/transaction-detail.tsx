import React, { useMemo } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Receipt, User, Clock, CreditCard } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { useStore } from '@/contexts/StoreContext';
import { formatCurrency, formatDateTime } from '@/utils/format';
import { PaymentMethod } from '@/types';

const PAYMENT_LABELS: Record<PaymentMethod, string> = {
  cash: 'Cash',
  qris: 'QRIS',
  transfer: 'Transfer',
  ewallet: 'E-Wallet',
};

export default function TransactionDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { transactions, settings } = useStore();

  const txn = useMemo(() => transactions.find(t => t.id === id), [transactions, id]);

  if (!txn) {
    return (
      <View style={styles.container}>
        <View style={styles.empty}>
          <Text style={styles.emptyText}>Transaksi tidak ditemukan</Text>
        </View>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.receiptCard}>
        <View style={styles.receiptHeader}>
          <Text style={styles.storeName}>{settings.name}</Text>
          <Text style={styles.storeAddress}>{settings.address}</Text>
          <Text style={styles.storePhone}>{settings.phone}</Text>
        </View>

        <View style={styles.dottedLine} />

        <View style={styles.infoRow}>
          <Receipt size={14} color={Colors.textMuted} />
          <Text style={styles.infoLabel}>Invoice</Text>
          <Text style={styles.infoValue}>{txn.invoiceNo}</Text>
        </View>
        <View style={styles.infoRow}>
          <Clock size={14} color={Colors.textMuted} />
          <Text style={styles.infoLabel}>Tanggal</Text>
          <Text style={styles.infoValue}>{formatDateTime(txn.date)}</Text>
        </View>
        <View style={styles.infoRow}>
          <User size={14} color={Colors.textMuted} />
          <Text style={styles.infoLabel}>Kasir</Text>
          <Text style={styles.infoValue}>{txn.cashierName}</Text>
        </View>

        <View style={styles.dottedLine} />

        <Text style={styles.itemsTitle}>Detail Item</Text>
        {txn.items.map((item, i) => (
          <View key={i} style={styles.itemRow}>
            <View style={styles.itemLeft}>
              <Text style={styles.itemName}>{item.product.name}</Text>
              <Text style={styles.itemQty}>{item.qty} x {formatCurrency(item.product.sellPrice)}</Text>
            </View>
            <Text style={styles.itemTotal}>{formatCurrency(item.product.sellPrice * item.qty)}</Text>
          </View>
        ))}

        <View style={styles.dottedLine} />

        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Subtotal</Text>
          <Text style={styles.totalValue}>{formatCurrency(txn.subtotal)}</Text>
        </View>
        {txn.discountTotal > 0 && (
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Diskon</Text>
            <Text style={[styles.totalValue, { color: Colors.danger }]}>-{formatCurrency(txn.discountTotal)}</Text>
          </View>
        )}
        {txn.taxAmount > 0 && (
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Pajak</Text>
            <Text style={styles.totalValue}>{formatCurrency(txn.taxAmount)}</Text>
          </View>
        )}
        {txn.serviceCharge > 0 && (
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Service Charge</Text>
            <Text style={styles.totalValue}>{formatCurrency(txn.serviceCharge)}</Text>
          </View>
        )}

        <View style={styles.grandTotalRow}>
          <Text style={styles.grandTotalLabel}>TOTAL</Text>
          <Text style={styles.grandTotalValue}>{formatCurrency(txn.grandTotal)}</Text>
        </View>

        <View style={styles.dottedLine} />

        <View style={styles.paymentSection}>
          <View style={styles.paymentHeader}>
            <CreditCard size={14} color={Colors.textMuted} />
            <Text style={styles.paymentTitle}>Pembayaran</Text>
          </View>
          {txn.payments.map((p, i) => (
            <View key={i} style={styles.paymentRow}>
              <Text style={styles.paymentMethod}>{PAYMENT_LABELS[p.method]}</Text>
              <Text style={styles.paymentAmount}>{formatCurrency(p.amount)}</Text>
            </View>
          ))}
        </View>

        <View style={styles.dottedLine} />

        <View style={styles.statusRow}>
          <View style={[styles.statusBadge, txn.status === 'completed' ? styles.statusCompleted : styles.statusVoided]}>
            <Text style={[styles.statusText, txn.status === 'completed' ? styles.statusTextCompleted : styles.statusTextVoided]}>
              {txn.status === 'completed' ? 'LUNAS' : 'DIBATALKAN'}
            </Text>
          </View>
        </View>

        <Text style={styles.footerText}>Terima kasih atas kunjungan Anda!</Text>
        <Text style={styles.footerSubtext}>{settings.name}</Text>
      </View>

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
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: Colors.textMuted,
  },
  receiptCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 20,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  receiptHeader: {
    alignItems: 'center',
    marginBottom: 4,
  },
  storeName: {
    fontSize: 18,
    fontWeight: '800' as const,
    color: Colors.primary,
  },
  storeAddress: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 4,
    textAlign: 'center',
  },
  storePhone: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  dottedLine: {
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    borderStyle: 'dashed',
    marginVertical: 14,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    gap: 8,
  },
  infoLabel: {
    fontSize: 12,
    color: Colors.textMuted,
    width: 60,
  },
  infoValue: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: Colors.text,
    flex: 1,
  },
  itemsTitle: {
    fontSize: 13,
    fontWeight: '700' as const,
    color: Colors.text,
    marginBottom: 10,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  itemLeft: {
    flex: 1,
  },
  itemName: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: Colors.text,
  },
  itemQty: {
    fontSize: 11,
    color: Colors.textMuted,
    marginTop: 2,
  },
  itemTotal: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: Colors.text,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  totalLabel: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  totalValue: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: Colors.text,
  },
  grandTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    paddingTop: 10,
    borderTopWidth: 2,
    borderTopColor: Colors.primary,
  },
  grandTotalLabel: {
    fontSize: 16,
    fontWeight: '800' as const,
    color: Colors.primary,
  },
  grandTotalValue: {
    fontSize: 18,
    fontWeight: '800' as const,
    color: Colors.primary,
  },
  paymentSection: {
    gap: 6,
  },
  paymentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  paymentTitle: {
    fontSize: 13,
    fontWeight: '700' as const,
    color: Colors.text,
  },
  paymentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  paymentMethod: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  paymentAmount: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: Colors.text,
  },
  statusRow: {
    alignItems: 'center',
    marginBottom: 12,
  },
  statusBadge: {
    paddingHorizontal: 20,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusCompleted: {
    backgroundColor: Colors.successLight,
  },
  statusVoided: {
    backgroundColor: Colors.dangerLight,
  },
  statusText: {
    fontSize: 13,
    fontWeight: '700' as const,
  },
  statusTextCompleted: {
    color: Colors.success,
  },
  statusTextVoided: {
    color: Colors.danger,
  },
  footerText: {
    fontSize: 13,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  footerSubtext: {
    fontSize: 11,
    color: Colors.textMuted,
    textAlign: 'center',
    marginTop: 4,
  },
});
