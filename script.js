// Firebase 초기화
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-analytics.js";
import { getDatabase, ref, push, set, onValue, off, update, remove, query, orderByChild, get } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-database.js";

// Firebase 설정
const firebaseConfig = {
    apiKey: "AIzaSyB6NYne0D1vOrS5JZ1MnwRIE-2Cr0J_CiA",
    authDomain: "minje-todo-backend.firebaseapp.com",
    projectId: "minje-todo-backend",
    storageBucket: "minje-todo-backend.firebasestorage.app",
    messagingSenderId: "825236010516",
    appId: "1:825236010516:web:31034a89b396947fe21901",
    databaseURL: "https://minje-todo-backend-default-rtdb.firebaseio.com/",
    measurementId: "G-R2FJKDLVWD"
};

// Firebase 초기화
const app = initializeApp(firebaseConfig);
console.log('Firebase 앱 초기화 완료:', app);
const analytics = getAnalytics(app);
const database = getDatabase(app);
console.log('Realtime Database 연결 완료:', database);

// 할일 목록 데이터 저장
let todos = [];
let currentEditId = null;

// DOM 요소 가져오기
const todoInput = document.getElementById('todoInput');
const addBtn = document.getElementById('addBtn');
const todoList = document.getElementById('todoList');
const todoCount = document.getElementById('todoCount');

// Realtime Database 참조
const todosRef = ref(database, 'todos');

// 실시간 데이터베이스 리스너 설정
onValue(todosRef, (snapshot) => {
    console.log('할일 목록 업데이트됨');
    todos = [];
    
    if (snapshot.exists()) {
        const data = snapshot.val();
        console.log('데이터:', data);
        
        // 데이터를 배열로 변환
        Object.keys(data).forEach((key) => {
            todos.push({
                id: key,
                ...data[key]
            });
        });
        
        // 생성일 기준으로 정렬 (최신순)
        todos.sort((a, b) => {
            const dateA = new Date(a.createdAt || 0);
            const dateB = new Date(b.createdAt || 0);
            return dateB - dateA;
        });
    } else {
        console.log('할일 데이터가 없습니다.');
    }
    
    console.log('로드된 할일 수:', todos.length);
    renderTodos();
}, (error) => {
    console.error('할일 목록 로드 중 오류:', error);
    console.error('오류 코드:', error.code);
    console.error('오류 메시지:', error.message);
    
    // 권한 오류인 경우 사용자에게 알림
    if (error.code === 'PERMISSION_DENIED') {
        alert('Firebase 보안 규칙 설정이 필요합니다!\nFirebase Console에서 Realtime Database Rules를 설정해주세요.');
    }
    
    // 오류 발생 시 빈 목록 표시
    todos = [];
    renderTodos();
});

// 추가 버튼 클릭 이벤트
addBtn.addEventListener('click', addTodo);

// Enter 키 입력 이벤트
todoInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        addTodo();
    }
});

// 할일 추가 함수
async function addTodo() {
    const text = todoInput.value.trim();
    
    if (text === '') {
        alert('할일을 입력해주세요!');
        return;
    }
    
    console.log('할일 추가 시도:', text);
    
    try {
        // Realtime Database에 새로운 할일 추가
        const newTodoRef = push(todosRef);
        await set(newTodoRef, {
            text: text,
            completed: false,
            createdAt: new Date().toISOString()
        });
        console.log('할일 추가 성공! ID:', newTodoRef.key);
        todoInput.value = '';
    } catch (error) {
        console.error('할일 추가 중 오류 발생:', error);
        console.error('오류 코드:', error.code);
        console.error('오류 메시지:', error.message);
        
        // 구체적인 오류 메시지 표시
        if (error.code === 'PERMISSION_DENIED') {
            alert('권한 오류: Realtime Database 보안 규칙을 확인해주세요.\nFirebase Console → Realtime Database → Rules');
        } else if (error.code === 'UNAVAILABLE') {
            alert('Firebase 서비스에 연결할 수 없습니다. 인터넷 연결을 확인해주세요.');
        } else {
            alert(`할일 추가 중 오류가 발생했습니다.\n오류: ${error.message}`);
        }
    }
}

// 할일 목록 렌더링
function renderTodos() {
    todoList.innerHTML = '';
    
    if (todos.length === 0) {
        todoList.innerHTML = '<li class="empty-state">할일이 없습니다. 새로운 할일을 추가해보세요!</li>';
        todoCount.textContent = '총 0개의 할일';
        return;
    }
    
    todos.forEach(todo => {
        const li = document.createElement('li');
        li.className = `todo-item ${todo.completed ? 'completed' : ''}`;
        li.dataset.id = todo.id;
        
        // 체크박스
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.className = 'todo-checkbox';
        checkbox.checked = todo.completed;
        checkbox.addEventListener('change', () => toggleTodo(todo.id));
        
        // 텍스트 (편집 가능)
        const textSpan = document.createElement('span');
        textSpan.className = 'todo-text';
        textSpan.textContent = todo.text;
        
        // 액션 버튼 컨테이너
        const actionsDiv = document.createElement('div');
        actionsDiv.className = 'todo-actions';
        
        // 편집 버튼
        const editBtn = document.createElement('button');
        editBtn.className = 'edit-btn';
        editBtn.textContent = '수정';
        editBtn.addEventListener('click', () => editTodo(todo.id));
        
        // 삭제 버튼
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'delete-btn';
        deleteBtn.textContent = '삭제';
        deleteBtn.addEventListener('click', () => deleteTodo(todo.id));
        
        actionsDiv.appendChild(editBtn);
        actionsDiv.appendChild(deleteBtn);
        
        li.appendChild(checkbox);
        li.appendChild(textSpan);
        li.appendChild(actionsDiv);
        
        todoList.appendChild(li);
    });
    
    updateStats();
}

