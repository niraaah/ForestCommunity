import mysql from 'mysql2/promise';
import * as postModel from '../model/postModel.js';

/**
 * 게시글 작성
 * 파일 업로드
 * 게시글 목록 조회
 * 게시글 상세 조회
 * 게시글 수정
 */

// 게시글 작성
export const writePost = async (request, response) => {
    try {
        if (request.attachFilePath === undefined) request.attachFilePath = null;
        if (!request.body.postTitle)
            return response.status(400).json({
                status: 400,
                message: 'invalid_post_title',
                data: null,
            });
        if (request.body.postTitle.length > 26)
            return response.status(400).json({
                status: 400,
                message: 'invalid_post_title_length',
                data: null,
            });
        if (!request.body.postContent)
            return response.status(400).json({
                status: 400,
                message: 'invalid_post_content',
                data: null,
            });
        if (request.body.postContent.length > 1500)
            return response.status(400).json({
                status: 400,
                message: 'invalid_post_content_length',
                data: null,
            });

        const { postTitle, postContent, attachFilePath } = request.body;
        const userId = request.headers.userid;

        const requestData = {
            userId: mysql.escape(userId),
            postTitle: mysql.escape(postTitle),
            postContent: mysql.escape(postContent),
            attachFilePath:
                attachFilePath === null ? null : mysql.escape(attachFilePath),
        };
        const results = await postModel.writePlainPost(requestData, response);

        if (!results || results === null)
            return response.status(500).json({
                status: 500,
                message: 'failed_to_write_post',
                data: null,
            });

        if (attachFilePath != null) {
            const reqFileData = {
                userId: mysql.escape(userId),
                postId: results.insertId,
                filePath: mysql.escape(attachFilePath),
            };

            const resFileData = await postModel.uploadFile(
                reqFileData,
                response,
            );
            results.filePath = resFileData;
        }

        return response.status(201).json({
            status: 201,
            message: 'write_post_success',
            data: results,
        });
    } catch (error) {
        console.error(error);
        return response.status(500).json({
            status: 500,
            message: 'internal_server_error',
            data: null,
        });
    }
};

// 파일 업로드
export const uploadFile = async (request, response) => {
    try {
        if (!request.filePath)
            return response.status(400).json({
                status: 400,
                message: 'invalid_file_path',
                data: null,
            });

        const { userId, postId, filePath } = request.body;

        const requestData = {
            userId,
            postId,
            filePath,
        };
        const results = await postModel.uploadFile(requestData, response);

        if (!results || results === null)
            return response.status(500).json({
                status: 500,
                message: 'internal_server_error',
                data: null,
            });

        return response.status(201).json({
            status: 201,
            message: null,
            data: results,
        });
    } catch (error) {
        console.error(error);
        return response.status(500).json({
            status: 500,
            message: 'internal_server_error',
            data: null,
        });
    }
};

export const getPosts = async (request, response) => {
    try {
        const { offset, limit, sortBy } = request.query;

        if (!offset || !limit) {
            return response.status(400).json({
                status: 400,
                message: 'invalid_offset_or_limit',
                data: null,
            });
        }

        const requestData = {
            offset: Number(offset),
            limit: Number(limit),
            sortBy: sortBy || 'dateDesc', // Default to 'dateDesc' if sortBy is not provided
        };

        console.log(`Request data: offset=${requestData.offset}, limit=${requestData.limit}, sortBy=${requestData.sortBy}`);

        const results = await postModel.getPosts(requestData, response);

        if (!results || results.length === 0) {
            return response.status(404).json({
                status: 404,
                message: 'not_a_single_post',
                data: null,
            });
        }

        return response.status(200).json({
            status: 200,
            message: null,
            data: results,
        });
    } catch (error) {
        console.error(error);
        return response.status(500).json({
            status: 500,
            message: 'internal_server_error',
            data: null,
        });
    }
};

// 게시글 상세 조회
export const getPost = async (request, response) => {
    try {
        if (!request.params.post_id)
            return response.status(400).json({
                status: 400,
                message: 'invalid_post_id',
                data: null,
            });

        const postId = request.params.post_id;

        const requestData = {
            postId,
        };
        const results = await postModel.getPost(requestData);

        if (!results || results.length === null)
            return response.status(404).json({
                status: 404,
                message: 'not_a_single_post',
                data: null,
            });

        return response.status(200).json({
            status: 200,
            message: null,
            data: results,
        });
    } catch (error) {
        console.error(error);
        return response.status(500).json({
            status: 500,
            message: 'internal_server_error',
            data: null,
        });
    }
};


