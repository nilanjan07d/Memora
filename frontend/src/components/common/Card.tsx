import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  variant?: 'elevated' | 'outlined' | 'flat';
  padding?: number;
}

export const Card: React.FC<CardProps> = ({
  children,
  style,
  variant = 'elevated',
  padding = 16,
}) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'elevated':
        return {
          backgroundColor: '#FFFFFF',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.05,
          shadowRadius: 8,
          elevation: 3,
        };
      case 'outlined':
        return {
          backgroundColor: '#FFFFFF',
          borderWidth: 1,
          borderColor: '#DFE6E9',
        };
      case 'flat':
        return {
          backgroundColor: '#F8F9FA',
        };
      default:
        return {};
    }
  };

  return (
    <View
      style={[
        styles.card,
        getVariantStyles(),
        { padding },
        style,
      ]}
    >
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    overflow: 'hidden',
  },
});