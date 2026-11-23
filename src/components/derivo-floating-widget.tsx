import { useState } from 'react';
import {
  Animated,
  ImageBackground,
  PanResponder,
  Pressable,
  Platform,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { DerivoIcon } from '@/components/derivo-icon';
import { colors } from '@/constants/derivo-theme';
import { useDerivSession } from '@/hooks/use-deriv-session';

export function DerivoFloatingWidget() {
  const { isConnected, isRunning, toggleBot } = useDerivSession();
  const [position] = useState(() => new Animated.ValueXY());
  const [panResponder] = useState(() =>
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gesture) =>
        Math.abs(gesture.dx) > 3 || Math.abs(gesture.dy) > 3,
      onPanResponderGrant: () => position.extractOffset(),
      onPanResponderMove: Animated.event([null, { dx: position.x, dy: position.y }], {
        useNativeDriver: false,
      }),
      onPanResponderRelease: () => position.flattenOffset(),
    }),
  );

  if (Platform.OS === 'android' || !isConnected || !isRunning) return null;

  return (
    <Animated.View
      {...panResponder.panHandlers}
      style={[styles.container, { transform: position.getTranslateTransform() }]}>
      <ImageBackground
        imageStyle={styles.backgroundImage}
        source={require('@/assets/images/deriv.png')}
        style={styles.background}>
        <View style={styles.overlay}>
          <View style={styles.statusContent}>
            <Text style={styles.title}>Derivo</Text>
            <View style={styles.statusRow}>
              <View style={styles.statusDot} />
              <Text style={styles.statusText}>Demo bot running</Text>
            </View>
          </View>
          <Pressable
            accessibilityLabel="Pause demo bot"
            accessibilityRole="button"
            onPress={() => void toggleBot()}
            style={styles.button}>
            <DerivoIcon name="pause" size={20} color="#FFFFFF" />
          </Pressable>
        </View>
      </ImageBackground>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: { position: 'absolute', bottom: 120, right: 20, width: 200, height: 100, zIndex: 99999, elevation: 50 },
  background: { width: '100%', height: '100%' },
  backgroundImage: { borderRadius: 16, opacity: 0.32 },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(10, 14, 26, 0.75)',
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.4)',
  },
  statusContent: { flex: 1 },
  title: { color: '#D4AF37', fontSize: 16, fontWeight: '900', marginBottom: 6 },
  statusRow: { flexDirection: 'row', alignItems: 'center' },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.success,
    marginRight: 6,
  },
  statusText: { color: colors.textPrimary, fontSize: 12, fontWeight: '600' },
  button: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: colors.danger,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
