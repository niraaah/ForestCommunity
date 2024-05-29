import CommentItem from '../component/comment/comment.js';
import Dialog from '../component/dialog/dialog.js';
import Header from '../component/header/header.js';
import {
    authCheck,
    getCookie,
    getServerUrl,
    prependChild,
    padTo2Digits,
} from '../utils/function.js';
import {
    getPost,
    deletePost,
    writeComment,
    getComments,
    updateLike,
    getLikes,
} from '../api/boardRequest.js';

const DEFAULT_PROFILE_IMAGE = '/public/image/profile/default.jpg';
const MAX_COMMENT_LENGTH = 1000;
const HTTP_NOT_AUTHORIZED = 401;
const HTTP_OK = 200;

const getQueryString = name => {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(name);
};

const getBoardDetail = async postId => {
    const response = await getPost(postId);
    if (!response.ok)
        return new Error('게시글 정보를 가져오는데 실패하였습니다.');

    const data = await response.json();
    return data.data[0];
};

const setBoardDetail = data => {
    // 헤드 정보
    const titleElement = document.querySelector('.title');
    const createdAtElement = document.querySelector('.createdAt');
    const imgElement = document.querySelector('.img');
    const nicknameElement = document.querySelector('.nickname');

    titleElement.textContent = data.post_title;
    const date = new Date(data.created_at);
    const formattedDate = `${date.getFullYear()}-${padTo2Digits(date.getMonth() + 1)}-${padTo2Digits(date.getDate())} ${padTo2Digits(date.getHours())}:${padTo2Digits(date.getMinutes())}:${padTo2Digits(date.getSeconds())}`;
    createdAtElement.textContent = formattedDate;
    imgElement.src =
        data.profileImage !== undefined
            ? `${getServerUrl()}${data.profileImage}`
            : `${getServerUrl()}${DEFAULT_PROFILE_IMAGE}`;

    nicknameElement.textContent = data.nickname;

    // 바디 정보
    const contentImgElement = document.querySelector('.contentImg');
    if (data.filePath) {
        console.log(data.filePath);
        const img = document.createElement('img');
        img.src = getServerUrl() + data.filePath;
        contentImgElement.appendChild(img);
    }
    const contentElement = document.querySelector('.content');
    contentElement.textContent = data.post_content;

    const viewCountElement = document.querySelector('.viewCount h3');
    // hits에 K, M 이 포함되어 있을 경우 그냥 출력
    // 포함되어 있지 않다면 + 1
    if (data.hits.includes('K') || data.hits.includes('M')) {
        viewCountElement.textContent = data.hits;
    } else {
        viewCountElement.textContent = (
            parseInt(data.hits, 10) + 1
        ).toLocaleString();
    }

    const commentCountElement = document.querySelector('.commentCount h3');
    commentCountElement.textContent = data.comment_count.toLocaleString();

    const likeCountElement = document.querySelector('.likeCount h3');
    likeCountElement.textContent = data.like.toLocaleString();
};

const setBoardModify = async (data, myInfo) => {
    if (myInfo.idx === data.writerId) {
        const modifyElement = document.querySelector('.hidden');
        modifyElement.classList.remove('hidden');

        const modifyBtnElement = document.querySelector('#deleteBtn');
        const postId = getQueryString('id');
        modifyBtnElement.addEventListener('click', () => {
            Dialog(
                '게시글을 삭제하시겠습니까?',
                '삭제한 내용은 복구 할 수 없습니다.',
                async () => {
                    const response = await deletePost(postId);
                    if (response.ok) {
                        window.location.href = '/';
                    } else {
                        Dialog('삭제 실패', '게시글 삭제에 실패하였습니다.');
                    }
                },
            );
        });

        const modifyBtnElement2 = document.querySelector('#modifyBtn');
        modifyBtnElement2.addEventListener('click', () => {
            window.location.href = `/html/board-modify.html?post_id=${data.post_id}`;
        });
    }
};

const getBoardComment = async id => {
    const response = await getComments(id);
    if (!response.ok) return [];
    const data = await response.json();
    if (data.status != HTTP_OK) return [];
    return data.data;
};

const setBoardComment = (data, myInfo) => {
    const commentListElement = document.querySelector('.commentList');
    if (commentListElement) {
        data.map(event => {
            const item = CommentItem(
                event,
                myInfo.userId,
                event.post_id,
                event.comment_id,
            );
            commentListElement.appendChild(item);
        });
    }
};

const addComment = async () => {
    const comment = document.querySelector('textarea').value;
    const pageId = getQueryString('id');

    const response = await writeComment(pageId, comment);

    if (response.ok) {
        window.location.reload();
    } else {
        Dialog('댓글 등록 실패', '댓글 등록에 실패하였습니다.');
    }
};

