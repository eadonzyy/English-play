import { Store } from '../core/store.js';
import { Router } from '../core/router.js';
import { UI } from '../components/ui.js';
import { AITutor } from '../utils/ai.js';

function db() { return Store.get(); }

function tabs(active) {
  const items = [
    ['admin-dashboard', '總覽'],
    ['admin-characters', '漢字管理'],
    ['admin-radicals', '部首管理'],
    ['admin-questions', '題目管理'],
    ['admin-media', '圖片/音頻']
  ];
  return `<div class="tabs">${items.map(([route, label]) => `<a class="tab ${active === route ? 'active' : ''}" href="#${route}">${label}</a>`).join('')}</div>`;
}

function splitList(value = '') {
  return String(value).split(/[,，、]/).map(x => x.trim()).filter(Boolean);
}

function setFormValue(form, name, value = '', force = false) {
  const field = form.elements[name];
  if (!field) return;
  const next = Array.isArray(value) ? value.join('、') : String(value ?? '');
  if (force || !field.value.trim()) field.value = next;
}

function radicalOptions(data, selectedId = '') {
  return data.radicals.map(r => `<option value="${UI.safeAttr(r.id)}" ${r.id === selectedId ? 'selected' : ''}>${UI.escape(r.key)}｜${UI.escape(r.name)}</option>`).join('');
}

function structureOptions(selected = '左右') {
  return ['左右', '上下', '包圍', '獨體', '品字形'].map(value => `<option ${value === selected ? 'selected' : ''}>${value}</option>`).join('');
}

function bindCharacterAi(main, editing) {
  const form = main.querySelector('#charForm');
  const input = form?.elements.char;
  const fill = (force = false) => {
    const char = input.value.trim();
    if (!char) {
      UI.toast('請先輸入漢字。');
      input.focus();
      return;
    }
    const suggestion = AITutor.matchCharacter(char, db().radicals, db().characters);
    setFormValue(form, 'char', suggestion.char, true);
    if (suggestion.radicalId) setFormValue(form, 'radicalId', suggestion.radicalId, force || !editing);
    setFormValue(form, 'structure', suggestion.structure, force || !editing);
    setFormValue(form, 'pinyin', suggestion.pinyin, force);
    setFormValue(form, 'jyutping', suggestion.jyutping, force);
    setFormValue(form, 'component', suggestion.component, force);
    setFormValue(form, 'meaning', suggestion.meaning, force);
    setFormValue(form, 'words', suggestion.words, force);
    setFormValue(form, 'imageHint', suggestion.imageHint, force);
    if (suggestion.missingRadical) {
      UI.toast(`已匹配資料，但建議先新增「${suggestion.radicalKey}」部，或手動選擇正確部首。`);
    } else {
      UI.toast(suggestion.confidence === 'high' ? '已根據內置 AI 字庫匹配資料。' : '已根據部首規則智能匹配，請再檢查。');
    }
  };
  main.querySelector('[data-ai-char]')?.addEventListener('click', () => fill(true));
  input?.addEventListener('change', () => fill(false));
}

function bindRadicalAi(main, editing) {
  const form = main.querySelector('#radicalForm');
  const input = form?.elements.key;
  const fill = (force = false) => {
    const key = input.value.trim();
    if (!key) {
      UI.toast('請先輸入部首字。');
      input.focus();
      return;
    }
    const suggestion = AITutor.matchRadical(key);
    setFormValue(form, 'key', suggestion.key, true);
    setFormValue(form, 'name', suggestion.name, force || !editing);
    setFormValue(form, 'title', suggestion.title, force || !editing);
    setFormValue(form, 'emoji', suggestion.emoji, force || !editing);
    setFormValue(form, 'meaning', suggestion.meaning, force || !editing);
    setFormValue(form, 'story', suggestion.story, force || !editing);
    setFormValue(form, 'origin', suggestion.origin, force || !editing);
    UI.toast('已自動匹配部首資料。');
  };
  main.querySelector('[data-ai-radical]')?.addEventListener('click', () => fill(true));
  input?.addEventListener('change', () => fill(false));
}

