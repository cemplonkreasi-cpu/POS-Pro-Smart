import React, { useMemo } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
} from 'react-native';
import { router } from 'expo-router';
import {
  TrendingUp, ShoppingCart, Package, AlertTriangle, ArrowRight, DollarSign, Receipt, Users,
} from 'lucide-react-native';
import Colors from '@/constants/colors';
import { useAuth } from '@/contexts/AuthContext';
import { useStore } from '@/contexts/StoreContext';
import { formatCurrency } from '@/utils/format';
import { DAILY_SALES } from '@/mocks/data';

export default function DashboardScreen() {
  const { user, logout } = useAuth();
  const { todayTransactions, todayTotal, lowStockProducts, topProducts } = useStore();
  const isKasir = user?.role === 'kasir';

  const maxSale = useMemo(() => Math.max(...DAILY_SALES.map(d => d.total)), []);

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin': return Colors.accent;
      case 'supervisor': return Colors.warning;
      case 'kasir': return Colors.success;
      default: return Colors.textMuted;
    }
  };

  if (isKasir) {
    return (
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <View style={styles.greetingSection}>
          <View style={styles.greetingRow}>
            <View style={styles.avatarCircle}>
              <Text style={styles.avatarText}>{user?.name?.charAt(0) || 'K'}</Text>
            </View>
            <View style={styles.greetingInfo}>
              <Text style={styles.greetingName}>Halo, {user?.name}</Text>
              <View style={[styles.roleBadge, { backgroundColor: Colors.successLight }]}>
                <Text style={[styles.roleText, { color: Colors.success }]}>Kasir</Text>
              </View>
            </View>
          </View>
        </View>

        <TouchableOpacity
          style={styles.startTransactionBtn}
          onPress={() => router.push('/(tabs)/pos' as any)}
          activeOpacity={0.8}
        >
          <ShoppingCart size={28} color={Colors.white} />
          <Text style={styles.startTransactionText}>Mulai Transaksi</Text>
          <ArrowRight size={22} color={Colors.white} />
        </TouchableOpacity>

        <View style={styles.kasirStatsRow}>
          <View style={[styles.kasirStatCard, { backgroundColor: Colors.accentSoft }]}>
            <Receipt size={22} color={Colors.accent} />
            <Text style={styles.kasirStatValue}>{todayTransactions.length}</Text>
            <Text style={styles.kasirStatLabel}>Transaksi</Text>
          </View>
          <View style={[styles.kasirStatCard, { backgroundColor: Colors.successLight }]}>
            <DollarSign size={22} color={Colors.success} />
            <Text style={styles.kasirStatValue}>{formatCurrency(todayTotal)}</Text>
            <Text style={styles.kasirStatLabel}>Setoran Hari Ini</Text>
          </View>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Transaksi Terakhir</Text>
        </View>
        {todayTransactions.slice(0, 5).map(t => (
          <TouchableOpacity
            key={t.id}
            style={styles.txnCard}
            onPress={() => router.push({ pathname: '/transaction-detail' as any, params: { id: t.id } })}
            activeOpacity={0.7}
          >
            <View style={styles.txnLeft}>
              <Text style={styles.txnInvoice}>{t.invoiceNo}</Text>
              <Text style={styles.txnTime}>{new Date(t.date).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</Text>
            </View>
            <Text style={styles.txnAmount}>{formatCurrency(t.grandTotal)}</Text>
          </TouchableOpacity>
        ))}
        {todayTransactions.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>Belum ada transaksi hari ini</Text>
          </View>
        )}
      </ScrollView>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.greetingSection}>
        <View style={styles.greetingRow}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarText}>{user?.name?.charAt(0) || 'A'}</Text>
          </View>
          <View style={styles.greetingInfo}>
            <Text style={styles.greetingName}>Halo, {user?.name}</Text>
            <View style={[styles.roleBadge, { backgroundColor: getRoleBadgeColor(user?.role || '') + '20' }]}>
              <Text style={[styles.roleText, { color: getRoleBadgeColor(user?.role || '') }]}>
                {user?.role === 'admin' ? 'Admin' : 'Supervisor'}
              </Text>
            </View>
          </View>
          <TouchableOpacity onPress={logout} style={styles.logoutBtn}>
            <Text style={styles.logoutText}>Keluar</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.statsGrid}>
        <View style={styles.statCardLarge}>
          <View style={styles.statIconWrap}>
            <DollarSign size={20} color={Colors.accent} />
          </View>
          <Text style={styles.statLargeValue}>{formatCurrency(todayTotal)}</Text>
          <Text style={styles.statLabel}>Penjualan Hari Ini</Text>
        </View>
        <View style={styles.statsRow}>
          <View style={styles.statCardSmall}>
            <Receipt size={18} color={Colors.success} />
            <Text style={styles.statSmallValue}>{todayTransactions.length}</Text>
            <Text style={styles.statSmallLabel}>Transaksi</Text>
          </View>
          <View style={styles.statCardSmall}>
            <AlertTriangle size={18} color={Colors.warning} />
            <Text style={styles.statSmallValue}>{lowStockProducts.length}</Text>
            <Text style={styles.statSmallLabel}>Stok Rendah</Text>
          </View>
          <View style={styles.statCardSmall}>
            <Users size={18} color={Colors.info} />
            <Text style={styles.statSmallValue}>{topProducts.length}</Text>
            <Text style={styles.statSmallLabel}>Produk Laris</Text>
          </View>
        </View>
      </View>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Penjualan 7 Hari</Text>
      </View>
      <View style={styles.chartCard}>
        <View style={styles.barChart}>
          {DAILY_SALES.map((d, i) => {
            const height = maxSale > 0 ? (d.total / maxSale) * 100 : 0;
            const isToday = i === DAILY_SALES.length - 1;
            return (
              <View key={d.date} style={styles.barCol}>
                <View style={styles.barContainer}>
                  <View
                    style={[
                      styles.bar,
                      { height: `${height}%` },
                      isToday && styles.barToday,
                    ]}
                  />
                </View>
                <Text style={[styles.barLabel, isToday && styles.barLabelToday]}>
                  {new Date(d.date).toLocaleDateString('id-ID', { weekday: 'short' }).slice(0, 3)}
                </Text>
              </View>
            );
          })}
        </View>
      </View>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Produk Terlaris</Text>
      </View>
      {topProducts.map((tp, i) => (
        <View key={tp.product.id} style={styles.topProductCard}>
          <View style={styles.topRank}>
            <Text style={styles.topRankText}>#{i + 1}</Text>
          </View>
          <View style={styles.topProductInfo}>
            <Text style={styles.topProductName}>{tp.product.name}</Text>
            <Text style={styles.topProductSold}>{tp.sold} terjual</Text>
          </View>
          <Text style={styles.topProductPrice}>{formatCurrency(tp.product.sellPrice)}</Text>
        </View>
      ))}

      {lowStockProducts.length > 0 && (
        <>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Stok Menipis</Text>
            <AlertTriangle size={16} color={Colors.warning} />
          </View>
          {lowStockProducts.slice(0, 3).map(p => (
            <View key={p.id} style={styles.lowStockCard}>
              <View style={styles.lowStockInfo}>
                <Text style={styles.lowStockName}>{p.name}</Text>
                <Text style={styles.lowStockSku}>{p.sku}</Text>
              </View>
              <View style={styles.lowStockBadge}>
                <Text style={styles.lowStockQty}>{p.stock} sisa</Text>
              </View>
            </View>
          ))}
        </>
      )}

      <View style={styles.quickActions}>
        <TouchableOpacity style={styles.quickActionBtn} onPress={() => router.push('/(tabs)/pos' as any)} activeOpacity={0.7}>
          <ShoppingCart size={20} color={Colors.accent} />
          <Text style={styles.quickActionText}>Kasir</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.quickActionBtn} onPress={() => router.push('/(tabs)/products' as any)} activeOpacity={0.7}>
          <Package size={20} color={Colors.accent} />
          <Text style={styles.quickActionText}>Produk</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.quickActionBtn} onPress={() => router.push('/(tabs)/reports' as any)} activeOpacity={0.7}>
          <TrendingUp size={20} color={Colors.accent} />
          <Text style={styles.quickActionText}>Laporan</Text>
        </TouchableOpacity>
      </View>

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
  greetingSection: {
    marginBottom: 20,
  },
  greetingRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: Colors.white,
    fontSize: 20,
    fontWeight: '700' as const,
  },
  greetingInfo: {
    flex: 1,
    marginLeft: 12,
  },
  greetingName: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.text,
  },
  roleBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 6,
    marginTop: 4,
  },
  roleText: {
    fontSize: 11,
    fontWeight: '700' as const,
  },
  logoutBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: Colors.dangerLight,
  },
  logoutText: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: Colors.danger,
  },
  startTransactionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.accent,
    borderRadius: 16,
    paddingVertical: 20,
    gap: 12,
    marginBottom: 20,
    shadowColor: Colors.accent,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 8,
  },
  startTransactionText: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.white,
  },
  kasirStatsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  kasirStatCard: {
    flex: 1,
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
    gap: 6,
  },
  kasirStatValue: {
    fontSize: 16,
    fontWeight: '800' as const,
    color: Colors.text,
  },
  kasirStatLabel: {
    fontSize: 11,
    color: Colors.textSecondary,
    fontWeight: '500' as const,
  },
  statsGrid: {
    marginBottom: 20,
  },
  statCardLarge: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  statIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: Colors.accentSoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  statLargeValue: {
    fontSize: 24,
    fontWeight: '800' as const,
    color: Colors.text,
  },
  statLabel: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  statCardSmall: {
    flex: 1,
    backgroundColor: Colors.white,
    borderRadius: 14,
    padding: 14,
    alignItems: 'center',
    gap: 6,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  statSmallValue: {
    fontSize: 18,
    fontWeight: '800' as const,
    color: Colors.text,
  },
  statSmallLabel: {
    fontSize: 10,
    color: Colors.textSecondary,
    fontWeight: '500' as const,
    textAlign: 'center',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 20,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.text,
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
    height: 120,
    gap: 4,
  },
  barCol: {
    flex: 1,
    alignItems: 'center',
  },
  barContainer: {
    width: '80%',
    height: 100,
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
  topProductCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  topRank: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: Colors.accentSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topRankText: {
    fontSize: 13,
    fontWeight: '800' as const,
    color: Colors.accent,
  },
  topProductInfo: {
    flex: 1,
    marginLeft: 12,
  },
  topProductName: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.text,
  },
  topProductSold: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  topProductPrice: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: Colors.accent,
  },
  lowStockCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
    borderLeftWidth: 3,
    borderLeftColor: Colors.warning,
  },
  lowStockInfo: {
    flex: 1,
  },
  lowStockName: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.text,
  },
  lowStockSku: {
    fontSize: 11,
    color: Colors.textMuted,
    marginTop: 2,
  },
  lowStockBadge: {
    backgroundColor: Colors.warningLight,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  lowStockQty: {
    fontSize: 12,
    fontWeight: '700' as const,
    color: Colors.warning,
  },
  quickActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 24,
  },
  quickActionBtn: {
    flex: 1,
    backgroundColor: Colors.white,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    gap: 6,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  quickActionText: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: Colors.text,
  },
  txnCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  txnLeft: {},
  txnInvoice: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: Colors.text,
  },
  txnTime: {
    fontSize: 11,
    color: Colors.textMuted,
    marginTop: 2,
  },
  txnAmount: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: Colors.accent,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyText: {
    fontSize: 14,
    color: Colors.textMuted,
  },
});
