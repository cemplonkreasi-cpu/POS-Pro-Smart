import React, { useState, useMemo } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
} from 'react-native';
import {
  TrendingUp, DollarSign, Users,
} from 'lucide-react-native';
import Colors from '@/constants/colors';
import { useStore } from '@/contexts/StoreContext';
import { formatCurrency } from '@/utils/format';
import { DAILY_SALES } from '@/mocks/data';
import { PaymentMethod } from '@/types';

type ReportTab = 'daily' | 'payment' | 'product' | 'cashier';

const TABS: { key: ReportTab; label: string }[] = [
  { key: 'daily', label: 'Harian' },
  { key: 'payment', label: 'Pembayaran' },
  { key: 'product', label: 'Produk' },
  { key: 'cashier', label: 'Kasir' },
];

const PAYMENT_LABELS: Record<PaymentMethod, string> = {
  cash: 'Cash',
  qris: 'QRIS',
  transfer: 'Transfer',
  ewallet: 'E-Wallet',
};

const PAYMENT_COLORS: Record<PaymentMethod, string> = {
  cash: Colors.cashMethod,
  qris: Colors.qrisMethod,
  transfer: Colors.transferMethod,
  ewallet: Colors.ewalletMethod,
};

export default function ReportsScreen() {
  const { transactions, topProducts } = useStore();
  const [activeTab, setActiveTab] = useState<ReportTab>('daily');

  const maxSale = useMemo(() => Math.max(...DAILY_SALES.map(d => d.total), 1), []);

  const paymentBreakdown = useMemo(() => {
    const map: Record<string, number> = {};
    transactions.forEach(t => {
      if (t.status === 'completed') {
        t.payments.forEach(p => {
          map[p.method] = (map[p.method] || 0) + p.amount;
        });
      }
    });
    const total = Object.values(map).reduce((s, v) => s + v, 0);
    return Object.entries(map).map(([method, amount]) => ({
      method: method as PaymentMethod,
      amount,
      percent: total > 0 ? (amount / total) * 100 : 0,
    })).sort((a, b) => b.amount - a.amount);
  }, [transactions]);

  const cashierBreakdown = useMemo(() => {
    const map: Record<string, { name: string; total: number; count: number }> = {};
    transactions.forEach(t => {
      if (t.status === 'completed') {
        if (!map[t.cashierId]) {
          map[t.cashierId] = { name: t.cashierName, total: 0, count: 0 };
        }
        map[t.cashierId].total += t.grandTotal;
        map[t.cashierId].count += 1;
      }
    });
    return Object.values(map).sort((a, b) => b.total - a.total);
  }, [transactions]);

  const totalRevenue = useMemo(() => {
    return transactions.filter(t => t.status === 'completed').reduce((s, t) => s + t.grandTotal, 0);
  }, [transactions]);

  const totalProfit = useMemo(() => {
    let profit = 0;
    transactions.forEach(t => {
      if (t.status === 'completed') {
        t.items.forEach(item => {
          profit += (item.product.sellPrice - item.product.buyPrice) * item.qty;
        });
      }
    });
    return profit;
  }, [transactions]);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.summaryCards}>
        <View style={styles.summaryCard}>
          <View style={[styles.summaryIcon, { backgroundColor: Colors.accentSoft }]}>
            <DollarSign size={18} color={Colors.accent} />
          </View>
          <Text style={styles.summaryValue}>{formatCurrency(totalRevenue)}</Text>
          <Text style={styles.summaryLabel}>Total Pendapatan</Text>
        </View>
        <View style={styles.summaryCard}>
          <View style={[styles.summaryIcon, { backgroundColor: Colors.successLight }]}>
            <TrendingUp size={18} color={Colors.success} />
          </View>
          <Text style={styles.summaryValue}>{formatCurrency(totalProfit)}</Text>
          <Text style={styles.summaryLabel}>Laba Kotor</Text>
        </View>
      </View>

      <View style={styles.tabRow}>
        {TABS.map(tab => (
          <TouchableOpacity
            key={tab.key}
            style={[styles.tab, activeTab === tab.key && styles.tabActive]}
            onPress={() => setActiveTab(tab.key)}
            activeOpacity={0.7}
          >
            <Text style={[styles.tabText, activeTab === tab.key && styles.tabTextActive]}>{tab.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {activeTab === 'daily' && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Penjualan 7 Hari Terakhir</Text>
          <View style={styles.chartCard}>
            <View style={styles.barChart}>
              {DAILY_SALES.map((d, i) => {
                const h = (d.total / maxSale) * 120;
                const isToday = i === DAILY_SALES.length - 1;
                return (
                  <View key={d.date} style={styles.barCol}>
                    <Text style={styles.barValue}>{(d.total / 1000000).toFixed(1)}M</Text>
                    <View style={styles.barWrapper}>
                      <View style={[styles.bar, { height: h }, isToday && styles.barToday]} />
                    </View>
                    <Text style={[styles.barLabel, isToday && styles.barLabelToday]}>
                      {new Date(d.date).toLocaleDateString('id-ID', { weekday: 'short' }).slice(0, 3)}
                    </Text>
                    <Text style={styles.barTxn}>{d.transactions} txn</Text>
                  </View>
                );
              })}
            </View>
          </View>
        </View>
      )}

      {activeTab === 'payment' && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Metode Pembayaran</Text>
          {paymentBreakdown.map(p => (
            <View key={p.method} style={styles.paymentRow}>
              <View style={[styles.paymentDot, { backgroundColor: PAYMENT_COLORS[p.method] }]} />
              <View style={styles.paymentInfo}>
                <Text style={styles.paymentName}>{PAYMENT_LABELS[p.method]}</Text>
                <View style={styles.paymentBarTrack}>
                  <View
                    style={[styles.paymentBarFill, { width: `${p.percent}%`, backgroundColor: PAYMENT_COLORS[p.method] }]}
                  />
                </View>
              </View>
              <View style={styles.paymentRight}>
                <Text style={styles.paymentAmount}>{formatCurrency(p.amount)}</Text>
                <Text style={styles.paymentPercent}>{p.percent.toFixed(1)}%</Text>
              </View>
            </View>
          ))}
        </View>
      )}

      {activeTab === 'product' && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Produk Terlaris</Text>
          {topProducts.map((tp, i) => (
            <View key={tp.product.id} style={styles.productRow}>
              <View style={[styles.rankBadge, i === 0 && styles.rankBadgeGold]}>
                <Text style={[styles.rankText, i === 0 && styles.rankTextGold]}>#{i + 1}</Text>
              </View>
              <View style={styles.productInfo}>
                <Text style={styles.productName}>{tp.product.name}</Text>
                <Text style={styles.productSold}>{tp.sold} terjual</Text>
              </View>
              <Text style={styles.productRevenue}>
                {formatCurrency(tp.product.sellPrice * tp.sold)}
              </Text>
            </View>
          ))}
          {topProducts.length === 0 && (
            <Text style={styles.emptyText}>Belum ada data</Text>
          )}
        </View>
      )}

      {activeTab === 'cashier' && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Performa Kasir</Text>
          {cashierBreakdown.map((c, i) => (
            <View key={i} style={styles.cashierRow}>
              <View style={styles.cashierAvatar}>
                <Users size={16} color={Colors.accent} />
              </View>
              <View style={styles.cashierInfo}>
                <Text style={styles.cashierName}>{c.name}</Text>
                <Text style={styles.cashierTxn}>{c.count} transaksi</Text>
              </View>
              <Text style={styles.cashierTotal}>{formatCurrency(c.total)}</Text>
            </View>
          ))}
          {cashierBreakdown.length === 0 && (
            <Text style={styles.emptyText}>Belum ada data</Text>
          )}
        </View>
      )}

      <View style={{ height: 24 }} />
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
  summaryCards: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: Colors.white,
    borderRadius: 14,
    padding: 16,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  summaryIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: '800' as const,
    color: Colors.text,
  },
  summaryLabel: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  tabRow: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 4,
    marginBottom: 20,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  tabActive: {
    backgroundColor: Colors.primary,
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: Colors.textSecondary,
  },
  tabTextActive: {
    color: Colors.white,
  },
  section: {},
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.text,
    marginBottom: 14,
  },
  chartCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  barChart: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 4,
  },
  barCol: {
    flex: 1,
    alignItems: 'center',
  },
  barValue: {
    fontSize: 9,
    fontWeight: '600' as const,
    color: Colors.textMuted,
    marginBottom: 4,
  },
  barWrapper: {
    width: '75%',
    height: 120,
    justifyContent: 'flex-end',
  },
  bar: {
    backgroundColor: Colors.accentSoft,
    borderRadius: 4,
    minHeight: 4,
  },
  barToday: {
    backgroundColor: Colors.accent,
  },
  barLabel: {
    fontSize: 10,
    color: Colors.textMuted,
    marginTop: 6,
    fontWeight: '500' as const,
  },
  barLabelToday: {
    color: Colors.accent,
    fontWeight: '700' as const,
  },
  barTxn: {
    fontSize: 8,
    color: Colors.textMuted,
    marginTop: 2,
  },
  paymentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
    gap: 12,
  },
  paymentDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  paymentInfo: {
    flex: 1,
    gap: 6,
  },
  paymentName: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: Colors.text,
  },
  paymentBarTrack: {
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.surface,
  },
  paymentBarFill: {
    height: 6,
    borderRadius: 3,
  },
  paymentRight: {
    alignItems: 'flex-end',
  },
  paymentAmount: {
    fontSize: 13,
    fontWeight: '700' as const,
    color: Colors.text,
  },
  paymentPercent: {
    fontSize: 11,
    color: Colors.textSecondary,
  },
  productRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
  },
  rankBadge: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rankBadgeGold: {
    backgroundColor: Colors.warningLight,
  },
  rankText: {
    fontSize: 12,
    fontWeight: '800' as const,
    color: Colors.textSecondary,
  },
  rankTextGold: {
    color: Colors.warning,
  },
  productInfo: {
    flex: 1,
    marginLeft: 12,
  },
  productName: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.text,
  },
  productSold: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  productRevenue: {
    fontSize: 13,
    fontWeight: '700' as const,
    color: Colors.accent,
  },
  cashierRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
  },
  cashierAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.accentSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cashierInfo: {
    flex: 1,
    marginLeft: 12,
  },
  cashierName: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.text,
  },
  cashierTxn: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  cashierTotal: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: Colors.accent,
  },
  emptyText: {
    fontSize: 14,
    color: Colors.textMuted,
    textAlign: 'center',
    paddingVertical: 24,
  },
});
