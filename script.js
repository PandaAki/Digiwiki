// 設定圖片基礎路徑 (GitHub Pages 版本)
const IMAGE_BASE_PATH = './images/';

// 全域變數
let currentWorkbook = null;
let currentView = 'welcome'; // 'welcome', 'home', 'detail'

// 初始化
document.addEventListener('DOMContentLoaded', () => {
    const loadBtn = document.getElementById('loadBtn');
    const backBtn = document.getElementById('backBtn');
    const fileInput = document.getElementById('fileInput');

    // 點擊按鈕觸發檔案選擇
    // loadBtn.addEventListener('click', () => {
    //     fileInput.click();
    // });

    // 返回上一頁 (使用瀏覽器歷史記錄)
    backBtn.addEventListener('click', () => {
        history.back();
    });

    // 當檔案被選擇時載入資料
    // fileInput.addEventListener('change', (e) => {
    //     const file = e.target.files[0];
    //     if (file) {
    //         loadExcelFile(file);
    //         // 重置 input value,允許重複選擇同一檔案
    //         fileInput.value = '';
    //     }
    // });

    // 嘗試自動載入預設 JSON 資料 (GitHub Pages 版本)
    autoLoadDefaultData();
});

// 載入 Excel 檔案
async function loadExcelFile(file) {
    const statusEl = document.getElementById('status');

    try {
        statusEl.textContent = '正在載入資料...';
        statusEl.style.background = '#fef5e7';
        statusEl.style.color = '#7d6608';

        // 使用 FileReader 讀取檔案
        const data = await readExcelFile(file);
        currentWorkbook = data;

        // 更新網頁標題
        updatePageTitle(currentWorkbook);

        // 顯示首頁
        showHomeView();

        // 設定初始歷史記錄狀態
        history.replaceState({ view: 'home' }, '', '');

        statusEl.textContent = `已載入 Excel 檔案`;
        statusEl.style.background = '#e6fffa';
        statusEl.style.color = '#234e52';

    } catch (error) {
        console.error('載入失敗:', error);
        statusEl.textContent = '載入失敗';
        statusEl.style.background = '#fff5f5';
        statusEl.style.color = '#c53030';
        alert('無法載入 Excel 檔案,請確認檔案格式正確');
    }
}

// 讀取 Excel 檔案
function readExcelFile(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = (e) => {
            try {
                const data = new Uint8Array(e.target.result);
                const workbook = XLSX.read(data, { type: 'array' });
                resolve(workbook);
            } catch (error) {
                reject(error);
            }
        };

        reader.onerror = (error) => reject(error);
        reader.readAsArrayBuffer(file);
    });
}

// 顯示首頁視圖
function showHomeView() {
    if (!currentWorkbook) return;

    // 讀取「首頁」工作表
    const homeSheet = currentWorkbook.Sheets['首頁'];
    if (!homeSheet) {
        alert('找不到「首頁」工作表');
        return;
    }

    const homeData = XLSX.utils.sheet_to_json(homeSheet, { header: 1 });
    const processedData = processHomeData(homeData);

    // 顯示首頁
    displayHomeCards(processedData);
    switchView('home');

    // 推送歷史記錄
    pushHistory('home');
}

// 處理首頁資料
function processHomeData(data) {
    const processedData = [];

    // 從第三列開始(跳過前兩列)
    for (let i = 2; i < data.length; i++) {
        const row = data[i];

        // 欄位1: 編號,若空白則不讀取
        if (!row[0] || String(row[0]).trim() === '') continue;

        const item = {
            id: row[0],              // A(1): 編號
            message: row[1] || '',   // B(2): 顯示訊息
            sheetName: row[2] || '', // C(3): 分頁名稱
            image: row[3] || ''      // D(4): 圖檔
        };

        processedData.push(item);
    }

    // 建立編號到名稱的映射
    const idToNameMap = {};
    processedData.forEach(item => {
        idToNameMap[item.id] = item.nameCN || item.nameJP || item.nameEN || '';
    });

    // 將映射添加到每個項目中
    processedData.forEach(item => {
        item._nameMap = idToNameMap;
    });

    return processedData;
}

// 顯示首頁卡片
function displayHomeCards(data) {
    const container = document.getElementById('homeContainer');
    container.innerHTML = '';

    if (data.length === 0) {
        container.innerHTML = '<div class="no-data">沒有找到任何資料</div>';
        return;
    }

    data.forEach(item => {
        const card = createHomeCard(item);
        container.appendChild(card);
    });
}

// 建立首頁索引卡片
function createHomeCard(item) {
    const card = document.createElement('div');
    card.className = 'index-card';

    // 建立圖片元素（如果有圖檔）
    const imageHTML = item.image ?
        `<img src="${getImagePath(item.image)}" alt="${item.message}" class="index-card-image" onerror="tryAlternativeImageFormats(this, '${item.image}')">` :
        '';

    card.innerHTML = `
        ${imageHTML}
        <div class="index-card-content">
            <div class="index-card-message">${parseColorTags(item.message)}</div>
        </div>
        <div class="index-card-arrow">→</div>
    `;

    // 點擊卡片切換到對應分頁
    card.addEventListener('click', () => {
        const sheetName = item.sheetName;
        // 檢查是否為介紹頁面 (如果名稱或分頁名稱包含「介紹」)
        if (item.message.includes('介紹') || (sheetName && sheetName.includes('介紹'))) {
            loadAndDisplayIntro(sheetName || item.message);
        } else if (item.sheetName) {
            showDetailView(item.sheetName);
        }
    });

    return card;
}

// 顯示詳細資料視圖
function showDetailView(sheetName) {
    if (!currentWorkbook) return;

    // 讀取指定工作表
    const sheet = currentWorkbook.Sheets[sheetName];
    if (!sheet) {
        alert(`找不到「${sheetName}」工作表`);
        return;
    }

    const sheetData = XLSX.utils.sheet_to_json(sheet, { header: 1 });
    const processedData = processDetailData(sheetData, sheetName);

    // 顯示詳細資料
    displayDetailCards(processedData);
    switchView('detail');

    // 如果是「超超代」、「搖擺X」或「加速機」分頁，新增版本篩選器
    if (sheetName.includes('超超代') || sheetName === '搖擺X' || sheetName === '加速機') {
        addVersionFilter(processedData);
    }

    // 推送歷史記錄
    pushHistory('detail', { sheetName });
}

