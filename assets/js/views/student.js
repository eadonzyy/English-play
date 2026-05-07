import { Store } from '../core/store.js';
import { Auth } from '../core/auth.js';
import { Router } from '../core/router.js';
import { UI } from '../components/ui.js';
import { Speech } from '../utils/speech.js';
import { Pronunciation } from '../utils/pronunciation.js';
import { AITutor } from '../utils/ai.js';

function db() { return Store.get(); }
function current() { return Auth.currentUser(); }
function charsByRadical(radicalId) { return db().characters.filter(c => c.radicalId === radicalId); }
function radicalById(id) { return db().radicals.find(r => r.id === id); }
function shuffle(items) { return [...items].sort(() => Math.random() - 0.5); }
function sample(items, count) { return shuffle(items).slice(0, count); }

function studentProgressFor(radicalId) {
  const user = current();
  const data = db();
  const done = data.progress.filter(p => p.studentId === user.id && p.completed);
  const related = done.filter(p => {
    const as = data.assignments.find(a => a.id === p.assignmentId);
    return as?.radicalId === radicalId;
  });
  return Math.min(100, related.length * 35 + (user.stars || 0));
}

function getWrongItems() {
  const user = current();
  const data = db();
  const progressMistakes = data.progress.filter(p => p.studentId === user.id).flatMap(p => p.mistakes || []);
  const map = new Map();
  progressMistakes.forEach(m => {
    const key = `${m.char}-${m.type || '練習'}`;
    const prev = map.get(key) || { ...m, count: 0 };
    prev.count += m.count || 1;
    map.set(key, prev);
  });
  return [...map.values()].sort((a, b) => b.count - a.count);
}

export function renderStudentDashboard(main) {
  const user = current();
  const data = db();
  const assignments = data.assignments.filter(a => a.classId === user.classId);
  const completedIds = new Set(data.progress.filter(p => p.studentId === user.id && p.completed).map(p => p.assignmentId));
  const wrongs = getWrongItems();
  const recommendations = AITutor.recommendFromMistakes(wrongs, db().radicals);
  main.innerHTML = `
    ${UI.topbar(`你好，${user.name}！`, '今天也來闖關學漢字吧。', `${Pronunciation.selectorHtml()} <button class="btn secondary" data-go="student-recommend">AI推薦</button><button class="btn secondary" data-go="student-wrongbook">錯題重練</button>`)}
    <div class="grid three">
      <div class="card kpi"><div><span class="badge good">星星獎勵</span><div class="num">${user.stars || 0}</div></div><div class="emoji">⭐</div></div>
      <div class="card kpi"><div><span class="badge warn">連續學習</span><div class="num">${user.streak || 0} 天</div></div><div class="emoji">🔥</div></div>
      <div class="card kpi"><div><span class="badge bad">錯題本</span><div class="num">${wrongs.length}</div></div><div class="emoji">📘</div></div>
    </div>
    <div class="card" style="margin-top:18px">
      <h3>學習地圖</h3>
      <div class="grid four">
        ${data.radicals.map(r => `
          <div class="card flat map-card" data-key="${UI.escape(r.key)}">
            <div class="big">${r.emoji}</div>
            <h3>${UI.escape(r.title)}</h3>
            <p>${UI.escape(r.meaning)}</p>
            ${UI.progress(studentProgressFor(r.id))}
            <div class="actions"><button class="btn primary" data-radical="${r.id}">進入關卡</button></div>
          </div>`).join('')}
      </div>
    </div>
    <div class="grid four" style="margin-top:18px">
      <button class="card flat feature-card" data-go="student-competition"><span class="feature-icon">🏆</span><strong>班級競賽</strong><small>限時挑戰與排行榜</small></button>
      <button class="card flat feature-card" data-go="student-reading"><span class="feature-icon">📖</span><strong>閱讀理解</strong><small>短文問答練習</small></button>
      <button class="card flat feature-card" data-go="student-writing"><span class="feature-icon">✍️</span><strong>小作文</strong><small>AI 本地評語</small></button>
      <button class="card flat feature-card" data-radical="wood" data-trace="1"><span class="feature-icon">🖊️</span><strong>筆順描紅</strong><small>從木部開始</small></button>
    </div>
    <div class="grid two" style="margin-top:18px">
      <div class="card">
        <h3>老師指派練習</h3>
        ${assignments.length ? UI.table(['練習', '類型', '期限', '狀態'], assignments.map(a => [
          UI.escape(a.title),
          UI.escape(UI.gameName(a.gameType)),
          UI.escape(a.dueDate),
          completedIds.has(a.id) ? '<span class="badge good">已完成</span>' : `<button class="btn small primary" data-assignment="${a.id}">開始</button>`
        ])) : UI.empty('暫時沒有老師指派的練習。')}
      </div>
      <div class="card">
        <h3>我的獎章</h3>
        <div class="grid two">
          <div class="badge ${user.stars >= 10 ? 'good' : 'warn'}">⭐ 10 星小達人</div>
          <div class="badge ${user.stars >= 30 ? 'good' : 'warn'}">🌟 30 星高手</div>
          <div class="badge ${user.streak >= 3 ? 'good' : 'warn'}">🔥 連續 3 天</div>
          <div class="badge ${wrongs.length === 0 ? 'good' : 'warn'}">📘 錯題清空</div>
        </div>
      </div>
    </div>
  `;
  Pronunciation.bindSelector(main);
  main.querySelectorAll('[data-go]').forEach(btn => btn.addEventListener('click', () => Router.go(btn.dataset.go)));
  main.querySelectorAll('[data-radical]').forEach(btn => btn.addEventListener('click', () => {
    if (btn.dataset.trace) Router.go('student-trace', { radical: btn.dataset.radical });
    else Router.go('student-radical', { id: btn.dataset.radical });
  }));
  main.querySelectorAll('[data-assignment]').forEach(btn => {
    btn.addEventListener('click', () => {
      const as = db().assignments.find(a => a.id === btn.dataset.assignment);
      if (as.gameType === 'stroke-trace') Router.go('student-trace', { radical: as.radicalId, assignment: as.id });
      else if (as.gameType === 'reading') Router.go('student-reading', { assignment: as.id });
      else if (as.gameType === 'writing') Router.go('student-writing', { assignment: as.id });
      else Router.go('student-game', { radical: as.radicalId, type: as.gameType, assignment: as.id });
    });
  });
  main.querySelector('[data-go="student-wrongbook"]')?.addEventListener('click', () => Router.go('student-wrongbook'));
}

