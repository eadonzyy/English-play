const TEMPLATES = [
  '{name}正在學「{char}」這個字。',
  '今天我們用「{char}」組成「{word}」這個詞。',
  '小朋友可以在生活中找到「{word}」。',
  '老師請大家用「{char}」說一句完整的話。'
];

const RADICAL_AI_LIBRARY = {
  木: { name: '木部', title: '木部森林', emoji: '🌳', meaning: '多與樹木、木材、植物或木製品有關。', story: '「木」像一棵有樹幹、樹枝和樹根的樹。', origin: ['🌳', '𣎳', '木', '木'] },
  日: { name: '日部', title: '日部太陽島', emoji: '☀️', meaning: '多與太陽、時間、明暗、天氣有關。', story: '「日」原本像太陽，中間一點表示太陽的光。', origin: ['☀️', '⊙', '日', '日'] },
  口: { name: '口部', title: '口部聲音村', emoji: '👄', meaning: '多與嘴巴、說話、聲音、吃喝、語氣有關。', story: '「口」像人的嘴巴，也常用來表示說話或聲音。', origin: ['👄', '□', '口', '口'] },
  虫: { name: '虫部', title: '虫部昆蟲谷', emoji: '🐛', meaning: '多與蛇、昆蟲或小動物有關。', story: '「虫」古時像蛇或蟲的形狀，後來常用於昆蟲相關漢字。', origin: ['🐛', '𧈧', '虫', '虫'] },
  水: { name: '水部', title: '水部河流島', emoji: '💧', meaning: '多與水、河流、液體、清洗或天氣有關。', story: '「水」像水流分成幾道的樣子，三點水「氵」是常見變形。', origin: ['💧', '川', '水', '氵'] },
  火: { name: '火部', title: '火部光熱谷', emoji: '🔥', meaning: '多與火焰、光、熱、燃燒或煮食有關。', story: '「火」像火苗向上燃燒的樣子。', origin: ['🔥', '火', '火', '灬'] },
  土: { name: '土部', title: '土部大地村', emoji: '🟫', meaning: '多與土地、地方、建築或地面有關。', story: '「土」像地上冒出的土堆，也表示土地。', origin: ['⛰️', '土', '土', '土'] },
  艸: { name: '艸部', title: '草部花園', emoji: '🌿', meaning: '多與草木、花卉、植物或蔬菜有關。', story: '「艸」像兩棵小草，常寫作草字頭「艹」。', origin: ['🌿', '艸', '艹', '艹'] },
  女: { name: '女部', title: '女部家庭村', emoji: '👧', meaning: '多與女性、親屬或人的稱呼有關。', story: '「女」古字像跪坐的人形，後來用作女性相關部首。', origin: ['👧', '女', '女', '女'] },
  人: { name: '人部', title: '人部朋友街', emoji: '🧒', meaning: '多與人、動作、身份或性格有關。', story: '「人」像一個側身站立的人，單人旁「亻」是常見變形。', origin: ['🧒', '人', '人', '亻'] },
  心: { name: '心部', title: '心部感受屋', emoji: '❤️', meaning: '多與心情、想法、感受或意志有關。', story: '「心」古字像心臟形狀，豎心旁「忄」是常見變形。', origin: ['❤️', '心', '心', '忄'] },
  手: { name: '手部', title: '手部動作場', emoji: '✋', meaning: '多與手部動作、拿取、拍打或操作有關。', story: '「手」像手掌和手指，提手旁「扌」是常見變形。', origin: ['✋', '手', '手', '扌'] },
  言: { name: '言部', title: '言部說話城', emoji: '💬', meaning: '多與語言、說話、請求、閱讀或記錄有關。', story: '「言」表示說出的話，言字旁「訁」是常見簡化或變形。', origin: ['💬', '言', '言', '訁'] },
  足: { name: '足部', title: '足部運動場', emoji: '🦶', meaning: '多與腳、行走、跑跳或運動有關。', story: '「足」表示腳，也表示足夠。', origin: ['🦶', '足', '足', '𧾷'] },
  金: { name: '金部', title: '金部寶藏山', emoji: '🔔', meaning: '多與金屬、錢幣、工具或聲音有關。', story: '「金」本指金屬，金字旁「釒」常見於金屬相關字。', origin: ['🔔', '金', '金', '釒'] },
  目: { name: '目部', title: '目部觀察台', emoji: '👀', meaning: '多與眼睛、觀看、睡眠或視覺有關。', story: '「目」像一隻眼睛。', origin: ['👀', '目', '目', '目'] },
  月: { name: '月部', title: '月部身體島', emoji: '🌙', meaning: '可與月亮、時間有關，也常與身體部位有關。', story: '「月」像月亮；作肉月旁時常表示身體。', origin: ['🌙', '月', '月', '月'] },
  門: { name: '門部', title: '門部房屋城', emoji: '🚪', meaning: '多與門、房屋、開關或出入有關。', story: '「門」像兩扇門。', origin: ['🚪', '門', '門', '門'] },
  犬: { name: '犬部', title: '犬部動物園', emoji: '🐶', meaning: '多與狗、獸類或動物有關。', story: '「犬」像狗的形狀，反犬旁「犭」常見於動物相關字。', origin: ['🐶', '犬', '犬', '犭'] },
  魚: { name: '魚部', title: '魚部海洋館', emoji: '🐟', meaning: '多與魚類或水中動物有關。', story: '「魚」古字像魚的形狀。', origin: ['🐟', '魚', '魚', '魚'] },
  鳥: { name: '鳥部', title: '鳥部天空林', emoji: '🐦', meaning: '多與鳥類或飛行動物有關。', story: '「鳥」古字像有頭、身、翅和尾巴的鳥。', origin: ['🐦', '鳥', '鳥', '鳥'] },
  車: { name: '車部', title: '車部交通城', emoji: '🚗', meaning: '多與車輛、輪子或交通有關。', story: '「車」古字像有輪子的車。', origin: ['🚗', '車', '車', '車'] },
  雨: { name: '雨部', title: '雨部天氣站', emoji: '🌧️', meaning: '多與雨雪雷電、雲霧或天氣有關。', story: '「雨」像天空落下雨點。', origin: ['🌧️', '雨', '雨', '雨'] },
  食: { name: '食部', title: '食部美味屋', emoji: '🍚', meaning: '多與食物、飲食或飢飽有關。', story: '「食」表示吃飯與食物。', origin: ['🍚', '食', '食', '飠'] },
  貝: { name: '貝部', title: '貝部財寶灣', emoji: '🐚', meaning: '多與財物、買賣、價值或貝殼有關。', story: '古代曾用貝殼作貨幣，所以「貝」常與錢財有關。', origin: ['🐚', '貝', '貝', '貝'] },
  糸: { name: '糸部', title: '糸部織線坊', emoji: '🧵', meaning: '多與絲線、織物、連接或顏色有關。', story: '「糸」像一束絲線，絞絲旁「糹」常用於線織相關字。', origin: ['🧵', '糸', '糹', '糹'] }
};

