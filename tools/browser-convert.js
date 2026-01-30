// 簡易 Excel 轉 JSON 工具（使用瀏覽器執行）
// 使用方法：
// 1. 在瀏覽器中開啟 index.html
// 2. 打開開發者工具（F12）
// 3. 在 Console 中貼上此腳本並執行
// 4. 上傳 Excel 檔案
// 5. 複製輸出的 JSON 並儲存為 sample-data.json

async function convertExcelToJSON() {
    // 建立檔案輸入元素
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.xlsx,.xls';

    input.onchange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        console.log('正在讀取檔案:', file.name);

        // 讀取檔案
        const data = await file.arrayBuffer();
        const workbook = XLSX.read(data, { type: 'array' });

        console.log('工作表列表:', workbook.SheetNames);

        // 轉換所有工作表
        const jsonData = {};
        workbook.SheetNames.forEach(sheetName => {
            const sheet = workbook.Sheets[sheetName];
            const sheetData = XLSX.utils.sheet_to_json(sheet, { header: 1 });
            jsonData[sheetName] = sheetData;
            console.log(`- ${sheetName}: ${sheetData.length} 列`);
        });

        // 輸出 JSON
        const jsonString = JSON.stringify(jsonData, null, 2);

        console.log('');
        console.log('='.repeat(60));
        console.log('✅ 轉換完成！');
        console.log('='.repeat(60));
        console.log('請複製以下 JSON 內容，儲存為 data/sample-data.json：');
        console.log('');
        console.log(jsonString);
        console.log('');
        console.log('='.repeat(60));

        // 自動下載 JSON 檔案
        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'sample-data.json';
        a.click();
        URL.revokeObjectURL(url);

        console.log('✅ JSON 檔案已自動下載！');
        console.log('請將下載的檔案移動到 data/ 資料夾');
    };

    input.click();
}

// 執行轉換
console.log('請選擇 Excel 檔案...');
convertExcelToJSON();
