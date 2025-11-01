/**
 * Performance tracking and records calculation functions
 */
/**
 * Calculate personal records from all rounds
 */
export function calculatePersonalRecords(rounds) {
    const records = {};
    if (rounds.length === 0)
        return records;
    // Best 9-hole score
    const rounds9Hole = rounds.filter(r => r.par <= 36);
    if (rounds9Hole.length > 0) {
        const best = rounds9Hole.reduce((best, r) => r.scoreToPar < best.scoreToPar ? r : best);
        records.bestScore9Hole = {
            score: best.totalScore,
            scoreToPar: best.scoreToPar,
            date: best.date,
            course: best.courseName
        };
    }
    // Best 18-hole score
    const rounds18Hole = rounds.filter(r => r.par > 36);
    if (rounds18Hole.length > 0) {
        const best = rounds18Hole.reduce((best, r) => r.scoreToPar < best.scoreToPar ? r : best);
        records.bestScore18Hole = {
            score: best.totalScore,
            scoreToPar: best.scoreToPar,
            date: best.date,
            course: best.courseName
        };
    }
    // Most birdies in a round
    const roundsWithHoles = rounds.filter(r => r.holes.length > 0);
    if (roundsWithHoles.length > 0) {
        let mostBirdiesRound = roundsWithHoles[0];
        let mostBirdies = 0;
        roundsWithHoles.forEach(round => {
            const birdies = round.holes.filter(h => h.score < h.par).length;
            if (birdies > mostBirdies) {
                mostBirdies = birdies;
                mostBirdiesRound = round;
            }
        });
        if (mostBirdies > 0) {
            records.mostBirdiesInRound = {
                count: mostBirdies,
                date: mostBirdiesRound.date,
                course: mostBirdiesRound.courseName
            };
        }
    }
    // Best GIR percentage
    if (roundsWithHoles.length > 0) {
        let bestGIRRound = roundsWithHoles[0];
        let bestGIRPct = 0;
        roundsWithHoles.forEach(round => {
            const girs = round.holes.filter(h => h.greenInRegulation).length;
            const pct = (girs / round.holes.length) * 100;
            if (pct > bestGIRPct) {
                bestGIRPct = pct;
                bestGIRRound = round;
            }
        });
        const girsHit = bestGIRRound.holes.filter(h => h.greenInRegulation).length;
        records.bestGIRPercentage = {
            percentage: bestGIRPct,
            date: bestGIRRound.date,
            course: bestGIRRound.courseName,
            girsHit,
            totalHoles: bestGIRRound.holes.length
        };
    }
    // Best fairway percentage
    if (roundsWithHoles.length > 0) {
        let bestFWYRound = roundsWithHoles[0];
        let bestFWYPct = 0;
        roundsWithHoles.forEach(round => {
            const fairwayHoles = round.holes.filter(h => h.fairwayHit !== undefined && h.fairwayHit !== null);
            if (fairwayHoles.length > 0) {
                const fwysHit = fairwayHoles.filter(h => h.fairwayHit === true).length;
                const pct = (fwysHit / fairwayHoles.length) * 100;
                if (pct > bestFWYPct) {
                    bestFWYPct = pct;
                    bestFWYRound = round;
                }
            }
        });
        const fairwayHoles = bestFWYRound.holes.filter(h => h.fairwayHit !== undefined && h.fairwayHit !== null);
        if (fairwayHoles.length > 0) {
            const fairwaysHit = fairwayHoles.filter(h => h.fairwayHit === true).length;
            records.bestFairwayPercentage = {
                percentage: bestFWYPct,
                date: bestFWYRound.date,
                course: bestFWYRound.courseName,
                fairwaysHit,
                totalFairways: fairwayHoles.length
            };
        }
    }
    // Fewest putts
    if (roundsWithHoles.length > 0) {
        let fewestPuttsRound = roundsWithHoles[0];
        let fewestPutts = Infinity;
        roundsWithHoles.forEach(round => {
            const putts = round.holes.reduce((sum, h) => sum + (h.putts || 0), 0);
            if (putts > 0 && putts < fewestPutts) {
                fewestPutts = putts;
                fewestPuttsRound = round;
            }
        });
        if (fewestPutts !== Infinity) {
            records.fewestPutts = {
                putts: fewestPutts,
                date: fewestPuttsRound.date,
                course: fewestPuttsRound.courseName,
                holesPlayed: fewestPuttsRound.holes.length
            };
        }
    }
    // Best differential
    if (rounds.length > 0) {
        const bestRound = rounds.reduce((best, round) => round.differential < best.differential ? round : best);
        records.bestDifferential = {
            differential: bestRound.differential,
            score: bestRound.totalScore,
            date: bestRound.date,
            course: bestRound.courseName
        };
    }
    // Longest birdie streak (consecutive holes with birdie)
    let currentStreak = 0;
    let longestStreak = 0;
    let streakStart = '';
    let streakEnd = '';
    let currentStreakStart = '';
    roundsWithHoles.forEach(round => {
        round.holes.forEach((hole, idx) => {
            if (hole.score < hole.par) {
                if (currentStreak === 0) {
                    currentStreakStart = round.date;
                }
                currentStreak++;
                if (currentStreak > longestStreak) {
                    longestStreak = currentStreak;
                    streakStart = currentStreakStart;
                    streakEnd = round.date;
                }
            }
            else {
                currentStreak = 0;
            }
        });
    });
    if (longestStreak > 0) {
        records.longestBirdieStreak = {
            streakLength: longestStreak,
            startDate: streakStart,
            endDate: streakEnd
        };
    }
    // Longest no bogey+ streak (consecutive holes without bogey or worse)
    currentStreak = 0;
    longestStreak = 0;
    streakStart = '';
    streakEnd = '';
    currentStreakStart = '';
    roundsWithHoles.forEach(round => {
        round.holes.forEach(hole => {
            const scoreToPar = hole.score - hole.par;
            if (scoreToPar < 1) { // Par or better
                if (currentStreak === 0) {
                    currentStreakStart = round.date;
                }
                currentStreak++;
                if (currentStreak > longestStreak) {
                    longestStreak = currentStreak;
                    streakStart = currentStreakStart;
                    streakEnd = round.date;
                }
            }
            else {
                currentStreak = 0;
            }
        });
    });
    if (longestStreak > 0) {
        records.longestNoBogeyStreak = {
            streakLength: longestStreak,
            startDate: streakStart,
            endDate: streakEnd
        };
    }
    // Longest no 3-putt streak (can span rounds)
    currentStreak = 0;
    longestStreak = 0;
    streakStart = '';
    streakEnd = '';
    currentStreakStart = '';
    let roundCount = 0;
    let currentRoundCount = 0;
    const sortedRoundsWithHoles = roundsWithHoles.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    sortedRoundsWithHoles.forEach(round => {
        let roundHasNoThreePutts = true;
        round.holes.forEach(hole => {
            if ((hole.putts || 0) >= 3) {
                roundHasNoThreePutts = false;
                if (currentStreak > longestStreak) {
                    longestStreak = currentStreak;
                    streakEnd = streakStart; // Last good round
                    roundCount = currentRoundCount;
                }
                currentStreak = 0;
                currentRoundCount = 0;
            }
            else {
                currentStreak++;
            }
        });
        if (roundHasNoThreePutts) {
            if (currentRoundCount === 0) {
                currentStreakStart = round.date;
            }
            currentRoundCount++;
            streakStart = currentStreakStart;
            streakEnd = round.date;
        }
    });
    // Check final streak
    if (currentStreak > longestStreak) {
        longestStreak = currentStreak;
        roundCount = currentRoundCount;
    }
    if (longestStreak > 0) {
        records.longestNoThreePuttStreak = {
            streakLength: longestStreak,
            roundCount: roundCount,
            startDate: streakStart,
            endDate: streakEnd
        };
    }
    return records;
}
/**
 * Calculate momentum indicators - performance patterns
 */
