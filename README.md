# 字源小學堂｜中文識字遊戲平台 v2

這是一個可以直接放到 GitHub Pages 的前端版本，資料先存於瀏覽器 `localStorage`，後續可逐步升級為後端 API、資料庫、AI 服務、OCR 服務與學校 LMS 串接。

## 已完成範圍

### 第一階段 MVP

- 學生端：登入、學習地圖、木/日/口/虫 四個部首、每個部首 8-12 個漢字、找部首遊戲、拖拉組字、看圖選字、錯題本、星星獎勵。
- 老師端：建立班級、新增學生、指派練習、查看完成情況、查看錯題統計。
- 管理端：新增漢字、新增部首、新增題目、上傳圖片、上傳音頻。

### 第二階段功能

- 筆順描紅：學生可在 Canvas 上描紅並保存基礎手寫分。
- 語音朗讀：使用瀏覽器 Web Speech API，支援普通話、粵語、注音顯示切換。
- 自動生成練習紙：老師可生成可列印練習紙，透過瀏覽器「列印 / 另存 PDF」。
- 班級競賽模式：老師建立限時挑戰，學生端參與並刷新排行榜。
- 家長週報：老師可生成可複製、可列印的家長週報。
- AI 生成例句：使用本地模板生成例句，預留後端 AI API 接口。
- AI 錯題推薦：根據錯題記錄生成重練建議。
- 多語音標：普通話拼音、粵語粵拼、注音切換。
- 學校多班級管理：管理學校、班級、席位與方案。
- 付費訂閱方案：本地管理 Free、Teacher、School 等方案。

### 第三階段預留功能

- OCR 批改紙本作業：已提供作業圖片上傳、OCR/人工校正文字與分數記錄。
- 手寫識別：描紅模組已可記錄手寫嘗試，後續可接入筆畫級識別模型。
- 閱讀理解：學生端有短文問答，管理端可新增短文。
- 小作文練習：學生端可寫一句話/短段落，並獲得本地 AI 評語。
- 教材出版社合作：管理端可記錄出版社、教材系列與合作狀態。
- 學校版 LMS 串接：管理端預留 LMS/SSO/成績回傳設定。

## Demo 帳號

| 角色 | 帳號 | 密碼 |
|---|---|---|
| 學生 | `student1` | `123456` |
| 老師 | `teacher` | `123456` |
| 管理員 | `admin` | `123456` |
| 家長 | `parent` | `123456` |

## 本機運行

直接打開 `index.html` 即可。如果瀏覽器限制 ES Module，使用本機伺服器：

```bash
cd chinese-learning-mvp-v2
python3 -m http.server 8080
```

然後打開：

```text
http://localhost:8080
```

## 測試

本包已包含靜態冒煙測試，會檢查所有 JavaScript 語法、模組引用、資料種子、路由配置和核心工具函數：

```bash
cd chinese-learning-mvp-v2
node tests/static-smoke.mjs
```

已在打包前執行通過：

```text
Static smoke test passed: 18 JS files checked, seed v2 verified.
```

也已使用本機 HTTP server 驗證 `index.html` 可正常返回 `200 OK`。

## GitHub Pages 發布

1. 建立 GitHub repo。
2. 把本資料夾內全部文件推送到 repo 根目錄。
3. 到 Settings → Pages。
4. Source 選擇 `Deploy from a branch`。
5. Branch 選擇 `main`，Folder 選擇 `/root`。
6. 保存後等待 GitHub Pages 生成網址。

## 後續升級方向

目前所有資料在 `localStorage`。升級正式版時，建議把以下位置替換為 API：

- `assets/js/core/store.js`：替換為後端資料讀寫。
- `assets/js/utils/ai.js`：替換為後端 AI 生成、評語和推薦接口。
- `assets/js/utils/worksheet.js`：替換為後端 PDF 生成服務。
- `assets/js/views/teacherPlus.js` 的 OCR 模組：替換為 OCR 引擎，例如自建 OCR 服務。
- `assets/js/views/adminPlus.js` 的 LMS 模組：替換為 LTI 1.3、SSO、Roster Sync、Grade Passback。

## 主要文件結構

```text
assets/
  css/styles.css
  js/
    app.js
    core/          # store/auth/router
    data/seed.js   # 初始資料
    utils/         # 語音、注音、AI、練習紙生成
    views/         # 學生、老師、管理員、家長畫面
docs/
  DATA_MODEL.md
  UPGRADE_ROADMAP.md
tests/
  static-smoke.mjs
index.html
```

## v2.1 更新：內容管理增強

本版本在管理端加入以下功能：

- 漢字管理：已新增「修改」按鈕，可編輯已建立的漢字資料。
- 部首管理：已新增「修改」按鈕，可編輯已建立的部首資料。
- 新增部首：輸入「部首字」後，可按「AI自動匹配」，自動補全名稱、學習地圖標題、Emoji、意思、字源故事與字源演變。
- 新增漢字：輸入「漢字」後，可按「AI自動匹配」，自動補全部首、結構、拼音、粵拼、組字部件、意思、詞語與圖片提示。
- AI 匹配目前使用前端內置教育字庫與規則引擎，不需要伺服器和 API Key，方便直接放到 GitHub Pages。日後可把 `assets/js/utils/ai.js` 換成後端 API 版本。

如果瀏覽器之前已經打開過舊版，因 localStorage 會保存舊資料；更新代碼後功能會生效，但資料仍沿用舊資料。需要恢復示範資料時，可在登入頁或瀏覽器 DevTools 清除 `zixue_db_v2`。
