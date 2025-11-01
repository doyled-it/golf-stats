/**
 * Scoring-related calculation functions
 */
import type { Round, RecentForm, ScoringHeatmap, HoleDifficulty } from '../types.js';
/**
 * Calculate recent form indicator
 * Normalizes for 9-hole vs 18-hole rounds by using strokes per hole
 */
export declare function calculateRecentForm(recentRounds: Round[], overallAveragePerHole: number): RecentForm | undefined;
/**
 * Calculate scoring heatmap data for the last 12 months
 * Groups rounds by date and normalizes scores to 18-hole equivalent
 */
export declare function calculateScoringHeatmap(rounds: Round[]): ScoringHeatmap;
/**
 * Calculate hole difficulty for a course
 */
export declare function calculateHoleDifficulty(rounds: Round[]): HoleDifficulty[] | undefined;
