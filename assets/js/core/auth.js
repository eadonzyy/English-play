import { Store } from './store.js';

const AUTH_KEY = Store.getAuthKey();

export const Auth = {
  login(username, password) {
    const db = Store.get();
    const user = db.users.find(u => u.username === username && u.password === password);
    if (!user) return { ok: false, message: '帳號或密碼不正確。' };
    localStorage.setItem(AUTH_KEY, user.id);
    return { ok: true, user };
  },
  logout() {
    localStorage.removeItem(AUTH_KEY);
    location.hash = '#login';
  },
  currentUser() {
    const id = localStorage.getItem(AUTH_KEY);
    if (!id) return null;
    return Store.get().users.find(u => u.id === id) || null;
  },
  requireRole(roles) {
    const user = Auth.currentUser();
    if (!user) return false;
    return roles.includes(user.role);
  }
};
