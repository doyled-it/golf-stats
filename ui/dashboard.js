/**
 * Dashboard/Overview view functions
 */
import { formatDate, formatScoreToPar, getScoreClass } from './common.js';
/**
 * Populates the scoring distribution chart
 */
export function populateScoringDistribution(distribution) {
    const container = document.getElementById('scoring-distribution-chart');
    if (!container)
        return;
    const categories = [
        { label: 'Birdie+', count: distribution.birdiesOrBetter, percent: distribution.birdiesOrBetterPercent, color: '#4CAF50' },
        { label: 'Par', count: distribution.pars, percent: distribution.parsPercent, color: '#81C784' },
        { label: 'Bogey', count: distribution.bogeys, percent: distribution.bogeysPercent, color: '#FFC107' },
        { label: 'Double', count: distribution.doubleBogeys, percent: distribution.doubleBogeysPercent, color: '#FF9800' },
        { label: 'Triple+', count: distribution.triplePlus, percent: distribution.triplePlusPercent, color: '#f44336' }
    ];
    const width = 450;
    const height = 280;
    const padding = 30;
    const barGap = 15;
    const barWidth = (width - 2 * padding - (categories.length - 1) * barGap) / categories.length;
    const maxPercent = Math.max(...categories.map(c => c.percent));
    let html = `<svg viewBox="0 0 ${width} ${height}" style="width: 100%; height: 100%;">`;
    categories.forEach((cat, i) => {
        const x = padding + i * (barWidth + barGap);
        const barHeight = ((cat.percent / maxPercent) * (height - 2 * padding - 10));
        const y = height - padding - barHeight - 50;
        html += `
            <rect x="${x}" y="${y}" width="${barWidth}" height="${barHeight}"
                  fill="${cat.color}" rx="6">
                <title>${cat.label}: ${cat.count} (${cat.percent.toFixed(1)}%)</title>
            </rect>
            <text x="${x + barWidth / 2}" y="${y - 12}" fill="#ffffff"
                  font-size="22" text-anchor="middle" font-weight="bold">
                ${cat.percent.toFixed(1)}%
            </text>
            <text x="${x + barWidth / 2}" y="${height - 28}" fill="#a0a8cc"
                  font-size="16" text-anchor="middle" font-weight="600">
                ${cat.label}
            </text>
            <text x="${x + barWidth / 2}" y="${height - 10}" fill="#a0a8cc"
                  font-size="14" text-anchor="middle">
                (${cat.count})
            </text>
        `;
    });
    html += `</svg>`;
    container.innerHTML = html;
}
/**
 * Populates the recent rounds table
 */
export function populateRecentRounds(rounds) {
    const tbody = document.getElementById('recent-rounds-body');
    if (!tbody)
        return;
    tbody.innerHTML = '';
    rounds.forEach((round, index) => {
        const row = document.createElement('tr');
        row.style.animationDelay = `${index * 0.05}s`;
        // Add special class for exceptional rounds
        if (round.exceptional) {
            row.classList.add('exceptional-round');
        }
        const scoreClass = getScoreClass(round.scoreToPar);
        const exceptionalBadge = round.exceptional ? ' <span class="exceptional-badge" title="Exceptional Score">⭐</span>' : '';
        const usedIndicator = round.used ? '<span class="used-indicator" title="Used in handicap">✓</span>' : '';
        row.innerHTML = `
            <td>${formatDate(round.date)}</td>
            <td>${round.courseName}</td>
            <td>${round.tees}</td>
            <td class="${scoreClass}">${round.totalScore}${exceptionalBadge}</td>
            <td class="${scoreClass}">${formatScoreToPar(round.scoreToPar)}</td>
            <td>${round.differential.toFixed(1)} ${usedIndicator}</td>
        `;
        tbody.appendChild(row);
    });
}
//# sourceMappingURL=dashboard.js.map