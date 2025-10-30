/**
 * Performance view functions (Personal Records, Momentum, Recent Form)
 */

import type { PersonalRecords, MomentumIndicators, RecentForm, Round } from '../types.js';
import { formatDate, formatScoreToPar } from './common.js';

/**
 * Populates personal records section
 */
export function populatePersonalRecords(records: PersonalRecords): void {
    const container = document.getElementById('personal-records-container');
    if (!container) return;

    let html = '<div class="records-grid">';

    if (records.bestScore18Hole) {
        const rec = records.bestScore18Hole;
        html += `
            <div class="record-card">
                <div class="record-icon">🏆</div>
                <div class="record-label">Best 18-Hole</div>
                <div class="record-value">${rec.score} (${formatScoreToPar(rec.scoreToPar)})</div>
                <div class="record-details">${formatDate(rec.date)} at ${rec.course}</div>
            </div>
        `;
    }

    if (records.bestScore9Hole) {
        const rec = records.bestScore9Hole;
        html += `
            <div class="record-card">
                <div class="record-icon">⭐</div>
                <div class="record-label">Best 9-Hole</div>
                <div class="record-value">${rec.score} (${formatScoreToPar(rec.scoreToPar)})</div>
                <div class="record-details">${formatDate(rec.date)} at ${rec.course}</div>
            </div>
        `;
    }

    if (records.mostBirdiesInRound) {
        const rec = records.mostBirdiesInRound;
        html += `
            <div class="record-card">
                <div class="record-icon">🦅</div>
                <div class="record-label">Most Birdies</div>
                <div class="record-value">${rec.count} birdies</div>
                <div class="record-details">${formatDate(rec.date)} at ${rec.course}</div>
            </div>
        `;
    }

    if (records.bestGIRPercentage) {
        const rec = records.bestGIRPercentage;
        html += `
            <div class="record-card">
                <div class="record-icon">🎯</div>
                <div class="record-label">Best GIR %</div>
                <div class="record-value">${rec.percentage.toFixed(1)}%</div>
                <div class="record-details">${rec.girsHit}/${rec.totalHoles} on ${formatDate(rec.date)}</div>
            </div>
        `;
    }

    if (records.bestFairwayPercentage) {
        const rec = records.bestFairwayPercentage;
        html += `
            <div class="record-card">
                <div class="record-icon">✅</div>
                <div class="record-label">Best Fairway %</div>
                <div class="record-value">${rec.percentage.toFixed(1)}%</div>
                <div class="record-details">${rec.fairwaysHit}/${rec.totalFairways} on ${formatDate(rec.date)}</div>
            </div>
        `;
    }

    if (records.fewestPutts) {
        const rec = records.fewestPutts;
        html += `
            <div class="record-card">
                <div class="record-icon">⛳</div>
                <div class="record-label">Fewest Putts</div>
                <div class="record-value">${rec.putts} putts</div>
                <div class="record-details">${rec.holesPlayed} holes on ${formatDate(rec.date)}</div>
            </div>
        `;
    }

    if (records.bestDifferential) {
        const rec = records.bestDifferential;
        html += `
            <div class="record-card">
                <div class="record-icon">📊</div>
                <div class="record-label">Best Differential</div>
                <div class="record-value">${rec.differential.toFixed(1)}</div>
                <div class="record-details">Score ${rec.score} on ${formatDate(rec.date)}</div>
            </div>
        `;
    }

    if (records.longestBirdieStreak) {
        const rec = records.longestBirdieStreak;
        html += `
            <div class="record-card">
                <div class="record-icon">🔥</div>
                <div class="record-label">Longest Birdie Streak</div>
                <div class="record-value">${rec.streakLength} holes</div>
                <div class="record-details">${formatDate(rec.startDate)} to ${formatDate(rec.endDate)}</div>
            </div>
        `;
    }

    if (records.longestNoBogeyStreak) {
        const rec = records.longestNoBogeyStreak;
        html += `
            <div class="record-card">
                <div class="record-icon">💪</div>
                <div class="record-label">Longest No-Bogey Streak</div>
                <div class="record-value">${rec.streakLength} holes</div>
                <div class="record-details">${formatDate(rec.startDate)} to ${formatDate(rec.endDate)}</div>
            </div>
        `;
    }

    if (records.longestNoThreePuttStreak) {
        const rec = records.longestNoThreePuttStreak;
        html += `
            <div class="record-card">
                <div class="record-icon">🎯</div>
                <div class="record-label">Longest No 3-Putt Streak</div>
                <div class="record-value">${rec.streakLength} holes</div>
                <div class="record-details">${rec.roundCount} rounds: ${formatDate(rec.startDate)} to ${formatDate(rec.endDate)}</div>
            </div>
        `;
    }

    if (records.mostDifficultCourse) {
        const rec = records.mostDifficultCourse;
        html += `
            <div class="record-card">
                <div class="record-icon">⛰️</div>
                <div class="record-label">Most Difficult Course</div>
                <div class="record-value">${rec.courseRating.toFixed(1)}/${rec.slopeRating}</div>
                <div class="record-details">${rec.courseName}<br/>Best: ${rec.bestScore} (${formatScoreToPar(rec.bestScoreToPar)})</div>
            </div>
        `;
    }

    if (records.easiestCourse) {
        const rec = records.easiestCourse;
        html += `
            <div class="record-card">
                <div class="record-icon">🏖️</div>
                <div class="record-label">Easiest Course</div>
                <div class="record-value">${rec.courseRating.toFixed(1)}/${rec.slopeRating}</div>
                <div class="record-details">${rec.courseName}<br/>Best: ${rec.bestScore} (${formatScoreToPar(rec.bestScoreToPar)})</div>
            </div>
        `;
    }

    html += '</div>';
    container.innerHTML = html;
}

