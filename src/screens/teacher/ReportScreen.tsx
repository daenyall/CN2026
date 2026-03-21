import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import Animated, { FadeInDown, ZoomIn, useSharedValue, useAnimatedStyle, withRepeat, withSequence, withTiming } from 'react-native-reanimated';
import { FileDown, Share2, CheckCircle, AlertTriangle, FileText } from 'lucide-react-native';
import { NeonCard } from '../../components/NeonCard';
import { NeonIcon } from '../../components/NeonIcon';
import Svg, { Defs, LinearGradient, Stop, Rect } from 'react-native-svg';

export default function ReportScreen() {
  const [isExporting, setIsExporting] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);

  const classes = [
    { name: "6A", status: "ready", students: 24, tested: 24 },
    { name: "6B", status: "warning", students: 23, tested: 18 },
    { name: "6C", status: "ready", students: 21, tested: 21 },
  ];

  const handleExport = () => {
    setIsExporting(true);
    
    setTimeout(() => {
      setIsExporting(false);
      setExportSuccess(true);
      Alert.alert("Sukces", "Raport został wygenerowany pomyślnie.");
      
      setTimeout(() => {
        setExportSuccess(false);
      }, 3000);
    }, 2000);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scroll}>
      <Animated.View entering={FadeInDown} style={styles.header}>
        <View style={styles.headerTitleRow}>
          <Text style={styles.headerEmoji}>📊</Text>
          <Text style={styles.headerTitle}>Raporty dla Ministerstwa</Text>
        </View>
        <Text style={styles.headerSubtitle}>
          Wygeneruj zestawienie wyników testów talentów spełniające wymogi Ministerstwa Sportu.
        </Text>
      </Animated.View>

      <View style={styles.statusCards}>
        <Animated.View entering={FadeInDown.delay(100)}>
          <NeonCard glow={true}>
             <View style={styles.summaryContent}>
                <View style={styles.summaryIconBox}>
                  <NeonIcon Icon={FileText} size={32} color="#00E676" glow={true} />
                </View>
                <View style={styles.summaryTextGroup}>
                  <Text style={styles.summaryTitle}>Gotowość szkoły</Text>
                  <Text style={styles.summaryDesc}>92% uczniów przetestowanych. Możesz wyeksportować raport częściowy.</Text>
                </View>
             </View>
          </NeonCard>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(200)}>
          <NeonCard>
            <View style={styles.warningContent}>
              <AlertTriangle size={24} color="#FF6D00" />
              <View style={styles.warningInfo}>
                <Text style={styles.warningTitle}>Brakuje 5 wyników</Text>
                <Text style={styles.warningDesc}>Klasa 6B ma zaległości. Rekomendujemy uzupełnienie przed wysyłką pełnego raportu.</Text>
              </View>
            </View>
          </NeonCard>
        </Animated.View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Status Klas</Text>
        <View style={styles.classesList}>
          {classes.map((cls, index) => (
            <Animated.View key={cls.name} entering={FadeInDown.delay(300 + index * 100)}>
              <NeonCard>
                <View style={styles.classRow}>
                  <View style={styles.classInfo}>
                    <Text style={styles.className}>Klasa {cls.name}</Text>
                    <Text style={styles.classStats}>{cls.tested}/{cls.students} przetestowanych</Text>
                  </View>
                  <View>
                    {cls.status === "ready" ? (
                      <View style={styles.statusBadgeReady}>
                        <CheckCircle size={14} color="#00E676" />
                        <Text style={styles.statusBadgeTextReady}>Gotowa</Text>
                      </View>
                    ) : (
                      <View style={styles.statusBadgeWarning}>
                        <AlertTriangle size={14} color="#FF6D00" />
                        <Text style={styles.statusBadgeTextWarning}>Braki ({cls.students - cls.tested})</Text>
                      </View>
                    )}
                  </View>
                </View>
              </NeonCard>
            </Animated.View>
          ))}
        </View>
      </View>

      <Animated.View entering={FadeInDown.delay(700)} style={styles.section}>
        <View style={styles.exportCardContainer}>
          <NeonCard glow={exportSuccess}>
            <View style={styles.exportContent}>
              <View style={styles.exportHeader}>
                <NeonIcon Icon={FileDown} size={32} color="#0A0E1A" glow={false} />
                <View style={styles.exportTexts}>
                  <Text style={styles.exportTitle}>Eksport XLSM</Text>
                  <Text style={styles.exportDesc}>Format zgodny wymogami ministerialnymi</Text>
                </View>
              </View>

              {exportSuccess ? (
                <View style={styles.successBox}>
                  <CheckCircle size={24} color="#00E676" />
                  <Text style={styles.successText}>Raport wygenerowano pomyślnie!</Text>
                </View>
              ) : (
                <View style={styles.exportActions}>
                  <TouchableOpacity
                    style={[styles.primaryBtn, isExporting && styles.primaryBtnDisabled]}
                    onPress={handleExport}
                    disabled={isExporting}
                    activeOpacity={0.8}
                  >
                    {!isExporting && (
                      <View style={StyleSheet.absoluteFill}>
                        <Svg height="100%" width="100%">
                          <Defs>
                            <LinearGradient id="btnGrad" x1="0" y1="0" x2="1" y2="0">
                              <Stop offset="0" stopColor="#00E676" />
                              <Stop offset="1" stopColor="#00A854" />
                            </LinearGradient>
                          </Defs>
                          <Rect width="100%" height="100%" fill="url(#btnGrad)" rx="24" />
                        </Svg>
                      </View>
                    )}
                    <View style={styles.btnRow}>
                      {isExporting ? (
                        <Text style={styles.btnTextDisabled}>Tworzenie pliku...</Text>
                      ) : (
                        <>
                          <FileDown size={20} color="#0A0E1A" />
                          <Text style={styles.btnTextPrimary}>Generuj i Pobierz XLSM</Text>
                        </>
                      )}
                    </View>
                  </TouchableOpacity>

                  <TouchableOpacity style={styles.secondaryBtn} activeOpacity={0.8}>
                    <Share2 size={20} color="#8899AA" />
                    <Text style={styles.btnTextSecondary}>Zapisz dysku szkolnym</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </NeonCard>
        </View>
      </Animated.View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0E1A',
  },
  scroll: {
    padding: 24,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 24,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  headerEmoji: {
    fontSize: 24,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '800',
  },
  headerSubtitle: {
    color: '#8899AA',
    fontSize: 14,
    lineHeight: 20,
  },
  statusCards: {
    gap: 16,
    marginBottom: 32,
  },
  summaryContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  summaryIconBox: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(0, 230, 118, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  summaryTextGroup: {
    flex: 1,
  },
  summaryTitle: {
    color: '#00E676',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  summaryDesc: {
    color: '#8899AA',
    fontSize: 14,
  },
  warningContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  warningInfo: {
    flex: 1,
  },
  warningTitle: {
    color: '#FF6D00',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  warningDesc: {
    color: '#8899AA',
    fontSize: 14,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
  },
  classesList: {
    gap: 12,
  },
  classRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  classInfo: {
    flex: 1,
  },
  className: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  classStats: {
    color: '#8899AA',
    fontSize: 12,
  },
  statusBadgeReady: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(0, 230, 118, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusBadgeTextReady: {
    color: '#00E676',
    fontSize: 12,
    fontWeight: '600',
  },
  statusBadgeWarning: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255, 109, 0, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusBadgeTextWarning: {
    color: '#FF6D00',
    fontSize: 12,
    fontWeight: '600',
  },
  exportCardContainer: {
    marginBottom: 16,
  },
  exportContent: {
    gap: 20,
  },
  exportHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  exportTexts: {
    flex: 1,
  },
  exportTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  exportDesc: {
    color: '#8899AA',
    fontSize: 14,
  },
  exportActions: {
    gap: 12,
  },
  primaryBtn: {
    height: 48,
    borderRadius: 24,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryBtnDisabled: {
    backgroundColor: '#1E2A3A',
  },
  btnRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    zIndex: 2,
  },
  btnTextPrimary: {
    color: '#0A0E1A',
    fontWeight: '700',
    fontSize: 16,
  },
  btnTextDisabled: {
    color: '#8899AA',
    fontWeight: '700',
    fontSize: 16,
  },
  secondaryBtn: {
    height: 48,
    borderRadius: 24,
    backgroundColor: '#0A0E1A',
    borderColor: 'rgba(136, 153, 170, 0.3)',
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  btnTextSecondary: {
    color: '#8899AA',
    fontWeight: '600',
    fontSize: 16,
  },
  successBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 108,
    backgroundColor: 'rgba(0, 230, 118, 0.1)',
    borderRadius: 12,
  },
  successText: {
    color: '#00E676',
    fontWeight: '700',
    fontSize: 16,
  }
});
