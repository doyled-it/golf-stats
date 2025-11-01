/**
 * Common utility functions shared across UI modules
 */
/**
 * Formats a date string into a readable format
 */
export function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}
/**
 * Formats a score relative to par
 */
export function formatScoreToPar(score) {
    if (score > 0)
        return `+${score.toFixed(1)}`;
    if (score < 0)
        return score.toFixed(1);
    return 'E';
}
/**
 * Returns a CSS class based on score to par
 */
export function getScoreClass(scoreToPar) {
    if (scoreToPar <= -3)
        return 'score-excellent';
    if (scoreToPar <= -1)
        return 'score-good';
    if (scoreToPar <= 2)
        return 'score-average';
    if (scoreToPar <= 5)
        return 'score-poor';
    return 'score-bad';
}
/**
 * Sets text content of an element by ID
 */
export function setTextContent(id, text) {
    const element = document.getElementById(id);
    if (element) {
        element.textContent = text;
    }
}
/**
 * Creates an SVG line chart
 */
export function createSVGLineChart(data, labels, yAxisLabel, color) {
    if (data.length === 0) {
        return '<p class="loading">No data available for chart.</p>';
    }
    const width = 600;
    const height = 250;
    const padding = 60;
    const chartWidth = width - 2 * padding;
    const chartHeight = height - 2 * padding;
    const maxVal = Math.max(...data);
    const minVal = Math.min(...data);
    const range = maxVal - minVal;
    const buffer = range * 0.1;
    const yMax = maxVal + buffer;
    const yMin = minVal - buffer;
    const yRange = yMax - yMin;
    // Create points
    const points = data.map((val, i) => {
        const x = padding + (i / (data.length - 1)) * chartWidth;
        const y = height - padding - ((val - yMin) / yRange) * chartHeight;
        return `${x},${y}`;
    }).join(' ');
    // Grid lines
    let gridLines = '';
    for (let i = 0; i <= 4; i++) {
        const y = padding + (i / 4) * chartHeight;
        const value = (yMax - (i / 4) * yRange).toFixed(1);
        gridLines += `
            <line x1="${padding}" y1="${y}" x2="${width - padding}" y2="${y}"
                  stroke="rgba(255,255,255,0.1)" stroke-width="1"/>
            <text x="${padding - 5}" y="${y + 5}" fill="#a0a8cc"
                  font-size="10" text-anchor="end">${value}</text>
        `;
    }
    return `
        <svg viewBox="0 0 ${width} ${height}" style="width: 100%; height: 100%;">
            ${gridLines}

            <polyline points="${points}" fill="none" stroke="${color}"
                      stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>

            ${data.map((val, i) => {
        const x = padding + (i / (data.length - 1)) * chartWidth;
        const y = height - padding - ((val - yMin) / yRange) * chartHeight;
        return `
                    <circle cx="${x}" cy="${y}" r="4" fill="${color}">
                        <title>${labels[i]}: ${val}</title>
                    </circle>
                `;
    }).join('')}

            <text x="${width / 2}" y="${height - 5}" fill="#a0a8cc"
                  font-size="12" text-anchor="middle">Recent Rounds</text>
            <text x="10" y="${height / 2}" fill="#a0a8cc"
                  font-size="12" text-anchor="middle" transform="rotate(-90 10 ${height / 2})">${yAxisLabel}</text>
        </svg>
    `;
}
//# sourceMappingURL=common.js.map