// 楽天APIの設定
const RAKUTEN_CONFIG = {
    APPLICATION_ID: 'e06e2a5afcf14b52139c1fb6c58e9dbc',
    // AFFILIATE_ID: '/* ここにアフィリエイトIDを入力（任意） */',
    BASE_URL: 'https://app.rakuten.co.jp/services/api/IchibaItem/Search/20170706'
};

// 商品検索関数
async function searchRakutenProducts(dimensions, furnitureType) {
    try {
        const keywords = generateSearchKeywords(dimensions, furnitureType);
        const params = new URLSearchParams({
            applicationId: RAKUTEN_CONFIG.APPLICATION_ID,
            affiliateId: RAKUTEN_CONFIG.AFFILIATE_ID,
            keyword: keywords,
            genreId: getFurnitureGenreId(furnitureType),
            sort: '+itemPrice',
            hits: 30
        });

        const response = await fetch(`${RAKUTEN_CONFIG.BASE_URL}?${params}`);
        
        if (!response.ok) {
            throw new Error('API request failed');
        }

        const data = await response.json();
        return processSearchResults(data);

    } catch (error) {
        if (currentConfig.ENABLE_LOGGING) {
            console.error('検索エラー:', error);
        }
        throw error;
    }
}

// 検索キーワード生成
function generateSearchKeywords(dimensions, furnitureType) {
    const { width, depth, height } = dimensions;
    let keywords = '';

    switch (furnitureType) {
        case 'storage':
            keywords = '収納家具';
            break;
        case 'table':
            keywords = 'テーブル デスク';
            break;
        case 'sofa':
            keywords = 'ソファ';
            break;
        case 'bed':
            keywords = 'ベッド';
            break;
        case 'shelf':
            keywords = '棚 シェルフ';
            break;
        default:
            keywords = '家具';
    }

    // サイズを含めたキーワードを生成
    return `${keywords} ${width}cm ${depth}cm ${height}cm`;
}

// 楽天の家具ジャンルIDを取得
function getFurnitureGenreId(furnitureType) {
    // 楽天市場のジャンルID
    const genreIds = {
        storage: '566017',    // 収納家具
        table: '566015',      // テーブル
        sofa: '566014',       // ソファ
        bed: '566016',        // ベッド
        shelf: '566017',      // 棚・収納（storageと同じカテゴリ）
        all: '566012'         // インテリア・寝具・収納
    };

    return genreIds[furnitureType] || genreIds.all;
}

// 検索結果の処理
function processSearchResults(response) {
    if (!response.Items || response.Items.length === 0) {
        return [];
    }

    return response.Items.map(item => ({
        id: item.Item.itemCode,
        title: item.Item.itemName,
        image: item.Item.mediumImageUrls[0].imageUrl.replace('?_ex=128x128', '?_ex=400x400'),
        price: `¥${item.Item.itemPrice.toLocaleString()}`,
        dimensions: extractDimensions(item.Item.itemName), // 商品名から寸法を抽出
        url: item.Item.itemUrl,
        shopName: item.Item.shopName,
        reviewAverage: item.Item.reviewAverage,
        features: [
            item.Item.shopName,
            `評価: ${item.Item.reviewAverage}`,
            item.Item.taxFlag === 1 ? '税込' : '税別'
        ]
    }));
}

// 商品名から寸法情報を抽出（簡易的な実装）
function extractDimensions(itemName) {
    const dimensions = {
        width: null,
        depth: null,
        height: null
    };

    // 商品名から寸法を抽出する正規表現
    const regex = /(\d+)×(\d+)×(\d+)/;
    const match = itemName.match(regex);

    if (match) {
        dimensions.width = match[1];
        dimensions.depth = match[2];
        dimensions.height = match[3];
    }

    return dimensions;
}

export { searchRakutenProducts }; 