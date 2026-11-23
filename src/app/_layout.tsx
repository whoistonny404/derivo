import { DarkTheme, ThemeProvider } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useState } from 'react';
import { View } from 'react-native';

import AppTabs from '@/components/app-tabs';
import { DerivoFloatingWidget } from '@/components/derivo-floating-widget';
import { DerivoOpeningScreen } from '@/components/derivo-opening-screen';
import { DerivSessionProvider } from '@/hooks/use-deriv-session';

const derivoTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: '#070C18',
    card: '#0F172A',
    border: '#23364B',
    primary: '#FF444F',
    text: '#F1F5F9',
  },
};

export default function RootLayout() {
  const [showOpeningScreen, setShowOpeningScreen] = useState(true);
  const finishOpeningScreen = useCallback(() => setShowOpeningScreen(false), []);

  return (
    <ThemeProvider value={derivoTheme}>
      <DerivSessionProvider>
        <StatusBar style="light" />
        <View style={{ flex: 1 }}>
          <AppTabs />
          <DerivoFloatingWidget />
          {showOpeningScreen && <DerivoOpeningScreen onFinish={finishOpeningScreen} />}
        </View>
      </DerivSessionProvider>
    </ThemeProvider>
  );
}