// 處理詳細資料(原本的26個欄位邏輯)
function processDetailData(data, sheetName) {
    const processedData = [];

    // 從第三列開始(跳過前兩列標題)
    for (let i = 2; i < data.length; i++) {
        const row = data[i];

        // 欄位A(1): 編號,若空白則不讀取
        if (!row[0] || String(row[0]).trim() === '') continue;

        const item = {
            id: row[0],                    // A(1): 編號
            nameJP: row[1] || '',          // B(2): 日文名稱
            nameCN: row[2] || '',          // C(3): 中文名稱
            nameEN: row[3] || '',          // D(4): 英文名稱
            stage: row[4] || '',           // E(5): 階段
            attribute: row[5] || '',       // F(6): 屬性
            hp: row[6],                    // G(7): HP
            maxHp: row[7],                 // H(8): 最高HP
            ap: row[8],                    // I(9): AP
            maxAp: row[9],                 // J(10): 最高AP
            sp: row[10],                   // K(11): SP
            maxSp: row[11],                // L(12): 最高SP
            weight: row[12],               // M(13): 體重
            hunger: row[13],               // N(14): 滿腹
            strength: row[14],             // O(15): 筋力
            dp: row[15],                   // P(16): DP
            lifespan: row[16],             // Q(17): 壽命
            perfectTraining: row[17] || '',// R(18): 完美訓練次數
            skill: row[18] || '',          // S(19): 必殺技
            evolution: row[19] || '',      // T(20): 進化條件
            image1: row[20] || '',         // U(21): 圖檔1
            image2: row[21] || '',         // V(22): 圖檔2
            image3: row[22] || '',         // W(23): 圖檔3
            image4: row[23] || '',         // X(24): 圖檔4
            image5: row[24] || '',         // Y(25): 圖檔5
            description: row[25] || '',    // Z(26): 描述
            evo1: row[26] || '',           // AA(27): 進化1
            evo2: row[27] || '',           // AB(28): 進化2
            evo3: row[28] || '',           // AC(29): 進化3
            evo4: row[29] || '',           // AD(30): 進化4
            evo5: row[30] || '',           // AE(31): 進化5
            evo6: row[31] || ''            // AF(32): 進化6
        };

        // 判斷是否為搖擺X分頁（版本欄位在第 37 欄）
        if (sheetName === '搖擺X') {
            // 新增圖檔索引欄位 33-36
            item.itemImage1 = row[32] || '';  // AG(33): 圖檔索引1
            item.itemImage2 = row[33] || '';  // AH(34): 圖檔索引2
            item.itemImage3 = row[34] || '';  // AI(35): 圖檔索引3
            item.itemImage4 = row[35] || '';  // AJ(36): 圖檔索引4
            item.version = row[36] || '';     // AK(37): 版本
        } else if (sheetName === '加速機') {
            // 加速機分頁：進化物品組欄位 33-38，版本在第 39 欄
            item.evoItems1 = row[32] || '';   // AG(33): 進化1物品組
            item.evoItems2 = row[33] || '';   // AH(34): 進化2物品組
            item.evoItems3 = row[34] || '';   // AI(35): 進化3物品組
            item.evoItems4 = row[35] || '';   // AJ(36): 進化4物品組
            item.evoItems5 = row[36] || '';   // AK(37): 進化5物品組
            item.evoItems6 = row[37] || '';   // AL(38): 進化6物品組
            item.version = row[38] || '';     // AM(39): 版本
        } else {
            // 其他分頁維持原本的版本欄位位置
            item.version = row[32] || '';     // AG(33): 版本
        }

        processedData.push(item);
    }

    // 建立編號到名稱的映射
    const idToNameMap = {};
    processedData.forEach(item => {
        idToNameMap[item.id] = item.nameCN || item.nameJP || item.nameEN || '';
    });

    // 將映射添加到每個項目中
    processedData.forEach(item => {
        item._nameMap = idToNameMap;
    });

    return processedData;
}

// 解析圖檔索引格式（圖檔名稱;數量）
function parseItemImage(itemImageStr) {
    if (!itemImageStr || itemImageStr.trim() === '') {
        return null;
    }

    const parts = itemImageStr.split(';');

    // 容錯處理：如果沒有分號，可能是格式錯誤，跳過
    if (parts.length !== 2) {
        console.warn(`物品格式錯誤，已跳過: "${itemImageStr}"`);
        return null;
    }

    const imageName = parts[0].trim();
    const quantityStr = parts[1].trim();

    // 檢查圖片名稱和數量是否為空
    if (!imageName || !quantityStr) {
        console.warn(`物品資料不完整，已跳過: "${itemImageStr}"`);
        return null;
    }

    // 檢查是否為區間格式（例如 "1-5" 或 "0~5"）
    if (quantityStr.includes('-') || quantityStr.includes('~')) {
        const separator = quantityStr.includes('~') ? '~' : '-';
        const rangeParts = quantityStr.split(separator);
        if (rangeParts.length === 2) {
            const min = rangeParts[0].trim();
            const max = rangeParts[1].trim();

            // 檢查區間是否有效（允許 0 作為最小值）
            if (min !== '' && max !== '' && !isNaN(parseInt(min)) && !isNaN(parseInt(max))) {
                return {
                    imageName: imageName,
                    quantity: parseInt(min),
                    displayQuantity: `${min}~${max}`
                };
            }
        }
    }

    // 一般數量格式
    const quantity = parseInt(quantityStr);

    // 檢查數量是否有效（允許 0）
    if (isNaN(quantity) || quantity < 0) {
        console.warn(`物品數量無效，已跳過: "${itemImageStr}" (數量: ${quantityStr})`);
        return null;
    }

    return {
        imageName: imageName,
        quantity: quantity,
        displayQuantity: quantityStr
    };
}

// 解析物品組格式（物品1;數量|物品2;數量|...）
function parseItemGroup(itemGroupStr) {
    if (!itemGroupStr || itemGroupStr.trim() === '') {
        return [];
    }

    const items = [];
    const itemParts = itemGroupStr.split('|');

    itemParts.forEach(itemStr => {
        const parsed = parseItemImage(itemStr.trim());
        if (parsed) {
            items.push(parsed);
        }
    });

    return items;
}



// 顯示詳細資料卡片
function displayDetailCards(data) {
    const container = document.getElementById('cardContainer');
    container.innerHTML = '';

    if (data.length === 0) {
        container.innerHTML = '<div class="no-data">沒有找到任何資料</div>';
        return;
    }

    data.forEach(item => {
        const card = createDetailCard(item);
        container.appendChild(card);

        // 設置進化名稱點擊事件
        setupEvoLinkClickHandlers();
    });
}