const CHAR_AI_LIBRARY = {
  木: { radicalKey: '木', structure: '獨體', pinyin: 'mù', jyutping: 'muk6', meaning: '樹木、木材', words: ['木頭', '木馬', '樹木'], component: '', imageHint: '樹木' },
  林: { radicalKey: '木', structure: '左右', pinyin: 'lín', jyutping: 'lam4', meaning: '很多樹木', words: ['森林', '樹林'], component: '木', imageHint: '樹林' },
  森: { radicalKey: '木', structure: '品字形', pinyin: 'sēn', jyutping: 'sam1', meaning: '樹很多', words: ['森林', '森嚴'], component: '林', imageHint: '森林' },
  村: { radicalKey: '木', structure: '左右', pinyin: 'cūn', jyutping: 'cyun1', meaning: '村莊', words: ['村子', '鄉村'], component: '寸', imageHint: '村莊' },
  校: { radicalKey: '木', structure: '左右', pinyin: 'xiào', jyutping: 'haau6', meaning: '學校', words: ['學校', '校園'], component: '交', imageHint: '學校' },
  樹: { radicalKey: '木', structure: '左右', pinyin: 'shù', jyutping: 'syu6', meaning: '樹木', words: ['大樹', '樹枝'], component: '尌', imageHint: '大樹' },
  日: { radicalKey: '日', structure: '獨體', pinyin: 'rì', jyutping: 'jat6', meaning: '太陽、日子', words: ['日子', '生日'], component: '', imageHint: '太陽' },
  早: { radicalKey: '日', structure: '上下', pinyin: 'zǎo', jyutping: 'zou2', meaning: '早上', words: ['早安', '早上'], component: '十', imageHint: '早晨' },
  明: { radicalKey: '日', structure: '左右', pinyin: 'míng', jyutping: 'ming4', meaning: '明亮', words: ['明天', '明亮'], component: '月', imageHint: '日月明' },
  晴: { radicalKey: '日', structure: '左右', pinyin: 'qíng', jyutping: 'cing4', meaning: '天氣晴朗', words: ['晴天', '晴朗'], component: '青', imageHint: '晴天' },
  口: { radicalKey: '口', structure: '獨體', pinyin: 'kǒu', jyutping: 'hau2', meaning: '嘴巴', words: ['人口', '口水'], component: '', imageHint: '嘴巴' },
  吃: { radicalKey: '口', structure: '左右', pinyin: 'chī', jyutping: 'hek3', meaning: '把食物放入口中', words: ['吃飯', '吃東西'], component: '乞', imageHint: '吃飯' },
  叫: { radicalKey: '口', structure: '左右', pinyin: 'jiào', jyutping: 'giu3', meaning: '喊叫', words: ['叫聲', '大叫'], component: '丩', imageHint: '叫喊' },
  唱: { radicalKey: '口', structure: '左右', pinyin: 'chàng', jyutping: 'coeng3', meaning: '唱歌', words: ['唱歌', '合唱'], component: '昌', imageHint: '唱歌' },
  問: { radicalKey: '口', structure: '包圍', pinyin: 'wèn', jyutping: 'man6', meaning: '發問', words: ['問題', '請問'], component: '門', imageHint: '提問' },
  虫: { radicalKey: '虫', structure: '獨體', pinyin: 'chóng', jyutping: 'cung4', meaning: '蟲', words: ['小虫', '昆虫'], component: '', imageHint: '小蟲' },
  蝴: { radicalKey: '虫', structure: '左右', pinyin: 'hú', jyutping: 'wu4', meaning: '蝴蝶的蝴', words: ['蝴蝶'], component: '胡', imageHint: '蝴蝶' },
  蝶: { radicalKey: '虫', structure: '左右', pinyin: 'dié', jyutping: 'dip6', meaning: '蝴蝶', words: ['蝴蝶', '彩蝶'], component: '枼', imageHint: '蝴蝶' },
  蜂: { radicalKey: '虫', structure: '左右', pinyin: 'fēng', jyutping: 'fung1', meaning: '蜜蜂', words: ['蜜蜂', '蜂蜜'], component: '夆', imageHint: '蜜蜂' },
  水: { radicalKey: '水', structure: '獨體', pinyin: 'shuǐ', jyutping: 'seoi2', meaning: '水、液體', words: ['水杯', '喝水', '雨水'], component: '', imageHint: '水滴' },
  河: { radicalKey: '水', structure: '左右', pinyin: 'hé', jyutping: 'ho4', meaning: '河流', words: ['河水', '小河'], component: '可', imageHint: '河流' },
  海: { radicalKey: '水', structure: '左右', pinyin: 'hǎi', jyutping: 'hoi2', meaning: '大海', words: ['大海', '海邊'], component: '每', imageHint: '海洋' },
  湖: { radicalKey: '水', structure: '左右', pinyin: 'hú', jyutping: 'wu4', meaning: '湖泊', words: ['湖水', '西湖'], component: '胡', imageHint: '湖泊' },
  清: { radicalKey: '水', structure: '左右', pinyin: 'qīng', jyutping: 'cing1', meaning: '清潔、清楚', words: ['清水', '清楚'], component: '青', imageHint: '清水' },
  火: { radicalKey: '火', structure: '獨體', pinyin: 'huǒ', jyutping: 'fo2', meaning: '火焰', words: ['火山', '大火'], component: '', imageHint: '火焰' },
  炎: { radicalKey: '火', structure: '上下', pinyin: 'yán', jyutping: 'jim4', meaning: '很熱', words: ['炎熱', '發炎'], component: '火', imageHint: '火很旺' },
  熱: { radicalKey: '火', structure: '上下', pinyin: 'rè', jyutping: 'jit6', meaning: '溫度高', words: ['熱水', '炎熱'], component: '埶', imageHint: '熱天' },
  燈: { radicalKey: '火', structure: '左右', pinyin: 'dēng', jyutping: 'dang1', meaning: '照明工具', words: ['電燈', '燈光'], component: '登', imageHint: '燈光' },
  草: { radicalKey: '艸', structure: '上下', pinyin: 'cǎo', jyutping: 'cou2', meaning: '小草', words: ['小草', '青草'], component: '早', imageHint: '草地' },
  花: { radicalKey: '艸', structure: '上下', pinyin: 'huā', jyutping: 'faa1', meaning: '花朵', words: ['花朵', '花園'], component: '化', imageHint: '花' },
  茶: { radicalKey: '艸', structure: '上下', pinyin: 'chá', jyutping: 'caa4', meaning: '茶葉或茶水', words: ['喝茶', '茶葉'], component: '余', imageHint: '茶杯' },
  好: { radicalKey: '女', structure: '左右', pinyin: 'hǎo', jyutping: 'hou2', meaning: '美好、可以', words: ['好人', '好朋友'], component: '子', imageHint: '好朋友' },
  媽: { radicalKey: '女', structure: '左右', pinyin: 'mā', jyutping: 'maa1', meaning: '媽媽', words: ['媽媽', '媽咪'], component: '馬', imageHint: '媽媽' },
  妹: { radicalKey: '女', structure: '左右', pinyin: 'mèi', jyutping: 'mui6', meaning: '妹妹', words: ['妹妹'], component: '未', imageHint: '妹妹' },
  你: { radicalKey: '人', structure: '左右', pinyin: 'nǐ', jyutping: 'nei5', meaning: '第二人稱', words: ['你好', '你們'], component: '爾', imageHint: '朋友打招呼' },
  他: { radicalKey: '人', structure: '左右', pinyin: 'tā', jyutping: 'taa1', meaning: '第三人稱', words: ['他們', '他人'], component: '也', imageHint: '一個人' },
  們: { radicalKey: '人', structure: '左右', pinyin: 'men', jyutping: 'mun4', meaning: '表示多人', words: ['我們', '你們'], component: '門', imageHint: '很多人' },
  想: { radicalKey: '心', structure: '上下', pinyin: 'xiǎng', jyutping: 'soeng2', meaning: '思考、希望', words: ['想法', '想念'], component: '相', imageHint: '想一想' },
  忙: { radicalKey: '心', structure: '左右', pinyin: 'máng', jyutping: 'mong4', meaning: '事情多', words: ['很忙', '忙碌'], component: '亡', imageHint: '忙碌' },
  打: { radicalKey: '手', structure: '左右', pinyin: 'dǎ', jyutping: 'daa2', meaning: '用手拍擊或做動作', words: ['打球', '打開'], component: '丁', imageHint: '打球' },
  抱: { radicalKey: '手', structure: '左右', pinyin: 'bào', jyutping: 'pou5', meaning: '用手臂抱住', words: ['擁抱', '抱住'], component: '包', imageHint: '擁抱' },
  掃: { radicalKey: '手', structure: '左右', pinyin: 'sǎo', jyutping: 'sou3', meaning: '清掃', words: ['掃地', '打掃'], component: '帚', imageHint: '掃地' },
  話: { radicalKey: '言', structure: '左右', pinyin: 'huà', jyutping: 'waa6', meaning: '說出的語句', words: ['說話', '電話'], component: '舌', imageHint: '說話' },
  說: { radicalKey: '言', structure: '左右', pinyin: 'shuō', jyutping: 'syut3', meaning: '講話', words: ['說話', '小說'], component: '兌', imageHint: '說話' },
  請: { radicalKey: '言', structure: '左右', pinyin: 'qǐng', jyutping: 'cing2', meaning: '有禮貌地要求', words: ['請問', '請坐'], component: '青', imageHint: '請坐' },
  跑: { radicalKey: '足', structure: '左右', pinyin: 'pǎo', jyutping: 'paau2', meaning: '快走', words: ['跑步', '跑道'], component: '包', imageHint: '跑步' },
  跳: { radicalKey: '足', structure: '左右', pinyin: 'tiào', jyutping: 'tiu3', meaning: '跳起來', words: ['跳高', '跳舞'], component: '兆', imageHint: '跳躍' },
  路: { radicalKey: '足', structure: '左右', pinyin: 'lù', jyutping: 'lou6', meaning: '道路', words: ['馬路', '道路'], component: '各', imageHint: '道路' },
  錢: { radicalKey: '金', structure: '左右', pinyin: 'qián', jyutping: 'cin4', meaning: '貨幣', words: ['金錢', '零錢'], component: '戔', imageHint: '錢幣' },
  銀: { radicalKey: '金', structure: '左右', pinyin: 'yín', jyutping: 'ngan4', meaning: '銀色金屬', words: ['銀行', '銀色'], component: '艮', imageHint: '銀色' },
  地: { radicalKey: '土', structure: '左右', pinyin: 'dì', jyutping: 'dei6', meaning: '土地、地方', words: ['土地', '地方'], component: '也', imageHint: '地面' },
  城: { radicalKey: '土', structure: '左右', pinyin: 'chéng', jyutping: 'sing4', meaning: '城市、城牆', words: ['城市', '城堡'], component: '成', imageHint: '城市' },
  睛: { radicalKey: '目', structure: '左右', pinyin: 'jīng', jyutping: 'zing1', meaning: '眼珠', words: ['眼睛'], component: '青', imageHint: '眼睛' },
  看: { radicalKey: '目', structure: '上下', pinyin: 'kàn', jyutping: 'hon3', meaning: '觀看', words: ['看見', '看看'], component: '手', imageHint: '看東西' },
  朋: { radicalKey: '月', structure: '左右', pinyin: 'péng', jyutping: 'pang4', meaning: '朋友', words: ['朋友'], component: '月', imageHint: '朋友' },
  腳: { radicalKey: '月', structure: '左右', pinyin: 'jiǎo', jyutping: 'goek3', meaning: '腳', words: ['雙腳', '腳步'], component: '卻', imageHint: '腳' },
  門: { radicalKey: '門', structure: '獨體', pinyin: 'mén', jyutping: 'mun4', meaning: '房屋出入口', words: ['大門', '門口'], component: '', imageHint: '門' },
  間: { radicalKey: '門', structure: '包圍', pinyin: 'jiān', jyutping: 'gaan1', meaning: '中間、房間', words: ['中間', '房間'], component: '日', imageHint: '房間' },
  狗: { radicalKey: '犬', structure: '左右', pinyin: 'gǒu', jyutping: 'gau2', meaning: '狗', words: ['小狗', '狗兒'], component: '句', imageHint: '小狗' },
  貓: { radicalKey: '犬', structure: '左右', pinyin: 'māo', jyutping: 'maau1', meaning: '貓', words: ['小貓', '貓咪'], component: '苗', imageHint: '小貓' },
  魚: { radicalKey: '魚', structure: '獨體', pinyin: 'yú', jyutping: 'jyu4', meaning: '魚類', words: ['小魚', '魚兒'], component: '', imageHint: '魚' },
  鳥: { radicalKey: '鳥', structure: '獨體', pinyin: 'niǎo', jyutping: 'niu5', meaning: '鳥類', words: ['小鳥', '鳥兒'], component: '', imageHint: '小鳥' },
  車: { radicalKey: '車', structure: '獨體', pinyin: 'chē', jyutping: 'ce1', meaning: '車輛', words: ['汽車', '火車'], component: '', imageHint: '車' },
  雷: { radicalKey: '雨', structure: '上下', pinyin: 'léi', jyutping: 'leoi4', meaning: '打雷', words: ['雷聲', '雷雨'], component: '田', imageHint: '雷雨' },
  雪: { radicalKey: '雨', structure: '上下', pinyin: 'xuě', jyutping: 'syut3', meaning: '雪花', words: ['下雪', '白雪'], component: '彐', imageHint: '雪花' },
  飯: { radicalKey: '食', structure: '左右', pinyin: 'fàn', jyutping: 'faan6', meaning: '米飯、吃飯', words: ['吃飯', '米飯'], component: '反', imageHint: '飯碗' },
  餓: { radicalKey: '食', structure: '左右', pinyin: 'è', jyutping: 'ngo6', meaning: '肚子想吃東西', words: ['肚餓', '很餓'], component: '我', imageHint: '肚子餓' },
  買: { radicalKey: '貝', structure: '上下', pinyin: 'mǎi', jyutping: 'maai5', meaning: '購買', words: ['買東西', '買書'], component: '罒', imageHint: '買東西' },
  紅: { radicalKey: '糸', structure: '左右', pinyin: 'hóng', jyutping: 'hung4', meaning: '紅色', words: ['紅色', '紅花'], component: '工', imageHint: '紅色' },
  線: { radicalKey: '糸', structure: '左右', pinyin: 'xiàn', jyutping: 'sin3', meaning: '線條', words: ['毛線', '直線'], component: '泉', imageHint: '線' }
};

