import { Store } from '../core/store.js';
import { Auth } from '../core/auth.js';
import { UI } from '../components/ui.js';
import { Worksheet } from '../utils/worksheet.js';
import { AITutor } from '../utils/ai.js';

function db() { return Store.get(); }
function teacher() { return Auth.currentUser(); }
function teacherClasses() { return db().classes.filter(c => c.teacherId === teacher().id); }
function classStudents(classId) {
  const data = db();
  const cls = data.classes.find(c => c.id === classId);
  return (cls?.studentIds || []).map(id => data.users.find(u => u.id === id)).filter(Boolean);
}
function radicalById(id) { return db().radicals.find(r => r.id === id) || db().radicals[0]; }
function charsByRadical(radicalId) { return db().characters.filter(c => c.radicalId === radicalId); }
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

export function renderWorksheets(main) {
  const data = db();
  const radical = data.radicals[0];
  main.innerHTML = `
    ${UI.topbar('自動生成練習紙 PDF', '選擇部首後生成可列印練習紙；瀏覽器列印時可另存 PDF。')}
    <div class="grid two">
      <div class="card">
        <h3>練習紙設定</h3>
        <form id="worksheetForm" class="form">
          <div class="form-row"><label>標題</label><input class="input" name="title" value="識字練習｜${UI.escape(radical.name)}" required /></div>
          <div class="form-row"><label>部首</label><select class="select" name="radicalId">${UI.selectOptions(data.radicals, 'id', r => `${r.key}｜${r.name}`)}</select></div>
          <label class="check-row"><input type="checkbox" name="includeAnswer" /> 包含答案版</label>
          <div class="actions"><button class="btn primary" type="submit">列印 / 另存 PDF</button><button class="btn secondary" type="button" data-download>下載 HTML</button></div>
        </form>
        <p class="feedback">正式部署後可把這個模組換成後端 PDF 服務；目前 GitHub Pages 也能直接用瀏覽器另存 PDF。</p>
      </div>
      <div class="card">
        <h3>預覽內容</h3>
        <div id="worksheetPreview"></div>
      </div>
    </div>
  `;
  const form = main.querySelector('#worksheetForm');
  function options() {
    const fd = new FormData(form);
    const radical = radicalById(fd.get('radicalId'));
    return { title: fd.get('title'), radical, characters: charsByRadical(radical.id), includeAnswer: fd.get('includeAnswer') === 'on' };
  }
  function preview() {
    const opt = options();
    main.querySelector('#worksheetPreview').innerHTML = `<h4>${UI.escape(opt.title)}</h4><p>${UI.escape(opt.radical.name)}｜${UI.escape(opt.radical.meaning)}</p><div class="char-grid">${opt.characters.slice(0, 8).map(c => UI.charTile(c)).join('')}</div>`;
  }
  form.addEventListener('change', preview);
  form.addEventListener('input', preview);
  form.addEventListener('submit', event => { event.preventDefault(); if (!Worksheet.openPrintWindow(options())) UI.toast('瀏覽器阻擋了彈出視窗，請允許後再試。'); });
  main.querySelector('[data-download]').addEventListener('click', () => Worksheet.downloadHtml(options()));
  preview();
}

