import Dialog from '../component/dialog/dialog.js';
import Header from '../component/header/header.js';
import {
    authCheck,
    getQueryString,
    getServerUrl,
    prependChild,
} from '../utils/function.js';
import {
    createPost,
    fileUpload,
    updatePost,
    getBoardItem, // Import the function here
} from '../api/board-writeRequest.js';

const HTTP_OK = 200;
const HTTP_CREATED = 201;

const MAX_TITLE_LENGTH = 26;
const MAX_CONTENT_LENGTH = 1500;

const submitButton = document.querySelector('#submit');
const titleInput = document.querySelector('#title');
const contentInput = document.querySelector('#content');
const imageInput = document.querySelector('#image');
const imagePreviewText = document.getElementById('imagePreviewText');
const contentHelpElement = document.querySelector(
    '.inputBox p[name="content"]',
);

const boardWrite = {
    title: '',
    content: '',
};

let isModifyMode = false;
let modifyData = {};

const observeSignupData = () => {
    const { title, content } = boardWrite;
    if (!title || !content || title === '' || content === '') {
        submitButton.disabled = true;
        submitButton.style.backgroundColor = 'rgba(85, 89, 51, 0.5)';
    } else {
        submitButton.disabled = false;
        submitButton.style.backgroundColor = 'rgba(193, 202, 117, 0.5)';
    }
};

// 엘리먼트 값 가져오기 title, content
const getBoardData = () => {
    return {
        postTitle: boardWrite.title,
        postContent: boardWrite.content,
        attachFilePath:
            localStorage.getItem('postFilePath') === null
                ? undefined
                : localStorage.getItem('postFilePath'),
    };
};

// 버튼 클릭시 이벤트
const addBoard = async () => {
    const boardData = getBoardData();

    // boardData가 false일 경우 함수 종료
    if (!boardData) return Dialog('게시글', '게시글을 입력해주세요.');

    if (boardData.postTitle.length > MAX_TITLE_LENGTH)
        return Dialog('게시글', '제목은 26자 이하로 입력해주세요.');

    if (!isModifyMode) {
        const response = await createPost(boardData);
        if (!response.ok) throw new Error('서버 응답 오류');

        const data = await response.json();

        if (data.status === HTTP_CREATED) {
            localStorage.removeItem('postFilePath');
            window.location.href = `/html/board.html?id=${data.data.insertId}`;
        } else {
            const helperElement = contentHelpElement;
            helperElement.textContent = '제목, 내용을 모두 작성해주세요.';
        }
    } else {
        // 게시글 작성 api 호출
        const post_id = getQueryString('post_id');
        const setData = {
            ...boardData,
        };

        const response = await updatePost(post_id, setData);
        if (!response.ok) throw new Error('서버 응답 오류');

        const data = await response.json();

        if (data.status == HTTP_OK) {
            localStorage.removeItem('postFilePath');
            window.location.href = `/html/board.html?id=${post_id}`;
        } else {
            Dialog('게시글', '게시글 수정 실패');
        }
    }
};

