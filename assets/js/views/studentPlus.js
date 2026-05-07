import { Store } from '../core/store.js';
import { Auth } from '../core/auth.js';
import { Router } from '../core/router.js';
import { UI } from '../components/ui.js';
import { Speech } from '../utils/speech.js';
import { Pronunciation } from '../utils/pronunciation.js';
import { AITutor } from '../utils/ai.js';

function db() { return Store.get(); }
function current() { return Auth.currentUser(); }
function radicalById(id) { return db().radicals.find(r => r.id === id) || db().radicals[0]; }
function charsByRadical(radicalId) { return db().characters.filter(c => c.radicalId === radicalId); }
function shuffle(items) { return [...items].sort(() => Math.random() - 0.5); }
function wrongItems() {
  const user = current();
  const data = db();
  const map = new Map();
  data.progress.filter(p => p.studentId === user.id).flatMap(p => p.mistakes || []).forEach(m => {
    const key = `${m.char}-${m.type || '練習'}`;
    const prev = map.get(key) || { ...m, count: 0 };
    prev.count += m.count || 1;
    map.set(key, prev);
  });
  return [...map.values()].sort((a, b) => (b.count || 1) - (a.count || 1));
}

export function renderRecommendations(main) {
  const data = db();
  const wrongs = wrongItems();
  const recommendations = AITutor.recommendFromMistakes(wrongs, data.radicals);
  main.innerHTML = `
    ${UI.topbar('AI 推薦練習', '根據錯題本與已完成記錄產生下一步練習建議。', '<button class="btn ghost" data-back>返回</button>')}
    <div class="grid two">
      <div class="card">
        <h3>今日推薦路線</h3>
        <ol class="clean-list">${recommendations.map(r => `<li>${UI.escape(r)}</li>`).join('')}</ol>
        <div class="actions"><button class="btn primary" data-wrongbook>打開錯題本</button><button class="btn secondary" data-game>開始重練</button></div>
      </div>
      <div class="card">
        <h3>錯題熱點</h3>
        ${wrongs.length ? UI.table(['字', '題型', '次數'], wrongs.slice(0, 8).map(w => [`<strong class="hanzi small-hanzi">${UI.escape(w.char)}</strong>`, UI.escape(UI.gameName(w.type)), String(w.count || 1)])) : UI.empty('目前沒有錯題，適合挑戰閱讀或小作文。')}
      </div>
    </div>
  `;
  main.querySelector('[data-back]').addEventListener('click', () => Router.go('student-dashboard'));
  main.querySelector('[data-wrongbook]').addEventListener('click', () => Router.go('student-wrongbook'));
  main.querySelector('[data-game]').addEventListener('click', () => {
    const first = wrongs[0];
    Router.go('student-game', { radical: first?.radicalId || 'wood', type: first?.type || 'find-radical' });
  });
}