const RADICAL_DETECTORS = [
  { key: '水', tests: ['氵', '水', '河', '海', '湖', '清', '洗', '法', '洋', '沙', '江', '流', '油', '港', '灣'] },
  { key: '火', tests: ['火', '灬', '炎', '熱', '燈', '煙', '煮', '照', '然', '熟', '烤', '燒'] },
  { key: '艸', tests: ['艹', '草', '花', '茶', '苗', '英', '菜', '蘋', '荷', '落', '葉', '藍'] },
  { key: '木', tests: ['木', '林', '森', '村', '校', '樹', '杏', '梨', '棉', '橋', '桌', '板', '枝', '根', '桃'] },
  { key: '日', tests: ['日', '早', '明', '晴', '晚', '春', '時', '暑', '晶', '晨', '星', '映'] },
  { key: '口', tests: ['口', '吃', '叫', '唱', '問', '哭', '告', '品', '回', '哈', '喝', '哪', '嗎'] },
  { key: '虫', tests: ['虫', '蝴', '蝶', '蜂', '蚊', '蟻', '蛇', '蛛', '蛙', '蟬', '螞'] },
  { key: '女', tests: ['女', '好', '媽', '妹', '姐', '娃', '奶', '她', '姓', '姑'] },
  { key: '人', tests: ['亻', '人', '你', '他', '們', '作', '住', '休', '信', '但', '位'] },
  { key: '心', tests: ['心', '忄', '想', '念', '忙', '怕', '快', '情', '意', '愛', '怒'] },
  { key: '手', tests: ['扌', '手', '打', '抱', '掃', '找', '拉', '推', '拍', '提', '指'] },
  { key: '言', tests: ['言', '訁', '話', '說', '語', '請', '讀', '課', '謝', '詩', '記'] },
  { key: '足', tests: ['足', '𧾷', '跑', '跳', '路', '踢', '跟', '跌', '蹦'] },
  { key: '金', tests: ['金', '釒', '錢', '銀', '針', '銅', '鐵', '鈴', '錯', '鐘'] },
  { key: '土', tests: ['土', '地', '城', '場', '坡', '坐', '壞', '塔', '堆'] },
  { key: '目', tests: ['目', '看', '睛', '眼', '睡', '相', '盯', '眉', '瞧'] },
  { key: '月', tests: ['月', '朋', '腳', '臉', '腦', '肚', '腰', '肩', '背'] },
  { key: '門', tests: ['門', '問', '間', '閃', '開', '閉', '閒', '闊'] },
  { key: '犬', tests: ['犭', '犬', '狗', '貓', '狼', '猴', '獅', '獸', '狐'] },
  { key: '魚', tests: ['魚', '鯨', '鯉', '鮮', '鯊', '鰻'] },
  { key: '鳥', tests: ['鳥', '雞', '鴨', '鵝', '鷹', '鳴'] },
  { key: '車', tests: ['車', '輪', '輕', '轉', '載', '軟', '軍'] },
  { key: '雨', tests: ['雨', '雷', '雪', '雲', '霧', '霜', '露'] },
  { key: '食', tests: ['食', '飠', '飯', '餓', '飲', '餅', '餐', '飽'] },
  { key: '貝', tests: ['貝', '買', '賣', '財', '貨', '貴', '費', '贏'] },
  { key: '糸', tests: ['糸', '糹', '紅', '線', '紙', '綠', '經', '給', '絨'] }
];