/**
 * Populates momentum indicators section
 */
export function populateMomentum(momentum: MomentumIndicators): void {
    const container = document.getElementById('momentum-container');
    if (!container) return;

    let html = '<div class="momentum-patterns-grid">';

    // After Birdie vs After Bogey
    if (momentum.afterBirdie && momentum.afterBogey) {
        const birdieAvg = momentum.afterBirdie.nextHoleAverage;
        const bogeyAvg = momentum.afterBogey.nextHoleAverage;
        const diff = bogeyAvg - birdieAvg;

        html += `
            <div class="momentum-pattern-card">
                <h4 class="momentum-pattern-title">After Birdie vs After Bogey</h4>
                <div class="momentum-comparison">
                    <div class="momentum-comp-item better">
                        <div class="momentum-comp-label">After Birdie 🦅</div>
                        <div class="momentum-comp-value">${formatScoreToPar(birdieAvg)}</div>
                        <div class="momentum-comp-detail">${momentum.afterBirdie.parOrBetterPercent.toFixed(0)}% par or better</div>
                    </div>
                    <div class="momentum-comp-vs">VS</div>
                    <div class="momentum-comp-item worse">
                        <div class="momentum-comp-label">After Bogey ⚠️</div>
                        <div class="momentum-comp-value">${formatScoreToPar(bogeyAvg)}</div>
                        <div class="momentum-comp-detail">${momentum.afterBogey.parOrBetterPercent.toFixed(0)}% par or better</div>
                    </div>
                </div>
                <div class="momentum-insight">
                    ${diff > 0.3
                        ? `<span style="color: #4CAF50">✓ Good bounce back!</span> You recover well after bogeys (+${diff.toFixed(1)} worse)`
                        : diff < -0.3
                        ? `<span style="color: #ef5350">⚠ Momentum drop</span> Bogeys hurt your next hole (-${Math.abs(diff).toFixed(1)} worse)`
                        : '<span style="color: #8e99b8">➡️ Consistent</span> Similar performance after both'
                    }
                </div>
            </div>
        `;
    }

    // Front 9 vs Back 9
    if (momentum.frontNineVsBackNine) {
        const front = momentum.frontNineVsBackNine.frontNineAverage;
        const back = momentum.frontNineVsBackNine.backNineAverage;
        const diff = back - front;

        html += `
            <div class="momentum-pattern-card">
                <h4 class="momentum-pattern-title">Front 9 vs Back 9</h4>
                <div class="momentum-comparison">
                    <div class="momentum-comp-item ${diff > 0 ? 'better' : 'worse'}">
                        <div class="momentum-comp-label">Front 9</div>
                        <div class="momentum-comp-value">${formatScoreToPar(front)}</div>
                    </div>
                    <div class="momentum-comp-vs">VS</div>
                    <div class="momentum-comp-item ${diff < 0 ? 'better' : 'worse'}">
                        <div class="momentum-comp-label">Back 9</div>
                        <div class="momentum-comp-value">${formatScoreToPar(back)}</div>
                    </div>
                </div>
                <div class="momentum-insight">
                    ${Math.abs(diff) < 0.5
                        ? '<span style="color: #4CAF50">✓ Consistent</span> Stable throughout the round'
                        : diff > 0
                        ? `<span style="color: #ef5350">⚠ Fade</span> You score ${Math.abs(diff).toFixed(1)} strokes worse on the back 9`
                        : `<span style="color: #4CAF50">✓ Strong finish</span> You score ${Math.abs(diff).toFixed(1)} strokes better on the back 9`
                    }
                </div>
            </div>
        `;
    }

    // Early vs Late round
    if (momentum.earlyRoundVsLateRound) {
        const early = momentum.earlyRoundVsLateRound.holes1to6Average;
        const late = momentum.earlyRoundVsLateRound.holes13to18Average;
        const diff = late - early;

        html += `
            <div class="momentum-pattern-card">
                <h4 class="momentum-pattern-title">Start vs Finish</h4>
                <div class="momentum-comparison">
                    <div class="momentum-comp-item ${diff > 0 ? 'better' : 'worse'}">
                        <div class="momentum-comp-label">Holes 1-6</div>
                        <div class="momentum-comp-value">${formatScoreToPar(early)}</div>
                    </div>
                    <div class="momentum-comp-vs">VS</div>
                    <div class="momentum-comp-item ${diff < 0 ? 'better' : 'worse'}">
                        <div class="momentum-comp-label">Holes 13-18</div>
                        <div class="momentum-comp-value">${formatScoreToPar(late)}</div>
                    </div>
                </div>
                <div class="momentum-insight">
                    ${Math.abs(diff) < 0.5
                        ? '<span style="color: #4CAF50">✓ Consistent</span> Steady performance throughout'
                        : diff > 0
                        ? `<span style="color: #ef5350">⚠ Late struggle</span> You score ${Math.abs(diff).toFixed(1)} worse on closing holes`
                        : `<span style="color: #4CAF50">✓ Warm up</span> You play ${Math.abs(diff).toFixed(1)} better after warming up`
                    }
                </div>
            </div>
        `;
    }

    html += '</div>';
    container.innerHTML = html;
}

