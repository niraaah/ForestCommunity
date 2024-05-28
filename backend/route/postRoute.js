// postRoute.js
import express from 'express';
import * as postController from '../controller/postController.js';
import isLoggedIn from '../util/authUtil.js';

const router = express.Router();

router.get('/posts', isLoggedIn, (req, res, next) => {
    console.log('Received GET /posts with query:', req.query);
    next();
}, postController.getPosts);

router.get('/posts/:post_id', isLoggedIn, postController.getPost);
router.post('/posts', isLoggedIn, postController.writePost);
router.patch('/posts/:post_id', isLoggedIn, postController.updatePost);
router.delete('/posts/:post_id', isLoggedIn, postController.softDeletePost);

router.post('/posts/:post_id/likes', isLoggedIn, (req, res, next) => {
    console.log(`POST /posts/${req.params.post_id}/likes`);
    next();
}, postController.updateLike);

router.get('/posts/:post_id/likes', isLoggedIn, (req, res, next) => {
    console.log(`GET /posts/${req.params.post_id}/likes`);
    next();
}, postController.getLikes);

export default router;
