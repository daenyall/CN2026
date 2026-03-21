import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { Home, ClipboardList, User, Trophy, Map, Users, Award, FileText } from 'lucide-react-native';

// Student Screens — from features/screens
import LoginScreen from '../features/screens/LoginScreen';
import StudentDashboard from '../features/screens/StudentDashboard';
import RankingScreen from '../features/screens/RankingScreen';
import StudentProfile from '../features/screens/StudentProfile';
import StreakScreen from '../features/screens/StreakScreen';
import TestForm from '../features/screens/TestForm';

// Teacher Screens — from features/screens
import TeacherDashboard from '../features/screens/TeacherDashboard';
import StudentList from '../features/screens/StudentList';
import TeamRecruitment from '../features/screens/TeamRecruitment';
import ReportExport from '../features/screens/ReportExport';
import HeatMapScreen from '../features/screens/HeatMapScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const CustomTabBar = ({ state, descriptors, navigation, type }: any) => {
  return (
    <View style={styles.tabContainer}>
      {state.routes.map((route: any, index: number) => {
        const { options } = descriptors[route.key];
        const isFocused = state.index === index;
        
        let IconComponent = Home;
        let label = '';
        
        if (type === 'student') {
          if (route.name === 'StudentDashboard') { IconComponent = Home; label = 'Dom'; }
          else if (route.name === 'TestForm') { IconComponent = ClipboardList; label = 'Testy'; }
          else if (route.name === 'StudentProfile') { IconComponent = User; label = 'Profil'; }
          else if (route.name === 'RankingScreen') { IconComponent = Trophy; label = 'Ranking'; }
          else if (route.name === 'StreakScreen') { IconComponent = Map; label = 'Mapa'; }
        } else {
          if (route.name === 'TeacherDashboard') { IconComponent = Home; label = 'Dom'; }
          else if (route.name === 'StudentList') { IconComponent = Users; label = 'Uczniowie'; }
          else if (route.name === 'TeamRecruitment') { IconComponent = Award; label = 'Kadra'; }
          else if (route.name === 'ReportExport') { IconComponent = FileText; label = 'Raporty'; }
        }

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        return (
          <TouchableOpacity
            key={route.key}
            onPress={onPress}
            style={styles.tabButton}
            activeOpacity={0.7}
          >
            {isFocused && <View style={styles.activeBg} />}
            <IconComponent
              size={20}
              color={isFocused ? '#00E676' : '#8899AA'}
              strokeWidth={2}
              style={isFocused ? styles.iconShadow : undefined}
            />
            <Text style={[styles.tabLabel, { color: isFocused ? '#00E676' : '#8899AA', fontWeight: isFocused ? '600' : '400' }]}>
              {label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

function StudentTabs() {
  return (
    <Tab.Navigator tabBar={props => <CustomTabBar {...props} type="student" />} screenOptions={{ headerShown: false }}>
      <Tab.Screen name="StudentDashboard" component={StudentDashboard} />
      <Tab.Screen name="TestForm" component={TestForm} />
      <Tab.Screen name="StudentProfile" component={StudentProfile} />
      <Tab.Screen name="RankingScreen" component={RankingScreen} />
      <Tab.Screen name="StreakScreen" component={StreakScreen} />
    </Tab.Navigator>
  );
}

function TeacherTabs() {
  return (
    <Tab.Navigator tabBar={props => <CustomTabBar {...props} type="teacher" />} screenOptions={{ headerShown: false }}>
      <Tab.Screen name="TeacherDashboard" component={TeacherDashboard} />
      <Tab.Screen name="StudentList" component={StudentList} />
      <Tab.Screen name="TeamRecruitment" component={TeamRecruitment} />
      <Tab.Screen name="ReportExport" component={ReportExport} />
    </Tab.Navigator>
  );
}

export function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="LoginScreen" component={LoginScreen} />
        <Stack.Screen name="StudentMain" component={StudentTabs} />
        <Stack.Screen name="TeacherMain" component={TeacherTabs} />
        <Stack.Screen name="HeatMapScreen" component={HeatMapScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#1E2A3A',
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 230, 118, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 8,
    justifyContent: 'space-around',
    alignItems: 'center',
    flexWrap: 'nowrap',
  },
  tabButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    position: 'relative',
  },
  activeBg: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 230, 118, 0.1)',
    borderRadius: 8,
  },
  iconShadow: {
    shadowColor: '#00E676',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 6,
    elevation: 4,
  },
  tabLabel: {
    fontSize: 10,
    marginTop: 4,
  }
});
