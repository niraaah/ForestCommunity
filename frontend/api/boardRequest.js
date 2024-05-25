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

        // 디버깅 정보 추가
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
            body: JSON.stringify({ postId: postId, userId: userId }) // 요청 본문에 데이터 추가
        });

        // 응답 상태 코드 확인
        console.log(`Response status: ${result.status}`);
        
        // 응답이 성공적이지 않은 경우 오류 처리
        if (!result.ok) {
            const errorData = await result.json();
            console.error('Response error data:', errorData);
            throw new Error('Failed to update like');
        }

        const data = await result.json();
        console.log('Response data:', data);
        return data;
    } catch (error) {
        console.error('Error in updateLike:', error);
        throw error;
    }
};