export function renderTracePractice(main, query) {
  const radical = radicalById(query.radical || query.id || 'wood');
  const chars = charsByRadical(radical.id);
  let index = 0;
  let lineCount = 0;

  function setupCanvas(char) {
    const canvas = main.querySelector('#traceCanvas');
    const ctx = canvas.getContext('2d');
    const resize = () => {
      const size = Math.min(420, canvas.parentElement.clientWidth - 20);
      canvas.width = size;
      canvas.height = size;
      ctx.lineWidth = Math.max(8, size / 34);
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.strokeStyle = '#172033';
    };
    resize();
    let drawing = false;
    let points = 0;
    const pos = event => {
      const rect = canvas.getBoundingClientRect();
      const p = event.touches?.[0] || event;
      return { x: p.clientX - rect.left, y: p.clientY - rect.top };
    };
    const start = event => { event.preventDefault(); drawing = true; points += 1; const p = pos(event); ctx.beginPath(); ctx.moveTo(p.x, p.y); };
    const move = event => { if (!drawing) return; event.preventDefault(); const p = pos(event); ctx.lineTo(p.x, p.y); ctx.stroke(); points += 1; lineCount = Math.max(lineCount, points); };
    const end = () => { drawing = false; };
    ['pointerdown', 'touchstart'].forEach(type => canvas.addEventListener(type, start, { passive: false }));
    ['pointermove', 'touchmove'].forEach(type => canvas.addEventListener(type, move, { passive: false }));
    ['pointerup', 'pointerleave', 'touchend'].forEach(type => canvas.addEventListener(type, end));
    main.querySelector('[data-clear]').addEventListener('click', () => { ctx.clearRect(0, 0, canvas.width, canvas.height); lineCount = 0; points = 0; });
    main.querySelector('[data-save]').addEventListener('click', () => {
      const score = Math.min(100, Math.round(lineCount / 2));
      Store.mutate(data => {
        data.handwritingAttempts = data.handwritingAttempts || [];
        data.handwritingAttempts.push({ id: Store.uid('hw'), studentId: current().id, char: char.char, radicalId: radical.id, score, createdAt: new Date().toISOString() });
        const userRef = data.users.find(u => u.id === current().id);
        userRef.stars = (userRef.stars || 0) + (score >= 60 ? 1 : 0);
      });
      UI.toast(`已保存描紅，手寫分 ${score}。`);
    });
  }

  function renderOne() {
    const char = chars[index] || chars[0];
    main.innerHTML = `
      ${UI.topbar('筆順描紅', `${radical.title}｜第 ${index + 1} 個字 / 共 ${chars.length} 個`, '<button class="btn ghost" data-back>返回</button>')}
      <div class="grid two">
        <div class="card trace-card">
          <div class="trace-target">${UI.escape(char.char)}</div>
          <canvas id="traceCanvas" class="trace-canvas" aria-label="描紅畫布"></canvas>
        </div>
        <div class="card">
          <h3>${UI.escape(char.char)}｜${UI.escape(char.meaning || '')}</h3>
          <p>讀音：${UI.escape(Pronunciation.label())} ${UI.escape(Pronunciation.value(char))}</p>
          <p>詞語：${UI.escape((char.words || []).join('、'))}</p>
          <p class="feedback">目前版本提供描紅、保存和基礎手寫分；正式版可接入筆畫級手寫識別模型。</p>
          <div class="actions"><button class="btn secondary" data-speak="${UI.safeAttr(char.char)}">朗讀</button><button class="btn ghost" data-clear>清除</button><button class="btn primary" data-save>保存描紅</button></div>
          <div class="actions"><button class="btn secondary" data-prev ${index === 0 ? 'disabled' : ''}>上一字</button><button class="btn secondary" data-next ${index >= chars.length - 1 ? 'disabled' : ''}>下一字</button></div>
        </div>
      </div>
    `;
    main.querySelector('[data-back]').addEventListener('click', () => Router.go('student-radical', { id: radical.id }));
    main.querySelector('[data-prev]').addEventListener('click', () => { index = Math.max(0, index - 1); renderOne(); });
    main.querySelector('[data-next]').addEventListener('click', () => { index = Math.min(chars.length - 1, index + 1); renderOne(); });
    Speech.bindSpeakButtons(main);
    setupCanvas(char);
  }
  renderOne();
}

