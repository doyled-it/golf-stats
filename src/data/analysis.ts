/**
 * Advanced golf analytics - momentum and learning curves
 */

import type { Round, RoundMomentum, RoundMomentumPoint, CourseLearningCurve, CourseLearningPoint } from '../types.js';

/**
 * Calculate round momentum for recent rounds
 * Shows hole-by-hole scoring trajectory within each round
 */
export function calculateRoundMomentum(rounds: Round[], limit: number = 10): RoundMomentum[] {
  const momentum: RoundMomentum[] = [];

  // Take most recent rounds with hole data
  const roundsWithHoles = rounds
    .filter(r => r.holes && r.holes.length >= 9)
    .slice(0, limit);

  roundsWithHoles.forEach(round => {
    let cumulativeScoreToPar = 0;
    const holes: RoundMomentumPoint[] = [];

    // Safety check for holes array
    if (!round.holes) return;

    round.holes.forEach(hole => {
      const scoreToPar = hole.score - hole.par;
      cumulativeScoreToPar += scoreToPar;

      holes.push({
        holeNumber: hole.number,
        score: hole.score,
        par: hole.par,
        scoreToPar,
        cumulativeScoreToPar
      });
    });

    // Find turning point - biggest swing in momentum
    let turningPoint: number | undefined;
    let maxSwing = 0;

    for (let i = 1; i < holes.length; i++) {
      const swing = Math.abs(holes[i].scoreToPar - holes[i - 1].scoreToPar);
      if (swing > maxSwing) {
        maxSwing = swing;
        turningPoint = holes[i].holeNumber;
      }
    }

    momentum.push({
      roundId: round.id,
      date: round.date,
      courseName: round.courseName,
      totalScore: round.totalScore,
      scoreToPar: round.scoreToPar,
      holes,
      turningPoint: maxSwing >= 3 ? turningPoint : undefined // Only mark significant swings
    });
  });

  return momentum;
}

/**
 * Calculate learning curves for courses played 3+ times
 * Tracks improvement/regression over time at specific courses
 */
export function calculateCourseLearningCurves(rounds: Round[]): CourseLearningCurve[] {
  // Group rounds by course name + rating/slope combo
  const courseKey = (round: Round) => `${round.courseName}|${round.courseRating}|${round.slopeRating}`;
  const courseRounds = new Map<string, Round[]>();

  rounds.forEach(round => {
    const key = courseKey(round);
    if (!courseRounds.has(key)) {
      courseRounds.set(key, []);
    }
    courseRounds.get(key)!.push(round);
  });

  const learningCurves: CourseLearningCurve[] = [];

  courseRounds.forEach((courseRoundsList, key) => {
    // Only create learning curves for courses played 3+ times
    if (courseRoundsList.length < 3) return;

    // Sort by date
    const sortedRounds = courseRoundsList.sort((a, b) =>
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    const firstRound = sortedRounds[0];
    const latestRound = sortedRounds[sortedRounds.length - 1];

    // Find best score
    const bestRound = sortedRounds.reduce((best, round) =>
      round.totalScore < best.totalScore ? round : best
    );
    const bestRoundIndex = sortedRounds.indexOf(bestRound);

    // Calculate progression points
    const progression: CourseLearningPoint[] = sortedRounds.map((round, index) => ({
      date: round.date,
      roundNumber: index + 1,
      score: round.totalScore,
      scoreToPar: round.scoreToPar,
      differential: round.differential
    }));

    // Calculate averages
    const totalScore = sortedRounds.reduce((sum, r) => sum + r.totalScore, 0);
    const totalScoreToPar = sortedRounds.reduce((sum, r) => sum + r.scoreToPar, 0);
    const averageScore = totalScore / sortedRounds.length;
    const averageScoreToPar = totalScoreToPar / sortedRounds.length;

    // Determine trend direction
    const firstHalf = sortedRounds.slice(0, Math.ceil(sortedRounds.length / 2));
    const secondHalf = sortedRounds.slice(Math.floor(sortedRounds.length / 2));
    const firstHalfAvg = firstHalf.reduce((sum, r) => sum + r.scoreToPar, 0) / firstHalf.length;
    const secondHalfAvg = secondHalf.reduce((sum, r) => sum + r.scoreToPar, 0) / secondHalf.length;

    let trendDirection: 'improving' | 'stable' | 'declining';
    const trendDiff = firstHalfAvg - secondHalfAvg;
    if (trendDiff > 1.5) {
      trendDirection = 'improving';
    } else if (trendDiff < -1.5) {
      trendDirection = 'declining';
    } else {
      trendDirection = 'stable';
    }

    learningCurves.push({
      courseName: firstRound.courseName,
      courseRating: firstRound.courseRating,
      slopeRating: firstRound.slopeRating,
      totalRounds: sortedRounds.length,
      firstScore: firstRound.totalScore,
      firstScoreToPar: firstRound.scoreToPar,
      bestScore: bestRound.totalScore,
      bestScoreToPar: bestRound.scoreToPar,
      latestScore: latestRound.totalScore,
      latestScoreToPar: latestRound.scoreToPar,
      averageScore,
      averageScoreToPar,
      improvement: firstRound.scoreToPar - latestRound.scoreToPar, // Positive = improved
      roundsToReachBest: bestRoundIndex + 1,
      progression,
      trendDirection
    });
  });

  // Sort by total rounds (most played courses first)
  return learningCurves.sort((a, b) => b.totalRounds - a.totalRounds);
}
