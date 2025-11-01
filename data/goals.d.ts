/**
 * Goal tracking and progress calculation
 */
import type { Goal, GoalsData, HandicapEntry } from '../types.js';
/**
 * User's handicap goals
 * Edit these to set your own goals
 */
export declare const GOALS: Goal[];
/**
 * Calculate goal progress and burndown data
 */
export declare function calculateGoalsData(currentHandicap: number, handicapHistory: HandicapEntry[]): GoalsData;
