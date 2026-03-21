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

// Definiujemy elementy menu dla Ucznia i Nauczyciela
const STUDENT_ITEMS = [
  { name: 'StudentDashboard', label: 'Dom', Icon: Home },
  { name: 'TestForm', label: 'Testy', Icon: ClipboardList },
  { name: 'StudentProfile', label: 'Profil', Icon: User },
  { name: 'RankingScreen', label: 'Ranking', Icon: Trophy },
  { name: 'HeatMapScreen', label: 'Mapa', Icon: Map },
];

const TEACHER_ITEMS = [
  { name: 'TeacherDashboard', label: 'Dom', Icon: Home },
  { name: 'StudentList', label: 'Uczniowie', Icon: Users },
  { name: 'TeamRecruitment', label: 'Kadra', Icon: Award },
  { name: 'ReportExport', label: 'Raporty', Icon: FileText },
  // ZMIANA: Unikalna nazwa ekranu dla mapy nauczyciela!
  { name: 'TeacherHeatMapScreen', label: 'Mapa', Icon: Map },
];

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
  type, // Odbieramy typ z propsów BottomNav
}: BottomNavProps) {
  if (!state || !state.routes) return null;

  // Wybieramy odpowiednią listę itemów na podstawie typu
  const configItems = type === 'student' ? STUDENT_ITEMS : TEACHER_ITEMS;

  const routeCount = state.routes.length;
  const tabWidth = SCREEN_WIDTH / routeCount;
  const indicatorWidth = tabWidth * 0.8;
  const centerOffset = (tabWidth - indicatorWidth) / 2;

  const inputRange = state.routes.map((_: any, i: number) => i);
  const translateX = position.interpolate({
    inputRange,
    outputRange: inputRange.map((i: number) => i * tabWidth + centerOffset),
    extrapolate: 'clamp',
  });

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

      {state.routes.map((route: any, index: number) => {
        const routeConfig = configItems.find((item) => item.name === route.name);
        const IconComponent = routeConfig?.Icon ?? Home;
        const label = routeConfig?.label ?? route.name;

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
                // ZMIANA: Przekazujemy typ (student/teacher) w parametrach
                navigation.navigate({ name: route.name, params: { userType: type }, merge: true } as any);
              }
            }}
            style={styles.tab}
            activeOpacity={0.7}
          >
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