export function renderStudentCompetition(main) {
  const user = current();
  const data = db();
  const competitions = data.competitions.filter(c => c.classId === user.classId && c.status === 'open');

  function leaderboard(comp) {
    return [...(comp.leaderboard || [])].sort((a, b) => b.score - a.score).map((row, i) => {
      const student = data.users.find(u => u.id === row.studentId);
      return [String(i + 1), UI.escape(student?.name || ''), String(row.score), '⭐'.repeat(row.stars || 0) || '-'];
    });
  }

  function start(compId) {
    const fresh = db();
    const comp = fresh.competitions.find(c => c.id === compId);
    const radical = radicalById(comp.radicalId);
    const targetChars = charsByRadical(radical.id).map(c => c.char);
    const all = fresh.characters;
    let score = 0;
    let left = comp.durationSeconds || 60;
    let currentChar = null;
    let timer = null;

    function nextChar() {
      currentChar = shuffle(all)[0];
      main.querySelector('#challengeChar').textContent = currentChar.char;
      main.querySelector('#challengeHint').textContent = `這個字是不是「${radical.key}」部？`;
    }
    function finish() {
      clearInterval(timer);
      const stars = score >= 10 ? 3 : score >= 6 ? 2 : score > 0 ? 1 : 0;
      Store.mutate(data => {
        const live = data.competitions.find(c => c.id === comp.id);
        live.leaderboard = live.leaderboard || [];
        const row = live.leaderboard.find(x => x.studentId === user.id);
        if (row) Object.assign(row, { score: Math.max(row.score || 0, score), stars: Math.max(row.stars || 0, stars), updatedAt: new Date().toISOString().slice(0, 10) });
        else live.leaderboard.push({ studentId: user.id, score, stars, updatedAt: new Date().toISOString().slice(0, 10) });
      });
      UI.toast(`競賽完成：${score} 分。`);
      renderStudentCompetition(main);
    }

    main.innerHTML = `
      ${UI.topbar(comp.title, '限時判斷部首，答得越快分數越高。', '<button class="btn ghost" data-exit>離開</button>')}
      <div class="card game-board center">
        <div class="timer">⏱️ <span id="timeLeft">${left}</span> 秒</div>
        <div class="hanzi challenge" id="challengeChar"></div>
        <p id="challengeHint"></p>
        <div class="actions center"><button class="btn primary" data-answer="yes">是</button><button class="btn secondary" data-answer="no">不是</button></div>
        <div class="score-pill">目前分數：<span id="scoreNow">0</span></div>
      </div>
    `;
    main.querySelector('[data-exit]').addEventListener('click', () => { clearInterval(timer); renderStudentCompetition(main); });
    main.querySelectorAll('[data-answer]').forEach(btn => btn.addEventListener('click', () => {
      const correct = targetChars.includes(currentChar.char);
      const answer = btn.dataset.answer === 'yes';
      if (answer === correct) score += 1;
      main.querySelector('#scoreNow').textContent = score;
      nextChar();
    }));
    nextChar();
    timer = setInterval(() => {
      left -= 1;
      main.querySelector('#timeLeft').textContent = left;
      if (left <= 0) finish();
    }, 1000);
  }

  main.innerHTML = `
    ${UI.topbar('班級競賽', '參加老師建立的限時部首挑戰。', '<button class="btn ghost" data-back>返回</button>')}
    <div class="grid two">
      ${competitions.map(comp => `
        <div class="card">
          <h3>${UI.escape(comp.title)}</h3>
          <p>${UI.escape(radicalById(comp.radicalId).name)}｜${comp.durationSeconds || 60} 秒｜狀態：${UI.escape(comp.status)}</p>
          <div class="actions"><button class="btn primary" data-start="${UI.safeAttr(comp.id)}">開始挑戰</button></div>
          <h4>排行榜</h4>${UI.table(['名次', '學生', '分數', '星星'], leaderboard(comp))}
        </div>`).join('') || `<div class="card">${UI.empty('暫時沒有開放中的競賽。')}</div>`}
    </div>
  `;
  main.querySelector('[data-back]').addEventListener('click', () => Router.go('student-dashboard'));
  main.querySelectorAll('[data-start]').forEach(btn => btn.addEventListener('click', () => start(btn.dataset.start)));
}

