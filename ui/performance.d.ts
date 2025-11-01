/**
 * Performance view functions (Personal Records, Momentum, Recent Form)
 */
import type { PersonalRecords, MomentumIndicators, RecentForm, Round } from '../types.js';
/**
 * Populates personal records section
 */
export declare function populatePersonalRecords(records: PersonalRecords): void;
/**
 * Populates momentum indicators section
 */
export declare function populateMomentum(momentum: MomentumIndicators): void;
/**
 * Populates recent form indicators
 */
export declare function populateRecentForm(recentForm: {
    last5?: RecentForm;
    last10?: RecentForm;
    last20?: RecentForm;
}, recentRounds: Round[]): void;
