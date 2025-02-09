const CONFIG = {
    production: {
        API_ENDPOINT: 'https://api.your-domain.com',
        ENABLE_LOGGING: false
    },
    development: {
        API_ENDPOINT: 'http://localhost:3000',
        ENABLE_LOGGING: true
    }
};

const ENV = process.env.NODE_ENV || 'development';
export const currentConfig = CONFIG[ENV]; 