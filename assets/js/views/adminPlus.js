import { Store } from '../core/store.js';
import { UI } from '../components/ui.js';
import { AITutor } from '../utils/ai.js';

function db() { return Store.get(); }

function tabs(active) {
  const items = [
    ['admin-schools', '🏫', '學校'],
    ['admin-subscriptions', '💳', '訂閱方案'],
    ['admin-ai', '🤖', 'AI設定'],
    ['admin-reading-content', '📖', '閱讀/作文'],
    ['admin-partnerships', '🤝', '出版社合作'],
    ['admin-integrations', '🔌', 'LMS串接']
  ];
  return `<div class="tabs">${items.map(([path, icon, label]) => `<a class="tab ${active === path ? 'active' : ''}" href="#${path}">${icon} ${label}</a>`).join('')}</div>`;
}

export function renderSchoolAdmin(main) {
  const data = db();
  main.innerHTML = `
    ${UI.topbar('學校多班級管理', '管理學校、班級、老師與授權席位。')}
    ${tabs('admin-schools')}
    <div class="grid two">
      <div class="card">
        <h3>新增學校</h3>
        <form id="schoolForm" class="form">
          <div class="form-row"><label>學校名稱</label><input class="input" name="name" placeholder="例如：陽光小學" required /></div>
          <div class="form-row"><label>訂閱方案</label><select class="select" name="planId">${UI.selectOptions(data.subscriptions, 'id', p => `${p.name}｜${p.seats} 席`)}</select></div>
          <div class="form-row"><label>席位上限</label><input class="input" name="seatLimit" type="number" value="120" min="1" /></div>
          <button class="btn primary" type="submit">新增學校</button>
        </form>
      </div>
      <div class="card">
        <h3>學校清單</h3>
        ${UI.table(['學校', '方案', '席位', '班級數', '狀態'], data.schools.map(s => {
          const plan = data.subscriptions.find(p => p.id === s.planId);
          const classCount = data.classes.filter(c => c.schoolId === s.id).length;
          return [UI.escape(s.name), UI.escape(plan?.name || ''), String(s.seatLimit || plan?.seats || '-'), String(classCount), `<span class="badge ${s.status === 'active' ? 'good' : 'warn'}">${UI.escape(s.status || 'active')}</span>`];
        }))}
      </div>
    </div>
    <div class="card" style="margin-top:18px">
      <h3>班級歸屬</h3>
      ${UI.table(['班級', '學校', '老師', '學生數'], data.classes.map(c => {
        const school = data.schools.find(s => s.id === c.schoolId);
        const teacher = data.users.find(u => u.id === c.teacherId);
        return [UI.escape(c.name), UI.escape(school?.name || '未指定'), UI.escape(teacher?.name || ''), String(c.studentIds?.length || 0)];
      }))}
    </div>
  `;
  main.querySelector('#schoolForm').addEventListener('submit', event => {
    event.preventDefault();
    const form = Object.fromEntries(new FormData(event.target));
    Store.mutate(data => data.schools.push({ id: Store.uid('school'), name: form.name.trim(), planId: form.planId, seatLimit: Number(form.seatLimit) || 1, status: 'active', createdAt: new Date().toISOString().slice(0, 10) }));
    UI.toast('已新增學校。');
    renderSchoolAdmin(main);
  });
}

export function renderSubscriptionAdmin(main) {
  const data = db();
  main.innerHTML = `
    ${UI.topbar('付費訂閱方案', '先用本地資料管理方案、席位和功能；正式版可串接 Stripe、PayPal 或學校採購流程。')}
    ${tabs('admin-subscriptions')}
    <div class="grid two">
      <div class="card">
        <h3>新增方案</h3>
        <form id="planForm" class="form">
          <div class="form-row"><label>方案名稱</label><input class="input" name="name" required /></div>
          <div class="form-row"><label>月費</label><input class="input" type="number" name="price" value="0" min="0" /></div>
          <div class="form-row"><label>席位</label><input class="input" type="number" name="seats" value="30" min="1" /></div>
          <div class="form-row"><label>功能，用逗號分隔</label><input class="input" name="features" placeholder="例如：班級管理, 家長週報" /></div>
          <button class="btn primary" type="submit">新增方案</button>
        </form>
      </div>
      <div class="card">
        <h3>方案清單</h3>
        ${UI.table(['名稱', '月費', '席位', '功能'], data.subscriptions.map(p => [UI.escape(p.name), `$${p.price || 0}`, String(p.seats), UI.escape((p.features || []).join('、'))]))}
      </div>
    </div>
    <div class="card" style="margin-top:18px">
      <h3>學校方案分配</h3>
      ${UI.table(['學校', '當前方案', '席位上限'], data.schools.map(s => {
        const plan = data.subscriptions.find(p => p.id === s.planId);
        return [UI.escape(s.name), `<select class="select compact" data-school-plan="${UI.safeAttr(s.id)}">${data.subscriptions.map(p => `<option value="${UI.safeAttr(p.id)}" ${p.id === s.planId ? 'selected' : ''}>${UI.escape(p.name)}</option>`).join('')}</select>`, String(s.seatLimit || plan?.seats || '-')];
      }))}
    </div>
  `;
  main.querySelector('#planForm').addEventListener('submit', event => {
    event.preventDefault();
    const form = Object.fromEntries(new FormData(event.target));
    Store.mutate(data => data.subscriptions.push({ id: Store.uid('plan'), name: form.name.trim(), price: Number(form.price) || 0, seats: Number(form.seats) || 1, features: form.features.split(/[,，]/).map(x => x.trim()).filter(Boolean) }));
    UI.toast('已新增方案。');
    renderSubscriptionAdmin(main);
  });
  main.querySelectorAll('[data-school-plan]').forEach(select => select.addEventListener('change', () => {
    Store.mutate(data => { const school = data.schools.find(s => s.id === select.dataset.schoolPlan); school.planId = select.value; });
    UI.toast('已更新學校方案。');
  }));
}

