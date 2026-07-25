import { useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  Image,
  Animated,
} from "react-native";
import { router } from "expo-router";

export default function SplashScreen() {
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const loadingAnim = useRef(new Animated.Value(0)).current;

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
      Animated.timing(loadingAnim, {
        toValue: 1,
        duration: 3000,
        useNativeDriver: false,
      }),
    ]).start();

    // Navigate after splash
    const timer = setTimeout(() => {
      // TODO: Replace with auth check
      router.replace("/(auth)/login");
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <ImageBackground
      source={{
        uri: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800",
      }}
      style={styles.container}
      blurRadius={2}
    >
      <View style={styles.overlay}>
        <Animated.View
          style={[
            styles.content,
            {
              opacity: fadeAnim,
              transform: [
                { scale: scaleAnim },
                { translateY: slideAnim },
              ],
            },
          ]}
        >
          {/* Logo */}
          <View style={styles.logoWrapper}>
            <View style={styles.glowRing} />

            <View style={styles.logoContainer}>
              <Image
                source={require("../../assets/icon.png")}
                style={styles.logo}
              />
            </View>
          </View>

          {/* App Name */}
          <Text style={styles.title}>Memora</Text>

          {/* Divider */}
          <View style={styles.dividerContainer}>
            <View style={styles.dividerLine} />
            <View style={styles.dividerDot} />
            <View style={styles.dividerLine} />
          </View>

          {/* Subtitle */}
          <Text style={styles.subtitle}>
            Where Memories Become Chapters
          </Text>

          {/* Bottom */}
          <View style={styles.bottomSection}>
            <View style={styles.loadingContainer}>
              <Animated.View
                style={[
                  styles.loadingBar,
                  {
                    width: loadingAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: ["0%", "100%"],
                    }),
                  },
                ]}
              />
            </View>

            <Text style={styles.tagline}>
              ✨ Every memory tells a story
            </Text>

            <View style={styles.dotsContainer}>
              <View style={styles.dot} />
              <View style={[styles.dot, { opacity: 0.5 }]} />
              <View style={styles.dot} />
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
    backgroundColor: "rgba(203,90,50,0.35)",
    justifyContent: "center",
    alignItems: "center",
  },

  content: {
    width: "100%",
    alignItems: "center",
    paddingHorizontal: 30,
  },

  // Logo
  logoWrapper: {
    position: "relative",
    marginBottom: 24,
  },

  glowRing: {
    position: "absolute",
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: "rgba(255,255,255,0.08)",
    top: -40,
    left: -40,
  },

  logoContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "rgba(255,255,255,0.15)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.4)",
  },

  logo: {
    width: 70,
    height: 70,
    resizeMode: "contain",
  },

  // Title
  title: {
    fontSize: 44,
    fontWeight: "700",
    color: "#FFFFFF",
    letterSpacing: 1.5,
    marginBottom: 12,
    textShadowColor: "rgba(0,0,0,0.2)",
    textShadowOffset: {
      width: 0,
      height: 2,
    },
    textShadowRadius: 4,
  },

  // Divider
  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    width: 120,
    marginBottom: 16,
  },

  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#FFFFFF",
    opacity: 0.6,
  },

  dividerDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#FFFFFF",
    marginHorizontal: 8,
  },

  // Subtitle
  subtitle: {
    fontSize: 16,
    color: "rgba(255,255,255,0.9)",
    letterSpacing: 0.5,
    marginBottom: 40,
    textAlign: "center",
  },

  // Bottom
  bottomSection: {
    alignItems: "center",
    marginTop: 20,
  },

  loadingContainer: {
    width: 160,
    height: 4,
    backgroundColor: "rgba(255,255,255,0.25)",
    borderRadius: 10,
    overflow: "hidden",
    marginBottom: 20,
  },

  loadingBar: {
    height: "100%",
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
  },

  tagline: {
    fontSize: 14,
    color: "rgba(255,255,255,0.75)",
    fontStyle: "italic",
    marginBottom: 18,
  },

  dotsContainer: {
    flexDirection: "row",
  },

  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#FFFFFF",
    marginHorizontal: 4,
    opacity: 0.8,
  },
});