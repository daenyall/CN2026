import React, { ReactNode, useEffect } from "react";
import { StyleSheet, TouchableOpacity, ViewStyle, StyleProp } from "react-native";
import Animated, { useSharedValue, useAnimatedStyle, withTiming, withSpring } from "react-native-reanimated";

interface NeonCardProps {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  glow?: boolean;
  onClick?: () => void;
}

const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);

export function NeonCard({ children, style, glow = false, onClick }: NeonCardProps) {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(20);
  const scale = useSharedValue(1);

  useEffect(() => {
    opacity.value = withTiming(1, { duration: 400 });
    translateY.value = withTiming(0, { duration: 400 });
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
      transform: [
        { translateY: translateY.value },
        { scale: scale.value }
      ]
    };
  });

  const handlePressIn = () => {
    if (onClick) {
      scale.value = withSpring(0.98);
    }
  };

  const handlePressOut = () => {
    if (onClick) {
      scale.value = withSpring(1);
    }
  };

  const Container = onClick ? AnimatedTouchableOpacity : Animated.View;
  const containerProps = onClick ? {
    onPress: onClick,
    onPressIn: handlePressIn,
    onPressOut: handlePressOut,
    activeOpacity: 1
  } : {};

  return (
    <Container
      style={[
        styles.card,
        glow && styles.glow,
        style,
        animatedStyle
      ]}
      {...containerProps as any}
    >
      {children}
    </Container>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    backgroundColor: '#1E2A3A',
    padding: 16,
  },
  glow: {
    shadowColor: '#00E676',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  }
});
