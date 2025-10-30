/**
 * Shots view functions (Putting, Birdie Conversion, Approach Shots, Strokes Gained, Performance Correlations)
 */

import type { PuttingPerformance, BirdieConversion, ApproachShotAccuracy, StrokesGained, PerformanceCorrelation } from '../types.js';
import { formatDate, createSVGLineChart } from './common.js';

/**
 * Populates putting performance section
 */
export function populatePuttingPerformance(putting: PuttingPerformance): void {
    const container = document.getElementById('putting-performance-container');
    if (!container) return;

    let html = `
        <div class="putting-stats-grid">
            <div class="putting-stat-card">
                <div class="putting-stat-label">1-Putt %</div>
                <div class="putting-stat-value" style="color: #4CAF50">${putting.onePuttPercentage.toFixed(1)}%</div>
            </div>
            <div class="putting-stat-card">
                <div class="putting-stat-label">2-Putt %</div>
                <div class="putting-stat-value" style="color: #81C784">${putting.twoPuttPercentage.toFixed(1)}%</div>
            </div>
            <div class="putting-stat-card">
                <div class="putting-stat-label">3+ Putt %</div>
                <div class="putting-stat-value" style="color: #FF9800">${putting.threePuttOrMorePercentage.toFixed(1)}%</div>
            </div>
            <div class="putting-stat-card">
                <div class="putting-stat-label">Avg Putts/Round</div>
                <div class="putting-stat-value">${putting.averagePuttsPerRound.toFixed(1)}</div>
            </div>
            <div class="putting-stat-card">
                <div class="putting-stat-label">Avg Putts on GIR</div>
                <div class="putting-stat-value">${putting.averagePuttsPerGIR.toFixed(2)}</div>
            </div>
            <div class="putting-stat-card">
                <div class="putting-stat-label">Avg Putts when Missing GIR</div>
                <div class="putting-stat-value">${putting.averagePuttsWhenMissingGIR.toFixed(2)}</div>
            </div>
        </div>
    `;

    // Add putting efficiency trend chart
    if (putting.puttingTrend && putting.puttingTrend.length > 0) {
        html += `
            <div class="putting-trend-section">
                <h4 class="putting-trend-title">Putting Efficiency Trend</h4>
                <div id="putting-trend-chart" class="chart-container"></div>
            </div>
        `;
    }

    container.innerHTML = html;

    // Create the trend chart if data exists
    if (putting.puttingTrend && putting.puttingTrend.length > 0) {
        createPuttingTrendChart(putting.puttingTrend);
    }
}

/**
 * Creates putting trend chart
 */
function createPuttingTrendChart(trendData: PuttingPerformance['puttingTrend']): void {
    const container = document.getElementById('putting-trend-chart');
    if (!container || !trendData) return;

    // Use last 20 rounds for the trend
    const recentData = trendData.slice(-20);

    // Calculate rolling average (5-round window) for smoothing
    const rollingAvg: number[] = [];
    const labels: string[] = [];

    recentData.forEach((data, index) => {
        const windowStart = Math.max(0, index - 4);
        const window = recentData.slice(windowStart, index + 1);
        const avg = window.reduce((sum, d) => sum + d.averagePuttsPerHole, 0) / window.length;
        rollingAvg.push(avg);
        labels.push(formatDate(data.date));
    });

    container.innerHTML = createSVGLineChart(
        rollingAvg,
        labels,
        'Avg Putts/Hole (5-round avg)',
        '#9C27B0'
    );
}

/**
 * Populates birdie conversion section
 */
