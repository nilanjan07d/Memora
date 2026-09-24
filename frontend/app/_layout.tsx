import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";

export default function RootLayout() {
  return (
    <>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerShown: false,
          animation: "slide_from_right",
        }}
      >
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="journey/[id]" />
        <Stack.Screen name="journey/[id]/members" />
        <Stack.Screen name="memory/[id]" />
        <Stack.Screen name="memory/[id]/edit" />
        <Stack.Screen name="notifications" />
        <Stack.Screen name="help-support" />
        <Stack.Screen name="privacy-policy" />
      </Stack>
    </>
  );
}
