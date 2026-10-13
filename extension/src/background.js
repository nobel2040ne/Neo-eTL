const REMOVED = ['notes', 'todos', 'reminders', 'reminderLeads', 'reminderItems', 'reminded', 'reminderLinks'];

async function migrate() {
  const old = await chrome.storage.local.get(['appearance']);
  if (old.appearance === 'dark') await chrome.storage.local.set({ theme: 'midnight' });
  if (old.appearance === 'light') await chrome.storage.local.set({ theme: 'myetl' });
  await chrome.storage.local.remove(['appearance', 'darkMode', 'dashboard', ...REMOVED]);
}

chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'update') migrate();
});
