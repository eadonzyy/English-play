export const SEED = {
  version: 2,
  users: [
    { id: 'u_admin', username: 'admin', password: '123456', role: 'admin', name: '管理員' },
    { id: 'u_teacher', username: 'teacher', password: '123456', role: 'teacher', name: '陳老師', schoolId: 'school_1' },
    { id: 'u_student1', username: 'student1', password: '123456', role: 'student', name: '小明', stars: 18, streak: 5, classId: 'class_1' },
    { id: 'u_student2', username: 'student2', password: '123456', role: 'student', name: '小美', stars: 9, streak: 2, classId: 'class_1' },
    { id: 'u_parent', username: 'parent', password: '123456', role: 'parent', name: '小明家長', studentIds: ['u_student1'] }
  ],
  schools: [
    { id: 'school_1', name: '星光小學', planId: 'plan_school', seatLimit: 120, status: 'active', createdAt: '2026-05-06' }
  ],
  classes: [
    { id: 'class_1', name: '一年級 A 班', schoolId: 'school_1', teacherId: 'u_teacher', studentIds: ['u_student1', 'u_student2'], createdAt: '2026-05-06' }
  ],
  radicals: [
    { id: 'wood', key: '木', name: '木部', title: '木部森林', emoji: '🌳', meaning: '多與樹木、木材、植物或木製品有關。', story: '「木」像一棵有樹幹、樹枝和樹根的樹。', origin: ['🌳', '𣎳', '木', '木'] },
    { id: 'sun', key: '日', name: '日部', title: '日部太陽島', emoji: '☀️', meaning: '多與太陽、時間、明暗、天氣有關。', story: '「日」原本像太陽，中間一點表示太陽的光。', origin: ['☀️', '⊙', '日', '日'] },
    { id: 'mouth', key: '口', name: '口部', title: '口部聲音村', emoji: '👄', meaning: '多與嘴巴、說話、聲音、吃喝有關。', story: '「口」像人的嘴巴。', origin: ['👄', '□', '口', '口'] },
    { id: 'insect', key: '虫', name: '虫部', title: '虫部昆蟲谷', emoji: '🐛', meaning: '多與蛇、昆蟲或小動物有關。', story: '「虫」古時像蛇或蟲的形狀。', origin: ['🐛', '𧈧', '虫', '虫'] }
  ],
  characters: [
    { id: 'c_mu', char: '木', radicalId: 'wood', structure: '獨體', pinyin: 'mù', jyutping: 'muk6', meaning: '樹木、木材', words: ['木頭', '木馬', '樹木'], component: '', imageHint: '樹木' },
    { id: 'c_lin', char: '林', radicalId: 'wood', structure: '左右', pinyin: 'lín', jyutping: 'lam4', meaning: '很多樹木', words: ['森林', '樹林'], component: '木', imageHint: '樹林' },
    { id: 'c_sen', char: '森', radicalId: 'wood', structure: '品字形', pinyin: 'sēn', jyutping: 'sam1', meaning: '樹很多', words: ['森林', '森嚴'], component: '林', imageHint: '森林' },
    { id: 'c_cun', char: '村', radicalId: 'wood', structure: '左右', pinyin: 'cūn', jyutping: 'cyun1', meaning: '村莊', words: ['村子', '鄉村'], component: '寸', imageHint: '村莊' },
    { id: 'c_xiao', char: '校', radicalId: 'wood', structure: '左右', pinyin: 'xiào', jyutping: 'haau6', meaning: '學校', words: ['學校', '校園'], component: '交', imageHint: '學校' },
    { id: 'c_shu', char: '樹', radicalId: 'wood', structure: '左右', pinyin: 'shù', jyutping: 'syu6', meaning: '樹木', words: ['大樹', '樹枝'], component: '尌', imageHint: '大樹' },
    { id: 'c_xing', char: '杏', radicalId: 'wood', structure: '上下', pinyin: 'xìng', jyutping: 'hang6', meaning: '杏樹或杏子', words: ['杏花', '杏子'], component: '口', imageHint: '杏子' },
    { id: 'c_li', char: '梨', radicalId: 'wood', structure: '上下', pinyin: 'lí', jyutping: 'lei4', meaning: '一種水果', words: ['梨子', '雪梨'], component: '利', imageHint: '梨子' },
    { id: 'c_mian', char: '棉', radicalId: 'wood', structure: '左右', pinyin: 'mián', jyutping: 'min4', meaning: '棉花', words: ['棉花', '棉衣'], component: '帛', imageHint: '棉花' },
    { id: 'c_qiao', char: '橋', radicalId: 'wood', structure: '左右', pinyin: 'qiáo', jyutping: 'kiu4', meaning: '橋樑', words: ['小橋', '天橋'], component: '喬', imageHint: '橋' },

    { id: 'c_ri', char: '日', radicalId: 'sun', structure: '獨體', pinyin: 'rì', jyutping: 'jat6', meaning: '太陽、日子', words: ['日子', '生日'], component: '', imageHint: '太陽' },
    { id: 'c_zao', char: '早', radicalId: 'sun', structure: '上下', pinyin: 'zǎo', jyutping: 'zou2', meaning: '早上', words: ['早安', '早上'], component: '十', imageHint: '早晨' },
    { id: 'c_ming', char: '明', radicalId: 'sun', structure: '左右', pinyin: 'míng', jyutping: 'ming4', meaning: '明亮', words: ['明天', '明亮'], component: '月', imageHint: '日月明' },
    { id: 'c_qing', char: '晴', radicalId: 'sun', structure: '左右', pinyin: 'qíng', jyutping: 'cing4', meaning: '天氣晴朗', words: ['晴天', '晴朗'], component: '青', imageHint: '晴天' },
    { id: 'c_wan', char: '晚', radicalId: 'sun', structure: '左右', pinyin: 'wǎn', jyutping: 'maan5', meaning: '晚上', words: ['晚上', '晚安'], component: '免', imageHint: '夜晚' },
    { id: 'c_chun', char: '春', radicalId: 'sun', structure: '上下', pinyin: 'chūn', jyutping: 'ceon1', meaning: '春天', words: ['春天', '春風'], component: '𡗗', imageHint: '春天' },
    { id: 'c_shi', char: '時', radicalId: 'sun', structure: '左右', pinyin: 'shí', jyutping: 'si4', meaning: '時間', words: ['時間', '時鐘'], component: '寺', imageHint: '時鐘' },
    { id: 'c_shu2', char: '暑', radicalId: 'sun', structure: '上下', pinyin: 'shǔ', jyutping: 'syu2', meaning: '炎熱', words: ['暑假', '炎暑'], component: '者', imageHint: '炎熱' },
    { id: 'c_jing', char: '晶', radicalId: 'sun', structure: '品字形', pinyin: 'jīng', jyutping: 'zing1', meaning: '明亮', words: ['水晶', '亮晶晶'], component: '日', imageHint: '亮晶晶' },
    { id: 'c_chen', char: '晨', radicalId: 'sun', structure: '上下', pinyin: 'chén', jyutping: 'san4', meaning: '早晨', words: ['晨光', '清晨'], component: '辰', imageHint: '早晨' },

    { id: 'c_kou', char: '口', radicalId: 'mouth', structure: '獨體', pinyin: 'kǒu', jyutping: 'hau2', meaning: '嘴巴', words: ['人口', '口水'], component: '', imageHint: '嘴巴' },
    { id: 'c_chi', char: '吃', radicalId: 'mouth', structure: '左右', pinyin: 'chī', jyutping: 'hek3', meaning: '把食物放入口中', words: ['吃飯', '吃東西'], component: '乞', imageHint: '吃飯' },
    { id: 'c_jiao', char: '叫', radicalId: 'mouth', structure: '左右', pinyin: 'jiào', jyutping: 'giu3', meaning: '喊叫', words: ['叫聲', '大叫'], component: '丩', imageHint: '叫喊' },
    { id: 'c_chang', char: '唱', radicalId: 'mouth', structure: '左右', pinyin: 'chàng', jyutping: 'coeng3', meaning: '唱歌', words: ['唱歌', '合唱'], component: '昌', imageHint: '唱歌' },
    { id: 'c_wen', char: '問', radicalId: 'mouth', structure: '包圍', pinyin: 'wèn', jyutping: 'man6', meaning: '發問', words: ['問題', '請問'], component: '門', imageHint: '提問' },
    { id: 'c_ku', char: '哭', radicalId: 'mouth', structure: '上下', pinyin: 'kū', jyutping: 'huk1', meaning: '哭泣', words: ['哭聲', '大哭'], component: '犬', imageHint: '哭泣' },
    { id: 'c_gao', char: '告', radicalId: 'mouth', structure: '上下', pinyin: 'gào', jyutping: 'gou3', meaning: '告訴', words: ['告訴', '報告'], component: '牛', imageHint: '告訴' },
    { id: 'c_pin', char: '品', radicalId: 'mouth', structure: '品字形', pinyin: 'pǐn', jyutping: 'ban2', meaning: '物品、品格', words: ['物品', '食品'], component: '口', imageHint: '物品' },
    { id: 'c_hui', char: '回', radicalId: 'mouth', structure: '包圍', pinyin: 'huí', jyutping: 'wui4', meaning: '回來', words: ['回家', '回答'], component: '口', imageHint: '回家' },
    { id: 'c_ha', char: '哈', radicalId: 'mouth', structure: '左右', pinyin: 'hā', jyutping: 'haa1', meaning: '笑聲或語氣詞', words: ['哈哈笑', '哈欠'], component: '合', imageHint: '笑聲' },

    { id: 'c_chong', char: '虫', radicalId: 'insect', structure: '獨體', pinyin: 'chóng', jyutping: 'cung4', meaning: '蟲', words: ['小虫', '昆虫'], component: '', imageHint: '小蟲' },
    { id: 'c_hu', char: '蝴', radicalId: 'insect', structure: '左右', pinyin: 'hú', jyutping: 'wu4', meaning: '蝴蝶的蝴', words: ['蝴蝶'], component: '胡', imageHint: '蝴蝶' },
    { id: 'c_die', char: '蝶', radicalId: 'insect', structure: '左右', pinyin: 'dié', jyutping: 'dip6', meaning: '蝴蝶', words: ['蝴蝶', '彩蝶'], component: '枼', imageHint: '蝴蝶' },
    { id: 'c_feng', char: '蜂', radicalId: 'insect', structure: '左右', pinyin: 'fēng', jyutping: 'fung1', meaning: '蜜蜂', words: ['蜜蜂', '蜂蜜'], component: '夆', imageHint: '蜜蜂' },
    { id: 'c_wen2', char: '蚊', radicalId: 'insect', structure: '左右', pinyin: 'wén', jyutping: 'man1', meaning: '蚊子', words: ['蚊子'], component: '文', imageHint: '蚊子' },
    { id: 'c_yi', char: '蟻', radicalId: 'insect', structure: '左右', pinyin: 'yǐ', jyutping: 'ngai5', meaning: '螞蟻', words: ['螞蟻'], component: '義', imageHint: '螞蟻' },
    { id: 'c_she', char: '蛇', radicalId: 'insect', structure: '左右', pinyin: 'shé', jyutping: 'se4', meaning: '蛇', words: ['小蛇', '蛇皮'], component: '它', imageHint: '蛇' },
    { id: 'c_zhu', char: '蛛', radicalId: 'insect', structure: '左右', pinyin: 'zhū', jyutping: 'zyu1', meaning: '蜘蛛的蛛', words: ['蜘蛛'], component: '朱', imageHint: '蜘蛛' },
    { id: 'c_wa', char: '蛙', radicalId: 'insect', structure: '左右', pinyin: 'wā', jyutping: 'waa1', meaning: '青蛙', words: ['青蛙'], component: '圭', imageHint: '青蛙' },
    { id: 'c_chan', char: '蟬', radicalId: 'insect', structure: '左右', pinyin: 'chán', jyutping: 'sim4', meaning: '蟬', words: ['蟬聲'], component: '單', imageHint: '蟬' }
  ],
  pictureBank: [
    { emoji: '🌳', answer: '木', clue: '一棵樹，也可以表示木頭。' },
    { emoji: '🌲🌲', answer: '林', clue: '兩棵或很多樹在一起。' },
    { emoji: '☀️', answer: '日', clue: '太陽，也是一天。' },
    { emoji: '🌞🌙', answer: '明', clue: '日和月都很亮。' },
    { emoji: '☀️🌈', answer: '晴', clue: '天氣很好，沒有下雨。' },
    { emoji: '👄', answer: '口', clue: '人說話和吃東西的地方。' },
    { emoji: '🍚', answer: '吃', clue: '把飯放入口中。' },
    { emoji: '🎤', answer: '唱', clue: '用口發出好聽的歌聲。' },
    { emoji: '🐛', answer: '虫', clue: '小小的蟲。' },
    { emoji: '🦋', answer: '蝶', clue: '有漂亮翅膀的小昆蟲。' },
    { emoji: '🐝', answer: '蜂', clue: '會採花蜜的小昆蟲。' },
    { emoji: '🐍', answer: '蛇', clue: '身體長長、沒有腳。' }
  ],
  assignments: [
    { id: 'as_1', title: '木部找一找', classId: 'class_1', radicalId: 'wood', gameType: 'find-radical', dueDate: '2026-05-20', createdBy: 'u_teacher', createdAt: '2026-05-06' },
    { id: 'as_2', title: '日部看圖選字', classId: 'class_1', radicalId: 'sun', gameType: 'picture-choice', dueDate: '2026-05-22', createdBy: 'u_teacher', createdAt: '2026-05-06' }
  ],
  progress: [
    { id: 'pr_1', assignmentId: 'as_1', studentId: 'u_student1', completed: true, score: 90, stars: 3, mistakes: [{ char: '梨', radicalId: 'wood', type: 'find-radical', count: 1 }], updatedAt: '2026-05-06' },
    { id: 'pr_2', assignmentId: 'as_1', studentId: 'u_student2', completed: false, score: 0, stars: 0, mistakes: [], updatedAt: '2026-05-06' }
  ],

  competitions: [
    { id: 'comp_1', title: '木部 60 秒挑戰', classId: 'class_1', radicalId: 'wood', durationSeconds: 60, status: 'open', createdAt: '2026-05-06', leaderboard: [
      { studentId: 'u_student1', score: 8, stars: 3, updatedAt: '2026-05-06' },
      { studentId: 'u_student2', score: 5, stars: 2, updatedAt: '2026-05-06' }
    ] }
  ],
  readingPassages: [
    { id: 'read_1', title: '森林裡的學校', level: '小一', radicalId: 'wood', text: '森林裡有一所小學校。校門旁邊有一棵大樹，樹下有小朋友在讀書。', questions: [
      { prompt: '學校在哪裡？', options: ['森林裡', '海邊', '山洞裡'], answer: '森林裡' },
      { prompt: '校門旁邊有什麼？', options: ['大樹', '時鐘', '蜜蜂'], answer: '大樹' }
    ] },
    { id: 'read_2', title: '晴天和晚上', level: '小一', radicalId: 'sun', text: '早上太陽出來了，天氣很晴朗。晚上月亮升起來，小明準備睡覺。', questions: [
      { prompt: '早上的天氣怎樣？', options: ['晴朗', '下雪', '很黑'], answer: '晴朗' },
      { prompt: '晚上誰升起來？', options: ['月亮', '大樹', '小橋'], answer: '月亮' }
    ] }
  ],
  writingPrompts: [
    { id: 'wp_1', title: '用「木」部字寫一句話', prompt: '請用「樹、林、校」其中一個字寫一句完整的話。', keywords: ['樹', '林', '校'] },
    { id: 'wp_2', title: '用「日」部字寫一句話', prompt: '請用「明、晴、時」其中一個字寫一句完整的話。', keywords: ['明', '晴', '時'] }
  ],
  handwritingAttempts: [],
  writingSubmissions: [],
  ocrSubmissions: [],
  parentReports: [],
  subscriptions: [
    { id: 'plan_free', name: 'Free 試用版', price: 0, seats: 10, features: ['學生遊戲', '基本題庫'] },
    { id: 'plan_teacher', name: 'Teacher 班級版', price: 99, seats: 40, features: ['班級管理', '作業報告', '練習紙列印'] },
    { id: 'plan_school', name: 'School 校園版', price: 599, seats: 300, features: ['多班級', '家長週報', 'LMS 串接'] }
  ],
  partnerMaterials: [
    { id: 'pm_1', publisher: '示範出版社', series: '小一識字單元', status: '洽談中', notes: '可把出版社單元映射到部首與題庫。' }
  ],
  integrations: [
    { id: 'int_1', type: 'LMS', name: 'Google Classroom / LTI 1.3', status: 'planned', endpoint: '', notes: '預留 SSO、班級同步與成績回傳。' }
  ],
  aiLogs: [],
  customQuestions: [],
  media: []
};
