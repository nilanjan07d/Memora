import { useEffect } from 'react';
import { View, Text, StyleSheet, ImageBackground, Dimensions, Animated } from 'react-native';
import { router } from 'expo-router';
import { Colors } from '../../src/theme';

const { width, height } = Dimensions.get('window');

export default function SplashScreen() {
  // Animation values
  const fadeAnim = new Animated.Value(0);
  const scaleAnim = new Animated.Value(0.8);
  const slideAnim = new Animated.Value(30);

  useEffect(() => {
    // Entrance animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();

    // Auto navigate
    const timer = setTimeout(() => {
      router.replace('/login');
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <ImageBackground
      source={{ uri: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800' }}
      style={styles.container}
      blurRadius={1}
    >
      {/* Light overlay - background visible but subtle */}
      <View style={styles.overlay}>
        <Animated.View
          style={[
            styles.content,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }, { translateY: slideAnim }],
            },
          ]}
        >
          {/* Logo Container with warm glow */}
          <View style={styles.logoWrapper}>
            <View style={styles.glowRing} />
            <View style={styles.logoContainer}>
              <Text style={styles.logoEmoji}>📖</Text>
            </View>
          </View>

          {/* App Name - White */}
          <Text style={styles.title}>
            Memora
          </Text>

          {/* Decorative divider - White */}
          <View style={styles.dividerContainer}>
            <View style={[styles.dividerLine, { backgroundColor: '#FFFFFF' }]} />
            <View style={[styles.dividerDot, { backgroundColor: '#FFFFFF' }]} />
            <View style={[styles.dividerLine, { backgroundColor: '#FFFFFF' }]} />
          </View>

          {/* Tagline - White with opacity */}
          <Text style={styles.subtitle}>
            Where Memories Become Chapters
          </Text>

          {/* Bottom Section */}
          <View style={styles.bottomSection}>
            {/* Loading bar - White */}
            <View style={styles.loadingContainer}>
              <View style={[styles.loadingBar, { backgroundColor: '#FFFFFF' }]} />
            </View>

            {/* Tagline - White with opacity */}
            <Text style={styles.tagline}>
              ✨ Every memory tells a story
            </Text>

            {/* Decorative dots - White */}
            <View style={styles.dotsContainer}>
              <View style={[styles.dot, { backgroundColor: '#FFFFFF' }]} />
              <View style={[styles.dot, { backgroundColor: 'rgba(255,255,255,0.6)' }]} />
              <View style={[styles.dot, { backgroundColor: '#FFFFFF' }]} />
            </View>
          </View>
        </Animated.View>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(203, 90, 50, 0.35)', // Warm orange tint - LIGHT
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
    paddingHorizontal: 30,
    width: '100%',
  },

  // Logo
  logoWrapper: {
    position: 'relative',
    marginBottom: 24,
  },
  glowRing: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    top: -40,
    left: -40,
  },
  logoContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.4)',
    backdropFilter: 'blur(10px)',
  },
  logoEmoji: {
    fontSize: 48,
  },

  // Title - WHITE
  title: {
    fontSize: 44,
    fontWeight: '700',
    color: '#FFFFFF',
    fontFamily: 'Georgia, serif',
    letterSpacing: 1.5,
    marginBottom: 12,
    textShadowColor: 'rgba(0,0,0,0.1)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },

  // Divider - WHITE
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    width: 120,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    opacity: 0.6,
  },
  dividerDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginHorizontal: 8,
  },

  // Subtitle - WHITE with opacity
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.85)',
    fontFamily: 'Inter, sans-serif',
    letterSpacing: 0.5,
    marginBottom: 40,
    textShadowColor: 'rgba(0,0,0,0.05)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },

  // Bottom Section
  bottomSection: {
    alignItems: 'center',
    marginTop: 20,
  },

  // Loading - WHITE
  loadingContainer: {
    width: 140,
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 20,
  },
  loadingBar: {
    width: '100%',
    height: '100%',
    borderRadius: 2,
  },

  // Tagline - WHITE with opacity
  tagline: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    fontFamily: 'Inter, sans-serif',
    fontStyle: 'italic',
    marginBottom: 16,
  },

  // Dots - WHITE
  dotsContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    opacity: 0.6,
  },
}); 