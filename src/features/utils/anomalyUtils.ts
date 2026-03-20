export const checkAnomaly = (currentScore: number, previousScore: number): boolean => {
    // Zabezpieczenie przed dzieleniem przez zero / brakiem poprzednich wyników
    if (previousScore <= 0) return false;

    // Jeśli nowy wynik jest o 20% (1.2x) lepszy od poprzedniego -> Mamy talent!
    return currentScore >= previousScore * 1.2;
};