// 할일 완료/미완료 토글
async function toggleTodo(id) {
    try {
        const todoRef = ref(database, `todos/${id}`);
        const todo = todos.find(t => t.id === id);
        if (todo) {
            const newCompleted = !todo.completed;
            console.log('할일 상태 변경 시도:', id, '→', newCompleted);
            await update(todoRef, {
                completed: newCompleted
            });
            console.log('할일 상태 변경 완료:', id);
        }
    } catch (error) {
        console.error('상태 변경 중 오류:', error);
        console.error('오류 코드:', error.code);
        console.error('오류 메시지:', error.message);
        
        if (error.code === 'PERMISSION_DENIED') {
            alert('권한 오류: Realtime Database 보안 규칙을 확인해주세요.');
        } else {
            alert('상태 변경 중 오류가 발생했습니다.');
        }
    }
}

// 할일 수정 함수
function editTodo(id) {
    const todo = todos.find(t => t.id === id);
    if (!todo) return;
    
    currentEditId = id;
    const li = document.querySelector(`.todo-item[data-id="${id}"]`);
    const textSpan = li.querySelector('.todo-text');
    const actionsDiv = li.querySelector('.todo-actions');
    
    // 입력 필드 생성
    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'todo-text editing';
    input.value = todo.text;
    
    // 저장/취소 버튼 생성
    const saveBtn = document.createElement('button');
    saveBtn.className = 'save-btn';
    saveBtn.textContent = '저장';
    
    const cancelBtn = document.createElement('button');
    cancelBtn.className = 'cancel-btn';
    cancelBtn.textContent = '취소';
    
    // 기존 요소 교체
    textSpan.replaceWith(input);
    actionsDiv.innerHTML = '';
    actionsDiv.appendChild(saveBtn);
    actionsDiv.appendChild(cancelBtn);
    
    // 입력 필드 포커스
    input.focus();
    input.select();
    
    // 저장 버튼 이벤트
    saveBtn.addEventListener('click', () => saveEdit(input.value.trim()));
    
    // 취소 버튼 이벤트
    cancelBtn.addEventListener('click', cancelEdit);
    
    // Enter 키로 저장
    input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            saveEdit(input.value.trim());
        } else if (e.key === 'Escape') {
            cancelEdit();
        }
    });
}

// 수정 내용 저장
async function saveEdit(newText) {
    if (newText === '') {
        alert('할일을 입력해주세요!');
        return;
    }
    
    if (!currentEditId) {
        console.error('수정할 할일 ID가 없습니다.');
        return;
    }
    
    console.log('할일 수정 시도:', currentEditId, '→', newText);
    
    try {
        const todoRef = ref(database, `todos/${currentEditId}`);
        await update(todoRef, {
            text: newText
        });
        console.log('할일 수정 완료:', currentEditId);
        currentEditId = null;
    } catch (error) {
        console.error('수정 중 오류:', error);
        console.error('오류 코드:', error.code);
        console.error('오류 메시지:', error.message);
        
        if (error.code === 'PERMISSION_DENIED') {
            alert('권한 오류: Realtime Database 보안 규칙을 확인해주세요.\nFirebase Console → Realtime Database → Rules');
        } else {
            alert(`할일 수정 중 오류가 발생했습니다.\n오류: ${error.message}`);
        }
        
        currentEditId = null;
        renderTodos();
    }
}

// 수정 취소
function cancelEdit() {
    currentEditId = null;
    renderTodos();
}

// 할일 삭제 함수
async function deleteTodo(id) {
    if (!confirm('정말 삭제하시겠습니까?')) {
        return;
    }
    
    console.log('할일 삭제 시도:', id);
    
    try {
        const todoRef = ref(database, `todos/${id}`);
        await remove(todoRef);
        console.log('할일 삭제 완료:', id);
    } catch (error) {
        console.error('삭제 중 오류:', error);
        console.error('오류 코드:', error.code);
        console.error('오류 메시지:', error.message);
        
        if (error.code === 'PERMISSION_DENIED') {
            alert('권한 오류: Realtime Database 보안 규칙을 확인해주세요.\nFirebase Console → Realtime Database → Rules');
        } else {
            alert(`할일 삭제 중 오류가 발생했습니다.\n오류: ${error.message}`);
        }
    }
}

// 통계 업데이트
function updateStats() {
    const total = todos.length;
    const completed = todos.filter(t => t.completed).length;
    const remaining = total - completed;
    
    todoCount.textContent = `총 ${total}개의 할일 (완료: ${completed}개, 남음: ${remaining}개)`;
}
