import { loadSettings, loadTransactions } from '../lib/storage.js';
import { computeDebt, resolveTargetDate, computeDaysLeft } from '../lib/debt.js';

const MS_PER_YEAR = 1000 * 60 * 60 * 24 * 365.25;

function fmtCurrency(value, currency) {
  try {
    return new Intl.NumberFormat(undefined, { style: 'currency', currency, maximumFractionDigits: 2, minimumFractionDigits: 2 }).format(value);
  } catch {
    return new Intl.NumberFormat(undefined, { maximumFractionDigits: 2, minimumFractionDigits: 2 }).format(value) + ' ' + currency;
  }
}

function fmtDate(ts) {
  try {
    return new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(ts));
  } catch {
    return new Date(ts).toLocaleString();
  }
}

async function init() {
  const settings = await loadSettings();
  const transactions = await loadTransactions(settings.storageBackend);

  // Days left (doesn't change every second)
  const target = resolveTargetDate(settings.targetMode, settings.dobISO, settings.targetDateISO, settings.targetAgeYears);
  const daysLeft = computeDaysLeft(target);
  document.getElementById('daysLeft').textContent = daysLeft === null ? '—' : String(daysLeft);

  const debtAtStartOfToday = computeDebt(settings.dailyRate, settings.startDateISO, transactions);
  const ratePerSecond = settings.dailyRate / (24 * 60 * 60);
  const startOfToday = new Date();
  startOfToday.setUTCHours(0, 0, 0, 0);
  const startOfTodayTS = startOfToday.getTime();

  function update() {
    const now = new Date();

    // Age
    if (settings.dobISO) {
        const dob = new Date(settings.dobISO);
        const ageInMs = now.getTime() - dob.getTime();
        const age = ageInMs / MS_PER_YEAR;
        document.getElementById('age').textContent = `Age ${age.toFixed(8)}`;
    } else {
        document.getElementById('age').textContent = 'Age —';
    }

    // Debt
    const secondsIntoDay = (now.getTime() - startOfTodayTS) / 1000;
    const debt = debtAtStartOfToday + (secondsIntoDay * ratePerSecond);
    document.getElementById('debt').textContent = fmtCurrency(debt, settings.currency || 'USD');
  }

  setInterval(update, 1000);
  update(); // initial call
}


chrome.storage.onChanged.addListener((changes) => {
  if (changes.settings || changes.transactions) {
    // For simplicity, we can just re-initialize everything if settings/transactions change.
    // A more optimized approach might be to handle specific changes without a full reload.
    window.location.reload();
  }
});

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}



