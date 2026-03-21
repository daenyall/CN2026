import React, { useEffect } from "react";
import { Modal, View, Text, StyleSheet, TouchableOpacity, TouchableWithoutFeedback } from "react-native";
import Animated, { useSharedValue, useAnimatedStyle, withTiming, withRepeat, withSequence, Easing } from "react-native-reanimated";
import { Zap, X } from "lucide-react-native";
import { NeonCard } from "./NeonCard";
import { useNavigation, NavigationProp } from "@react-navigation/native";
import Svg, { Defs, LinearGradient, Stop, Rect } from "react-native-svg";

interface AnomalyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm?: () => void;
  studentName?: string;
  improvement?: number;
  previousValue?: string;
  currentValue?: string;
}

export function AnomalyModal({
  isOpen,
  onClose,
  onConfirm,
  studentName = "Jakub Kowalski",
  improvement = 24,
  previousValue = "13.8s",
  currentValue = "13.2s",
}: AnomalyModalProps) {
  const navigation = useNavigation<NavigationProp<any>>();
  
  const scale = useSharedValue(0.8);
  const translateY = useSharedValue(50);
  const opacity = useSharedValue(0);
  
  const iconScale = useSharedValue(1);
  const iconRotate = useSharedValue(0);

  useEffect(() => {
    if (isOpen) {
      scale.value = withTiming(1, { duration: 500, easing: Easing.out(Easing.exp) });
      translateY.value = withTiming(0, { duration: 500, easing: Easing.out(Easing.exp) });
      opacity.value = withTiming(1, { duration: 300 });
      
      iconScale.value = withRepeat(
        withSequence(
          withTiming(1.2, { duration: 1000 }),
          withTiming(1, { duration: 1000 })
        ),
        -1,
        false
      );
      iconRotate.value = withRepeat(
        withSequence(
          withTiming(10, { duration: 500 }),
          withTiming(-10, { duration: 1000 }),
          withTiming(0, { duration: 500 })
        ),
        -1,
        false
      );
    } else {
      scale.value = withTiming(0.8, { duration: 300 });
      translateY.value = withTiming(50, { duration: 300 });
      opacity.value = withTiming(0, { duration: 300 });
    }
  }, [isOpen]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
      transform: [
        { scale: scale.value },
        { translateY: translateY.value }
      ]
    };
  });
  
  const iconAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { scale: iconScale.value },
        { rotate: `${iconRotate.value}deg` }
      ]
    };
  });

  const handleViewProfile = () => {
    onClose();
    if (onConfirm) {
      onConfirm();
    }
    navigation.navigate("ProfileScreen");
  };

  return (
    <Modal
      visible={isOpen}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.backdrop}>
          <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
            <Animated.View style={[styles.modalContainer, animatedStyle]}>
              <View style={styles.cardContent}>
                <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
                  <X size={16} color="#8899AA" />
                </TouchableOpacity>

                <View style={styles.iconWrapper}>
                  <View style={styles.iconBackground}>
                    <Svg height="100%" width="100%" style={StyleSheet.absoluteFillObject}>
                      <Defs>
                        <LinearGradient id="grad" x1="0" y1="0" x2="1" y2="1">
                          <Stop offset="0" stopColor="#FF1744" />
                          <Stop offset="1" stopColor="#FF6D00" />
                        </LinearGradient>
                      </Defs>
                      <Rect width="100%" height="100%" fill="url(#grad)" rx="40" />
                    </Svg>
                    <Animated.View style={iconAnimatedStyle}>
                      <Zap size={40} color="#FFD700" fill="#FFD700" />
                    </Animated.View>
                  </View>
                </View>

                <Text style={styles.title}>🚨 WYKRYTO TALENT!</Text>
                
                <Text style={styles.subtitle}>
                  Wynik o {improvement}% lepszy od poprzedniego pomiaru
                </Text>

                <View style={styles.comparisonGrid}>
                  <NeonCard style={styles.comparisonCard}>
                    <Text style={styles.comparisonLabel}>Poprzednio</Text>
                    <Text style={styles.comparisonValue}>{previousValue}</Text>
                  </NeonCard>

                  <NeonCard glow={true} style={styles.comparisonCard}>
                    <Text style={styles.comparisonLabel}>Teraz</Text>
                    <Text style={styles.comparisonValueGreen}>{currentValue}</Text>
                  </NeonCard>
                </View>

                <View style={styles.studentInfo}>
                  <Text style={styles.studentLabel}>Uczeń</Text>
                  <Text style={styles.studentName}>{studentName}</Text>
                </View>

                <View style={styles.actions}>
                  <TouchableOpacity style={styles.primaryBtn} onPress={handleViewProfile}>
                    <Svg height="100%" width="100%" style={StyleSheet.absoluteFillObject}>
                      <Defs>
                        <LinearGradient id="btnGrad" x1="0" y1="0" x2="1" y2="0">
                          <Stop offset="0" stopColor="#00E676" />
                          <Stop offset="1" stopColor="#00A854" />
                        </LinearGradient>
                      </Defs>
                      <Rect width="100%" height="100%" fill="url(#btnGrad)" rx="24" />
                    </Svg>
                    <Text style={styles.primaryBtnText}>Zobacz pełny profil</Text>
                  </TouchableOpacity>

                  <TouchableOpacity style={styles.secondaryBtn} onPress={onClose}>
                    <Text style={styles.secondaryBtnText}>Zamknij</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </Animated.View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalContainer: {
    width: '100%',
    maxWidth: 384,
  },
  cardContent: {
    borderRadius: 16,
    backgroundColor: '#1E2A3A',
    padding: 24,
    borderColor: '#FF1744',
    borderWidth: 3,
    shadowColor: '#FF1744',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 40,
    elevation: 20,
  },
  closeBtn: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#0A0E1A',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  iconWrapper: {
    alignItems: 'center',
    marginBottom: 16,
  },
  iconBackground: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    shadowColor: '#FF1744',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 30,
    elevation: 10,
  },
  title: {
    color: '#FF1744',
    fontSize: 24,
    fontWeight: '900',
    textAlign: 'center',
    marginBottom: 8,
    textShadowColor: 'rgba(255, 23, 68, 0.5)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 20,
  },
  subtitle: {
    color: '#FFFFFF',
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 24,
  },
  comparisonGrid: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 24,
  },
  comparisonCard: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  comparisonLabel: {
    color: '#8899AA',
    fontSize: 12,
    marginBottom: 8,
  },
  comparisonValue: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '700',
  },
  comparisonValueGreen: {
    color: '#00E676',
    fontSize: 20,
    fontWeight: '700',
  },
  studentInfo: {
    alignItems: 'center',
    marginBottom: 24,
  },
  studentLabel: {
    color: '#8899AA',
    fontSize: 12,
    marginBottom: 4,
  },
  studentName: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  actions: {
    gap: 12,
  },
  primaryBtn: {
    width: '100%',
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  primaryBtnText: {
    color: '#0A0E1A',
    fontWeight: '700',
    zIndex: 2,
  },
  secondaryBtn: {
    width: '100%',
    height: 48,
    borderRadius: 24,
    backgroundColor: '#0A0E1A',
    borderColor: 'rgba(136, 153, 170, 0.3)',
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryBtnText: {
    color: '#8899AA',
    fontWeight: '600',
  }
});
