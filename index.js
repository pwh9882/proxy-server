const express = require('express');
const httpProxy = require('http-proxy');
const cors = require('cors');

const app = express();
const PORT = 8082;

// CORS 설정
app.use(cors());

// JSON 파싱 미들웨어
app.use(express.json());

// 프록시 서버 생성
const proxy = httpProxy.createProxyServer({});

// 에러 핸들링
proxy.on('error', (err, req, res) => {
    console.error('Proxy error:', err);
    res.status(500).send('Proxy error');
});

// 요청 시 경로 및 쿼리 설정
proxy.on('proxyReq', (proxyReq, req, res, options) => {
    const targetUrl = req.query.url;
    if (targetUrl) {
        const url = new URL(targetUrl);
        proxyReq.path = url.pathname + url.search;
    }
});

// /proxy 엔드포인트 설정
app.use('/proxy', (req, res) => {
    const targetUrl = req.query.url;
    if (!targetUrl) {
        return res.status(400).send('URL is required');
    }

    let url;
    try {
        url = new URL(targetUrl);
    } catch (err) {
        return res.status(400).send('Invalid URL');
    }

    // 프록시 요청
    proxy.web(req, res, {
        target: `${url.protocol}//${url.host}`,
        changeOrigin: true,
        secure: false, // HTTPS 대상일 경우 필요
        ignorePath: true, // path는 proxyReq에서 설정
    });
});

// 서버 시작
app.listen(PORT, () => {
    console.log(`Proxy server running on http://localhost:${PORT}`);
});