export function renderReading(main) {
  const data = db();
  const passages = data.readingPassages || [];
  let selectedId = passages[0]?.id;
  let answers = {};

  function renderPassage() {
    const passage = passages.find(p => p.id === selectedId) || passages[0];
    main.innerHTML = `
      ${UI.topbar('閱讀理解', '從短文中找答案，練習識字到閱讀。', '<button class="btn ghost" data-back>返回</button>')}
      <div class="grid two">
        <div class="card">
          <h3>選擇短文</h3>
          ${passages.map(p => `<button class="list-button ${p.id === passage.id ? 'active' : ''}" data-passage="${UI.safeAttr(p.id)}">${UI.escape(p.title)} <small>${UI.escape(p.level)}</small></button>`).join('')}
        </div>
        <div class="card">
          <h3>${UI.escape(passage.title)}</h3>
          <p class="reading-text">${UI.escape(passage.text)}</p>
          <button class="btn small secondary" data-speak="${UI.safeAttr(passage.text)}">朗讀短文</button>
          <hr />
          ${(passage.questions || []).map((q, idx) => `<div class="question-block"><strong>${idx + 1}. ${UI.escape(q.prompt)}</strong><div class="option-list">${q.options.map(o => `<label><input type="radio" name="q${idx}" value="${UI.safeAttr(o)}" /> ${UI.escape(o)}</label>`).join('')}</div></div>`).join('')}
          <div class="actions"><button class="btn primary" data-check>檢查答案</button></div>
          <div id="readingResult"></div>
        </div>
      </div>
    `;
    main.querySelector('[data-back]').addEventListener('click', () => Router.go('student-dashboard'));
    main.querySelectorAll('[data-passage]').forEach(btn => btn.addEventListener('click', () => { selectedId = btn.dataset.passage; answers = {}; renderPassage(); }));
    Speech.bindSpeakButtons(main);
    main.querySelector('[data-check]').addEventListener('click', () => {
      let score = 0;
      (passage.questions || []).forEach((q, idx) => {
        const picked = main.querySelector(`input[name="q${idx}"]:checked`)?.value;
        answers[idx] = picked;
        if (picked === q.answer) score += 1;
      });
      const percent = Math.round(score / (passage.questions.length || 1) * 100);
      Store.mutate(data => data.progress.push({ id: Store.uid('pr'), assignmentId: `reading_${passage.id}_${Date.now()}`, studentId: current().id, completed: true, score: percent, stars: percent >= 80 ? 2 : 1, mistakes: [], updatedAt: new Date().toISOString().slice(0, 10) }));
      main.querySelector('#readingResult').innerHTML = `<div class="feedback ${percent >= 80 ? 'good' : 'bad'}">得分：${percent}。${percent >= 80 ? '讀得很好！' : '可以再讀一次短文。'}</div>`;
    });
  }
  renderPassage();
}

export function renderWriting(main) {
  const data = db();
  const prompts = data.writingPrompts || [];
  main.innerHTML = `
    ${UI.topbar('小作文練習', '先完成一句話，再逐步升級到短段落。', '<button class="btn ghost" data-back>返回</button>')}
    <div class="grid two">
      <div class="card">
        <h3>題目</h3>
        <select class="select" id="promptSelect">${prompts.map(p => `<option value="${UI.safeAttr(p.id)}">${UI.escape(p.title)}</option>`).join('')}</select>
        <p class="feedback" id="promptText">${UI.escape(prompts[0]?.prompt || '')}</p>
        <textarea class="textarea writing-box" id="writingText" placeholder="在這裡寫一句完整的話，例如：學校旁邊有一棵大樹。"></textarea>
        <div class="actions"><button class="btn primary" data-score>AI 本地評語</button><button class="btn secondary" data-save>保存作文</button></div>
      </div>
      <div class="card">
        <h3>評語</h3>
        <div id="writingFeedback">完成後會看到分數和修改建議。</div>
      </div>
    </div>
  `;
  const select = main.querySelector('#promptSelect');
  const promptText = main.querySelector('#promptText');
  const text = main.querySelector('#writingText');
  function prompt() { return prompts.find(p => p.id === select.value) || prompts[0]; }
  main.querySelector('[data-back]').addEventListener('click', () => Router.go('student-dashboard'));
  select.addEventListener('change', () => { promptText.textContent = prompt().prompt; });
  main.querySelector('[data-score]').addEventListener('click', () => {
    const result = AITutor.scoreWriting(text.value, prompt().prompt);
    main.querySelector('#writingFeedback').innerHTML = `<div class="score-big">${result.score}</div><ol class="clean-list">${result.advice.map(a => `<li>${UI.escape(a)}</li>`).join('')}</ol>`;
  });
  main.querySelector('[data-save]').addEventListener('click', () => {
    const result = AITutor.scoreWriting(text.value, prompt().prompt);
    Store.mutate(data => {
      data.writingSubmissions = data.writingSubmissions || [];
      data.writingSubmissions.push({ id: Store.uid('wr'), studentId: current().id, promptId: prompt().id, text: text.value.trim(), score: result.score, createdAt: new Date().toISOString() });
    });
    UI.toast('已保存作文。');
  });
}
