/**
 * Advanced Analytics UI - Round Momentum and Learning Curves
 */

import type { RoundMomentum, CourseLearningCurve } from '../types.js';
import { formatDate, formatScoreToPar } from './common.js';

/**
 * Populate round momentum visualization
 * Shows hole-by-hole scoring patterns for recent rounds
 */
export function populateRoundMomentum(momentum: RoundMomentum[]): void {
  const container = document.getElementById('round-momentum-container');
  if (!container || momentum.length === 0) {
    if (container) container.innerHTML = '<p class="no-data">No round momentum data available</p>';
    return;
  }

  let html = '<div class="momentum-rounds-container">';

  momentum.forEach((round, index) => {
    const scoreClass = round.scoreToPar <= 0 ? 'good' : round.scoreToPar <= 5 ? 'average' : 'poor';

    html += `
      <div class="momentum-round-card">
        <div class="momentum-round-header">
          <div class="momentum-round-title">
            <span class="momentum-round-date">${formatDate(round.date)}</span>
            <span class="momentum-round-course">${round.courseName}</span>
          </div>
          <div class="momentum-round-score ${scoreClass}">
            ${round.totalScore} (${formatScoreToPar(round.scoreToPar)})
          </div>
        </div>

        <div class="momentum-chart">
          ${createMomentumChart(round)}
        </div>

        ${round.turningPoint ? `
          <div class="momentum-insight">
            <span class="momentum-turning-point">⚡ Turning point at hole ${round.turningPoint}</span>
          </div>
        ` : ''}
      </div>
    `;
  });

  html += '</div>';
  container.innerHTML = html;
}

/**
 * Create inline momentum chart for a single round (smaller, for table expansion)
 */
export function createInlineMomentumChart(round: RoundMomentum): string {
  const width = 700;
  const height = 120;
  const padding = 30;
  const chartWidth = width - 2 * padding;
  const chartHeight = height - 2 * padding;

  // Find min/max for y-axis
  const scores = round.holes.map(h => h.cumulativeScoreToPar);
  const minScore = Math.min(0, ...scores);
  const maxScore = Math.max(0, ...scores);
  const range = Math.max(Math.abs(minScore), Math.abs(maxScore), 5);

  // Scale functions
  const xScale = (holeNum: number) => padding + ((holeNum - 1) / (round.holes.length - 1)) * chartWidth;
  const yScale = (score: number) => padding + chartHeight / 2 - (score / range) * (chartHeight / 2);

  // Create path
  const points = round.holes.map(h => `${xScale(h.holeNumber)},${yScale(h.cumulativeScoreToPar)}`).join(' ');

  let svg = `
    <svg viewBox="0 0 ${width} ${height}" width="100%" height="auto" class="momentum-svg-inline" style="max-width: ${width}px;">
      <!-- Zero line -->
      <line x1="${padding}" y1="${yScale(0)}" x2="${width - padding}" y2="${yScale(0)}"
            stroke="rgba(255,255,255,0.2)" stroke-width="1" stroke-dasharray="4,4"/>

      <!-- Momentum line -->
      <polyline points="${points}"
                fill="none"
                stroke="${round.scoreToPar <= 0 ? '#4CAF50' : '#ef5350'}"
                stroke-width="2"
                stroke-linejoin="round"/>

      <!-- Points -->
  `;

  // Add points for each hole
  round.holes.forEach(hole => {
    const cx = xScale(hole.holeNumber);
    const cy = yScale(hole.cumulativeScoreToPar);
    const color = hole.scoreToPar < 0 ? '#4CAF50' : hole.scoreToPar === 0 ? '#8e99b8' : hole.scoreToPar === 1 ? '#FF9800' : '#ef5350';

    svg += `<circle cx="${cx}" cy="${cy}" r="3" fill="${color}" stroke="#1a1f36" stroke-width="1"/>`;

    // Mark turning point
    if (hole.holeNumber === round.turningPoint) {
      svg += `<circle cx="${cx}" cy="${cy}" r="6" fill="none" stroke="#FFD700" stroke-width="2"/>`;
    }
  });

  // Add x-axis labels (hole numbers)
  const labelInterval = round.holes.length > 9 ? 3 : 2;
  round.holes.forEach((hole, i) => {
    if (i % labelInterval === 0 || i === round.holes.length - 1) {
      svg += `
        <text x="${xScale(hole.holeNumber)}" y="${height - 10}"
              text-anchor="middle" fill="rgba(255,255,255,0.6)" font-size="9">
          ${hole.holeNumber}
        </text>
      `;
    }
  });

  // Add y-axis labels
  svg += `
    <text x="10" y="${yScale(range)}" fill="rgba(255,255,255,0.6)" font-size="9">-${range}</text>
    <text x="10" y="${yScale(0)}" fill="rgba(255,255,255,0.8)" font-size="9">E</text>
    <text x="10" y="${yScale(-range)}" fill="rgba(255,255,255,0.6)" font-size="9">+${range}</text>
  `;

  svg += '</svg>';
  return svg;
}