export function calculateMomentum(rounds) {
    const momentum = {};
    if (rounds.length === 0)
        return momentum;
    // Track performance after birdies, pars, bogeys
    let afterBirdieScores = [];
    let afterBirdieParOrBetter = 0;
    let afterParScores = [];
    let afterParParOrBetter = 0;
    let afterBogeyScores = [];
    let afterBogeyParOrBetter = 0;
    rounds.forEach(round => {
        if (!round.holes || round.holes.length < 2)
            return;
        for (let i = 0; i < round.holes.length - 1; i++) {
            const currentHole = round.holes[i];
            const nextHole = round.holes[i + 1];
            const currentScoreToPar = currentHole.score - currentHole.par;
            const nextScoreToPar = nextHole.score - nextHole.par;
            // After birdie or better
            if (currentScoreToPar < 0) {
                afterBirdieScores.push(nextScoreToPar);
                if (nextScoreToPar <= 0)
                    afterBirdieParOrBetter++;
            }
            // After par
            else if (currentScoreToPar === 0) {
                afterParScores.push(nextScoreToPar);
                if (nextScoreToPar <= 0)
                    afterParParOrBetter++;
            }
            // After bogey or worse
            else if (currentScoreToPar >= 1) {
                afterBogeyScores.push(nextScoreToPar);
                if (nextScoreToPar <= 0)
                    afterBogeyParOrBetter++;
            }
        }
    });
    if (afterBirdieScores.length > 0) {
        const avg = afterBirdieScores.reduce((sum, s) => sum + s, 0) / afterBirdieScores.length;
        momentum.afterBirdie = {
            nextHoleAverage: avg,
            parOrBetterPercent: (afterBirdieParOrBetter / afterBirdieScores.length) * 100,
            totalHoles: afterBirdieScores.length
        };
    }
    if (afterParScores.length > 0) {
        const avg = afterParScores.reduce((sum, s) => sum + s, 0) / afterParScores.length;
        momentum.afterPar = {
            nextHoleAverage: avg,
            parOrBetterPercent: (afterParParOrBetter / afterParScores.length) * 100,
            totalHoles: afterParScores.length
        };
    }
    if (afterBogeyScores.length > 0) {
        const avg = afterBogeyScores.reduce((sum, s) => sum + s, 0) / afterBogeyScores.length;
        momentum.afterBogey = {
            nextHoleAverage: avg,
            parOrBetterPercent: (afterBogeyParOrBetter / afterBogeyScores.length) * 100,
            totalHoles: afterBogeyScores.length
        };
    }
    // Front 9 vs Back 9 (only for 18-hole rounds)
    const rounds18Hole = rounds.filter(r => r.holes.length === 18);
    if (rounds18Hole.length > 0) {
        let frontNineTotal = 0;
        let backNineTotal = 0;
        rounds18Hole.forEach(round => {
            const front9Holes = round.holes.slice(0, 9);
            const back9Holes = round.holes.slice(9, 18);
            const front9ScoreToPar = front9Holes.reduce((sum, h) => sum + (h.score - h.par), 0);
            const back9ScoreToPar = back9Holes.reduce((sum, h) => sum + (h.score - h.par), 0);
            frontNineTotal += front9ScoreToPar;
            backNineTotal += back9ScoreToPar;
        });
        momentum.frontNineVsBackNine = {
            frontNineAverage: frontNineTotal / rounds18Hole.length,
            backNineAverage: backNineTotal / rounds18Hole.length,
            totalRounds: rounds18Hole.length
        };
    }
    // Early round (holes 1-6) vs Late round (holes 13-18)
    if (rounds18Hole.length > 0) {
        let earlyTotal = 0;
        let lateTotal = 0;
        rounds18Hole.forEach(round => {
            const earlyHoles = round.holes.slice(0, 6);
            const lateHoles = round.holes.slice(12, 18);
            const earlyScoreToPar = earlyHoles.reduce((sum, h) => sum + (h.score - h.par), 0);
            const lateScoreToPar = lateHoles.reduce((sum, h) => sum + (h.score - h.par), 0);
            earlyTotal += earlyScoreToPar;
            lateTotal += lateScoreToPar;
        });
        momentum.earlyRoundVsLateRound = {
            holes1to6Average: earlyTotal / rounds18Hole.length,
            holes13to18Average: lateTotal / rounds18Hole.length,
            totalRounds: rounds18Hole.length
        };
    }
    return momentum;
}
/**
 * Calculate course difficulty (for personal records)
 */
