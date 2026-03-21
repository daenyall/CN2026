import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Image, Dimensions, ScrollView, Animated } from 'react-native';
import { MapPin } from 'lucide-react-native';
import { NeonCard } from '../components/NeonCard';
import { Colors, Spacing, FontSize, BorderRadius } from '../../styles/theme';
import { useRoute } from '@react-navigation/native';
import { BottomNav } from '../components/BottomNav';

const { width } = Dimensions.get('window');

// Mockowe punkty zagęszczenia talentów - ułożone procentowo
const HEAT_POINTS = [
    { id: 1, top: '35%', left: '45%', size: 90, color: 'rgba(255, 71, 87, 0.4)', glow: Colors.red },   // Wybitne
    { id: 2, top: '40%', left: '48%', size: 40, color: 'rgba(255, 71, 87, 0.8)', glow: Colors.red },   // Rdzeń wybitnego
    { id: 3, top: '55%', left: '60%', size: 70, color: 'rgba(255, 165, 2, 0.5)', glow: Colors.orange },    // Wysokie
    { id: 4, top: '25%', left: '70%', size: 100, color: 'rgba(46, 213, 115, 0.3)', glow: Colors.neonGreen }, // Umiarkowane
    { id: 5, top: '70%', left: '30%', size: 80, color: 'rgba(255, 165, 2, 0.4)', glow: Colors.orange },
    { id: 6, top: '15%', left: '20%', size: 60, color: 'rgba(46, 213, 115, 0.4)', glow: Colors.neonGreen },
];

export default function HeatMapScreen() {
    const fadeAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
        }).start();
    }, []);

    return (
        <View style={styles.container}>
            <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>

                {/* Nagłówek */}
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>Mapa Talentów 🗺️</Text>
                    <Text style={styles.headerSub}>Zagęszczenie wyników w Nowym Sączu</Text>
                </View>

                {/* Sekcja Mapy */}
                <Animated.View style={[styles.mapSection, { opacity: fadeAnim }]}>
                    <View style={styles.mapWrapper}>
                        {/* Tło Mapy - Mock */}
                        <Image
                            source={require('../../../assets/images/nowy_sacz_map.png')}
                            style={styles.mapImage}
                            resizeMode="cover"
                        />

                        {/* Nakładka zaciemniająca, żeby neony lepiej świeciły */}
                        <View style={styles.darkOverlay} />

                        {/* Renderowanie punktów cieplnych */}
                        {HEAT_POINTS.map((point) => (
                            <View
                                key={point.id}
                                style={[
                                    styles.heatPoint,
                                    {
                                        top: point.top as any,
                                        left: point.left as any,
                                        width: point.size,
                                        height: point.size,
                                        borderRadius: point.size / 2,
                                        backgroundColor: point.color,
                                        shadowColor: point.glow,
                                    },
                                ]}
                            />
                        ))}

                        {/* Opcjonalny znacznik pokazujący aktualną pozycję "Ucznia" */}
                        <View style={styles.userPin}>
                            <MapPin size={24} color={Colors.white} />
                        </View>
                    </View>
                </Animated.View>

                {/* Legenda pod mapą */}
                <View style={styles.legendSection}>
                    <NeonCard>
                        <Text style={styles.legendTitle}>Legenda Aktywności</Text>

                        <View style={styles.legendRow}>
                            <View style={[styles.legendDot, { backgroundColor: Colors.red, shadowColor: Colors.red }]} />
                            <View>
                                <Text style={styles.legendLabel}>Strefa Wybitna</Text>
                                <Text style={styles.legendDesc}>Najwyższe wyniki w rejonie (Top 10%)</Text>
                            </View>
                        </View>

                        <View style={styles.legendRow}>
                            <View style={[styles.legendDot, { backgroundColor: Colors.orange, shadowColor: Colors.orange }]} />
                            <View>
                                <Text style={styles.legendLabel}>Strefa Wysoka</Text>
                                <Text style={styles.legendDesc}>Duża aktywność i regularny streak</Text>
                            </View>
                        </View>

                        <View style={styles.legendRow}>
                            <View style={[styles.legendDot, { backgroundColor: Colors.neonGreen, shadowColor: Colors.neonGreen }]} />
                            <View>
                                <Text style={styles.legendLabel}>Strefa Umiarkowana</Text>
                                <Text style={styles.legendDesc}>Baza nowych talentów</Text>
                            </View>
                        </View>
                    </NeonCard>
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
        paddingBottom: 100, // miejsce na BottomNav
    },
    header: {
        paddingHorizontal: Spacing.xl,
        paddingTop: 60,
        paddingBottom: Spacing.md,
    },
    headerTitle: {
        fontSize: FontSize['2xl'],
        color: Colors.white,
        fontWeight: '700',
    },
    headerSub: {
        fontSize: FontSize.sm,
        color: Colors.gray,
        marginTop: 4,
    },
    mapSection: {
        paddingHorizontal: Spacing.xl,
        marginBottom: Spacing.xl,
    },
    mapWrapper: {
        width: '100%',
        height: width - 40, // Kwadratowy układ, żeby ładnie wyglądało
        borderRadius: BorderRadius.xl,
        overflow: 'hidden',
        position: 'relative',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
        backgroundColor: '#1a1a1a', // Tło w razie gdyby obrazek się nie wczytał
    },
    mapImage: {
        width: '100%',
        height: '100%',
    },
    darkOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.4)', // Przyciemnia mapę dla lepszego kontrastu kółek
    },
    heatPoint: {
        position: 'absolute',
        transform: [{ translateX: '-50%' }, { translateY: '-50%' }], // Środkuje kółko względem top/left
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 1,
        shadowRadius: 20,
        elevation: 10,
    },
    userPin: {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: [{ translateX: -12 }, { translateY: -24 }], // Środkowanie pinu
        shadowColor: Colors.white,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.8,
        shadowRadius: 10,
    },
    legendSection: {
        paddingHorizontal: Spacing.xl,
    },
    legendTitle: {
        color: Colors.white,
        fontSize: FontSize.lg,
        fontWeight: '700',
        marginBottom: Spacing.lg,
    },
    legendRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: Spacing.md,
    },
    legendDot: {
        width: 16,
        height: 16,
        borderRadius: 8,
        marginRight: Spacing.md,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.8,
        shadowRadius: 8,
        elevation: 5,
    },
    legendLabel: {
        color: Colors.white,
        fontSize: FontSize.sm,
        fontWeight: '600',
    },
    legendDesc: {
        color: Colors.gray,
        fontSize: FontSize.xs,
        marginTop: 2,
    },
});