import { SEED } from '../data/seed.js';

const DB_KEY = 'zixue_db_v2';
const AUTH_KEY = 'zixue_current_user';

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function withDefaults(db) {
  const base = clone(SEED);
  return { ...base, ...db, version: SEED.version };
}

export const Store = {
  init() {
    const raw = localStorage.getItem(DB_KEY);
    if (!raw) {
      localStorage.setItem(DB_KEY, JSON.stringify(clone(SEED)));
      return clone(SEED);
    }
    try {
      const parsed = JSON.parse(raw);
      const merged = withDefaults(parsed);
      localStorage.setItem(DB_KEY, JSON.stringify(merged));
      return clone(merged);
    } catch (error) {
      console.warn('資料庫損壞，已重置。', error);
      localStorage.setItem(DB_KEY, JSON.stringify(clone(SEED)));
      return clone(SEED);
    }
  },
  get() {
    return Store.init();
  },
  set(db) {
    localStorage.setItem(DB_KEY, JSON.stringify(db));
    window.dispatchEvent(new CustomEvent('db:changed'));
  },
  mutate(fn) {
    const db = Store.get();
    fn(db);
    Store.set(db);
    return db;
  },
  reset() {
    localStorage.setItem(DB_KEY, JSON.stringify(clone(SEED)));
    localStorage.removeItem(AUTH_KEY);
  },
  getAuthKey() {
    return AUTH_KEY;
  },
  uid(prefix = 'id') {
    return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  }
};
