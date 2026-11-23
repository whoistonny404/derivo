import { useState } from 'react';
import {
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { DerivoIcon } from '@/components/derivo-icon';
import { DerivoHeader } from '@/components/derivo-header';
import { FeedbackBottomSheet } from '@/components/feedback-bottom-sheet';
import { colors } from '@/constants/derivo-theme';
import { useDerivSession } from '@/hooks/use-deriv-session';
import { useLocalRefresh } from '@/hooks/use-local-refresh';

export default function HistoryScreen() {
  const { isConnected, isRunning } = useDerivSession();
  const [showNewSessionModal, setShowNewSessionModal] = useState(false);
  const [sessionStartedAt, setSessionStartedAt] = useState(() => new Date());
  const { refreshing, refresh } = useLocalRefresh();
  const sessionStartTime = sessionStartedAt.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

  const resetSession = () => {
    setSessionStartedAt(new Date());
    setShowNewSessionModal(false);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <DerivoHeader />
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            onRefresh={refresh}
            refreshing={refreshing}
            tintColor={colors.accent}
            colors={[colors.accent]}
          />
        }
        showsVerticalScrollIndicator={false}>
        <View style={styles.titleRow}>
          <Text style={styles.title}>Trade history</Text>
          <Pressable
            accessibilityLabel="Start a new history session"
            onPress={() => setShowNewSessionModal(true)}
            style={styles.resetButton}>
            <DerivoIcon name="refresh" size={15} color={colors.accent} />
            <Text style={styles.resetText}>New session</Text>
          </Pressable>
        </View>
        <Text style={styles.subtitle}>
          Since {sessionStartTime} · 0 trades this session{isRunning ? ' · Demo bot active' : ''}
        </Text>

        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>TRADES</Text>
            <Text style={styles.statValue}>0</Text>
            <Text style={styles.statSub}>0W · 0L</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>SESSION P&amp;L</Text>
            <Text style={styles.statValue}>$0.00</Text>
            <Text style={styles.statSub}>0% win rate</Text>
          </View>
        </View>

        <View style={styles.list}>
          <View style={styles.emptyCard}>
            <DerivoIcon name="clock" size={40} color={colors.textSecondary} />
            <Text style={styles.emptyText}>No trades this session</Text>
            <Text style={styles.emptySub}>
              {isConnected
                ? 'Your demo trade history will appear here.'
                : 'Connect a demo account from Dashboard to get started.'}
            </Text>
          </View>
        </View>
      </ScrollView>

      <FeedbackBottomSheet
        actionLabel="START NEW SESSION"
        message="Start a fresh demo history session on this device."
        onAction={resetSession}
        onClose={() => setShowNewSessionModal(false)}
        title="Start a new session?"
        visible={showNewSessionModal}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { flexGrow: 1, paddingHorizontal: 20, paddingTop: 8, paddingBottom: 100 },
  titleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 5 },
  title: { color: colors.textPrimary, fontSize: 22, fontWeight: '800', letterSpacing: -0.4 },
  resetButton: { minHeight: 40, flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255, 68, 79, 0.08)', paddingHorizontal: 12, paddingVertical: 7, borderRadius: 20, borderWidth: 1, borderColor: 'rgba(255, 68, 79, 0.25)' },
  resetText: { color: colors.accent, fontSize: 11, fontWeight: '800', marginLeft: 6 },
  subtitle: { color: colors.textSecondary, fontSize: 12, marginBottom: 18 },
  statsRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  statCard: { flex: 1, backgroundColor: colors.surface, borderRadius: 20, padding: 16, borderWidth: 1, borderColor: colors.border, marginHorizontal: 4, elevation: 2 },
  statLabel: { color: colors.textSecondary, fontSize: 9, fontWeight: '800', letterSpacing: 1, marginBottom: 8 },
  statValue: { color: colors.textPrimary, fontSize: 21, fontWeight: '800', fontVariant: ['tabular-nums'] },
  statSub: { color: colors.textSecondary, fontSize: 11, fontWeight: '600', marginTop: 4 },
  list: { paddingBottom: 100 },
  emptyCard: { backgroundColor: colors.surface, borderRadius: 20, padding: 32, alignItems: 'center', borderWidth: 1, borderColor: colors.border },
  emptyText: { color: colors.textPrimary, fontSize: 16, fontWeight: '700', marginTop: 12, marginBottom: 6 },
  emptySub: { color: colors.textSecondary, fontSize: 13, textAlign: 'center', lineHeight: 18 },
});
