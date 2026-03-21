import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Download, Send, FileText, CheckCircle } from 'lucide-react-native';
import { NeonCard } from '../components/NeonCard';
import { NeonIcon } from '../components/NeonIcon';

import { Colors, Spacing, FontSize, BorderRadius } from '../../styles/theme';

export default function ReportExport() {
  const reportItems = [
    'Zestawienie 24 uczniów',
    'Wykresy postępów',
    'Skład kadry',
    'Rekomendacje',
  ];

  const handleGeneratePDF = () => {
    Alert.alert('Sukces', 'Raport PDF wygenerowany! 📄\nPobieranie rozpoczęte');
  };

  const handleSendToMinistry = () => {
    Alert.alert('Sukces', 'Raport wysłany do Ministerstwa Sportu! ✅\nPotwierdzenie otrzymasz na email');
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View style={styles.innerPadding}>
          <Text style={styles.screenTitle}>📋 Raport Klasy 6A</Text>

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
                    <Text style={styles.previewTitle}>Raport Sportowy - Klasa 6A</Text>
                    <Text style={styles.previewSub}>
                      Szkoła Podstawowa nr 3, Nowy Sącz
                    </Text>

                    {/* Mini stats */}
                    <View style={styles.previewStats}>
                      <View style={styles.previewStat}>
                        <Text style={styles.previewStatValueGreen}>24</Text>
                        <Text style={styles.previewStatLabel}>Uczniów</Text>
                      </View>
                      <View style={styles.previewStat}>
                        <Text style={styles.previewStatValueGold}>85</Text>
                        <Text style={styles.previewStatLabel}>Średnia</Text>
                      </View>
                      <View style={styles.previewStat}>
                        <Text style={styles.previewStatValueOrange}>21</Text>
                        <Text style={styles.previewStatLabel}>Streaki</Text>
                      </View>
                    </View>
                  </View>
                </View>

                <Text style={styles.previewCaption}>Podgląd raportu PDF</Text>
              </View>
            </NeonCard>
          </View>

          {/* Report Contents */}
          <View style={styles.sectionSpacing}>
            <NeonCard>
              <Text style={styles.contentsTitle}>Zawartość raportu:</Text>
              <View style={styles.contentsList}>
                {reportItems.map((item) => (
                  <View key={item} style={styles.contentsItem}>
                    <NeonIcon Icon={CheckCircle} size={16} color={Colors.neonGreen} glow={false} />
                    <Text style={styles.contentsItemText}>✅ {item}</Text>
                  </View>
                ))}
              </View>
            </NeonCard>
          </View>

          {/* Action Buttons */}
          <View style={styles.buttonsContainer}>
            <TouchableOpacity
              style={styles.primaryButton}
              activeOpacity={0.8}
              onPress={handleGeneratePDF}
            >
              <Download size={20} color={Colors.bgDeep} />
              <Text style={styles.primaryButtonText}>📄 Generuj PDF i pobierz</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.secondaryButton}
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
                <Text style={styles.lastReportLabel}>Ostatni raport:</Text>
                <Text style={styles.lastReportDate}>15 marca 2025</Text>
              </View>
            </NeonCard>
          </View>

          {/* Stats Summary */}
          <View style={styles.summaryGrid}>
            <View style={styles.summaryItem}>
              <NeonCard>
                <View style={styles.summaryContent}>
                  <Text style={styles.summaryValueGreen}>24</Text>
                  <Text style={styles.summaryLabel}>Uczniów</Text>
                </View>
              </NeonCard>
            </View>
            <View style={styles.summaryItem}>
              <NeonCard>
                <View style={styles.summaryContent}>
                  <Text style={styles.summaryValueGold}>85</Text>
                  <Text style={styles.summaryLabel}>Średnia</Text>
                </View>
              </NeonCard>
            </View>
            <View style={styles.summaryItem}>
              <NeonCard>
                <View style={styles.summaryContent}>
                  <Text style={styles.summaryValueOrange}>8</Text>
                  <Text style={styles.summaryLabel}>W kadrze</Text>
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
  container: {
    flex: 1,
    backgroundColor: Colors.bgDeep,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 80,
  },
  innerPadding: {
    padding: Spacing.xl,
    paddingTop: 60,
  },
  screenTitle: {
    color: Colors.white,
    fontSize: FontSize['2xl'],
    fontWeight: '800',
    marginBottom: Spacing.xl,
  },
  sectionSpacing: {
    marginBottom: Spacing.xl,
  },
  previewContainer: {
    gap: Spacing.lg,
  },
  previewBox: {
    width: '100%',
    height: 260,
    borderRadius: BorderRadius.sm,
    borderWidth: 2,
    borderColor: 'rgba(0, 230, 118, 0.3)',
    padding: Spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    backgroundColor: Colors.cardBg,
    shadowColor: Colors.neonGreen,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 15,
    elevation: 6,
  },
  previewLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: Colors.neonGreen,
    opacity: 0.05,
    marginBottom: Spacing.lg,
  },
  previewContent: {
    alignItems: 'center',
    zIndex: 10,
  },
  previewTitle: {
    color: Colors.white,
    fontSize: FontSize.sm,
    fontWeight: '700',
    marginTop: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  previewSub: {
    color: Colors.gray,
    fontSize: FontSize.xs,
    marginBottom: Spacing.md,
  },
  previewStats: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: Spacing.lg,
  },
  previewStat: {
    backgroundColor: Colors.bgDeep,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.sm,
    borderRadius: 4,
    alignItems: 'center',
  },
  previewStatValueGreen: {
    color: Colors.neonGreen,
    fontSize: FontSize.lg,
    fontWeight: '800',
  },
  previewStatValueGold: {
    color: Colors.gold,
    fontSize: FontSize.lg,
    fontWeight: '800',
  },
  previewStatValueOrange: {
    color: Colors.orange,
    fontSize: FontSize.lg,
    fontWeight: '800',
  },
  previewStatLabel: {
    color: Colors.gray,
    fontSize: 10,
  },
  previewCaption: {
    color: Colors.gray,
    fontSize: FontSize.sm,
    textAlign: 'center',
  },
  contentsTitle: {
    color: Colors.white,
    fontSize: FontSize.sm,
    fontWeight: '700',
    marginBottom: Spacing.md,
  },
  contentsList: {
    gap: Spacing.sm,
  },
  contentsItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  contentsItemText: {
    color: Colors.white,
    fontSize: FontSize.sm,
  },
  buttonsContainer: {
    gap: Spacing.md,
    marginBottom: Spacing.xl,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    width: '100%',
    paddingVertical: Spacing.lg,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.neonGreen,
    shadowColor: Colors.neonGreen,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 6,
  },
  primaryButtonText: {
    color: Colors.bgDeep,
    fontWeight: '700',
    fontSize: FontSize.base,
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    width: '100%',
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.cardBg,
    borderWidth: 1,
    borderColor: 'rgba(0, 230, 118, 0.2)',
  },
  secondaryButtonText: {
    color: Colors.gray,
    fontSize: FontSize.base,
  },
  lastReportContent: {
    alignItems: 'center',
    paddingVertical: Spacing.sm,
  },
  lastReportLabel: {
    color: Colors.gray,
    fontSize: FontSize.xs,
    marginBottom: 4,
  },
  lastReportDate: {
    color: Colors.white,
    fontSize: FontSize.sm,
    fontWeight: '600',
  },
  summaryGrid: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  summaryItem: {
    flex: 1,
  },
  summaryContent: {
    alignItems: 'center',
    paddingVertical: Spacing.md,
  },
  summaryValueGreen: {
    color: Colors.neonGreen,
    fontSize: FontSize['2xl'],
    fontWeight: '800',
    marginBottom: 4,
  },
  summaryValueGold: {
    color: Colors.gold,
    fontSize: FontSize['2xl'],
    fontWeight: '800',
    marginBottom: 4,
  },
  summaryValueOrange: {
    color: Colors.orange,
    fontSize: FontSize['2xl'],
    fontWeight: '800',
    marginBottom: 4,
  },
  summaryLabel: {
    color: Colors.gray,
    fontSize: FontSize.xs,
  },
});
