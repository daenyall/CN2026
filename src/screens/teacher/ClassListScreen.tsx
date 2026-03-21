import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import Animated, { FadeInDown, Layout } from 'react-native-reanimated';
import { Search, ChevronRight, Calculator } from 'lucide-react-native';
import { NeonCard } from '../../components/NeonCard';

export default function ClassListScreen() {
  const [activeTab, setActiveTab] = useState("6A");
  const [searchQuery, setSearchQuery] = useState("");

  const tabs = ["6A", "6B", "6C"];

  const students = [
    { id: 1, name: "Jakub Kowalski", status: "tested", score: 87, trend: "up" },
    { id: 2, name: "Anna Nowak", status: "tested", score: 92, trend: "up" },
    { id: 3, name: "Michał Wiśniewski", status: "pending", score: null, trend: null },
    { id: 4, name: "Zofia Lewandowska", status: "tested", score: 78, trend: "down" },
    { id: 5, name: "Kacper Zieliński", status: "tested", score: 85, trend: "same" },
    { id: 6, name: "Julia Kamińska", status: "pending", score: null, trend: null },
    { id: 7, name: "Filip Dąbrowski", status: "missing", score: null, trend: null },
  ];

  const filteredStudents = students.filter(student => 
    student.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Uczniowie</Text>
        
        {/* Classes Tabs */}
        <View style={styles.tabContainer}>
          {tabs.map((tab) => (
             <TouchableOpacity
             key={tab}
             onPress={() => setActiveTab(tab)}
             style={[styles.tabButton]}
             activeOpacity={0.8}
           >
             {activeTab === tab && (
               <Animated.View layout={Layout.springify()} style={styles.activeTabBg} />
             )}
             <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>
               Klasa {tab}
             </Text>
           </TouchableOpacity>
          ))}
        </View>

        {/* Search */}
        <View style={styles.searchContainer}>
          <Search size={20} color="#8899AA" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Szukaj ucznia..."
            placeholderTextColor="#8899AA"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Bulk Action */}
        <Animated.View entering={FadeInDown} style={styles.bulkAction}>
          <TouchableOpacity activeOpacity={0.8} style={styles.bulkBtn}>
            <Calculator size={18} color="#00E676" />
            <Text style={styles.bulkBtnText}>Wprowadź wyniki dla całej klasy</Text>
          </TouchableOpacity>
        </Animated.View>

        <View style={styles.list}>
          {filteredStudents.map((student, index) => (
            <Animated.View key={student.id} entering={FadeInDown.delay(100 + index * 50)} layout={Layout.springify()}>
              <NeonCard style={styles.studentCardPadding}>
                <View style={styles.studentRow}>
                  <View style={styles.studentAvatar}>
                    <Text style={styles.studentEmoji}>👤</Text>
                  </View>
                  <View style={styles.studentInfo}>
                    <Text style={styles.studentName}>{student.name}</Text>
                    {student.status === "tested" ? (
                      <Text style={styles.statusTested}>✅ Przetestowany</Text>
                    ) : student.status === "pending" ? (
                      <Text style={styles.statusPending}>⏳ Oczekuje na test</Text>
                    ) : (
                      <Text style={styles.statusMissing}>⚠️ Brak testu &gt;2 tyg</Text>
                    )}
                  </View>

                  <View style={styles.studentRight}>
                    {student.score && (
                      <View style={styles.scoreBox}>
                        <Text style={styles.scoreText}>{student.score}</Text>
                      </View>
                    )}
                    <ChevronRight size={20} color="#8899AA" />
                  </View>
                </View>
              </NeonCard>
            </Animated.View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0E1A',
  },
  header: {
    padding: 24,
    paddingBottom: 16,
    backgroundColor: 'rgba(10, 14, 26, 0.95)',
    zIndex: 10,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 20,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#1E2A3A',
    padding: 4,
    borderRadius: 999,
    marginBottom: 16,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 999,
    position: 'relative',
  },
  activeTabBg: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#00E676',
    borderRadius: 999,
  },
  tabText: {
    color: '#8899AA',
    fontSize: 14,
    fontWeight: '600',
    zIndex: 2,
  },
  activeTabText: {
    color: '#0A0E1A',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E2A3A',
    borderRadius: 8,
    borderColor: 'rgba(136, 153, 170, 0.3)',
    borderWidth: 1,
    height: 48,
    paddingHorizontal: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 14,
    height: '100%',
  },
  scroll: {
    padding: 24,
    paddingTop: 8,
    paddingBottom: 40,
  },
  bulkAction: {
    marginBottom: 16,
  },
  bulkBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: 'rgba(0, 230, 118, 0.1)',
    borderColor: 'rgba(0, 230, 118, 0.3)',
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 12,
  },
  bulkBtnText: {
    color: '#00E676',
    fontWeight: '600',
    fontSize: 14,
  },
  list: {
    gap: 12,
  },
  studentCardPadding: {
    padding: 12,
  },
  studentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  studentAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1E2A3A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  studentEmoji: {
    fontSize: 20,
  },
  studentInfo: {
    flex: 1,
  },
  studentName: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 16,
    marginBottom: 4,
  },
  statusTested: {
    color: '#00E676',
    fontSize: 12,
  },
  statusPending: {
    color: '#8899AA',
    fontSize: 12,
  },
  statusMissing: {
    color: '#FF1744',
    fontSize: 12,
  },
  studentRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  scoreBox: {
    backgroundColor: '#0A0E1A',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  scoreText: {
    color: '#00E676',
    fontWeight: '800',
    fontSize: 14,
  }
});
