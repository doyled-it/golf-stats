/**
 * Golf Statistics Tracker - Main Application
 */

import { getGolfData } from './data/index.js';
import type { GolfData } from './types.js';
import { setTextContent } from './ui/common.js';
import { populateScoringDistribution, populateRecentRounds } from './ui/dashboard.js';
import { populatePersonalRecords, populateMomentum, populateRecentForm } from './ui/performance.js';
import { populateScoringTrends, populateScoringHeatmap, populateHandicapHistory, populateScoreHistory, populateHoleTypePerformance } from './ui/scoring.js';
import { populatePuttingPerformance, populateBirdieConversion, populateApproachShotAccuracy, populateStrokesGained } from './ui/shots.js';
import { populateCoursePerformance } from './ui/courses.js';
import { populateCourseLearningCurves } from './ui/analytics.js';
import { populateGoalsBurndown, populateGoalsProgress } from './ui/goals.js';
import { formatScoreToPar } from './ui/common.js';

// ===== INITIALIZATION =====
let currentView: string = 'dashboard';
let data: GolfData | null = null;

// Wait for DOM to be ready
document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
});

async function initializeApp(): Promise<void> {
    console.log('Initializing Golf Stats App...');

    // Show loading indicator
    showLoading();

    try {
        // Load golf data
        data = await getGolfData();
        console.log('Golf data loaded successfully!', data);

        // Hide loading indicator
        hideLoading();

        // Setup event listeners
        setupTabNavigation();

        // Populate initial data
        populatePlayerInfo();
        populateDashboardSection();
        populateGoalsSection();
        populateScoringSection();
        populatePerformanceSection();
        populateShotAnalytics();
        populateCourseSection();

        console.log('App initialized successfully!');
    } catch (error) {
        console.error('Failed to load golf data:', error);
        showError('Failed to load golf data. Please try refreshing the page.');
    }
}

function showLoading(): void {
    const loadingEl = document.createElement('div');
    loadingEl.id = 'app-loading';
    loadingEl.className = 'loading';
    loadingEl.textContent = 'Loading golf data...';
    document.body.appendChild(loadingEl);
}

function hideLoading(): void {
    const loadingEl = document.getElementById('app-loading');
    if (loadingEl) {
        loadingEl.remove();
    }
}

function showError(message: string): void {
    const errorEl = document.createElement('div');
    errorEl.className = 'error';
    errorEl.textContent = message;
    document.body.appendChild(errorEl);
}

// ===== NAVIGATION =====
function setupTabNavigation(): void {
    const tabs = document.querySelectorAll('.tab');

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const view = (tab as HTMLElement).dataset.view;
            if (view) {
                switchView(view);
            }
        });
    });
}

function switchView(viewName: string): void {
    currentView = viewName;

    // Update tabs
    document.querySelectorAll('.tab').forEach(tab => {
        tab.classList.remove('active');
        if ((tab as HTMLElement).dataset.view === viewName) {
            tab.classList.add('active');
        }
    });

    // Update views
    document.querySelectorAll('.view').forEach(view => {
        view.classList.remove('active');
    });

    const activeView = document.getElementById(`${viewName}-view`);
    if (activeView) {
        activeView.classList.add('active');
    }
}

// ===== PLAYER INFO =====
function populatePlayerInfo(): void {
    if (!data) return;
    const { player } = data;

    setTextContent('player-name', player.name);
    setTextContent('player-ghin', player.ghinNumber || 'N/A');
    setTextContent('player-handicap', player.handicapIndex ? player.handicapIndex.toFixed(1) : 'N/A');
    setTextContent('player-club', player.homeClub || 'N/A');

    // Also display actual handicap in the Handicap Progress chart subtitle
    setTextContent('actual-handicap-display', player.handicapIndex ? player.handicapIndex.toFixed(1) : 'N/A');
}

