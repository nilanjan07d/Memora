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
  ActivityIndicator,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { apiClient } from '../src/api/client';
import { Colors } from '../src/theme';

export default function ResetPasswordScreen() {
  const { token } = useLocalSearchParams<{ token?: string }>();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleResetPassword = async () => {
    if (!token) {
      Alert.alert(
        'Invalid Link',
        'This password reset link is invalid or incomplete.'
      );
      return;
    }

    if (!password || !confirmPassword) {
      Alert.alert('Error', 'Please fill in both password fields.');
      return;
    }

    if (password.length < 6) {
      Alert.alert(
        'Invalid Password',
        'Password must be at least 6 characters long.'
      );
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert(
        'Passwords Do Not Match',
        'Please make sure both passwords are the same.'
      );
      return;
    }

    try {
      setIsLoading(true);

      const response = await apiClient.post(
        `/auth/reset-password/${token}`,
        {
          password,
        }
      );

      Alert.alert(
        'Password Reset',
        response.message || 'Your password has been reset successfully.',
        [
          {
            text: 'Go to Login',
            onPress: () => router.replace('/(auth)/login'),
          },
        ]
      );
    } catch (error: any) {
      Alert.alert(
        'Reset Failed',
        error?.message || 'Unable to reset your password. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.content}>
        {/* Header */}
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons
            name="arrow-back"
            size={24}
            color={Colors.text.primary}
          />
        </TouchableOpacity>

        {/* Brand */}
        <View style={styles.brandContainer}>
          <View style={styles.logoCircle}>
            <Text style={styles.logoText}>M</Text>
          </View>

          <Text style={styles.brandName}>Memora</Text>
        </View>

        {/* Title */}
        <View style={styles.titleContainer}>
          <Text style={styles.title}>Reset Password</Text>

          <Text style={styles.subtitle}>
            Create a new password for your Memora account.
          </Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          {/* New Password */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>New Password</Text>

            <View style={styles.inputContainer}>
              <Ionicons
                name="lock-closed-outline"
                size={20}
                color={Colors.text.tertiary}
              />

              <TextInput
                style={styles.input}
                placeholder="Enter new password"
                placeholderTextColor={Colors.text.tertiary}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
              />

              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
              >
                <Ionicons
                  name={showPassword ? 'eye' : 'eye-off'}
                  size={20}
                  color={Colors.text.tertiary}
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Confirm Password */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Confirm Password</Text>

            <View style={styles.inputContainer}>
              <Ionicons
                name="lock-closed-outline"
                size={20}
                color={Colors.text.tertiary}
              />

              <TextInput
                style={styles.input}
                placeholder="Confirm new password"
                placeholderTextColor={Colors.text.tertiary}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!showConfirmPassword}
                autoCapitalize="none"
              />

              <TouchableOpacity
                onPress={() =>
                  setShowConfirmPassword(!showConfirmPassword)
                }
              >
                <Ionicons
                  name={showConfirmPassword ? 'eye' : 'eye-off'}
                  size={20}
                  color={Colors.text.tertiary}
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Reset Button */}
          <TouchableOpacity
            style={[
              styles.resetButton,
              {
                backgroundColor: Colors.primary.main,
                opacity: isLoading ? 0.7 : 1,
              },
            ]}
            onPress={handleResetPassword}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.resetButtonText}>
                Reset Password
              </Text>
            )}
          </TouchableOpacity>
        </View>

        <Text style={styles.expiryText}>
          Your reset link is valid for 15 minutes.
        </Text>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },

  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 55,
  },

  backButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f5f5f5',
    marginBottom: 35,
  },

  brandContainer: {
    alignItems: 'center',
    marginBottom: 35,
  },

  logoCircle: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: Colors.primary.main,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },

  logoText: {
    color: '#fff',
    fontSize: 28,
    fontWeight: '700',
  },

  brandName: {
    fontSize: 25,
    fontWeight: '700',
    color: Colors.text.primary,
  },

  titleContainer: {
    marginBottom: 28,
  },

  title: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.text.primary,
    marginBottom: 8,
  },

  subtitle: {
    fontSize: 15,
    lineHeight: 22,
    color: Colors.text.secondary,
  },

  form: {
    gap: 20,
  },

  inputGroup: {
    gap: 8,
  },

  label: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text.primary,
  },

  inputContainer: {
    height: 54,
    borderWidth: 1,
    borderColor: Colors.border.light,
    borderRadius: 12,
    paddingHorizontal: 15,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
  },

  input: {
    flex: 1,
    marginLeft: 10,
    fontSize: 15,
    color: Colors.text.primary,
  },

  resetButton: {
    height: 54,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 5,
  },

  resetButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },

  expiryText: {
    textAlign: 'center',
    marginTop: 25,
    fontSize: 13,
    color: Colors.text.tertiary,
  },
});