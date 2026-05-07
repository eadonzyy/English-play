# 資料模型摘要

目前資料存於 `assets/js/data/seed.js` 並由 `assets/js/core/store.js` 寫入 `localStorage`。

## 核心資料

- `users`：管理員、老師、學生、家長帳號。
- `schools`：學校、方案、席位、狀態。
- `classes`：班級、所屬學校、老師、學生列表。
- `radicals`：部首、名稱、字源故事、地圖主題。
- `characters`：漢字、部首、結構、拼音、粵拼、意思、詞語、組字部件。
- `assignments`：老師指派練習。
- `progress`：學生完成情況、分數、星星、錯題。

## 第二階段資料

- `competitions`：班級競賽和排行榜。
- `parentReports`：家長週報生成記錄。
- `handwritingAttempts`：描紅/手寫嘗試。
- `subscriptions`：付費方案與功能。
- `aiLogs`：AI 生成例句記錄。

## 第三階段資料

- `ocrSubmissions`：紙本作業 OCR/人工校正記錄。
- `readingPassages`：閱讀理解短文和問題。
- `writingPrompts`：小作文題目。
- `writingSubmissions`：學生作文提交。
- `partnerMaterials`：出版社合作資料。
- `integrations`：LMS/SSO/成績回傳設定。

## 正式資料庫建議

正式版建議拆成 PostgreSQL 資料表：

- organizations/schools
- users/classes/class_members
- radicals/characters/words/media
- questions/assignments/submissions/mistakes
- competitions/leaderboards
- parent_reports
- ai_generations
- ocr_jobs/handwriting_attempts
- subscriptions/invoices
- lms_integrations
