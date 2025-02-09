require('dotenv').config();
const express = require('express');
const crypto = require('crypto');
const axios = require('axios');

const router = express.Router();

// Amazon API認証情報
const {
    AMAZON_ACCESS_KEY,
    AMAZON_SECRET_KEY,
    AMAZON_PARTNER_TAG
} = process.env;

// AWS署名v4の生成
function generateAWSSignature(stringToSign, secretKey, date) {
    const dateKey = crypto.createHmac('sha256', 'AWS4' + secretKey)
        .update(date.substr(0, 8))
        .digest();
    
    const dateRegionKey = crypto.createHmac('sha256', dateKey)
        .update('jp')
        .digest();
    
    const dateRegionServiceKey = crypto.createHmac('sha256', dateRegionKey)
        .update('ProductAdvertisingAPI')
        .digest();
    
    const signingKey = crypto.createHmac('sha256', dateRegionServiceKey)
        .update('aws4_request')
        .digest();
    
    return crypto.createHmac('sha256', signingKey)
        .update(stringToSign)
        .digest('hex');
}

router.post('/search', async (req, res) => {
    try {
        const { dimensions, furnitureType } = req.body;
        
        // リクエストヘッダーの準備
        const date = new Date().toISOString().replace(/[:-]|\.\d{3}/g, '');
        const headers = {
            'content-encoding': 'amz-1.0',
            'content-type': 'application/json; charset=utf-8',
            'host': 'webservices.amazon.co.jp',
            'x-amz-date': date,
            'x-amz-target': 'com.amazon.paapi5.v1.ProductAdvertisingAPIv1.SearchItems'
        };

        // 署名の生成
        const signature = generateAWSSignature(
            JSON.stringify(req.body),
            AMAZON_SECRET_KEY,
            date
        );

        // Amazon APIへのリクエスト
        const response = await axios({
            method: 'post',
            url: 'https://webservices.amazon.co.jp/paapi5/searchitems',
            headers: {
                ...headers,
                'Authorization': `AWS4-HMAC-SHA256 Credential=${AMAZON_ACCESS_KEY}/${date.substr(0, 8)}/jp/ProductAdvertisingAPI/aws4_request, SignedHeaders=content-encoding;content-type;host;x-amz-date;x-amz-target, Signature=${signature}`
            },
            data: req.body
        });

        res.json(response.data);
    } catch (error) {
        console.error('API Error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

module.exports = router; 