function firstHan(value = '') {
  return [...String(value).trim()].find(ch => /[\u3400-\u9fff]/.test(ch)) || String(value).trim().slice(0, 1);
}

function detectRadicalKey(char = '') {
  const c = firstHan(char);
  const exact = CHAR_AI_LIBRARY[c]?.radicalKey;
  if (exact) return exact;
  const hit = RADICAL_DETECTORS.find(rule => rule.tests.some(token => c.includes(token) || token === c));
  return hit?.key || c;
}

function guessStructure(char = '', radicalKey = '') {
  const c = firstHan(char);
  if (!c || c === radicalKey) return '獨體';
  if (['問', '間', '回', '國', '園', '圖', '閃', '開', '閉'].includes(c)) return '包圍';
  if (['草', '花', '茶', '早', '看', '想', '雪', '雷', '買', '熱', '炎'].includes(c)) return '上下';
  if (['森', '晶', '品'].includes(c)) return '品字形';
  return '左右';
}

function fallbackComponent(char = '', radicalKey = '') {
  const c = firstHan(char);
  if (!c || c === radicalKey) return '';
  const candidates = ['木', '日', '口', '虫', '水', '火', '土', '女', '人', '心', '手', '言', '足', '金', '目', '月', '門', '犬', '魚', '鳥', '車', '雨', '食', '貝', '糸'];
  return candidates.includes(radicalKey) ? '' : radicalKey;
}

