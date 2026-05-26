export interface StreakStats {
  currentStreak: number;
  longestStreak: number;
  completionPercent: number; // For last 30 days or total
}

export function calculateStreaksFromDates(dateStrings: string[], totalDaysReference: number = 30): StreakStats {
  if (!dateStrings || dateStrings.length === 0) {
    return { currentStreak: 0, longestStreak: 0, completionPercent: 0 };
  }

  // Expects dateStrings to be like "YYYY-MM-DD"
  const sortedDates = [...new Set(dateStrings)]
    .map(d => new Date(d + "T00:00:00").getTime())
    .sort((a, b) => a - b);

  if (sortedDates.length === 0) {
    return { currentStreak: 0, longestStreak: 0, completionPercent: 0 };
  }

  let longest = 0;
  let currentTemp = 0;
  let prevDate = null;

  for (const time of sortedDates) {
    const dateObj = new Date(time);
    
    if (prevDate === null) {
      currentTemp = 1;
    } else {
      const diffDays = Math.round((time - prevDate.getTime()) / (1000 * 60 * 60 * 24));
      if (diffDays === 1) {
        currentTemp += 1;
      } else if (diffDays === 0) {
        // Same day
      } else {
        if (currentTemp > longest) longest = currentTemp;
        currentTemp = 1;
      }
    }
    prevDate = dateObj;
  }
  
  if (currentTemp > longest) longest = currentTemp;

  // Calculate current streak
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);

  const dateSet = new Set(sortedDates);
  const hasToday = dateSet.has(today.getTime());
  const hasYesterday = dateSet.has(yesterday.getTime());

  let current = 0;
  if (hasToday || hasYesterday) {
    let checkDate = hasToday ? today.getTime() : yesterday.getTime();
    current = 1;
    checkDate -= (24 * 60 * 60 * 1000); // minus 1 day
    while (dateSet.has(checkDate)) {
      current++;
      checkDate -= (24 * 60 * 60 * 1000);
    }
  }

  // Filter dates within the last `totalDaysReference` days for completion %
  const referenceMs = today.getTime() - (totalDaysReference * 24 * 60 * 60 * 1000);
  const recentCompletions = sortedDates.filter(t => t >= referenceMs).length;
  
  const completionPercent = Math.round((recentCompletions / totalDaysReference) * 100);

  return {
    currentStreak: current,
    longestStreak: longest,
    completionPercent: Math.min(completionPercent, 100),
  };
}
