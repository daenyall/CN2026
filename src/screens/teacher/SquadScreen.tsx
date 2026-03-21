import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import Animated, { FadeInDown, ZoomIn } from 'react-native-reanimated';
import { Award, Zap, Send, Star } from 'lucide-react-native';
import { NeonCard } from '../../components/NeonCard';
import { NeonIcon } from '../../components/NeonIcon';
import Svg, { Defs, LinearGradient, Stop, Rect } from 'react-native-svg';

export default function SquadScreen() {
  const [invited, setInvited] = useState<number[]>([]);

  const talents = [
    { id: 1, name: "Anna Nowak", class: "6B", score: 92, attribute: "Szybkość", anomaly: "+15%" },
    { id: 2, name: "Jakub Kowalski", class: "6A", score: 87, attribute: "Skoczność", anomaly: "+12%" },
    { id: 3, name: "Zofia Lewandowska", class: "6C", score: 85, attribute: "Wytrzymałość", anomaly: "+8%" },
  ];

  const handleInvite = (id: number) => {
    setInvited(prev => [...prev, id]);
    Alert.alert("Sukces", "Zaproszenie wysłane!");
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scroll}>
      <Animated.View entering={FadeInDown} style={styles.header}>
        <View style={styles.headerTitleRow}>
          <Text style={styles.headerEmoji}>🏅</Text>
          <Text style={styles.headerTitle}>Kadra Szkoły</Text>
        </View>
        <Text style={styles.headerSubtitle}>
          System wykrył 3 uczniów o wyjątkowych predyspozycjach w tym miesiącu.
        </Text>
      </Animated.View>

      <View style={styles.list}>
        {talents.map((talent, index) => {
          const isInvited = invited.includes(talent.id);

          return (
            <Animated.View key={talent.id} entering={FadeInDown.delay(100 + index * 100)}>
              <NeonCard glow={!isInvited}>
                <View style={styles.cardContent}>
                  <View style={styles.cardHeader}>
                    <View style={styles.avatarRow}>
                      <View style={styles.avatar}>
                        <Text style={styles.avatarEmoji}>👤</Text>
                      </View>
                      <View>
                        <Text style={styles.name}>{talent.name}</Text>
                        <Text style={styles.classInfo}>Klasa {talent.class} • Wynik: {talent.score}</Text>
                      </View>
                    </View>
                    {!isInvited && (
                      <Animated.View entering={ZoomIn.delay(300 + index * 100)}>
                        <Star size={24} color="#FFD700" fill="#FFD700" />
                      </Animated.View>
                    )}
                  </View>

                  <View style={styles.statsRow}>
                    <View style={styles.statBox}>
                      <Text style={styles.statLabel}>Główny atut</Text>
                      <View style={styles.statValueRow}>
                        <Zap size={16} color="#00E676" />
                        <Text style={styles.statValueGreen}>{talent.attribute}</Text>
                      </View>
                    </View>
                    <View style={styles.statBox}>
                      <Text style={styles.statLabel}>Anomalia testu</Text>
                      <Text style={styles.statValueOrange}>{talent.anomaly} pow. średniej</Text>
                    </View>
                  </View>

                  <TouchableOpacity
                    style={[styles.actionBtn, isInvited && styles.actionBtnSent]}
                    onPress={() => !isInvited && handleInvite(talent.id)}
                    activeOpacity={0.8}
                    disabled={isInvited}
                  >
                    {!isInvited && (
                      <View style={StyleSheet.absoluteFill}>
                        <Svg height="100%" width="100%">
                          <Defs>
                            <LinearGradient id={`btnGrad-${talent.id}`} x1="0" y1="0" x2="1" y2="0">
                              <Stop offset="0" stopColor="#00E676" />
                              <Stop offset="1" stopColor="#00A854" />
                            </LinearGradient>
                          </Defs>
                          <Rect width="100%" height="100%" fill={`url(#btnGrad-${talent.id})`} rx="8" />
                        </Svg>
                      </View>
                    )}
                    
                    {isInvited ? (
                      <Animated.View entering={ZoomIn} style={styles.btnContentRow}>
                        <Award size={18} color="#00E676" />
                        <Text style={styles.btnTextSent}>Zaproszono do Kadry</Text>
                      </Animated.View>
                    ) : (
                      <View style={styles.btnContentRow}>
                        <Send size={18} color="#0A0E1A" />
                        <Text style={styles.btnTextUnsent}>Zaproś do Reprezentacji</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                </View>
              </NeonCard>
            </Animated.View>
          );
        })}
      </View>
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
  list: {
    gap: 16,
  },
  cardContent: {
    gap: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  avatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#1E2A3A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarEmoji: {
    fontSize: 24,
  },
  name: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  classInfo: {
    color: '#8899AA',
    fontSize: 12,
  },
  statsRow: {
    flexDirection: 'row',
    backgroundColor: '#0A0E1A',
    borderRadius: 8,
    padding: 12,
    gap: 12,
  },
  statBox: {
    flex: 1,
  },
  statLabel: {
    color: '#8899AA',
    fontSize: 12,
    marginBottom: 4,
  },
  statValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statValueGreen: {
    color: '#00E676',
    fontWeight: '700',
    fontSize: 14,
  },
  statValueOrange: {
    color: '#FF6D00',
    fontWeight: '700',
    fontSize: 14,
  },
  actionBtn: {
    height: 48,
    borderRadius: 8,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionBtnSent: {
    backgroundColor: 'rgba(0, 230, 118, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(0, 230, 118, 0.3)',
  },
  btnContentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    zIndex: 2,
  },
  btnTextUnsent: {
    color: '#0A0E1A',
    fontWeight: '700',
    fontSize: 14,
  },
  btnTextSent: {
    color: '#00E676',
    fontWeight: '700',
    fontSize: 14,
  }
});
