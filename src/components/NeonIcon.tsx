import React, { useEffect } from "react";
import { StyleSheet, ViewStyle, StyleProp } from "react-native";
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withTiming, withSequence, Easing } from "react-native-reanimated";
import { LucideIcon } from "lucide-react-native";

interface NeonIconProps {
  Icon: LucideIcon;
  size?: number;
  color?: string;
  glow?: boolean;
  animate?: boolean;
  style?: StyleProp<ViewStyle>;
}

export function NeonIcon({ Icon, size = 24, color = "#00E676", glow = true, animate = false, style }: NeonIconProps) {
  const scale = useSharedValue(1);
  const rotate = useSharedValue(0);

  useEffect(() => {
    if (animate) {
      scale.value = withRepeat(
        withSequence(
          withTiming(1.1, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
          withTiming(1, { duration: 1000, easing: Easing.inOut(Easing.ease) })
        ),
        -1, // infinite
        true // reverse maybe not needed if sequence wraps, but true handles smooth return
      );
      
      rotate.value = withRepeat(
        withSequence(
          withTiming(5, { duration: 500, easing: Easing.inOut(Easing.ease) }),
          withTiming(-5, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
          withTiming(0, { duration: 500, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        false
      );
    } else {
      scale.value = 1;
      rotate.value = 0;
    }
  }, [animate]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { scale: scale.value },
        { rotate: `${rotate.value}deg` }
      ]
    };
  });

  return (
    <Animated.View style={[
      styles.container, 
      animatedStyle, 
      glow && {
        shadowColor: color,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.8,
        shadowRadius: 8,
        elevation: 8,
      },
      style
    ]}>
      <Icon size={size} color={color} strokeWidth={2.5} />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  }
});