// 切換視圖
function switchView(viewName) {
    const welcomeView = document.getElementById('welcomeView');
    const homeView = document.getElementById('homeView');
    const introView = document.getElementById('introView');
    const backBtn = document.getElementById('backBtn');

    // 隱藏所有視圖
    welcomeView.style.display = 'none';
    homeView.style.display = 'none';
    detailView.style.display = 'none';
    if (introView) introView.style.display = 'none';
    backBtn.style.display = 'none';

    // 顯示指定視圖
    if (viewName === 'welcome') {
        welcomeView.style.display = 'block';
    } else if (viewName === 'home') {
        homeView.style.display = 'block';
    } else if (viewName === 'detail') {
        detailView.style.display = 'block';
        backBtn.style.display = 'inline-block';
    } else if (viewName === 'intro') {
        if (introView) introView.style.display = 'block';
        backBtn.style.display = 'inline-block';
    }

    currentView = viewName;
}

// 取得圖片路徑(自動偵測副檔名)
function getImagePath(filename) {
    if (!filename) return '';

    // 如果已經包含副檔名,直接使用
    if (filename.match(/\.(jpg|jpeg|png|gif|webp|bmp)$/i)) {
        return IMAGE_BASE_PATH + filename;
    }

    // 否則預設使用 .jpg
    return IMAGE_BASE_PATH + filename + '.jpg';
}

// 嘗試其他圖片格式
function tryAlternativeImageFormats(imgElement, filename) {
    // 定義支援的副檔名列表
    const extensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp'];

    // 取得檔名主體 (移除副檔名)
    let baseName = filename.replace(/\.(jpg|jpeg|png|gif|webp|bmp)$/i, '');

    // 取得目前失敗的圖片網址的副檔名
    const currentSrc = imgElement.src;
    const currentExt = currentSrc.split('.').pop().toLowerCase();

    // 判斷這是否為第一次失敗 (即 Excel 指定的檔名讀不到)
    // 如果檔名原本就有副檔名 (例如 Agumon.png)，且目前失敗的就是這個 png，那我們應該從頭開始嘗試其他格式
    let nextIndex = -1;
    const originalExtMatch = filename.match(/\.([a-z0-9]+)$/i);
    const isExplicitExtFail = originalExtMatch && (originalExtMatch[1].toLowerCase() === currentExt);

    if (isExplicitExtFail) {
        // 如果是使用者指定的格式失敗了，從清單的第一個開始試 (排除掉剛剛失敗的那個)
        nextIndex = 0;
        if (extensions[nextIndex] === currentExt) {
            nextIndex = 1;
        }
    } else {
        // 否則，依照清單順序嘗試下一個
        const currentIndex = extensions.indexOf(currentExt);
        if (currentIndex >= 0 && currentIndex < extensions.length - 1) {
            nextIndex = currentIndex + 1;
        }
    }

    // 執行重試或顯示錯誤
    if (nextIndex >= 0 && nextIndex < extensions.length) {
        const nextExt = extensions[nextIndex];
        // 為了避免某些情況下 src 沒有更新導致無限迴圈，可以加個 log
        // console.log(`Retry ${baseName} with ${nextExt}`);
        imgElement.src = IMAGE_BASE_PATH + baseName + '.' + nextExt;
    } else {
        // 所有格式都嘗試過了,隱藏圖片
        imgElement.style.display = 'none';

        // [除錯模式] 顯示錯誤訊息
        // 避免重複添加錯誤訊息
        if (!imgElement.parentNode.querySelector('.err-msg')) {
            const errDiv = document.createElement('div');
            errDiv.className = 'err-msg';
            errDiv.style.color = '#e53e3e';
            errDiv.style.fontSize = '12px';
            errDiv.style.marginTop = '5px';
            errDiv.innerText = '圖片遺失: ' + baseName + '.*';
            imgElement.parentNode.appendChild(errDiv);
        }
    }
}

// 建立詳細資料卡片
function createDetailCard(item) {
    const card = document.createElement('div');
    card.className = 'data-card detail-card';
    card.id = `card-${item.id}`; // 添加唯一 ID 用於錨點跳轉

    // 儲存版本資訊到 data attribute (用於篩選)
    if (item.version) {
        card.dataset.version = item.version;
    }

    // 主圖片 - 使用智慧路徑處理
    const mainImage = item.image1 ? getImagePath(item.image1) : '';

    // 建立名稱列(日文、中文、英文橫向排列) - 支援顏色標記
    const names = [];
    if (item.nameJP) names.push(parseColorTags(item.nameJP));
    if (item.nameCN) names.push(parseColorTags(item.nameCN));
    if (item.nameEN) names.push(parseColorTags(item.nameEN));
    const namesDisplay = names.join(' / ');

    // 建立階段和屬性顯示 - 支援顏色標記
    const stageAttr = [];
    if (item.stage) stageAttr.push(parseColorTags(item.stage));
    if (item.attribute) stageAttr.push(parseColorTags(item.attribute));
    const stageAttrDisplay = stageAttr.join(' ');

    card.innerHTML = `
        <div class="card-header">
            ${mainImage ? `<img src="${mainImage}" alt="${item.nameCN}" class="card-image" onerror="tryAlternativeImageFormats(this, '${item.image1}')">` : ''}
            <div class="card-title">
                ${namesDisplay ? `<div class="card-name">${namesDisplay}</div>` : ''}
                ${stageAttrDisplay ? `<div class="card-subtitle">${stageAttrDisplay}</div>` : ''}
            </div>
            ${item.version ? `<div class="card-version">${item.version}</div>` : ''}
            
        </div>
        
        ${createStatsRow(item)}
        ${createAttributesRow(item)}
        ${createInfoSection(item)}
        ${createItemImagesSection(item)}
        ${createDescriptionSection(item)}
        ${createImagesSection(item)}
    `;

    return card;
}

