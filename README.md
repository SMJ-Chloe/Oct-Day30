# 할일 목록 앱 (Todo App)

Firebase Realtime Database를 사용한 할일 관리 웹 애플리케이션입니다.

## 주요 기능

- ✅ 할일 추가
- ✏️ 할일 수정
- 🗑️ 할일 삭제
- ☑️ 완료 상태 토글
- 💾 Firebase Realtime Database 실시간 동기화

## 사용 기술

- HTML
- CSS
- JavaScript (ES6 Modules)
- Firebase Realtime Database

## 시작하기

1. 프로젝트 클론
```bash
git clone https://github.com/SMJ-Chloe/Oct-Day30.git
```

2. `index.html` 파일을 브라우저에서 열기

3. Firebase 설정
   - Firebase Console에서 Realtime Database 생성
   - 보안 규칙 설정 (Rules):
   ```json
   {
     "rules": {
       "todos": {
         ".read": true,
         ".write": true
       }
     }
   }
   ```

## 파일 구조

```
todo-firbase/
├── index.html      # HTML 구조
├── styles.css      # 스타일링
├── script.js       # JavaScript 로직 및 Firebase 연동
└── README.md       # 프로젝트 설명
```

## Firebase 설정

프로젝트의 Encrypt.js 파일에서 Firebase 설정 정보를 확인할 수 있습니다:
- API Key
- Auth Domain
- Project ID
- Database URL 등

## 라이선스

MIT License

