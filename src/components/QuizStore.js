export class QuizStore {
    constructor(data) {
        this.quizzes = data;
        this.currentIndex = 0;

        // 상태 저장소
        this.userAnswers = {}; // { [quizId]: value }
        this.quizStatus = {};  // { [quizId]: 'scheduled' | 'current' | 'correct' | 'wrong' }
        this.isCompleted = false;

        // 초기화
        this.init();

        // 이벤트 리스너 관리를 위한 콜백 목록
        this.listeners = [];
    }

    init() {
        this.quizzes.forEach((quiz, index) => {
            this.quizStatus[quiz.id] = index === 0 ? 'current' : 'scheduled';
            this.userAnswers[quiz.id] = null;
        });
        this.explanationVisible = {}; // { [quizId]: boolean }
    }

    toggleExplanation(quizId) {
        this.explanationVisible[quizId] = !this.explanationVisible[quizId];
        this.notify();
    }

    subscribe(listener) {
        this.listeners.push(listener);
        return () => {
            this.listeners = this.listeners.filter(l => l !== listener);
        };
    }

    notify() {
        this.listeners.forEach(listener => listener(this.getState()));
    }

    getState() {
        return {
            currentQuiz: this.quizzes[this.currentIndex],
            quizzes: this.quizzes,
            currentIndex: this.currentIndex,
            totalQuizzes: this.quizzes.length,
            userAnswers: this.userAnswers,
            quizStatus: this.quizStatus,
            explanationVisible: this.explanationVisible,
            isCompleted: this.isCompleted,
            isFirst: this.currentIndex === 0,
            isLast: this.currentIndex === this.quizzes.length - 1,
            hasAnsweredCurrent: this.hasAnswered(this.quizzes[this.currentIndex].id)
        };
    }

    hasAnswered(quizId) {
        const answer = this.userAnswers[quizId];
        if (Array.isArray(answer)) return answer.length > 0;
        return answer !== null && answer !== undefined && answer !== '';
    }

    // 답변 제출 (임시 저장)
    setAnswer(answer) {
        const currentQuizId = this.quizzes[this.currentIndex].id;
        this.userAnswers[currentQuizId] = answer;
        this.notify();
    }

    // 정답 확인
    submitAnswer() {
        const currentQuiz = this.quizzes[this.currentIndex];
        let userAnswer = this.userAnswers[currentQuiz.id];
        let isCorrect = false;

        // Normalize userAnswer to array if it is not
        if (!Array.isArray(userAnswer)) {
            userAnswer = userAnswer ? [userAnswer] : [];
        }
        // Remove empty/undefined
        userAnswer = userAnswer.filter(v => v !== null && v !== undefined && v !== '');

        console.log('Checking ID:', currentQuiz.id, 'Type:', currentQuiz.type);
        console.log('User:', userAnswer, 'Correct:', currentQuiz.answer);

        // 유형별 정답 체크 로직
        if (currentQuiz.type === 'choice') {
            // 순서 무관 비교
            const sortedUser = [...userAnswer].sort();
            const sortedCorrect = [...currentQuiz.answer].sort();
            isCorrect = JSON.stringify(sortedUser) === JSON.stringify(sortedCorrect);
        }
        else if (currentQuiz.type === 'box') {
            // 순서 중요
            isCorrect = JSON.stringify(userAnswer) === JSON.stringify(currentQuiz.answer);
        }
        else if (currentQuiz.type === 'blank') {
            // 배열 비교 (순서대로) - 대소문자 무시?
            // Mock data: answer ["Markup"]
            if (userAnswer.length === currentQuiz.answer.length) {
                isCorrect = userAnswer.every((val, idx) =>
                    val.toLowerCase().trim() === currentQuiz.answer[idx].toLowerCase().trim()
                );
            }
        }
        else if (currentQuiz.type === 'select' || currentQuiz.type === 'ox') {
            // 단순 값 비교 (배열 0번째) or 전체 배열
            if (userAnswer.length === currentQuiz.answer.length) {
                isCorrect = userAnswer.every((val, idx) => val === currentQuiz.answer[idx]);
            }
        }

        this.quizStatus[currentQuiz.id] = isCorrect ? 'correct' : 'wrong';

        if (this.currentIndex === this.quizzes.length - 1 && this.quizStatus[currentQuiz.id]) {
            this.isCompleted = true;
        }

        this.notify();
    }

    nextQuiz() {
        if (this.currentIndex < this.quizzes.length - 1) {
            this.currentIndex++;
            const nextId = this.quizzes[this.currentIndex].id;
            if (this.quizStatus[nextId] === 'scheduled') {
                this.quizStatus[nextId] = 'current';
            }
            this.notify();
        }
    }

    prevQuiz() {
        if (this.currentIndex > 0) {
            this.currentIndex--;
            this.notify();
        }
    }
}
