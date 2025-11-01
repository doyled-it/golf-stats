/**
 * Shot performance calculation functions
 */
/**
 * Calculate birdie opportunity conversion rate
 * Tracks how often you convert birdie opportunities (GIRs) into actual birdies
 */
export function calculateBirdieConversion(rounds) {
    if (rounds.length === 0)
        return undefined;
    let opportunities = 0;
    let conversions = 0;
    rounds.forEach(round => {
        if (!round.holes || round.holes.length === 0)
            return;
        round.holes.forEach(hole => {
            // A birdie opportunity is when you hit the green in regulation
            // This means you have a putt for birdie
            if (hole.greenInRegulation) {
                opportunities++;
                // A conversion is when you made birdie or better
                if (hole.score < hole.par) {
                    conversions++;
                }
            }
        });
    });
    if (opportunities === 0)
        return undefined;
    return {
        opportunities,
        conversions,
        conversionRate: (conversions / opportunities) * 100,
        missedBirdies: opportunities - conversions
    };
}
/**
 * Calculate detailed putting performance statistics
 * Includes breakdown by putt count and trend over time
 */
export function calculatePuttingPerformance(rounds) {
    if (rounds.length === 0)
        return undefined;
    let totalPutts = 0;
    let totalHoles = 0;
    let girPutts = 0;
    let missedGIRPutts = 0;
    let girHoles = 0;
    let missedGIRHoles = 0;
    let onePutts = 0;
    let twoPutts = 0;
    let threePuttOrMore = 0;
    const puttingTrend = [];
    // Calculate stats for each round and build trend data
    rounds.forEach(round => {
        if (!round.holes || round.holes.length === 0)
            return;
        let roundPutts = 0;
        let roundThreePutts = 0;
        round.holes.forEach(hole => {
            const putts = hole.putts || 0;
            totalPutts += putts;
            totalHoles++;
            roundPutts += putts;
            if (hole.greenInRegulation) {
                girPutts += putts;
                girHoles++;
            }
            else {
                missedGIRPutts += putts;
                missedGIRHoles++;
            }
            // Count putt distribution
            if (putts === 1)
                onePutts++;
            else if (putts === 2)
                twoPutts++;
            else if (putts >= 3) {
                threePuttOrMore++;
                roundThreePutts++;
            }
        });
        // Add to trend data
        puttingTrend.push({
            date: round.date,
            averagePuttsPerHole: roundPutts / round.holes.length,
            threePuttCount: roundThreePutts,
            holesPlayed: round.holes.length
        });
    });
    // Sort trend data by date
    puttingTrend.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    return {
        averagePuttsPerRound: rounds.length > 0 ? totalPutts / rounds.length : 0,
        averagePuttsPerGIR: girHoles > 0 ? girPutts / girHoles : 0,
        averagePuttsWhenMissingGIR: missedGIRHoles > 0 ? missedGIRPutts / missedGIRHoles : 0,
        onePuttPercentage: totalHoles > 0 ? (onePutts / totalHoles) * 100 : 0,
        twoPuttPercentage: totalHoles > 0 ? (twoPutts / totalHoles) * 100 : 0,
        threePuttOrMorePercentage: totalHoles > 0 ? (threePuttOrMore / totalHoles) * 100 : 0,
        totalPutts,
        totalHoles,
        puttingTrend
    };
}
/**
 * Calculate performance vs scratch golfer
 * Uses actual scoring data and course ratings to estimate stroke allocation
 */