export function renderStudentRadical(main, query) {
  const radical = radicalById(query.id || 'wood') || db().radicals[0];
  const characters = charsByRadical(radical.id);
  main.innerHTML = `
    ${UI.topbar(radical.title, radical.meaning, `${Pronunciation.selectorHtml()} <button class="btn ghost" data-back>返回地圖</button>`)}
    <div class="grid two">
      <div class="card">
        <h3>字源故事：${UI.escape(radical.key)}</h3>
        <p>${UI.escape(radical.story)}</p>
        <div class="origin-line">
          ${radical.origin.map((step, index) => `
            <div class="origin-step"><div class="pic">${UI.escape(step)}</div><small>${['圖像', '古文字', '演變', '楷書'][index] || '字形'}</small></div>
            ${index < radical.origin.length - 1 ? '<div class="arrow">→</div>' : ''}
          `).join('')}
        </div>
      </div>
      <div class="card">
        <h3>開始練習</h3>
        <p>選一種遊戲題型。答對會得到星星，答錯會進入錯題本。</p>
        <div class="actions">
          <button class="btn primary" data-game="find-radical">找部首</button>
          <button class="btn secondary" data-game="compose-char">拖拉組字</button>
          <button class="btn secondary" data-game="picture-choice">看圖選字</button>
          <button class="btn secondary" data-trace>筆順描紅</button>
        </div>
      </div>
    </div>
    <div class="card" style="margin-top:18px">
      <h3>${UI.escape(radical.name)}漢字卡</h3>
      <div class="char-grid detail">
        ${characters.map(c => `
          <div class="char-card">
            <button class="speak-mini" data-speak="${UI.safeAttr(c.char)}" title="朗讀">🔊</button>
            <div class="hanzi huge">${UI.escape(c.char)}</div>
            <div class="pron">${UI.escape(Pronunciation.label())}：${UI.escape(Pronunciation.value(c))}</div>
            <div class="small">${UI.escape(c.meaning || '')}</div>
            <div class="small">詞語：${UI.escape((c.words || []).join('、'))}</div>
            <button class="btn small ghost" data-ai-sentence="${UI.safeAttr(c.id)}">AI例句</button>
          </div>`).join('')}
      </div>
    </div>
  `;
  Pronunciation.bindSelector(main);
  Speech.bindSpeakButtons(main);
  main.querySelector('[data-back]').addEventListener('click', () => Router.go('student-dashboard'));
  main.querySelectorAll('[data-game]').forEach(btn => btn.addEventListener('click', () => Router.go('student-game', { radical: radical.id, type: btn.dataset.game })));
  main.querySelector('[data-trace]')?.addEventListener('click', () => Router.go('student-trace', { radical: radical.id }));
  main.querySelectorAll('[data-ai-sentence]').forEach(btn => btn.addEventListener('click', () => {
    const char = db().characters.find(c => c.id === btn.dataset.aiSentence);
    UI.toast(AITutor.generateSentence(char, current().name));
  }));
}

