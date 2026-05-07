import { Auth } from '../core/auth.js';
import { Router } from '../core/router.js';
import { Store } from '../core/store.js';
import { UI } from '../components/ui.js';

function routeFor(role) {
  return role === 'student' ? 'student-dashboard' : role === 'teacher' ? 'teacher-dashboard' : role === 'parent' ? 'parent-dashboard' : 'admin-dashboard';
}

export function renderLogin(app) {
  app.innerHTML = `
    <main class="login-wrap">
      <section class="login-card">
        <div class="hero">
          <div class="logo"><div class="logo-mark">字</div><div><h1>字源小學堂</h1><small>可升級版 v2</small></div></div>
          <h1>識字、部首、遊戲練習，一站完成。</h1>
          <p>這是一個可放上 GitHub Pages 的中文學習網站：學生可以闖關、描紅、聽讀音、閱讀和小作文；老師可以建班、派練習、生成練習紙、競賽和家長週報；管理員可以維護內容、學校、訂閱、AI、出版社和 LMS 串接。</p>
          <div class="demo-list">
            <div class="demo-pill">學生：<strong>student1 / 123456</strong></div>
            <div class="demo-pill">老師：<strong>teacher / 123456</strong></div>
            <div class="demo-pill">管理員：<strong>admin / 123456</strong></div>
            <div class="demo-pill">家長：<strong>parent / 123456</strong></div>
          </div>
        </div>
        <div class="card">
          <h3>登入</h3>
          <form class="form" id="loginForm">
            <div class="form-row"><label>帳號</label><input class="input" name="username" value="student1" autocomplete="username" /></div>
            <div class="form-row"><label>密碼</label><input class="input" name="password" type="password" value="123456" autocomplete="current-password" /></div>
            <button class="btn primary" type="submit">進入網站</button>
            <button class="btn ghost" type="button" id="resetDemo">重置示範資料</button>
            <div id="loginMsg" class="feedback hidden"></div>
          </form>
        </div>
      </section>
    </main>
  `;

  document.querySelector('#loginForm').addEventListener('submit', event => {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(event.target));
    const result = Auth.login(data.username.trim(), data.password.trim());
    const msg = document.querySelector('#loginMsg');
    if (!result.ok) {
      msg.className = 'feedback bad';
      msg.textContent = result.message;
      return;
    }
    Router.go(routeFor(result.user.role));
  });

  document.querySelector('#resetDemo').addEventListener('click', () => {
    Store.reset();
    UI.toast('已重置示範資料，請重新登入。');
    setTimeout(() => location.reload(), 500);
  });
}
