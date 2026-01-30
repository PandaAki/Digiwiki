const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

console.log('='.repeat(50));
console.log('Excel 轉 JSON 工具');
console.log('='.repeat(50));

// 設定檔案路徑
const inputFile = path.join(__dirname, '..', 'data.xlsx');
const outputFile = path.join(__dirname, '..', 'data', 'sample-data.json');

// 檢查輸入檔案是否存在
if (!fs.existsSync(inputFile)) {
    console.error('❌ 錯誤：找不到 data.xlsx 檔案');
    console.log('請將您的 Excel 檔案命名為 data.xlsx 並放在專案根目錄');
    process.exit(1);
}

try {
    console.log('📖 正在讀取 Excel 檔案...');
    console.log(`   檔案位置：${inputFile}`);

    // 讀取 Excel 檔案
    const workbook = XLSX.readFile(inputFile);

    console.log(`✅ 成功讀取 Excel 檔案`);
    console.log(`   工作表數量：${workbook.SheetNames.length}`);
    console.log(`   工作表列表：${workbook.SheetNames.join(', ')}`);

    // 轉換所有工作表
    const data = {};
    let totalRows = 0;

    workbook.SheetNames.forEach(sheetName => {
        const sheet = workbook.Sheets[sheetName];
        const sheetData = XLSX.utils.sheet_to_json(sheet, { header: 1 });
        data[sheetName] = sheetData;
        totalRows += sheetData.length;
        console.log(`   - ${sheetName}: ${sheetData.length} 列`);
    });

    console.log('');
    console.log('💾 正在儲存 JSON 檔案...');
    console.log(`   輸出位置：${outputFile}`);

    // 確保 data 資料夾存在
    const dataDir = path.dirname(outputFile);
    if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
        console.log(`   已建立資料夾：${dataDir}`);
    }

    // 儲存為 JSON（格式化輸出）
    fs.writeFileSync(outputFile, JSON.stringify(data, null, 2), 'utf-8');

    // 取得檔案大小
    const stats = fs.statSync(outputFile);
    const fileSizeKB = (stats.size / 1024).toFixed(2);

    console.log('');
    console.log('='.repeat(50));
    console.log('✅ 轉換完成！');
    console.log('='.repeat(50));
    console.log(`📊 統計資訊：`);
    console.log(`   - 工作表數量：${workbook.SheetNames.length}`);
    console.log(`   - 總列數：${totalRows}`);
    console.log(`   - 檔案大小：${fileSizeKB} KB`);
    console.log('');
    console.log('📝 下一步：');
    console.log('   1. 開啟 index.html');
    console.log('   2. 網頁會自動載入 sample-data.json');
    console.log('   3. 開始使用！');
    console.log('');

} catch (error) {
    console.error('❌ 轉換失敗：', error.message);
    console.error('');
    console.error('可能的原因：');
    console.error('   - Excel 檔案格式不正確');
    console.error('   - 檔案已被其他程式開啟');
    console.error('   - 權限不足');
    process.exit(1);
}
