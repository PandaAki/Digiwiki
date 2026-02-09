const fs = require('fs');
const path = require('path');

console.log('='.repeat(50));
console.log('GitHub 版本驗證工具');
console.log('='.repeat(50));
console.log('');

const scriptPath = path.join(__dirname, '..', 'script.js');

if (!fs.existsSync(scriptPath)) {
    console.error('❌ 找不到 script.js 檔案');
    process.exit(1);
}

const scriptContent = fs.readFileSync(scriptPath, 'utf-8');

const checks = [
    {
        name: 'IMAGE_BASE_PATH 設定為 GitHub Pages 路徑',
        test: () => scriptContent.includes("IMAGE_BASE_PATH = './images/'"),
        fix: "修改為: const IMAGE_BASE_PATH = './images/';"
    },
    {
        name: 'autoLoadDefaultData 函式存在',
        test: () => scriptContent.includes('async function autoLoadDefaultData'),
        fix: "加回 autoLoadDefaultData 函式（參考備份或 Git 歷史記錄）"
    },
    {
        name: 'DOMContentLoaded 呼叫 autoLoadDefaultData',
        test: () => {
            const domContentLoadedMatch = scriptContent.match(/document\.addEventListener\('DOMContentLoaded'[\s\S]*?\}\);/);
            if (!domContentLoadedMatch) return false;
            return domContentLoadedMatch[0].includes('autoLoadDefaultData()');
        },
        fix: "在 DOMContentLoaded 事件監聽器中加入: autoLoadDefaultData();"
    },
    {
        name: 'autoLoadDefaultData 使用 await response.json()',
        test: () => {
            const funcMatch = scriptContent.match(/async function autoLoadDefaultData[\s\S]*?^\}/m);
            if (!funcMatch) return true; // 如果函式不存在，這個檢查會被上面的檢查捕捉
            return funcMatch[0].includes('await response.json()');
        },
        fix: "修改為: const jsonData = await response.json();"
    },
    {
        name: 'autoLoadDefaultData 呼叫 showHomeView',
        test: () => {
            const funcMatch = scriptContent.match(/async function autoLoadDefaultData[\s\S]*?^\}/m);
            if (!funcMatch) return true;
            return funcMatch[0].includes('showHomeView()');
        },
        fix: "修改為: showHomeView(); (不是 displayHomeIndex)"
    },
    {
        name: 'showHomeView 函式存在',
        test: () => scriptContent.includes('function showHomeView'),
        fix: "確認 showHomeView 函式存在（應該從本機版本同步過來）"
    }
];

let allPassed = true;
let passedCount = 0;

checks.forEach((check, index) => {
    const passed = check.test();
    const status = passed ? '✅' : '❌';
    console.log(`${status} ${index + 1}. ${check.name}`);

    if (!passed) {
        console.log(`   💡 修正方式: ${check.fix}`);
        console.log('');
        allPassed = false;
    } else {
        passedCount++;
    }
});

console.log('');
console.log('='.repeat(50));
console.log(`檢查結果: ${passedCount}/${checks.length} 項通過`);
console.log('='.repeat(50));

if (allPassed) {
    console.log('✅ 所有檢查通過！可以安全推送到 GitHub。');
    console.log('');
    process.exit(0);
} else {
    console.log('❌ 發現問題，請修正後再推送到 GitHub。');
    console.log('');
    console.log('💡 提示：');
    console.log('   1. 手動修正上述問題');
    console.log('   2. 再次執行此腳本驗證');
    console.log('   3. 確認通過後再執行 git push');
    console.log('');
    process.exit(1);
}