export function renderAiAdmin(main) {
  const data = db();
  main.innerHTML = `
    ${UI.topbar('AI 生成例句與推薦', '目前使用本地模板和規則引擎；日後可接入 OpenAI API 或校內私有模型。')}
    ${tabs('admin-ai')}
    <div class="grid two">
      <div class="card">
        <h3>生成例句</h3>
        <div class="form">
          <div class="form-row"><label>漢字</label><select class="select" id="aiChar">${UI.selectOptions(data.characters, 'id', c => `${c.char}｜${c.words?.[0] || c.meaning}`)}</select></div>
          <button class="btn primary" data-generate>生成例句</button>
        </div>
        <div id="aiOutput" class="ai-box"></div>
      </div>
      <div class="card">
        <h3>AI 接口預留</h3>
        <p>建議後端提供 <code>/api/ai/sentence</code>、<code>/api/ai/recommend</code>、<code>/api/ai/writing-feedback</code> 三個接口。</p>
        <pre class="code-block">{
  provider: 'openai',
  model: 'gpt-4.1-mini',
  safety: 'child_education',
  locale: 'zh-Hant'
}</pre>
      </div>
    </div>
    <div class="card" style="margin-top:18px">
      <h3>生成記錄</h3>
      ${UI.table(['時間', '字', '句子'], (data.aiLogs || []).slice(-8).reverse().map(log => [UI.escape((log.createdAt || '').replace('T', ' ').slice(0, 19)), UI.escape(log.char), UI.escape(log.sentence)]))}
    </div>
  `;
  main.querySelector('[data-generate]').addEventListener('click', () => {
    const char = db().characters.find(c => c.id === main.querySelector('#aiChar').value);
    const sentences = AITutor.generateMoreSentences(char, 3);
    Store.mutate(data => {
      data.aiLogs = data.aiLogs || [];
      sentences.forEach(sentence => data.aiLogs.push({ id: Store.uid('ai'), char: char.char, sentence, createdAt: new Date().toISOString() }));
    });
    main.querySelector('#aiOutput').innerHTML = `<ol class="clean-list">${sentences.map(s => `<li>${UI.escape(s)}</li>`).join('')}</ol>`;
    UI.toast('已生成例句。');
  });
}

export function renderReadingContentAdmin(main) {
  const data = db();
  main.innerHTML = `
    ${UI.topbar('閱讀理解與小作文題庫', '管理第三階段閱讀短文與小作文題目。')}
    ${tabs('admin-reading-content')}
    <div class="grid two">
      <div class="card">
        <h3>新增閱讀短文</h3>
        <form id="readingForm" class="form">
          <div class="form-row"><label>標題</label><input class="input" name="title" required /></div>
          <div class="form-row"><label>程度</label><input class="input" name="level" value="小一" /></div>
          <div class="form-row"><label>關聯部首</label><select class="select" name="radicalId">${UI.selectOptions(data.radicals, 'id', r => `${r.key}｜${r.name}`)}</select></div>
          <div class="form-row"><label>短文</label><textarea class="textarea" name="text" required></textarea></div>
          <div class="form-row"><label>示範問題</label><input class="input" name="question" placeholder="例如：故事裡有什麼？" /></div>
          <div class="form-row"><label>答案</label><input class="input" name="answer" /></div>
          <button class="btn primary" type="submit">新增短文</button>
        </form>
      </div>
      <div class="card">
        <h3>新增小作文題目</h3>
        <form id="writingPromptForm" class="form">
          <div class="form-row"><label>標題</label><input class="input" name="title" required /></div>
          <div class="form-row"><label>題目</label><textarea class="textarea" name="prompt" required></textarea></div>
          <div class="form-row"><label>關鍵字，用逗號分隔</label><input class="input" name="keywords" /></div>
          <button class="btn primary" type="submit">新增作文題</button>
        </form>
      </div>
    </div>
    <div class="grid two" style="margin-top:18px">
      <div class="card"><h3>短文清單</h3>${UI.table(['標題','程度','字數'], data.readingPassages.map(p => [UI.escape(p.title), UI.escape(p.level), String(p.text.length)]))}</div>
      <div class="card"><h3>作文題清單</h3>${UI.table(['標題','關鍵字'], data.writingPrompts.map(p => [UI.escape(p.title), UI.escape((p.keywords || []).join('、'))]))}</div>
    </div>
  `;
  main.querySelector('#readingForm').addEventListener('submit', event => {
    event.preventDefault();
    const form = Object.fromEntries(new FormData(event.target));
    Store.mutate(data => data.readingPassages.push({ id: Store.uid('read'), title: form.title.trim(), level: form.level.trim(), radicalId: form.radicalId, text: form.text.trim(), questions: [{ prompt: form.question.trim() || '短文主要說什麼？', options: [form.answer.trim() || '正確答案', '其他答案', '不知道'], answer: form.answer.trim() || '正確答案' }] }));
    UI.toast('已新增閱讀短文。');
    renderReadingContentAdmin(main);
  });
  main.querySelector('#writingPromptForm').addEventListener('submit', event => {
    event.preventDefault();
    const form = Object.fromEntries(new FormData(event.target));
    Store.mutate(data => data.writingPrompts.push({ id: Store.uid('wp'), title: form.title.trim(), prompt: form.prompt.trim(), keywords: form.keywords.split(/[,，]/).map(x => x.trim()).filter(Boolean) }));
    UI.toast('已新增作文題。');
    renderReadingContentAdmin(main);
  });
}

