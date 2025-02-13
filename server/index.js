const express = require('express');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const cors = require('cors');
const apiProxy = require('./api-proxy');

const app = express();

// セキュリティヘッダーの設定
app.use(helmet());

// レート制限の設定
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15分
    max: 100 // IPアドレスごとのリクエスト制限
});
app.use('/api/', limiter);

// CORSの設定
app.use(cors({
    origin: process.env.ALLOWED_ORIGINS?.split(',') || 'https://fjtyk95.github.io/housing/index'
}));

app.use(express.json());
app.use('/api', apiProxy);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
}); 