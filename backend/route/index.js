import express from 'express';
import userRoute from './userRoute.js'; // 사용자 라우트
import postRoute from './postRoute.js'; // 게시물 라우트
import fileRoute from './fileRoute.js'; // 파일 라우트
import commentRoute from './commentRoute.js'; // 댓글 라우트

const router = express.Router();

// 각 라우트를 수동으로 설정
router.use(userRoute);
router.use(postRoute);
router.use(fileRoute);
router.use(commentRoute);

export default router;
