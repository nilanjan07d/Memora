import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

export default function RootLayout() {
  return (
    <>
      <StatusBar style="dark" />
      <Stack screenOptions={{ 
        headerShown: false,
        animation: 'slide_from_right',
      }}>
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="journey/[id]" />
        <Stack.Screen name="memory/[id]" />
      </Stack>
    </>
  );
}