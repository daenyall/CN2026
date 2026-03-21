import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { Download, Send, FileText, CheckCircle, School, Database, RefreshCw } from 'lucide-react-native';
import { NeonCard } from '../components/NeonCard';
import { NeonIcon } from '../components/NeonIcon';

import { Colors, Spacing, FontSize, BorderRadius } from '../../styles/theme';

// FIREBASE IMPORTS
import { auth, db } from '../config/firebase';
import { collection, getDocs, getDoc, doc } from 'firebase/firestore';

export default function ReportExport() {
  const [isLoading, setIsLoading] = useState(true);
  const [teacherSchool, setTeacherSchool] = useState<string>('Wczytywanie placówki...');

  // Dynamiczne statystyki do raportu
  const [totalStudents, setTotalStudents] = useState(0);
  const [averageScore, setAverageScore] = useState(0);
  const [totalStreaks, setTotalStreaks] = useState(0);

  const reportItems = [
    `Zestawienie uczniów (${totalStudents})`,
    'Wykresy postępów i trendów AI',
    'Skład głównej kadry reprezentacyjnej',
    'Rekomendacje Ministerstwa Sportu',
  ];

  // Dzisiejsza data do raportu
  const today = new Date().toLocaleDateString('pl-PL', { day: 'numeric', month: 'long', year: 'numeric' });

  const fetchReportData = async () => {
    setIsLoading(true);
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        setIsLoading(false);
        return;
      }

      // 1. Pobieramy profil nauczyciela z 'users'
      const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
      const rawSchool = userDoc.data()?.school;

      if (!rawSchool) {
        setTeacherSchool('Brak przypisanej placówki');
        setIsLoading(false);
        return;
      }

      const cleanSchool = rawSchool.trim();
      setTeacherSchool(cleanSchool);
      const targetSchoolLower = cleanSchool.toLowerCase();

      // 2. Pobieramy uczniów z kolekcji 'students'
      const snapshot = await getDocs(collection(db, 'students'));

      let count = 0;
      let scoreSum = 0;
      let streaks = 0;

      snapshot.forEach(document => {
        const data = document.data();
        const studentSchool = (data.school || '').trim().toLowerCase();

        if (studentSchool === targetSchoolLower) {
          count++;

          // Pobieramy wynik z bezpiecznym fallbackiem
          const score = data.overall ?? data.stats?.overall ?? 0;
          scoreSum += score;

          // Liczymy aktywne streaki
          const currentStreak = data.currentStreak ?? 0;
          if (currentStreak > 0) {
            streaks++;
          }
        }
      });

      setTotalStudents(count);
      if (count > 0) {
        setAverageScore(Math.round(scoreSum / count));
      } else {
        setAverageScore(0);
      }
      setTotalStreaks(streaks);

    } catch (error) {
      console.error("Błąd podczas pobierania danych do raportu: ", error);
      setTeacherSchool('Błąd pobierania danych');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReportData();
  }, []);

  const handleGeneratePDF = () => {
    if (totalStudents === 0) {
      Alert.alert('Brak danych', 'Nie masz jeszcze uczniów w swojej placówce. Raport byłby pusty!');
      return;
    }
    Alert.alert('Sukces', `Raport dla ${totalStudents} uczniów wygenerowany! 📄\nPobieranie rozpoczęte.`);
  };

  const handleSendToMinistry = () => {
    if (totalStudents === 0) {
      Alert.alert('Brak danych', 'Raport jest pusty, nie można wysłać pustych danych do Ministerstwa.');
      return;
    }
    Alert.alert('Sukces', `Raport placówki (${teacherSchool}) wysłany do Ministerstwa Sportu! ✅\nPotwierdzenie otrzymasz na email.`);
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View style={styles.innerPadding}>

          <View style={styles.headerRow}>
            <Text style={styles.screenTitle}>📋 Eksport Danych</Text>
            <TouchableOpacity onPress={fetchReportData} activeOpacity={0.7} style={styles.refreshButton}>
              {isLoading ? (
                <ActivityIndicator size="small" color={Colors.neonGreen} />
              ) : (
                <RefreshCw size={20} color={Colors.neonGreen} />
              )}
            </TouchableOpacity>
          </View>

          {/* Report Preview */}
          <View style={styles.sectionSpacing}>
            <NeonCard glow>
              <View style={styles.previewContainer}>
                <View style={styles.previewBox}>
                  {/* Background lines */}
                  {[...Array(10)].map((_, i) => (
                    <View key={i} style={styles.previewLine} />
                  ))}

                  {/* Content */}
                  <View style={styles.previewContent}>
                    <NeonIcon Icon={FileText} size={48} color={Colors.neonGreen} glow />
                    <Text style={styles.previewTitle}>Raport Sportowy</Text>
                    <Text style={styles.previewSub} numberOfLines={2} adjustsFontSizeToFit>
                      {teacherSchool}
                    </Text>

                    {/* Mini stats - dynamiczne! */}
                    <View style={styles.previewStats}>
                      <View style={styles.previewStat}>
                        <Text style={styles.previewStatValueGreen}>{totalStudents}</Text>
                        <Text style={styles.previewStatLabel}>Uczniów</Text>
                      </View>
                      <View style={styles.previewStat}>
                        <Text style={styles.previewStatValueGold}>{averageScore}</Text>
                        <Text style={styles.previewStatLabel}>Średnia</Text>
                      </View>
                      <View style={styles.previewStat}>
                        <Text style={styles.previewStatValueOrange}>{totalStreaks}</Text>
                        <Text style={styles.previewStatLabel}>Streaki</Text>
                      </View>
                    </View>
                  </View>
                </View>

                <Text style={styles.previewCaption}>Podgląd inteligentnego raportu PDF</Text>
              </View>
            </NeonCard>
          </View>

          {/* Ostrzeżenie, jeśli nie ma uczniów */}
          {!isLoading && totalStudents === 0 && (
            <View style={{ alignItems: 'center', marginBottom: Spacing.xl, backgroundColor: Colors.cardBg, padding: 15, borderRadius: 12, borderWidth: 1, borderColor: Colors.red }}>
              <Database size={30} color={Colors.red} style={{ marginBottom: 10 }} />
              <Text style={{ color: Colors.white, fontWeight: 'bold', textAlign: 'center' }}>Raport jest pusty!</Text>
              <Text style={{ color: Colors.gray, textAlign: 'center', fontSize: 12, marginTop: 5 }}>Twoja szkoła ({teacherSchool}) nie ma jeszcze zarejestrowanych uczniów w bazie.</Text>
            </View>
          )}

          {/* Report Contents */}
          <View style={styles.sectionSpacing}>
            <NeonCard>
              <Text style={styles.contentsTitle}>Zawartość generowanego raportu:</Text>
              <View style={styles.contentsList}>
                {reportItems.map((item, index) => (
                  <View key={index} style={styles.contentsItem}>
                    <NeonIcon Icon={CheckCircle} size={16} color={Colors.neonGreen} glow={false} />
                    <Text style={styles.contentsItemText}>{item}</Text>
                  </View>
                ))}
              </View>
            </NeonCard>
          </View>

          {/* Action Buttons */}
          <View style={styles.buttonsContainer}>
            <TouchableOpacity
              style={[styles.primaryButton, totalStudents === 0 && { opacity: 0.5 }]}
              activeOpacity={0.8}
              onPress={handleGeneratePDF}
            >
              <Download size={20} color={Colors.bgDeep} />
              <Text style={styles.primaryButtonText}>📄 Generuj PDF i pobierz</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.secondaryButton, totalStudents === 0 && { opacity: 0.5 }]}
              activeOpacity={0.8}
              onPress={handleSendToMinistry}
            >
              <Send size={16} color={Colors.gray} />
              <Text style={styles.secondaryButtonText}>📤 Wyślij do Ministerstwa Sportu</Text>
            </TouchableOpacity>
          </View>

          {/* Last Report Info */}
          <View style={styles.sectionSpacing}>
            <NeonCard>
              <View style={styles.lastReportContent}>
                <Text style={styles.lastReportLabel}>Dzisiejsza data ewaluacji:</Text>
                <Text style={styles.lastReportDate}>{today}</Text>
              </View>
            </NeonCard>
          </View>

          {/* Stats Summary */}
          <View style={styles.summaryGrid}>
            <View style={styles.summaryItem}>
              <NeonCard>
                <View style={styles.summaryContent}>
                  <Text style={styles.summaryValueGreen}>{totalStudents}</Text>
                  <Text style={styles.summaryLabel}>Uczniów</Text>
                </View>
              </NeonCard>
            </View>
            <View style={styles.summaryItem}>
              <NeonCard>
                <View style={styles.summaryContent}>
                  <Text style={styles.summaryValueGold}>{averageScore}</Text>
                  <Text style={styles.summaryLabel}>Średnia</Text>
                </View>
              </NeonCard>
            </View>
            <View style={styles.summaryItem}>
              <NeonCard>
                <View style={styles.summaryContent}>
                  <Text style={styles.summaryValueOrange}>{totalStreaks}</Text>
                  <Text style={styles.summaryLabel}>W Treningu</Text>
                </View>
              </NeonCard>
            </View>
          </View>
        </View>
      </ScrollView>

    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bgDeep },
  scrollView: { flex: 1 },
  scrollContent: { paddingBottom: 80 },
  innerPadding: { padding: Spacing.xl, paddingTop: 60 },

  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: Spacing.xl },
  screenTitle: { color: Colors.white, fontSize: FontSize['2xl'], fontWeight: '800' },
  refreshButton: { padding: 8, backgroundColor: Colors.cardBg, borderRadius: 20, borderWidth: 1, borderColor: 'rgba(0, 230, 118, 0.3)' },

  sectionSpacing: { marginBottom: Spacing.xl },
  previewContainer: { gap: Spacing.lg },
  previewBox: { width: '100%', height: 260, borderRadius: BorderRadius.sm, borderWidth: 2, borderColor: 'rgba(0, 230, 118, 0.3)', padding: Spacing.xl, alignItems: 'center', justifyContent: 'center', overflow: 'hidden', backgroundColor: Colors.cardBg, shadowColor: Colors.neonGreen, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.2, shadowRadius: 15, elevation: 6 },
  previewLine: { position: 'absolute', left: 0, right: 0, height: 1, backgroundColor: Colors.neonGreen, opacity: 0.05, marginBottom: Spacing.lg },
  previewContent: { alignItems: 'center', zIndex: 10 },
  previewTitle: { color: Colors.white, fontSize: FontSize.sm, fontWeight: '700', marginTop: Spacing.lg, marginBottom: 4 },
  previewSub: { color: Colors.gray, fontSize: FontSize.xs, marginBottom: Spacing.md, textAlign: 'center' },
  previewStats: { flexDirection: 'row', gap: Spacing.sm, marginTop: Spacing.lg },
  previewStat: { backgroundColor: Colors.bgDeep, paddingHorizontal: Spacing.sm, paddingVertical: Spacing.sm, borderRadius: 4, alignItems: 'center', minWidth: 70 },
  previewStatValueGreen: { color: Colors.neonGreen, fontSize: FontSize.lg, fontWeight: '800' },
  previewStatValueGold: { color: Colors.gold, fontSize: FontSize.lg, fontWeight: '800' },
  previewStatValueOrange: { color: Colors.orange, fontSize: FontSize.lg, fontWeight: '800' },
  previewStatLabel: { color: Colors.gray, fontSize: 10, marginTop: 2 },
  previewCaption: { color: Colors.gray, fontSize: FontSize.sm, textAlign: 'center' },

  contentsTitle: { color: Colors.white, fontSize: FontSize.sm, fontWeight: '700', marginBottom: Spacing.md },
  contentsList: { gap: Spacing.sm },
  contentsItem: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  contentsItemText: { color: Colors.white, fontSize: FontSize.sm },

  buttonsContainer: { gap: Spacing.md, marginBottom: Spacing.xl },
  primaryButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.sm, width: '100%', paddingVertical: Spacing.lg, borderRadius: BorderRadius.full, backgroundColor: Colors.neonGreen, shadowColor: Colors.neonGreen, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.4, shadowRadius: 10, elevation: 6 },
  primaryButtonText: { color: Colors.bgDeep, fontWeight: '700', fontSize: FontSize.base },
  secondaryButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.sm, width: '100%', paddingVertical: Spacing.md, borderRadius: BorderRadius.full, backgroundColor: Colors.cardBg, borderWidth: 1, borderColor: 'rgba(0, 230, 118, 0.2)' },
  secondaryButtonText: { color: Colors.gray, fontSize: FontSize.base },

  lastReportContent: { alignItems: 'center', paddingVertical: Spacing.sm },
  lastReportLabel: { color: Colors.gray, fontSize: FontSize.xs, marginBottom: 4 },
  lastReportDate: { color: Colors.white, fontSize: FontSize.sm, fontWeight: '600' },

  summaryGrid: { flexDirection: 'row', gap: Spacing.md },
  summaryItem: { flex: 1 },
  summaryContent: { alignItems: 'center', paddingVertical: Spacing.md },
  summaryValueGreen: { color: Colors.neonGreen, fontSize: FontSize['2xl'], fontWeight: '800', marginBottom: 4 },
  summaryValueGold: { color: Colors.gold, fontSize: FontSize['2xl'], fontWeight: '800', marginBottom: 4 },
  summaryValueOrange: { color: Colors.orange, fontSize: FontSize['2xl'], fontWeight: '800', marginBottom: 4 },
  summaryLabel: { color: Colors.gray, fontSize: FontSize.xs },
});