export function renderAdminDashboard(main) {
  const data = db();
  main.innerHTML = `
    ${UI.topbar('管理端', '維護部首、漢字、題目與素材。這一版先用 localStorage，後續可換成資料庫和 API。')}
    ${tabs('admin-dashboard')}
    <div class="grid four">
      <div class="card kpi"><div><span class="badge good">部首</span><div class="num">${data.radicals.length}</div></div><div class="emoji">🔤</div></div>
      <div class="card kpi"><div><span class="badge good">漢字</span><div class="num">${data.characters.length}</div></div><div class="emoji">字</div></div>
      <div class="card kpi"><div><span class="badge warn">自訂題目</span><div class="num">${data.customQuestions.length}</div></div><div class="emoji">❓</div></div>
      <div class="card kpi"><div><span class="badge warn">素材</span><div class="num">${data.media.length}</div></div><div class="emoji">🖼️</div></div>
    </div>
    <div class="card" style="margin-top:18px">
      <h3>升級提示</h3>
      <p>目前所有資料保存在瀏覽器 localStorage，適合 MVP 測試。正式上線時只需要把 <code>assets/js/core/store.js</code> 的讀寫換成 API，即可接 MySQL、PostgreSQL、Firebase 或 Supabase。</p>
      <div class="actions"><a class="btn primary" href="#admin-characters">新增漢字</a><a class="btn secondary" href="#admin-questions">新增題目</a></div>
    </div>
  `;
}

export function renderCharacterAdmin(main, query = {}) {
  const data = db();
  const editing = query.edit ? data.characters.find(c => c.id === query.edit) : null;
  const title = editing ? `修改漢字：${editing.char}` : '新增漢字';
  main.innerHTML = `
    ${UI.topbar('漢字管理', '新增、修改或查看每個部首下的漢字資料。輸入漢字後可自動匹配部首、拼音、粵拼、意思和詞語。')}
    ${tabs('admin-characters')}
    <div class="grid two">
      <div class="card">
        <h3>${UI.escape(title)}</h3>
        <form id="charForm" class="form">
          <input type="hidden" name="id" value="${UI.safeAttr(editing?.id || '')}" />
          <div class="grid two">
            <div class="form-row"><label>漢字</label><input class="input" name="char" maxlength="2" value="${UI.safeAttr(editing?.char || '')}" required /></div>
            <div class="form-row"><label>部首</label><select class="select" name="radicalId" required>${radicalOptions(data, editing?.radicalId || data.radicals[0]?.id)}</select></div>
            <div class="form-row"><label>結構</label><select class="select" name="structure">${structureOptions(editing?.structure || '左右')}</select></div>
            <div class="form-row"><label>拼音</label><input class="input" name="pinyin" value="${UI.safeAttr(editing?.pinyin || '')}" placeholder="如：mù" /></div>
            <div class="form-row"><label>粵拼</label><input class="input" name="jyutping" value="${UI.safeAttr(editing?.jyutping || '')}" placeholder="如：muk6" /></div>
            <div class="form-row"><label>組字部件</label><input class="input" name="component" value="${UI.safeAttr(editing?.component || '')}" placeholder="如：寸、青、昌" /></div>
          </div>
          <div class="form-row"><label>意思</label><input class="input" name="meaning" value="${UI.safeAttr(editing?.meaning || '')}" placeholder="簡短解釋" /></div>
          <div class="form-row"><label>詞語，用逗號分隔</label><input class="input" name="words" value="${UI.safeAttr((editing?.words || []).join('、'))}" placeholder="如：木頭, 木馬" /></div>
          <div class="form-row"><label>圖片提示</label><input class="input" name="imageHint" value="${UI.safeAttr(editing?.imageHint || '')}" placeholder="如：大樹、晴天" /></div>
          <div class="actions">
            <button class="btn secondary" type="button" data-ai-char>AI自動匹配</button>
            <button class="btn primary" type="submit">${editing ? '保存修改' : '新增漢字'}</button>
            ${editing ? '<a class="btn ghost" href="#admin-characters">取消修改</a>' : ''}
          </div>
        </form>
      </div>
      <div class="card">
        <h3>漢字清單</h3>
        ${UI.table(['字', '部首', '結構', '詞語', '操作'], data.characters.map(c => {
          const radical = data.radicals.find(r => r.id === c.radicalId);
          return [
            `<strong style="font-size:28px">${UI.escape(c.char)}</strong>`,
            UI.escape(radical?.name || ''),
            UI.escape(c.structure || ''),
            UI.escape((c.words || []).join('、')),
            `<div class="actions" style="margin-top:0"><a class="btn small secondary" href="#admin-characters?edit=${UI.safeAttr(c.id)}">修改</a><button class="btn small danger" data-delete-char="${UI.safeAttr(c.id)}">刪除</button></div>`
          ];
        }))}
      </div>
    </div>
  `;
  bindCharacterAi(main, Boolean(editing));
  main.querySelector('#charForm').addEventListener('submit', event => {
    event.preventDefault();
    const form = Object.fromEntries(new FormData(event.target));
    const payload = {
      char: form.char.trim(),
      radicalId: form.radicalId,
      structure: form.structure,
      pinyin: form.pinyin.trim(),
      jyutping: form.jyutping.trim(),
      meaning: form.meaning.trim(),
      words: splitList(form.words),
      component: form.component.trim(),
      imageHint: form.imageHint.trim()
    };
    Store.mutate(data => {
      if (form.id) {
        const item = data.characters.find(c => c.id === form.id);
        if (item) Object.assign(item, payload, { updatedAt: new Date().toISOString().slice(0, 10) });
      } else {
        const duplicate = data.characters.find(c => c.char === payload.char);
        if (duplicate) {
          duplicate._duplicateHit = true;
          return;
        }
        data.characters.push({ id: Store.uid('c'), ...payload, createdAt: new Date().toISOString().slice(0, 10) });
      }
    });
    const duplicate = db().characters.find(c => c.char === payload.char && c._duplicateHit);
    if (duplicate) {
      Store.mutate(data => { const item = data.characters.find(c => c.id === duplicate.id); if (item) delete item._duplicateHit; });
      UI.toast('此漢字已存在，已切換到修改模式。');
      Router.go('admin-characters', { edit: duplicate.id });
      return;
    }
    UI.toast(editing ? '已保存漢字修改。' : '已新增漢字。');
    Router.go('admin-characters');
  });
  main.querySelectorAll('[data-delete-char]').forEach(btn => btn.addEventListener('click', () => {
    Store.mutate(data => { data.characters = data.characters.filter(c => c.id !== btn.dataset.deleteChar); });
    UI.toast('已刪除漢字。');
    renderCharacterAdmin(main);
  }));
}

