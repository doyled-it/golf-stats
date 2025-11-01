/**
 * Common utility functions shared across UI modules
 */
/**
 * Formats a date string into a readable format
 */
export declare function formatDate(dateString: string): string;
/**
 * Formats a score relative to par
 */
export declare function formatScoreToPar(score: number): string;
/**
 * Returns a CSS class based on score to par
 */
export declare function getScoreClass(scoreToPar: number): string;
/**
 * Sets text content of an element by ID
 */
export declare function setTextContent(id: string, text: string): void;
/**
 * Creates an SVG line chart
 */
export declare function createSVGLineChart(data: number[], labels: string[], yAxisLabel: string, color: string): string;
