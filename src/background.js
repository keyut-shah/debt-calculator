import { loadSettings, loadCredits } from './lib/storage.js';
import { computeDaysLeft, resolveTargetDate } from './lib/debt.js';

async function refreshBadge() {
  try {
    const s = await loadSettings();
    const target = resolveTargetDate(s.targetMode, s.dobISO, s.targetDateISO, s.targetAgeYears);
    const days = computeDaysLeft(target);
    const text = days === null ? '' : String(Math.min(days, 9999));
    await chrome.action.setBadgeText({ text });
    await chrome.action.setBadgeBackgroundColor({ color: '#444' });
    await chrome.action.setTitle({ title: 'Debt Calculator' });
  } catch {
    // ignore
  }
}

chrome.runtime.onInstalled.addListener(() => {
  chrome.alarms.create('daily-refresh', { periodInMinutes: 60 * 24 });
  refreshBadge();
});

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'daily-refresh') {
    refreshBadge();
  }
});

chrome.runtime.onStartup.addListener(refreshBadge);


