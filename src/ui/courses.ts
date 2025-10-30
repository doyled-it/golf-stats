/**
 * Courses view functions (Course Performance, Hole Difficulty)
 */

import type { CoursePerformance, HoleDifficulty } from '../types.js';
import { formatDate, formatScoreToPar, getScoreClass } from './common.js';

/**
 * Populates the course performance section
 */
export function populateCoursePerformance(coursePerformance: CoursePerformance[]): void {
    const container = document.getElementById('course-performance-container');
    if (!container) return;

    if (coursePerformance.length === 0) {
        container.innerHTML = '<p class="loading">No course data available.</p>';
        return;
    }

    container.innerHTML = '';

    coursePerformance.forEach(course => {
        const courseCard = createCourseCard(course);
        container.appendChild(courseCard);
    });
}

/**
 * Creates a course card element
 */
function createCourseCard(course: CoursePerformance): HTMLElement {
    const card = document.createElement('div');
    card.className = 'course-card';

    const avgScoreClass = getScoreClass(course.scoreToPar);

    let html = `
        <div class="course-header clickable">
            <div>
                <h3 class="course-name">
                    ${course.courseName}
                    <span class="course-meta">(${course.rounds} round${course.rounds !== 1 ? 's' : ''} • Par ${course.par})</span>
                </h3>
            </div>
            <span class="expand-icon">▼</span>
        </div>
        <div class="course-stats">
            <div class="course-stat">
                <span class="course-stat-label">Avg to Par</span>
                <span class="course-stat-value ${avgScoreClass}">${formatScoreToPar(course.scoreToPar)}</span>
            </div>
            <div class="course-stat">
                <span class="course-stat-label">Avg Score</span>
                <span class="course-stat-value">${course.averageScore.toFixed(1)}</span>
            </div>
            <div class="course-stat">
                <span class="course-stat-label">Best Score</span>
                <span class="course-stat-value positive">${course.bestScore}</span>
            </div>
            <div class="course-stat">
                <span class="course-stat-label">Worst Score</span>
                <span class="course-stat-value negative">${course.worstScore}</span>
            </div>
        </div>
    `;

    // Add rounds list (initially hidden)
    html += `
        <div class="course-rounds-list" style="display: none;">
            <h4 class="rounds-list-title">All Rounds</h4>
            <table class="rounds-table compact">
                <thead>
                    <tr>
                        <th>Date</th>
                        <th>Score</th>
                        <th>To Par</th>
                        <th>Diff</th>
                    </tr>
                </thead>
                <tbody>
    `;

    // Sort rounds by date (most recent first)
    const sortedRounds = [...course.roundsList].sort((a, b) =>
        new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    sortedRounds.forEach(round => {
        const scoreClass = getScoreClass(round.scoreToPar);
        const exceptionalBadge = round.exceptional ? ' ⭐' : '';
        html += `
            <tr>
                <td>${formatDate(round.date)}</td>
                <td class="${scoreClass}">${round.totalScore}${exceptionalBadge}</td>
                <td class="${scoreClass}">${formatScoreToPar(round.scoreToPar)}</td>
                <td>${round.differential.toFixed(1)}</td>
            </tr>
        `;
    });

    html += `
                </tbody>
            </table>
        </div>
    `;

    // Add hole difficulty analysis if available
    if (course.holeDifficulty) {
        html += createHoleDifficultyVisualization(course.holeDifficulty);
    }

    card.innerHTML = html;

    // Add click handler to toggle rounds list
    const header = card.querySelector('.course-header');
    const roundsList = card.querySelector('.course-rounds-list') as HTMLElement;
    const expandIcon = card.querySelector('.expand-icon') as HTMLElement;

    if (header && roundsList && expandIcon) {
        header.addEventListener('click', () => {
            const isHidden = roundsList.style.display === 'none';
            roundsList.style.display = isHidden ? 'block' : 'none';
            expandIcon.textContent = isHidden ? '▲' : '▼';
            card.classList.toggle('expanded', isHidden);
        });
    }

    return card;
}

/**
 * Creates hole difficulty visualization
 */
function createHoleDifficultyVisualization(difficulties: HoleDifficulty[]): string {
    if (!difficulties || difficulties.length === 0) return '';

    let html = '<div class="hole-difficulty-container">';
    html += '<h4 class="hole-difficulty-title">Hole-by-Hole Difficulty</h4>';
    html += '<div class="hole-difficulty-grid">';

    difficulties.forEach(hole => {
        // Color based on difficulty (harder = redder, easier = greener)
        const maxDifficulty = 1.5; // +1.5 strokes over par is very hard
        const normalized = Math.min(hole.scoreToPar / maxDifficulty, 1);

        let color: string;
        if (normalized < 0) {
            color = '#00C853'; // Green for under par average
        } else if (normalized < 0.33) {
            color = '#FDD835'; // Yellow for slightly over par
        } else if (normalized < 0.66) {
            color = '#FF9800'; // Orange for moderately over par
        } else {
            color = '#F44336'; // Red for significantly over par
        }

        const scoreDisplay = hole.scoreToPar >= 0 ? `+${hole.scoreToPar.toFixed(2)}` : hole.scoreToPar.toFixed(2);

        html += `
            <div class="hole-difficulty-cell" style="background-color: ${color}"
                 title="Hole ${hole.holeNumber} (Par ${hole.par}): Avg ${hole.averageScore.toFixed(1)} (${scoreDisplay})">
                <div class="hole-number">${hole.holeNumber}</div>
                <div class="hole-par">Par ${hole.par}</div>
                <div class="hole-avg">${hole.averageScore.toFixed(1)}</div>
                <div class="hole-rank">Rank: ${hole.difficulty}</div>
            </div>
        `;
    });

    html += '</div>';
    html += '<div class="hole-difficulty-legend">';
    html += '<span style="color: #00C853;">■</span> Easy (under par)';
    html += '<span style="color: #FDD835;">■</span> Average';
    html += '<span style="color: #FF9800;">■</span> Challenging';
    html += '<span style="color: #F44336;">■</span> Very Difficult';
    html += '</div>';
    html += '</div>';

    return html;
}