export function populateBirdieConversion(birdie: BirdieConversion): void {
    const container = document.getElementById('birdie-conversion-container');
    if (!container) return;

    const conversionRate = birdie.conversionRate;
    // Scale to 50% max (so 25% conversion = 50% of bar width)
    const maxScale = 50;
    const barWidth = Math.min((conversionRate / maxScale) * 100, 100);

    // Create a visual progress bar for conversion rate
    let html = `
        <div class="birdie-conversion-stats">
            <div class="birdie-stat-row">
                <div class="birdie-stat-item">
                    <div class="birdie-stat-label">Birdie Opportunities</div>
                    <div class="birdie-stat-value">${birdie.opportunities}</div>
                    <div class="birdie-stat-note">Times you had GIR</div>
                </div>
                <div class="birdie-stat-item">
                    <div class="birdie-stat-label">Birdies Made</div>
                    <div class="birdie-stat-value" style="color: #4CAF50">${birdie.conversions}</div>
                    <div class="birdie-stat-note">Converted opportunities</div>
                </div>
                <div class="birdie-stat-item">
                    <div class="birdie-stat-label">Conversion Rate</div>
                    <div class="birdie-stat-value" style="color: #FF9800">${conversionRate.toFixed(1)}%</div>
                    <div class="birdie-stat-note">Success rate</div>
                </div>
                <div class="birdie-stat-item">
                    <div class="birdie-stat-label">Missed Birdies</div>
                    <div class="birdie-stat-value" style="color: #ef5350">${birdie.missedBirdies}</div>
                    <div class="birdie-stat-note">Opportunities not converted</div>
                </div>
            </div>

            <div class="birdie-progress-section">
                <div class="birdie-progress-label">Conversion Rate</div>
                <div class="birdie-progress-bar-container">
                    <!-- Progress bar -->
                    <div class="birdie-progress-bar" style="width: ${barWidth}%; background: linear-gradient(90deg, #4CAF50 0%, #FF9800 100%);">
                        <span class="birdie-progress-text">${conversionRate.toFixed(1)}%</span>
                    </div>

                    <!-- Benchmark lines (on top) -->
                    <div class="birdie-benchmark-line" style="left: ${(5 / maxScale) * 100}%;" title="High Handicap (18+): ~5%">
                        <div class="birdie-benchmark-label">18+ HCP</div>
                    </div>
                    <div class="birdie-benchmark-line" style="left: ${(10 / maxScale) * 100}%;" title="Mid Handicap (10-18): ~10%">
                        <div class="birdie-benchmark-label">10-18 HCP</div>
                    </div>
                    <div class="birdie-benchmark-line" style="left: ${(15 / maxScale) * 100}%;" title="Single Digit Handicap: ~15%">
                        <div class="birdie-benchmark-label">1-9 HCP</div>
                    </div>
                    <div class="birdie-benchmark-line" style="left: ${(20 / maxScale) * 100}%;" title="Scratch Golfer: ~20%">
                        <div class="birdie-benchmark-label">Scratch</div>
                    </div>
                    <div class="birdie-benchmark-line" style="left: ${(28 / maxScale) * 100}%;" title="PGA Tour Pro: ~28%">
                        <div class="birdie-benchmark-label">PGA Tour</div>
                    </div>
                </div>
            </div>
        </div>
    `;

    container.innerHTML = html;
}

/**
 * Populates approach shot accuracy section
 */
