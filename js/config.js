// 環境設定
const CONFIG = {
    production: {
        API_ENDPOINT: 'https://api.your-domain.com',
        ENABLE_LOGGING: false
    },
    development: {
        API_ENDPOINT: window.location.origin,
        ENABLE_LOGGING: true
    }
};

// 開発環境と本番環境の判定（ブラウザ環境用）
const ENV = window.location.hostname === 'localhost' ? 'development' : 'production';

export const currentConfig = CONFIG[ENV]; 