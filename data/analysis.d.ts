/**
 * Advanced golf analytics - momentum and learning curves
 */
import type { Round, RoundMomentum, CourseLearningCurve } from '../types.js';
/**
 * Calculate round momentum for recent rounds
 * Shows hole-by-hole scoring trajectory within each round
 */
export declare function calculateRoundMomentum(rounds: Round[], limit?: number): RoundMomentum[];
/**
 * Calculate learning curves for courses played 3+ times
 * Tracks improvement/regression over time at specific courses
 */
export declare function calculateCourseLearningCurves(rounds: Round[]): CourseLearningCurve[];
