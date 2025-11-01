/**
 * Scoring-related calculation functions
 */
/**
 * Calculate recent form indicator
 * Normalizes for 9-hole vs 18-hole rounds by using strokes per hole
 */
export function calculateRecentForm(recentRounds, overallAveragePerHole) {
    if (recentRounds.length === 0)
        return undefined;
    // Calculate average strokes-to-par per hole for recent rounds
    const totalHoles = recentRounds.reduce((sum, r) => sum + (r.par <= 36 ? 9 : 18), 0);
    const totalScoreToPar = recentRounds.reduce((sum, r) => sum + r.scoreToPar, 0);
    const averageScoreToParPerHole = totalScoreToPar / totalHoles;
    // Calculate trend (difference in strokes per hole)
    const trend = averageScoreToParPerHole - overallAveragePerHole;
    const trendPercent = overallAveragePerHole !== 0 ? (trend / Math.abs(overallAveragePerHole)) * 100 : 0;
    const improving = trend < 0; // Negative trend means better scores
    // For display, scale to 18-hole equivalent
    const averageScoreToPar = averageScoreToParPerHole * 18;
    return {
        roundCount: recentRounds.length,
        averageScoreToPar,
        trend: trend * 18, // Scale trend to 18-hole equivalent for display
        trendPercent,
        improving
    };
}
/**
 * Calculate scoring heatmap data for the last 12 months
 * Groups rounds by date and normalizes scores to 18-hole equivalent
 */
export function calculateScoringHeatmap(rounds) {
    // Calculate date range (last 12 months from most recent round)
    const mostRecentDate = rounds.length > 0
        ? new Date(Math.max(...rounds.map(r => new Date(r.date).getTime())))
        : new Date();
    const endDate = new Date(mostRecentDate);
    const startDate = new Date(mostRecentDate);
    startDate.setFullYear(startDate.getFullYear() - 1);
    // Group rounds by date
    const roundsByDate = new Map();
    rounds.forEach(round => {
        const roundDate = new Date(round.date);
        if (roundDate >= startDate && roundDate <= endDate) {
            const dateKey = round.date.split('T')[0]; // Get YYYY-MM-DD
            if (!roundsByDate.has(dateKey)) {
                roundsByDate.set(dateKey, []);
            }
            roundsByDate.get(dateKey).push(round);
        }
    });
    // Create heatmap days
    const days = [];
    roundsByDate.forEach((dayRounds, dateKey) => {
        // Calculate average score to par for the day (normalized to 18 holes)
        const totalScoreToPar = dayRounds.reduce((sum, r) => {
            const holes = r.par <= 36 ? 9 : 18;
            return sum + (r.scoreToPar / holes) * 18;
        }, 0);
        const averageScoreToPar = totalScoreToPar / dayRounds.length;
        days.push({
            date: dateKey,
            roundCount: dayRounds.length,
            averageScoreToPar,
            rounds: dayRounds
        });
    });
    // Sort by date
    days.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    return {
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0],
        days
    };
}
/**
 * Calculate hole difficulty for a course
 */
export function calculateHoleDifficulty(rounds) {
    if (rounds.length === 0)
        return undefined;
    // Group holes by hole number
    const holeMap = new Map();
    rounds.forEach(round => {
        if (!round.holes || round.holes.length === 0)
            return;
        round.holes.forEach(hole => {
            if (!holeMap.has(hole.number)) {
                holeMap.set(hole.number, { scores: [], par: hole.par });
            }
            holeMap.get(hole.number).scores.push(hole.score);
        });
    });
    // Calculate difficulty metrics for each hole
    const difficulties = [];
    holeMap.forEach((data, holeNumber) => {
        const scores = data.scores;
        const par = data.par;
        const averageScore = scores.reduce((sum, s) => sum + s, 0) / scores.length;
        const scoreToPar = averageScore - par;
        // Count scoring outcomes
        const birdies = scores.filter(s => s < par).length;
        const pars = scores.filter(s => s === par).length;
        const bogeys = scores.filter(s => s === par + 1).length;
        const doublePlus = scores.filter(s => s >= par + 2).length;
        difficulties.push({
            holeNumber,
            par,
            averageScore,
            scoreToPar,
            difficulty: 0, // Will rank after
            birdiePercent: (birdies / scores.length) * 100,
            parPercent: (pars / scores.length) * 100,
            bogeyPercent: (bogeys / scores.length) * 100,
            doublePlusPercent: (doublePlus / scores.length) * 100,
            roundsPlayed: scores.length
        });
    });
    // Rank by difficulty (highest scoreToPar = hardest = rank 1)
    difficulties.sort((a, b) => b.scoreToPar - a.scoreToPar);
    difficulties.forEach((hole, index) => {
        hole.difficulty = index + 1;
    });
    // Sort back by hole number for display
    difficulties.sort((a, b) => a.holeNumber - b.holeNumber);
    return difficulties;
}
//# sourceMappingURL=scoring.js.map