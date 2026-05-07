const TEMPLATES = [
  '{name}正在學「{char}」這個字。',
  '今天我們用「{char}」組成「{word}」這個詞。',
  '小朋友可以在生活中找到「{word}」。',
  '老師請大家用「{char}」說一句完整的話。'
];

export const AITutor = {
  generateSentence(character, studentName = '小朋友') {
    const word = character?.words?.[0] || character?.meaning || character?.char || '漢字';
    const index = Math.abs((character?.char || '字').charCodeAt(0) || 0) % TEMPLATES.length;
    return TEMPLATES[index]
      .replaceAll('{name}', studentName)
      .replaceAll('{char}', character?.char || '字')
      .replaceAll('{word}', word);
  },
  generateMoreSentences(character, count = 3) {
    const word = character?.words?.[0] || character?.char || '漢字';
    return [
      `我會認讀「${character?.char || '字'}」，也會說「${word}」。`,
      `請你用「${word}」造一個短句。`,
      `看到「${character?.char || '字'}」時，我會先找它的部首。`
    ].slice(0, count);
  },
  recommendFromMistakes(wrongs, radicals = []) {
    if (!wrongs.length) return ['今天可以挑戰新部首，保持每天 5 分鐘練習。'];
    const top = [...wrongs].sort((a, b) => (b.count || 1) - (a.count || 1)).slice(0, 5);
    const byRadical = top.reduce((map, item) => {
      map[item.radicalId] = (map[item.radicalId] || 0) + (item.count || 1);
      return map;
    }, {});
    const hardest = Object.entries(byRadical).sort((a, b) => b[1] - a[1])[0]?.[0];
    const radical = radicals.find(r => r.id === hardest);
    return [
      `先重練 ${top.map(x => `「${x.char}」`).join('、')}。`,
      radical ? `建議回到「${radical.name}」關卡，先玩找部首，再玩組字。` : '建議先做找部首題，確認字形位置。',
      '每個錯字答對 3 次後，再進入下一個新字。'
    ];
  },
  scoreWriting(text, prompt = '') {
    const clean = String(text || '').trim();
    const lengthScore = Math.min(40, clean.length * 2);
    const punctuationScore = /[。！？!?]/.test(clean) ? 20 : 8;
    const topicScore = prompt && clean.includes(prompt.match(/[「『](.*?)[」』]/)?.[1] || '') ? 20 : 12;
    const varietyScore = new Set(clean).size > 8 ? 20 : 10;
    const score = Math.min(100, lengthScore + punctuationScore + topicScore + varietyScore);
    const advice = [];
    if (clean.length < 20) advice.push('句子可以再寫長一點，補充時間、地點或人物。');
    if (!/[。！？!?]/.test(clean)) advice.push('記得在句子最後加上標點符號。');
    if (score >= 80) advice.push('內容完整，可以嘗試加入形容詞。');
    return { score, advice };
  },
  buildParentReport({ student, progress, wrongs, recommendations }) {
    const completed = progress.filter(p => p.completed).length;
    const avg = progress.length ? Math.round(progress.reduce((sum, p) => sum + (p.score || 0), 0) / progress.length) : 0;
    return `家長您好：\n\n${student.name} 本週完成 ${completed} 份練習，平均分為 ${avg} 分，累積星星 ${student.stars || 0} 顆。\n\n需要留意的字：${wrongs.length ? wrongs.slice(0, 5).map(w => `「${w.char}」`).join('、') : '暫時沒有明顯錯題'}。\n\n建議：${recommendations.join(' ')}\n\n建議每天安排 5 至 10 分鐘短練習，先看字源，再做部首遊戲，最後做錯題重練。`;
  }
};
