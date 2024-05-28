import { getServerUrl, getCookie } from '../utils/function.js';

export const getPosts = async (offset, limit, sortBy) => {
    const url = `${getServerUrl()}/posts?offset=${offset}&limit=${limit}&sortBy=${sortBy}`;
    console.log('Fetching URL:', url);

    try {
        const response = await fetch(
            url,
            {
                headers: {
                    session: getCookie('session'),
                    userId: getCookie('userId'),
                },
                noCORS: true,
            },
        );

        console.log('Response:', response);

        if (!response.ok) {
            throw new Error('Failed to fetch posts');
        }

        const data = await response.json();
        console.log('Response Data:', data);

        return data;
    } catch (error) {
        console.error('Fetch error:', error);
        throw error;
    }
};
