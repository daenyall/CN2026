import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, withRepeat, withDelay, withSequence, Easing } from 'react-native-reanimated';
import { Trophy } from 'lucide-react-native';
import { NeonIcon } from '../../components/NeonIcon';

const { width, height } = Dimensions.get('window');

function Particle({ index }: { index: number }) {
  const translateY = useSharedValue(Math.random() * height);
  const opacity = useSharedValue(0);

  useEffect(() => {
    translateY.value = withRepeat(
      withSequence(
        withTiming(Math.random() * height, { duration: 0 }),
        withTiming(Math.random() * height, { duration: 3000 + Math.random() * 2000 })
      ),
      -1,
      true
    );
    opacity.value = withRepeat(
      withSequence(
        withDelay(
          Math.random() * 2000,
          withTiming(1, { duration: 1000 })
        ),
        withTiming(0, { duration: 1000 })
      ),
      -1,
      false
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        styles.particle,
        { left: Math.random() * width },
        animatedStyle
      ]}
    />
  );
}

export default function LoginScreen() {
  const navigation = useNavigation<any>();

  // Main container entrance
  const contentOpacity = useSharedValue(0);
  const contentTranslateY = useSharedValue(-30);

  // Trophy entrance
  const trophyTranslateY = useSharedValue(0);
  const trophyRotate = useSharedValue(0);
  const glowScale = useSharedValue(1);
  const glowOpacity = useSharedValue(0.3);

  // Text entrance
  const titleOpacity = useSharedValue(0);
  const subtitleOpacity = useSharedValue(0);
  const schoolOpacity = useSharedValue(0);

  // Buttons entrance
  const btn1Opacity = useSharedValue(0);
  const btn1TranslateX = useSharedValue(-50);
  const btn2Opacity = useSharedValue(0);
  const btn2TranslateX = useSharedValue(50);

  useEffect(() => {
    contentOpacity.value = withTiming(1, { duration: 800 });
    contentTranslateY.value = withTiming(0, { duration: 800 });

    trophyTranslateY.value = withRepeat(withSequence(withTiming(-10, { duration: 1500, easing: Easing.inOut(Easing.ease) }), withTiming(0, { duration: 1500, easing: Easing.inOut(Easing.ease) })), -1, false);
    trophyRotate.value = withRepeat(withSequence(withTiming(5, { duration: 750 }), withTiming(-5, { duration: 1500 }), withTiming(0, { duration: 750 })), -1, false);

    glowScale.value = withRepeat(withSequence(withTiming(1.2, { duration: 1000 }), withTiming(1, { duration: 1000 })), -1, false);
    glowOpacity.value = withRepeat(withSequence(withTiming(0.5, { duration: 1000 }), withTiming(0.3, { duration: 1000 })), -1, false);

    titleOpacity.value = withDelay(300, withTiming(1, { duration: 500 }));
    subtitleOpacity.value = withDelay(500, withTiming(1, { duration: 500 }));
    
    btn1Opacity.value = withDelay(700, withTiming(1, { duration: 500 }));
    btn1TranslateX.value = withDelay(700, withTiming(0, { duration: 500 }));
    
    btn2Opacity.value = withDelay(900, withTiming(1, { duration: 500 }));
    btn2TranslateX.value = withDelay(900, withTiming(0, { duration: 500 }));

    schoolOpacity.value = withDelay(1100, withTiming(1, { duration: 500 }));
  }, []);

  const contentAnimatedStyle = useAnimatedStyle(() => ({
    opacity: contentOpacity.value,
    transform: [{ translateY: contentTranslateY.value }]
  }));

  const trophyAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: trophyTranslateY.value }, { rotate: `${trophyRotate.value}deg` }]
  }));

  const glowAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: glowScale.value }],
    opacity: glowOpacity.value
  }));

  return (
    <View style={styles.container}>
      {/* Particles */}
      <View style={StyleSheet.absoluteFill}>
        {[...Array(20)].map((_, i) => (
          <Particle key={i} index={i} />
        ))}
      </View>

      <Animated.View style={[styles.content, contentAnimatedStyle]}>
        {/* Trophy */}
        <Animated.View style={[styles.trophyContainer, trophyAnimatedStyle]}>
          <View style={styles.relativeBlock}>
            <NeonIcon Icon={Trophy} size={80} color="#00E676" glow={true} />
            <Animated.View style={[styles.trophyGlow, glowAnimatedStyle]} />
          </View>
        </Animated.View>

        {/* Texts */}
        <Animated.Text style={[styles.title, { opacity: titleOpacity }]}>SportRecrut</Animated.Text>
        <Animated.Text style={[styles.subtitle, { opacity: subtitleOpacity }]}>Platforma talentów sportowych</Animated.Text>

        {/* Buttons */}
        <View style={styles.buttonsContainer}>
          <Animated.View style={{ opacity: btn1Opacity, transform: [{ translateX: btn1TranslateX }] }}>
            <TouchableOpacity 
              activeOpacity={0.8}
              style={styles.primaryButton}
              onPress={() => navigation.navigate("TeacherMain")}
            >
              <Text style={styles.primaryButtonText}>Jestem Nauczycielem</Text>
            </TouchableOpacity>
          </Animated.View>

          <Animated.View style={{ opacity: btn2Opacity, transform: [{ translateX: btn2TranslateX }] }}>
            <TouchableOpacity 
              activeOpacity={0.8}
              style={styles.secondaryButton}
              onPress={() => navigation.navigate("StudentMain")}
            >
              <Text style={styles.secondaryButtonText}>Jestem Uczniem</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>

        {/* School Info */}
        <Animated.Text style={[styles.schoolInfo, { opacity: schoolOpacity }]}>
          Szkoła Podstawowa nr 3, Nowy Sącz
        </Animated.Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0E1A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  particle: {
    position: 'absolute',
    width: 4,
    height: 4,
    backgroundColor: '#00E676',
    borderRadius: 2,
    shadowColor: '#00E676',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 4,
  },
  content: {
    alignItems: 'center',
    zIndex: 10,
    width: '100%',
    paddingHorizontal: 24,
  },
  trophyContainer: {
    marginBottom: 32,
  },
  relativeBlock: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  trophyGlow: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#00E676',
    borderRadius: 999,
    shadowColor: '#00E676',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 30,
    elevation: 10,
    zIndex: -1,
  },
  title: {
    fontSize: 48,
    color: '#FFFFFF',
    fontWeight: '800',
    letterSpacing: -1,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    color: '#8899AA',
    fontSize: 16,
    marginBottom: 48,
    textAlign: 'center',
  },
  buttonsContainer: {
    width: '100%',
    maxWidth: 280,
    gap: 16,
  },
  primaryButton: {
    width: '100%',
    paddingVertical: 16,
    borderRadius: 999,
    backgroundColor: '#00E676',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  primaryButtonText: {
    color: '#0A0E1A',
    fontWeight: '700',
    fontSize: 16,
  },
  secondaryButton: {
    width: '100%',
    paddingVertical: 16,
    borderRadius: 999,
    borderWidth: 2,
    borderColor: '#00E676',
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  secondaryButtonText: {
    color: '#00E676',
    fontWeight: '700',
    fontSize: 16,
  },
  schoolInfo: {
    color: '#8899AA',
    fontSize: 14,
    marginTop: 48,
    textAlign: 'center',
  }
});
