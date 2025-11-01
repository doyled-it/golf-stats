/**
 * Golf Data Loader
 * Loads and transforms data from GHIN API
 */
import type { GolfData, Round, GHINScore } from '../types.js';
/**
 * Map course rating/slope to course names
 * Based on actual GHIN data
 */
export declare const COURSE_MAP: Record<string, string>;
/**
 * Transform GHIN score data into Round format
 */
export declare function transformGHINScore(ghinScore: GHINScore, index: number): Round;
export declare function getGolfData(): Promise<GolfData>;
