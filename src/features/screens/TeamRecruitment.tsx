import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { X, Check, Award } from 'lucide-react-native';
import { NeonCard } from '../components/NeonCard';
import { NeonIcon } from '../components/NeonIcon';

import { Colors, Spacing, FontSize, BorderRadius } from '../../styles/theme';

export default function TeamRecruitment() {
  const [teamMembers, setTeamMembers] = useState([
    { id: 1, name: 'Jakub Kowalski', score: 87 },
    { id: 2, name: 'Anna Nowak', score: 89 },
    { id: 3, name: 'Kacper Zieliński', score: 88 },
  ]);

  const [suggested, setSuggested] = useState([
    { id: 4, name: 'Michał Wiśniewski', score: 85 },
    { id: 5, name: 'Maja Piotrowska', score: 86 },
    { id: 6, name: 'Zofia Lewandowska', score: 82 },
    { id: 7, name: 'Adam Kowalczyk', score: 81 },
    { id: 8, name: 'Oliwia Szymańska', score: 83 },
  ]);

  const removeFromTeam = (id: number) => {
    const member = teamMembers.find((m) => m.id === id);
    if (member) {
      setTeamMembers(teamMembers.filter((m) => m.id !== id));
      Alert.alert('Usunięto', `${member.name} usunięty z kadry`);
    }
  };

  const addToTeam = (id: number) => {
    const student = suggested.find((s) => s.id === id);
    if (student) {
      setTeamMembers([...teamMembers, student]);
      setSuggested(suggested.filter((s) => s.id !== id));
      Alert.alert('Dodano', `${student.name} dodany do kadry! 🎉`);
    }
  };

  const skipStudent = (id: number) => {
    setSuggested(suggested.filter((s) => s.id !== id));
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View style={styles.innerPadding}>
          <Text style={styles.screenTitle}>🏅 Kadra Szkolna</Text>

          {/* Current Team */}
          <View style={styles.sectionSpacing}>
            <Text style={styles.sectionTitle}>Aktualna Kadra</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.teamRow}>
                {teamMembers.map((member) => (
                  <View key={member.id}>
                    <NeonCard glow>
                      <View style={styles.teamCard}>
                        {/* Remove Button */}
                        <TouchableOpacity
                          style={styles.removeButton}
                          onPress={() => removeFromTeam(member.id)}
                          activeOpacity={0.7}
                        >
                          <X size={14} color={Colors.white} />
                        </TouchableOpacity>

                        {/* Avatar */}
                        <View style={styles.teamAvatar}>
                          <Text style={{ fontSize: 24 }}>👤</Text>
                        </View>

                        {/* Name */}
                        <Text style={styles.teamName} numberOfLines={1}>
                          {member.name.split(' ')[0]}
                        </Text>

                        {/* Score */}
                        <View style={styles.teamScore}>
                          <Text style={styles.teamScoreText}>{member.score}</Text>
                        </View>
                      </View>
                    </NeonCard>
                  </View>
                ))}

                {/* Add placeholder */}
                {teamMembers.length < 5 && (
                  <View style={styles.addPlaceholder}>
                    <Award size={24} color={Colors.gray} />
                    <Text style={styles.addPlaceholderText}>Dodaj ucznia</Text>
                  </View>
                )}
              </View>
            </ScrollView>
          </View>

          {/* Suggested Students */}
          <View>
            <View style={styles.suggestedHeader}>
              <Text style={styles.sectionTitle}>Sugerowani przez system</Text>
              <Text style={styles.suggestedSub}>
                Na podstawie wyników z ostatnich 30 dni
              </Text>
            </View>

            <View style={styles.suggestedList}>
              {suggested.map((student) => (
                <NeonCard key={student.id}>
                  <View style={styles.suggestedRow}>
                    {/* Avatar */}
                    <View style={styles.suggestedAvatar}>
                      <Text style={{ fontSize: 18 }}>👤</Text>
                    </View>

                    {/* Info */}
                    <View style={styles.suggestedInfo}>
                      <Text style={styles.suggestedName} numberOfLines={1}>
                        {student.name}
                      </Text>
                      <Text style={styles.suggestedMeta}>
                        Wynik z ostatnich 30 dni
                      </Text>
                    </View>

                    {/* Score */}
                    <View style={styles.suggestedScore}>
                      <Text style={styles.suggestedScoreText}>{student.score}</Text>
                    </View>

                    {/* Actions */}
                    <View style={styles.actionButtons}>
                      <TouchableOpacity
                        style={styles.acceptButton}
                        onPress={() => addToTeam(student.id)}
                        activeOpacity={0.7}
                      >
                        <Check size={16} color={Colors.bgDeep} strokeWidth={3} />
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={styles.skipButton}
                        onPress={() => skipStudent(student.id)}
                        activeOpacity={0.7}
                      >
                        <X size={16} color={Colors.gray} strokeWidth={2} />
                      </TouchableOpacity>
                    </View>
                  </View>
                </NeonCard>
              ))}
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
  sectionTitle: {
    color: Colors.white,
    fontSize: FontSize.lg,
    fontWeight: '700',
    marginBottom: Spacing.md,
  },
  teamRow: {
    flexDirection: 'row',
    gap: Spacing.md,
    paddingBottom: Spacing.md,
  },
  teamCard: {
    width: 96,
    alignItems: 'center',
    paddingVertical: Spacing.md,
  },
  removeButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.red,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
    shadowColor: Colors.red,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 5,
    elevation: 4,
  },
  teamAvatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.neonGreen,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
    shadowColor: Colors.neonGreen,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 6,
  },
  teamName: {
    color: Colors.white,
    fontSize: FontSize.xs,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 4,
    width: 80,
  },
  teamScore: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.gold,
    shadowColor: Colors.gold,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 5,
    elevation: 4,
  },
  teamScoreText: {
    color: Colors.bgDeep,
    fontSize: FontSize.sm,
    fontWeight: '800',
  },
  addPlaceholder: {
    width: 96,
    borderRadius: BorderRadius.lg,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: 'rgba(0, 230, 118, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.xxl,
  },
  addPlaceholderText: {
    color: Colors.gray,
    fontSize: FontSize.xs,
    marginTop: 4,
  },
  suggestedHeader: {
    marginBottom: Spacing.md,
  },
  suggestedSub: {
    color: Colors.gray,
    fontSize: FontSize.xs,
  },
  suggestedList: {
    gap: Spacing.md,
  },
  suggestedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  suggestedAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.neonGreen,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.neonGreen,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  suggestedInfo: {
    flex: 1,
    minWidth: 0,
  },
  suggestedName: {
    color: Colors.white,
    fontWeight: '700',
    fontSize: FontSize.base,
  },
  suggestedMeta: {
    color: Colors.gray,
    fontSize: FontSize.xs,
  },
  suggestedScore: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.neonGreen,
    shadowColor: Colors.neonGreen,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 4,
  },
  suggestedScoreText: {
    color: Colors.bgDeep,
    fontWeight: '800',
    fontSize: FontSize.base,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  acceptButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.neonGreen,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.neonGreen,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 5,
    elevation: 4,
  },
  skipButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.cardBg,
    borderWidth: 1,
    borderColor: 'rgba(136, 153, 170, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
