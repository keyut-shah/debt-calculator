import { loadSettings, loadCredits, addCredit } from '../lib/storage.js';
import { diffCalendarYMD, startOfUTCDay } from '../lib/date.js';
import { computeDebt, resolveTargetDate, computeDaysLeft } from '../lib/debt.js';

function fmtCurrency(value, currency) {
  try {
    return new Intl.NumberFormat(undefined, { style: 'currency', currency }).format(value);
  } catch {
    return new Intl.NumberFormat().format(value) + ' ' + currency;
  }
}

function fmtDate(ts) {
  try {
    return new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(ts));
  } catch {
    return new Date(ts).toLocaleString();
  }
}

async function render() {
  const settings = await loadSettings();
  const credits = await loadCredits(settings.storageBackend);

  // Age
  let ageText = 'Age —';
  if (settings.dobISO) {
    const a = diffCalendarYMD(startOfUTCDay(new Date(settings.dobISO)), startOfUTCDay(new Date()));
    ageText = `Age ${a.years}y ${a.months}m ${a.days}d`;
  }
  document.getElementById('age').textContent = ageText;

  // Debt
  const debt = computeDebt(settings.dailyRate, settings.startDateISO, credits);
  document.getElementById('debt').textContent = fmtCurrency(debt, settings.currency || 'USD');

  // Days left
  const target = resolveTargetDate(settings.targetMode, settings.dobISO, settings.targetDateISO, settings.targetAgeYears);
  const daysLeft = computeDaysLeft(target);
  document.getElementById('daysLeft').textContent = daysLeft === null ? '—' : String(daysLeft);

  // Recent credits
  const list = document.getElementById('creditsList');
  list.innerHTML = '';
  const recent = [...credits].sort((a, b) => b.timestamp - a.timestamp).slice(0, 5);
  for (const c of recent) {
    const li = document.createElement('li');
    li.textContent = `${fmtCurrency(c.amount, settings.currency || 'USD')} — ${fmtDate(c.timestamp)}${c.note ? ` — ${c.note}` : ''}`;
    list.appendChild(li);
  }
}

document.getElementById('creditForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const amountEl = document.getElementById('creditAmount');
  const noteEl = document.getElementById('creditNote');
  const amount = Number(amountEl.value || 0);
  const note = noteEl.value || '';
  if (!Number.isFinite(amount) || amount <= 0) {
    alert('Please enter a positive amount.');
    return;
  }
  const settings = await loadSettings();
  await addCredit(amount, note, settings.storageBackend);
  amountEl.value = '';
  noteEl.value = '';
  await render();
});

render();


