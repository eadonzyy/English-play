export const UI = {
  escape(value = '') {
    return String(value).replace(/[&<>'"]/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[char]));
  },
  roleName(role) {
    return { student: '學生', teacher: '老師', admin: '管理員', parent: '家長' }[role] || role;
  },
  gameName(type) {
    return {
      'find-radical': '找部首遊戲',
      'compose-char': '拖拉組字遊戲',
      'picture-choice': '看圖選字遊戲',
      'wrongbook': '錯題重練',
      'stroke-trace': '筆順描紅',
      'speed-challenge': '班級競賽',
      'reading': '閱讀理解',
      'writing': '小作文練習'
    }[type] || type;
  },
  progress(value) {
    const safe = Math.max(0, Math.min(100, Number(value) || 0));
    return `<div class="progress" aria-label="完成度 ${safe}%"><span style="width:${safe}%"></span></div>`;
  },
  topbar(title, subtitle = '', actions = '') {
    return `<div class="topbar"><div><h2>${UI.escape(title)}</h2>${subtitle ? `<p>${UI.escape(subtitle)}</p>` : ''}</div><div class="actions">${actions}</div></div>`;
  },
  empty(text) {
    return `<div class="empty">${UI.escape(text)}</div>`;
  },
  toast(message) {
    const node = document.createElement('div');
    node.className = 'toast';
    node.textContent = message;
    document.body.appendChild(node);
    setTimeout(() => node.remove(), 2200);
  },
  table(headers, rows) {
    if (!rows.length) return UI.empty('暫時沒有資料。');
    return `<div class="table-wrap"><table><thead><tr>${headers.map(h => `<th>${UI.escape(h)}</th>`).join('')}</tr></thead><tbody>${rows.map(row => `<tr>${row.map(cell => `<td>${cell}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
  },
  charTile(char, extra = '') {
    return `<button class="char-tile ${extra}" data-char="${UI.escape(char.char)}"><span class="hanzi">${UI.escape(char.char)}</span><span class="small">${UI.escape(char.words?.[0] || char.meaning || '')}</span></button>`;
  },
  safeAttr(value = '') {
    return UI.escape(value).replace(/`/g, '&#96;');
  },
  metricCard(label, value, icon, tone = 'good') {
    return `<div class="card kpi"><div><span class="badge ${tone}">${UI.escape(label)}</span><div class="num">${UI.escape(value)}</div></div><div class="emoji">${UI.escape(icon)}</div></div>`;
  },
  selectOptions(items, valueKey = 'id', labelFn = item => item.name) {
    return items.map(item => `<option value="${UI.escape(item[valueKey])}">${UI.escape(labelFn(item))}</option>`).join('');
  }
};
