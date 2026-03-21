import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert, Modal } from 'react-native';
import { X, Check, Award, Bell, BellRing, Zap, TrendingUp, Plus, Star, Users, ChevronDown } from 'lucide-react-native';
import { NeonCard } from '../components/NeonCard';
import { BottomNav } from '../components/BottomNav';
import { Colors, Spacing, FontSize, BorderRadius } from '../../styles/theme';


// --- MOCK DANE ---
const MOCK_SCHOOL_STUDENTS = [
  { id: 1, name: 'Jakub Kowalski', overall: 87, Bieg: 92, Plank: 70, Skok: 85, isUnderdog: false },
  { id: 2, name: 'Anna Nowak', overall: 89, Bieg: 85, Plank: 95, Skok: 88, isUnderdog: false },
  { id: 3, name: 'Kacper Zieliński', overall: 78, Bieg: 75, Plank: 80, Skok: 95, isUnderdog: true, progress: '+15%' },
  { id: 4, name: 'Michał Wiśniewski', overall: 85, Bieg: 88, Plank: 82, Skok: 80, isUnderdog: false },
  { id: 5, name: 'Maja Piotrowska', overall: 81, Bieg: 80, Plank: 90, Skok: 85, isUnderdog: true, progress: '+22%' },
  { id: 6, name: 'Zofia Lewandowska', overall: 91, Bieg: 95, Plank: 88, Skok: 92, isUnderdog: false },
  { id: 7, name: 'Adam Kowalczyk', overall: 75, Bieg: 70, Plank: 75, Skok: 80, isUnderdog: true, progress: '+10%' },
];

const CATEGORIES = ['Bieg', 'Plank', 'Skok'];