/**
 * Create SVG chart for round momentum
 */
function createMomentumChart(round: RoundMomentum): string {
  const width = 600;
  const height = 150;
  const padding = 30;
  const chartWidth = width - 2 * padding;
  const chartHeight = height - 2 * padding;

  // Find min/max for y-axis
  const scores = round.holes.map(h => h.cumulativeScoreToPar);
  const minScore = Math.min(0, ...scores);
  const maxScore = Math.max(0, ...scores);
  const range = Math.max(Math.abs(minScore), Math.abs(maxScore), 5); // At least +/- 5

  // Scale functions
  const xScale = (holeNum: number) => padding + ((holeNum - 1) / (round.holes.length - 1)) * chartWidth;
  const yScale = (score: number) => padding + chartHeight / 2 - (score / range) * (chartHeight / 2);

  // Create path
  const points = round.holes.map(h => `${xScale(h.holeNumber)},${yScale(h.cumulativeScoreToPar)}`).join(' ');

  // Create path string
  const pathData = round.holes.map((h, i) =>
    `${i === 0 ? 'M' : 'L'} ${xScale(h.holeNumber)} ${yScale(h.cumulativeScoreToPar)}`
  ).join(' ');

  let svg = `
    <svg viewBox="0 0 ${width} ${height}" width="100%" height="auto" class="momentum-svg" style="max-width: ${width}px;">
      <!-- Zero line -->
      <line x1="${padding}" y1="${yScale(0)}" x2="${width - padding}" y2="${yScale(0)}"
            stroke="rgba(255,255,255,0.2)" stroke-width="1" stroke-dasharray="4,4"/>

      <!-- Grid lines -->
  `;

  // Add horizontal grid lines
  for (let score = -range; score <= range; score += (range > 10 ? 5 : 2)) {
    if (score !== 0) {
      svg += `<line x1="${padding}" y1="${yScale(score)}" x2="${width - padding}" y2="${yScale(score)}"
                stroke="rgba(255,255,255,0.05)" stroke-width="1"/>`;
    }
  }

  // Add momentum line with gradient
  svg += `
      <!-- Momentum line -->
      <polyline points="${points}"
                fill="none"
                stroke="${round.scoreToPar <= 0 ? '#4CAF50' : '#ef5350'}"
                stroke-width="3"
                stroke-linejoin="round"/>

      <!-- Points -->
  `;

  // Add points for each hole
  round.holes.forEach(hole => {
    const cx = xScale(hole.holeNumber);
    const cy = yScale(hole.cumulativeScoreToPar);
    const color = hole.scoreToPar < 0 ? '#4CAF50' : hole.scoreToPar === 0 ? '#8e99b8' : hole.scoreToPar === 1 ? '#FF9800' : '#ef5350';

    svg += `
      <circle cx="${cx}" cy="${cy}" r="4" fill="${color}" stroke="#1a1f36" stroke-width="2"/>
    `;

    // Mark turning point
    if (hole.holeNumber === round.turningPoint) {
      svg += `
        <circle cx="${cx}" cy="${cy}" r="8" fill="none" stroke="#FFD700" stroke-width="2"/>
      `;
    }
  });

  // Add x-axis labels (hole numbers)
  const labelInterval = round.holes.length > 9 ? 3 : 2;
  round.holes.forEach((hole, i) => {
    if (i % labelInterval === 0 || i === round.holes.length - 1) {
      svg += `
        <text x="${xScale(hole.holeNumber)}" y="${height - 10}"
              text-anchor="middle" fill="rgba(255,255,255,0.6)" font-size="10">
          ${hole.holeNumber}
        </text>
      `;
    }
  });

  // Add y-axis labels
  svg += `
    <text x="10" y="${yScale(range)}" fill="rgba(255,255,255,0.6)" font-size="10">-${range}</text>
    <text x="10" y="${yScale(0)}" fill="rgba(255,255,255,0.8)" font-size="10">E</text>
    <text x="10" y="${yScale(-range)}" fill="rgba(255,255,255,0.6)" font-size="10">+${range}</text>
  `;

  svg += '</svg>';
  return svg;
}

