/**
 * Goals UI - Burndown chart and progress tracking
 */

import type { GoalsData, GoalProgress, GoalBurndownPoint } from '../types.js';
import { formatDate } from './common.js';

/**
 * Populate the goals burndown chart
 */
export function populateGoalsBurndown(goalsData: GoalsData): void {
  const container = document.getElementById('goals-burndown-container');
  if (!container) return;

  const { burndownData, goals } = goalsData;

  if (burndownData.length === 0) {
    container.innerHTML = '<p class="no-data">Not enough data to display burndown chart</p>';
    return;
  }

  // Create SVG burndown chart
  const width = 900;
  const height = 400;
  const padding = { top: 40, right: 40, bottom: 60, left: 60 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  // Find data ranges
  const allHandicaps = burndownData
    .map(d => [d.actualHandicap, d.idealHandicap, d.goalHandicap])
    .flat()
    .filter((h): h is number => h !== undefined);

  const minHandicap = Math.floor(Math.min(...allHandicaps) - 1);
  const maxHandicap = Math.ceil(Math.max(...allHandicaps) + 1);

  // Scales
  const xScale = (index: number) =>
    padding.left + (index / (burndownData.length - 1)) * chartWidth;

  const yScale = (handicap: number) =>
    padding.top + chartHeight - ((handicap - minHandicap) / (maxHandicap - minHandicap)) * chartHeight;

  // Build ideal line points
  const idealPoints = burndownData
    .map((d, i) => `${xScale(i)},${yScale(d.idealHandicap)}`)
    .join(' ');

  // Build actual line points (only where we have data)
  const actualData = burndownData.filter(d => d.actualHandicap !== undefined);
  const actualPoints = actualData
    .map(d => {
      const index = burndownData.indexOf(d);
      return `${xScale(index)},${yScale(d.actualHandicap!)}`;
    })
    .join(' ');

  // Start SVG
  let svg = `
    <svg width="${width}" height="${height}" style="background: rgba(255,255,255,0.02); border-radius: 8px;">
      <!-- Y-axis grid lines -->
  `;

  // Add horizontal grid lines
  for (let h = minHandicap; h <= maxHandicap; h++) {
    if (h % 2 === 0) {
      svg += `<line x1="${padding.left}" y1="${yScale(h)}" x2="${width - padding.right}" y2="${yScale(h)}"
        stroke="rgba(255,255,255,0.1)" stroke-width="1" stroke-dasharray="4,4"/>`;
      svg += `<text x="${padding.left - 10}" y="${yScale(h) + 4}" fill="#8e99b8" font-size="12" text-anchor="end">${h.toFixed(1)}</text>`;
    }
  }

  // Add goal milestone markers
  burndownData.forEach((d, i) => {
    if (d.goalHandicap !== undefined) {
      const goal = goals.find(g => g.targetHandicap === d.goalHandicap);
      if (goal) {
        const x = xScale(i);
        const y = yScale(d.goalHandicap);

        // Vertical line
        svg += `<line x1="${x}" y1="${padding.top}" x2="${x}" y2="${height - padding.bottom}"
          stroke="#FFD700" stroke-width="2" stroke-dasharray="8,4" opacity="0.5"/>`;

        // Goal label
        svg += `<text x="${x}" y="${padding.top - 10}" fill="#FFD700" font-size="11" font-weight="bold" text-anchor="middle">${goal.description}</text>`;

        // Goal marker circle
        svg += `<circle cx="${x}" cy="${y}" r="6" fill="#FFD700" stroke="#1a1f36" stroke-width="2"/>`;
      }
    }
  });

  // Ideal trajectory line (dashed gray)
  svg += `<polyline points="${idealPoints}" fill="none" stroke="#8e99b8" stroke-width="2" stroke-dasharray="6,6" opacity="0.6"/>`;

  // Actual trajectory line (solid green/red based on performance)
  if (actualPoints) {
    // Determine color based on whether actual is better than ideal
    const lastActual = actualData[actualData.length - 1];
    const lastActualIndex = burndownData.indexOf(lastActual);
    const correspondingIdeal = burndownData[lastActualIndex].idealHandicap;

    // Lower handicap is better, so green if actual <= ideal (on track or ahead)
    const color = lastActual.actualHandicap! <= correspondingIdeal ? '#4CAF50' : '#ef5350';

    svg += `<polyline points="${actualPoints}" fill="none" stroke="${color}" stroke-width="3" stroke-linejoin="round"/>`;

    // Add circles at actual data points
    actualData.forEach(d => {
      const index = burndownData.indexOf(d);
      const x = xScale(index);
      const y = yScale(d.actualHandicap!);
      svg += `<circle cx="${x}" cy="${y}" r="4" fill="${color}" stroke="#1a1f36" stroke-width="2"/>`;
    });
  }

  // X-axis labels (show every Nth point)
  const labelInterval = Math.ceil(burndownData.length / 12);
  burndownData.forEach((d, i) => {
    if (i % labelInterval === 0 || i === burndownData.length - 1) {
      const x = xScale(i);
      const dateLabel = formatDateShort(d.date);
      svg += `<text x="${x}" y="${height - padding.bottom + 20}" fill="#8e99b8" font-size="10" text-anchor="middle">${dateLabel}</text>`;
    }
  });

  // Axis labels
  svg += `<text x="${width / 2}" y="${height - 10}" fill="#8e99b8" font-size="12" text-anchor="middle" font-weight="bold">Date</text>`;
  svg += `<text x="${padding.left - 45}" y="${height / 2}" fill="#8e99b8" font-size="12" text-anchor="middle" font-weight="bold" transform="rotate(-90, ${padding.left - 45}, ${height / 2})">Handicap Index</text>`;

  // Legend
  const legendX = width - padding.right - 150;
  const legendY = padding.top + 10;

  svg += `<rect x="${legendX}" y="${legendY}" width="140" height="70" fill="rgba(0,0,0,0.3)" stroke="rgba(255,255,255,0.2)" stroke-width="1" rx="4"/>`;
  svg += `<line x1="${legendX + 10}" y1="${legendY + 20}" x2="${legendX + 40}" y2="${legendY + 20}" stroke="#4CAF50" stroke-width="3"/>`;
  svg += `<text x="${legendX + 50}" y="${legendY + 24}" fill="#fff" font-size="11">Actual</text>`;
  svg += `<line x1="${legendX + 10}" y1="${legendY + 45}" x2="${legendX + 40}" y2="${legendY + 45}" stroke="#8e99b8" stroke-width="2" stroke-dasharray="6,6"/>`;
  svg += `<text x="${legendX + 50}" y="${legendY + 49}" fill="#fff" font-size="11">Ideal</text>`;

  svg += '</svg>';

  container.innerHTML = svg;
}

/**
 * Populate goal progress cards
 */
export function populateGoalsProgress(goalsData: GoalsData): void {
  const container = document.getElementById('goals-progress-container');
  if (!container) return;

  const { progress } = goalsData;

  if (progress.length === 0) {
    container.innerHTML = '<p class="no-data">No goals configured</p>';
    return;
  }

  let html = '<div class="goals-grid">';

  progress.forEach((p: GoalProgress) => {
    const statusClass = p.onTrack ? 'on-track' : 'needs-work';
    const statusIcon = p.onTrack ? '✓' : '⚠';
    const statusText = p.onTrack ? 'On Track' : 'Needs Work';

    const daysText = p.daysRemaining > 0
      ? `${p.daysRemaining} days remaining`
      : `${Math.abs(p.daysRemaining)} days overdue`;

    // Format projection
    let projectionText = '';
    if (p.currentTrend > 0) {
      if (p.projectedDate && new Date(p.projectedDate) < new Date(p.goal.deadline)) {
        projectionText = `<span style="color: #4CAF50;">Projected: ${formatDateShort(p.projectedDate)} ✓</span>`;
      } else if (p.projectedDate) {
        projectionText = `<span style="color: #FF9800;">Projected: ${formatDateShort(p.projectedDate)}</span>`;
      } else {
        projectionText = `<span style="color: #8e99b8;">At deadline: ${p.projectedHandicap.toFixed(1)}</span>`;
      }
    } else {
      projectionText = `<span style="color: #ef5350;">No improvement trend</span>`;
    }

    html += `
      <div class="goal-card ${statusClass}">
        <div class="goal-header">
          <h4 class="goal-title">${p.goal.description}</h4>
          <div class="goal-status ${statusClass}">
            <span class="status-icon">${statusIcon}</span>
            <span class="status-text">${statusText}</span>
          </div>
        </div>

        <div class="goal-target">
          <div class="target-info">
            <span class="target-label">Target:</span>
            <span class="target-value">${p.goal.targetHandicap.toFixed(1)}</span>
          </div>
          <div class="target-info">
            <span class="target-label">Current:</span>
            <span class="target-value">${p.currentHandicap.toFixed(1)}</span>
          </div>
          <div class="target-info">
            <span class="target-label">Gap:</span>
            <span class="target-value" style="color: ${p.handicapDelta > 0 ? '#ef5350' : '#4CAF50'}">${p.handicapDelta > 0 ? '+' : ''}${p.handicapDelta.toFixed(1)}</span>
          </div>
        </div>

        <div class="goal-progress-bar">
          <div class="progress-fill" style="width: ${Math.min(100, p.progressPercentage)}%; background: ${p.onTrack ? '#4CAF50' : '#FF9800'};"></div>
          <span class="progress-text">${p.progressPercentage.toFixed(0)}%</span>
        </div>

        <div class="goal-details">
          <div class="detail-row">
            <span class="detail-label">Deadline:</span>
            <span class="detail-value">${formatDateShort(p.goal.deadline)} (${daysText})</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Required rate:</span>
            <span class="detail-value">${p.requiredMonthlyImprovement > 0 ? '-' : ''}${Math.abs(p.requiredMonthlyImprovement).toFixed(2)} strokes/month</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Current rate:</span>
            <span class="detail-value" style="color: ${p.currentTrend >= p.requiredMonthlyImprovement * 0.8 ? '#4CAF50' : '#ef5350'}">${p.currentTrend > 0 ? '-' : '+'}${Math.abs(p.currentTrend).toFixed(2)} strokes/month</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">${projectionText}</span>
          </div>
        </div>
      </div>
    `;
  });

  html += '</div>';
  container.innerHTML = html;
}

/**
 * Helper to format date as "Jan '25"
 */
function formatDateShort(dateStr: string): string {
  const date = new Date(dateStr);
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${months[date.getMonth()]} '${date.getFullYear().toString().slice(2)}`;
}