export function populateApproachShotAccuracy(accuracy: ApproachShotAccuracy): void {
    const container = document.getElementById('approach-shot-container');
    if (!container) return;

    // Create compact target diagram SVG
    const width = 240;
    const height = 240;
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = 90;

    // Calculate diagonal line endpoints (45 degrees)
    const diagonalOffset = radius * Math.cos(Math.PI / 4);

    let html = `
        <div class="approach-shot-diagram">
            <svg viewBox="0 0 ${width} ${height}" style="width: 100%; max-width: 240px; margin: 0 auto; display: block;">
                <!-- Background circle -->
                <circle cx="${centerX}" cy="${centerY}" r="${radius}"
                        fill="rgba(255, 255, 255, 0.02)" stroke="rgba(255, 255, 255, 0.2)" stroke-width="1.5"/>

                <!-- Diagonal separator lines -->
                <line x1="${centerX - diagonalOffset}" y1="${centerY - diagonalOffset}"
                      x2="${centerX + diagonalOffset}" y2="${centerY + diagonalOffset}"
                      stroke="rgba(255, 255, 255, 0.15)" stroke-width="1" stroke-dasharray="3,3"/>

                <line x1="${centerX + diagonalOffset}" y1="${centerY - diagonalOffset}"
                      x2="${centerX - diagonalOffset}" y2="${centerY + diagonalOffset}"
                      stroke="rgba(255, 255, 255, 0.15)" stroke-width="1" stroke-dasharray="3,3"/>

                <!-- Center target (GIR) -->
                <circle cx="${centerX}" cy="${centerY}" r="35"
                        fill="rgba(76, 175, 80, 0.3)" stroke="#4CAF50" stroke-width="2"/>
                <text x="${centerX}" y="${centerY - 3}" fill="#4CAF50"
                      font-size="18" font-weight="bold" text-anchor="middle">
                    ${accuracy.onTargetPercent.toFixed(1)}%
                </text>
                <text x="${centerX}" y="${centerY + 10}" fill="#4CAF50"
                      font-size="10" text-anchor="middle">
                    GIR
                </text>

                <!-- Long (top) -->
                <text x="${centerX}" y="${centerY - radius + 25}" fill="#FF9800"
                      font-size="13" font-weight="bold" text-anchor="middle">
                    ${accuracy.missedLongPercent.toFixed(1)}%
                </text>
                <text x="${centerX}" y="${centerY - radius + 37}" fill="#FF9800"
                      font-size="9" text-anchor="middle">
                    LONG
                </text>

                <!-- Short (bottom) -->
                <text x="${centerX}" y="${centerY + radius - 25}" fill="#FFC107"
                      font-size="13" font-weight="bold" text-anchor="middle">
                    ${accuracy.missedShortPercent.toFixed(1)}%
                </text>
                <text x="${centerX}" y="${centerY + radius - 13}" fill="#FFC107"
                      font-size="9" text-anchor="middle">
                    SHORT
                </text>

                <!-- Left -->
                <text x="${centerX - radius + 28}" y="${centerY - 3}" fill="#2196F3"
                      font-size="13" font-weight="bold" text-anchor="middle">
                    ${accuracy.missedLeftPercent.toFixed(1)}%
                </text>
                <text x="${centerX - radius + 28}" y="${centerY + 8}" fill="#2196F3"
                      font-size="9" text-anchor="middle">
                    LEFT
                </text>

                <!-- Right -->
                <text x="${centerX + radius - 28}" y="${centerY - 3}" fill="#9C27B0"
                      font-size="13" font-weight="bold" text-anchor="middle">
                    ${accuracy.missedRightPercent.toFixed(1)}%
                </text>
                <text x="${centerX + radius - 28}" y="${centerY + 8}" fill="#9C27B0"
                      font-size="9" text-anchor="middle">
                    RIGHT
                </text>
            </svg>
        </div>
    `;

    container.innerHTML = html;
}

/**
 * Populates strokes gained section
 */
export function populateStrokesGained(sg: StrokesGained): void {
    const container = document.getElementById('strokes-gained-container');
    if (!container) return;

    const categories = [
        { label: 'Driving', value: sg.driving, color: '#2196F3' },
        { label: 'Approach', value: sg.approach, color: '#4CAF50' },
        { label: 'Short Game', value: sg.shortGame, color: '#FF9800' },
        { label: 'Putting', value: sg.putting, color: '#9C27B0' },
        { label: 'Total', value: sg.total, color: '#F44336', isTotal: true }
    ];

    let html = '<div class="strokes-gained-grid">';

    categories.forEach(cat => {
        const displayValue = cat.value >= 0 ? `+${cat.value.toFixed(2)}` : cat.value.toFixed(2);
        const valueColor = getStrokesGainedColor(cat.value);

        html += `
            <div class="sg-card${cat.isTotal ? ' sg-card-total' : ''}">
                <div class="sg-category" style="color: ${cat.color}">${cat.label}</div>
                <div class="sg-value" style="color: ${valueColor}">${displayValue}</div>
                <div class="sg-label">strokes/round</div>
            </div>
        `;
    });

    html += '</div>';
    html += `<p class="sg-note">Estimated stroke allocation vs scratch golfer based on scoring data and performance gaps | Negative = strokes lost vs scratch</p>`;

    container.innerHTML = html;
}

/**
 * Gets color for strokes gained value
 */
function getStrokesGainedColor(value: number): string {
    if (value >= 2) return '#00C853';      // Dark green - excellent
    if (value >= 1) return '#4CAF50';      // Green - very good
    if (value >= 0) return '#81C784';      // Light green - good
    if (value >= -2) return '#FFB74D';     // Light orange - slightly below scratch
    if (value >= -4) return '#FF9800';     // Orange - moderately below scratch
    if (value >= -6) return '#FF5722';     // Dark orange - well below scratch
    return '#D32F2F';                       // Dark red - significantly below scratch
}

/**
 * Populates performance correlations (placeholder for future implementation)
 */
export function populatePerformanceCorrelations(correlations: PerformanceCorrelation[]): void {
    // This function can be expanded in the future if correlation data becomes available
    console.log('Performance correlations:', correlations);
}
