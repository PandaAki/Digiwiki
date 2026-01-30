# Excel 轉 JSON 工具使用說明

## 安裝依賴

首先安裝 Node.js 依賴：

```bash
cd tools
npm install
```

## 使用方法

1. 將您的 Excel 檔案命名為 `data.xlsx`
2. 放到專案根目錄（與 index.html 同一層）
3. 執行轉換：

```bash
npm run convert
```

或直接執行：

```bash
node convert-to-json.js
```

## 輸出

轉換後的 JSON 檔案會儲存到：
```
../data/sample-data.json
```

## 注意事項

- Excel 檔案必須命名為 `data.xlsx`
- 確保 Excel 檔案沒有被其他程式開啟
- 轉換後請重新整理網頁以載入新資料
