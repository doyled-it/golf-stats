/**
 * Golf Statistics Type Definitions
 * These types model data from 18birdies and GHIN APIs
 */

// Round and scoring data
export interface Round {
  id: string;
  date: string; // ISO date string
  courseName: string;
  courseRating: number;
  slopeRating: number;
  tees: string; // e.g., "Blue", "White"
  totalScore: number;
  par: number;
  scoreToPar: number; // +/- relative to par
  differential: number; // USGA handicap differential
  exceptional: boolean; // GHIN exceptional score indicator
  used: boolean; // Used in handicap calculation
  holes: HoleScore[];
}

export interface HoleScore {
  number: number; // 1-18
  par: number;
  score: number;
  fairwayHit?: boolean; // undefined for par 3s
  greenInRegulation: boolean;
  putts: number;
  penalties?: number;
  distance?: number; // in yards
}

// Putting performance
export interface PuttingPerformance {
  averagePuttsPerRound: number;
  averagePuttsPerGIR: number;
  averagePuttsWhenMissingGIR: number;
  onePuttPercentage: number;
  twoPuttPercentage: number;
  threePuttOrMorePercentage: number;
  totalPutts: number;
  totalHoles: number;
  puttingTrend?: PuttingTrendData[];
}

export interface PuttingTrendData {
  date: string; // Round date
  averagePuttsPerHole: number;
  threePuttCount: number;
  holesPlayed: number;
}

export interface BirdieConversion {
  opportunities: number; // Times you had a putt for birdie
  conversions: number; // Times you made the birdie
  conversionRate: number; // Percentage
  missedBirdies: number; // Opportunities you didn't convert
}

// Shot analytics
export interface ShotStatistics {
  totalRounds: number;
  fairwaysHitPercentage: number;
  greensInRegulationPercentage: number;
  averagePuttsPerRound: number;
  averagePuttsPerGIR: number;
  scrambling: number; // % of up-and-downs when missing GIR
  penaltiesPerRound: number;
  scoringDistribution?: ScoringDistribution;
  holeTypePerformance?: HoleTypePerformance[]; // Performance by par 3s, 4s, 5s
  approachShotAccuracy?: ApproachShotAccuracy; // Miss patterns
  puttingPerformance?: PuttingPerformance; // Detailed putting stats
  birdieConversion?: BirdieConversion; // Birdie opportunity conversion rate
  strokesGained?: StrokesGained; // Strokes gained analysis
  performanceCorrelations?: PerformanceCorrelation[]; // Stat correlations with scoring
}

export interface ScoringDistribution {
  birdiesOrBetter: number;
  birdiesOrBetterPercent: number;
  pars: number;
  parsPercent: number;
  bogeys: number;
  bogeysPercent: number;
  doubleBogeys: number;
  doubleBogeysPercent: number;
  triplePlus: number;
  triplePlusPercent: number;
  totalHoles: number;
}

// Performance by hole type (par)
export interface HoleTypePerformance {
  parType: number; // 3, 4, or 5
  totalHoles: number;
  averageScoreToPar: number;
  birdiesOrBetter: number;
  birdiesOrBetterPercent: number;
  pars: number;
  parsPercent: number;
  bogeys: number;
  bogeysPercent: number;
  doublePlus: number; // Double bogey or worse
  doublePlusPercent: number;
}

// Approach shot accuracy
export interface ApproachShotAccuracy {
  totalShots: number;
  missedShortPercent: number;
  missedLongPercent: number;
  missedLeftPercent: number;
  missedRightPercent: number;
  onTargetPercent: number; // GIR percentage
}

// Recent form tracking
export interface RecentForm {
  roundCount: number; // Number of rounds in this window
  averageScoreToPar: number;
  trend: number; // Difference from overall average (negative is better)
  trendPercent: number; // Percentage change
  improving: boolean; // True if trending better than overall
}

// Strokes gained analysis
export interface StrokesGained {
  total: number; // Total strokes gained vs handicap per round
  driving: number; // Strokes gained/lost off the tee
  approach: number; // Strokes gained/lost on approach shots
  shortGame: number; // Strokes gained/lost around the green
  putting: number; // Strokes gained/lost on the green
  totalRounds: number;
}

// Hole difficulty analysis
export interface HoleDifficulty {
  holeNumber: number;
  par: number;
  averageScore: number;
  scoreToPar: number;
  difficulty: number; // Ranking (1 = hardest, 18 = easiest)
  birdiePercent: number;
  parPercent: number;
  bogeyPercent: number;
  doublePlusPercent: number;
  roundsPlayed: number;
}

// Performance correlations
export interface PerformanceCorrelation {
  stat: string; // Name of the stat (e.g., "GIR %", "Fairways Hit %")
  correlation: number; // Correlation coefficient (-1 to 1)
  impact: 'high' | 'medium' | 'low'; // Impact level
  description: string; // What this stat measures
}

