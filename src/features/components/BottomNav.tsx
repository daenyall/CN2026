import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
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
import { Colors, Spacing } from '../../styles/theme';
import type { RootStackParamList } from '../routes';

interface NavItem {
  Icon: typeof Home;
  label: string;
  path: keyof RootStackParamList;
}

interface BottomNavProps {
  type: 'student' | 'teacher';
}

export function BottomNav({ type }: BottomNavProps) {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute();

  const studentNavItems: NavItem[] = [
    { Icon: Home, label: 'Dom', path: 'StudentDashboard' },
    { Icon: ClipboardList, label: 'Testy', path: 'TestForm' },
    { Icon: User, label: 'Profil', path: 'StudentProfile' },
    { Icon: Trophy, label: 'Ranking', path: 'RankingScreen' },
    { Icon: Map, label: 'Mapa', path: 'HeatMapScreen' },
  ];

  const teacherNavItems: NavItem[] = [
    { Icon: Home, label: 'Dom', path: 'TeacherDashboard' },
    { Icon: Users, label: 'Uczniowie', path: 'StudentList' },
    { Icon: Award, label: 'Kadra', path: 'TeamRecruitment' },
    { Icon: FileText, label: 'Raporty', path: 'ReportExport' },
  ];

  const items = type === 'student' ? studentNavItems : teacherNavItems;

  return (
    <View style={styles.container}>
      {items.map((item) => {
        const isActive = route.name === item.path;
        const IconComponent = item.Icon;

        return (
          <TouchableOpacity
            key={item.path}
            onPress={() => navigation.navigate(item.path as any)}
            style={[styles.navItem, isActive && styles.navItemActive]}
            activeOpacity={0.7}
          >
            <IconComponent
              size={20}
              color={isActive ? Colors.neonGreen : Colors.gray}
              strokeWidth={2}
            />
            <Text
              style={[
                styles.navLabel,
                { color: isActive ? Colors.neonGreen : Colors.gray },
                isActive && styles.navLabelActive,
              ]}
            >
              {item.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: Colors.cardBg,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 230, 118, 0.2)',
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.sm,
    paddingBottom: Spacing.lg,
  },
  navItem: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: 8,
  },
  navItemActive: {
    backgroundColor: 'rgba(0, 230, 118, 0.1)',
  },
  navLabel: {
    fontSize: 10,
    fontWeight: '400',
  },
  navLabelActive: {
    fontWeight: '600',
  },
});