export function renderCompetitionManagement(main) {
  const data = db();
  const classes = teacherClasses();
  const classIds = new Set(classes.map(c => c.id));
  const competitions = data.competitions.filter(c => classIds.has(c.classId));
  function leaderboard(comp) {
    return [...(comp.leaderboard || [])].sort((a, b) => b.score - a.score).map((row, i) => {
      const student = data.users.find(u => u.id === row.studentId);
      return [String(i + 1), UI.escape(student?.name || ''), String(row.score), '⭐'.repeat(row.stars || 0) || '-'];
    });
  }
  main.innerHTML = `
    ${UI.topbar('班級競賽模式', '建立限時部首挑戰，學生端會出現排行榜。')}
    <div class="grid two">
      <div class="card">
        <h3>新增競賽</h3>
        <form id="competitionForm" class="form">
          <div class="form-row"><label>競賽名稱</label><input class="input" name="title" placeholder="例如：口部 60 秒挑戰" required /></div>
          <div class="form-row"><label>班級</label><select class="select" name="classId">${UI.selectOptions(classes, 'id', c => c.name)}</select></div>
          <div class="form-row"><label>部首</label><select class="select" name="radicalId">${UI.selectOptions(data.radicals, 'id', r => `${r.key}｜${r.name}`)}</select></div>
          <div class="form-row"><label>秒數</label><input class="input" type="number" name="durationSeconds" value="60" min="20" max="180" /></div>
          <button class="btn primary" type="submit" ${classes.length ? '' : 'disabled'}>建立競賽</button>
        </form>
      </div>
      <div class="card">
        <h3>競賽清單</h3>
        ${competitions.map(comp => `<div class="card flat"><h4>${UI.escape(comp.title)}</h4><p>${UI.escape(data.classes.find(c => c.id === comp.classId)?.name || '')}｜${UI.escape(radicalById(comp.radicalId).name)}｜${comp.durationSeconds} 秒</p>${UI.table(['名次','學生','分數','星星'], leaderboard(comp))}<div class="actions"><button class="btn small ${comp.status === 'open' ? 'danger' : 'primary'}" data-toggle="${UI.safeAttr(comp.id)}">${comp.status === 'open' ? '關閉' : '開放'}</button></div></div>`).join('') || UI.empty('暫時沒有競賽。')}
      </div>
    </div>
  `;
  main.querySelector('#competitionForm').addEventListener('submit', event => {
    event.preventDefault();
    const form = Object.fromEntries(new FormData(event.target));
    Store.mutate(data => data.competitions.push({ id: Store.uid('comp'), title: form.title.trim(), classId: form.classId, radicalId: form.radicalId, durationSeconds: Number(form.durationSeconds) || 60, status: 'open', createdAt: new Date().toISOString().slice(0, 10), leaderboard: [] }));
    UI.toast('已建立競賽。');
    renderCompetitionManagement(main);
  });
  main.querySelectorAll('[data-toggle]').forEach(btn => btn.addEventListener('click', () => {
    Store.mutate(data => {
      const comp = data.competitions.find(c => c.id === btn.dataset.toggle);
      comp.status = comp.status === 'open' ? 'closed' : 'open';
    });
    renderCompetitionManagement(main);
  }));
}