// Scoring heatmap
export interface HeatmapDay {
  date: string; // ISO date string
  roundCount: number; // Number of rounds played that day
  averageScoreToPar: number; // Average score to par (normalized to 18 holes)
  rounds: Round[]; // Actual rounds played that day
}

export interface ScoringHeatmap {
  startDate: string; // First date in heatmap
  endDate: string; // Last date in heatmap
  days: HeatmapDay[]; // All days with data
}

// Personal records
export interface PersonalRecords {
  bestScore9Hole?: {
    score: number;
    scoreToPar: number;
    date: string;
    course: string;
  };
  bestScore18Hole?: {
    score: number;
    scoreToPar: number;
    date: string;
    course: string;
  };
  mostBirdiesInRound?: {
    count: number;
    date: string;
    course: string;
  };
  bestGIRPercentage?: {
    percentage: number;
    date: string;
    course: string;
    girsHit: number;
    totalHoles: number;
  };
  bestFairwayPercentage?: {
    percentage: number;
    date: string;
    course: string;
    fairwaysHit: number;
    totalFairways: number;
  };
  fewestPutts?: {
    putts: number;
    date: string;
    course: string;
    holesPlayed: number;
  };
  bestDifferential?: {
    differential: number;
    score: number;
    date: string;
    course: string;
  };
  longestBirdieStreak?: {
    streakLength: number;
    startDate: string;
    endDate: string;
  };
  longestNoBogeyStreak?: {
    streakLength: number;
    startDate: string;
    endDate: string;
  };
  longestNoThreePuttStreak?: {
    streakLength: number; // in holes
    roundCount: number;
    startDate: string;
    endDate: string;
  };
  mostDifficultCourse?: {
    courseName: string;
    courseRating: number;
    slopeRating: number;
    bestScore: number;
    bestScoreToPar: number;
    rounds: number;
  };
  easiestCourse?: {
    courseName: string;
    courseRating: number;
    slopeRating: number;
    bestScore: number;
    bestScoreToPar: number;
    rounds: number;
  };
}

// Momentum tracking - performance patterns
export interface MomentumIndicators {
  afterBirdie?: {
    nextHoleAverage: number; // Average score on hole after birdie
    parOrBetterPercent: number;
    totalHoles: number;
  };
  afterBogey?: {
    nextHoleAverage: number; // Average score on hole after bogey
    parOrBetterPercent: number;
    totalHoles: number;
  };
  afterPar?: {
    nextHoleAverage: number;
    parOrBetterPercent: number;
    totalHoles: number;
  };
  frontNineVsBackNine?: {
    frontNineAverage: number;
    backNineAverage: number;
    totalRounds: number;
  };
  earlyRoundVsLateRound?: {
    holes1to6Average: number;
    holes13to18Average: number;
    totalRounds: number;
  };
}

// Round momentum - hole-by-hole scoring trajectory
export interface RoundMomentumPoint {
  holeNumber: number;
  score: number;
  par: number;
  scoreToPar: number;
  cumulativeScoreToPar: number; // Running total
}

export interface RoundMomentum {
  roundId: string;
  date: string;
  courseName: string;
  totalScore: number;
  scoreToPar: number;
  holes: RoundMomentumPoint[];
  turningPoint?: number; // Hole number where momentum shifted significantly
}

// Course learning curve - improvement tracking
export interface CourseLearningPoint {
  date: string;
  roundNumber: number; // nth time playing this course
  score: number;
  scoreToPar: number;
  differential: number;
}

export interface CourseLearningCurve {
  courseName: string;
  courseRating: number;
  slopeRating: number;
  totalRounds: number;
  firstScore: number;
  firstScoreToPar: number;
  bestScore: number;
  bestScoreToPar: number;
  latestScore: number;
  latestScoreToPar: number;
  averageScore: number;
  averageScoreToPar: number;
  improvement: number; // First score - latest score (positive = improved)
  roundsToReachBest: number; // How many rounds until best score
  progression: CourseLearningPoint[];
  trendDirection: 'improving' | 'stable' | 'declining';
}

// Scoring trends
export interface ScoringTrends {
  averageScore: number;
  lowestScore: number;
  lowestScore9Hole?: number;
  lowestScore18Hole?: number;
  bestScoreToPar9Hole?: number;
  bestScoreToPar18Hole?: number;
  highestScore: number;
  averageScoreToPar: number;
  scoringAverage30Days?: number;
  scoringAverage90Days?: number;
  roundHistory: Round[];

  // Recent form indicators
  recentForm?: {
    last5?: RecentForm;
    last10?: RecentForm;
    last20?: RecentForm;
  };

  // Handicap data from GHIN
  currentHandicap?: number;
  handicapHistory?: HandicapEntry[];

