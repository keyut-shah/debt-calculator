import { loadSettings, saveSettings, exportAll, importAll } from '../lib/storage.js';

function qs(id) { return document.getElementById(id); }

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
    const ok = confirm('Importing will overwrite existing settings and credits. Continue?');
    if (!ok) return;
    await importAll(data);
    alert('Import successful.');
    await init();
  } catch {
    alert('Invalid JSON file.');
  }
});

init();


