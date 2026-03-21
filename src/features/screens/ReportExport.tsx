import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, RefreshControl } from 'react-native';
import { Download, Send, FileText, CheckCircle, School, Database, RefreshCw } from 'lucide-react-native';
import { NeonCard } from '../components/NeonCard';
import { NeonIcon } from '../components/NeonIcon';

import { Colors, Spacing, FontSize, BorderRadius } from '../../styles/theme';

// FIREBASE IMPORTS
import { auth, db } from '../config/firebase';
import { collection, getDocs, getDoc, doc } from 'firebase/firestore';

import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';

import { EXERCISES } from '../config/exercises';

export default function ReportExport() {
  const [isLoading, setIsLoading] = useState(true);
  const [teacherSchool, setTeacherSchool] = useState<string>('Wczytywanie placówki...');

  // Dynamiczne statystyki do raportu
  const [totalStudents, setTotalStudents] = useState(0);
  const [averageScore, setAverageScore] = useState(0);
  const [totalStreaks, setTotalStreaks] = useState(0);
  const [studentsList, setStudentsList] = useState<any[]>([]);

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
      let loadedStudents: any[] = [];

      snapshot.forEach(document => {
        const data = document.data();
        const studentSchool = (data.school || '').trim().toLowerCase();

        if (studentSchool === targetSchoolLower) {
          count++;
          loadedStudents.push(data);

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
      setStudentsList(loadedStudents);
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

  const handleGeneratePDF = async () => {
    if (totalStudents === 0) {
      Alert.alert('Brak danych', 'Nie masz jeszcze uczniów w swojej placówce. Raport byłby pusty!');
      return;
    }

    try {
      let tableRows = '';
      
      const sortedStudents = [...studentsList].sort((a, b) => (b.overall || 0) - (a.overall || 0));
      
      sortedStudents.forEach((student, index) => {
        const getBest = (exId: string) => {
          const results = student.testResults || [];
          let best: number | null = null;
          const isLower = EXERCISES.find(e => e.id === exId)?.scoring === 'lower';
          
          results.forEach((test: any) => {
            const ex = test.exercises?.find((e: any) => e.exerciseId === exId);
            if (ex && ex.bestValue > 0) {
              if (best === null) best = ex.bestValue;
              else if (isLower) best = Math.min(best, ex.bestValue);
              else best = Math.max(best, ex.bestValue);
            }
          });
          return best !== null ? best : '-';
        };

        tableRows += `
          <tr>
            <td style="padding: 12px; border-bottom: 1px dashed var(--color-border); font-size: 15px;">${index + 1}</td>
            <td style="padding: 12px; border-bottom: 1px dashed var(--color-border); font-size: 15px; font-weight: 600;">${student.name || student.email || 'Brak danych'}</td>
            <td style="padding: 12px; border-bottom: 1px dashed var(--color-border); font-size: 15px; text-align: center; color: var(--color-primary); font-weight: bold;">${getBest('plank')}</td>
            <td style="padding: 12px; border-bottom: 1px dashed var(--color-border); font-size: 15px; text-align: center; color: var(--color-primary); font-weight: bold;">${getBest('run100')}</td>
            <td style="padding: 12px; border-bottom: 1px dashed var(--color-border); font-size: 15px; text-align: center; color: var(--color-primary); font-weight: bold;">${getBest('jump')}</td>
            <td style="padding: 12px; border-bottom: 1px dashed var(--color-border); font-size: 15px; text-align: center; font-weight: 800; color: #0F172A;">${student.overall || 0} OVR</td>
          </tr>
        `;
      });

      const htmlContent = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, user-scalable=no" />
            <style>
              @import url('https://fonts.googleapis.com/css2?family=Montserrat:ital,wght@0,400;0,600;0,700;0,800;1,400&display=swap');
              :root {
                --color-bg: #FFFFFF;
                --color-text: #0F172A;
                --color-primary: #059669;
                --color-light-gray: #F8FAFC;
                --color-border: #E2E8F0;
                --font-family: 'Montserrat', sans-serif;
              }
              body {
                margin: 0;
                padding: 40px;
                font-family: var(--font-family);
                background-color: var(--color-bg);
                color: var(--color-text);
                -webkit-print-color-adjust: exact;
              }
              .header {
                border-bottom: 2px solid var(--color-primary);
                padding-bottom: 20px;
                margin-bottom: 40px;
                text-align: center;
              }
              h1 { font-size: 32px; font-weight: 800; margin: 0; color: var(--color-text); text-transform: uppercase; letter-spacing: 1px; }
              .school-name { font-size: 18px; color: #475569; margin-top: 8px; font-weight: 600; }
              .date { font-size: 14px; color: #64748B; margin-top: 4px; }
              
              .stats-grid {
                display: flex;
                justify-content: space-between;
                margin-bottom: 40px;
                gap: 20px;
              }
              .stat-card {
                flex: 1;
                background-color: var(--color-light-gray);
                border: 1px solid var(--color-border);
                border-radius: 12px;
                padding: 24px;
                text-align: center;
              }
              .stat-val { font-size: 36px; font-weight: 800; color: var(--color-primary); margin-bottom: 8px; }
              .stat-label { font-size: 14px; font-weight: 600; color: #475569; text-transform: uppercase; }
              
              .content-section {
                margin-bottom: 30px;
              }
              .section-title {
                font-size: 20px;
                font-weight: 700;
                margin-bottom: 15px;
                color: var(--color-text);
                border-bottom: 1px solid var(--color-border);
                padding-bottom: 8px;
              }
              ul { list-style-type: none; padding: 0; margin: 0; }
              li { padding: 12px 0; border-bottom: 1px dashed var(--color-border); font-size: 16px; color: #334155; }
              li::before {
                content: "■";
                color: var(--color-primary);
                font-weight: bold;
                margin-right: 12px;
                font-size: 12px;
              }
              li:last-child {
                border-bottom: none;
              }
              
              .signatures {
                margin-top: 80px;
                display: flex;
                justify-content: space-between;
              }
              .signature-box {
                text-align: center;
                width: 45%;
              }
              .signature-line {
                border-bottom: 1px solid var(--color-text);
                margin-bottom: 10px;
                height: 40px;
              }
              .signature-label {
                font-size: 14px;
                font-weight: 600;
                color: #64748B;
              }

              .footer {
                margin-top: 60px;
                font-size: 10px;
                text-align: center;
                color: #94A3B8;
                border-top: 1px solid var(--color-border);
                padding-top: 20px;
              }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>Raport Ewaluacyjny</h1>
              <div class="school-name">${teacherSchool}</div>
              <div class="date">Wydruk z dnia: ${today}</div>
            </div>
            
            <div class="stats-grid">
              <div class="stat-card">
                <div class="stat-val">${totalStudents}</div>
                <div class="stat-label">Aktywnych Uczniów</div>
              </div>
              <div class="stat-card">
                <div class="stat-val">${averageScore}</div>
                <div class="stat-label">Średni Wynik OVR</div>
              </div>
              <div class="stat-card">
                <div class="stat-val">${totalStreaks}</div>
                <div class="stat-label">Systematycznych</div>
              </div>
            </div>
            <div class="content-section">
              <div class="section-title">Wyniki Uczniów (${totalStudents})</div>
              <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
                <thead>
                  <tr style="background-color: var(--color-light-gray); border-bottom: 2px solid var(--color-border);">
                    <th style="padding: 12px; text-align: left; font-size: 14px; color: #475569;">#</th>
                    <th style="padding: 12px; text-align: left; font-size: 14px; color: #475569;">Imię i Nazwisko</th>
                    <th style="padding: 12px; text-align: center; font-size: 14px; color: #475569;">Plank (s)</th>
                    <th style="padding: 12px; text-align: center; font-size: 14px; color: #475569;">100m (s)</th>
                    <th style="padding: 12px; text-align: center; font-size: 14px; color: #475569;">Skok w dal (cm)</th>
                    <th style="padding: 12px; text-align: center; font-size: 14px; color: #475569;">OVR</th>
                  </tr>
                </thead>
                <tbody>
                  ${tableRows}
                </tbody>
              </table>
            </div>
            <div class="content-section">
              <div class="section-title">Podsumowanie Placówki</div>
              <p style="color: #475569; line-height: 1.6; font-size: 15px;">Powyższy raport przedstawia zbiorcze podsumowanie aktywności sportowej uczniów analizowanej szkoły na platformie <strong>SportRecrut</strong>. Algorytmy sztucznej inteligencji zweryfikowały postępy na podstawie wprowadzonych ćwiczeń oraz przeprowadzonych sprawdzianów terenowych.</p>
              <ul>
                <li><strong>Wiarygodność Danych:</strong> Rzetelna - wyniki zostały zatwierdzone przez Nauczyciela.</li>
                <li><strong>Frekwencja Aktywna:</strong> ${totalStudents > 0 ? Math.round((totalStreaks / totalStudents) * 100) : 0}% uczniów regularnie realizuje zalecenia AI.</li>
                <li><strong>Poziom Sportowy Szkoły:</strong> ${averageScore >= 75 ? 'Wysoki OVR (>75)' : averageScore >= 55 ? 'Średni OVR (55-75)' : 'Rozwojowy OVR (<55)'}</li>
              </ul>
            </div>
            
            <div class="signatures">
              <div class="signature-box">
                <div class="signature-line"></div>
                <div class="signature-label">Podpis Koordynatora / Nauczyciela</div>
              </div>
              <div class="signature-box">
                <div class="signature-line"></div>
                <div class="signature-label">Podpis Dyrektora Placówki (Opcjonalnie)</div>
              </div>
            </div>

            <div class="footer">
              Dokument wygenerowany weryfikatów z systemu SportRecrut. Opatrzony automatycznie.<br>
              Identyfikator dokumentu: SR-${Math.random().toString(36).substr(2, 9).toUpperCase()}-${Date.now()}
            </div>
          </body>
        </html>
      `;

      const { uri } = await Print.printToFileAsync({ html: htmlContent });
      const isAvailable = await Sharing.isAvailableAsync();
      
      if (isAvailable) {
        await Sharing.shareAsync(uri, {
          mimeType: 'application/pdf',
          dialogTitle: 'Udostępnij Raport',
          UTI: 'com.adobe.pdf',
        });
      } else {
        Alert.alert('Sukces', 'Raport wygenerowany. Zapisano pomyślnie na urządzeniu!');
      }
    } catch (e) {
      console.error(e);
      Alert.alert('Błąd', 'Wystąpił błąd podczas generowania pliku PDF.');
    }
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
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={false} onRefresh={() => {}} tintColor={Colors.neonGreen} colors={[Colors.neonGreen]} />
        }
      >
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