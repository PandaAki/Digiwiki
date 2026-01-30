# 對打機資料庫預覽系統

一個基於網頁的 Excel 資料庫預覽工具，支援多工作表、圖片顯示、顏色標記等功能。

## ✨ 功能特色

- 📊 **Excel 檔案讀取** - 支援多工作表資料顯示
- 🖼️ **自動圖片載入** - 智慧偵測圖片格式（jpg, png, gif 等）
- 🎨 **文字顏色標記** - 支援 14 種顏色標記語法
- 🔍 **版本篩選功能** - 可依版本篩選資料
- 📱 **響應式設計** - 支援各種螢幕尺寸
- ⬅️➡️ **瀏覽器導航** - 支援瀏覽器上一頁/下一頁
- 🚀 **自動載入** - 可預先載入 JSON 資料，無需手動上傳

## 🚀 快速開始

### 方法 1: 直接使用（推薦）

1. Clone 或下載專案
   ```bash
   git clone https://github.com/your-username/game-database.git
   cd game-database
   ```

2. 開啟 `index.html`
   - 如果有預設資料（`data/sample-data.json`），會自動載入
   - 沒有預設資料則顯示歡迎畫面

3. 開始使用！

### 方法 2: 使用自己的 Excel 檔案

1. 準備您的 Excel 檔案（參考 `examples/template.xlsx`）
2. 開啟 `index.html`
3. 點擊「選擇 Excel 檔案」上傳您的資料
4. 開始瀏覽！

### 方法 3: 轉換 Excel 為 JSON（進階）

如果您想讓網頁自動載入資料：

1. 將您的 Excel 檔案放到專案根目錄，命名為 `data.xlsx`
2. 執行轉換工具：
   ```bash
   cd tools
   node convert-to-json.js
   ```
3. 轉換後的 `sample-data.json` 會自動放到 `data/` 資料夾
4. 重新整理網頁即可看到資料

## 📁 專案結構

```
game-database/
├── index.html              # 主頁面
├── script.js               # JavaScript 邏輯
├── style.css               # 樣式檔案
├── field-viewer.html       # 欄位檢視器
├── README.md               # 本檔案
├── CHANGELOG.md            # 更新日誌
├── data/                   # 資料資料夾
│   └── sample-data.json   # 預設資料（可選）
├── images/                 # 圖片資料夾
│   └── sample/            # 範例圖片
├── examples/               # 範例檔案
│   ├── sample-data.xlsx   # 範例 Excel（含資料）
│   └── template.xlsx      # 空白範本
└── tools/                  # 工具腳本
    └── convert-to-json.js # Excel 轉 JSON 工具
```

## 📊 Excel 格式說明

### 工作表結構

您的 Excel 檔案應包含以下工作表：

1. **首頁** - 主選單卡片
2. **訊息** - 系統訊息與篩選選項
3. **資料分頁** - 您的實際資料（可多個）
4. **介紹**（可選）- 介紹頁面

### 欄位說明

詳細的欄位配置請參考 `examples/template.xlsx`。

**首頁分頁（4 欄）：**
| 欄位 | 說明 | 範例 |
|------|------|------|
| A - 編號 | 唯一識別碼 | 1, 2, 3... |
| B - 顯示訊息 | 卡片顯示文字 | 角色資料 |
| C - 分頁名稱 | 對應的工作表名稱 | 角色 |
| D - 圖檔 | 卡片圖片檔名 | icon.jpg |

**資料分頁（33 欄）：**
- 編號、名稱（日/中/英）、階段、屬性
- HP、AP、SP 等數值
- 圖檔 1-5
- 描述、進化條件等文字
- 進化索引 1-6
- 版本標記

完整欄位說明請查看 `field-viewer.html`。

## 🎨 顏色標記功能

在任何純文字欄位中使用顏色標記：

```
[red]紅色文字[/red]
[blue]藍色文字[/blue]
[gold]金色文字[/gold]
```

**支援的顏色：**
red, green, blue, yellow, orange, purple, pink, cyan, gray, black, white, gold, silver, brown

**範例：**
```
這隻數碼寶貝擁有[red]強大的攻擊力[/red]和[blue]優秀的防禦力[/blue]
```

## 🖼️ 圖片使用

1. 將圖片放到 `images/` 資料夾
2. 在 Excel 中填寫檔名（可含或不含副檔名）
3. 系統會自動偵測圖片格式

**支援格式：** jpg, jpeg, png, gif, webp, bmp

**範例：**
```
Excel 中填寫：agumon
系統會嘗試：agumon.jpg → agumon.png → agumon.gif → ...
```

## 🔧 進階設定

### 修改圖片路徑

編輯 `script.js` 第 2 行：

```javascript
const IMAGE_BASE_PATH = './images/';  // 修改為您的圖片路徑
```

### 修改預設資料路徑

編輯 `script.js` 的 `autoLoadDefaultData()` 函式：

```javascript
const response = await fetch('./data/your-data.json');
```

## 🛠️ 開發工具

### Excel 轉 JSON 工具

將 Excel 檔案轉換為 JSON 格式，讓網頁自動載入：

```bash
cd tools
node convert-to-json.js
```

**需求：** Node.js 12+

**輸入：** 專案根目錄的 `data.xlsx`  
**輸出：** `data/sample-data.json`

## 📝 更新日誌

詳見 [CHANGELOG.md](CHANGELOG.md)

## 🤝 貢獻

歡迎提交 Issue 和 Pull Request！

## 📄 授權

MIT License

## 💡 常見問題

### Q: 圖片無法顯示？
**A:** 
1. 確認圖片已放到 `images/` 資料夾
2. 檢查檔名是否正確
3. 系統會自動嘗試不同格式

### Q: 如何更新資料？
**A:** 
- **方法 1**：直接上傳新的 Excel 檔案
- **方法 2**：更新 `data.xlsx` 並重新轉換為 JSON

### Q: 可以部署到 GitHub Pages 嗎？
**A:** 可以！只要確保：
1. 有 `data/sample-data.json` 檔案
2. 圖片都放在 `images/` 資料夾
3. 推送到 GitHub 並啟用 Pages

### Q: 支援哪些瀏覽器？
**A:** 支援所有現代瀏覽器（Chrome, Firefox, Safari, Edge）

## 📧 聯絡方式

如有問題或建議，歡迎開 Issue！

---

**Made with ❤️ for game database management**