export default function TeamRecruitment() {
  const [activeCategory, setActiveCategory] = useState('Bieg');
  const [isDropdownOpen, setDropdownOpen] = useState(false);

  const [followedStudents, setFollowedStudents] = useState<number[]>([]);
  const [isModalVisible, setModalVisible] = useState(false);
  const [modalSortBy, setModalSortBy] = useState<'score' | 'underdog'>('score');

  const [teamAssignments, setTeamAssignments] = useState([
    { id: '1-Bieg-main', studentId: 6, category: 'Bieg', role: 'main' },
    { id: '2-Bieg-main', studentId: 1, category: 'Bieg', role: 'main' },
    { id: '3-Bieg-reserve', studentId: 4, category: 'Bieg', role: 'reserve' },
    { id: '4-Plank-main', studentId: 2, category: 'Plank', role: 'main' },
  ]);

  const toggleFollow = (studentId: number) => {
    if (followedStudents.includes(studentId)) {
      setFollowedStudents(followedStudents.filter(id => id !== studentId));
    } else {
      setFollowedStudents([...followedStudents, studentId]);
      Alert.alert('Obserwujesz ucznia', 'Otrzymasz powiadomienia o jego nowych treningach i anomaliach!');
    }
  };

  // NOWE: Funkcja z potwierdzeniem usunięcia
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

  const addToTeam = (studentId: number, role: 'main' | 'reserve') => {
    const student = MOCK_SCHOOL_STUDENTS.find(s => s.id === studentId);

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

  // NOWE: Filtrowanie uczniów (ukrywanie tych już dodanych)
  const getSortedStudentsForModal = () => {
    // 1. Zdobądź ID uczniów, którzy JUŻ SĄ w kadrze dla wybranej kategorii
    const currentCategoryStudentIds = teamAssignments
      .filter(a => a.category === activeCategory)
      .map(a => a.studentId);

    // 2. Odsiej ich z pełnej listy szkoły
    let availableStudents = MOCK_SCHOOL_STUDENTS.filter(
      s => !currentCategoryStudentIds.includes(s.id)
    );

    // 3. Posortuj pozostałych
    if (modalSortBy === 'score') {
      // @ts-ignore
      availableStudents.sort((a, b) => b[activeCategory] - a[activeCategory]);
    } else if (modalSortBy === 'underdog') {
      availableStudents = availableStudents.filter(s => s.isUnderdog);
      // @ts-ignore
      availableStudents.sort((a, b) => b[activeCategory] - a[activeCategory]);
    }
    return availableStudents;
  };

  const currentCategoryTeam = teamAssignments.filter(a => a.category === activeCategory);
  const mainTeam = currentCategoryTeam.filter(a => a.role === 'main');
  const reserveTeam = currentCategoryTeam.filter(a => a.role === 'reserve');

  const renderTeamMemberCard = (assignment: any) => {
    const student = MOCK_SCHOOL_STUDENTS.find(s => s.id === assignment.studentId);
    if (!student) return null;

    return (
      <View key={assignment.id} style={styles.memberCardWrapper}>
        <NeonCard glow={assignment.role === 'main'} style={styles.memberCard}>
          {/* NOWE: Wywołanie potwierdzenia usunięcia */}
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
              {/* @ts-ignore */}
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

          {/* NOWE: Kategoria jako Dropdown (Lista rozwijana) */}
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
                      setDropdownOpen(false); // Zamknij po wyborze
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

          {/* GŁÓWNY SKŁAD */}
          <View style={[styles.sectionSpacing, { zIndex: -1 }]}>
            {/* zIndex ujemne zeby dropdown nie chował sie pod kartami */}
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
                  Wszyscy pasujący uczniowie są już w kadrze dla tej konkurencji! 🎉
                </Text>
              ) : (
                getSortedStudentsForModal().map((student) => (
                  <View key={student.id} style={styles.modalStudentCard}>
                    <View style={styles.modalStudentInfo}>
                      <Text style={styles.modalStudentName}>{student.name}</Text>
                      {/* @ts-ignore */}
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

      <BottomNav type="teacher" />
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

  // NOWE: Style dla Dropdowna (Listy rozwijanej)
  dropdownContainer: { marginBottom: Spacing.xl, position: 'relative', zIndex: 10 },
  dropdownLabel: { color: Colors.gray, fontSize: FontSize.sm, marginBottom: 8, fontWeight: '600' },
  dropdownHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: Colors.cardBg, paddingHorizontal: 16, paddingVertical: 14, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(0, 230, 118, 0.4)' },
  dropdownHeaderText: { color: Colors.white, fontSize: FontSize.md, fontWeight: '700' },
  dropdownList: { position: 'absolute', top: 75, left: 0, right: 0, backgroundColor: Colors.cardBg, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.1)', padding: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.5, shadowRadius: 15, elevation: 10, zIndex: 20 },
  dropdownItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 12, borderRadius: 8 },
  dropdownItemActive: { backgroundColor: 'rgba(0, 230, 118, 0.1)' },
  dropdownItemText: { color: Colors.gray, fontSize: FontSize.base, fontWeight: '600' },
  dropdownItemTextActive: { color: Colors.neonGreen, fontWeight: '800' },

  // Sections
  sectionSpacing: { marginBottom: Spacing.xl },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.md, gap: 8 },
  sectionTitle: { color: Colors.white, fontSize: FontSize.lg, fontWeight: '700' },
  emptyText: { color: Colors.gray, fontStyle: 'italic', paddingVertical: 10 },

  // Member Card
  memberCardWrapper: { marginBottom: 10 },
  memberCard: { padding: 15, position: 'relative' },
  memberCardHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  avatarMini: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.1)', alignItems: 'center', justifyContent: 'center' },
  memberName: { color: Colors.white, fontSize: FontSize.base, fontWeight: '700' },
  memberScore: { color: Colors.gray, fontSize: FontSize.sm },
  removeButton: { position: 'absolute', top: -5, right: -5, width: 22, height: 22, borderRadius: 11, backgroundColor: Colors.red, alignItems: 'center', justifyContent: 'center', zIndex: 10 },

  // Badges
  underdogBadgeMini: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.neonGreen, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, gap: 4, marginTop: 8, alignSelf: 'flex-start' },
  underdogTextMini: { fontSize: 10, fontWeight: '700', color: Colors.bgDeep },

  // Big Add Button
  bigAddButton: { backgroundColor: Colors.neonGreen, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 16, borderRadius: BorderRadius.full, marginTop: Spacing.md, shadowColor: Colors.neonGreen, shadowOpacity: 0.4, shadowRadius: 10, elevation: 5 },
  bigAddButtonText: { color: Colors.bgDeep, fontWeight: '900', fontSize: FontSize.md, marginLeft: 8 },

  // Modal Styles
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: Colors.bgDeep, height: '80%', borderTopLeftRadius: 30, borderTopRightRadius: 30, padding: 20, borderWidth: 1, borderColor: 'rgba(0, 230, 118, 0.3)' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { color: Colors.white, fontSize: FontSize.xl, fontWeight: '800' },

  // Sort row in modal
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