// 建立數值列(HP, AP, SP 等) - 使用箭頭顯示升級
function createStatsRow(item) {
    const stats = [];

    // HP: 顯示 HP → 最高HP
    if ((item.hp !== undefined && item.hp !== '') || (item.maxHp !== undefined && item.maxHp !== '')) {
        let hpDisplay;
        if ((item.hp !== undefined && item.hp !== '') && (item.maxHp !== undefined && item.maxHp !== '')) {
            hpDisplay = `${item.hp} → ${item.maxHp}`;
        } else if (item.hp !== undefined && item.hp !== '') {
            hpDisplay = item.hp;
        } else {
            hpDisplay = item.maxHp;
        }
        stats.push({ label: 'HP', value: hpDisplay, class: 'hp' });
    }

    // AP: 顯示 AP → 最高AP
    if ((item.ap !== undefined && item.ap !== '') || (item.maxAp !== undefined && item.maxAp !== '')) {
        let apDisplay;
        if ((item.ap !== undefined && item.ap !== '') && (item.maxAp !== undefined && item.maxAp !== '')) {
            apDisplay = `${item.ap} → ${item.maxAp}`;
        } else if (item.ap !== undefined && item.ap !== '') {
            apDisplay = item.ap;
        } else {
            apDisplay = item.maxAp;
        }
        stats.push({ label: 'AP', value: apDisplay, class: 'ap' });
    }

    // SP: 顯示 SP → 最高SP
    if ((item.sp !== undefined && item.sp !== '') || (item.maxSp !== undefined && item.maxSp !== '')) {
        let spDisplay;
        if ((item.sp !== undefined && item.sp !== '') && (item.maxSp !== undefined && item.maxSp !== '')) {
            spDisplay = `${item.sp} → ${item.maxSp}`;
        } else if (item.sp !== undefined && item.sp !== '') {
            spDisplay = item.sp;
        } else {
            spDisplay = item.maxSp;
        }
        stats.push({ label: 'SP', value: spDisplay, class: 'sp' });
    }

    if (stats.length === 0) return '';

    return `
        <div class="stats-row">
            ${stats.map(stat => `
                <div class="stat-box">
                    <div class="stat-label">${stat.label}</div>
                    <div class="stat-value ${stat.class}">${stat.value}</div>
                </div>
            `).join('')}
        </div>
    `;
}

// 建立屬性列
function createAttributesRow(item) {
    const attributes = [];

    const attrLabels = ['體重', '滿腹', '筋力', 'DP', '壽命'];
    const attrValues = [item.weight, item.hunger, item.strength, item.dp, item.lifespan];

    attrLabels.forEach((label, index) => {
        if (attrValues[index] !== undefined && attrValues[index] !== '') {
            attributes.push({ label, value: attrValues[index] });
        }
    });

    if (attributes.length === 0) return '';

    return `
        <div class="attributes-row">
            ${attributes.map(attr => `
                <div class="attribute-badge">
                    <span class="attr-label">${attr.label}</span>
                    <span class="attr-value">${attr.value}</span>
                </div>
            `).join('')}
        </div>
    `;
}

// 建立資訊區塊
function createInfoSection(item) {
    const infos = [];

    if (item.perfectTraining) {
        infos.push({ label: '完美訓練', value: parseColorTags(item.perfectTraining) });
    }
    if (item.skill) {
        infos.push({ label: '必殺技', value: parseColorTags(item.skill) });
    }

    // 進化索引作為獨立的資訊行
    const evoNames = [];
    const evoFields = [item.evo1, item.evo2, item.evo3, item.evo4, item.evo5, item.evo6];

    evoFields.forEach((evoId, index) => {
        if (evoId !== undefined && evoId !== '' && item._nameMap && item._nameMap[evoId]) {
            const name = item._nameMap[evoId];
            // 建立可點擊的連結,使用 data-target 屬性儲存目標 ID
            evoNames.push(`<span class="evo-link" data-target="card-${evoId}">${name}</span>`);
        }
    });

    // 如果有進化索引,添加為獨立的資訊行
    if (evoNames.length > 0) {
        infos.push({ label: '進化', value: evoNames.join(', ') });
    }

    if (infos.length === 0) return '';

    return `
        <div class="info-section">
            ${infos.map(info => `
                <div class="info-row">
                    <div class="info-label">${info.label}:</div>
                    <div class="info-value">${info.value}</div>
                </div>
            `).join('')}
        </div>
    `;
}

// 建立描述區塊
function createDescriptionSection(item) {
    const sections = [];

    if (item.evolution) {
        sections.push({ title: '■進化條件■', text: parseColorTags(item.evolution) });
    }
    if (item.description) {
        sections.push({ title: '■描述■', text: parseColorTags(item.description) });
    }

    if (sections.length === 0) return '';

    return sections.map(section => `
        <div class="description-section">
            <div class="description-title">${section.title}</div>
            <div class="description-text">${section.text}</div>
        </div>
    `).join('');
}

// 建立圖片區塊
function createImagesSection(item) {
    const images = [item.image2, item.image3, item.image4, item.image5]
        .filter(img => img)
        .map(img => ({ path: getImagePath(img), original: img }));

    if (images.length === 0) return '';

    return `
        <div class="images-section">
            <div class="images-grid">
                ${images.map(img => `
                    <img src="${img.path}" alt="圖片" class="extra-image" onerror="tryAlternativeImageFormats(this, '${img.original}')">
                `).join('')}
            </div>
        </div>
    `;
}

