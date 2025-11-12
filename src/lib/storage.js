const DEFAULTS = {
  settings: {
    dobISO: "",
    startDateISO: new Date().toISOString().slice(0, 10),
    dailyRate: 10000,
    targetMode: "date",
    targetDateISO: "",
    targetAgeYears: 0,
    storageBackend: "sync",
    currency: "USD"
  },
  credits: []
};

function getArea(storageBackend) {
  return storageBackend === 'local' ? chrome.storage.local : chrome.storage.sync;
}

export async function loadSettings() {
  const area = getArea(DEFAULTS.settings.storageBackend);
  const res = await area.get(['settings']);
  return { ...DEFAULTS.settings, ...(res.settings || {}) };
}

export async function saveSettings(settings) {
  const area = getArea(settings.storageBackend || DEFAULTS.settings.storageBackend);
  await area.set({ settings });
}

export async function loadCredits(storageBackend) {
  const area = getArea(storageBackend || DEFAULTS.settings.storageBackend);
  const res = await area.get(['credits']);
  return Array.isArray(res.credits) ? res.credits : [];
}

export async function addCredit(amount, note, storageBackend) {
  const area = getArea(storageBackend || DEFAULTS.settings.storageBackend);
  const credits = await loadCredits(storageBackend);
  const credit = {
    id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now()) + Math.random().toString(16).slice(2),
    timestamp: Date.now(),
    amount: Number(amount) || 0,
    note: note || ""
  };
  credits.push(credit);
  await area.set({ credits });
  return credit;
}

export async function exportAll(storageBackend) {
  const area = getArea(storageBackend || DEFAULTS.settings.storageBackend);
  const res = await area.get(['settings', 'credits']);
  return {
    settings: { ...DEFAULTS.settings, ...(res.settings || {}) },
    credits: Array.isArray(res.credits) ? res.credits : []
  };
}

export async function importAll(data) {
  const settings = { ...DEFAULTS.settings, ...(data.settings || {}) };
  const backend = getArea(settings.storageBackend || DEFAULTS.settings.storageBackend);
  await backend.set({
    settings,
    credits: Array.isArray(data.credits) ? data.credits : []
  });
}