// 게시글 수정
export const updatePost = async (request, response) => {
    try {
        if (!request.params.post_id)
            return response.status(400).json({
                status: 400,
                message: 'invalid_post_id',
                data: null,
            });

        if (request.body.postTitle.length > 26)
            return response.status(400).json({
                status: 400,
                message: 'invalid_post_title_length',
                data: null,
            });

        const postId = request.params.post_id;
        const userId = request.headers.userid;
        const { postTitle, postContent, attachFilePath } = request.body;

        const requestData = {
            postId: mysql.escape(postId),
            userId: mysql.escape(userId),
            postTitle: mysql.escape(postTitle),
            postContent: mysql.escape(postContent),
            attachFilePath:
                attachFilePath === undefined
                    ? null
                    : mysql.escape(attachFilePath),
        };
        const results = await postModel.updatePost(requestData, response);

        if (!results || results === null)
            return response.status(404).json({
                status: 404,
                message: 'not_a_single_post',
                data: null,
            });

        return response.status(200).json({
            status: 200,
            message: 'update_post_success',
            data: results,
        });
    } catch (error) {
        console.error(error);
        return response.status(500).json({
            status: 500,
            message: 'internal_server_error',
            data: null,
        });
    }
};

// 게시글 삭제
export const softDeletePost = async (request, response) => {
    try {
        if (!request.params.post_id)
            return response.status(400).json({
                status: 400,
                message: 'invalid_post_id',
                data: null,
            });

        const postId = request.params.post_id;

        const requestData = {
            postId: mysql.escape(postId),
        };
        const results = await postModel.softDeletePost(requestData, response);

        if (!results || results === null)
            return response.status(404).json({
                status: 404,
                message: 'not_a_single_post',
                data: null,
            });

        return response.status(200).json({
            status: 200,
            message: 'delete_post_success',
            data: null,
        });
    } catch (error) {
        console.error(error);
        return response.status(500).json({
            status: 500,
            message: 'internal_server_error',
            data: null,
        });
    }
};


export const updateLike = async (req, res) => {
    const userId = req.headers.userid;
    const postId = req.params.post_id;

    if (!postId || !userId) {
        return res.status(400).json({ status: 400, message: 'invalid_post_or_user_id', data: null });
    }

    try {
        const requestData = {
            postId: mysql.escape(postId),
            userId: mysql.escape(userId),
        };

        // Check if the user has already liked the post
        const userLiked = await postModel.checkIfUserLikedPost(userId, postId);
        if (userLiked) {
            return res.status(400).json({ status: 400, message: 'already_liked', data: null });
        }

        const updatedLikeData = await postModel.updateLikes(requestData);
        return res.status(200).json({ status: 200, message: 'like_updated_successfully', data: updatedLikeData });
    } catch (error) {
        if (error.message === 'already_liked') {
            return res.status(400).json({ status: 400, message: 'already_liked', data: null });
        }
        console.error(error);
        return res.status(500).json({ status: 500, message: 'internal_server_error', data: null });
    }
};


// postId로 좋아요 조회 함수
const getLikesById = async (postId) => {
    try {
        const requestData = {
            postId: mysql.escape(postId),
        };
        const results = await postModel.getLikes(requestData);

        if (!results) {
            return null;
        }

        return results;
    } catch (error) {
        console.error(error);
        return null;
    }
};


// 좋아요 조회
export const getLikes = async (request, response) => {
    try {
        const postId = request.params.post_id;

        if (!postId) {
            return response.status(400).json({
                status: 400,
                message: 'invalid_post_id',
                data: null,
            });
        }

        const requestData = {
            postId: mysql.escape(postId),
        };
        const results = await postModel.getLikes(requestData);

        if (!results) {
            return response.status(404).json({
                status: 404,
                message: 'post_not_found',
                data: null,
            });
        }

        return response.status(200).json({
            status: 200,
            message: 'get_likes_success',
            data: results,
        });
    } catch (error) {
        console.error(error);
        return response.status(500).json({
            status: 500,
            message: 'internal_server_error',
            data: null,
        });
    }
};
