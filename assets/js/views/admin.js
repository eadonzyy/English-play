import { Store } from '../core/store.js';
import { UI } from '../components/ui.js';

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

export function renderCharacterAdmin(main) {
  const data = db();
  main.innerHTML = `
    ${UI.topbar('漢字管理', '新增或查看每個部首下的漢字資料。')}
    ${tabs('admin-characters')}
    <div class="grid two">
      <div class="card">
        <h3>新增漢字</h3>
        <form id="charForm" class="form">
          <div class="grid two">
            <div class="form-row"><label>漢字</label><input class="input" name="char" maxlength="2" required /></div>
            <div class="form-row"><label>部首</label><select class="select" name="radicalId" required>${UI.selectOptions(data.radicals, 'id', r => `${r.key}｜${r.name}`)}</select></div>
            <div class="form-row"><label>結構</label><select class="select" name="structure"><option>左右</option><option>上下</option><option>包圍</option><option>獨體</option><option>品字形</option></select></div>
            <div class="form-row"><label>拼音</label><input class="input" name="pinyin" placeholder="如：mù" /></div>
            <div class="form-row"><label>粵拼</label><input class="input" name="jyutping" placeholder="如：muk6" /></div>
            <div class="form-row"><label>組字部件</label><input class="input" name="component" placeholder="如：寸、青、昌" /></div>
          </div>
          <div class="form-row"><label>意思</label><input class="input" name="meaning" placeholder="簡短解釋" /></div>
          <div class="form-row"><label>詞語，用逗號分隔</label><input class="input" name="words" placeholder="如：木頭, 木馬" /></div>
          <div class="form-row"><label>圖片提示</label><input class="input" name="imageHint" placeholder="如：大樹、晴天" /></div>
          <button class="btn primary" type="submit">新增漢字</button>
        </form>
      </div>
      <div class="card">
        <h3>漢字清單</h3>
        ${UI.table(['字', '部首', '結構', '詞語', '操作'], data.characters.map(c => {
          const radical = data.radicals.find(r => r.id === c.radicalId);
          return [`<strong style="font-size:28px">${UI.escape(c.char)}</strong>`, UI.escape(radical?.name || ''), UI.escape(c.structure || ''), UI.escape((c.words || []).join('、')), `<button class="btn small danger" data-delete-char="${c.id}">刪除</button>`];
        }))}
      </div>
    </div>
  `;
  main.querySelector('#charForm').addEventListener('submit', event => {
    event.preventDefault();
    const form = Object.fromEntries(new FormData(event.target));
    Store.mutate(data => {
      data.characters.push({
        id: Store.uid('c'),
        char: form.char.trim(),
        radicalId: form.radicalId,
        structure: form.structure,
        pinyin: form.pinyin.trim(),
        jyutping: form.jyutping.trim(),
        meaning: form.meaning.trim(),
        words: form.words.split(/[,，]/).map(x => x.trim()).filter(Boolean),
        component: form.component.trim(),
        imageHint: form.imageHint.trim()
      });
    });
    UI.toast('已新增漢字。');
    renderCharacterAdmin(main);
  });
  main.querySelectorAll('[data-delete-char]').forEach(btn => btn.addEventListener('click', () => {
    Store.mutate(data => { data.characters = data.characters.filter(c => c.id !== btn.dataset.deleteChar); });
    UI.toast('已刪除漢字。');
    renderCharacterAdmin(main);
  }));
}

export function renderRadicalAdmin(main) {
  const data = db();
  main.innerHTML = `
    ${UI.topbar('部首管理', '管理部首主題、字源故事和學習地圖名稱。')}
    ${tabs('admin-radicals')}
    <div class="grid two">
      <div class="card">
        <h3>新增部首</h3>
        <form id="radicalForm" class="form">
          <div class="grid two">
            <div class="form-row"><label>部首字</label><input class="input" name="key" maxlength="2" required /></div>
            <div class="form-row"><label>名稱</label><input class="input" name="name" placeholder="如：水部" required /></div>
            <div class="form-row"><label>地圖標題</label><input class="input" name="title" placeholder="如：水部河流島" required /></div>
            <div class="form-row"><label>圖示 Emoji</label><input class="input" name="emoji" placeholder="💧" /></div>
          </div>
          <div class="form-row"><label>意思</label><input class="input" name="meaning" required /></div>
          <div class="form-row"><label>字源故事</label><textarea class="textarea" name="story"></textarea></div>
          <div class="form-row"><label>字源演變，用逗號分隔</label><input class="input" name="origin" placeholder="如：💧, 水, 水, 水" /></div>
          <button class="btn primary" type="submit">新增部首</button>
        </form>
      </div>
      <div class="card">
        <h3>部首清單</h3>
        ${UI.table(['部首', '名稱', '主題', '字數', '操作'], data.radicals.map(r => [
          `<strong style="font-size:28px">${UI.escape(r.key)}</strong>`, UI.escape(r.name), UI.escape(r.title), String(data.characters.filter(c => c.radicalId === r.id).length), `<button class="btn small danger" data-delete-radical="${r.id}">刪除</button>`
        ]))}
      </div>
    </div>
  `;
  main.querySelector('#radicalForm').addEventListener('submit', event => {
    event.preventDefault();
    const form = Object.fromEntries(new FormData(event.target));
    Store.mutate(data => {
      data.radicals.push({ id: Store.uid('rad'), key: form.key.trim(), name: form.name.trim(), title: form.title.trim(), emoji: form.emoji.trim() || '🔤', meaning: form.meaning.trim(), story: form.story.trim(), origin: form.origin.split(/[,，]/).map(x => x.trim()).filter(Boolean) });
    });
    UI.toast('已新增部首。');
    renderRadicalAdmin(main);
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
        ${data.customQuestions.length ? UI.table(['題型', '部首', '題目', '答案', '操作'], data.customQuestions.map(q => [UI.escape(UI.gameName(q.type)), UI.escape(data.radicals.find(r => r.id === q.radicalId)?.name || ''), UI.escape(q.prompt), UI.escape((q.answers || [q.answer]).join('、')), `<button class="btn small danger" data-delete-q="${q.id}">刪除</button>`])) : UI.empty('暫時沒有自訂題目。')}
      </div>
    </div>
  `;
  main.querySelector('#questionForm').addEventListener('submit', event => {
    event.preventDefault();
    const form = Object.fromEntries(new FormData(event.target));
    const answers = form.answers.split(/[,，]/).map(x => x.trim()).filter(Boolean);
    const options = form.options.split(/[,，]/).map(x => x.trim()).filter(Boolean);
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
          UI.escape(m.name), UI.escape(m.type), `<button class="btn small danger" data-delete-media="${m.id}">刪除</button>`
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
