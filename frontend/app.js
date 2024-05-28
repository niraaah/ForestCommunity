import express from 'express';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import postRoute from '../backend/route/postRoute.js'; // 라우터 경로에 맞게 수정하세요

const app = express();

const port = 8080;

// 현재 파일의 URL에서 디렉토리 경로를 추출
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname));

// 모든 요청을 로깅
app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
});

// API 라우터 설정
app.use('/api', postRoute);

app.get('/', (req, res) => {
    res.redirect('./html/index.html');
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