const changeEventHandler = async (event, uid) => {
    if (uid == 'title') {
        const value = event.target.value;
        const helperElement = contentHelpElement;
        if (!value || value == '') {
            boardWrite[uid] = '';
            helperElement.textContent = '제목을 입력해주세요.';
        } else if (value.length > MAX_TITLE_LENGTH) {
            helperElement.textContent = '제목은 26자 이하로 입력해주세요.';
            titleInput.value = value.substring(0, MAX_TITLE_LENGTH);
            boardWrite[uid] = value.substring(0, MAX_TITLE_LENGTH);
        } else {
            boardWrite[uid] = value;
            helperElement.textContent = '';
        }
    } else if (uid == 'content') {
        const value = event.target.value;
        const helperElement = contentHelpElement;
        if (!value || value == '') {
            boardWrite[uid] = '';
            helperElement.textContent = '내용을 입력해주세요.';
        } else if (value.length > MAX_CONTENT_LENGTH) {
            helperElement.textContent = '내용은 1500자 이하로 입력해주세요.';
            contentInput.value = value.substring(0, MAX_CONTENT_LENGTH);
            boardWrite[uid] = value.substring(0, MAX_CONTENT_LENGTH);
        } else {
            boardWrite[uid] = value;
            helperElement.textContent = '';
        }
    } else if (uid == 'image') {
        const file = event.target.files[0]; // 사용자가 선택한 파일
        if (!file) {
            console.log('파일이 선택되지 않았습니다.');
            return;
        }

        const formData = new FormData();
        formData.append('postFile', file);

        // 파일 업로드를 위한 POST 요청 실행
        try {
            console.log("파일 업로드 시작");
            const response = await fileUpload(formData);
            console.log("파일 업로드 완료");
            if (!response.ok) throw new Error('서버 응답 오류');

            const result = await response.json(); // 응답을 JSON으로 변환
            localStorage.setItem('postFilePath', result.data.filePath);
        } catch (error) {
            console.error('업로드 중 오류 발생:', error);
        }
    } else if (uid === 'imagePreviewText') {
        localStorage.removeItem('postFilePath');
        imagePreviewText.style.display = 'none';
    }

    observeSignupData();
};

// 수정모드시 사용하는 게시글 단건 정보 가져오기
const getBoardModifyData = async postId => {
    const response = await getBoardItem(postId);
    if (!response.ok) throw new Error('서버 응답 오류');

    const data = await response.json();
    return data.data;
};

// 수정 모드인지 확인
const checkModifyMode = () => {
    const postId = getQueryString('post_id');
    if (!postId) return false;
    return postId;
};

// 이벤트 등록
const addEvent = () => {
    submitButton.addEventListener('click', addBoard);
    titleInput.addEventListener('input', event =>
        changeEventHandler(event, 'title'),
    );
    contentInput.addEventListener('input', event =>
        changeEventHandler(event, 'content'),
    );
    imageInput.addEventListener('change', event =>
        changeEventHandler(event, 'image'),
    );
    if (imagePreviewText !== null) {
        imagePreviewText.addEventListener('click', event =>
            changeEventHandler(event, 'imagePreviewText'),
        );
    }
};

const setModifyData = data => {
    console.log(data);
    titleInput.value = data[0].post_title;
    contentInput.value = data[0].post_content;

    if (data[0].filePath) {
        // filePath에서 파일 이름만 추출하여 표시
        const fileName = data[0].filePath.split('/').pop();
        imagePreviewText.innerHTML =
            fileName + `<span class="deleteFile">X</span>`;
        imagePreviewText.style.display = 'block';
        localStorage.setItem('postFilePath', data[0].filePath);

        // 이제 추출된 파일명을 사용하여 File 객체를 생성
        const attachFile = new File(
            // 실제 이미지 데이터 대신 URL을 사용
            [`${getServerUrl()}${data[0].filePath}`],
            // 추출된 파일명
            fileName,
            // MIME 타입 지정, 실제 이미지 타입에 맞게 조정 필요
            { type: '' },
        );

        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(attachFile);
        imageInput.files = dataTransfer.files;
    } else {
        // 이미지 파일이 없으면 미리보기 숨김
        imagePreviewText.style.display = 'none';
    }

    boardWrite.title = data[0].post_title;
    boardWrite.content = data[0].post_content;

    observeSignupData();
};

const init = async () => {
    const data = await authCheck();
    const modifyId = checkModifyMode();

    const profileImage =
        data.data.profileImagePath === undefined
            ? `${getServerUrl()}/public/image/profile/default.jpg`
            : getServerUrl() + data.data.profileImagePath;

    prependChild(document.body, Header('모두의 숲속 이야기🌿', 1, profileImage));

    if (modifyId) {
        isModifyMode = true;
        modifyData = await getBoardModifyData(modifyId);

        if (data.idx !== modifyData.writerId) {
            Dialog('권한 없음', '권한이 없습니다.', () => {
                window.location.href = '/';
            });
        } else {
            setModifyData(modifyData);
        }
    }

    addEvent();
};

init();
