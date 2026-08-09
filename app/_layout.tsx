import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import { HistoryProvider } from '../lib/history-context';

export default function RootLayout() {
  return (
    <HistoryProvider>
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: '#25292e' },
          headerShadowVisible: false,
          headerTintColor: '#fff',
          contentStyle: { backgroundColor: '#25292e' },
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack>
      <StatusBar style="light" />
    </HistoryProvider>
  );
}