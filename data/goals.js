/**
 * Goal tracking and progress calculation
 */
/**
 * User's handicap goals
 * Edit these to set your own goals
 */
export const GOALS = [
    {
        id: 'sub-10-2025',
        description: 'Sub-10 Handicap',
        targetHandicap: 9.9,
        deadline: '2025-12-31',
        priority: 'near-term'
    },
    {
        id: 'single-digit-2026',
        description: '5 Handicap or Better',
        targetHandicap: 5.0,
        deadline: '2026-12-31',
        priority: 'mid-term'
    },
    {
        id: 'scratch-longterm',
        description: 'Scratch Golfer',
        targetHandicap: 0.0,
        deadline: '2027-12-31',
        priority: 'long-term'
    }
];
/**
 * Calculate goal progress and burndown data
 */
export function calculateGoalsData(currentHandicap, handicapHistory) {
    if (handicapHistory.length === 0) {
        // Return empty data if no history
        return {
            goals: GOALS,
            progress: [],
            burndownData: [],
            startHandicap: currentHandicap,
            startDate: new Date().toISOString().split('T')[0]
        };
    }
    // Sort handicap history by date
    const sortedHistory = [...handicapHistory].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    const startHandicap = sortedHistory[0].handicapIndex;
    const startDate = sortedHistory[0].date;
    const today = new Date();
    // Calculate recent trend (last 3 months)
    const threeMonthsAgo = new Date(today);
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
    const recentHistory = sortedHistory.filter(h => new Date(h.date) >= threeMonthsAgo);
    let currentTrend = 0;
    if (recentHistory.length >= 2) {
        const firstRecent = recentHistory[0];
        const lastRecent = recentHistory[recentHistory.length - 1];
        const handicapChange = firstRecent.handicapIndex - lastRecent.handicapIndex; // Positive = improving
        const daysDiff = (new Date(lastRecent.date).getTime() - new Date(firstRecent.date).getTime()) / (1000 * 60 * 60 * 24);
        const monthsDiff = daysDiff / 30;
        currentTrend = monthsDiff > 0 ? handicapChange / monthsDiff : 0;
    }
    // Calculate progress for each goal
    const progress = GOALS.map(goal => {
        const deadlineDate = new Date(goal.deadline);
        const daysRemaining = Math.ceil((deadlineDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        const monthsRemaining = daysRemaining / 30;
        const handicapDelta = currentHandicap - goal.targetHandicap;
        const requiredMonthlyImprovement = monthsRemaining > 0 ? handicapDelta / monthsRemaining : 0;
        // Project where handicap will be at deadline based on current trend
        const projectedHandicap = currentHandicap - (currentTrend * monthsRemaining);
        // Calculate when target will be reached based on current trend
        let projectedDate;
        if (currentTrend > 0 && handicapDelta > 0) {
            const monthsToTarget = handicapDelta / currentTrend;
            const targetDate = new Date(today);
            targetDate.setDate(targetDate.getDate() + (monthsToTarget * 30));
            projectedDate = targetDate.toISOString().split('T')[0];
        }
        // Determine if on track (within 20% of required rate or better)
        const onTrack = currentTrend >= (requiredMonthlyImprovement * 0.8);
        // Calculate progress percentage (0-100)
        const totalImprovement = startHandicap - goal.targetHandicap;
        const currentImprovement = startHandicap - currentHandicap;
        const progressPercentage = totalImprovement > 0
            ? Math.min(100, Math.max(0, (currentImprovement / totalImprovement) * 100))
            : 0;
        return {
            goal,
            currentHandicap,
            handicapDelta,
            daysRemaining,
            requiredMonthlyImprovement,
            currentTrend,
            onTrack,
            projectedHandicap,
            projectedDate,
            progressPercentage
        };
    });
    // Generate burndown data
    const burndownData = generateBurndownData(sortedHistory, GOALS, startDate);
    return {
        goals: GOALS,
        progress,
        burndownData,
        startHandicap,
        startDate
    };
}
/**
 * Generate burndown chart data points
 */
function generateBurndownData(handicapHistory, goals, startDate) {
    if (handicapHistory.length === 0)
        return [];
    const points = [];
    const start = new Date(startDate);
    const today = new Date();
    // Find the furthest goal deadline
    const maxDeadline = goals.reduce((max, goal) => {
        const deadline = new Date(goal.deadline);
        return deadline > max ? deadline : max;
    }, new Date(goals[0].deadline));
    // Generate a point for each month from start to max deadline
    const currentDate = new Date(start);
    const startHandicap = handicapHistory[0].handicapIndex;
    const finalGoalHandicap = Math.min(...goals.map(g => g.targetHandicap));
    // Calculate ideal linear trajectory to final goal
    const totalMonths = (maxDeadline.getTime() - start.getTime()) / (1000 * 60 * 60 * 24 * 30);
    const monthlyImprovement = (startHandicap - finalGoalHandicap) / totalMonths;
    let handicapIndex = 0;
    while (currentDate <= maxDeadline) {
        const dateStr = currentDate.toISOString().split('T')[0];
        // Find actual handicap for this date (or closest prior)
        let actualHandicap;
        if (currentDate <= today) {
            const priorHistory = handicapHistory.filter(h => new Date(h.date) <= currentDate);
            if (priorHistory.length > 0) {
                actualHandicap = priorHistory[priorHistory.length - 1].handicapIndex;
            }
        }
        // Calculate ideal handicap (linear progression)
        const monthsElapsed = (currentDate.getTime() - start.getTime()) / (1000 * 60 * 60 * 24 * 30);
        const idealHandicap = startHandicap - (monthlyImprovement * monthsElapsed);
        // Check if this date is a goal milestone
        let goalHandicap;
        const matchingGoal = goals.find(g => {
            const deadline = new Date(g.deadline);
            return Math.abs(deadline.getTime() - currentDate.getTime()) < (1000 * 60 * 60 * 24 * 3); // Within 3 days
        });
        if (matchingGoal) {
            goalHandicap = matchingGoal.targetHandicap;
        }
        points.push({
            date: dateStr,
            actualHandicap,
            idealHandicap,
            goalHandicap
        });
        // Move to next month
        currentDate.setMonth(currentDate.getMonth() + 1);
        handicapIndex++;
    }
    return points;
}
//# sourceMappingURL=goals.js.map