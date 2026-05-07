function esc(value = '') {
  return String(value).replace(/[&<>'"]/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[char]));
}

export const Worksheet = {
  html({ title, radical, characters, includeAnswer = false }) {
    const chars = characters || [];
    return `<!doctype html><html lang="zh-Hant"><head><meta charset="utf-8"><title>${esc(title)}</title><style>
      *{box-sizing:border-box} body{font-family:"Noto Sans TC","Microsoft JhengHei",sans-serif;color:#172033;margin:28px} h1{font-size:24px;margin:0 0 8px}.meta{display:flex;gap:26px;margin-bottom:18px}.box{border:2px solid #111;border-radius:14px;padding:14px;margin:14px 0}.grid{display:grid;grid-template-columns:repeat(4,1fr);gap:10px}.cell{border:1px solid #333;min-height:68px;display:flex;align-items:center;justify-content:center;font-size:36px}.line{height:34px;border-bottom:1px solid #333;margin:12px 0}.small{font-size:14px}.answer{color:#666}@media print{button{display:none} body{margin:18mm}}
    </style></head><body>
      <button onclick="window.print()">列印 / 另存 PDF</button>
      <h1>${esc(title)}</h1>
      <div class="meta"><span>日期：____________</span><span>姓名：____________</span><span>成績：____________</span></div>
      <div class="box"><strong>字源：</strong>${esc(radical.key)}｜${esc(radical.name)}：${esc(radical.meaning || '')}</div>
      <h2>一、找部首：圈出有「${esc(radical.key)}」部首的字。</h2>
      <div class="grid">${chars.concat(chars).slice(0, 12).map(c => `<div class="cell">${esc(c.char)}</div>`).join('')}</div>
      <h2>二、拼寫成詞：把部件組成字。</h2>
      ${chars.filter(c => c.component).slice(0, 6).map((c, i) => `<p>${i + 1}. ${esc(radical.key)} + ${esc(c.component)} = （　　　）${includeAnswer ? `<span class="answer">答案：${esc(c.char)}</span>` : ''}</p>`).join('')}
      <h2>三、看圖選字 / 造句。</h2>
      ${chars.slice(0, 4).map((c, i) => `<p>${i + 1}. ${esc(c.imageHint || c.words?.[0] || '')}：____________　　用「${esc(c.char)}」造句：</p><div class="line"></div>`).join('')}
      <p class="small">此練習紙由「字源小學堂」自動生成，可由瀏覽器列印並另存為 PDF。</p>
    </body></html>`;
  },
  openPrintWindow(options) {
    const popup = window.open('', '_blank');
    if (!popup) return false;
    popup.document.open();
    popup.document.write(Worksheet.html(options));
    popup.document.close();
    return true;
  },
  downloadHtml(options) {
    const blob = new Blob([Worksheet.html(options)], { type: 'text/html;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${options.title || 'worksheet'}.html`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(link.href), 1000);
  }
};
