import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { AuthProvider } from "@/contexts/AuthContext";
import { StoreProvider } from "@/contexts/StoreContext";
import Colors from "@/constants/colors";

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

function RootLayoutNav() {
  return (
    <Stack
      screenOptions={{
        headerBackTitle: "Kembali",
        headerStyle: { backgroundColor: Colors.primary },
        headerTintColor: Colors.white,
        headerTitleStyle: { fontWeight: '700' as const },
      }}
    >
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen
        name="checkout"
        options={{
          presentation: 'modal',
          title: 'Pembayaran',
          headerStyle: { backgroundColor: Colors.white },
          headerTintColor: Colors.text,
        }}
      />
      <Stack.Screen
        name="product-form"
        options={{
          presentation: 'modal',
          title: 'Produk',
          headerStyle: { backgroundColor: Colors.white },
          headerTintColor: Colors.text,
        }}
      />
      <Stack.Screen
        name="transaction-detail"
        options={{
          title: 'Detail Transaksi',
        }}
      />
      <Stack.Screen
        name="manage-categories"
        options={{
          presentation: 'modal',
          title: 'Menu & Kategori',
          headerStyle: { backgroundColor: Colors.white },
          headerTintColor: Colors.text,
        }}
      />
      <Stack.Screen
        name="manage-printers"
        options={{
          presentation: 'modal',
          title: 'Printer Kasir',
          headerStyle: { backgroundColor: Colors.white },
          headerTintColor: Colors.text,
        }}
      />
      <Stack.Screen
        name="manage-ingredients"
        options={{
          presentation: 'modal',
          title: 'HPP & Bahan Baku',
          headerStyle: { backgroundColor: Colors.white },
          headerTintColor: Colors.text,
        }}
      />
      <Stack.Screen
        name="manage-receipt"
        options={{
          presentation: 'modal',
          title: 'Pengaturan Struk',
          headerStyle: { backgroundColor: Colors.white },
          headerTintColor: Colors.text,
        }}
      />
    </Stack>
  );
}

export default function RootLayout() {
  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <GestureHandlerRootView>
        <AuthProvider>
          <StoreProvider>
            <RootLayoutNav />
          </StoreProvider>
        </AuthProvider>
      </GestureHandlerRootView>
    </QueryClientProvider>
  );
}
