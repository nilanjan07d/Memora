import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface AvatarProps {
  size?: number;
  source?: string;
  name?: string;
  fallback?: boolean;
}

export const Avatar: React.FC<AvatarProps> = ({
  size = 40,
  source,
  name,
  fallback = true,
}) => {
  const initials = name
    ? name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : '?';

  if (source) {
    return (
      <Image
        source={{ uri: source }}
        style={[styles.avatar, { width: size, height: size, borderRadius: size / 2 }]}
      />
    );
  }

  if (fallback) {
    return (
      <View
        style={[
          styles.fallback,
          { width: size, height: size, borderRadius: size / 2 },
        ]}
      >
        <Text style={[styles.initials, { fontSize: size * 0.4 }]}>
          {initials}
        </Text>
      </View>
    );
  }

  return (
    <View
      style={[
        styles.placeholder,
        { width: size, height: size, borderRadius: size / 2 },
      ]}
    >
      <Ionicons name="person-outline" size={size * 0.5} color="#B2BEC3" />
    </View>
  );
};

const styles = StyleSheet.create({
  avatar: {
    backgroundColor: '#F8F9FA',
  },
  fallback: {
    backgroundColor: '#6C5CE7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholder: {
    backgroundColor: '#F8F9FA',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#DFE6E9',
  },
  initials: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
});