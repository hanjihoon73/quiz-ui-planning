# 퀴즈 UI 프로토타입 개발 계획

## 1. 개요
세련되고 반응형을 지원하는 프리미엄급 퀴즈 UI 프로토타입을 개발합니다. 5가지 퀴즈 유형과 상세한 정오답 로직을 포함하며, 사용자 경험(UX)을 최우선으로 고려한 디자인을 적용합니다.

## 2. 기술 스택
- **Build Tool**: Vite (빠른 개발 환경 구성)
- **Core**: HTML5, JavaScript (ES6+)
- **Style**: Vanilla CSS (CSS Variables, Flexbox/Grid 활용)
    - 외부 라이브러리 없이 커스텀 디자인 시스템 구축
    - 다크/라이트 모드 대응이 용이한 구조

## 3. 디렉토리 구조 (예정)
```
/doc                # 기획 및 개발 문서
/public             # 정적 리소스
/src
  /assets           # 이미지, 폰트
  /components       # UI 컴포넌트 (논리적 구분)
    /navigation.js
    /question.js
    /types          # 퀴즈 유형별 렌더링 로직
      /choice.js    # 정답 고르기
      /blank.js     # 빈칸 채우기
      /select.js    # 선택하기
      /ox.js        # 맞아요 틀려요
      /box.js       # 박스 채우기
    /explanation.js
  /data             # 퀴즈 데이터 (Mock)
  /styles           # CSS 파일
    index.css       # 메인 스타일
    layout.css      # 레이아웃
    quiz.css        # 퀴즈 컴포넌트 스타일
  main.js           # 애플리케이션 진입점 및 상태 관리
index.html
```

## 4. 데이터 구조 설계 (초안)
`quiz_data.json` 예시:
```json
[
  {
    "id": 1,
    "type": "choice", // choice, blank, select, ox, box
    "status": "scheduled", // correct, wrong, current, scheduled
    "question": "질문 텍스트...",
    "passage": { "type": "text", "content": "지문 내용..." },
    "options": [
      { "id": 1, "text": "보기1" },
      { "id": 2, "text": "보기2" }
    ],
    "answer": [1], // 정답 ID
    "explanation": { "text": "해설...", "image": "path/to/img" }
  }
]
```

## 5. 주요 기능 명세

### 5.1 퀴즈 유형별 로직
1. **정답 고르기**: 다중 선택 가능성 고려 (Checkbox/Radio 로직).
2. **빈칸 채우기**: `input` 요소 동적 생성 및 정답 매칭 문자열 비교.
3. **선택하기**: `select` 드롭다운 동적 생성.
4. **맞아요 틀려요**: O/X 토글 버튼.
5. **박스 채우기**: Drag & Drop 또는 Click-to-Move 인터랙션 구현.

### 5.2 화면 구성 및 네비게이션
- **네비게이션 바**: 1~10번 문항 표시. 상태별 색상 코드(Green, Red, Blue, Gray) 및 애니메이션 적용.
- **버튼 상태 관리**: 
    - [정답 확인]: 답 선택 시 활성화 (Disabled -> Active).
    - [다음]: 정오답 확인 후 전환.
    - [이전]: 2번 문항부터 표시.
    - [퀴즈 완료]: 마지막 문항 처리.

## 6. 디자인 컨셉
- **Visual**: Glassmorphism, Smooth Gradient, Rounded Corners.
- **Interaction**: 버튼 호버, 정답 체크 애니메이션, 화면 전환 슬라이드 효과.
- **Typography**: 가독성 높은 산세리프 폰트 (Pretendard 또는 Noto Sans KR).

## 7. 개발 일정 (마일스톤)
1. 프로젝트 세팅 및 기본 레이아웃 구현
2. 퀴즈 데이터 모델링 및 네비게이션 구현
3. 유형별 퀴즈 렌더링 로직 구현 (1~5)
4. 정오답 처리 및 해설 UI 구현
5. 디자인 폴리싱 (CSS 및 애니메이션)
