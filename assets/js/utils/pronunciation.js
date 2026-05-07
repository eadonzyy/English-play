const ZHUYIN = {
  '木': 'ㄇㄨˋ', '林': 'ㄌㄧㄣˊ', '森': 'ㄙㄣ', '村': 'ㄘㄨㄣ', '校': 'ㄒㄧㄠˋ', '樹': 'ㄕㄨˋ', '杏': 'ㄒㄧㄥˋ', '梨': 'ㄌㄧˊ', '棉': 'ㄇㄧㄢˊ', '橋': 'ㄑㄧㄠˊ',
  '日': 'ㄖˋ', '早': 'ㄗㄠˇ', '明': 'ㄇㄧㄥˊ', '晴': 'ㄑㄧㄥˊ', '晚': 'ㄨㄢˇ', '春': 'ㄔㄨㄣ', '時': 'ㄕˊ', '暑': 'ㄕㄨˇ', '晶': 'ㄐㄧㄥ', '晨': 'ㄔㄣˊ',
  '口': 'ㄎㄡˇ', '吃': 'ㄔ', '叫': 'ㄐㄧㄠˋ', '唱': 'ㄔㄤˋ', '問': 'ㄨㄣˋ', '哭': 'ㄎㄨ', '告': 'ㄍㄠˋ', '品': 'ㄆㄧㄣˇ', '回': 'ㄏㄨㄟˊ', '哈': 'ㄏㄚ',
  '虫': 'ㄔㄨㄥˊ', '蝴': 'ㄏㄨˊ', '蝶': 'ㄉㄧㄝˊ', '蜂': 'ㄈㄥ', '蚊': 'ㄨㄣˊ', '蟻': 'ㄧˇ', '蛇': 'ㄕㄜˊ', '蛛': 'ㄓㄨ', '蛙': 'ㄨㄚ', '蟬': 'ㄔㄢˊ'
};

export const Pronunciation = {
  getZhuyin(char) {
    return ZHUYIN[char] || '';
  },
  mode() {
    return localStorage.getItem('zixue_pronunciation_mode') || 'mandarin';
  },
  setMode(mode) {
    localStorage.setItem('zixue_pronunciation_mode', mode);
    window.dispatchEvent(new CustomEvent('pronunciation:changed'));
  },
  label(mode = Pronunciation.mode()) {
    return { mandarin: '普通話拼音', cantonese: '粵語粵拼', zhuyin: '注音' }[mode] || '普通話拼音';
  },
  lang(mode = Pronunciation.mode()) {
    return { mandarin: 'zh-CN', cantonese: 'zh-HK', zhuyin: 'zh-TW' }[mode] || 'zh-CN';
  },
  value(character, mode = Pronunciation.mode()) {
    if (!character) return '';
    if (mode === 'cantonese') return character.jyutping || '';
    if (mode === 'zhuyin') return Pronunciation.getZhuyin(character.char) || '';
    return character.pinyin || '';
  },
  selectorHtml() {
    const mode = Pronunciation.mode();
    return `<label class="inline-setting">讀音顯示 <select class="select compact" id="pronunciationMode"><option value="mandarin" ${mode === 'mandarin' ? 'selected' : ''}>普通話拼音</option><option value="cantonese" ${mode === 'cantonese' ? 'selected' : ''}>粵語粵拼</option><option value="zhuyin" ${mode === 'zhuyin' ? 'selected' : ''}>注音</option></select></label>`;
  },
  bindSelector(root = document) {
    const select = root.querySelector('#pronunciationMode');
    if (select) select.addEventListener('change', () => Pronunciation.setMode(select.value));
  }
};
