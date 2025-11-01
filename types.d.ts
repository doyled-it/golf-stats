/**
 * Golf Statistics Type Definitions
 * These types model data from 18birdies and GHIN APIs
 */
export interface Round {
    id: string;
    date: string;
    courseName: string;
    courseRating: number;
    slopeRating: number;
    tees: string;
    totalScore: number;
    par: number;
    scoreToPar: number;
    differential: number;
    exceptional: boolean;
    used: boolean;
    holes: HoleScore[];
}
export interface HoleScore {
    number: number;
    par: number;
    score: number;
    fairwayHit?: boolean;
    greenInRegulation: boolean;
    putts: number;
    penalties?: number;
    distance?: number;
}
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
    date: string;
    averagePuttsPerHole: number;
    threePuttCount: number;
    holesPlayed: number;
}
export interface BirdieConversion {
    opportunities: number;
    conversions: number;
    conversionRate: number;
    missedBirdies: number;
}
export interface ShotStatistics {
    totalRounds: number;
    fairwaysHitPercentage: number;
    greensInRegulationPercentage: number;
    averagePuttsPerRound: number;
    averagePuttsPerGIR: number;
    scrambling: number;
    penaltiesPerRound: number;
    scoringDistribution?: ScoringDistribution;
    holeTypePerformance?: HoleTypePerformance[];
    approachShotAccuracy?: ApproachShotAccuracy;
    puttingPerformance?: PuttingPerformance;
    birdieConversion?: BirdieConversion;
    strokesGained?: StrokesGained;
    performanceCorrelations?: PerformanceCorrelation[];
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
export interface HoleTypePerformance {
    parType: number;
    totalHoles: number;
    averageScoreToPar: number;
    birdiesOrBetter: number;
    birdiesOrBetterPercent: number;
    pars: number;
    parsPercent: number;
    bogeys: number;
    bogeysPercent: number;
    doublePlus: number;
    doublePlusPercent: number;
}
export interface ApproachShotAccuracy {
    totalShots: number;
    missedShortPercent: number;
    missedLongPercent: number;
    missedLeftPercent: number;
    missedRightPercent: number;
    onTargetPercent: number;
}
export interface RecentForm {
    roundCount: number;
    averageScoreToPar: number;
    trend: number;
    trendPercent: number;
    improving: boolean;
}
export interface StrokesGained {
    total: number;
    driving: number;
    approach: number;
    shortGame: number;
    putting: number;
    totalRounds: number;
}
export interface HoleDifficulty {
    holeNumber: number;
    par: number;
    averageScore: number;
    scoreToPar: number;
    difficulty: number;
    birdiePercent: number;
    parPercent: number;
    bogeyPercent: number;
    doublePlusPercent: number;
    roundsPlayed: number;
}
export interface PerformanceCorrelation {
    stat: string;
    correlation: number;
    impact: 'high' | 'medium' | 'low';
    description: string;
}
export interface HeatmapDay {
    date: string;
    roundCount: number;
    averageScoreToPar: number;
    rounds: Round[];
}
export interface ScoringHeatmap {
    startDate: string;
    endDate: string;
    days: HeatmapDay[];
}
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
        streakLength: number;
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
export interface MomentumIndicators {
    afterBirdie?: {
        nextHoleAverage: number;
        parOrBetterPercent: number;
        totalHoles: number;
    };
    afterBogey?: {
        nextHoleAverage: number;
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
export interface RoundMomentumPoint {
    holeNumber: number;
    score: number;
    par: number;
    scoreToPar: number;
    cumulativeScoreToPar: number;
}
export interface RoundMomentum {
    roundId: string;
    date: string;
    courseName: string;
    totalScore: number;
    scoreToPar: number;
    holes: RoundMomentumPoint[];
    turningPoint?: number;
}
export interface CourseLearningPoint {
    date: string;
    roundNumber: number;
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
    improvement: number;
    roundsToReachBest: number;
    progression: CourseLearningPoint[];
    trendDirection: 'improving' | 'stable' | 'declining';
}
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
    recentForm?: {
        last5?: RecentForm;
        last10?: RecentForm;
        last20?: RecentForm;
    };
    currentHandicap?: number;
    handicapHistory?: HandicapEntry[];
    scoringHeatmap?: ScoringHeatmap;
    personalRecords?: PersonalRecords;
    momentum?: MomentumIndicators;
}
export interface HandicapEntry {
    date: string;
    handicapIndex: number;
}
export interface CoursePerformance {
    courseName: string;
    rounds: number;
    averageScore: number;
    bestScore: number;
    worstScore: number;
    scoreToPar: number;
    par: number;
    lastPlayed?: string;
    roundsList: Round[];
    holeAverages?: HoleAverage[];
    holeDifficulty?: HoleDifficulty[];
}
export interface HoleAverage {
    number: number;
    par: number;
    averageScore: number;
    scoreToPar: number;
    birdiePlus: number;
    parOrBetter: number;
}
export interface GolfData {
    player: PlayerProfile;
    scoringTrends: ScoringTrends;
    shotStatistics: ShotStatistics;
    coursePerformance: CoursePerformance[];
    recentRounds: Round[];
    roundMomentum: RoundMomentum[];
    courseLearningCurves: CourseLearningCurve[];
    goalsData: GoalsData;
}
export interface PlayerProfile {
    name: string;
    ghinNumber?: string;
    handicapIndex?: number;
    homeClub?: string;
}
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
export interface Goal {
    id: string;
    description: string;
    targetHandicap: number;
    deadline: string;
    priority: 'near-term' | 'mid-term' | 'long-term';
}
export interface GoalProgress {
    goal: Goal;
    currentHandicap: number;
    handicapDelta: number;
    daysRemaining: number;
    requiredMonthlyImprovement: number;
    currentTrend: number;
    onTrack: boolean;
    projectedHandicap: number;
    projectedDate?: string;
    progressPercentage: number;
}
export interface GoalBurndownPoint {
    date: string;
    actualHandicap?: number;
    idealHandicap: number;
    goalHandicap?: number;
}
export interface GoalsData {
    goals: Goal[];
    progress: GoalProgress[];
    burndownData: GoalBurndownPoint[];
    startHandicap: number;
    startDate: string;
}
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
