/**
 * Shot performance calculation functions
 */
import type { Round, BirdieConversion, PuttingPerformance, StrokesGained, PerformanceCorrelation } from '../types.js';
/**
 * Calculate birdie opportunity conversion rate
 * Tracks how often you convert birdie opportunities (GIRs) into actual birdies
 */
export declare function calculateBirdieConversion(rounds: Round[]): BirdieConversion | undefined;
/**
 * Calculate detailed putting performance statistics
 * Includes breakdown by putt count and trend over time
 */
export declare function calculatePuttingPerformance(rounds: Round[]): PuttingPerformance | undefined;
/**
 * Calculate performance vs scratch golfer
 * Uses actual scoring data and course ratings to estimate stroke allocation
 */
export declare function calculateStrokesGained(rounds: Round[], handicapIndex?: number): StrokesGained | undefined;
/**
 * Calculate performance correlations
 * Shows which stats correlate most strongly with better scores
 */
export declare function calculatePerformanceCorrelations(rounds: Round[]): PerformanceCorrelation[] | undefined;
