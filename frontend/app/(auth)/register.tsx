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
  ScrollView,
  ImageBackground,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../src/store';
import { Colors } from '../../src/theme';

export default function RegisterScreen() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { register, isLoading } = useAuthStore();

  const handleRegister = async () => {
    if (!fullName || !email || !password || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }
    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }

    try {
      await register({
        fullName,
        email,
        password,
      });
      Alert.alert('Success', 'Account created!', [
        { text: 'OK', onPress: () => router.replace('/(tabs)') },
      ]);
    } catch (error: any) {
      Alert.alert('Registration Failed', error.message || 'Something went wrong');
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
          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={styles.content}>
              {/* Back Button */}
              <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                <Ionicons name="arrow-back" size={24} color={Colors.text.primary} />
              </TouchableOpacity>

              {/* Brand */}
              <View style={styles.brandContainer}>
                <Text style={styles.brandName}>Start a New Journey</Text>
                <Text style={styles.brandTagline}>
                  Gather your memories, map your experiences, and invite others to join your story.
                </Text>
              </View>

              {/* Form */}
              <View style={styles.form}>
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Full Name</Text>
                  <View style={styles.inputContainer}>
                    <TextInput
                      style={styles.input}
                      placeholder="Evelyn Harper"
                      placeholderTextColor={Colors.text.tertiary}
                      value={fullName}
                      onChangeText={setFullName}
                    />
                  </View>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Email</Text>
                  <View style={styles.inputContainer}>
                    <TextInput
                      style={styles.input}
                      placeholder="evelyn@memora.io"
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
                      placeholder="Create a strong password"
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

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Confirm Password</Text>
                  <View style={styles.inputContainer}>
                    <TextInput
                      style={styles.input}
                      placeholder="Confirm your password"
                      placeholderTextColor={Colors.text.tertiary}
                      value={confirmPassword}
                      onChangeText={setConfirmPassword}
                      secureTextEntry={!showPassword}
                    />
                  </View>
                </View>

                <TouchableOpacity
                  style={[styles.createButton, { backgroundColor: Colors.primary.main }]}
                  onPress={handleRegister}
                  disabled={isLoading}
                >
                  <Text style={styles.createButtonText}>
                    {isLoading ? 'Creating...' : 'Create Account'}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => router.push('/login')}>
                  <Text style={styles.signInText}>
                    Already have an account?{' '}
                    <Text style={[styles.signInLink, { color: Colors.primary.main }]}>
                      Sign In
                    </Text>
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
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
    paddingTop: 20,
    paddingBottom: 40,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.background.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border.light,
  },
  brandContainer: {
    marginTop: 20,
    marginBottom: 32,
  },
  brandName: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.text.primary,
    fontFamily: 'Georgia, serif',
  },
  brandTagline: {
    fontSize: 15,
    color: Colors.text.secondary,
    marginTop: 8,
    lineHeight: 22,
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
  createButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  createButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Inter, sans-serif',
  },
  signInText: {
    marginTop: 24,
    textAlign: 'center',
    fontSize: 15,
    color: Colors.text.secondary,
    fontFamily: 'Inter, sans-serif',
  },
  signInLink: { fontWeight: '600' },
});