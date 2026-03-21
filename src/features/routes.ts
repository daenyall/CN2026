import type { NavigatorScreenParams } from '@react-navigation/native';

export type StudentTabParamList = {
  StudentDashboard: undefined;
  TestForm: undefined;
  StudentProfile: undefined;
  RankingScreen: undefined;
  HeatMapScreen: undefined;
};

export type TeacherTabParamList = {
  TeacherDashboard: undefined;
  StudentList: undefined;
  TeamRecruitment: undefined;
  ReportExport: undefined;
  TeacherHeatMapScreen: undefined;
};

export type RootStackParamList = {
  Login: undefined;
  StudentTabs: NavigatorScreenParams<StudentTabParamList>;
  TeacherTabs: NavigatorScreenParams<TeacherTabParamList>;
  StreakScreen: undefined;
};
