/**
 * Performance tracking and records calculation functions
 */
import type { Round, PersonalRecords, MomentumIndicators } from '../types.js';
/**
 * Calculate personal records from all rounds
 */
export declare function calculatePersonalRecords(rounds: Round[]): PersonalRecords;
/**
 * Calculate momentum indicators - performance patterns
 */
export declare function calculateMomentum(rounds: Round[]): MomentumIndicators;
/**
 * Calculate course difficulty (for personal records)
 */
export declare function calculateCourseDifficulty(rounds: Round[]): {
    mostDifficult?: any;
    easiest?: any;
};