const inputComment = async () => {
    const textareaElement = document.querySelector(
        '.commentInputWrap textarea',
    );
    const commentBtnElement = document.querySelector('.commentInputBtn');

    if (textareaElement.value.length > MAX_COMMENT_LENGTH) {
        textareaElement.value = textareaElement.value.substring(
            0,
            MAX_COMMENT_LENGTH,
        );
    }
    if (textareaElement.value === '') {
        commentBtnElement.disabled = true;
        commentBtnElement.style.backgroundColor = 'rgba(85, 89, 51, 0.5)';
    } else {
        commentBtnElement.disabled = false;
        commentBtnElement.style.backgroundColor = 'rgba(193, 202, 117, 0.5)';
    }
};

const updateLikes = async postId => {
    try {
        console.log(`Updating likes for postId: ${postId}`);
        const response = await updateLike(postId);
        console.log(`Response data:`, response);

        // 응답 데이터가 올바른지 확인
        if (response && typeof response === 'object' && response.status === HTTP_OK) {
            console.log('Updated like data:', response);
            return response.data;  // 좋아요 데이터를 반환
        } else {
            throw new Error('Invalid response format');
        }
    } catch (error) {
        console.error('좋아요 업데이트 중 오류:', error);
        throw error;
    }
};

const getAndSetLikes = async postId => {
    try {
        console.log(`Getting likes for postId: ${postId}`);
        const response = await getLikes(postId);

        if (!response.ok) {
            throw new Error('좋아요 정보를 가져오는데 실패하였습니다.');
        }
        const data = await response.json();
        console.log('Like data:', data);
        const likeCountElement = document.querySelector('.likeCount h3');
        if (data.like !== undefined && data.like !== null) {
            likeCountElement.textContent = data.like.toLocaleString();
        }
        return data;
    } catch (error) {
        console.error('좋아요 정보를 가져오는 중 오류:', error);
        throw error;
    }
};

const handleLikeButtonClick = async postId => {
    try {
        console.log(`Handling like button click for postId: ${postId}`);
        const likeData = await updateLikes(postId);
        const likeCountElement = document.querySelector('.likeCount h3');
        if (likeData && likeData.like !== undefined && likeData.like !== null) {
            likeCountElement.textContent = likeData.like.toString();
        }
    } catch (error) {
        console.error('좋아요 버튼 클릭 처리 중 오류:', error);
        Dialog('좋아요 실패', '좋아요를 처리하는데 실패하였습니다.');
    }
};


const initLikeButton = postId => {
    const likeButton = document.getElementById('likeBtn');
    likeButton.addEventListener('click', () => handleLikeButtonClick(postId));
};


function setupLikeButton(initialLikeCount, postId) {
    const likeBtn = document.getElementById('likeBtn');
    const likeCountElement = document.querySelector('.likeCount h3');
    if (initialLikeCount !== undefined && initialLikeCount !== null) {
        likeCountElement.textContent = initialLikeCount.toString();
    }

    likeBtn.addEventListener('click', async () => {
        try {
            const likeData = await updateLikes(postId);
            console.log(`Updated like data:`, likeData);
            if (likeData && likeData.like !== undefined && likeData.like !== null) {
                likeCountElement.textContent = likeData.like.toString();
            }
        } catch (error) {
            console.error('좋아요 업데이트 중 오류:', error);
        }
    });
}

const init = async () => {
    try {
        const myInfoResult = await authCheck();
        if (myInfoResult.status !== HTTP_OK) {
            throw new Error('사용자 정보를 불러오는데 실패하였습니다.');
        }

        const myInfo = myInfoResult.data;
        const commentBtnElement = document.querySelector('.commentInputBtn');
        const textareaElement = document.querySelector(
            '.commentInputWrap textarea',
        );
        textareaElement.addEventListener('input', inputComment);
        commentBtnElement.addEventListener('click', addComment);
        commentBtnElement.disabled = true;

        const data = await authCheck();
        if (data.status === HTTP_NOT_AUTHORIZED) {
            window.location.href = '/html/login.html';
        }
        const profileImage =
            data.data.profileImagePath === undefined
                ? `${getServerUrl()}${DEFAULT_PROFILE_IMAGE}`
                : `${getServerUrl()}${data.data.profileImagePath}`;

        prependChild(document.body, Header('모숲이', 2, profileImage));

        const pageId = getQueryString('id');
        const pageData = await getBoardDetail(pageId);
        if (parseInt(pageData.user_id, 10) === parseInt(myInfo.userId, 10)) {
            setBoardModify(pageData, myInfo);
        }
        setBoardDetail(pageData);

        const comments = await getBoardComment(pageId);
        setBoardComment(comments, myInfo);

        const likeData = await getAndSetLikes(pageId);
        const likeCount = likeData.like || 0;
        setupLikeButton(likeCount, pageId);
    } catch (error) {
        console.error(error);
    }
};

init();
