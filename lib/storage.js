export const USERS_KEY = 'lostAndFoundUsers';
export const AUTH_SESSION_KEY = 'lostAndFoundAuthSession';

function readJson(key, fallback) {
  if (typeof window === 'undefined') return fallback;

  try {
    const raw = window.localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function writeJson(key, value) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(key, JSON.stringify(value));
}

export function getUsers() {
  const users = readJson(USERS_KEY, []);
  return Array.isArray(users) ? users : [];
}

export function saveUsers(users) {
  writeJson(USERS_KEY, users);
}

export function getSessionUser() {
  if (typeof window === 'undefined') return '';
  return window.localStorage.getItem(AUTH_SESSION_KEY) || '';
}

export function setSessionUser(username) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(AUTH_SESSION_KEY, username);
}

export function clearSessionUser() {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(AUTH_SESSION_KEY);
}

export function getItemsKey(username) {
  return `lostAndFoundItems:${username}`;
}

export function getItems(username) {
  const items = readJson(getItemsKey(username), []);
  return Array.isArray(items) ? items : [];
}

export function saveItems(username, items) {
  writeJson(getItemsKey(username), items);
}
