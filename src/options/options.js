import { loadSettings, saveSettings, exportAll, importAll, loadTransactions, saveTransactions, addCredit, addDebit } from '../lib/storage.js';

function qs(id) { return document.getElementById(id); }

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

async function renderTransactions() { // Renamed from renderCredits
    const settings = await loadSettings();
    const transactions = await loadTransactions(settings.storageBackend); // Renamed from credits
    const list = qs('creditsHistoryList');
    list.innerHTML = '';
    // Sort by timestamp descending
    const sortedTransactions = [...transactions].sort((a, b) => b.timestamp - a.timestamp);

    for (const t of sortedTransactions) { // Renamed from c
        const tr = document.createElement('tr');
        const amountClass = t.type === 'credit' ? 'credit-amount' : 'debit-amount';
        tr.innerHTML = `
            <td>${fmtDate(t.timestamp)}</td>
            <td>${t.type === 'credit' ? 'Credit' : 'Debit'}</td>
            <td class="${amountClass}">${fmtCurrency(t.amount, settings.currency || 'USD')}</td>
            <td>${t.note || ''}</td>
            <td><button data-id="${t.id}">Remove</button></td>
        `;
        list.appendChild(tr);
    }
}

qs('creditHistoryTable').addEventListener('click', async (e) => {
    if (e.target.dataset.id) {
        const id = e.target.dataset.id;
        if (!confirm('Are you sure you want to remove this transaction?')) { // Updated message
            return;
        }
        const settings = await loadSettings();
        const transactions = await loadTransactions(settings.storageBackend); // Renamed from credits
        const newTransactions = transactions.filter(t => t.id !== id); // Renamed from newCredits
        await saveTransactions(newTransactions, settings.storageBackend); // Renamed from saveCredits
        await renderTransactions(); // Renamed from renderCredits
    }
});

function applyMode(mode) {
  const isDate = mode === 'date';
  document.getElementById('targetDateRow').classList.toggle('hidden', !isDate);
  document.getElementById('targetAgeRow').classList.toggle('hidden', isDate);
}

async function init() {
  const s = await loadSettings();
  qs('dobISO').value = s.dobISO || '';
  qs('startDateISO').value = s.startDateISO || '';
  qs('dailyRate').value = String(s.dailyRate ?? 10000);
  qs('currency').value = s.currency || 'USD';
  qs('storageBackend').value = s.storageBackend || 'sync';
  const mode = s.targetMode || 'date';
  Array.from(document.querySelectorAll('input[name="targetMode"]')).forEach(r => {
    r.checked = r.value === mode;
  });
  qs('targetDateISO').value = s.targetDateISO || '';
  qs('targetAgeYears').value = String(s.targetAgeYears || 0);
  applyMode(mode);
  await renderTransactions(); // Renamed from renderCredits
}

document.addEventListener('change', (e) => {
  if (e.target && e.target.name === 'targetMode') {
    applyMode(e.target.value);
  }
});

document.getElementById('settingsForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const mode = Array.from(document.querySelectorAll('input[name="targetMode"]')).find(r => r.checked)?.value || 'date';
  const next = {
    dobISO: qs('dobISO').value,
    startDateISO: qs('startDateISO').value,
    dailyRate: Number(qs('dailyRate').value || 0),
    currency: qs('currency').value || 'USD',
    storageBackend: qs('storageBackend').value,
    targetMode: mode,
    targetDateISO: mode === 'date' ? qs('targetDateISO').value : '',
    targetAgeYears: mode === 'age' ? Number(qs('targetAgeYears').value || 0) : 0
  };
  await saveSettings(next);
  alert('Settings saved.');
});

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
  await renderTransactions(); // Renamed from renderCredits
});

document.getElementById('debitForm').addEventListener('submit', async (e) => { // New debit form listener
  e.preventDefault();
  const amountEl = document.getElementById('debitAmount');
  const noteEl = document.getElementById('debitNote');
  const amount = Number(amountEl.value || 0);
  const note = noteEl.value || '';
  if (!Number.isFinite(amount) || amount <= 0) {
    alert('Please enter a positive amount.');
    return;
  }
  const settings = await loadSettings();
  await addDebit(amount, note, settings.storageBackend);
  amountEl.value = '';
  noteEl.value = '';
  await renderTransactions();
});

document.getElementById('exportBtn').addEventListener('click', async () => {
  const s = await loadSettings();
  const data = await exportAll(s.storageBackend);
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'debt-calculator-export.json';
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
});

document.getElementById('importFile').addEventListener('change', async (e) => {
  const file = e.target.files && e.target.files[0];
  if (!file) return;
  const text = await file.text();
  try {
    const data = JSON.parse(text);
    const ok = confirm('Importing will overwrite existing settings and transactions. Continue?'); // Updated message
    if (!ok) return;
    await importAll(data);
    alert('Import successful.');
    await init();
  } catch {
    alert('Invalid JSON file.');
  }
});

chrome.storage.onChanged.addListener((changes) => {
    if (changes.transactions) { // Listen for transactions changes
        renderTransactions(); // Renamed from renderCredits
    }
});

init();
