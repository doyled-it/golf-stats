/**
 * Scoring view functions (Scoring Trends, Heatmap, Handicap History, Hole Type Performance)
 */

import type { HandicapEntry, Round, ScoringHeatmap, HoleTypePerformance, RoundMomentum } from '../types.js';
import { formatDate, formatScoreToPar, getScoreClass, createSVGLineChart } from './common.js';
import { createInlineMomentumChart } from './analytics.js';

/**
 * Populates scoring trends - all rounds table with expandable momentum
 */
export function populateScoringTrends(rounds: Round[], roundMomentum: RoundMomentum[]): void {
    const tbody = document.getElementById('all-rounds-body');
    if (!tbody) return;

    // Create a map for quick momentum lookup by round ID
    const momentumMap = new Map<string, RoundMomentum>();
    roundMomentum.forEach(m => momentumMap.set(m.roundId, m));

    tbody.innerHTML = '';

    rounds.forEach((round, index) => {
        const row = document.createElement('tr');
        row.classList.add('rounds-table-row');
        if (index < 10) {
            row.style.animationDelay = `${index * 0.05}s`;
        }

        // Add special class for exceptional rounds
        if (round.exceptional) {
            row.classList.add('exceptional-round');
        }

        const scoreClass = getScoreClass(round.scoreToPar);
        const exceptionalBadge = round.exceptional ? ' <span class="exceptional-badge" title="Exceptional Score">⭐</span>' : '';
        const usedIndicator = round.used ? '<span class="used-indicator" title="Used in handicap">✓</span>' : '';

        // Check if this round has momentum data
        const hasMomentum = momentumMap.has(round.id) && round.holes && round.holes.length >= 9;

        if (hasMomentum) {
            row.classList.add('clickable-row');
        }
        row.innerHTML = `
            <td>${formatDate(round.date)}</td>
            <td>${round.courseName}</td>
            <td>${round.courseRating.toFixed(1)} / ${round.slopeRating}</td>
            <td class="${scoreClass}">${round.totalScore}${exceptionalBadge}</td>
            <td class="${scoreClass}">${formatScoreToPar(round.scoreToPar)}</td>
            <td>${round.differential.toFixed(1)} ${usedIndicator}${hasMomentum ? ' <span class="expand-indicator">▼</span>' : ''}</td>
        `;

        tbody.appendChild(row);

        // Add click handler if momentum exists
        if (hasMomentum) {
            row.style.cursor = 'pointer';
            row.addEventListener('click', () => {
                const existingExpanded = tbody.querySelector('.momentum-expanded-row');
                const wasExpanded = existingExpanded?.previousElementSibling === row;

                // Remove any existing expanded row
                if (existingExpanded) {
                    existingExpanded.remove();
                    // Reset all expand indicators
                    tbody.querySelectorAll('.expand-indicator').forEach(ind => {
                        ind.textContent = '▼';
                    });
                }

                // If clicking the same row, just collapse
                if (wasExpanded) {
                    return;
                }

                // Create and insert new expanded row
                const expandedRow = document.createElement('tr');
                expandedRow.classList.add('momentum-expanded-row');
                expandedRow.innerHTML = `
                    <td colspan="6" class="momentum-expanded-cell">
                        <div class="momentum-expanded-content">
                            <h4 class="momentum-expanded-title">Hole-by-Hole Momentum</h4>
                            ${createInlineMomentumChart(momentumMap.get(round.id)!)}
                            ${momentumMap.get(round.id)!.turningPoint ? `
                                <p class="momentum-expanded-note">⚡ Momentum shift at hole ${momentumMap.get(round.id)!.turningPoint}</p>
                            ` : ''}
                        </div>
                    </td>
                `;

                // Insert after the clicked row
                row.after(expandedRow);

                // Update expand indicator
                const indicator = row.querySelector('.expand-indicator');
                if (indicator) {
                    indicator.textContent = '▲';
                }
            });
        }
    });
}

/**
 * Creates the scoring heatmap visualization
 */
