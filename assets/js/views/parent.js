import { Store } from '../core/store.js';
import { Auth } from '../core/auth.js';
import { UI } from '../components/ui.js';
import { AITutor } from '../utils/ai.js';

function db() { return Store.get(); }
function current() { return Auth.currentUser(); }
function wrongItemsFor(studentId) {
  const data = db();
  const map = new Map();
  data.progress.filter(p => p.studentId === studentId).flatMap(p => p.mistakes || []).forEach(m => {
    const key = `${m.char}-${m.type || '練習'}`;
    const prev = map.get(key) || { ...m, count: 0 };
    prev.count += m.count || 1;
    map.set(key, prev);
  });
  return [...map.values()].sort((a, b) => (b.count || 1) - (a.count || 1));
}

export function renderParentDashboard(main) {
  const user = current();
  const data = db();
  const students = (user.studentIds || []).map(id => data.users.find(u => u.id === id)).filter(Boolean);
  main.innerHTML = `
    ${UI.topbar('家長中心', '查看孩子本週學習情況與家庭練習建議。')}
    ${students.map(student => {
      const progress = data.progress.filter(p => p.studentId === student.id);
      const done = progress.filter(p => p.completed).length;
      const avg = progress.length ? Math.round(progress.reduce((sum, p) => sum + (p.score || 0), 0) / progress.length) : 0;
      const wrongs = wrongItemsFor(student.id);
      const recommendations = AITutor.recommendFromMistakes(wrongs, data.radicals);
      return `<div class="card" style="margin-bottom:18px">
        <h3>${UI.escape(student.name)}</h3>
        <div class="grid four">
          ${UI.metricCard('完成練習', String(done), '✅')}
          ${UI.metricCard('平均分', `${avg}`, '📊', avg >= 80 ? 'good' : 'warn')}
          ${UI.metricCard('星星', String(student.stars || 0), '⭐')}
          ${UI.metricCard('錯題', String(wrongs.length), '📘', wrongs.length ? 'warn' : 'good')}
        </div>
        <h4>家庭練習建議</h4>
        <ol class="clean-list">${recommendations.map(r => `<li>${UI.escape(r)}</li>`).join('')}</ol>
      </div>`;
    }).join('') || UI.empty('此家長帳號尚未綁定學生。')}
  `;
}
