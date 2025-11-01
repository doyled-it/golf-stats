/**
 * Dashboard/Overview view functions
 */
import type { ScoringDistribution, Round } from '../types.js';
/**
 * Populates the scoring distribution chart
 */
export declare function populateScoringDistribution(distribution: ScoringDistribution): void;
/**
 * Populates the recent rounds table
 */
export declare function populateRecentRounds(rounds: Round[]): void;
