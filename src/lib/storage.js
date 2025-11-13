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
  transactions: [] // Renamed from credits
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

export async function saveTransactions(transactions, storageBackend) { // Renamed from saveCredits
  const area = getArea(storageBackend || DEFAULTS.settings.storageBackend);
  await area.set({ transactions }); // Renamed from credits
}

export async function loadTransactions(storageBackend) { // Renamed from loadCredits
  const area = getArea(storageBackend || DEFAULTS.settings.storageBackend);
  const res = await area.get(['transactions']); // Renamed from credits
  return Array.isArray(res.transactions) ? res.transactions : []; // Renamed from credits
}

export async function addTransaction(amount, note, type, storageBackend) { // New function
  const area = getArea(storageBackend || DEFAULTS.settings.storageBackend);
  const transactions = await loadTransactions(storageBackend); // Renamed from credits
  const transaction = {
    id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now()) + Math.random().toString(16).slice(2),
    timestamp: Date.now(),
    amount: Number(amount) || 0,
    note: note || "",
    type: type // 'credit' or 'debit'
  };
  transactions.push(transaction);
  await area.set({ transactions }); // Renamed from credits
  return transaction;
}

export async function addCredit(amount, note, storageBackend) {
  return addTransaction(amount, note, 'credit', storageBackend);
}

export async function addDebit(amount, note, storageBackend) {
  return addTransaction(amount, note, 'debit', storageBackend);
}

export async function exportAll(storageBackend) {
  const area = getArea(storageBackend || DEFAULTS.settings.storageBackend);
  const res = await area.get(['settings', 'transactions']); // Renamed from credits
  return {
    settings: { ...DEFAULTS.settings, ...(res.settings || {}) },
    transactions: Array.isArray(res.transactions) ? res.transactions : [] // Renamed from credits
  };
}

export async function importAll(data) {
  const settings = { ...DEFAULTS.settings, ...(data.settings || {}) };
  const backend = getArea(settings.storageBackend || DEFAULTS.settings.storageBackend);
  await backend.set({
    settings,
    transactions: Array.isArray(data.transactions) ? data.transactions : [] // Renamed from credits
  });
}