export function renderParentReports(main) {
  const classes = teacherClasses();
  const firstClass = classes[0];
  const firstStudent = firstClass ? classStudents(firstClass.id)[0] : null;
  main.innerHTML = `
    ${UI.topbar('家長週報', '自動整理完成情況、錯題和家庭練習建議。')}
    <div class="grid two">
      <div class="card">
        <h3>週報設定</h3>
        <form id="reportForm" class="form">
          <div class="form-row"><label>班級</label><select class="select" name="classId" id="reportClass">${UI.selectOptions(classes, 'id', c => c.name)}</select></div>
          <div class="form-row"><label>學生</label><select class="select" name="studentId" id="reportStudent"></select></div>
          <button class="btn primary" type="submit" ${firstStudent ? '' : 'disabled'}>生成週報</button>
        </form>
        <p class="feedback">可複製到電郵、WhatsApp、學校通訊 App；正式版可接入郵件服務定時發送。</p>
      </div>
      <div class="card">
        <h3>週報內容</h3>
        <textarea class="textarea report-box" id="reportOutput" readonly>請先選擇學生並生成週報。</textarea>
        <div class="actions"><button class="btn secondary" data-copy>複製內容</button><button class="btn ghost" data-print>列印</button></div>
      </div>
    </div>
  `;
  const classSelect = main.querySelector('#reportClass');
  const studentSelect = main.querySelector('#reportStudent');
  function fillStudents() {
    const students = classStudents(classSelect.value);
    studentSelect.innerHTML = students.map(s => `<option value="${UI.safeAttr(s.id)}">${UI.escape(s.name)}｜${UI.escape(s.username)}</option>`).join('');
  }
  fillStudents();
  classSelect.addEventListener('change', fillStudents);
  main.querySelector('#reportForm').addEventListener('submit', event => {
    event.preventDefault();
    const data = db();
    const student = data.users.find(u => u.id === studentSelect.value);
    const progress = data.progress.filter(p => p.studentId === student.id);
    const wrongs = wrongItemsFor(student.id);
    const recommendations = AITutor.recommendFromMistakes(wrongs, data.radicals);
    const report = AITutor.buildParentReport({ student, progress, wrongs, recommendations });
    Store.mutate(data => {
      data.parentReports = data.parentReports || [];
      data.parentReports.push({ id: Store.uid('report'), studentId: student.id, content: report, createdAt: new Date().toISOString() });
    });
    main.querySelector('#reportOutput').value = report;
    UI.toast('已生成週報。');
  });
  main.querySelector('[data-copy]').addEventListener('click', async () => {
    const text = main.querySelector('#reportOutput').value;
    try { await navigator.clipboard.writeText(text); UI.toast('已複製週報。'); } catch { UI.toast('無法自動複製，請手動選取文字。'); }
  });
  main.querySelector('[data-print]').addEventListener('click', () => window.print());
}

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export function renderOcrReview(main) {
  const classes = teacherClasses();
  const students = classes.flatMap(c => classStudents(c.id));
  main.innerHTML = `
    ${UI.topbar('OCR 批改紙本作業', '第三階段預留：上傳作業圖片、記錄 OCR 預覽和人工校正分數。')}
    <div class="grid two">
      <div class="card">
        <h3>上傳作業</h3>
        <form id="ocrForm" class="form">
          <div class="form-row"><label>學生</label><select class="select" name="studentId">${UI.selectOptions(students, 'id', s => `${s.name}｜${s.username}`)}</select></div>
          <div class="form-row"><label>作業圖片</label><input class="input" name="file" type="file" accept="image/*" required /></div>
          <div class="form-row"><label>OCR 預覽 / 老師校正</label><textarea class="textarea" name="ocrText" placeholder="例如：木、日、口、虫；可先由老師手動輸入，後續接 OCR 引擎。"></textarea></div>
          <div class="form-row"><label>分數</label><input class="input" type="number" name="score" min="0" max="100" value="80" /></div>
          <button class="btn primary" type="submit" ${students.length ? '' : 'disabled'}>保存批改記錄</button>
        </form>
      </div>
      <div class="card">
        <h3>最近批改</h3>
        <div id="ocrPreview"></div>
        <div id="ocrList">${renderOcrList()}</div>
      </div>
    </div>
  `;
  const form = main.querySelector('#ocrForm');
  form.file.addEventListener('change', async () => {
    const file = form.file.files[0];
    if (!file) return;
    const dataUrl = await readFileAsDataUrl(file);
    main.querySelector('#ocrPreview').innerHTML = `<img class="ocr-preview" src="${dataUrl}" alt="作業圖片預覽" />`;
  });
  form.addEventListener('submit', async event => {
    event.preventDefault();
    const fd = new FormData(form);
    const file = fd.get('file');
    const dataUrl = file ? await readFileAsDataUrl(file) : '';
    Store.mutate(data => {
      data.ocrSubmissions = data.ocrSubmissions || [];
      data.ocrSubmissions.push({ id: Store.uid('ocr'), studentId: fd.get('studentId'), imageDataUrl: dataUrl, ocrText: fd.get('ocrText'), score: Number(fd.get('score')), status: 'reviewed', createdAt: new Date().toISOString() });
    });
    UI.toast('已保存批改記錄。');
    renderOcrReview(main);
  });
}

function renderOcrList() {
  const data = db();
  const rows = (data.ocrSubmissions || []).slice(-6).reverse().map(item => {
    const student = data.users.find(u => u.id === item.studentId);
    return [UI.escape(student?.name || ''), `${item.score || 0} 分`, UI.escape(String(item.ocrText || '').slice(0, 40)), UI.escape((item.createdAt || '').slice(0, 10))];
  });
  return rows.length ? UI.table(['學生', '分數', 'OCR/校正文字', '日期'], rows) : UI.empty('暫時沒有批改記錄。');
}
