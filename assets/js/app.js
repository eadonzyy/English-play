import { Store } from './core/store.js';
import { Auth } from './core/auth.js';
import { Router } from './core/router.js';
import { UI } from './components/ui.js';
import { renderLogin } from './views/login.js';
import { renderStudentDashboard, renderStudentRadical, renderStudentGame, renderWrongBook } from './views/student.js';
import { renderTracePractice, renderStudentCompetition, renderReading, renderWriting, renderRecommendations } from './views/studentPlus.js';
import { renderTeacherDashboard, renderClassManagement, renderAssignments, renderCompletion, renderMistakes } from './views/teacher.js';
import { renderWorksheets, renderCompetitionManagement, renderParentReports, renderOcrReview } from './views/teacherPlus.js';
import { renderAdminDashboard, renderCharacterAdmin, renderRadicalAdmin, renderQuestionAdmin, renderMediaAdmin } from './views/admin.js';
import { renderSchoolAdmin, renderSubscriptionAdmin, renderAiAdmin, renderReadingContentAdmin, renderPartnerships, renderIntegrations } from './views/adminPlus.js';
import { renderParentDashboard } from './views/parent.js';

Store.init();

const app = document.querySelector('#app');

const NAV = {
  student: [
    ['student-dashboard', '🗺️', '學習地圖'],
    ['student-wrongbook', '📘', '錯題本'],
    ['student-recommend', '🤖', 'AI推薦'],
    ['student-competition', '🏆', '班級競賽'],
    ['student-reading', '📖', '閱讀理解'],
    ['student-writing', '✍️', '小作文']
  ],
  teacher: [
    ['teacher-dashboard', '📊', '總覽'],
    ['teacher-classes', '🏫', '班級學生'],
    ['teacher-assignments', '📝', '指派練習'],
    ['teacher-completion', '✅', '完成情況'],
    ['teacher-mistakes', '📘', '錯題統計'],
    ['teacher-worksheets', '🖨️', '練習紙PDF'],
    ['teacher-competition', '🏆', '班級競賽'],
    ['teacher-parent-reports', '👨‍👩‍👧', '家長週報'],
    ['teacher-ocr', '🔍', 'OCR批改']
  ],
  admin: [
    ['admin-dashboard', '⚙️', '管理總覽'],
    ['admin-characters', '字', '漢字管理'],
    ['admin-radicals', '🔤', '部首管理'],
    ['admin-questions', '❓', '題目管理'],
    ['admin-media', '🖼️', '圖片/音頻'],
    ['admin-schools', '🏫', '學校管理'],
    ['admin-subscriptions', '💳', '訂閱方案'],
    ['admin-ai', '🤖', 'AI設定'],
    ['admin-reading-content', '📖', '閱讀/作文'],
    ['admin-partnerships', '🤝', '出版社合作'],
    ['admin-integrations', '🔌', 'LMS串接']
  ],
  parent: [
    ['parent-dashboard', '👨‍👩‍👧', '家長中心']
  ]
};

const ROUTES = {
  student: {
    'student-dashboard': renderStudentDashboard,
    'student-radical': renderStudentRadical,
    'student-game': renderStudentGame,
    'student-wrongbook': renderWrongBook,
    'student-trace': renderTracePractice,
    'student-recommend': renderRecommendations,
    'student-competition': renderStudentCompetition,
    'student-reading': renderReading,
    'student-writing': renderWriting
  },
  teacher: {
    'teacher-dashboard': renderTeacherDashboard,
    'teacher-classes': renderClassManagement,
    'teacher-assignments': renderAssignments,
    'teacher-completion': renderCompletion,
    'teacher-mistakes': renderMistakes,
    'teacher-worksheets': renderWorksheets,
    'teacher-competition': renderCompetitionManagement,
    'teacher-parent-reports': renderParentReports,
    'teacher-ocr': renderOcrReview
  },
  admin: {
    'admin-dashboard': renderAdminDashboard,
    'admin-characters': renderCharacterAdmin,
    'admin-radicals': renderRadicalAdmin,
    'admin-questions': renderQuestionAdmin,
    'admin-media': renderMediaAdmin,
    'admin-schools': renderSchoolAdmin,
    'admin-subscriptions': renderSubscriptionAdmin,
    'admin-ai': renderAiAdmin,
    'admin-reading-content': renderReadingContentAdmin,
    'admin-partnerships': renderPartnerships,
    'admin-integrations': renderIntegrations
  },
  parent: {
    'parent-dashboard': renderParentDashboard
  }
};

function homeFor(role) {
  return role === 'student' ? 'student-dashboard' : role === 'teacher' ? 'teacher-dashboard' : role === 'parent' ? 'parent-dashboard' : 'admin-dashboard';
}

function renderShell(user, route) {
  const nav = NAV[user.role] || [];
  app.innerHTML = `
    <div class="app-shell">
      <aside class="sidebar">
        <div class="logo"><div class="logo-mark">字</div><div><h1>字源小學堂</h1><small>可升級版 v2</small></div></div>
        <div class="nav-group-title">${UI.roleName(user.role)}</div>
        ${nav.map(([path, icon, label]) => `<a class="nav-link ${route.path === path ? 'active' : ''}" href="#${path}"><span>${icon}</span><strong>${label}</strong></a>`).join('')}
        <div class="nav-group-title">常用操作</div>
        <a class="nav-link" href="#${homeFor(user.role)}"><span>🏠</span><strong>回首頁</strong></a>
        <button class="nav-link" id="logoutBtn" style="width:100%; border:0; text-align:left"><span>🚪</span><strong>登出</strong></button>
        <div class="user-card">
          <strong>${UI.escape(user.name)}</strong>
          <span>@${UI.escape(user.username)} · ${UI.roleName(user.role)}</span>
        </div>
      </aside>
      <main class="main" id="main"></main>
    </div>
  `;
  document.querySelector('#logoutBtn').addEventListener('click', () => Auth.logout());
  return document.querySelector('#main');
}

function render() {
  const route = Router.parse();
  const user = Auth.currentUser();

  if (!user || route.path === 'login') {
    renderLogin(app);
    return;
  }

  const roleRoutes = ROUTES[user.role] || {};
  const handler = roleRoutes[route.path];
  if (!handler) {
    Router.go(homeFor(user.role));
    return;
  }

  const main = renderShell(user, route);
  handler(main, route.query);
}

window.addEventListener('hashchange', render);
window.addEventListener('db:changed', () => {});
window.addEventListener('ui:toast', event => UI.toast(event.detail || '操作完成。'));
window.addEventListener('pronunciation:changed', render);
render();