// ===== DASHBOARD SECTION =====
function populateDashboardSection(): void {
    if (!data) return;
    const { scoringTrends, shotStatistics, recentRounds } = data;

    // Scoring summary - show average to par prominently (with decimal)
    const avgToPar = scoringTrends.averageScoreToPar > 0 ? '+' : '';
    setTextContent('avg-to-par', `${avgToPar}${scoringTrends.averageScoreToPar.toFixed(1)}`);

    // Best 9-hole (show score to par)
    if (scoringTrends.bestScoreToPar9Hole !== undefined && scoringTrends.lowestScore9Hole !== undefined) {
        setTextContent('best-9-hole', `${scoringTrends.lowestScore9Hole} (${formatScoreToPar(scoringTrends.bestScoreToPar9Hole)})`);
    } else {
        setTextContent('best-9-hole', 'N/A');
    }

    // Best 18-hole (show score to par)
    if (scoringTrends.bestScoreToPar18Hole !== undefined && scoringTrends.lowestScore18Hole !== undefined) {
        setTextContent('best-18-hole', `${scoringTrends.lowestScore18Hole} (${formatScoreToPar(scoringTrends.bestScoreToPar18Hole)})`);
    } else {
        setTextContent('best-18-hole', 'N/A');
    }

    setTextContent('total-rounds', shotStatistics.totalRounds.toString());

    // Shot statistics
    setTextContent('fairways-hit', `${shotStatistics.fairwaysHitPercentage.toFixed(1)}%`);
    setTextContent('gir', `${shotStatistics.greensInRegulationPercentage.toFixed(1)}%`);
    setTextContent('avg-putts', shotStatistics.averagePuttsPerRound.toFixed(1));
    setTextContent('scrambling', `${shotStatistics.scrambling.toFixed(1)}%`);

    // Scoring distribution chart
    if (shotStatistics.scoringDistribution) {
        populateScoringDistribution(shotStatistics.scoringDistribution);
    }

    // Recent form indicators
    if (scoringTrends.recentForm) {
        populateRecentForm(scoringTrends.recentForm, scoringTrends.roundHistory.slice(0, 20));
    }

    // Recent rounds table
    populateRecentRounds(recentRounds);
}

// ===== GOALS SECTION =====
function populateGoalsSection(): void {
    if (!data) return;
    const { goalsData } = data;

    // Burndown chart
    populateGoalsBurndown(goalsData);

    // Goal progress cards
    populateGoalsProgress(goalsData);
}

// ===== PERFORMANCE SECTION =====
function populatePerformanceSection(): void {
    if (!data) return;
    const { scoringTrends } = data;

    // Personal records
    if (scoringTrends.personalRecords) {
        populatePersonalRecords(scoringTrends.personalRecords);
    }

    // Momentum indicators
    if (scoringTrends.momentum) {
        populateMomentum(scoringTrends.momentum);
    }
}

// ===== SCORING SECTION =====
function populateScoringSection(): void {
    if (!data) return;
    const { scoringTrends, roundMomentum } = data;

    // Populate all rounds table with expandable momentum
    populateScoringTrends(scoringTrends.roundHistory, roundMomentum);

    // Create charts
    if (scoringTrends.handicapHistory) {
        populateHandicapHistory(scoringTrends.handicapHistory);
    }
    populateScoreHistory(scoringTrends.roundHistory);

    // Create heatmap
    if (scoringTrends.scoringHeatmap) {
        populateScoringHeatmap(scoringTrends.scoringHeatmap);
    }
}

// ===== SHOT ANALYTICS =====
function populateShotAnalytics(): void {
    if (!data) return;
    const { shotStatistics } = data;

    setTextContent('detail-fairways', `${shotStatistics.fairwaysHitPercentage.toFixed(1)}%`);
    setTextContent('detail-gir', `${shotStatistics.greensInRegulationPercentage.toFixed(1)}%`);
    setTextContent('detail-scrambling', `${shotStatistics.scrambling.toFixed(1)}%`);
    setTextContent('detail-putts', shotStatistics.averagePuttsPerRound.toFixed(1));
    setTextContent('putts-gir', shotStatistics.averagePuttsPerGIR.toFixed(2));

    // Populate hole type performance
    if (shotStatistics.holeTypePerformance) {
        populateHoleTypePerformance(shotStatistics.holeTypePerformance);
    }

    // Populate approach shot accuracy
    if (shotStatistics.approachShotAccuracy) {
        populateApproachShotAccuracy(shotStatistics.approachShotAccuracy);
    }

    // Populate putting performance
    if (shotStatistics.puttingPerformance) {
        populatePuttingPerformance(shotStatistics.puttingPerformance);
    }

    // Populate birdie conversion
    if (shotStatistics.birdieConversion) {
        populateBirdieConversion(shotStatistics.birdieConversion);
    }

    // Populate strokes gained analysis
    if (shotStatistics.strokesGained) {
        populateStrokesGained(shotStatistics.strokesGained);
    }
}

// ===== COURSE PERFORMANCE =====
function populateCourseSection(): void {
    if (!data) return;

    // Course learning curves
    if (data.courseLearningCurves && data.courseLearningCurves.length > 0) {
        populateCourseLearningCurves(data.courseLearningCurves);
    }

    // All course performance
    populateCoursePerformance(data.coursePerformance);
}
