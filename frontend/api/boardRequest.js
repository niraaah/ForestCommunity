import { getServerUrl, getCookie } from '../utils/function.js';

export const getPost = postId => {
    const result = fetch(`${getServerUrl()}/posts/${postId}`, {
        headers: {
            session: getCookie('session'),
            userId: getCookie('userId'),
        },
        noCORS: true,
    });
    return result;
};

export const deletePost = async postId => {
    const result = await fetch(`${getServerUrl()}/posts/${postId}`, {
        method: 'DELETE',
        headers: {
            session: getCookie('session'),
            userId: getCookie('userId'),
        },
    });
    return result;
};

export const writeComment = async (pageId, comment) => {
    const result = await fetch(`${getServerUrl()}/posts/${pageId}/comments`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            session: getCookie('session'),
            userId: getCookie('userId'),
        },
        body: JSON.stringify({ commentContent: comment }),
    });
    return result;
};

export const getComments = async postId => {
    const result = await fetch(`${getServerUrl()}/posts/${postId}/comments`, {
        headers: {
            session: getCookie('session'),
            userId: getCookie('userId'),
        },
        noCORS: true,
    });
    return result;
};

export const getLikes = async postId => {
    console.log(`GET `)
    const result = await fetch(`${getServerUrl()}/posts/${postId}/likes`, {
        method: 'GET',
        headers: {
            session: getCookie('session'),
            userId: getCookie('userId'),
        },
        noCORS: true,
    });
    return result;
};


export const updateLike = async postId => {
    try {
        const serverUrl = getServerUrl();
        const session = getCookie('session');
        const userId = getCookie('userId');

        // 디버깅 로그 추가
        console.log(`getCookie('session'): ${session}`);
        console.log(`getCookie('userId'): ${userId}`);
        console.log(`postId: ${postId}`);

        if (!userId) {
            throw new Error('User ID가 undefined입니다. userId 쿠키가 제대로 설정되어 있는지 확인해주세요.');
        }

        if (!postId) {
            throw new Error('Post ID가 유효하지 않거나 undefined입니다. postId 값을 확인해주세요.');
        }

        console.log(`Sending like update request for postId: ${postId}`);
        console.log(`Request URL: ${serverUrl}/posts/${postId}/likes`);
        console.log(`Session: ${session}, User ID: ${userId}`);

        const result = await fetch(`${serverUrl}/posts/${postId}/likes`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'session': session,
                'userId': userId,
            },
            body: JSON.stringify({ postId }),
        });

        console.log(`Response status: ${result.status}`);

        if (!result.ok) {
            const errorData = await result.json();
            console.error('Response error data:', errorData);
            throw new Error('좋아요 업데이트 실패');
        }

        const data = await result.json();
        console.log('Response data:', data);
        return data;
    } catch (error) {
        console.error('updateLike에서 오류 발생:', error);
        throw error;
    }
};