export function populateScoringHeatmap(heatmap: ScoringHeatmap): void {
    const container = document.getElementById('scoring-heatmap-container');
    if (!container) return;

    // Create a map of dates to rounds for quick lookup
    const dateMap = new Map<string, typeof heatmap.days[0]>();
    heatmap.days.forEach(day => {
        dateMap.set(day.date, day);
    });

    // Calculate weeks to display (52 weeks = 1 year)
    const startDate = new Date(heatmap.startDate);
    const endDate = new Date(heatmap.endDate);

    // Adjust start to previous Sunday
    const startDay = startDate.getDay();
    startDate.setDate(startDate.getDate() - startDay);

    // Build week grid
    const weeks: Date[][] = [];
    const currentDate = new Date(startDate);

    while (currentDate <= endDate) {
        const week: Date[] = [];
        for (let i = 0; i < 7; i++) {
            week.push(new Date(currentDate));
            currentDate.setDate(currentDate.getDate() + 1);
        }
        weeks.push(week);
    }

    // Helper function to get color based on score to par
    function getHeatmapColor(scoreToPar: number): string {
        if (scoreToPar <= 0) return '#00441b'; // Dark green - excellent
        if (scoreToPar <= 4) return '#006d2c'; // Green - great
        if (scoreToPar <= 8) return '#31a354'; // Light green - good
        if (scoreToPar <= 12) return '#74c476'; // Pale green - average
        if (scoreToPar <= 16) return '#fdae6b'; // Orange - below average
        if (scoreToPar <= 20) return '#fd8d3c'; // Dark orange - poor
        return '#d94801'; // Red - very poor
    }

    // Create HTML
    const cellSize = 12;
    const cellGap = 3;
    const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    let html = '<div class="heatmap-wrapper">';

    // Day labels
    html += '<div class="heatmap-day-labels">';
    dayLabels.forEach((day, i) => {
        if (i % 2 === 1) { // Show only Mon, Wed, Fri
            html += `<div class="heatmap-day-label" style="height: ${cellSize}px;">${day}</div>`;
        } else {
            html += `<div class="heatmap-day-label" style="height: ${cellSize}px;"></div>`;
        }
    });
    html += '</div>';

    // Grid container
    html += '<div class="heatmap-grid-container"><div class="heatmap-grid">';

    weeks.forEach((week, weekIndex) => {
        html += '<div class="heatmap-week">';
        week.forEach((date) => {
            const dateStr = date.toISOString().split('T')[0];
            const dayData = dateMap.get(dateStr);

            let cellClass = 'heatmap-cell';
            let bgColor = 'rgba(255, 255, 255, 0.05)'; // Empty/no rounds
            let title = formatDate(dateStr);

            if (dayData) {
                bgColor = getHeatmapColor(dayData.averageScoreToPar);
                cellClass += ' heatmap-cell-active';
                title = `${formatDate(dateStr)}\n${dayData.roundCount} round${dayData.roundCount > 1 ? 's' : ''}\n${dayData.averageScoreToPar > 0 ? '+' : ''}${dayData.averageScoreToPar.toFixed(1)} to par`;
            }

            html += `<div class="${cellClass}"
                          style="width: ${cellSize}px; height: ${cellSize}px; background-color: ${bgColor};"
                          title="${title}"></div>`;
        });
        html += '</div>';
    });

    html += '</div></div>'; // Close grid and container

    // Legend with hover tooltips
    html += '<div class="heatmap-legend">';
    html += '<span class="heatmap-legend-label">Worse</span>';
    const legendItems = [
        { color: 'rgba(255, 255, 255, 0.05)', label: 'No rounds' },
        { color: '#d94801', label: '+20 or more' },
        { color: '#fd8d3c', label: '+17 to +20' },
        { color: '#fdae6b', label: '+13 to +16' },
        { color: '#74c476', label: '+9 to +12' },
        { color: '#31a354', label: '+5 to +8' },
        { color: '#006d2c', label: '+1 to +4' },
        { color: '#00441b', label: 'Even or better' }
    ];
    legendItems.forEach(item => {
        html += `<div class="heatmap-legend-cell"
                      style="background-color: ${item.color};"
                      title="${item.label}"></div>`;
    });
    html += '<span class="heatmap-legend-label">Better</span>';
    html += '</div>';

    html += '</div>'; // Close wrapper
    container.innerHTML = html;
}

/**
 * Creates handicap history chart
 */
export function populateHandicapHistory(history: HandicapEntry[]): void {
    const container = document.getElementById('handicap-chart');
    if (!container) return;

    container.innerHTML = createSVGLineChart(
        history.map(h => h.handicapIndex),
        history.map(h => formatDate(h.date)),
        'Handicap Index',
        '#4CAF50'
    );
}

/**
 * Creates score history chart
 */
export function populateScoreHistory(rounds: Round[]): void {
    const container = document.getElementById('score-history-chart');
    if (!container) return;

    const recentRounds = rounds.slice(0, 20).reverse();

    // Normalize to per-hole, then scale to 18-hole equivalent for display
    const normalizedScores = recentRounds.map(r => {
        const holes = r.par <= 36 ? 9 : 18;
        const scoreToParPerHole = r.scoreToPar / holes;
        return scoreToParPerHole * 18; // Scale to 18-hole equivalent
    });

    container.innerHTML = createSVGLineChart(
        normalizedScores,
        recentRounds.map(r => formatDate(r.date)),
        'Score to Par (18-hole equiv.)',
        '#2196F3'
    );
}

/**
 * Populates hole type performance
 */
export function populateHoleTypePerformance(holeTypes: HoleTypePerformance[]): void {
    const container = document.getElementById('hole-type-container');
    if (!container) return;

    let html = '';

    holeTypes.forEach(holeType => {
        const parName = `Par ${holeType.parType}s`;
        const scoreClass = getScoreClass(holeType.averageScoreToPar);

        html += `
            <div class="hole-type-card">
                <div class="hole-type-header">
                    <h4 class="hole-type-title">${parName}</h4>
                    <span class="hole-type-count">${holeType.totalHoles} holes</span>
                </div>

                <div class="hole-type-avg">
                    <span class="hole-type-label">Avg Score to Par</span>
                    <span class="hole-type-value ${scoreClass}">${holeType.averageScoreToPar > 0 ? '+' : ''}${holeType.averageScoreToPar.toFixed(2)}</span>
                </div>

                <div class="hole-type-distribution">
                    <div class="dist-item">
                        <span class="dist-label">Birdie+</span>
                        <span class="dist-value" style="color: #4CAF50">${holeType.birdiesOrBetterPercent.toFixed(1)}%</span>
                    </div>
                    <div class="dist-item">
                        <span class="dist-label">Par</span>
                        <span class="dist-value" style="color: #81C784">${holeType.parsPercent.toFixed(1)}%</span>
                    </div>
                    <div class="dist-item">
                        <span class="dist-label">Bogey</span>
                        <span class="dist-value" style="color: #FFC107">${holeType.bogeysPercent.toFixed(1)}%</span>
                    </div>
                    <div class="dist-item">
                        <span class="dist-label">Double+</span>
                        <span class="dist-value" style="color: #FF9800">${holeType.doublePlusPercent.toFixed(1)}%</span>
                    </div>
                </div>
            </div>
        `;
    });

    container.innerHTML = html;
}