export function renderPartnerships(main) {
  const data = db();
  main.innerHTML = `
    ${UI.topbar('教材出版社合作', '記錄出版社教材、單元映射和合作狀態。')}
    ${tabs('admin-partnerships')}
    <div class="grid two">
      <div class="card">
        <h3>新增合作資料</h3>
        <form id="partnerForm" class="form">
          <div class="form-row"><label>出版社</label><input class="input" name="publisher" required /></div>
          <div class="form-row"><label>教材系列</label><input class="input" name="series" required /></div>
          <div class="form-row"><label>狀態</label><select class="select" name="status"><option>洽談中</option><option>試點中</option><option>已簽約</option></select></div>
          <div class="form-row"><label>備註</label><textarea class="textarea" name="notes"></textarea></div>
          <button class="btn primary" type="submit">新增</button>
        </form>
      </div>
      <div class="card"><h3>合作清單</h3>${UI.table(['出版社','系列','狀態','備註'], data.partnerMaterials.map(p => [UI.escape(p.publisher), UI.escape(p.series), UI.escape(p.status), UI.escape(p.notes || '')]))}</div>
    </div>
  `;
  main.querySelector('#partnerForm').addEventListener('submit', event => {
    event.preventDefault();
    const form = Object.fromEntries(new FormData(event.target));
    Store.mutate(data => data.partnerMaterials.push({ id: Store.uid('pm'), publisher: form.publisher.trim(), series: form.series.trim(), status: form.status, notes: form.notes.trim() }));
    UI.toast('已新增合作資料。');
    renderPartnerships(main);
  });
}

export function renderIntegrations(main) {
  const data = db();
  main.innerHTML = `
    ${UI.topbar('學校版 LMS 串接', '預留 Google Classroom、Moodle、Canvas、LTI 1.3、SSO 與成績回傳設定。')}
    ${tabs('admin-integrations')}
    <div class="grid two">
      <div class="card">
        <h3>新增串接</h3>
        <form id="integrationForm" class="form">
          <div class="form-row"><label>類型</label><select class="select" name="type"><option>LMS</option><option>SSO</option><option>Roster Sync</option><option>Grade Passback</option></select></div>
          <div class="form-row"><label>名稱</label><input class="input" name="name" required /></div>
          <div class="form-row"><label>Endpoint</label><input class="input" name="endpoint" placeholder="https://..." /></div>
          <div class="form-row"><label>狀態</label><select class="select" name="status"><option value="planned">planned</option><option value="testing">testing</option><option value="active">active</option></select></div>
          <div class="form-row"><label>備註</label><textarea class="textarea" name="notes"></textarea></div>
          <button class="btn primary" type="submit">保存串接</button>
        </form>
      </div>
      <div class="card"><h3>串接清單</h3>${UI.table(['類型','名稱','狀態','Endpoint'], data.integrations.map(i => [UI.escape(i.type), UI.escape(i.name), `<span class="badge ${i.status === 'active' ? 'good' : 'warn'}">${UI.escape(i.status)}</span>`, UI.escape(i.endpoint || '-')]))}</div>
    </div>
  `;
  main.querySelector('#integrationForm').addEventListener('submit', event => {
    event.preventDefault();
    const form = Object.fromEntries(new FormData(event.target));
    Store.mutate(data => data.integrations.push({ id: Store.uid('int'), type: form.type, name: form.name.trim(), endpoint: form.endpoint.trim(), status: form.status, notes: form.notes.trim() }));
    UI.toast('已保存串接設定。');
    renderIntegrations(main);
  });
}