  // Scoring heatmap
  scoringHeatmap?: ScoringHeatmap;

  // Personal records
  personalRecords?: PersonalRecords;

  // Momentum tracking
  momentum?: MomentumIndicators;
}

export interface HandicapEntry {
  date: string;
  handicapIndex: number;
}

// Course performance
export interface CoursePerformance {
  courseName: string;
  rounds: number;
  averageScore: number;
  bestScore: number;
  worstScore: number;
  scoreToPar: number;
  par: number; // Course par
  lastPlayed?: string;

  // All rounds at this course
  roundsList: Round[];

  // Hole-by-hole averages
  holeAverages?: HoleAverage[];

  // Hole difficulty analysis
  holeDifficulty?: HoleDifficulty[];
}

export interface HoleAverage {
  number: number;
  par: number;
  averageScore: number;
  scoreToPar: number;
  birdiePlus: number; // % of rounds with birdie or better
  parOrBetter: number; // % of rounds at par or better
}

// Main data structure
export interface GolfData {
  player: PlayerProfile;
  scoringTrends: ScoringTrends;
  shotStatistics: ShotStatistics;
  coursePerformance: CoursePerformance[];
  recentRounds: Round[];
  roundMomentum: RoundMomentum[]; // Hole-by-hole momentum for recent rounds
  courseLearningCurves: CourseLearningCurve[]; // Learning curves for courses with 3+ rounds
  goalsData: GoalsData; // Goal tracking and progress
}

export interface PlayerProfile {
  name: string;
  ghinNumber?: string;
  handicapIndex?: number;
  homeClub?: string;
}

// GHIN API response types
export interface GHINGolfer {
  ghin: number;
  name: string;
  handicapIndex: number;
  club: string;
  state: string;
}

export interface GHINScore {
  id?: number;
  adjusted_gross_score: number;
  differential: number;
  played_at: string;
  course_name?: string;
  course_rating: number;
  slope_rating: number;
  course_par?: number;
  tee_name?: string;
  number_of_holes?: number;
  used: boolean;
  exceptional: boolean;
  statistics?: GHINStatistics | null;
  hole_details?: GHINHoleDetail[];
}

export interface GHINStatistics {
  birdies_or_better_percent?: number;
  bogeys_percent?: number;
  double_bogeys_percent?: number;
  fairway_hits_percent?: number | null;
  gir_percent?: number;
  missed_left_approach_shot_accuracy_percent?: number | null;
  missed_right_approach_shot_accuracy_percent?: number | null;
  missed_short_approach_shot_accuracy_percent?: number | null;
  missed_long_approach_shot_accuracy_percent?: number | null;
  missed_left_percent?: number | null;
  missed_long_percent?: number | null;
  missed_right_percent?: number | null;
  missed_short_percent?: number | null;
  pars_percent?: number;
  putts_per_gir?: number | null;
  putts_per_hole?: number | null;
  total_putts?: number;
  triple_bogeys_or_worse_percent?: number;
}

export interface GHINHoleDetail {
  hole_number: number;
  par: number;
  raw_score: number;
  adjusted_gross_score?: number;
  putts?: number;
  gir_flag?: boolean;
  fairway_hit?: boolean | null;
  approach_shot_accuracy?: number | null;
  drive_accuracy?: number | null;
}

export interface GHINData {
  golfer: GHINGolfer;
  scores: GHINScore[];
  metadata: {
    fetchedAt: string;
    totalRounds: number;
  };
}

// Goal tracking
export interface Goal {
  id: string;
  description: string;
  targetHandicap: number;
  deadline: string; // ISO date string
  priority: 'near-term' | 'mid-term' | 'long-term';
}

export interface GoalProgress {
  goal: Goal;
  currentHandicap: number;
  handicapDelta: number; // How much improvement needed (positive = need to improve)
  daysRemaining: number;
  requiredMonthlyImprovement: number; // Strokes per month
  currentTrend: number; // Recent improvement rate (strokes per month)
  onTrack: boolean;
  projectedHandicap: number; // Where you'll be at deadline based on current trend
  projectedDate?: string; // When you'll hit target based on current trend
  progressPercentage: number; // 0-100
}

export interface GoalBurndownPoint {
  date: string;
  actualHandicap?: number;
  idealHandicap: number; // Linear interpolation from start to goal
  goalHandicap?: number; // Mark goal milestones
}

export interface GoalsData {
  goals: Goal[];
  progress: GoalProgress[];
  burndownData: GoalBurndownPoint[];
  startHandicap: number;
  startDate: string;
}

// UI state
export interface AppState {
  currentView: 'overview' | 'scoring' | 'shots' | 'courses';
  selectedCourse?: string;
  selectedRound?: string;
  dateRange: DateRange;
}

export interface DateRange {
  start: Date;
  end: Date;
}
