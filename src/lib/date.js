// UTC date helpers and age/target calculations

/**
 * Return a new Date at UTC midnight of the given date.
 * @param {Date} d
 * @returns {Date}
 */
export function startOfUTCDay(d) {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
}

/**
 * Add calendar-accurate years (handles leap years by clamping day).
 * @param {Date} date
 * @param {number} years
 * @returns {Date}
 */
export function addYearsCalendarAccurate(date, years) {
  const y = date.getUTCFullYear() + years;
  const m = date.getUTCMonth();
  const day = date.getUTCDate();
  // Construct tentative and clamp if month overflowed
  const tentative = new Date(Date.UTC(y, m, day));
  if (tentative.getUTCMonth() !== m) {
    // Day overflow (e.g., Feb 29 -> Feb 28 or Mar 1); clamp by setting day 0 of next month
    return new Date(Date.UTC(y, m + 1, 0));
  }
  return tentative;
}

/**
 * Compute calendar difference (years, months, days) from a to b (both inclusive endpoints aligned to calendar rules).
 * @param {Date} a
 * @param {Date} b
 * @returns {{years:number, months:number, days:number}}
 */
export function diffCalendarYMD(a, b) {
  let years = b.getUTCFullYear() - a.getUTCFullYear();
  let months = b.getUTCMonth() - a.getUTCMonth();
  let days = b.getUTCDate() - a.getUTCDate();
  if (days < 0) {
    // borrow days from previous month
    const prevMonth = new Date(Date.UTC(b.getUTCFullYear(), b.getUTCMonth(), 0));
    days += prevMonth.getUTCDate();
    months -= 1;
  }
  if (months < 0) {
    months += 12;
    years -= 1;
  }
  return { years, months, days };
}


