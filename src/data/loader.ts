/**
 * Golf Data Loader
 * Loads and transforms data from GHIN API
 */

import type {
  GolfData,
  Round,
  HoleScore,
  CoursePerformance,
  HandicapEntry,
  HoleTypePerformance,
  ApproachShotAccuracy,
  GHINData,
  GHINScore
} from '../types.js';

import {
  calculateRecentForm,
  calculateScoringHeatmap,
  calculateHoleDifficulty
} from './scoring.js';

import {
  calculateBirdieConversion,
  calculatePuttingPerformance,
  calculateStrokesGained,
  calculatePerformanceCorrelations
} from './shots.js';

import {
  calculatePersonalRecords,
  calculateMomentum,
  calculateCourseDifficulty
} from './performance.js';

import {
  calculateRoundMomentum,
  calculateCourseLearningCurves
} from './analysis.js';

import {
  calculateGoalsData
} from './goals.js';

/**
 * Map course rating/slope to course names
 * Based on actual GHIN data
 */
export const COURSE_MAP: Record<string, string> = {
  '25.8/76': 'The Loma Club',
  '30.5/96': 'Balboa Park Golf Club (9 Hole)',
  '71.5/126': 'Balboa Park Golf Club (18 Hole)',
  '68.3/119': 'Sea \'N Air Golf Course',
  '75/139': 'Torrey Pines Municipal GC (South)',
  '71.5/125': 'Torrey Pines Municipal GC (North)',
  '70.8/126': 'Noosa Springs Country Club',
  '68.9/131': 'Mt. Woodson Golf Club',
  '66.5/125': 'Mt. Woodson Golf Club',
  '68.4/120': 'The Golf Club at Redmond Ridge',
  '69.2/120': 'Balboa Park Golf Club (18 Hole)',
  '70.1/123': 'Balboa Park Golf Club (18 Hole)',
  '53.4/73': 'Mission Bay Golf Course',
  '70/126': 'Sierra Sage Golf Course'
};

/**
 * Transform GHIN score data into Round format
 */
export function transformGHINScore(ghinScore: GHINScore, index: number): Round {
  // Calculate par from hole details or use default
  let par = 72; // Default
  if (ghinScore.hole_details && ghinScore.hole_details.length > 0) {
    par = ghinScore.hole_details.reduce((sum, hole) => sum + hole.par, 0);
  } else if (ghinScore.number_of_holes === 9) {
    par = 36; // Typical 9-hole par
  }

  const totalScore = ghinScore.adjusted_gross_score;
  const scoreToPar = totalScore - par;

  // Transform hole details if available
  const holes: HoleScore[] = ghinScore.hole_details?.map(hole => ({
    number: hole.hole_number,
    par: hole.par,
    score: hole.adjusted_gross_score || hole.raw_score,
    fairwayHit: hole.fairway_hit ?? undefined,
    greenInRegulation: hole.gir_flag || false,
    putts: hole.putts || 0,
    penalties: 0, // Not available in GHIN data
    distance: undefined
  })) || [];

  // Generate a course name from rating and slope if not provided
  const ratingKey = `${ghinScore.course_rating}/${ghinScore.slope_rating}`;
  const courseName = ghinScore.course_name ||
    COURSE_MAP[ratingKey] ||
    `Course ${ghinScore.course_rating}/${ghinScore.slope_rating}`;

  // Generate tee name based on number of holes and rating
  let teeName = ghinScore.tee_name;
  if (!teeName) {
    if (ghinScore.number_of_holes === 9) {
      teeName = '9-Hole';
    } else {
      // Specific course tee mappings
      if (ratingKey === '71.5/125') {
        teeName = 'Blue Tees'; // Torrey Pines North
      } else if (ratingKey === '70.8/126') {
        teeName = 'Blue Tees'; // Noosa Springs
      } else if (ratingKey === '75/139') {
        teeName = 'Blue Tees'; // Torrey Pines South (assumed)
      } else if (ghinScore.course_rating >= 70) {
        teeName = 'White Tees';
      } else {
        teeName = 'Gold Tees';
      }
    }
  }

  return {
    id: `ghin-${ghinScore.id || index}`,
    date: new Date(ghinScore.played_at).toISOString().split('T')[0],
    courseName,
    courseRating: ghinScore.course_rating,
    slopeRating: ghinScore.slope_rating,
    tees: teeName,
    totalScore,
    par,
    scoreToPar,
    differential: Math.round(ghinScore.differential * 10) / 10,
    exceptional: ghinScore.exceptional,
    used: ghinScore.used,
    holes
  };
}

