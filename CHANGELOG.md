# 更新日誌 (CHANGELOG) - GitHub 版本

本檔案記錄 GitHub 發布版本的所有重要變更。

## 版本格式說明
- **[新增]** - 新功能
- **[修正]** - Bug 修復
- **[變更]** - 既有功能的變更
- **[移除]** - 移除的功能
- **[部署]** - 部署相關資訊

---

## [v1.0.3-github] - 2026-02-01

### [新增]
- **搖擺X分頁功能**
  - 新增搖擺X分頁支援（欄位 1-32 與超超代相同）
  - 新增欄位 33-36：圖檔索引（格式：圖檔名稱;數量）
  - 新增欄位 37：版本（位置調整）
  - 道具需求顯示區塊（圖片 40px × 40px）
  - 道具數量顯示（例如：x 1, x 2）

- **版本篩選功能優化**
  - 動態從資料中提取版本選項
  - 自動排除重複版本
  - 自動排除空白值
  - 版本自動排序
  - 沒有版本時不顯示篩選器
  - 適用於「超超代」和「搖擺X」分頁

- **介紹頁面圖檔索引功能**
  - 搖擺X介紹頁面支援圖檔索引
  - 表格內圖片自動偵測與顯示
  - 支援圖片副檔名偵測（jpg, jpeg, png, gif, webp, bmp）
  - 支援 `/images` 路徑偵測
  - 表格內圖片最大尺寸 100px × 100px

### [變更]
- `processDetailData()` 函式新增 `sheetName` 參數
- `addVersionFilter()` 函式改為動態提取版本
- `loadAndDisplayIntro()` 函式傳遞 `sheet` 參數以支援圖檔索引
- 表格渲染邏輯新增圖片偵測與顯示
- 簡化 README.md（僅保留標題和網站連結）

### [修正]
- 修復介紹頁面表格內圖片無法顯示的問題
- 修復圖片路徑處理邏輯

### [樣式]
- 新增 `.item-images-section` 樣式（道具區塊）
- 新增 `.item-images-grid` 樣式（網格布局）
- 新增 `.item-image-box` 樣式（道具容器，含 hover 效果）
- 新增 `.item-image` 樣式（圖片 40px × 40px）
- 新增 `.item-quantity` 樣式（數量文字）
- 新增 `.intro-table-image` 樣式（表格內圖片）

---

## [v1.0.2-github] - 2026-01-31

### [變更]
- **標題最終調整**
  - 簡化標題為「對打機資料庫」
  - 更新歡迎訊息為「歡迎使用對打機資料庫」
  - 統一所有頁面標題

### [定版]
- 建立 Git tag: v1.0.1-github
- 完成最終備份
- 標記為穩定版本

---

## [v1.0.1-github] - 2026-01-31

### [新增]
- **更新流程文件**
  - 新增完整的 GitHub 更新流程指南
  - 包含四種更新情境（資料、程式碼、圖片、混合）
  - 提供快速指令參考
  - Commit 訊息建議
  - 常見問題解答

---

## [v1.0-github] - 2026-01-31

### [新增]
- **自動載入 JSON 資料功能**
  - 網頁啟動時自動載入 `data/sample-data.json`
  - 無需手動上傳 Excel 檔案
  - 使用 `fetch()` API 讀取本地 JSON
  - 自動轉換 JSON 為 workbook 格式
  - 支援靜默失敗，載入失敗時顯示歡迎畫面

- **Excel 轉 JSON 工具**
  - Node.js 版本轉換工具 (`tools/convert-to-json.js`)
  - 瀏覽器版本轉換工具 (`tools/converter.html`)
  - Python 版本轉換工具 (`tools/convert-excel-to-json.py`)
  - 支援自動轉換所有工作表
  - 輸出格式化 JSON（2 空格縮排）

- **完整的文件系統**
  - README.md - 完整使用說明
  - GitHub Pages 部署指南
  - .gitignore - Git 忽略設定
  - 轉換工具使用說明

- **範例資料**
  - 預設 JSON 資料（40KB，6 個工作表，172 列）
  - 支援直接預覽，無需額外設定

### [變更]
- **圖片路徑調整**
  - 從 `../Digimonwiki/images/` 改為 `./images/`
  - 支援相對路徑，適合 GitHub Pages 部署
  - 使用者只需將圖片放到 `images/` 資料夾

- **資料夾結構優化**
  - 新增 `data/` 資料夾存放 JSON
  - 新增 `tools/` 資料夾存放轉換工具
  - 新增 `examples/` 資料夾（預留範例檔案）
  - 使用 `.gitkeep` 保持空資料夾

### [功能繼承]
從本機版本 v1.6 繼承的功能：
- ✅ 文字顏色標記（14 種顏色）
- ✅ 首頁卡片兩欄布局
- ✅ 首頁卡片圖檔顯示
- ✅ 版本篩選功能
- ✅ 瀏覽器歷史記錄導航
- ✅ 圖片自動格式偵測
- ✅ 進化連結跳轉
- ✅ 介紹頁面支援

### [部署]
- **GitHub Repository**: https://github.com/PandaAki/Digiwiki
- **GitHub Pages**: https://pandaaki.github.io/Digiwiki/
- **部署日期**: 2026-01-31
- **初始提交**: d3ad0b5

### [技術]
- 使用 `autoLoadDefaultData()` 函式自動載入 JSON
- 使用 `XLSX.utils.aoa_to_sheet()` 轉換 JSON 為工作表
- 支援 CORS（需透過 HTTP/HTTPS 存取）
- 相容所有現代瀏覽器

---

## 備份說明

**當前穩定版本**: v1.0-github  
**備份位置**: `../game-database-github_backup/`  
**GitHub Repository**: https://github.com/PandaAki/Digiwiki  
**備份檔案**: 
- index.html
- script.js
- style.css
- field-viewer.html
- README.md
- CHANGELOG.md
- data/sample-data.json
- .gitignore
- tools/ (所有轉換工具)

**備份策略**:
- 每次重大更新後手動備份
- 與本機版本備份分開存放
- 保留完整的 Git 歷史記錄

---

## 與本機版本的差異

| 功能 | 本機版本 | GitHub 版本 |
|------|---------|------------|
| 資料載入 | 手動上傳 Excel | 自動載入 JSON |
| 圖片路徑 | `../Digimonwiki/images/` | `./images/` |
| 部署方式 | 本地檔案 | GitHub Pages |
| 資料格式 | Excel (.xlsx) | JSON |
| 更新方式 | 直接修改檔案 | Git push |

---

## 未來規劃

- [ ] 新增語言切換功能（中/日/英）
- [ ] 支援自訂主題
- [ ] 新增搜尋功能
- [ ] 支援更多資料篩選選項
- [ ] 效能優化（大型資料集）

---

**最後更新**: 2026-01-31  
**維護者**: PandaAki  
**授權**: MIT License