export function calculateStrokesGained(rounds, handicapIndex = 12) {
    if (rounds.length === 0)
        return undefined;
    // Scratch golfer benchmarks per 18 holes
    const scratchBenchmarks = {
        fairwayPercentage: 0.60, // 60% fairways hit
        girPercentage: 0.65, // 65% greens in regulation
        scramblingPercentage: 0.55, // 55% scrambling
        puttsPerRound: 30.0 // 30 putts per round
    };
    let totalScoreToPar = 0;
    let totalDriving = 0;
    let totalApproach = 0;
    let totalShortGame = 0;
    let totalPutting = 0;
    let roundsWithData = 0;
    rounds.forEach(round => {
        if (!round.holes || round.holes.length === 0)
            return;
        const holesPlayed = round.holes.length;
        const scaleFactor = 18 / holesPlayed;
        // Normalize score to par for 18 holes
        const normalizedScoreToPar = round.scoreToPar * scaleFactor;
        totalScoreToPar += normalizedScoreToPar;
        // Calculate actual performance stats
        const fairwayHoles = round.holes.filter(h => h.par >= 4);
        const fairwaysHit = fairwayHoles.filter(h => h.fairwayHit === true).length;
        const actualFairwayPercentage = fairwayHoles.length > 0 ? fairwaysHit / fairwayHoles.length : scratchBenchmarks.fairwayPercentage;
        const girsHit = round.holes.filter(h => h.greenInRegulation).length;
        const actualGirPercentage = girsHit / holesPlayed;
        const missedGIRs = round.holes.filter(h => !h.greenInRegulation);
        const upAndDowns = missedGIRs.filter(h => (h.score - h.par) <= 0).length;
        const actualScramblingPercentage = missedGIRs.length > 0 ? upAndDowns / missedGIRs.length : scratchBenchmarks.scramblingPercentage;
        const actualPutts = round.holes.reduce((sum, h) => sum + (h.putts || 0), 0);
        const actualPuttsPerRound = actualPutts * scaleFactor;
        // Calculate gaps from scratch benchmarks
        const fairwayGap = scratchBenchmarks.fairwayPercentage - actualFairwayPercentage; // Positive = worse than scratch
        const girGap = scratchBenchmarks.girPercentage - actualGirPercentage;
        const scramblingGap = scratchBenchmarks.scramblingPercentage - actualScramblingPercentage;
        const puttingGap = actualPuttsPerRound - scratchBenchmarks.puttsPerRound;
        // Allocate strokes based on gaps
        // These multipliers are calibrated so the total roughly equals score to par
        // Driving: Each % of fairways missed costs proportional strokes
        // Missing 10% more fairways (1.4 fairways on 14 driving holes) ≈ 0.7 strokes
        const drivingStrokes = fairwayGap * 14 * 0.5;
        // Approach: Each % of GIR missed is the biggest differentiator
        // Missing 10% more greens (1.8 greens) ≈ 1.8 strokes
        const approachStrokes = girGap * 18 * 1.0;
        // Short game: Scrambling efficiency on missed greens
        // Each % worse scrambling on missed greens ≈ strokes
        const missedGreenCount = (1 - actualGirPercentage) * 18;
        const shortGameStrokes = scramblingGap * missedGreenCount * 1.0;
        // Putting: Direct stroke difference
        const puttingStrokes = puttingGap;
        totalDriving += drivingStrokes;
        totalApproach += approachStrokes;
        totalShortGame += shortGameStrokes;
        totalPutting += puttingStrokes;
        roundsWithData++;
    });
    if (roundsWithData === 0)
        return undefined;
    // Calculate averages (negative = better than scratch, positive = worse)
    const avgScoreToPar = totalScoreToPar / roundsWithData;
    const avgDriving = totalDriving / roundsWithData;
    const avgApproach = totalApproach / roundsWithData;
    const avgShortGame = totalShortGame / roundsWithData;
    const avgPutting = totalPutting / roundsWithData;
    // Calculate the sum of categories
    const categorySum = avgDriving + avgApproach + avgShortGame + avgPutting;
    // If there's a gap between actual score and our category estimates,
    // distribute it proportionally (this accounts for things we can't measure)
    const adjustment = avgScoreToPar - categorySum;
    const adjustmentFactor = categorySum !== 0 ? adjustment / categorySum : 0;
    return {
        total: -avgScoreToPar, // Negative because we show it as "strokes lost"
        driving: -(avgDriving * (1 + adjustmentFactor)),
        approach: -(avgApproach * (1 + adjustmentFactor)),
        shortGame: -(avgShortGame * (1 + adjustmentFactor)),
        putting: -(avgPutting * (1 + adjustmentFactor)),
        totalRounds: roundsWithData
    };
}
/**
 * Calculate performance correlations
 * Shows which stats correlate most strongly with better scores
 */
