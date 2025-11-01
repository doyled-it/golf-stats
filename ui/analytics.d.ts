/**
 * Advanced Analytics UI - Round Momentum and Learning Curves
 */
import type { RoundMomentum, CourseLearningCurve } from '../types.js';
/**
 * Populate round momentum visualization
 * Shows hole-by-hole scoring patterns for recent rounds
 */
export declare function populateRoundMomentum(momentum: RoundMomentum[]): void;
/**
 * Create inline momentum chart for a single round (smaller, for table expansion)
 */
export declare function createInlineMomentumChart(round: RoundMomentum): string;
/**
 * Populate course learning curves
 * Shows improvement/regression at courses played multiple times
 */
export declare function populateCourseLearningCurves(curves: CourseLearningCurve[]): void;
