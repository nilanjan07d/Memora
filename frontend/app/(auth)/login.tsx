import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ImageBackground,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../src/store';
import { Colors } from '../../src/theme';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { login, isLoading } = useAuthStore();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }
    try {
      await login({ email, password });
      router.replace('/(tabs)');
    } catch (error: any) {
      Alert.alert('Login Failed', error.message || 'Invalid credentials');
    }
  };

  return (
    <ImageBackground
      source={{ uri: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800' }}
      style={styles.container}
      blurRadius={2}
    >
      <View style={styles.overlay}>
        <KeyboardAvoidingView
          style={styles.keyboardView}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <View style={styles.content}>
            {/* Brand */}
            <View style={styles.brandContainer}>
              <View style={styles.logoCircle}>
                <Text style={styles.logoEmoji}>📖</Text>
              </View>
              <Text style={styles.brandName}>Memora</Text>
              <Text style={styles.brandTagline}>Where Memories Become Chapters</Text>
            </View>

            {/* Form */}
            <View style={styles.form}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Email</Text>
                <View style={styles.inputContainer}>
                  <TextInput
                    style={styles.input}
                    placeholder="hello@memora.com"
                    placeholderTextColor={Colors.text.tertiary}
                    value={email}
                    onChangeText={setEmail}
                    autoCapitalize="none"
                    keyboardType="email-address"
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Password</Text>
                <View style={styles.inputContainer}>
                  <TextInput
                    style={styles.input}
                    placeholder="Enter your password"
                    placeholderTextColor={Colors.text.tertiary}
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPassword}
                  />
                  <TouchableOpacity
                    onPress={() => setShowPassword(!showPassword)}
                    style={styles.eyeIcon}
                  >
                    <Ionicons
                      name={showPassword ? 'eye' : 'eye-off'}
                      size={20}
                      color={Colors.text.tertiary}
                    />
                  </TouchableOpacity>
                </View>
              </View>

              <TouchableOpacity style={styles.forgotButton}>
                <Text style={styles.forgotText}>Forgot?</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.signInButton, { backgroundColor: Colors.primary.main }]}
                onPress={handleLogin}
                disabled={isLoading}
              >
                <Text style={styles.signInText}>
                  {isLoading ? 'Loading...' : 'Sign In'}
                </Text>
              </TouchableOpacity>

              <View style={styles.divider}>
                <View style={[styles.dividerLine, { backgroundColor: Colors.border.light }]} />
                <Text style={[styles.dividerText, { color: Colors.text.tertiary }]}>OR</Text>
                <View style={[styles.dividerLine, { backgroundColor: Colors.border.light }]} />
              </View>

              <TouchableOpacity style={styles.googleButton}>
                <Ionicons name="logo-google" size={20} color={Colors.primary.main} />
                <Text style={[styles.googleText, { color: Colors.text.secondary }]}>
                  Sign in with Google
                </Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={() => router.push('/register')}>
                <Text style={styles.signUpText}>
                  New here? <Text style={[styles.signUpLink, { color: Colors.primary.main }]}>
                    Create Account
                  </Text>
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(251, 249, 246, 0.92)',
  },
  keyboardView: { flex: 1 },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 40,
  },
  brandContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.background.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.primary.main,
    marginBottom: 16,
  },
  logoEmoji: { fontSize: 36 },
  brandName: {
    fontSize: 32,
    fontWeight: '700',
    color: Colors.text.primary,
    fontFamily: 'Georgia, serif',
    letterSpacing: 1,
  },
  brandTagline: {
    fontSize: 14,
    color: Colors.text.secondary,
    marginTop: 4,
    fontFamily: 'Inter, sans-serif',
  },
  form: { flex: 1 },
  inputGroup: { marginBottom: 16 },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.text.secondary,
    marginBottom: 6,
    fontFamily: 'Inter, sans-serif',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background.secondary,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border.light,
    paddingHorizontal: 16,
  },
  input: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 16,
    color: Colors.text.primary,
    fontFamily: 'Inter, sans-serif',
  },
  eyeIcon: { padding: 8 },
  forgotButton: { alignSelf: 'flex-end', marginBottom: 20 },
  forgotText: {
    fontSize: 14,
    color: Colors.primary.main,
    fontFamily: 'Inter, sans-serif',
  },
  signInButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  signInText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Inter, sans-serif',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  dividerLine: { flex: 1, height: 1 },
  dividerText: {
    marginHorizontal: 16,
    fontSize: 12,
    fontFamily: 'Inter, sans-serif',
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.background.secondary,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border.light,
    gap: 10,
  },
  googleText: {
    fontSize: 16,
    fontWeight: '500',
    fontFamily: 'Inter, sans-serif',
  },
  signUpText: {
    marginTop: 24,
    textAlign: 'center',
    fontSize: 15,
    color: Colors.text.secondary,
    fontFamily: 'Inter, sans-serif',
  },
  signUpLink: { fontWeight: '600' },
});