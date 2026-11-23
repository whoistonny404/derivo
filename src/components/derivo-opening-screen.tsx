import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useState } from 'react';
import { Animated, Platform, StyleSheet, View } from 'react-native';
import { colors } from '@/constants/derivo-theme';

const useNativeDriver = Platform.OS !== 'web';

type Props = {
  onFinish: () => void;
};

export function DerivoOpeningScreen({ onFinish }: Props) {
  const [screenOpacity] = useState(() => new Animated.Value(1));
  const [logoOpacity] = useState(() => new Animated.Value(0));
  const [logoScale] = useState(() => new Animated.Value(0.78));
  const [glowScale] = useState(() => new Animated.Value(0.92));
  const [glowOpacity] = useState(() => new Animated.Value(0.35));
  const [titleOpacity] = useState(() => new Animated.Value(0));
  const [titleOffset] = useState(() => new Animated.Value(14));
  const [subtitleOpacity] = useState(() => new Animated.Value(0));

  useEffect(() => {
    const glowAnimation = Animated.loop(
      Animated.parallel([
        Animated.sequence([
          Animated.timing(glowScale, {
            toValue: 1.08,
            duration: 1100,
            useNativeDriver,
          }),
          Animated.timing(glowScale, {
            toValue: 0.92,
            duration: 1100,
            useNativeDriver,
          }),
        ]),
        Animated.sequence([
          Animated.timing(glowOpacity, {
            toValue: 0.72,
            duration: 1100,
            useNativeDriver,
          }),
          Animated.timing(glowOpacity, {
            toValue: 0.35,
            duration: 1100,
            useNativeDriver,
          }),
        ]),
      ]),
    );

    const introAnimation = Animated.sequence([
      Animated.parallel([
        Animated.timing(logoOpacity, {
          toValue: 1,
          duration: 520,
          useNativeDriver,
        }),
        Animated.spring(logoScale, {
          toValue: 1,
          damping: 12,
          stiffness: 110,
          useNativeDriver,
        }),
      ]),
      Animated.delay(140),
      Animated.parallel([
        Animated.timing(titleOpacity, {
          toValue: 1,
          duration: 420,
          useNativeDriver,
        }),
        Animated.spring(titleOffset, {
          toValue: 0,
          damping: 16,
          stiffness: 130,
          useNativeDriver,
        }),
      ]),
      Animated.timing(subtitleOpacity, {
        toValue: 1,
        duration: 380,
        useNativeDriver,
      }),
      Animated.delay(1400),
      Animated.timing(screenOpacity, {
        toValue: 0,
        duration: 500,
        useNativeDriver,
      }),
    ]);

    glowAnimation.start();
    introAnimation.start(({ finished }) => {
      if (finished) onFinish();
    });

    return () => {
      glowAnimation.stop();
      introAnimation.stop();
    };
  }, [
    glowOpacity,
    glowScale,
    logoOpacity,
    logoScale,
    onFinish,
    screenOpacity,
    subtitleOpacity,
    titleOffset,
    titleOpacity,
  ]);

  return (
    <Animated.View style={[styles.container, { opacity: screenOpacity }]}>
      <LinearGradient
        colors={['#080C16', '#171522', '#080C16']}
        style={StyleSheet.absoluteFill}
      />
      <View style={styles.brand}>
        <View style={styles.logoStage}>
          <Animated.View
            pointerEvents="none"
            style={[
              styles.glow,
              { opacity: glowOpacity, transform: [{ scale: glowScale }] },
            ]}
          />
          <Animated.View
            style={[
              styles.logoContainer,
              { opacity: logoOpacity, transform: [{ scale: logoScale }] },
            ]}>
            <Image
              accessibilityLabel="Derivo logo"
              contentFit="contain"
              source={require('@/assets/images/deriv.png')}
              style={styles.logo}
            />
          </Animated.View>
        </View>
        <View style={styles.textContainer}>
          <Animated.Text
            style={[
              styles.title,
              { opacity: titleOpacity, transform: [{ translateY: titleOffset }] },
            ]}>
            Derivo
          </Animated.Text>
          <Animated.Text style={[styles.subtitle, { opacity: subtitleOpacity }]}>
            AUTOMATED TRADING
          </Animated.Text>
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFill,
    zIndex: 10,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brand: { alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24 },
  logoStage: {
    width: 194,
    height: 194,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 28,
  },
  glow: {
    position: 'absolute',
    width: 176,
    height: 176,
    borderRadius: 88,
    backgroundColor: colors.accent,
  },
  logoContainer: {
    width: 154,
    height: 154,
    borderRadius: 77,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.borderHighlight,
    shadowColor: colors.accent,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 24,
    elevation: 12,
    overflow: 'hidden',
  },
  logo: { width: 154, height: 154 },
  textContainer: { alignItems: 'center', minHeight: 62 },
  title: {
    color: colors.textPrimary,
    fontSize: 30,
    fontWeight: '800',
    letterSpacing: 0.8,
    marginBottom: 10,
  },
  subtitle: {
    color: colors.accent,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 3.2,
  },
});