export function calculateCourseDifficulty(rounds) {
    // Group by course name + rating/slope combo (different tees are different courses)
    const courseKey = (round) => `${round.courseName}|${round.courseRating}|${round.slopeRating}`;
    const courseStats = new Map();
    rounds.forEach(round => {
        const key = courseKey(round);
        if (!courseStats.has(key)) {
            courseStats.set(key, {
                courseName: round.courseName,
                courseRating: round.courseRating,
                slopeRating: round.slopeRating,
                bestScore: round.totalScore,
                bestScoreToPar: round.scoreToPar,
                rounds: 0
            });
        }
        const stats = courseStats.get(key);
        // Update best score if this round is better
        if (round.totalScore < stats.bestScore) {
            stats.bestScore = round.totalScore;
            stats.bestScoreToPar = round.scoreToPar;
        }
        stats.rounds++;
    });
    // Get all courses (no minimum round requirement for difficulty tracking)
    const validCourses = Array.from(courseStats.values())
        .map(stats => ({
        ...stats,
        // Combined difficulty score: rating + (slope / 10)
        // This gives weight to both metrics (e.g., 75.0 rating + 139 slope = 88.9)
        difficultyScore: stats.courseRating + (stats.slopeRating / 10)
    }));
    if (validCourses.length === 0)
        return {};
    // Find course with highest difficulty score (most difficult)
    const mostDifficult = validCourses.reduce((max, course) => course.difficultyScore > max.difficultyScore ? course : max);
    // Find course with lowest difficulty score (easiest)
    const easiest = validCourses.reduce((min, course) => course.difficultyScore < min.difficultyScore ? course : min);
    return {
        mostDifficult: {
            courseName: mostDifficult.courseName,
            courseRating: mostDifficult.courseRating,
            slopeRating: mostDifficult.slopeRating,
            bestScore: mostDifficult.bestScore,
            bestScoreToPar: mostDifficult.bestScoreToPar,
            rounds: mostDifficult.rounds
        },
        easiest: {
            courseName: easiest.courseName,
            courseRating: easiest.courseRating,
            slopeRating: easiest.slopeRating,
            bestScore: easiest.bestScore,
            bestScoreToPar: easiest.bestScoreToPar,
            rounds: easiest.rounds
        }
    };
}
//# sourceMappingURL=performance.js.map