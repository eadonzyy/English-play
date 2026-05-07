import { Pronunciation } from './pronunciation.js';

export const Speech = {
  supported() {
    return typeof window !== 'undefined' && 'speechSynthesis' in window;
  },
  speak(text, mode = Pronunciation.mode()) {
    const clean = String(text || '').trim();
    if (!clean) return { ok: false, message: '沒有可朗讀文字。' };
    if (!Speech.supported()) return { ok: false, message: '此瀏覽器不支援語音朗讀。' };
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(clean);
    utterance.lang = Pronunciation.lang(mode);
    utterance.rate = 0.82;
    utterance.pitch = 1.05;
    window.speechSynthesis.speak(utterance);
    return { ok: true };
  },
  bindSpeakButtons(root = document) {
    root.querySelectorAll('[data-speak]').forEach(btn => {
      btn.addEventListener('click', () => {
        const result = Speech.speak(btn.dataset.speak);
        if (!result.ok) {
          window.dispatchEvent(new CustomEvent('ui:toast', { detail: result.message }));
        }
      });
    });
  }
};