export function calculatePerformanceCorrelations(rounds) {
    if (rounds.length < 3)
        return undefined; // Need minimum data for correlations
    // Collect stats for each round
    const roundStats = [];
    rounds.forEach(round => {
        if (!round.holes || round.holes.length === 0)
            return;
        const holesPlayed = round.holes.length;
        const normalizedScoreToPar = (round.scoreToPar / holesPlayed) * 18; // Normalize to 18 holes
        const girsHit = round.holes.filter(h => h.greenInRegulation).length;
        const girPercent = (girsHit / holesPlayed) * 100;
        const fairwayHoles = round.holes.filter(h => h.par >= 4);
        const fairwaysHit = fairwayHoles.filter(h => h.fairwayHit === true).length;
        const fairwayPercent = fairwayHoles.length > 0 ? (fairwaysHit / fairwayHoles.length) * 100 : 0;
        const missedGIRs = round.holes.filter(h => !h.greenInRegulation);
        const upAndDowns = missedGIRs.filter(h => (h.score - h.par) <= 0).length;
        const scramblingPercent = missedGIRs.length > 0 ? (upAndDowns / missedGIRs.length) * 100 : 0;
        const totalPutts = round.holes.reduce((sum, h) => sum + (h.putts || 0), 0);
        const puttsPerHole = totalPutts / holesPlayed;
        roundStats.push({
            scoreToPar: normalizedScoreToPar,
            girPercent,
            fairwayPercent,
            scramblingPercent,
            puttsPerHole
        });
    });
    if (roundStats.length < 3)
        return undefined;
    // Helper function to calculate Pearson correlation coefficient
    function correlation(x, y) {
        const n = x.length;
        const sumX = x.reduce((a, b) => a + b, 0);
        const sumY = y.reduce((a, b) => a + b, 0);
        const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
        const sumX2 = x.reduce((sum, xi) => sum + xi * xi, 0);
        const sumY2 = y.reduce((sum, yi) => sum + yi * yi, 0);
        const numerator = n * sumXY - sumX * sumY;
        const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));
        return denominator === 0 ? 0 : numerator / denominator;
    }
    const scores = roundStats.map(r => r.scoreToPar);
    // Calculate correlations
    // Negative correlation = as stat increases, score decreases (GOOD)
    // Positive correlation = as stat increases, score increases (BAD)
    const correlations = [
        {
            stat: 'GIR %',
            correlation: correlation(roundStats.map(r => r.girPercent), scores),
            impact: 'high',
            description: 'Greens hit in regulation'
        },
        {
            stat: 'Fairways Hit %',
            correlation: correlation(roundStats.map(r => r.fairwayPercent), scores),
            impact: 'medium',
            description: 'Fairways hit off the tee'
        },
        {
            stat: 'Scrambling %',
            correlation: correlation(roundStats.map(r => r.scramblingPercent), scores),
            impact: 'medium',
            description: 'Up-and-downs when missing green'
        },
        {
            stat: 'Putts per Hole',
            correlation: correlation(roundStats.map(r => r.puttsPerHole), scores),
            impact: 'high',
            description: 'Average putts per hole'
        }
    ];
    // Assign impact based on correlation strength
    correlations.forEach(corr => {
        const absCorr = Math.abs(corr.correlation);
        if (absCorr > 0.6)
            corr.impact = 'high';
        else if (absCorr > 0.3)
            corr.impact = 'medium';
        else
            corr.impact = 'low';
    });
    // Sort by correlation strength (absolute value)
    correlations.sort((a, b) => Math.abs(b.correlation) - Math.abs(a.correlation));
    return correlations;
}
//# sourceMappingURL=shots.js.map