// 建立道具圖檔區塊（搖擺X和加速機專用）
function createItemImagesSection(item) {
    // 加速機分頁：進化路線分組顯示
    if (item.evoItems1 || item.evoItems2 || item.evoItems3 ||
        item.evoItems4 || item.evoItems5 || item.evoItems6) {

        const evolutionPaths = [];

        // 處理每個進化路線
        [
            { name: item.evo1, items: item.evoItems1 },
            { name: item.evo2, items: item.evoItems2 },
            { name: item.evo3, items: item.evoItems3 },
            { name: item.evo4, items: item.evoItems4 },
            { name: item.evo5, items: item.evoItems5 },
            { name: item.evo6, items: item.evoItems6 }
        ].forEach(evo => {
            if (evo.name && evo.items) {
                const parsedItems = parseItemGroup(evo.items);
                if (parsedItems.length > 0) {
                    evolutionPaths.push({
                        name: evo.name,
                        items: parsedItems
                    });
                }
            }
        });

        if (evolutionPaths.length === 0) return '';

        return `
            <div class="evolution-paths-section collapsed">
                <div class="section-title evolution-header">
                    <span>進化需求</span>
                    <button class="collapse-btn" onclick="toggleEvolutionPaths(this)">
                        <span class="collapse-icon">▶</span>
                    </button>
                </div>
                <div class="evolution-paths-content">
                    ${evolutionPaths.map(path => `
                        <div class="evolution-path">
                            <div class="evolution-target">${item._nameMap && item._nameMap[path.name] ? item._nameMap[path.name] : path.name}</div>
                            <div class="evolution-items">
                                ${path.items.map(item => `
                                    <div class="evolution-item">
                                        <img src="${getImagePath(item.imageName)}" 
                                             alt="${item.imageName}" 
                                             class="item-image"
                                             onerror="tryAlternativeImageFormats(this, '${item.imageName}')">
                                        <div class="item-quantity">x ${item.displayQuantity}</div>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    // 搖擺X分頁：原本的道具需求顯示
    if (!item.itemImage1 && !item.itemImage2 &&
        !item.itemImage3 && !item.itemImage4) {
        return '';
    }

    const items = [];

    [item.itemImage1, item.itemImage2, item.itemImage3, item.itemImage4]
        .forEach(itemStr => {
            const parsed = parseItemImage(itemStr);
            if (parsed) {
                items.push(parsed);
            }
        });

    if (items.length === 0) return '';

    return `
        <div class="item-images-section">
            <div class="section-title">道具需求</div>
            <div class="item-images-grid">
                ${items.map(item => `
                    <div class="item-image-box">
                        <img src="${getImagePath(item.imageName)}" 
                             alt="${item.imageName}" 
                             class="item-image"
                             onerror="tryAlternativeImageFormats(this, '${item.imageName}')">
                        <div class="item-quantity">x ${item.displayQuantity}</div>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
}

// 處理進化名稱點擊事件
function setupEvoLinkClickHandlers() {
    document.querySelectorAll('.evo-link').forEach(link => {
        link.addEventListener('click', function () {
            const targetId = this.getAttribute('data-target');
            const targetCard = document.getElementById(targetId);
            if (targetCard) {
                targetCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
                // 添加高亮效果
                targetCard.style.transition = 'all 0.3s ease';
                targetCard.style.boxShadow = '0 0 20px rgba(102, 126, 234, 0.6)';
                setTimeout(() => {
                    targetCard.style.boxShadow = '';
                }, 2000);
            }
        });
    });
}

// 載入並顯示介紹頁面
function loadAndDisplayIntro(sheetName) {
    if (!currentWorkbook) return;

    // 讀取指定工作表
    const sheet = currentWorkbook.Sheets[sheetName];
    if (!sheet) {
        alert('找不到「' + sheetName + '」工作表');
        return;
    }

    // 讀取所有資料
    const sheetData = XLSX.utils.sheet_to_json(sheet, { header: 1 });
    const content = processIntroData(sheetData, sheet);  // 傳遞 sheet 參數以支援圖檔索引

    // 顯示介紹內容
    renderIntroContent(content);
    switchView('intro');
}

// 處理介紹頁面資料
function processIntroData(data) {
    const content = [];

    // 遍歷每一行
    data.forEach(row => {
        // 遍歷每一列
        row.forEach(cell => {
            if (cell && String(cell).trim() !== '') {
                const text = String(cell).trim();

                // 判斷是否為圖片
                if (text.match(/\.(jpg|jpeg|png|gif|webp|bmp)$/i)) {
                    content.push({ type: 'image', value: text });
                } else {
                    content.push({ type: 'text', value: text });
                }
            }
        });
    });

    return content;
}

// 渲染介紹內容
function renderIntroContent(content) {
    const container = document.getElementById('introContainer');
    container.innerHTML = '';

    if (content.length === 0) {
        container.innerHTML = '<div class="no-data">沒有找到任何介紹內容</div>';
        return;
    }

    content.forEach(item => {
        const div = document.createElement('div');
        div.className = 'intro-item';

        if (item.type === 'image') {
            const img = document.createElement('img');
            img.src = getImagePath(item.value);
            img.alt = '介紹圖片';
            img.className = 'intro-image';
            img.onerror = function () {
                this.style.display = 'none'; // 圖片載入失敗則隱藏
            };
            div.appendChild(img);
        } else {
            const p = document.createElement('p');
            p.className = 'intro-text';
            p.textContent = item.value;
            div.appendChild(p);
        }

        container.appendChild(div);
    });
}

// 處理介紹頁面資料 (升級版: 支援表格)
function processIntroData(data) {
    const content = [];
    let currentTable = [];

    data.forEach(row => {
        // 過濾掉完全空白的行
        const nonEmptyCells = row.filter(cell => cell !== undefined && cell !== null && String(cell).trim() !== '');

        if (nonEmptyCells.length === 0) {
            // 空行，如果之前有表格正在累積，先結束該表格
            if (currentTable.length > 0) {
                content.push({ type: 'table', rows: currentTable });
                currentTable = [];
            }
            return;
        }

        // 判斷是否為表格行 (超過1個欄位有資料)
        // 或者雖然只有1個欄位，但目前正在構建表格(且該欄位不是圖片) -> 這裡簡單點，只看是否多欄
        if (nonEmptyCells.length > 1) {
            currentTable.push(row);
        } else {
            // 單欄內容
            // 先結束之前的表格
            if (currentTable.length > 0) {
                content.push({ type: 'table', rows: currentTable });
                currentTable = [];
            }

            // 處理單一內容
            const text = String(nonEmptyCells[0]).trim();
            // 判斷是否為圖片
            if (text.match(/\.(jpg|jpeg|png|gif|webp|bmp)$/i)) {
                content.push({ type: 'image', value: text });
            } else {
                content.push({ type: 'text', value: text });
            }
        }
    });

    // 處理最後殘留的表格
    if (currentTable.length > 0) {
        content.push({ type: 'table', rows: currentTable });
    }

    return content;
}

// 渲染介紹內容 (升級版: 支援表格)
function renderIntroContent(content) {
    const container = document.getElementById('introContainer');
    container.innerHTML = '';

    if (content.length === 0) {
        container.innerHTML = '<div class="no-data">沒有找到任何介紹內容</div>';
        return;
    }

    content.forEach(item => {
        if (item.type === 'table') {
            const table = document.createElement('table');
            table.className = 'intro-table';

            item.rows.forEach(row => {
                const tr = document.createElement('tr');
                row.forEach(cell => {
                    // 這裡簡單處理，所有都用 td，或者也可以判斷第一行用 th
                    // 但因為無法確定是否有標題列，統一用 td 比較安全
                    // 空白 cell 也要渲染，保持對齊
                    const td = document.createElement('td');
                    td.textContent = (cell !== undefined && cell !== null) ? String(cell).trim() : '';
                    tr.appendChild(td);
                });
                table.appendChild(tr);
            });
            container.appendChild(table);

        } else if (item.type === 'image') {
            const div = document.createElement('div');
            div.className = 'intro-item';

            // 如果有連結，包裹 a 標籤
            let container = div;
            if (item.link) {
                const a = document.createElement('a');
                a.href = item.link;
                a.target = '_blank';
                div.appendChild(a);
                container = a;
            }

            const img = document.createElement('img');
            // 這裡直接使用處理好的 value 作為 src，不再呼叫 getImagePath (因為 processIntroData 已經處理過了)
            img.src = item.value;
            img.alt = '介紹圖片';
            img.className = 'intro-image';

            // 圖片錯誤處理
            img.onerror = function () {
                // 如果是我們自己處理過路徑的圖片，嘗試用原始路徑重試可能無意義(因為原始路徑是 /images/...)
                // 但 tryAlternativeImageFormats 會嘗試不同的副檔名
                tryAlternativeImageFormats(this, item.original || item.value);
            };

            container.appendChild(img);
            if (!item.link) {
                // 已經在上面 append 到 container 了，這裡不需要再次 append?
                // 原本的邏輯有點怪:
                // if (item.link) container = a; 
                // container.appendChild(img); -> img 在 a 裡
                // if (!item.link) container.appendChild(img); -> img 在 div 裡
                // 但如果 container = div, 就會 append 兩次?
                // 不, if (!item.link) container IS div.
                // let's fix this logic to be safer
            }

            // 修正 DOM 結構邏輯
            if (item.link) {
                // 已經 append 到 container (a) 了
            } else {
                div.appendChild(img);
            }

            containerElement.appendChild(div);

        } else {
            const div = document.createElement('div');
            div.className = 'intro-item';
            const p = document.createElement('p');
            p.className = 'intro-text';
            p.textContent = item.value;
            div.appendChild(p);
            container.appendChild(div);
        }
    });
}

// Helper: 轉換文字中的 URL 為連結
function linkify(text) {
    if (!text) return '';
    // 簡單的 URL 正則表達式
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    return text.replace(urlRegex, function (url) {
        return '<a href="' + url + '" target="_blank" class="intro-link">' + url + '</a>';
    });
}

// 載入並顯示介紹頁面 (升級版: 傳遞 sheet 物件)
function loadAndDisplayIntro(sheetName) {
    if (!currentWorkbook) return;

    const sheet = currentWorkbook.Sheets[sheetName];
    if (!sheet) {
        alert('找不到「' + sheetName + '」工作表');
        return;
    }

    const sheetData = XLSX.utils.sheet_to_json(sheet, { header: 1 });
    // 傳入 sheet 物件以獲取超連結資訊
    const content = processIntroData(sheetData, sheet);

    renderIntroContent(content);
    switchView('intro');

    // 推送歷史記錄
    pushHistory('intro', { sheetName });
}

// 處理介紹頁面資料 (升級版: 支援表格與超連結)
function processIntroData(data, sheet) {
    const content = [];
    let currentTable = [];

    data.forEach((row, rowIndex) => {
        // 過濾掉完全空白的行，但保留原來的 row 物件以便取得 cell 資料
        // 因為 sheet_to_json(header:1) 回傳的是數值陣列，我們需要同時查找 sheet 物件中的 cell

        let hasContent = false;
        const processedRow = [];

        row.forEach((cellValue, colIndex) => {
            if (cellValue !== undefined && cellValue !== null && String(cellValue).trim() !== '') {
                hasContent = true;

                // 取得 Excel 儲存格位址 (例如 A1, B2)
                const cellAddress = XLSX.utils.encode_cell({ c: colIndex, r: rowIndex });
                const cellObject = sheet ? sheet[cellAddress] : null;

                // 檢查是否有 Excel 超連結
                let linkTarget = null;
                if (cellObject && cellObject.l && cellObject.l.Target) {
                    linkTarget = cellObject.l.Target;
                }

                processedRow.push({
                    value: String(cellValue).trim(),
                    link: linkTarget
                });
            } else {
                // 空白儲存格也佔位
                processedRow.push(null);
            }
        });

        // 下面的邏輯判斷是否為表格行
        // 為了簡單起見，我們計算非空單元格的數量
        const nonEmptyCells = processedRow.filter(cell => cell !== null);

        if (nonEmptyCells.length === 0) {
            // 空行，結束目前表格
            if (currentTable.length > 0) {
                content.push({ type: 'table', rows: currentTable });
                currentTable = [];
            }
            return;
        }

        if (nonEmptyCells.length > 1) {
            // 多欄位 -> 視為表格行
            // 需要過濾掉尾部的 null，但保留中間的 null 以維持對齊? 
            // 這裡簡單處理：直接存整個 processedRow，渲染時處理 null
            currentTable.push(processedRow);
        } else {
            // 單欄位
            if (currentTable.length > 0) {
                content.push({ type: 'table', rows: currentTable });
                currentTable = [];
            }

            const item = nonEmptyCells[0]; // 取得該行唯一的資料
            const text = item.value;

            // 判斷是否為圖片
            // 規則: 包含 /images 或 常見圖片副檔名
            if (text.includes('/images') || text.match(/\.(jpg|jpeg|png|gif|webp|bmp)$/i)) {
                let imageValue = text;

                // 如果包含 /images，則移除該路徑前綴，只保留檔名
                // 這樣 renderIntroContent 接手後，會再自動加上 IMAGE_BASE_PATH (../Digimonwiki/images/)
                // 達成使用者的需求: 顯示 H:\Antigravity make\Digimonwiki\images 下的檔案
                if (text.includes('images/')) {
                    const parts = text.split('images/');
                    if (parts.length > 1) {
                        imageValue = parts[parts.length - 1]; // 取得 images/ 後面的部分
                    }
                }

                content.push({ type: 'image', value: imageValue, link: item.link, original: text });
            } else {
                content.push({ type: 'text', value: text, link: item.link });
            }
        }
    });

    if (currentTable.length > 0) {
        content.push({ type: 'table', rows: currentTable });
    }

    return content;
}

// 渲染介紹內容 (升級版: 支援表格與超連結)
function renderIntroContent(content) {
    const container = document.getElementById('introContainer');
    container.innerHTML = '';

    if (content.length === 0) {
        container.innerHTML = '<div class="no-data">沒有找到任何介紹內容</div>';
        return;
    }

    content.forEach(item => {
        if (item.type === 'table') {
            const table = document.createElement('table');
            table.className = 'intro-table';

            item.rows.forEach(row => {
                const tr = document.createElement('tr');

                // 移除行尾的 null (可選，視需求而定)
                // 這裡我們只渲染到最後一個非空 cell
                let lastNonEmptyIndex = -1;
                for (let i = row.length - 1; i >= 0; i--) {
                    if (row[i] !== null) {
                        lastNonEmptyIndex = i;
                        break;
                    }
                }

                for (let i = 0; i <= lastNonEmptyIndex; i++) {
                    const cellData = row[i];
                    const td = document.createElement('td');

                    if (cellData) {
                        const text = cellData.value;

                        // 判斷是否為圖片路徑
                        if (text.includes('/images') || text.match(/\.(jpg|jpeg|png|gif|webp|bmp)$/i)) {
                            // 處理圖片路徑
                            let imageValue = text;
                            if (text.includes('images/')) {
                                const parts = text.split('images/');
                                if (parts.length > 1) {
                                    imageValue = parts[parts.length - 1];
                                }
                            }

                            // 建立圖片元素
                            const img = document.createElement('img');
                            img.src = getImagePath(imageValue);
                            img.alt = imageValue;
                            img.className = 'intro-table-image';
                            img.style.maxWidth = '100px';
                            img.style.maxHeight = '100px';
                            img.onerror = function () {
                                tryAlternativeImageFormats(this, imageValue);
                            };
                            td.appendChild(img);
                        } else {
                            // 一般文字處理（加入顏色代碼支援）
                            let cellHtml = parseColorTags(linkify(text)); // 先處理連結，再處理顏色

                            // 如果有 Excel 原生超連結，則包裹整個內容
                            if (cellData.link) {
                                cellHtml = '<a href="' + cellData.link + '" target="_blank" class="intro-link">' + cellHtml + '</a>';
                            }

                            td.innerHTML = cellHtml;
                        }
                    } else {
                        td.textContent = '';
                    }
                    tr.appendChild(td);
                }
                table.appendChild(tr);
            });
            container.appendChild(table);

        } else if (item.type === 'image') {
            const div = document.createElement('div');
            div.className = 'intro-item';

            const img = document.createElement('img');
            img.src = getImagePath(item.value);
            img.alt = '介紹圖片';
            img.className = 'intro-image';
            img.onerror = function () {
                tryAlternativeImageFormats(this, item.value);
            };

            if (item.link) {
                const a = document.createElement('a');
                a.href = item.link;
                a.target = '_blank';
                a.appendChild(img);
                div.appendChild(a);
            } else {
                div.appendChild(img);
            }
            container.appendChild(div);

        } else {
            const div = document.createElement('div');
            div.className = 'intro-item';
            const p = document.createElement('p');
            p.className = 'intro-text';

            // 處理顏色代碼和連結
            p.innerHTML = parseColorTags(linkify(item.value));

            if (item.link) {
                const a = document.createElement('a');
                a.href = item.link;
                a.target = '_blank';
                a.innerHTML = p.innerHTML;
                p.innerHTML = '';
                p.appendChild(a);
            }

            div.appendChild(p);
            container.appendChild(div);
        }
    });
}

// 更新網頁標題 (讀取「訊息」分頁)
function updatePageTitle(workbook) {
    // 嘗試讀取「訊息」分頁
    const messageSheet = workbook.Sheets['訊息'] || workbook.Sheets['Message'];
    if (!messageSheet) return;

    const data = XLSX.utils.sheet_to_json(messageSheet, { header: 1 });

    // 從第三列開始搜尋 (index 2)
    // Excel 結構假設:
    // Row 1: 標題
    // Row 2: 標題
    // Row 3+: 資料
    for (let i = 2; i < data.length; i++) {
        const row = data[i];

        // 欄位1 (index 0) 為編號
        // 尋找編號為 1 的資料
        if (row[0] == 1) {
            // 欄位2 (index 1) 為標題內容
            const title = row[1];
            if (title && String(title).trim() !== '') {
                document.querySelector('header h1').textContent = title;
            }
            break;
        }
    }
}

// ==========================================
// 文字顏色標記解析功能
// ==========================================

// 解析顏色標記語法 (例如: [red]文字[/red])
function parseColorTags(text) {
    if (!text) return '';

    // 顏色映射表
    const colorMap = {
        'red': '#e53e3e',           // 紅色
        'green': '#38a169',         // 綠色
        'blue': '#3182ce',          // 藍色
        'yellow': '#d69e2e',        // 黃色
        'orange': '#dd6b20',        // 橙色
        'purple': '#805ad5',        // 紫色
        'pink': '#d53f8c',          // 粉紅色
        'cyan': '#00b5d8',          // 青色
        'gray': '#718096',          // 灰色
        'black': '#1a202c',         // 黑色
        'white': '#ffffff',         // 白色
        'gold': '#d4af37',          // 金色
        'silver': '#c0c0c0',        // 銀色
        'brown': '#8b4513'          // 棕色
    };

    let result = String(text);

    // 替換所有顏色標記
    for (const [color, hex] of Object.entries(colorMap)) {
        const regex = new RegExp(`\\[${color}\\](.*?)\\[\\/${color}\\]`, 'gi');
        result = result.replace(regex, `<span style="color: ${hex};">$1</span>`);
    }

    return result;
}

// ==========================================
// 版本篩選功能 (超超代分頁專用)
// ==========================================

// 從訊息分頁讀取版本篩選選項
function getVersionFilters() {
    if (!currentWorkbook) return [];

    const messageSheet = currentWorkbook.Sheets['訊息'] || currentWorkbook.Sheets['Message'];
    if (!messageSheet) return [];

    const data = XLSX.utils.sheet_to_json(messageSheet, { header: 1 });
    const filters = [];

    // 讀取編號 2~4 的資料
    for (let i = 2; i < data.length; i++) {
        const row = data[i];
        const id = row[0]; // 欄位1: 編號

        if (id >= 2 && id <= 4) {
            const filterText = row[1]; // 欄位2: 篩選文字
            if (filterText && String(filterText).trim() !== '') {
                filters.push({
                    id: id,
                    text: String(filterText).trim()
                });
            }
        }
    }

    return filters;
}

// 新增版本篩選器
function addVersionFilter(data) {
    const container = document.getElementById('cardContainer');
    if (!container) return;

    // 檢查是否已存在篩選器，避免重複新增
    let filterContainer = document.getElementById('versionFilterContainer');
    if (filterContainer) {
        filterContainer.remove();
    }

    // 從資料中提取所有版本（排除空白和重複）
    const versions = new Set();
    data.forEach(item => {
        if (item.version && String(item.version).trim() !== '') {
            versions.add(String(item.version).trim());
        }
    });

    // 轉換為陣列並排序
    const versionArray = Array.from(versions).sort();

    // 如果沒有版本資訊，不顯示篩選器
    if (versionArray.length === 0) {
        return;
    }

    // 建立篩選器容器
    filterContainer = document.createElement('div');
    filterContainer.id = 'versionFilterContainer';
    filterContainer.className = 'filter-container';

    // 建立下拉選單
    const select = document.createElement('select');
    select.id = 'versionFilter';
    select.className = 'version-filter';

    // 新增「全部」選項
    const allOption = document.createElement('option');
    allOption.value = '';
    allOption.textContent = '全部版本';
    select.appendChild(allOption);

    // 新增版本選項
    versionArray.forEach(version => {
        const option = document.createElement('option');
        option.value = version;
        option.textContent = version;
        select.appendChild(option);
    });

    // 新增標籤
    const label = document.createElement('label');
    label.htmlFor = 'versionFilter';
    label.textContent = '版本篩選：';
    label.className = 'filter-label';

    filterContainer.appendChild(label);
    filterContainer.appendChild(select);

    // 插入到卡片容器最前面
    container.insertBefore(filterContainer, container.firstChild);

    // 綁定篩選事件
    select.addEventListener('change', (e) => {
        filterCardsByVersion(e.target.value);
    });
}

// 依版本篩選卡片
function filterCardsByVersion(version) {
    const cards = document.querySelectorAll('.detail-card');

    cards.forEach(card => {
        if (!version) {
            // 顯示全部
            card.style.display = '';
        } else {
            // 取得卡片的版本資訊
            const cardVersion = card.dataset.version || '';
            if (cardVersion === version) {
                card.style.display = '';
            } else {
                card.style.display = 'none';
            }
        }
    });
}

// ==========================================
// History API - 瀏覽器歷史記錄管理
// ==========================================

// 推送新的歷史記錄
function pushHistory(view, data = {}) {
    const state = { view, ...data };
    history.pushState(state, '', '');
}

// 根據狀態還原視圖
function restoreView(state) {
    if (!currentWorkbook) {
        switchView('welcome');
        return;
    }

    switch (state.view) {
        case 'home':
            // 重新顯示首頁，但不推送新的歷史記錄
            const homeSheet = currentWorkbook.Sheets['首頁'];
            if (homeSheet) {
                const homeData = XLSX.utils.sheet_to_json(homeSheet, { header: 1 });
                const processedData = processHomeData(homeData);
                displayHomeCards(processedData);
                switchView('home');
            }
            break;
        case 'detail':
            if (state.sheetName) {
                const sheet = currentWorkbook.Sheets[state.sheetName];
                if (sheet) {
                    const sheetData = XLSX.utils.sheet_to_json(sheet, { header: 1 });
                    const processedData = processDetailData(sheetData, state.sheetName);
                    displayDetailCards(processedData);
                    switchView('detail');
                }
            }
            break;
        case 'intro':
            if (state.sheetName) {
                const sheet = currentWorkbook.Sheets[state.sheetName];
                if (sheet) {
                    const sheetData = XLSX.utils.sheet_to_json(sheet, { header: 1 });
                    const content = processIntroData(sheetData, sheet);
                    renderIntroContent(content);
                    switchView('intro');
                }
            }
            break;
        default:
            switchView('welcome');
    }
}

// 監聽瀏覽器上一頁/下一頁事件
window.addEventListener('popstate', (event) => {
    if (event.state) {
        restoreView(event.state);
    } else {
        // 沒有狀態，顯示歡迎頁面
        switchView('welcome');
    }
});


document.addEventListener('DOMContentLoaded', () => {
    // 綁定載入按鈕
    const loadBtn = document.getElementById('loadBtn');
    const fileInput = document.getElementById('fileInput');

    if (loadBtn && fileInput) {
        // 使用 onclick 覆蓋舊事件，確保只觸發一次
        loadBtn.onclick = () => {
            fileInput.click();
        };

        // 綁定檔案選擇事件
        fileInput.onchange = (e) => {
            const file = e.target.files[0];
            if (file) {
                loadExcelFile(file);
                // 重置 value 允許重複選擇同檔名檔案
                fileInput.value = '';
            }
        };
    }
});






// 切換進化路線折疊狀態
function toggleEvolutionPaths(button) {
    const section = button.closest('.evolution-paths-section');
    const content = section.querySelector('.evolution-paths-content');
    const icon = button.querySelector('.collapse-icon');

    if (content.style.display === 'none') {
        content.style.display = 'block';
        icon.textContent = '▼';
        section.classList.remove('collapsed');
    } else {
        content.style.display = 'none';
        icon.textContent = '▶';
        section.classList.add('collapsed');
    }
}


// \u81ea\u52d5\u8f09\u5165\u9810\u8a2d JSON \u8cc7\u6599 (GitHub Pages \u7248\u672c)
async function autoLoadDefaultData() {
    try {
        const response = await fetch('data/sample-data.json');
        if (!response.ok) {
            throw new Error('Failed to load data');
        }
        const jsonData = await response.json();

        // 轉換 JSON 格式為 workbook 格式
        currentWorkbook = {
            SheetNames: Object.keys(jsonData),
            Sheets: {}
        };

        // 處理每個工作表
        Object.keys(jsonData).forEach(sheetName => {
            const sheetInfo = jsonData[sheetName];
            const sheetData = sheetInfo.data || sheetInfo;
            const sheetLinks = sheetInfo.links || null;

            // \u5efa\u7acb sheet \u7269\u4ef6
            const sheet = {};

            // \u586b\u5165\u8cc7\u6599
            sheetData.forEach((row, rowIndex) => {
                row.forEach((cellValue, colIndex) => {
                    // 檢查是否有超連結
                    const hasLink = sheetLinks && sheetLinks[rowIndex] && sheetLinks[rowIndex][colIndex];

                    // 跳過 null 值，除非有超連結（模擬 XLSX 行為）
                    if ((cellValue === null || cellValue === undefined) && !hasLink) return;

                    const cellAddress = XLSX.utils.encode_cell({ r: rowIndex, c: colIndex });
                    // 判斷資料類型
                    let cellType = 's';
                    if (typeof cellValue === 'number') cellType = 'n';
                    else if (typeof cellValue === 'boolean') cellType = 'b';
                    sheet[cellAddress] = { v: cellValue, t: cellType };

                    // 如果有連結資料，加入 hyperlink
                    if (hasLink) {
                        sheet[cellAddress].l = { Target: sheetLinks[cellAddress] };
                    }
                });
            });

            // \u8a2d\u5b9a range
            const maxRow = sheetData.length - 1;
            const maxCol = Math.max(...sheetData.map(row => row.length)) - 1;
            sheet['!ref'] = XLSX.utils.encode_range({
                s: { r: 0, c: 0 },
                e: { r: maxRow, c: maxCol }
            });

            currentWorkbook.Sheets[sheetName] = sheet;
        });

        // \u986f\u793a\u9996\u9801
        showHomeView();
    } catch (error) {
        console.error('Error loading data:', error);
        document.getElementById('welcomeView').innerHTML =
            '\u003ch2\u003e\u8cc7\u6599\u8f09\u5165\u5931\u6557\u003c/h2\u003e\u003cp\u003e\u7121\u6cd5\u8f09\u5165\u9810\u8a2d\u8cc7\u6599\uff0c\u8acb\u6aa2\u67e5 data/sample-data.json \u662f\u5426\u5b58\u5728\u3002\u003c/p\u003e';
    }
}