/**
 * Populate course learning curves
 * Shows improvement/regression at courses played multiple times
 */
export function populateCourseLearningCurves(curves: CourseLearningCurve[]): void {
  const container = document.getElementById('course-learning-container');
  if (!container || curves.length === 0) {
    if (container) container.innerHTML = '<p class="no-data">Need 3+ rounds at a course to show learning curve</p>';
    return;
  }

  let html = '<div class="learning-curves-grid">';

  curves.forEach(curve => {
    const trendIcon = curve.trendDirection === 'improving' ? '📈' :
                      curve.trendDirection === 'declining' ? '📉' : '➡️';
    const trendColor = curve.trendDirection === 'improving' ? '#4CAF50' :
                       curve.trendDirection === 'declining' ? '#ef5350' : '#8e99b8';

    html += `
      <div class="learning-curve-card">
        <div class="learning-curve-header">
          <h4 class="learning-curve-title">${curve.courseName}</h4>
          <div class="learning-curve-rating">${curve.courseRating.toFixed(1)}/${curve.slopeRating}</div>
        </div>

        <div class="learning-stats-grid">
          <div class="learning-stat">
            <div class="learning-stat-label">Rounds Played</div>
            <div class="learning-stat-value">${curve.totalRounds}</div>
          </div>
          <div class="learning-stat">
            <div class="learning-stat-label">Best Score</div>
            <div class="learning-stat-value">${curve.bestScore} (${formatScoreToPar(curve.bestScoreToPar)})</div>
          </div>
          <div class="learning-stat">
            <div class="learning-stat-label">Rounds to Best</div>
            <div class="learning-stat-value">${curve.roundsToReachBest}</div>
          </div>
          <div class="learning-stat">
            <div class="learning-stat-label">Improvement</div>
            <div class="learning-stat-value" style="color: ${curve.improvement > 0 ? '#4CAF50' : curve.improvement < 0 ? '#ef5350' : '#8e99b8'}">
              ${curve.improvement > 0 ? '+' : ''}${curve.improvement.toFixed(1)} strokes
            </div>
          </div>
        </div>

        <div class="learning-chart">
          ${createLearningChart(curve)}
        </div>

        <div class="learning-trend" style="color: ${trendColor}">
          ${trendIcon} ${curve.trendDirection === 'improving' ? 'Improving' : curve.trendDirection === 'declining' ? 'Declining' : 'Stable'}
        </div>
      </div>
    `;
  });

  html += '</div>';
  container.innerHTML = html;
}

/**
 * Create SVG chart for learning curve
 */
function createLearningChart(curve: CourseLearningCurve): string {
  const width = 400;
  const height = 120;
  const padding = 30;
  const chartWidth = width - 2 * padding;
  const chartHeight = height - 2 * padding;

  const scores = curve.progression.map(p => p.scoreToPar);
  const minScore = Math.min(...scores);
  const maxScore = Math.max(...scores);
  const range = maxScore - minScore + 2;

  const xScale = (roundNum: number) => padding + ((roundNum - 1) / (curve.totalRounds - 1)) * chartWidth;
  const yScale = (score: number) => padding + ((maxScore - score + 1) / range) * chartHeight;

  const pathData = curve.progression.map((p, i) =>
    `${i === 0 ? 'M' : 'L'} ${xScale(p.roundNumber)} ${yScale(p.scoreToPar)}`
  ).join(' ');

  let svg = `
    <svg viewBox="0 0 ${width} ${height}" width="100%" height="auto" class="learning-svg" style="max-width: ${width}px;">
      <!-- Trend line -->
      <path d="${pathData}"
            fill="none"
            stroke="${curve.trendDirection === 'improving' ? '#4CAF50' : curve.trendDirection === 'declining' ? '#ef5350' : '#8e99b8'}"
            stroke-width="2"
            stroke-linejoin="round"/>

      <!-- Points -->
  `;

  curve.progression.forEach(point => {
    const cx = xScale(point.roundNumber);
    const cy = yScale(point.scoreToPar);
    const isBest = point.score === curve.bestScore;

    svg += `
      <circle cx="${cx}" cy="${cy}" r="${isBest ? '6' : '3'}"
              fill="${isBest ? '#FFD700' : '#8e99b8'}"
              stroke="#1a1f36" stroke-width="1"/>
    `;
  });

  svg += '</svg>';
  return svg;
}
