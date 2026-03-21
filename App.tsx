import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import type { RootStackParamList, StudentTabParamList, TeacherTabParamList } from './src/features/routes';
import { BottomNav } from './src/features/components/BottomNav';

import LoginScreen from './src/features/screens/LoginScreen';
import StudentDashboard from './src/features/screens/StudentDashboard';
import StudentProfile from './src/features/screens/StudentProfile';
import TestForm from './src/features/screens/TestForm';
import StreakScreen from './src/features/screens/StreakScreen';
import RankingScreen from './src/features/screens/RankingScreen';
import TeacherDashboard from './src/features/screens/TeacherDashboard';
import StudentList from './src/features/screens/StudentList';
import TeamRecruitment from './src/features/screens/TeamRecruitment';
import ReportExport from './src/features/screens/ReportExport';
import HeatMapScreen from './src/features/screens/HeatMapScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();
const StudentTab = createMaterialTopTabNavigator<StudentTabParamList>();
const TeacherTab = createMaterialTopTabNavigator<TeacherTabParamList>();

function StudentTabNavigator() {
  return (
    <StudentTab.Navigator
      initialRouteName="StudentDashboard"
      tabBarPosition="bottom"
      tabBar={(props) => <BottomNav {...props} type="student" />}
      screenOptions={{ swipeEnabled: true, animationEnabled: true, lazy: true }}
    >
      <StudentTab.Screen name="StudentDashboard" component={StudentDashboard} />
      <StudentTab.Screen name="TestForm" component={TestForm} />
      <StudentTab.Screen name="StudentProfile" component={StudentProfile} />
      <StudentTab.Screen name="RankingScreen" component={RankingScreen} />
      <StudentTab.Screen name="HeatMapScreen" component={HeatMapScreen} />
    </StudentTab.Navigator>
  );
}

function TeacherTabNavigator() {
  return (
    <TeacherTab.Navigator
      initialRouteName="TeacherDashboard"
      tabBarPosition="bottom"
      tabBar={(props) => <BottomNav {...props} type="teacher" />}
      screenOptions={{ swipeEnabled: true, animationEnabled: true, lazy: true }}
    >
      <TeacherTab.Screen name="TeacherDashboard" component={TeacherDashboard} />
      <TeacherTab.Screen name="StudentList" component={StudentList} />
      <TeacherTab.Screen name="TeamRecruitment" component={TeamRecruitment} />
      <TeacherTab.Screen name="ReportExport" component={ReportExport} />
      <TeacherTab.Screen name="TeacherHeatMapScreen" component={HeatMapScreen} />
    </TeacherTab.Navigator>
  );
}

export default function App() {
  return (
    <NavigationContainer>
      <StatusBar style="light" />
      <Stack.Navigator
        initialRouteName="Login"
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: '#0A0E1A' },
          animation: 'slide_from_right',
          gestureEnabled: true,
          gestureDirection: 'horizontal',
        }}
      >
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="StudentTabs" component={StudentTabNavigator} />
        <Stack.Screen name="TeacherTabs" component={TeacherTabNavigator} />
        <Stack.Screen name="StreakScreen" component={StreakScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}