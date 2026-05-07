import { Store } from '../core/store.js';
import { Auth } from '../core/auth.js';
import { UI } from '../components/ui.js';

function db() { return Store.get(); }
function teacher() { return Auth.currentUser(); }
function teacherClasses() { return db().classes.filter(c => c.teacherId === teacher().id); }
function classStudents(classId) {
  const data = db();
  const cls = data.classes.find(c => c.id === classId);
  return (cls?.studentIds || []).map(id => data.users.find(u => u.id === id)).filter(Boolean);
}
function assignmentsForTeacher() {
  const classIds = new Set(teacherClasses().map(c => c.id));
  return db().assignments.filter(a => classIds.has(a.classId));
}

export function renderTeacherDashboard(main) {
  const data = db();
  const classes = teacherClasses();
  const assignments = assignmentsForTeacher();
  const studentCount = classes.reduce((sum, c) => sum + (c.studentIds?.length || 0), 0);
  const progress = data.progress.filter(p => assignments.some(a => a.id === p.assignmentId));
  const completed = progress.filter(p => p.completed).length;
  main.innerHTML = `
    ${UI.topbar(`老師後台`, '建立班級、派發練習、查看完成情況和錯題統計。')}
    <div class="grid four">
      <div class="card kpi"><div><span class="badge good">班級</span><div class="num">${classes.length}</div></div><div class="emoji">🏫</div></div>
      <div class="card kpi"><div><span class="badge good">學生</span><div class="num">${studentCount}</div></div><div class="emoji">👧</div></div>
      <div class="card kpi"><div><span class="badge warn">作業</span><div class="num">${assignments.length}</div></div><div class="emoji">📝</div></div>
      <div class="card kpi"><div><span class="badge good">已完成</span><div class="num">${completed}</div></div><div class="emoji">✅</div></div>
    </div>
    <div class="grid two" style="margin-top:18px">
      <div class="card"><h3>最近作業</h3>${renderAssignmentTable(assignments.slice(0, 6), data)}</div>
      <div class="card"><h3>全班常錯字</h3>${renderMistakeStats()}</div>
    </div>
  `;
}

function renderAssignmentTable(assignments, data = db()) {
  if (!assignments.length) return UI.empty('暫時沒有作業。');
  return UI.table(['作業', '班級', '類型', '完成情況', '期限'], assignments.map(a => {
    const cls = data.classes.find(c => c.id === a.classId);
    const students = cls?.studentIds?.length || 0;
    const done = data.progress.filter(p => p.assignmentId === a.id && p.completed).length;
    return [UI.escape(a.title), UI.escape(cls?.name || ''), UI.escape(UI.gameName(a.gameType)), `${done}/${students}`, UI.escape(a.dueDate || '')];
  }));
}

function renderMistakeStats() {
  const data = db();
  const assignments = assignmentsForTeacher();
  const related = data.progress.filter(p => assignments.some(a => a.id === p.assignmentId));
  const counts = new Map();
  related.flatMap(p => p.mistakes || []).forEach(m => counts.set(m.char, (counts.get(m.char) || 0) + (m.count || 1)));
  const rows = [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 8);
  if (!rows.length) return UI.empty('暫時沒有錯題記錄。');
  const max = Math.max(...rows.map(r => r[1]));
  return `<div class="stats-list">${rows.map(([char, count]) => `<div class="stat-row"><strong style="font-size:26px">${UI.escape(char)}</strong>${UI.progress(Math.round(count / max * 100))}<span>${count}</span></div>`).join('')}</div>`;
}

export function renderClassManagement(main) {
  const data = db();
  const classes = teacherClasses();
  const selectedClassId = classes[0]?.id || '';
  main.innerHTML = `
    ${UI.topbar('班級與學生', '建立班級、加入學生帳號。')}
    <div class="grid two">
      <div class="card">
        <h3>建立班級</h3>
        <form id="classForm" class="form">
          <div class="form-row"><label>班級名稱</label><input class="input" name="name" placeholder="例如：一年級 B 班" required /></div>
          <button class="btn primary" type="submit">新增班級</button>
        </form>
      </div>
      <div class="card">
        <h3>新增學生</h3>
        <form id="studentForm" class="form">
          <div class="form-row"><label>所屬班級</label><select class="select" name="classId" required>${UI.selectOptions(classes, 'id', c => c.name)}</select></div>
          <div class="form-row"><label>學生姓名</label><input class="input" name="name" placeholder="例如：小華" required /></div>
          <div class="form-row"><label>登入帳號</label><input class="input" name="username" placeholder="例如：student3" required /></div>
          <div class="form-row"><label>初始密碼</label><input class="input" name="password" value="123456" required /></div>
          <button class="btn primary" type="submit" ${classes.length ? '' : 'disabled'}>新增學生</button>
        </form>
      </div>
    </div>
    <div class="card" style="margin-top:18px">
      <h3>班級清單</h3>
      ${classes.length ? classes.map(cls => `
        <div class="card flat" style="margin-bottom:12px">
          <h3>${UI.escape(cls.name)}</h3>
          <p>學生人數：${cls.studentIds?.length || 0}</p>
          ${UI.table(['姓名', '帳號', '星星', '連續天數'], classStudents(cls.id).map(s => [UI.escape(s.name), UI.escape(s.username), String(s.stars || 0), `${s.streak || 0} 天`]))}
        </div>
      `).join('') : UI.empty('請先建立班級。')}
    </div>
  `;

  main.querySelector('#classForm').addEventListener('submit', event => {
    event.preventDefault();
    const { name } = Object.fromEntries(new FormData(event.target));
    Store.mutate(data => data.classes.push({ id: Store.uid('class'), name: name.trim(), schoolId: teacher().schoolId || data.schools?.[0]?.id || '', teacherId: teacher().id, studentIds: [], createdAt: new Date().toISOString().slice(0, 10) }));
    UI.toast('已建立班級。');
    renderClassManagement(main);
  });

  main.querySelector('#studentForm').addEventListener('submit', event => {
    event.preventDefault();
    const form = Object.fromEntries(new FormData(event.target));
    Store.mutate(data => {
      if (data.users.some(u => u.username === form.username.trim())) throw new Error('帳號已存在');
      const user = { id: Store.uid('u'), username: form.username.trim(), password: form.password, role: 'student', name: form.name.trim(), stars: 0, streak: 0, classId: form.classId };
      data.users.push(user);
      const cls = data.classes.find(c => c.id === form.classId);
      cls.studentIds.push(user.id);
    });
    UI.toast('已新增學生。');
    renderClassManagement(main);
  });
}

