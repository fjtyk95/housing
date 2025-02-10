import { searchRakutenProducts } from './rakuten-api.js';

document.getElementById('space-search').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const searchButton = e.target.querySelector('button[type="submit"]');
    const resultsContainer = document.querySelector('.results-container');
    
    try {
        // 入力値の検証
        const dimensions = {
            width: Math.max(1, parseInt(document.getElementById('width').value)),
            depth: Math.max(1, parseInt(document.getElementById('depth').value)),
            height: Math.max(1, parseInt(document.getElementById('height').value))
        };

        // 値が無効な場合のエラー処理
        if (Object.values(dimensions).some(val => isNaN(val) || val <= 0)) {
            throw new Error('サイズは1以上の数値を入力してください。');
        }
        
        // ローディング状態の表示
        searchButton.disabled = true;
        searchButton.innerHTML = '検索中...';
        resultsContainer.classList.add('loading');
        
        const furnitureType = document.getElementById('furniture-type').value;
        
        const results = await searchRakutenProducts(dimensions, furnitureType);
        displaySearchResults(results);

    } catch (error) {
        // エラーメッセージの表示
        const errorMessage = document.createElement('div');
        errorMessage.className = 'error-message';
        errorMessage.textContent = error.message || '検索中にエラーが発生しました。しばらく経ってから再度お試しください。';
        resultsContainer.innerHTML = '';
        resultsContainer.appendChild(errorMessage);
    } finally {
        // ローディング状態の解除
        searchButton.disabled = false;
        searchButton.innerHTML = '検索する';
        resultsContainer.classList.remove('loading');
    }
});

// 検索結果表示関数を追加
function displaySearchResults(results) {
    const resultsGrid = document.querySelector('.results-grid');
    resultsGrid.innerHTML = ''; // 既存の結果をクリア

    if (results.length === 0) {
        const noResults = document.createElement('div');
        noResults.className = 'no-results';
        noResults.textContent = '条件に一致する商品が見つかりませんでした。';
        resultsGrid.appendChild(noResults);
        return;
    }

    results.forEach(item => {
        const card = createProductCard(item);
        resultsGrid.insertAdjacentHTML('beforeend', card);
    });
}

function createProductCard(item) {
    return `
        <div class="furniture-card">
            <img src="${item.image}" alt="${item.title}">
            <div class="furniture-info">
                <h3>${item.title}</h3>
                <p class="dimensions">${formatDimensions(item.dimensions)}</p>
                <p class="price">${item.price}</p>
                <div class="tags">
                    ${item.features.map(feature => 
                        `<span class="tag">${feature}</span>`
                    ).join('')}
                </div>
                <a href="${item.url}" target="_blank">
                    <button class="details-btn">楽天市場で見る</button>
                </a>
            </div>
        </div>
    `;
}

function formatDimensions(dimensions) {
    if (!dimensions.width && !dimensions.depth && !dimensions.height) {
        return '寸法情報なし';
    }
    return `幅${dimensions.width || '?'}cm × 奥行き${dimensions.depth || '?'}cm × 高さ${dimensions.height || '?'}cm`;
} 