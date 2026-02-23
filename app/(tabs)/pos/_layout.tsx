import { Stack } from "expo-router";
import Colors from "@/constants/colors";

export default function PosLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: Colors.primary },
        headerTintColor: Colors.white,
        headerTitleStyle: { fontWeight: '700' as const },
      }}
    >
      <Stack.Screen name="index" options={{ title: "Kasir" }} />
    </Stack>
  );
}