export function renderRadicalAdmin(main, query = {}) {
  const data = db();
  const editing = query.edit ? data.radicals.find(r => r.id === query.edit) : null;
  const title = editing ? `修改部首：${editing.key}` : '新增部首';
  main.innerHTML = `
    ${UI.topbar('部首管理', '管理部首主題、字源故事和學習地圖名稱。輸入部首字後可自動匹配名稱、主題、意思、字源故事和字源演變。')}
    ${tabs('admin-radicals')}
    <div class="grid two">
      <div class="card">
        <h3>${UI.escape(title)}</h3>
        <form id="radicalForm" class="form">
          <input type="hidden" name="id" value="${UI.safeAttr(editing?.id || '')}" />
          <div class="grid two">
            <div class="form-row"><label>部首字</label><input class="input" name="key" maxlength="2" value="${UI.safeAttr(editing?.key || '')}" required /></div>
            <div class="form-row"><label>名稱</label><input class="input" name="name" value="${UI.safeAttr(editing?.name || '')}" placeholder="如：水部" required /></div>
            <div class="form-row"><label>地圖標題</label><input class="input" name="title" value="${UI.safeAttr(editing?.title || '')}" placeholder="如：水部河流島" required /></div>
            <div class="form-row"><label>圖示 Emoji</label><input class="input" name="emoji" value="${UI.safeAttr(editing?.emoji || '')}" placeholder="💧" /></div>
          </div>
          <div class="form-row"><label>意思</label><input class="input" name="meaning" value="${UI.safeAttr(editing?.meaning || '')}" required /></div>
          <div class="form-row"><label>字源故事</label><textarea class="textarea" name="story">${UI.escape(editing?.story || '')}</textarea></div>
          <div class="form-row"><label>字源演變，用逗號分隔</label><input class="input" name="origin" value="${UI.safeAttr((editing?.origin || []).join('、'))}" placeholder="如：💧, 水, 水, 水" /></div>
          <div class="actions">
            <button class="btn secondary" type="button" data-ai-radical>AI自動匹配</button>
            <button class="btn primary" type="submit">${editing ? '保存修改' : '新增部首'}</button>
            ${editing ? '<a class="btn ghost" href="#admin-radicals">取消修改</a>' : ''}
          </div>
        </form>
      </div>
      <div class="card">
        <h3>部首清單</h3>
        ${UI.table(['部首', '名稱', '主題', '字數', '操作'], data.radicals.map(r => [
          `<strong style="font-size:28px">${UI.escape(r.key)}</strong>`, UI.escape(r.name), UI.escape(r.title), String(data.characters.filter(c => c.radicalId === r.id).length), `<div class="actions" style="margin-top:0"><a class="btn small secondary" href="#admin-radicals?edit=${UI.safeAttr(r.id)}">修改</a><button class="btn small danger" data-delete-radical="${UI.safeAttr(r.id)}">刪除</button></div>`
        ]))}
      </div>
    </div>
  `;
  bindRadicalAi(main, Boolean(editing));
  main.querySelector('#radicalForm').addEventListener('submit', event => {
    event.preventDefault();
    const form = Object.fromEntries(new FormData(event.target));
    const payload = {
      key: form.key.trim(),
      name: form.name.trim(),
      title: form.title.trim(),
      emoji: form.emoji.trim() || '🔤',
      meaning: form.meaning.trim(),
      story: form.story.trim(),
      origin: splitList(form.origin)
    };
    Store.mutate(data => {
      if (form.id) {
        const item = data.radicals.find(r => r.id === form.id);
        if (item) Object.assign(item, payload, { updatedAt: new Date().toISOString().slice(0, 10) });
      } else {
        const duplicate = data.radicals.find(r => r.key === payload.key);
        if (duplicate) {
          duplicate._duplicateHit = true;
          return;
        }
        data.radicals.push({ id: Store.uid('rad'), ...payload, createdAt: new Date().toISOString().slice(0, 10) });
      }
    });
    const duplicate = db().radicals.find(r => r.key === payload.key && r._duplicateHit);
    if (duplicate) {
      Store.mutate(data => { const item = data.radicals.find(r => r.id === duplicate.id); if (item) delete item._duplicateHit; });
      UI.toast('此部首已存在，已切換到修改模式。');
      Router.go('admin-radicals', { edit: duplicate.id });
      return;
    }
    UI.toast(editing ? '已保存部首修改。' : '已新增部首。');
    Router.go('admin-radicals');
  });
  main.querySelectorAll('[data-delete-radical]').forEach(btn => btn.addEventListener('click', () => {
    const data = db();
    if (data.characters.some(c => c.radicalId === btn.dataset.deleteRadical)) {
      UI.toast('此部首下仍有漢字，請先刪除或移動漢字。');
      return;
    }
    Store.mutate(data => { data.radicals = data.radicals.filter(r => r.id !== btn.dataset.deleteRadical); });
    UI.toast('已刪除部首。');
    renderRadicalAdmin(main);
  }));
}

