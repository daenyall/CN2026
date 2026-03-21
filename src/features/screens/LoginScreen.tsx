import React, { useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated, Dimensions } from 'react-native';
import { Trophy } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { NeonIcon } from '../components/NeonIcon';
import { Colors, Spacing, FontSize, BorderRadius } from '../../styles/theme';
import type { RootStackParamList } from '../routes';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

function FloatingParticle({ delay, x, y }: { delay: number; x: number; y: number }) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(y)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.delay(delay * 1000),
        Animated.parallel([
          Animated.sequence([
            Animated.timing(opacity, { toValue: 1, duration: 1000, useNativeDriver: true }),
            Animated.timing(opacity, { toValue: 0, duration: 1000, useNativeDriver: true }),
          ]),
          Animated.timing(translateY, {
            toValue: Math.random() * SCREEN_HEIGHT,
            duration: 3000,
            useNativeDriver: true,
          }),
        ]),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, []);

  return (
    <Animated.View
      style={[
        styles.particle,
        {
          left: x,
          opacity,
          transform: [{ translateY }],
        },
      ]}
    />
  );
}

export default function LoginScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const contentOpacity = useRef(new Animated.Value(0)).current;
  const contentTranslateY = useRef(new Animated.Value(-30)).current;
  const titleOpacity = useRef(new Animated.Value(0)).current;
  const subtitleOpacity = useRef(new Animated.Value(0)).current;
  const btn1Opacity = useRef(new Animated.Value(0)).current;
  const btn1TranslateX = useRef(new Animated.Value(-50)).current;
  const btn2Opacity = useRef(new Animated.Value(0)).current;
  const btn2TranslateX = useRef(new Animated.Value(50)).current;
  const schoolOpacity = useRef(new Animated.Value(0)).current;
  const trophyBounce = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.timing(contentOpacity, { toValue: 1, duration: 800, useNativeDriver: true }),
        Animated.timing(contentTranslateY, { toValue: 0, duration: 800, useNativeDriver: true }),
      ]),
      Animated.timing(titleOpacity, { toValue: 1, duration: 400, useNativeDriver: true }),
      Animated.timing(subtitleOpacity, { toValue: 1, duration: 400, useNativeDriver: true }),
      Animated.parallel([
        Animated.timing(btn1Opacity, { toValue: 1, duration: 400, useNativeDriver: true }),
        Animated.timing(btn1TranslateX, { toValue: 0, duration: 400, useNativeDriver: true }),
      ]),
      Animated.parallel([
        Animated.timing(btn2Opacity, { toValue: 1, duration: 400, useNativeDriver: true }),
        Animated.timing(btn2TranslateX, { toValue: 0, duration: 400, useNativeDriver: true }),
      ]),
      Animated.timing(schoolOpacity, { toValue: 1, duration: 400, useNativeDriver: true }),
    ]).start();

    // Trophy bounce animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(trophyBounce, { toValue: -10, duration: 1500, useNativeDriver: true }),
        Animated.timing(trophyBounce, { toValue: 0, duration: 1500, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const particles = Array.from({ length: 15 }, (_, i) => ({
    key: i,
    x: Math.random() * SCREEN_WIDTH,
    y: Math.random() * SCREEN_HEIGHT,
    delay: Math.random() * 2,
  }));

  return (
    <View style={styles.container}>
      {/* Animated particles */}
      {particles.map((p) => (
        <FloatingParticle key={p.key} delay={p.delay} x={p.x} y={p.y} />
      ))}

      {/* Content */}
      <Animated.View
        style={[
          styles.content,
          {
            opacity: contentOpacity,
            transform: [{ translateY: contentTranslateY }],
          },
        ]}
      >
        {/* Trophy Icon */}
        <Animated.View style={[styles.trophyContainer, { transform: [{ translateY: trophyBounce }] }]}>
          <View style={styles.trophyGlow}>
            <NeonIcon Icon={Trophy} size={80} color={Colors.neonGreen} glow />
          </View>
        </Animated.View>

        {/* Title */}
        <Animated.View style={{ opacity: titleOpacity }}>
          <Text style={styles.title}>SportRecrut</Text>
        </Animated.View>

        {/* Subtitle */}
        <Animated.View style={{ opacity: subtitleOpacity }}>
          <Text style={styles.subtitle}>Platforma talentów sportowych</Text>
        </Animated.View>

        {/* Buttons */}
        <View style={styles.buttonsContainer}>
          <Animated.View style={{ opacity: btn1Opacity, transform: [{ translateX: btn1TranslateX }] }}>
            <TouchableOpacity
              style={styles.primaryButton}
              activeOpacity={0.8}
              onPress={() => navigation.navigate('TeacherTabs', { screen: 'TeacherDashboard' })}
            >
              <Text style={styles.primaryButtonText}>Jestem Nauczycielem</Text>
            </TouchableOpacity>
          </Animated.View>

          <Animated.View style={{ opacity: btn2Opacity, transform: [{ translateX: btn2TranslateX }] }}>
            <TouchableOpacity
              style={styles.outlineButton}
              activeOpacity={0.8}
              onPress={() => navigation.navigate('StudentTabs', { screen: 'StudentDashboard' })}
            >
              <Text style={styles.outlineButtonText}>Jestem Uczniem</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>

        {/* School info */}
        <Animated.View style={{ opacity: schoolOpacity }}>
          <Text style={styles.schoolInfo}>Szkoła Podstawowa nr 3, Nowy Sącz</Text>
        </Animated.View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bgDeep,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xl,
  },
  particle: {
    position: 'absolute',
    width: 4,
    height: 4,
    backgroundColor: Colors.neonGreen,
    borderRadius: 2,
    shadowColor: Colors.neonGreen,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
    elevation: 3,
  },
  content: {
    alignItems: 'center',
    zIndex: 10,
  },
  trophyContainer: {
    marginBottom: Spacing.xxl,
  },
  trophyGlow: {
    shadowColor: Colors.neonGreen,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 30,
    elevation: 10,
  },
  title: {
    fontSize: FontSize['5xl'],
    color: Colors.white,
    fontWeight: '800',
    letterSpacing: -0.5,
    marginBottom: Spacing.sm,
    textAlign: 'center',
  },
  subtitle: {
    color: Colors.gray,
    fontSize: FontSize.base,
    marginBottom: 48,
    textAlign: 'center',
  },
  buttonsContainer: {
    width: 280,
    gap: Spacing.lg,
  },
  primaryButton: {
    width: '100%',
    paddingVertical: Spacing.lg,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.neonGreen,
    alignItems: 'center',
    shadowColor: Colors.neonGreen,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 6,
  },
  primaryButtonText: {
    color: Colors.bgDeep,
    fontWeight: '700',
    fontSize: FontSize.md,
  },
  outlineButton: {
    width: '100%',
    paddingVertical: Spacing.lg,
    borderRadius: BorderRadius.full,
    borderWidth: 2,
    borderColor: Colors.neonGreen,
    backgroundColor: 'transparent',
    alignItems: 'center',
  },
  outlineButtonText: {
    color: Colors.neonGreen,
    fontWeight: '700',
    fontSize: FontSize.md,
  },
  schoolInfo: {
    color: Colors.gray,
    fontSize: FontSize.sm,
    marginTop: 48,
    textAlign: 'center',
  },
});