/**
 * Populates recent form indicators
 */
export function populateRecentForm(recentForm: { last5?: RecentForm; last10?: RecentForm; last20?: RecentForm }, recentRounds: Round[]): void {
    populateFormIndicator('form-last5', recentForm.last5, recentRounds.slice(0, 5));
    populateFormIndicator('form-last10', recentForm.last10, recentRounds.slice(0, 10));
    populateFormIndicator('form-last20', recentForm.last20, recentRounds.slice(0, 20));
}

/**
 * Populates a single form indicator
 */
function populateFormIndicator(containerId: string, form: RecentForm | undefined, rounds: Round[]): void {
    const container = document.getElementById(containerId);
    if (!container || !form || !rounds || rounds.length === 0) return;

    const valueEl = container.querySelector('.form-value');
    const trendEl = container.querySelector('.form-trend');
    if (!valueEl || !trendEl) return;

    // Display average score to par
    const avgScore = form.averageScoreToPar > 0 ? '+' : '';
    valueEl.textContent = `${avgScore}${form.averageScoreToPar.toFixed(1)}`;
    valueEl.className = 'form-value';

    // Create a mini sparkline chart showing the trend
    const scores = rounds.map(r => r.scoreToPar);
    const sparkline = createSparkline(scores, form.improving);

    trendEl.innerHTML = sparkline;
    trendEl.className = 'form-trend';
}

/**
 * Creates a sparkline SVG chart
 */
function createSparkline(scores: number[], improving: boolean): string {
    const width = 200;
    const height = 40;
    const padding = 2;

    const maxScore = Math.max(...scores);
    const minScore = Math.min(...scores);
    const range = maxScore - minScore || 1;

    // Create points for the line
    const points = scores.map((score, i) => {
        const x = padding + (i / (scores.length - 1)) * (width - 2 * padding);
        const y = height - padding - ((score - minScore) / range) * (height - 2 * padding);
        return `${x},${y}`;
    }).join(' ');

    // Color based on whether improving or not
    const color = improving ? '#4CAF50' : '#ef5350';
    const fillColor = improving ? 'rgba(76, 175, 80, 0.1)' : 'rgba(239, 83, 80, 0.1)';

    // Create polygon for filled area
    const firstX = padding;
    const lastX = padding + (width - 2 * padding);
    const bottomY = height - padding;
    const fillPoints = `${firstX},${bottomY} ${points} ${lastX},${bottomY}`;

    return `
        <svg viewBox="0 0 ${width} ${height}" style="width: 100%; height: 40px; margin-top: 0.5rem;">
            <polygon points="${fillPoints}" fill="${fillColor}" />
            <polyline points="${points}" fill="none" stroke="${color}" stroke-width="2" />
            ${scores.map((score, i) => {
                const x = padding + (i / (scores.length - 1)) * (width - 2 * padding);
                const y = height - padding - ((score - minScore) / range) * (height - 2 * padding);
                return `<circle cx="${x}" cy="${y}" r="2" fill="${color}" />`;
            }).join('')}
        </svg>
    `;
}
