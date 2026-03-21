import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Animated,
  Pressable,
} from 'react-native';
import { Zap, X } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { NeonCard } from './NeonCard';
import { Colors, Spacing, BorderRadius, FontSize } from '../../styles/theme';
import type { RootStackParamList } from '../routes';

interface AnomalyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm?: () => void;
  onViewProfile?: () => void;
  studentName?: string;
  exerciseName?: string;
  improvement?: number;
  previousValue?: string;
  currentValue?: string;
}

export function AnomalyModal({
  isOpen,
  onClose,
  onConfirm,
  onViewProfile,
  studentName = 'Jakub Kowalski',
  exerciseName = '',
  improvement = 24,
  previousValue = '13.8s',
  currentValue = '13.2s',
}: AnomalyModalProps) {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (isOpen) {
      Animated.parallel([
        Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true }),
        Animated.timing(opacityAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
      ]).start();

      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.2, duration: 500, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
        ])
      ).start();
    } else {
      scaleAnim.setValue(0.8);
      opacityAnim.setValue(0);
    }
  }, [isOpen]);

  const handleViewProfile = () => {
    if (onViewProfile) {
      onViewProfile();
    } else {
      onClose();
      if (onConfirm) {
        onConfirm();
      }
      navigation.navigate('StudentTabs', { screen: 'StudentProfile' });
    }
  };

  return (
    <Modal visible={isOpen} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Animated.View
          style={[
            styles.modalContainer,
            { opacity: opacityAnim, transform: [{ scale: scaleAnim }] },
          ]}
        >
          <Pressable style={styles.modalCard} onPress={(e) => e.stopPropagation()}>
            {/* Close Button */}
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <X size={16} color={Colors.gray} />
            </TouchableOpacity>

            {/* Pulsing Icon */}
            <View style={styles.iconContainer}>
              <Animated.View
                style={[
                  styles.iconCircle,
                  { transform: [{ scale: pulseAnim }] },
                ]}
              >
                <Zap size={40} color={Colors.gold} fill={Colors.gold} />
              </Animated.View>
            </View>

            {/* Title */}
            <Text style={styles.title}>🚨 WYKRYTO TALENT!</Text>

            {/* Subtitle */}
            <Text style={styles.subtitle}>
              Wynik o {improvement}% lepszy od poprzedniego pomiaru
            </Text>

            {/* Comparison */}
            <View style={styles.comparisonGrid}>
              <View style={styles.comparisonItem}>
                <NeonCard>
                  <View style={styles.comparisonContent}>
                    <Text style={styles.comparisonLabel}>Poprzednio</Text>
                    <Text style={styles.comparisonValueWhite}>{previousValue}</Text>
                  </View>
                </NeonCard>
              </View>
              <View style={styles.comparisonItem}>
                <NeonCard glow>
                  <View style={styles.comparisonContent}>
                    <Text style={styles.comparisonLabel}>Teraz</Text>
                    <Text style={styles.comparisonValueGreen}>{currentValue}</Text>
                  </View>
                </NeonCard>
              </View>
            </View>

            {/* Student Name */}
            <View style={styles.studentNameContainer}>
              <Text style={styles.studentLabel}>Uczeń</Text>
              <Text style={styles.studentName}>{studentName}</Text>
            </View>

            {/* Action Buttons */}
            <TouchableOpacity style={styles.primaryButton} onPress={handleViewProfile}>
              <Text style={styles.primaryButtonText}>Zobacz pełny profil</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.secondaryButton} onPress={onClose}>
              <Text style={styles.secondaryButtonText}>Zamknij</Text>
            </TouchableOpacity>
          </Pressable>
        </Animated.View>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },
  modalContainer: {
    width: '100%',
    maxWidth: 360,
  },
  modalCard: {
    backgroundColor: Colors.cardBg,
    borderRadius: BorderRadius.lg,
    padding: Spacing.xl,
    borderWidth: 3,
    borderColor: Colors.red,
    shadowColor: Colors.red,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 20,
    elevation: 15,
  },
  closeButton: {
    position: 'absolute',
    top: Spacing.lg,
    right: Spacing.lg,
    width: 32,
    height: 32,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.bgDeep,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.red,
    shadowColor: Colors.red,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 15,
    elevation: 10,
  },
  title: {
    textAlign: 'center',
    fontSize: FontSize['2xl'],
    fontWeight: '900',
    color: Colors.red,
    marginBottom: Spacing.sm,
  },
  subtitle: {
    textAlign: 'center',
    color: Colors.white,
    fontWeight: '600',
    marginBottom: Spacing.xl,
    fontSize: FontSize.base,
  },
  comparisonGrid: {
    flexDirection: 'row',
    gap: Spacing.lg,
    marginBottom: Spacing.xl,
  },
  comparisonItem: {
    flex: 1,
  },
  comparisonContent: {
    alignItems: 'center',
    paddingVertical: Spacing.md,
  },
  comparisonLabel: {
    color: Colors.gray,
    fontSize: FontSize.sm,
    marginBottom: Spacing.sm,
  },
  comparisonValueWhite: {
    color: Colors.white,
    fontSize: FontSize.xl,
    fontWeight: '700',
  },
  comparisonValueGreen: {
    color: Colors.neonGreen,
    fontSize: FontSize.xl,
    fontWeight: '700',
  },
  studentNameContainer: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  studentLabel: {
    color: Colors.gray,
    fontSize: FontSize.sm,
    marginBottom: 4,
  },
  studentName: {
    color: Colors.white,
    fontSize: FontSize.lg,
    fontWeight: '700',
  },
  primaryButton: {
    width: '100%',
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.full,
    alignItems: 'center',
    marginBottom: Spacing.md,
    backgroundColor: Colors.neonGreen,
  },
  primaryButtonText: {
    color: Colors.bgDeep,
    fontWeight: '700',
    fontSize: FontSize.base,
  },
  secondaryButton: {
    width: '100%',
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.full,
    alignItems: 'center',
    backgroundColor: Colors.bgDeep,
    borderWidth: 1,
    borderColor: 'rgba(136, 153, 170, 0.3)',
  },
  secondaryButtonText: {
    color: Colors.gray,
    fontWeight: '600',
    fontSize: FontSize.base,
  },
});
