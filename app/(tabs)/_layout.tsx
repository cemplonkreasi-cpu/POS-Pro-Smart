import { Tabs } from "expo-router";
import { LayoutDashboard, ShoppingCart, Package, BarChart3, Settings } from "lucide-react-native";
import React from "react";
import Colors from "@/constants/colors";
import { useAuth } from "@/contexts/AuthContext";

export default function TabLayout() {
  const { user } = useAuth();
  const isKasir = user?.role === 'kasir';

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Colors.accent,
        tabBarInactiveTintColor: Colors.textMuted,
        tabBarStyle: {
          backgroundColor: Colors.white,
          borderTopColor: Colors.borderLight,
          borderTopWidth: 1,
          paddingTop: 4,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600' as const,
        },
      }}
    >
      <Tabs.Screen
        name="dashboard"
        options={{
          title: "Dashboard",
          tabBarIcon: ({ color, size }) => <LayoutDashboard size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="pos"
        options={{
          title: "Kasir",
          tabBarIcon: ({ color, size }) => <ShoppingCart size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="products"
        options={{
          title: "Produk",
          tabBarIcon: ({ color, size }) => <Package size={size} color={color} />,
          href: isKasir ? null : undefined,
        }}
      />
      <Tabs.Screen
        name="reports"
        options={{
          title: "Laporan",
          tabBarIcon: ({ color, size }) => <BarChart3 size={size} color={color} />,
          href: isKasir ? null : undefined,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "Pengaturan",
          tabBarIcon: ({ color, size }) => <Settings size={size} color={color} />,
        }}
      />
    </Tabs>
  );
}