/**
 * Load and process GHIN data
 */
async function loadGHINData(): Promise<GolfData> {
  const response = await fetch('./ghin-data.json');
  const ghinData: GHINData = await response.json();

  // Load actual GHIN handicap history for goal tracking
  const ghinHandicapResponse = await fetch('./ghin-handicap-history.json');
  const ghinHandicapHistory: HandicapEntry[] = await ghinHandicapResponse.json();

  // Transform scores into rounds
  const rounds = ghinData.scores.map((score, idx) => transformGHINScore(score, idx));

  // Generate handicap history using simple "best 8 of 20" calculation
  // This shows the underlying trend before GHIN applies caps and adjustments
  const handicapHistory: HandicapEntry[] = [];
  const sortedScores = [...ghinData.scores].sort((a, b) =>
    new Date(a.played_at).getTime() - new Date(b.played_at).getTime()
  );

  // Calculate handicap after each round to show progression
  sortedScores.forEach((score, index) => {
    // Only create entries periodically (every 2 rounds) to avoid too many points
    if (index % 2 !== 0 && index !== sortedScores.length - 1) return;

    // Get the most recent 20 scores up to this point
    const recentScores = sortedScores.slice(Math.max(0, index - 19), index + 1);

    // World Handicap System: best 8 of available scores
    const sortedDiffs = recentScores.map(s => s.differential).sort((a, b) => a - b);
    const numToUse = Math.min(8, Math.max(1, Math.floor(recentScores.length / 2.5)));
    const bestDiffs = sortedDiffs.slice(0, numToUse);
    const avgDifferential = bestDiffs.reduce((sum, d) => sum + d, 0) / bestDiffs.length;

    // Truncate to one decimal place per USGA rules
    const calculatedHandicap = Math.floor(avgDifferential * 10) / 10;

    handicapHistory.push({
      date: new Date(score.played_at).toISOString().split('T')[0],
      handicapIndex: calculatedHandicap
    });
  });

  // Calculate course performance
  const coursePerformanceMap = new Map<string, CoursePerformance>();

  rounds.forEach(round => {
    if (!coursePerformanceMap.has(round.courseName)) {
      coursePerformanceMap.set(round.courseName, {
        courseName: round.courseName,
        rounds: 0,
        averageScore: 0,
        bestScore: Infinity,
        worstScore: -Infinity,
        scoreToPar: 0,
        par: round.par,
        roundsList: [],
        holeAverages: round.holes.length === 18 ? Array.from({ length: 18 }, (_, i) => ({
          number: i + 1,
          par: round.holes[i]?.par || 4,
          averageScore: 0,
          scoreToPar: 0,
          birdiePlus: 0,
          parOrBetter: 0
        })) : undefined
      });
    }

    const perf = coursePerformanceMap.get(round.courseName)!;
    perf.rounds++;
    perf.roundsList.push(round); // Add round to list
    perf.averageScore = ((perf.averageScore * (perf.rounds - 1)) + round.totalScore) / perf.rounds;
    perf.bestScore = Math.min(perf.bestScore, round.totalScore);
    perf.worstScore = Math.max(perf.worstScore, round.totalScore);
    perf.scoreToPar = ((perf.scoreToPar * (perf.rounds - 1)) + round.scoreToPar) / perf.rounds;
    perf.lastPlayed = round.date;

    // Update hole averages if hole details are available
    if (round.holes.length === 18 && perf.holeAverages) {
      round.holes.forEach((hole, idx) => {
        const holeAvg = perf.holeAverages![idx];
        holeAvg.averageScore = ((holeAvg.averageScore * (perf.rounds - 1)) + hole.score) / perf.rounds;
        holeAvg.scoreToPar = holeAvg.averageScore - holeAvg.par;
        if (hole.score < holeAvg.par) holeAvg.birdiePlus += (1 / perf.rounds) * 100;
        if (hole.score <= holeAvg.par) holeAvg.parOrBetter += (1 / perf.rounds) * 100;
      });
    }
  });

  // Calculate shot statistics from rounds with hole details
  const roundsWithHoles = rounds.filter(r => r.holes.length > 0);

  const totalFairways = roundsWithHoles.reduce((sum, r) =>
    sum + r.holes.filter(h => h.fairwayHit !== undefined && h.fairwayHit !== null).length, 0
  );
  const fairwaysHit = roundsWithHoles.reduce((sum, r) =>
    sum + r.holes.filter(h => h.fairwayHit === true).length, 0
  );

  // Count total holes played (not rounds * 18, since we have 9-hole rounds)
  const totalHoles = roundsWithHoles.reduce((sum, r) => sum + r.holes.length, 0);
  const greensHit = roundsWithHoles.reduce((sum, r) =>
    sum + r.holes.filter(h => h.greenInRegulation === true).length, 0
  );

  const totalPutts = roundsWithHoles.reduce((sum, r) =>
    sum + r.holes.reduce((pSum, h) => pSum + (h.putts || 0), 0), 0
  );
  const girPutts = roundsWithHoles.reduce((sum, r) =>
    sum + r.holes.filter(h => h.greenInRegulation).reduce((pSum, h) => pSum + (h.putts || 0), 0), 0
  );
  const missedGIRUpDowns = roundsWithHoles.reduce((sum, r) =>
    sum + r.holes.filter(h => !h.greenInRegulation && h.score <= h.par).length, 0
  );
  const missedGIRTotal = roundsWithHoles.reduce((sum, r) =>
    sum + r.holes.filter(h => !h.greenInRegulation).length, 0
  );

  // Calculate best scores by format (9-hole vs 18-hole), relative to par
  const rounds9Hole = rounds.filter(r => r.par <= 36);
  const rounds18Hole = rounds.filter(r => r.par > 36);

  const best9HoleScore = rounds9Hole.length > 0 ? Math.min(...rounds9Hole.map(r => r.scoreToPar)) : undefined;
  const best18HoleScore = rounds18Hole.length > 0 ? Math.min(...rounds18Hole.map(r => r.scoreToPar)) : undefined;

  const lowest9Hole = rounds9Hole.length > 0 ? Math.min(...rounds9Hole.map(r => r.totalScore)) : undefined;
  const lowest18Hole = rounds18Hole.length > 0 ? Math.min(...rounds18Hole.map(r => r.totalScore)) : undefined;

  // Calculate time-based averages
  const now = new Date().getTime();
  const rounds30Days = rounds.filter(r => {
    const daysDiff = (now - new Date(r.date).getTime()) / (1000 * 60 * 60 * 24);
    return daysDiff <= 30;
  });
  const rounds90Days = rounds.filter(r => {
    const daysDiff = (now - new Date(r.date).getTime()) / (1000 * 60 * 60 * 24);
    return daysDiff <= 90;
  });

  // Calculate scoring distribution (from hole-by-hole data)
  let birdiesOrBetter = 0;
  let pars = 0;
  let bogeys = 0;
  let doubleBogeys = 0;
  let triplePlus = 0;

  roundsWithHoles.forEach(round => {
    round.holes.forEach(hole => {
      const scoreToPar = hole.score - hole.par;
      if (scoreToPar <= -1) birdiesOrBetter++;
      else if (scoreToPar === 0) pars++;
      else if (scoreToPar === 1) bogeys++;
      else if (scoreToPar === 2) doubleBogeys++;
      else triplePlus++;
    });
  });

  const totalHolesScored = birdiesOrBetter + pars + bogeys + doubleBogeys + triplePlus;

  // Calculate performance by hole type (par 3s, 4s, 5s)
  const holeTypeStats = new Map<number, {
    totalHoles: number;
    totalScoreToPar: number;
    birdiesOrBetter: number;
    pars: number;
    bogeys: number;
    doublePlus: number;
  }>();

  // Initialize for par 3, 4, 5
  [3, 4, 5].forEach(par => {
    holeTypeStats.set(par, {
      totalHoles: 0,
      totalScoreToPar: 0,
      birdiesOrBetter: 0,
      pars: 0,
      bogeys: 0,
      doublePlus: 0
    });
  });

  // Aggregate stats by hole type
  roundsWithHoles.forEach(round => {
    round.holes.forEach(hole => {
      const stats = holeTypeStats.get(hole.par);
      if (!stats) return; // Skip if not par 3, 4, or 5

      stats.totalHoles++;
      stats.totalScoreToPar += (hole.score - hole.par);

      const scoreToPar = hole.score - hole.par;
      if (scoreToPar <= -1) stats.birdiesOrBetter++;
      else if (scoreToPar === 0) stats.pars++;
      else if (scoreToPar === 1) stats.bogeys++;
      else stats.doublePlus++; // Double bogey or worse
    });
  });

  // Convert to HoleTypePerformance array
  const holeTypePerformance: HoleTypePerformance[] = Array.from(holeTypeStats.entries())
    .filter(([_, stats]) => stats.totalHoles > 0)
    .map(([parType, stats]) => ({
      parType,
      totalHoles: stats.totalHoles,
      averageScoreToPar: stats.totalScoreToPar / stats.totalHoles,
      birdiesOrBetter: stats.birdiesOrBetter,
      birdiesOrBetterPercent: (stats.birdiesOrBetter / stats.totalHoles) * 100,
      pars: stats.pars,
      parsPercent: (stats.pars / stats.totalHoles) * 100,
      bogeys: stats.bogeys,
      bogeysPercent: (stats.bogeys / stats.totalHoles) * 100,
      doublePlus: stats.doublePlus,
      doublePlusPercent: (stats.doublePlus / stats.totalHoles) * 100
    }))
    .sort((a, b) => a.parType - b.parType);

  // Calculate approach shot accuracy from GHIN statistics
  const scoresWithStats = ghinData.scores.filter(s => s.statistics);
  let approachShotAccuracy: ApproachShotAccuracy | undefined;

  if (scoresWithStats.length > 0) {
    let totalShorts = 0, totalLongs = 0, totalLefts = 0, totalRights = 0;
    let validShots = 0;

    scoresWithStats.forEach(score => {
      const stats = score.statistics;
      if (stats && (stats.missed_short_approach_shot_accuracy_percent !== null ||
                     stats.missed_long_approach_shot_accuracy_percent !== null ||
                     stats.missed_left_approach_shot_accuracy_percent !== null ||
                     stats.missed_right_approach_shot_accuracy_percent !== null)) {
        totalShorts += stats.missed_short_approach_shot_accuracy_percent || 0;
        totalLongs += stats.missed_long_approach_shot_accuracy_percent || 0;
        totalLefts += stats.missed_left_approach_shot_accuracy_percent || 0;
        totalRights += stats.missed_right_approach_shot_accuracy_percent || 0;
        validShots++;
      }
    });

    if (validShots > 0) {
      const avgGIR = greensHit > 0 ? (greensHit / totalHoles) * 100 : 0;
      approachShotAccuracy = {
        totalShots: totalHoles,
        missedShortPercent: (totalShorts / validShots) * 100,
        missedLongPercent: (totalLongs / validShots) * 100,
        missedLeftPercent: (totalLefts / validShots) * 100,
        missedRightPercent: (totalRights / validShots) * 100,
        onTargetPercent: avgGIR
      };
    }
  }

  // Calculate detailed putting performance
  const puttingPerformance = calculatePuttingPerformance(roundsWithHoles);

  // Calculate birdie conversion rate
  const birdieConversion = calculateBirdieConversion(roundsWithHoles);

  // Calculate strokes gained analysis (vs scratch golfer)
  const strokesGained = calculateStrokesGained(roundsWithHoles, 0);

  // Calculate performance correlations
  const performanceCorrelations = calculatePerformanceCorrelations(roundsWithHoles);

  // Calculate recent form indicators (last 5, 10, 20 rounds)
  // Use strokes-to-par per hole to normalize across 9-hole and 18-hole rounds
  const totalHolesPlayed = rounds.reduce((sum, r) => sum + (r.par <= 36 ? 9 : 18), 0);
  const totalScoreToPar = rounds.reduce((sum, r) => sum + r.scoreToPar, 0);
  const overallAverageScoreToParPerHole = totalScoreToPar / totalHolesPlayed;

  const sortedRounds = [...rounds].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const recentForm = {
    last5: calculateRecentForm(sortedRounds.slice(0, 5), overallAverageScoreToParPerHole),
    last10: calculateRecentForm(sortedRounds.slice(0, 10), overallAverageScoreToParPerHole),
    last20: calculateRecentForm(sortedRounds.slice(0, 20), overallAverageScoreToParPerHole)
  };

  // Calculate scoring heatmap (last 12 months)
  const scoringHeatmap = calculateScoringHeatmap(rounds);

  // Calculate personal records
  const personalRecords = calculatePersonalRecords(rounds);

  // Add course difficulty to personal records
  const courseDifficulty = calculateCourseDifficulty(rounds);
  if (courseDifficulty.mostDifficult) {
    personalRecords.mostDifficultCourse = courseDifficulty.mostDifficult;
  }
  if (courseDifficulty.easiest) {
    personalRecords.easiestCourse = courseDifficulty.easiest;
  }

  // Calculate momentum indicators (performance patterns)
  const momentum = calculateMomentum(roundsWithHoles);

  return {
    player: {
      name: ghinData.golfer.name,
      ghinNumber: ghinData.golfer.ghin.toString(),
      handicapIndex: ghinData.golfer.handicapIndex,
      homeClub: ghinData.golfer.club
    },

    scoringTrends: {
      averageScore: rounds.reduce((sum, r) => sum + r.totalScore, 0) / rounds.length,
      lowestScore: Math.min(...rounds.map(r => r.totalScore)),
      lowestScore9Hole: lowest9Hole,
      lowestScore18Hole: lowest18Hole,
      bestScoreToPar9Hole: best9HoleScore,
      bestScoreToPar18Hole: best18HoleScore,
      highestScore: Math.max(...rounds.map(r => r.totalScore)),
      // Normalize to per-hole, then scale to 18-hole equivalent for display
      averageScoreToPar: overallAverageScoreToParPerHole * 18,
      scoringAverage30Days: rounds30Days.length > 0
        ? rounds30Days.reduce((sum, r) => sum + r.totalScore, 0) / rounds30Days.length
        : undefined,
      scoringAverage90Days: rounds90Days.length > 0
        ? rounds90Days.reduce((sum, r) => sum + r.totalScore, 0) / rounds90Days.length
        : undefined,
      roundHistory: rounds,
      recentForm,
      currentHandicap: ghinData.golfer.handicapIndex,
      handicapHistory,
      scoringHeatmap,
      personalRecords,
      momentum
    },

    shotStatistics: {
      totalRounds: rounds.length,
      fairwaysHitPercentage: totalFairways > 0 ? (fairwaysHit / totalFairways) * 100 : 0,
      greensInRegulationPercentage: totalHoles > 0 ? (greensHit / totalHoles) * 100 : 0,
      averagePuttsPerRound: roundsWithHoles.length > 0 ? totalPutts / roundsWithHoles.length : 0,
      averagePuttsPerGIR: greensHit > 0 ? girPutts / greensHit : 0,
      scrambling: missedGIRTotal > 0 ? (missedGIRUpDowns / missedGIRTotal) * 100 : 0,
      penaltiesPerRound: 0, // Not available in GHIN data
      scoringDistribution: totalHolesScored > 0 ? {
        birdiesOrBetter,
        birdiesOrBetterPercent: (birdiesOrBetter / totalHolesScored) * 100,
        pars,
        parsPercent: (pars / totalHolesScored) * 100,
        bogeys,
        bogeysPercent: (bogeys / totalHolesScored) * 100,
        doubleBogeys,
        doubleBogeysPercent: (doubleBogeys / totalHolesScored) * 100,
        triplePlus,
        triplePlusPercent: (triplePlus / totalHolesScored) * 100,
        totalHoles: totalHolesScored
      } : undefined,
      holeTypePerformance: holeTypePerformance.length > 0 ? holeTypePerformance : undefined,
      approachShotAccuracy,
      puttingPerformance,
      birdieConversion,
      strokesGained,
      performanceCorrelations
    },

    coursePerformance: Array.from(coursePerformanceMap.values())
      .map(course => ({
        ...course,
        // Sort rounds by date (most recent first)
        roundsList: course.roundsList.sort((a, b) =>
          new Date(b.date).getTime() - new Date(a.date).getTime()
        ),
        // Calculate hole difficulty for this course
        holeDifficulty: calculateHoleDifficulty(course.roundsList)
      }))
      .sort((a, b) => b.rounds - a.rounds),

    recentRounds: rounds.slice(0, 10),

    // Advanced analytics
    roundMomentum: calculateRoundMomentum(rounds, 10),
    courseLearningCurves: calculateCourseLearningCurves(rounds),

    // Goal tracking - use actual GHIN handicap history
    goalsData: calculateGoalsData(
      ghinHandicapHistory[ghinHandicapHistory.length - 1].handicapIndex,
      ghinHandicapHistory
    )
  };
}

// Export a promise that resolves to the golf data
let golfDataPromise: Promise<GolfData> | null = null;

export function getGolfData(): Promise<GolfData> {
  if (!golfDataPromise) {
    golfDataPromise = loadGHINData();
  }
  return golfDataPromise;
}
