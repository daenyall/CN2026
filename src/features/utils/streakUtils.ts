import AsyncStorage from '@react-native-async-storage/async-storage';

export const updateStreak = async (): Promise<number> => {
    try {
        const today = new Date().toISOString().split('T')[0];
        const last = await AsyncStorage.getItem('lastWorkoutDate');
        const streakStr = await AsyncStorage.getItem('currentStreak');
        const streak = parseInt(streakStr || '0', 10);

        if (!last) {
            await AsyncStorage.setItem('lastWorkoutDate', today);
            await AsyncStorage.setItem('currentStreak', '1');
            return 1;
        }

        const diff = Math.floor(
            (new Date(today).getTime() - new Date(last).getTime()) / (1000 * 60 * 60 * 24)
        );

        // Jeśli trenował już dzisiaj, nie powiększamy streaka, ale zwracamy aktualny
        if (diff === 0) return streak;

        // Jeśli przerwa wynosi 3 dni lub mniej - utrzymujemy streak. Jeśli więcej - reset.
        const newStreak = diff <= 3 ? streak + 1 : 1;

        await AsyncStorage.setItem('currentStreak', String(newStreak));
        await AsyncStorage.setItem('lastWorkoutDate', today);
        return newStreak;

    } catch (error) {
        console.error('Błąd AsyncStorage przy streaku:', error);
        return 0;
    }
};

export const getBonusPoints = (streak: number): number => {
    if (streak >= 30) return streak * 10 * 2;
    if (streak >= 14) return streak * 10 * 1.75;
    if (streak >= 7) return Math.floor(streak * 10 * 1.5);
    return streak * 10;
};

export const getStreakMilestone = (streak: number): string | null => {
    if (streak >= 30) return '👑 Legenda Szkoły';
    if (streak >= 14) return '⚡ Niezniszczalny';
    if (streak >= 7) return '🔥 Tygodniowy Wojownik';
    return null;
};