function makeFindRadicalQuestions(radicalId) {
  const data = db();
  const target = radicalById(radicalId);
  const correct = sample(data.characters.filter(c => c.radicalId === radicalId), 4);
  const wrong = sample(data.characters.filter(c => c.radicalId !== radicalId), 4);
  return [{
    type: 'find-radical',
    prompt: `請找出有「${target.key}」部首的字。`,
    hint: target.meaning,
    options: shuffle([...correct, ...wrong]),
    answers: correct.map(c => c.char)
  }];
}

function makeComposeQuestions(radicalId) {
  const componentPool = [...new Set(charsByRadical(radicalId).map(c => c.component).filter(Boolean))];
  const questions = charsByRadical(radicalId).filter(c => c.component).slice(0, 6).map(c => {
    const wrongParts = sample(componentPool.filter(part => part !== c.component), 3);
    return {
      type: 'compose-char',
      prompt: `拖拉正確部件，組成「${c.char}」字。`,
      partA: radicalById(radicalId).key,
      partB: c.component,
      answer: c.char,
      parts: shuffle([c.component, ...wrongParts])
    };
  });
  return questions.length ? questions : makeFindRadicalQuestions(radicalId);
}

function makePictureChoiceQuestions(radicalId) {
  const data = db();
  const chars = charsByRadical(radicalId);
  const bank = data.pictureBank.filter(pic => chars.some(c => c.char === pic.answer));
  const source = bank.length ? bank : chars.map(c => ({ emoji: radicalById(radicalId).emoji, clue: c.imageHint, answer: c.char }));
  return sample(source, Math.min(5, source.length)).map(pic => ({
    type: 'picture-choice',
    prompt: `看圖選字：${pic.emoji}`,
    clue: pic.clue,
    answer: pic.answer,
    options: shuffle(sample(data.characters.filter(c => c.char !== pic.answer), 3).concat(data.characters.find(c => c.char === pic.answer))).filter(Boolean)
  }));
}

function buildQuestions(type, radicalId) {
  const custom = db().customQuestions.filter(q => q.type === type && q.radicalId === radicalId);
  const customQs = custom.map(q => ({ ...q, options: q.options.map(char => db().characters.find(c => c.char === char)).filter(Boolean) }));
  if (type === 'find-radical') return customQs.length ? customQs : makeFindRadicalQuestions(radicalId);
  if (type === 'compose-char') return customQs.length ? customQs : makeComposeQuestions(radicalId);
  if (type === 'picture-choice') return customQs.length ? customQs : makePictureChoiceQuestions(radicalId);
  return makeFindRadicalQuestions(radicalId);
}

