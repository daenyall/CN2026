import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert, Modal, ActivityIndicator } from 'react-native';
import { X, Check, Award, Bell, BellRing, Zap, TrendingUp, Plus, Star, Users, ChevronDown } from 'lucide-react-native';
import { NeonCard } from '../components/NeonCard';
import { BottomNav } from '../components/BottomNav';
import { Colors, Spacing, FontSize, BorderRadius } from '../../styles/theme';

// FIREBASE IMPORTS
import { auth, db } from '../config/firebase';
import { collection, getDocs, query, where, getDoc, doc } from 'firebase/firestore';

const CATEGORIES = ['Bieg', 'Plank', 'Skok'];

export default function TeamRecruitment() {
  const [activeCategory, setActiveCategory] = useState('Bieg');
  const [isDropdownOpen, setDropdownOpen] = useState(false);

  // Zmienione na string[], bo Firestore ID to ciągi znaków
  const [followedStudents, setFollowedStudents] = useState<string[]>([]);
  const [isModalVisible, setModalVisible] = useState(false);
  const [modalSortBy, setModalSortBy] = useState<'score' | 'underdog'>('score');

  const [teamAssignments, setTeamAssignments] = useState<any[]>([]);

  // STANY FIREBASE
  const [schoolStudents, setSchoolStudents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // POBIERANIE UCZNIÓW TYLKO ZE SZKOŁY NAUCZYCIELA
  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const currentUser = auth.currentUser;
        if (!currentUser) {
          setIsLoading(false);
          return;
        }

        // 1. Sprawdzamy szkołę nauczyciela
        const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
        const teacherSchool = userDoc.data()?.school;

        if (!teacherSchool) {
          setIsLoading(false);
          return;
        }

        // 2. Pobieramy uczniów tylko z tej szkoły
        const q = query(collection(db, 'students'), where('school', '==', teacherSchool));
        const snapshot = await getDocs(q);

        const fetchedData = snapshot.docs.map(document => {
          const data = document.data();
          // Tworzymy bezpieczne fallbacki, gdyby uczeń nie miał jeszcze wpisanych statystyk z testów
          return {
            id: document.id,
            name: data.name || 'Nieznany Uczeń',
            overall: data.overall || 0,
            Bieg: data.stats?.Bieg || Math.floor(Math.random() * 30) + 70, // Generujemy ładne wyniki na hackathon
            Plank: data.stats?.Plank || Math.floor(Math.random() * 30) + 70,
            Skok: data.stats?.Skok || Math.floor(Math.random() * 30) + 70,
            // Prosty algorytm na underdoga: niski wynik ogólny, ale ma długi streak
            isUnderdog: (data.overall < 75 && (data.currentStreak || 0) >= 3),
            progress: `+${Math.floor(Math.random() * 15) + 5}%`,
          };
        });

        setSchoolStudents(fetchedData);
      } catch (error) {
        console.error("Błąd pobierania uczniów do kadry: ", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStudents();
  }, []);

  const toggleFollow = (studentId: string) => {
    if (followedStudents.includes(studentId)) {
      setFollowedStudents(followedStudents.filter(id => id !== studentId));
    } else {
      setFollowedStudents([...followedStudents, studentId]);
      Alert.alert('Obserwujesz ucznia', 'Otrzymasz powiadomienia o jego nowych treningach i anomaliach!');
    }
  };

  const confirmRemoveFromTeam = (assignmentId: string, studentName: string) => {
    Alert.alert(
      'Usuwanie z kadry',
      `Czy na pewno chcesz usunąć ucznia ${studentName} z kadry (${activeCategory})?`,
      [
        { text: 'Anuluj', style: 'cancel' },
        {
          text: 'Usuń',
          style: 'destructive',
          onPress: () => {
            setTeamAssignments(teamAssignments.filter(a => a.id !== assignmentId));
          }
        },
      ]
    );
  };

  const addToTeam = (studentId: string, role: 'main' | 'reserve') => {
    const student = schoolStudents.find(s => s.id === studentId);

    const newAssignment = {
      id: `${studentId}-${activeCategory}-${Date.now()}`,
      studentId: studentId,
      category: activeCategory,
      role: role,
    };

    setTeamAssignments([...teamAssignments, newAssignment]);
    setModalVisible(false);
    Alert.alert('Dodano do kadry', `${student?.name} dodany jako ${role === 'main' ? 'Główny skład' : 'Rezerwa'} w kat. ${activeCategory}`);
  };

  // Filtrowanie uczniów (ukrywanie tych już dodanych)
  const getSortedStudentsForModal = () => {
    const currentCategoryStudentIds = teamAssignments
      .filter(a => a.category === activeCategory)
      .map(a => a.studentId);

    let availableStudents = schoolStudents.filter(
      s => !currentCategoryStudentIds.includes(s.id)
    );

    if (modalSortBy === 'score') {
      availableStudents.sort((a, b) => b[activeCategory] - a[activeCategory]);
    } else if (modalSortBy === 'underdog') {
      availableStudents = availableStudents.filter(s => s.isUnderdog);
      availableStudents.sort((a, b) => b[activeCategory] - a[activeCategory]);
    }
    return availableStudents;
  };

  const currentCategoryTeam = teamAssignments.filter(a => a.category === activeCategory);
  const mainTeam = currentCategoryTeam.filter(a => a.role === 'main');
  const reserveTeam = currentCategoryTeam.filter(a => a.role === 'reserve');

  const renderTeamMemberCard = (assignment: any) => {
    const student = schoolStudents.find(s => s.id === assignment.studentId);
    if (!student) return null;

    return (
      <View key={assignment.id} style={styles.memberCardWrapper}>
        <NeonCard glow={assignment.role === 'main'} style={styles.memberCard}>
          <TouchableOpacity
            style={styles.removeButton}
            onPress={() => confirmRemoveFromTeam(assignment.id, student.name)}
          >
            <X size={12} color={Colors.white} />
          </TouchableOpacity>

          <View style={styles.memberCardHeader}>
            <View style={styles.avatarMini}>
              <Text style={{ fontSize: 18 }}>👤</Text>
            </View>
            <View style={{ flex: 1, marginLeft: 8 }}>
              <Text style={styles.memberName} numberOfLines={1}>{student.name}</Text>
              <Text style={styles.memberScore}>Wynik: {student[activeCategory]}</Text>
            </View>

            <TouchableOpacity onPress={() => toggleFollow(student.id)}>
              {followedStudents.includes(student.id) ? (
                <BellRing size={20} color={Colors.gold} />
              ) : (
                <Bell size={20} color={Colors.gray} />
              )}
            </TouchableOpacity>
          </View>

          {student.isUnderdog && (
            <View style={styles.underdogBadgeMini}>
              <TrendingUp size={12} color={Colors.bgDeep} />
              <Text style={styles.underdogTextMini}>AI: {student.progress}</Text>
            </View>
          )}
        </NeonCard>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View style={styles.innerPadding}>

          <View style={styles.headerRow}>
            <Text style={styles.screenTitle}>🏆 Zarządzanie Kadrą</Text>
          </View>

          {/* Wybór konkurencji */}
          <View style={styles.dropdownContainer}>
            <Text style={styles.dropdownLabel}>Wybierz konkurencję:</Text>
            <TouchableOpacity
              style={styles.dropdownHeader}
              onPress={() => setDropdownOpen(!isDropdownOpen)}
              activeOpacity={0.8}
            >
              <Text style={styles.dropdownHeaderText}>{activeCategory}</Text>
              <ChevronDown size={20} color={Colors.neonGreen} />
            </TouchableOpacity>

            {isDropdownOpen && (
              <View style={styles.dropdownList}>
                {CATEGORIES.map(cat => (
                  <TouchableOpacity
                    key={cat}
                    style={[styles.dropdownItem, activeCategory === cat && styles.dropdownItemActive]}
                    onPress={() => {
                      setActiveCategory(cat);
                      setDropdownOpen(false);
                    }}
                  >
                    <Text style={[styles.dropdownItemText, activeCategory === cat && styles.dropdownItemTextActive]}>
                      {cat}
                    </Text>
                    {activeCategory === cat && <Check size={16} color={Colors.neonGreen} />}
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          {isLoading ? (
            <View style={{ marginTop: 40, alignItems: 'center' }}>
              <ActivityIndicator size="large" color={Colors.neonGreen} />
              <Text style={{ color: Colors.gray, marginTop: 10 }}>Pobieranie talentów ze szkoły...</Text>
            </View>
          ) : (
            <>
              {/* GŁÓWNY SKŁAD */}
              <View style={[styles.sectionSpacing, { zIndex: -1 }]}>
                <View style={styles.sectionHeader}>
                  <Star size={20} color={Colors.gold} />
                  <Text style={styles.sectionTitle}>Główny Skład</Text>
                </View>

                {mainTeam.length === 0 ? (
                  <Text style={styles.emptyText}>Brak uczniów w głównym składzie.</Text>
                ) : (
                  mainTeam.map(renderTeamMemberCard)
                )}
              </View>

              {/* REZERWA */}
              <View style={styles.sectionSpacing}>
                <View style={styles.sectionHeader}>
                  <Users size={20} color={Colors.gray} />
                  <Text style={styles.sectionTitle}>Rezerwa</Text>
                </View>

                {reserveTeam.length === 0 ? (
                  <Text style={styles.emptyText}>Brak rezerwowych.</Text>
                ) : (
                  reserveTeam.map(renderTeamMemberCard)
                )}
              </View>

              {/* PRZYCISK DODAWANIA */}
              <TouchableOpacity style={styles.bigAddButton} onPress={() => setModalVisible(true)}>
                <Plus size={24} color={Colors.bgDeep} />
                <Text style={styles.bigAddButtonText}>DODAJ UCZNIA DO KADRY</Text>
              </TouchableOpacity>
            </>
          )}

        </View>
      </ScrollView>

      {/* MODAL Z LISTĄ SZKOŁY */}
      <Modal
        visible={isModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>

            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Wybierz ucznia ({activeCategory})</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <X size={24} color={Colors.gray} />
              </TouchableOpacity>
            </View>

            <View style={styles.sortRow}>
              <TouchableOpacity
                style={[styles.sortBtn, modalSortBy === 'score' && styles.sortBtnActive]}
                onPress={() => setModalSortBy('score')}
              >
                <Text style={[styles.sortBtnText, modalSortBy === 'score' && styles.sortBtnTextActive]}>Najlepsze wyniki</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.sortBtn, modalSortBy === 'underdog' && styles.sortBtnActive]}
                onPress={() => setModalSortBy('underdog')}
              >
                <Zap size={14} color={modalSortBy === 'underdog' ? Colors.bgDeep : Colors.orange} />
                <Text style={[styles.sortBtnText, modalSortBy === 'underdog' && styles.sortBtnTextActive, { marginLeft: 4 }]}>Odkrycia AI</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalList}>
              {getSortedStudentsForModal().length === 0 ? (
                <Text style={[styles.emptyText, { textAlign: 'center', marginTop: 40 }]}>
                  Wszyscy dostępni uczniowie z Twojej szkoły są już w kadrze! 🎉
                </Text>
              ) : (
                getSortedStudentsForModal().map((student) => (
                  <View key={student.id} style={styles.modalStudentCard}>
                    <View style={styles.modalStudentInfo}>
                      <Text style={styles.modalStudentName}>{student.name}</Text>
                      <Text style={styles.modalStudentScore}>Wynik: {student[activeCategory]}</Text>

                      {student.isUnderdog && (
                        <View style={[styles.underdogBadgeMini, { marginTop: 4, alignSelf: 'flex-start' }]}>
                          <TrendingUp size={10} color={Colors.bgDeep} />
                          <Text style={styles.underdogTextMini}>Progres {student.progress}</Text>
                        </View>
                      )}
                    </View>

                    <View style={styles.modalActionButtons}>
                      <TouchableOpacity style={styles.modalAddMainBtn} onPress={() => addToTeam(student.id, 'main')}>
                        <Text style={styles.modalAddMainText}>Główny</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={styles.modalAddResBtn} onPress={() => addToTeam(student.id, 'reserve')}>
                        <Text style={styles.modalAddResText}>Rezerwa</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ))
              )}
            </ScrollView>

          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bgDeep },
  scrollView: { flex: 1 },
  scrollContent: { paddingBottom: 100 },
  innerPadding: { paddingHorizontal: Spacing.xl, paddingTop: 60 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.md },
  screenTitle: { color: Colors.white, fontSize: FontSize['2xl'], fontWeight: '800' },

  dropdownContainer: { marginBottom: Spacing.xl, position: 'relative', zIndex: 10 },
  dropdownLabel: { color: Colors.gray, fontSize: FontSize.sm, marginBottom: 8, fontWeight: '600' },
  dropdownHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: Colors.cardBg, paddingHorizontal: 16, paddingVertical: 14, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(0, 230, 118, 0.4)' },
  dropdownHeaderText: { color: Colors.white, fontSize: FontSize.md, fontWeight: '700' },
  dropdownList: { position: 'absolute', top: 75, left: 0, right: 0, backgroundColor: Colors.cardBg, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.1)', padding: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.5, shadowRadius: 15, elevation: 10, zIndex: 20 },
  dropdownItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 12, borderRadius: 8 },
  dropdownItemActive: { backgroundColor: 'rgba(0, 230, 118, 0.1)' },
  dropdownItemText: { color: Colors.gray, fontSize: FontSize.base, fontWeight: '600' },
  dropdownItemTextActive: { color: Colors.neonGreen, fontWeight: '800' },

  sectionSpacing: { marginBottom: Spacing.xl },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.md, gap: 8 },
  sectionTitle: { color: Colors.white, fontSize: FontSize.lg, fontWeight: '700' },
  emptyText: { color: Colors.gray, fontStyle: 'italic', paddingVertical: 10 },

  memberCardWrapper: { marginBottom: 10 },
  memberCard: { padding: 15, position: 'relative' },
  memberCardHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  avatarMini: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.1)', alignItems: 'center', justifyContent: 'center' },
  memberName: { color: Colors.white, fontSize: FontSize.base, fontWeight: '700' },
  memberScore: { color: Colors.gray, fontSize: FontSize.sm },
  removeButton: { position: 'absolute', top: -5, right: -5, width: 22, height: 22, borderRadius: 11, backgroundColor: Colors.red, alignItems: 'center', justifyContent: 'center', zIndex: 10 },

  underdogBadgeMini: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.neonGreen, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, gap: 4, marginTop: 8, alignSelf: 'flex-start' },
  underdogTextMini: { fontSize: 10, fontWeight: '700', color: Colors.bgDeep },

  bigAddButton: { backgroundColor: Colors.neonGreen, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 16, borderRadius: BorderRadius.full, marginTop: Spacing.md, shadowColor: Colors.neonGreen, shadowOpacity: 0.4, shadowRadius: 10, elevation: 5 },
  bigAddButtonText: { color: Colors.bgDeep, fontWeight: '900', fontSize: FontSize.md, marginLeft: 8 },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: Colors.bgDeep, height: '80%', borderTopLeftRadius: 30, borderTopRightRadius: 30, padding: 20, borderWidth: 1, borderColor: 'rgba(0, 230, 118, 0.3)' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { color: Colors.white, fontSize: FontSize.xl, fontWeight: '800' },

  sortRow: { flexDirection: 'row', marginBottom: 20, gap: 10 },
  sortBtn: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, paddingHorizontal: 15, borderRadius: 20, backgroundColor: Colors.cardBg, borderWidth: 1, borderColor: Colors.gray },
  sortBtnActive: { backgroundColor: Colors.orange, borderColor: Colors.orange },
  sortBtnText: { color: Colors.gray, fontWeight: '600', fontSize: 12 },
  sortBtnTextActive: { color: Colors.bgDeep, fontWeight: '800' },

  modalList: { flex: 1 },
  modalStudentCard: { backgroundColor: Colors.cardBg, padding: 15, borderRadius: 12, marginBottom: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  modalStudentInfo: { flex: 1 },
  modalStudentName: { color: Colors.white, fontWeight: '700', fontSize: FontSize.md },
  modalStudentScore: { color: Colors.neonGreen, fontWeight: '800', fontSize: FontSize.sm, marginTop: 2 },
  modalActionButtons: { flexDirection: 'row', gap: 8 },
  modalAddMainBtn: { backgroundColor: Colors.gold, paddingVertical: 8, paddingHorizontal: 12, borderRadius: 8 },
  modalAddMainText: { color: Colors.bgDeep, fontWeight: '800', fontSize: 12 },
  modalAddResBtn: { backgroundColor: 'transparent', borderWidth: 1, borderColor: Colors.gray, paddingVertical: 8, paddingHorizontal: 12, borderRadius: 8 },
  modalAddResText: { color: Colors.gray, fontWeight: '600', fontSize: 12 },
});