export function renderQuestionAdmin(main) {
  const data = db();
  main.innerHTML = `
    ${UI.topbar('題目管理', '新增自訂題目。沒有自訂題目時，系統會根據漢字資料自動生成遊戲題。')}
    ${tabs('admin-questions')}
    <div class="grid two">
      <div class="card">
        <h3>新增題目</h3>
        <form id="questionForm" class="form">
          <div class="grid two">
            <div class="form-row"><label>題型</label><select class="select" name="type"><option value="find-radical">找部首</option><option value="compose-char">拖拉組字</option><option value="picture-choice">看圖選字</option></select></div>
            <div class="form-row"><label>部首</label><select class="select" name="radicalId">${UI.selectOptions(data.radicals, 'id', r => `${r.key}｜${r.name}`)}</select></div>
          </div>
          <div class="form-row"><label>題目文字</label><input class="input" name="prompt" required placeholder="例如：找出所有木部字" /></div>
          <div class="form-row"><label>正確答案，找部首可用逗號分隔</label><input class="input" name="answers" required placeholder="例如：棉, 樹, 林" /></div>
          <div class="form-row"><label>選項，用逗號分隔</label><input class="input" name="options" required placeholder="例如：棉, 晴, 樹, 問" /></div>
          <div class="form-row"><label>提示</label><input class="input" name="hint" /></div>
          <button class="btn primary" type="submit">新增題目</button>
        </form>
      </div>
      <div class="card">
        <h3>自訂題目清單</h3>
        ${data.customQuestions.length ? UI.table(['題型', '部首', '題目', '答案', '操作'], data.customQuestions.map(q => [UI.escape(UI.gameName(q.type)), UI.escape(data.radicals.find(r => r.id === q.radicalId)?.name || ''), UI.escape(q.prompt), UI.escape((q.answers || [q.answer]).join('、')), `<button class="btn small danger" data-delete-q="${UI.safeAttr(q.id)}">刪除</button>`])) : UI.empty('暫時沒有自訂題目。')}
      </div>
    </div>
  `;
  main.querySelector('#questionForm').addEventListener('submit', event => {
    event.preventDefault();
    const form = Object.fromEntries(new FormData(event.target));
    const answers = splitList(form.answers);
    const options = splitList(form.options);
    Store.mutate(data => data.customQuestions.push({ id: Store.uid('q'), type: form.type, radicalId: form.radicalId, prompt: form.prompt.trim(), hint: form.hint.trim(), answers, answer: answers[0], options }));
    UI.toast('已新增題目。');
    renderQuestionAdmin(main);
  });
  main.querySelectorAll('[data-delete-q]').forEach(btn => btn.addEventListener('click', () => {
    Store.mutate(data => { data.customQuestions = data.customQuestions.filter(q => q.id !== btn.dataset.deleteQ); });
    UI.toast('已刪除題目。');
    renderQuestionAdmin(main);
  }));
}

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export function renderMediaAdmin(main) {
  const data = db();
  main.innerHTML = `
    ${UI.topbar('圖片與音頻', '上傳圖片或音頻素材。MVP 會以 Data URL 存到 localStorage，正式版建議改用雲端儲存。')}
    ${tabs('admin-media')}
    <div class="grid two">
      <div class="card">
        <h3>上傳素材</h3>
        <form id="mediaForm" class="form">
          <div class="form-row"><label>素材名稱</label><input class="input" name="name" required /></div>
          <div class="form-row"><label>素材類型</label><select class="select" name="type"><option value="image">圖片</option><option value="audio">音頻</option></select></div>
          <div class="form-row"><label>選擇文件</label><input class="input" name="file" type="file" accept="image/*,audio/*" required /></div>
          <button class="btn primary" type="submit">上傳</button>
        </form>
      </div>
      <div class="card">
        <h3>素材清單</h3>
        ${data.media.length ? UI.table(['預覽', '名稱', '類型', '操作'], data.media.map(m => [
          m.type === 'image' ? `<img class="media-preview" src="${m.dataUrl}" alt="${UI.escape(m.name)}" />` : `<audio controls src="${m.dataUrl}"></audio>`,
          UI.escape(m.name), UI.escape(m.type), `<button class="btn small danger" data-delete-media="${UI.safeAttr(m.id)}">刪除</button>`
        ])) : UI.empty('暫時沒有素材。')}
      </div>
    </div>
  `;
  main.querySelector('#mediaForm').addEventListener('submit', async event => {
    event.preventDefault();
    const form = new FormData(event.target);
    const file = form.get('file');
    if (!file) return;
    const dataUrl = await readFileAsDataUrl(file);
    Store.mutate(data => data.media.push({ id: Store.uid('media'), name: form.get('name').trim(), type: form.get('type'), fileName: file.name, dataUrl, createdAt: new Date().toISOString().slice(0, 10) }));
    UI.toast('已上傳素材。');
    renderMediaAdmin(main);
  });
  main.querySelectorAll('[data-delete-media]').forEach(btn => btn.addEventListener('click', () => {
    Store.mutate(data => { data.media = data.media.filter(m => m.id !== btn.dataset.deleteMedia); });
    UI.toast('已刪除素材。');
    renderMediaAdmin(main);
  }));
}
