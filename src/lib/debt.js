import { startOfUTCDay, addYearsCalendarAccurate } from './date.js';

/**
 * @param {number} dailyRate
 * @param {string} startIso
 * @param {{amount:number}[]} credits
 * @param {Date=} now
 */
export function computeDebt(dailyRate, startIso, credits, now = new Date()) {
  const start = startOfUTCDay(new Date(startIso));
  const today = startOfUTCDay(now);
  const daysElapsed = Math.max(0, Math.floor((today.getTime() - start.getTime()) / 86400000));
  const credited = (credits || []).reduce((s, c) => s + Math.max(0, Number(c.amount) || 0), 0);
  return Math.max(0, dailyRate * daysElapsed - credited);
}

/**
 * @param {'date'|'age'} targetMode
 * @param {string} dobIso
 * @param {string|undefined} targetDateISO
 * @param {number|undefined} targetAgeYears
 * @returns {Date|null}
 */
export function resolveTargetDate(targetMode, dobIso, targetDateISO, targetAgeYears) {
  if (targetMode === 'date') {
    if (!targetDateISO) return null;
    return startOfUTCDay(new Date(targetDateISO));
  }
  if (targetMode === 'age') {
    if (!dobIso || !targetAgeYears && targetAgeYears !== 0) return null;
    const d = new Date(dobIso);
    return startOfUTCDay(addYearsCalendarAccurate(d, Number(targetAgeYears)));
  }
  return null;
}

/**
 * @param {Date|null} targetDate
 * @param {Date=} now
 */
export function computeDaysLeft(targetDate, now = new Date()) {
  if (!targetDate) return null;
  const today = startOfUTCDay(now);
  const ms = targetDate.getTime() - today.getTime();
  const daysLeft = Math.ceil(ms / 86400000);
  return Math.max(0, daysLeft);
}


