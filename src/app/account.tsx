import { useState } from 'react';
import {
  Linking,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { DerivoIcon } from '@/components/derivo-icon';
import { FeedbackBottomSheet } from '@/components/feedback-bottom-sheet';
import { DerivoHeader } from '@/components/derivo-header';
import { colors } from '@/constants/derivo-theme';
import { useDerivSession } from '@/hooks/use-deriv-session';
import { useLocalRefresh } from '@/hooks/use-local-refresh';

export default function AccountScreen() {
  const { isConnected, accountBalance } = useDerivSession();
  const [feedback, setFeedback] = useState({ title: '', message: '' });
  const [showFeedback, setShowFeedback] = useState(false);
  const { refreshing, refresh } = useLocalRefresh();

  const showMessage = (title: string, message: string) => {
    setFeedback({ title, message });
    setShowFeedback(true);
  };

  const handleWhatsApp = async () => {
    try {
      await Linking.openURL('https://wa.me/254704182603');
    } catch (error) {
      console.error('[SUPPORT] Could not open WhatsApp', error);
      showMessage('Unable to open WhatsApp', 'Please contact support by phone at 0704182603.');
    }
  };

  const handleCall = async () => {
    try {
      await Linking.openURL('tel:0704182603');
    } catch (error) {
      console.error('[SUPPORT] Could not start phone call', error);
      showMessage('Unable to place call', 'Please call support at 0704182603.');
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <DerivoHeader />
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            onRefresh={refresh}
            refreshing={refreshing}
            tintColor={colors.accent}
            colors={[colors.accent]}
          />
        }>
        <View style={styles.screenIntro}>
          <Text style={styles.title}>Account</Text>
          <Text style={styles.subtitle}>Your Deriv account and support</Text>
        </View>

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.cardIcon}>
              <DerivoIcon name="user" size={21} color={colors.accent} />
            </View>
            <Text style={styles.cardTitle}>Bot Account</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Status:</Text>
            <Text style={[styles.value, { color: colors.warning }]}>Development demo</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Account type:</Text>
            <Text style={styles.value}>Demo access</Text>
          </View>
        </View>

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.cardIcon}>
              <DerivoIcon name="link" size={20} color={colors.accent} />
            </View>
            <Text style={styles.cardTitle}>Deriv Account Info</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Status:</Text>
            <Text style={[styles.value, { color: isConnected ? colors.success : colors.textSecondary }]}>
              {isConnected ? 'Connected · Demo' : 'Not connected'}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Account type:</Text>
            <Text style={styles.value}>{isConnected ? 'Development demo' : '—'}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Balance:</Text>
            <Text style={styles.value}>{isConnected ? `$${accountBalance.toFixed(2)}` : '—'}</Text>
          </View>
        </View>

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.cardIcon}>
              <DerivoIcon name="help" size={21} color={colors.accent} />
            </View>
            <Text style={styles.cardTitle}>Help &amp; Support</Text>
          </View>
          <Text style={styles.supportText}>
            If you need assistance with your account, connection, or trading bot, reach out to our support team.
          </Text>
          <View style={styles.supportButtonsRow}>
            <Pressable onPress={handleWhatsApp} style={styles.supportButton}>
              <DerivoIcon name="whatsapp" size={20} color="#25D366" />
              <Text style={styles.supportButtonText}>WhatsApp</Text>
            </Pressable>
            <Pressable onPress={handleCall} style={styles.supportButton}>
              <DerivoIcon name="phone" size={20} color={colors.accent} />
              <Text style={styles.supportButtonText}>Call Us</Text>
            </Pressable>
          </View>
          <Text style={styles.phoneText}>0704182603</Text>
        </View>
      </ScrollView>
      <FeedbackBottomSheet
        message={feedback.message}
        onClose={() => setShowFeedback(false)}
        title={feedback.title}
        visible={showFeedback}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 120 },
  screenIntro: { marginBottom: 17 },
  title: { color: colors.textPrimary, fontSize: 22, fontWeight: '800', letterSpacing: -0.4 },
  subtitle: { color: colors.textSecondary, fontSize: 12, marginTop: 4 },
  card: { backgroundColor: colors.surface, borderRadius: 20, padding: 18, marginBottom: 14, borderWidth: 1, borderColor: colors.border, elevation: 2 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
  cardIcon: { width: 36, height: 36, borderRadius: 12, backgroundColor: 'rgba(255, 68, 79, 0.1)', alignItems: 'center', justifyContent: 'center' },
  cardTitle: { color: colors.textPrimary, fontSize: 15, fontWeight: '700', marginLeft: 10 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginVertical: 7 },
  label: { color: colors.textSecondary, fontSize: 13, flexShrink: 0 },
  value: { color: colors.textPrimary, fontSize: 13, fontWeight: '600', textAlign: 'right', flexShrink: 1, marginLeft: 12 },
  supportText: { color: colors.textSecondary, fontSize: 13, lineHeight: 19, marginBottom: 16 },
  supportButtonsRow: { flexDirection: 'row', justifyContent: 'space-between', marginHorizontal: -4 },
  supportButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceLight,
    minHeight: 48,
    paddingVertical: 12,
    borderRadius: 14,
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: colors.border,
  },
  supportButtonText: { color: colors.textPrimary, fontSize: 14, fontWeight: '700', marginLeft: 8 },
  phoneText: { color: colors.accent, fontSize: 16, fontWeight: '800', textAlign: 'center', marginTop: 16 },
});