export function renderStudentGame(main, query) {
  const user = current();
  const radical = radicalById(query.radical || 'wood');
  const type = query.type || 'find-radical';
  const questions = buildQuestions(type, radical.id);
  let index = 0;
  let score = 0;
  const mistakes = [];
  const selected = new Set();

  function saveProgress() {
    const stars = score >= questions.length ? 3 : score >= Math.ceil(questions.length * .7) ? 2 : score > 0 ? 1 : 0;
    Store.mutate(data => {
      const userRef = data.users.find(u => u.id === user.id);
      userRef.stars = (userRef.stars || 0) + stars;
      userRef.streak = Math.max(userRef.streak || 0, 1);
      if (query.assignment) {
        const existing = data.progress.find(p => p.assignmentId === query.assignment && p.studentId === user.id);
        const payload = { completed: true, score: Math.round(score / questions.length * 100), stars, mistakes, updatedAt: new Date().toISOString().slice(0, 10) };
        if (existing) Object.assign(existing, payload);
        else data.progress.push({ id: Store.uid('pr'), assignmentId: query.assignment, studentId: user.id, ...payload });
      } else {
        data.progress.push({ id: Store.uid('pr'), assignmentId: `free_${radical.id}_${type}_${Date.now()}`, studentId: user.id, completed: true, score: Math.round(score / questions.length * 100), stars, mistakes, updatedAt: new Date().toISOString().slice(0, 10) });
      }
    });
    return stars;
  }

  function finish() {
    const stars = saveProgress();
    main.innerHTML = `
      ${UI.topbar('練習完成！', `${radical.title} · ${UI.gameName(type)}`)}
      <div class="card">
        <div class="kpi"><div><span class="badge good">本次得分</span><div class="num">${score} / ${questions.length}</div></div><div class="emoji">${'⭐'.repeat(stars) || '💪'}</div></div>
        <p>答錯的題目已自動加入錯題本。可以立即重練，也可以回到學習地圖繼續闖關。</p>
        <div class="actions"><button class="btn primary" data-again>再玩一次</button><button class="btn secondary" data-map>回學習地圖</button><button class="btn ghost" data-wrong>錯題本</button></div>
      </div>
    `;
    main.querySelector('[data-again]').addEventListener('click', () => renderStudentGame(main, query));
    main.querySelector('[data-map]').addEventListener('click', () => Router.go('student-dashboard'));
    main.querySelector('[data-wrong]').addEventListener('click', () => Router.go('student-wrongbook'));
  }

  function checkAnswer(q) {
    let ok = false;
    if (q.type === 'find-radical') {
      const a = [...selected].sort().join('');
      const b = [...q.answers].sort().join('');
      ok = a === b;
      q.options.forEach(c => {
        const tile = main.querySelector(`[data-char="${CSS.escape(c.char)}"]`);
        if (!tile) return;
        if (q.answers.includes(c.char)) tile.classList.add('correct');
        else if (selected.has(c.char)) tile.classList.add('wrong');
      });
    } else if (q.type === 'compose-char') {
      const chosen = [...selected][0];
      ok = chosen === q.partB;
      main.querySelectorAll('[data-part]').forEach(part => {
        if (part.dataset.part === q.partB) part.classList.add('correct');
        else if (part.dataset.part === chosen) part.classList.add('wrong');
      });
      const zone = main.querySelector('#dropZone');
      if (zone) zone.innerHTML = `${UI.escape(q.partA)} + ${UI.escape(q.partB)} = <strong>${UI.escape(q.answer)}</strong>`;
    } else {
      const chosen = [...selected][0];
      ok = chosen === q.answer;
      q.options.forEach(c => {
        const tile = main.querySelector(`[data-char="${CSS.escape(c.char)}"]`);
        if (!tile) return;
        if (c.char === q.answer) tile.classList.add('correct');
        else if (chosen === c.char) tile.classList.add('wrong');
      });
    }
    if (ok) score += 1;
    else mistakes.push({ char: q.answer || q.answers?.[0] || radical.key, radicalId: radical.id, type, count: 1 });
    const feedback = main.querySelector('#feedback');
    feedback.className = `feedback ${ok ? 'good' : 'bad'}`;
    feedback.textContent = ok ? '答對了！得到一顆小星星。' : '差一點！看看綠色答案，再試下一題。';
    main.querySelector('#checkBtn').disabled = true;
    main.querySelector('#nextBtn').classList.remove('hidden');
  }

  function renderQuestion() {
    selected.clear();
    const q = questions[index];
    const options = q.options || [];
    main.innerHTML = `
      ${UI.topbar(`${radical.title}：${UI.gameName(type)}`, `第 ${index + 1} 題 / 共 ${questions.length} 題`, '<button class="btn ghost" data-exit>離開</button>')}
      <div class="card game-board">
        <p class="question-title">${UI.escape(q.prompt)}</p>
        ${q.hint || q.clue ? `<div class="feedback">提示：${UI.escape(q.hint || q.clue)}</div>` : ''}
        ${q.type === 'compose-char' ? `
          <div class="drop-zone" id="dropZone" data-value="">${UI.escape(q.partA)} + <span id="dropText">拖一個部件到這裡</span> = ?</div>
          <div class="draggable-parts">${(q.parts || []).map(part => `<div class="part" draggable="true" data-part="${UI.escape(part)}">${UI.escape(part)}</div>`).join('')}</div>
        ` : `
          <div class="option-grid">
            ${options.map(c => UI.charTile(c)).join('')}
          </div>
        `}
        <div id="feedback" class="feedback hidden"></div>
        <div class="actions"><button class="btn primary" id="checkBtn" disabled>檢查答案</button><button class="btn secondary hidden" id="nextBtn">下一題</button></div>
      </div>
    `;
    main.querySelector('[data-exit]').addEventListener('click', () => Router.go('student-radical', { id: radical.id }));
    main.querySelectorAll('.char-tile').forEach(tile => {
      tile.addEventListener('click', () => {
        if (q.type !== 'find-radical') {
          selected.clear();
          main.querySelectorAll('.char-tile').forEach(t => t.classList.remove('selected'));
        }
        const char = tile.dataset.char;
        if (selected.has(char)) { selected.delete(char); tile.classList.remove('selected'); }
        else { selected.add(char); tile.classList.add('selected'); }
        main.querySelector('#checkBtn').disabled = selected.size === 0;
      });
    });
    if (q.type === 'compose-char') {
      const zone = main.querySelector('#dropZone');
      function choosePart(value) {
        selected.clear();
        selected.add(value);
        main.querySelectorAll('[data-part]').forEach(part => part.classList.toggle('selected', part.dataset.part === value));
        main.querySelector('#dropText').textContent = value;
        main.querySelector('#checkBtn').disabled = false;
      }
      main.querySelectorAll('[data-part]').forEach(part => {
        part.addEventListener('click', () => choosePart(part.dataset.part));
        part.addEventListener('dragstart', event => event.dataTransfer.setData('text/plain', part.dataset.part));
      });
      zone.addEventListener('dragover', event => { event.preventDefault(); zone.classList.add('over'); });
      zone.addEventListener('dragleave', () => zone.classList.remove('over'));
      zone.addEventListener('drop', event => {
        event.preventDefault();
        zone.classList.remove('over');
        const value = event.dataTransfer.getData('text/plain');
        if (value) choosePart(value);
      });
    }
    main.querySelector('#checkBtn').addEventListener('click', () => checkAnswer(q));
    main.querySelector('#nextBtn').addEventListener('click', () => {
      index += 1;
      if (index >= questions.length) finish(); else renderQuestion();
    });
  }
  renderQuestion();
}

