import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Dimensions, Pressable, StyleSheet, Text, View } from 'react-native';
import { DerivoIcon } from '@/components/derivo-icon';
import { FeedbackBottomSheet } from '@/components/feedback-bottom-sheet';
import { colors } from '@/constants/derivo-theme';
import { useDerivSession } from '@/hooks/use-deriv-session';

const { height } = Dimensions.get('window');

export function DerivoHeader() {
  const router = useRouter();
  const [imageFailed, setImageFailed] = useState(false);
  const [showPauseNotice, setShowPauseNotice] = useState(false);
  const { isConnected, isRunning, disconnectDemo } = useDerivSession();

  const handleDisconnect = () => {
    if (isRunning) {
      setShowPauseNotice(true);
      return;
    }
    disconnectDemo();
    router.replace('/');
  };

  return (
    <View style={styles.heroContainer}>
      {!imageFailed && (
        <Image
          contentFit="cover"
          onError={() => setImageFailed(true)}
          source={require('@/assets/images/deriv.png')}
          style={styles.heroImage}
        />
      )}
      <View pointerEvents="none" style={styles.heroTint} />
      <View style={styles.heroText}>
        <Text style={styles.eyebrow}>AUTOMATED TRADING</Text>
        <Text style={styles.brandTitle}>Derivo</Text>
        <View style={styles.statusRow}>
          <View style={styles.statusPill}>
            <View style={[styles.dot, isConnected && styles.connectedDot]} />
            <Text style={styles.statusText}>
              {isConnected ? 'DEMO SESSION ACTIVE' : 'DEMO SESSION INACTIVE'}
            </Text>
          </View>
          {isConnected && (
            <Pressable onPress={handleDisconnect} style={styles.disconnectButton}>
              <DerivoIcon name="logout" size={15} color={colors.danger} />
              <Text style={styles.disconnectText}>Disconnect</Text>
            </Pressable>
          )}
          <FeedbackBottomSheet
            message="Pause the bot before disconnecting this demo account."
            onClose={() => setShowPauseNotice(false)}
            title="Pause the demo first"
            visible={showPauseNotice}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  heroContainer: {
    height: height * 0.35,
    width: '100%',
    position: 'relative',
    overflow: 'hidden',
    backgroundColor: colors.background,
  },
  heroImage: { position: 'absolute', width: '100%', height: '100%', opacity: 0.72 },
  heroTint: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(7, 12, 24, 0.26)',
  },
  heroText: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 12,
    paddingHorizontal: 24,
  },
  eyebrow: { color: colors.accent, fontSize: 10, fontWeight: '800', letterSpacing: 2 },
  brandTitle: {
    color: colors.textPrimary,
    fontSize: 30,
    fontWeight: '900',
    letterSpacing: -0.8,
    marginTop: 3,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.9)',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    marginRight: 7,
    backgroundColor: colors.textSecondary,
  },
  connectedDot: { backgroundColor: colors.success },
  statusText: {
    color: colors.textSecondary,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  disconnectButton: {
    minHeight: 36,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    borderRadius: 18,
    backgroundColor: 'rgba(251, 113, 133, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(251, 113, 133, 0.28)',
  },
  disconnectText: { color: colors.danger, fontSize: 12, fontWeight: '700', marginLeft: 6 },
});
