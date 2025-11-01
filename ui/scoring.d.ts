/**
 * Scoring view functions (Scoring Trends, Heatmap, Handicap History, Hole Type Performance)
 */
import type { HandicapEntry, Round, ScoringHeatmap, HoleTypePerformance, RoundMomentum } from '../types.js';
/**
 * Populates scoring trends - all rounds table with expandable momentum
 */
export declare function populateScoringTrends(rounds: Round[], roundMomentum: RoundMomentum[]): void;
/**
 * Creates the scoring heatmap visualization
 */
export declare function populateScoringHeatmap(heatmap: ScoringHeatmap): void;
/**
 * Creates handicap history chart
 */
export declare function populateHandicapHistory(history: HandicapEntry[]): void;
/**
 * Creates score history chart
 */
export declare function populateScoreHistory(rounds: Round[]): void;
/**
 * Populates hole type performance
 */
export declare function populateHoleTypePerformance(holeTypes: HoleTypePerformance[]): void;