export function renderWrongBook(main) {
  const wrongs = getWrongItems();
  const recommendations = AITutor.recommendFromMistakes(wrongs, db().radicals);
  main.innerHTML = `
    ${UI.topbar('錯題本', '系統會根據答錯記錄，把需要重練的字放在這裡。', '<button class="btn ghost" data-back>返回</button>')}
    <div class="grid two">
    <div class="card">
      <h3>AI 推薦重練路線</h3>
      <ol class="clean-list">${recommendations.map(r => `<li>${UI.escape(r)}</li>`).join('')}</ol>
    </div>
    <div class="card">
      <h3>需要加強的漢字</h3>
      ${wrongs.length ? UI.table(['漢字', '部首', '題型', '錯誤次數', '練習'], wrongs.map(w => {
        const radical = radicalById(w.radicalId);
        return [`<strong style="font-size:26px">${UI.escape(w.char)}</strong>`, UI.escape(radical?.name || ''), UI.escape(UI.gameName(w.type)), String(w.count), `<button class="btn small primary" data-radical="${w.radicalId}" data-type="${w.type}">重練</button>`];
      })) : UI.empty('太好了！目前沒有錯題。')}
    </div>
    </div>
  `;
  main.querySelector('[data-back]').addEventListener('click', () => Router.go('student-dashboard'));
  main.querySelectorAll('[data-radical]').forEach(btn => btn.addEventListener('click', () => Router.go('student-game', { radical: btn.dataset.radical, type: btn.dataset.type || 'find-radical' })));
}
