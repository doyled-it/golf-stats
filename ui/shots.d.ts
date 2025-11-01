/**
 * Shots view functions (Putting, Birdie Conversion, Approach Shots, Strokes Gained, Performance Correlations)
 */
import type { PuttingPerformance, BirdieConversion, ApproachShotAccuracy, StrokesGained, PerformanceCorrelation } from '../types.js';
/**
 * Populates putting performance section
 */
export declare function populatePuttingPerformance(putting: PuttingPerformance): void;
/**
 * Populates birdie conversion section
 */
export declare function populateBirdieConversion(birdie: BirdieConversion): void;
/**
 * Populates approach shot accuracy section
 */
export declare function populateApproachShotAccuracy(accuracy: ApproachShotAccuracy): void;
/**
 * Populates strokes gained section
 */
export declare function populateStrokesGained(sg: StrokesGained): void;
/**
 * Populates performance correlations (placeholder for future implementation)
 */
export declare function populatePerformanceCorrelations(correlations: PerformanceCorrelation[]): void;
