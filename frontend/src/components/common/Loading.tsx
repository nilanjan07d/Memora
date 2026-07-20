import React from 'react';
import { View, ActivityIndicator, Text, StyleSheet } from 'react-native';

interface LoadingProps {
  size?: 'small' | 'large';
  fullScreen?: boolean;
  message?: string;
}

export const Loading: React.FC<LoadingProps> = ({
  size = 'large',
  fullScreen = false,
  message,
}) => {
  const content = (
    <View style={[styles.container, fullScreen && styles.fullScreen]}>
      <ActivityIndicator size={size} color="#6C5CE7" />
      {message && <Text style={styles.message}>{message}</Text>}
    </View>
  );

  if (fullScreen) {
    return content;
  }

  return content;
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fullScreen: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.9)',
  },
  message: {
    marginTop: 12,
    fontSize: 14,
    color: '#636E72',
  },
});