export function renderAssignments(main) {
  const data = db();
  const classes = teacherClasses();
  const assignments = assignmentsForTeacher();
  main.innerHTML = `
    ${UI.topbar('指派練習', '為班級建立找部首、組字或看圖選字任務。')}
    <div class="card">
      <h3>新增作業</h3>
      <form id="assignmentForm" class="form">
        <div class="grid two">
          <div class="form-row"><label>作業名稱</label><input class="input" name="title" placeholder="例如：口部看圖選字" required /></div>
          <div class="form-row"><label>班級</label><select class="select" name="classId" required>${UI.selectOptions(classes, 'id', c => c.name)}</select></div>
          <div class="form-row"><label>部首</label><select class="select" name="radicalId" required>${UI.selectOptions(data.radicals, 'id', r => `${r.key}｜${r.name}`)}</select></div>
          <div class="form-row"><label>題型</label><select class="select" name="gameType"><option value="find-radical">找部首遊戲</option><option value="compose-char">拖拉組字遊戲</option><option value="picture-choice">看圖選字遊戲</option><option value="stroke-trace">筆順描紅</option><option value="reading">閱讀理解</option><option value="writing">小作文練習</option></select></div>
          <div class="form-row"><label>截止日期</label><input class="input" type="date" name="dueDate" required /></div>
        </div>
        <button class="btn primary" type="submit" ${classes.length ? '' : 'disabled'}>指派給班級</button>
      </form>
    </div>
    <div class="card" style="margin-top:18px"><h3>作業清單</h3>${renderAssignmentTable(assignments, data)}</div>
  `;
  main.querySelector('#assignmentForm').addEventListener('submit', event => {
    event.preventDefault();
    const form = Object.fromEntries(new FormData(event.target));
    Store.mutate(data => data.assignments.push({ id: Store.uid('as'), createdBy: teacher().id, createdAt: new Date().toISOString().slice(0, 10), ...form }));
    UI.toast('已指派練習。');
    renderAssignments(main);
  });
}

export function renderCompletion(main) {
  const data = db();
  const assignments = assignmentsForTeacher();
  main.innerHTML = `
    ${UI.topbar('完成情況', '查看每份作業的完成率和分數。')}
    <div class="card">
      ${assignments.length ? assignments.map(a => {
        const cls = data.classes.find(c => c.id === a.classId);
        const rows = classStudents(a.classId).map(s => {
          const p = data.progress.find(x => x.assignmentId === a.id && x.studentId === s.id);
          return [UI.escape(s.name), p?.completed ? '<span class="badge good">已完成</span>' : '<span class="badge warn">未完成</span>', p?.score != null ? `${p.score} 分` : '-', p?.stars ? '⭐'.repeat(p.stars) : '-'];
        });
        return `<div class="card flat" style="margin-bottom:14px"><h3>${UI.escape(a.title)}</h3><p>${UI.escape(cls?.name || '')}｜${UI.escape(UI.gameName(a.gameType))}｜截止 ${UI.escape(a.dueDate || '')}</p>${UI.table(['學生', '狀態', '分數', '星星'], rows)}</div>`;
      }).join('') : UI.empty('暫時沒有作業。')}
    </div>
  `;
}

export function renderMistakes(main) {
  const data = db();
  const assignments = assignmentsForTeacher();
  const related = data.progress.filter(p => assignments.some(a => a.id === p.assignmentId));
  const rows = related.flatMap(p => {
    const student = data.users.find(u => u.id === p.studentId);
    return (p.mistakes || []).map(m => [UI.escape(student?.name || ''), `<strong style="font-size:24px">${UI.escape(m.char)}</strong>`, UI.escape(data.radicals.find(r => r.id === m.radicalId)?.name || ''), UI.escape(UI.gameName(m.type)), String(m.count || 1)]);
  });
  main.innerHTML = `
    ${UI.topbar('錯題統計', '找出全班最容易錯的字，方便老師重點講解。')}
    <div class="grid two">
      <div class="card"><h3>常錯字排行</h3>${renderMistakeStats()}</div>
      <div class="card"><h3>錯題明細</h3>${rows.length ? UI.table(['學生', '錯字', '部首', '題型', '次數'], rows) : UI.empty('暫時沒有錯題明細。')}</div>
    </div>
  `;
}
