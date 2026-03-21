import React from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
} from 'react-native';
import type { MaterialTopTabBarProps } from '@react-navigation/material-top-tabs';
import {
  Home,
  ClipboardList,
  User,
  Trophy,
  Map,
  Users,
  Award,
  FileText,
} from 'lucide-react-native';
import { Colors } from '../../styles/theme';

const SCREEN_WIDTH = Dimensions.get('window').width;
const INDICATOR_HEIGHT = 50;
const INDICATOR_RADIUS = 24;
const BAR_PADDING_BOTTOM = 28;
const BAR_PADDING_VERTICAL = 10;

const ICON_MAP: Record<string, typeof Home> = {
  StudentDashboard: Home,
  TestForm: ClipboardList,
  StudentProfile: User,
  RankingScreen: Trophy,
  HeatMapScreen: Map,
  TeacherDashboard: Home,
  StudentList: Users,
  TeamRecruitment: Award,
  ReportExport: FileText,
};

const LABEL_MAP: Record<string, string> = {
  StudentDashboard: 'Dom',
  TestForm: 'Testy',
  StudentProfile: 'Profil',
  RankingScreen: 'Ranking',
  HeatMapScreen: 'Mapa',
  TeacherDashboard: 'Dom',
  StudentList: 'Uczniowie',
  TeamRecruitment: 'Kadra',
  ReportExport: 'Raporty',
};

type BottomNavProps = MaterialTopTabBarProps & { type: 'student' | 'teacher' };

export function BottomNav(props: BottomNavProps) {
  return <LiquidTabBar {...props} />;
}

/* ──────────────────────────────────────────────────
   Shared liquid tab bar – position-driven indicator
   ────────────────────────────────────────────────── */

function LiquidTabBar({
  state,
  navigation,
  position,
}: MaterialTopTabBarProps) {
  if (!state || !state.routes) return null;

  const routeCount = state.routes.length;
  const tabWidth = SCREEN_WIDTH / routeCount;
  const indicatorWidth = tabWidth * 0.8;
  const centerOffset = (tabWidth - indicatorWidth) / 2;

  // ── translateX: slide indicator, centered under active icon ──
  const inputRange = state.routes.map((_: any, i: number) => i);
  const translateX = position.interpolate({
    inputRange,
    outputRange: inputRange.map((i: number) => i * tabWidth + centerOffset),
    extrapolate: 'clamp',
  });

  // ── scaleX: liquid stretch between tabs ──
  // integers → 1, half-steps → 1.5
  const scaleInput: number[] = [];
  const scaleOutput: number[] = [];
  for (let i = 0; i < routeCount; i++) {
    scaleInput.push(i);
    scaleOutput.push(1);
    if (i < routeCount - 1) {
      scaleInput.push(i + 0.5);
      scaleOutput.push(1.5);
    }
  }

  const scaleX = position.interpolate({
    inputRange: scaleInput,
    outputRange: scaleOutput,
    extrapolate: 'clamp',
  });

  return (
    <View style={styles.container}>
      {/* Liquid indicator (behind icons) */}
      <Animated.View
        style={[
          styles.indicator,
          {
            width: indicatorWidth,
            backgroundColor: Colors.neonGreen,
            transform: [{ translateX }, { scaleX }],
          },
        ]}
      />

      {/* Tab buttons */}
      {state.routes.map((route: any, index: number) => {
        const IconComponent = ICON_MAP[route.name] ?? Home;
        const label = LABEL_MAP[route.name] ?? route.name;

        // ── Position-driven animated color (no state.index) ──
        const isFirst = index === 0;
        const isLast = index === routeCount - 1;

        const activeOpacity = position.interpolate({
          inputRange: isFirst
            ? [0, 0.5]
            : isLast
              ? [index - 0.5, index]
              : [index - 0.5, index, index + 0.5],
          outputRange: isFirst
            ? [1, 0]
            : isLast
              ? [0, 1]
              : [0, 1, 0],
          extrapolate: 'clamp',
        });

        const inactiveOpacity = position.interpolate({
          inputRange: isFirst
            ? [0, 0.5]
            : isLast
              ? [index - 0.5, index]
              : [index - 0.5, index, index + 0.5],
          outputRange: isFirst
            ? [0, 1]
            : isLast
              ? [1, 0]
              : [1, 0, 1],
          extrapolate: 'clamp',
        });

        return (
          <TouchableOpacity
            key={route.key}
            accessibilityRole="button"
            onPress={() => {
              const event = navigation.emit({
                type: 'tabPress',
                target: route.key,
                canPreventDefault: true,
              });
              if (!event.defaultPrevented) {
                navigation.navigate({ name: route.name, merge: true } as any);
              }
            }}
            style={styles.tab}
            activeOpacity={0.7}
          >
            {/* Icon cross-fade: two layers with animated opacity */}
            <View style={styles.iconContainer}>
              <Animated.View style={{ opacity: inactiveOpacity }}>
                <IconComponent size={22} color={Colors.gray} strokeWidth={2.2} />
              </Animated.View>
              <Animated.View style={[styles.iconOverlay, { opacity: activeOpacity }]}>
                <IconComponent size={22} color="#000000" strokeWidth={2.2} />
              </Animated.View>
            </View>
            <View style={styles.labelContainer}>
              <Animated.Text style={[styles.label, { color: Colors.gray, opacity: inactiveOpacity }]}>
                {label}
              </Animated.Text>
              <Animated.Text
                style={[styles.label, styles.labelActive, { color: '#000000', opacity: activeOpacity }, styles.labelOverlay]}
              >
                {label}
              </Animated.Text>
            </View>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

/* ──────────────────────────────────────────────────
   Styles
   ────────────────────────────────────────────────── */

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-evenly',
    backgroundColor: '#0A0E1A',
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 230, 118, 0.15)',
    paddingTop: BAR_PADDING_VERTICAL,
    paddingBottom: BAR_PADDING_BOTTOM,
  },
  indicator: {
    position: 'absolute',
    left: 0,
    top: BAR_PADDING_VERTICAL + 3,
    height: INDICATOR_HEIGHT,
    borderRadius: INDICATOR_RADIUS,
    shadowColor: Colors.neonGreen,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.55,
    shadowRadius: 14,
    elevation: 8,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
    paddingVertical: 6,
    zIndex: 1,
  },
  iconContainer: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  labelContainer: {
    height: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: 10,
    fontWeight: '400',
  },
  labelActive: {
    fontWeight: '700',
  },
  labelOverlay: {
    position: 'absolute',
  },
});
