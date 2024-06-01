// index.js
import BoardItem from '../component/board/boardItem.js';
import Header from '../component/header/header.js';
import { authCheck, getServerUrl, prependChild } from '../utils/function.js';
import { getPosts } from '../api/indexRequest.js';

const DEFAULT_PROFILE_IMAGE = '/public/image/profile/default.jpg';
const HTTP_NOT_AUTHORIZED = 401;
const SCROLL_THRESHOLD = 0.9;
const INITIAL_OFFSET = 0;
const ITEMS_PER_LOAD = 5;

let currentSortBy = 'dateDesc'; // Default sort by date descending
let offset = INITIAL_OFFSET;
let isEnd = false;
let isProcessing = false;

const getBoardItem = async (offset = 0, limit = 5, sortBy = 'dateDesc') => {
    console.log(`getBoardItem called with offset: ${offset}, limit: ${limit}, sortBy: ${sortBy}`);
    try {
        const response = await getPosts(offset, limit, sortBy);
        if (!response || !response.data) {
            throw new Error('Failed to load post list.');
        }

        return response.data;
    } catch (error) {
        console.error('Error in getBoardItem:', error);
        throw error;
    }
};

const setBoardItem = boardData => {
    const boardList = document.querySelector('.boardList');
    if (boardList && boardData) {
        const itemsHtml = boardData
            .map(data =>
                BoardItem(
                    data.post_id,
                    data.created_at,
                    data.post_title,
                    data.hits,
                    data.profileImagePath,
                    data.nickname,
                    data.comment_count,
                    data.like,
                ),
            )
            .join('');
        boardList.innerHTML += ` ${itemsHtml}`;
    }
};


const clearBoardItems = () => {
    const boardList = document.querySelector('.boardList');
    if (boardList) {
        boardList.innerHTML = '';
    }
};

const addInfinityScrollEvent = () => {
    window.addEventListener('scroll', async () => {
        const hasScrolledToThreshold =
            window.scrollY + window.innerHeight >=
            document.documentElement.scrollHeight * SCROLL_THRESHOLD;
        if (hasScrolledToThreshold && !isProcessing && !isEnd) {
            isProcessing = true;

            try {
                offset += ITEMS_PER_LOAD
                const newItems = await getBoardItem(offset, ITEMS_PER_LOAD, currentSortBy);
                if (!newItems || newItems.length === 0) {
                    isEnd = true;
                } else {
                    offset += ITEMS_PER_LOAD;
                    setBoardItem(newItems);
                }
            } catch (error) {
                console.error('Error fetching new items:', error);
                isEnd = true;
            } finally {
                isProcessing = false;
            }
        }
    });
};

const init = async () => {
    try {
        const data = await authCheck();
        if (data.status === HTTP_NOT_AUTHORIZED) {
            window.location.href = '/html/login.html';
            return;
        }

        const profileImagePath =
            data.data.profileImagePath ?? DEFAULT_PROFILE_IMAGE;
        const fullProfileImagePath = `${getServerUrl()}${profileImagePath}`;
        prependChild(
            document.body,
            Header('모두의 숲속 이야기', 0, fullProfileImagePath),
        );

        const boardList = await getBoardItem(0, ITEMS_PER_LOAD, currentSortBy);
        setBoardItem(boardList);

        addInfinityScrollEvent();

        const sortByElement = document.getElementById('sort-by');
        sortByElement.addEventListener('change', async (event) => {
            currentSortBy = event.target.value;
            console.log(`Sort criteria changed to: ${currentSortBy}`);
            clearBoardItems(); // Clear existing items
            offset = INITIAL_OFFSET; // Reset offset
            isEnd = false; // Reset end flag
            isProcessing = false; // Reset processing flag
            const sortedBoardList = await getBoardItem(0, ITEMS_PER_LOAD, currentSortBy);
            setBoardItem(sortedBoardList);
        });
    } catch (error) {
        console.error('Initialization failed:', error);
    }
};

init();