function radicalSuggestion(key = '') {
  const clean = firstHan(key);
  const match = RADICAL_AI_LIBRARY[clean] || RADICAL_AI_LIBRARY[detectRadicalKey(clean)];
  if (match) return { key: clean, ...match, origin: [...match.origin] };
  return {
    key: clean,
    name: clean ? `${clean}部` : '新部首',
    title: clean ? `${clean}部識字島` : '新部首識字島',
    emoji: '🔤',
    meaning: clean ? `多與「${clean}」相關的字義、事物或動作有關。` : '請補充此部首常見意思。',
    story: clean ? `「${clean}」是常見漢字部件，可用來幫助學生理解字形和字義。` : '請補充字源故事。',
    origin: clean ? [clean, clean, clean] : []
  };
}

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
  matchRadical(key = '') {
    return radicalSuggestion(key);
  },
  matchCharacter(char = '', radicals = [], characters = []) {
    const clean = firstHan(char);
    const existing = characters.find(item => item.char === clean);
    const known = CHAR_AI_LIBRARY[clean] || {};
    const radicalKey = known.radicalKey || existing?.radicalKey || detectRadicalKey(clean);
    const radical = radicals.find(item => item.key === radicalKey) || radicals.find(item => item.id === existing?.radicalId);
    const words = known.words || existing?.words || (clean ? [`${clean}字`] : []);
    return {
      char: clean,
      radicalId: radical?.id || existing?.radicalId || '',
      radicalKey,
      structure: known.structure || existing?.structure || guessStructure(clean, radicalKey),
      pinyin: known.pinyin || existing?.pinyin || '',
      jyutping: known.jyutping || existing?.jyutping || '',
      meaning: known.meaning || existing?.meaning || (clean ? `與「${radical?.name || radicalKey + '部'}」相關的漢字。` : ''),
      words,
      component: known.component ?? existing?.component ?? fallbackComponent(clean, radicalKey),
      imageHint: known.imageHint || existing?.imageHint || words[0] || clean,
      confidence: known.meaning ? 'high' : 'medium',
      missingRadical: Boolean(radicalKey && !radical)
    };
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
