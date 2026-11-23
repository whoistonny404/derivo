import {
  TabList,
  TabSlot,
  TabTrigger,
  TabTriggerSlotProps,
  Tabs,
} from 'expo-router/ui';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { DerivoIcon } from '@/components/derivo-icon';
import { colors } from '@/constants/derivo-theme';
import { useDerivSession } from '@/hooks/use-deriv-session';

type TabLabel = 'Dashboard' | 'History' | 'Account';

export default function AppTabs() {
  const { isConnected } = useDerivSession();

  return (
    <Tabs>
      <TabSlot style={{ flex: 1 }} />
      {isConnected && (
        <TabList asChild>
          <View style={styles.tabListContainer}>
          <TabTrigger name="index" href="/" asChild>
            <TabButton label="Dashboard">Dashboard</TabButton>
          </TabTrigger>
          <TabTrigger name="history" href="/history" asChild>
            <TabButton label="History">History</TabButton>
          </TabTrigger>
          <TabTrigger name="account" href="/account" asChild>
            <TabButton label="Account">Account</TabButton>
          </TabTrigger>
          </View>
        </TabList>
      )}
    </Tabs>
  );
}

function TabButton({
  children,
  isFocused,
  label,
  ...props
}: TabTriggerSlotProps & { label: TabLabel }) {
  const icon = label === 'Dashboard' ? 'home' : label === 'History' ? 'time' : 'person';
  const tint = isFocused ? colors.accent : colors.textSecondary;

  return (
    <Pressable {...props} ref={null} style={({ pressed }) => pressed && styles.pressed}>
      <View style={styles.tabButtonView}>
        <DerivoIcon name={icon} size={21} color={tint} />
        <Text style={[styles.tabLabel, { color: tint }]}>{children}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  tabListContainer: {
    position: 'absolute',
    width: '100%',
    bottom: 0,
    minHeight: 70,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingBottom: 8,
    paddingTop: 7,
  },
  innerContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around', width: '100%' },
  pressed: { opacity: 0.7 },
  tabButtonView: {
    minWidth: 76,
    minHeight: 50,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
  },
  tabLabel: { fontSize: 10, fontWeight: '700' },
});
