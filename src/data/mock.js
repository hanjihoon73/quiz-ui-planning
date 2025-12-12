export const QUIZ_DATA = [
    {
        id: 1,
        type: "choice",
        question: "다음 중 웹 브라우저가 아닌 것은?",
        passage: {
            type: "text",
            content: "웹 브라우저는 월드 와이드 웹(WWW) 상의 정보 자원을 검색하고 표시하는 응용 소프트웨어입니다. 대표적인 예로 Chrome, Safari, Firefox 등이 있습니다."
        },
        options: [
            { id: "1", text: "Chrome" },
            { id: "2", text: "Safari" },
            { id: "3", text: "Linux" },
            { id: "4", text: "Edge" },
            { id: "5", text: "Firefox" }
        ],
        answer: ["3"],
        explanation: {
            text: "Linux는 운영체제(OS)의 일종이며, 나머지는 모두 웹 브라우저입니다."
        }
    },
    {
        id: 2,
        type: "blank",
        question: "다음 문장의 빈칸에 알맞은 단어를 입력하세요.",
        passage: {
            type: "text",
            content: "HTML은 HyperText {0} Language의 약자입니다. 웹 페이지의 구조를 정의하는 데 사용됩니다."
        },
        answer: ["Markup"],
        explanation: {
            text: "HTML은 HyperText Markup Language의 약자입니다."
        }
    },
    {
        id: 3,
        type: "select",
        question: "다음 문장의 빈칸에 들어갈 알맞은 단어를 선택하세요.",
        passage: {
            type: "text",
            content: "CSS는 Cascading {0} Sheets의 약자입니다."
        },
        options: [
            { id: "1", text: "Script" },
            { id: "2", text: "Style" },
            { id: "3", text: "Sheet" }
        ],
        answer: ["2"],
        explanation: {
            text: "CSS는 Cascading Style Sheets의 약자로, 웹 문서의 스타일을 지정합니다."
        }
    },
    {
        id: 4,
        type: "ox",
        question: "다음 설명이 맞으면 O, 틀리면 X를 선택하세요.",
        passage: {
            type: "text",
            content: "JavaScript는 정적 타입 언어이다."
        },
        answer: ["X"],
        explanation: {
            text: "JavaScript는 동적 타입(Dynamic Typed) 언어입니다. 변수의 타입이 런타임에 결정됩니다."
        }
    },
    {
        id: 5,
        type: "box",
        question: "보기를 선택하여 빈칸을 올바르게 채우세요.",
        passage: {
            type: "text",
            content: "React는 {0} 기반의 라이브러리이고, Vue는 {1} 기반의 프레임워크입니다."
        },
        options: [
            { id: "1", text: "Component" },
            { id: "2", text: "Template" },
            { id: "3", text: "Oject" }
        ],
        answer: ["1", "2"], // 순서대로 Component, Template
        explanation: {
            text: "React는 컴포넌트 기반, Vue는 템플릿 문법을 주로 사용하는 프레임워크입니다."
        }
    }
];
