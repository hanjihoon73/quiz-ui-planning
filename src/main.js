import { QuizStore } from './components/QuizStore.js';
import { Navigation } from './components/Navigation.js';
import { QUIZ_DATA } from './data/mock.js';
import './styles/index.css';
import './styles/layout.css';
import './styles/quiz.css';

console.log('Main.js loading...');

// Initialize Store
let store;
try {
  store = new QuizStore(QUIZ_DATA);
  console.log('Store initialized');
} catch (e) {
  console.error('Failed to initialize Store:', e);
}

// Initialize Components
try {
  const navContainer = document.querySelector('#quiz-nav');
  if (navContainer) {
    new Navigation(navContainer, store);
    console.log('Navigation initialized');
  } else {
    console.error('Nav container #quiz-nav not found!');
  }
} catch (e) {
  console.error('Failed to initialize Navigation:', e);
}

// Render Function
function render() {
  try {
    const state = store.getState();
    const { currentQuiz, quizStatus, hasAnsweredCurrent } = state;
    const isChecked = quizStatus[currentQuiz.id] === 'correct' || quizStatus[currentQuiz.id] === 'wrong';

    console.log('Rendering quiz:', currentQuiz.id, 'Status:', quizStatus[currentQuiz.id]);

    // 입력 중인 input의 포커스 정보 저장 (빈칸 채우기용)
    let focusedInputInfo = null;
    if (currentQuiz.type === 'blank' && !isChecked) {
      const activeInput = document.activeElement;
      if (activeInput && activeInput.classList.contains('inline-input')) {
        focusedInputInfo = {
          index: parseInt(activeInput.dataset.index),
          cursorPosition: activeInput.selectionStart
        };
      }
    }

    // Render Layout
    const mainContent = document.querySelector('.quiz-content');
    if (!mainContent) {
      console.error('.quiz-content element not found');
      return;
    }

    // 지문(Passage) 처리
    let passageContent = '';
    if (currentQuiz.passage) {
      if (['blank', 'select', 'box'].includes(currentQuiz.type)) {
        passageContent = processPassageContent(currentQuiz, state, isChecked);
      } else {
        passageContent = currentQuiz.passage.content;
      }
    }

    mainContent.innerHTML = `
      <div class="question-area">
        <span class="quiz-badge">${getQuizTypeLabel(currentQuiz.type)}</span>
        <h2 class="quiz-question">${currentQuiz.question}</h2>
      </div>
      
      ${currentQuiz.passage ? `
        <div class="passage-area" id="passage-area">
          ${passageContent}
        </div>
      ` : ''}

      <div class="options-area" id="options-area">
        <!-- Options injected by JS -->
      </div>

      ${isChecked ? `
        <div class="explanation-section">
            <button class="btn-toggle-explanation" id="btn-toggle-expl" data-id="${currentQuiz.id}">
               <span>${state.explanationVisible && state.explanationVisible[currentQuiz.id] ? '해설 닫기' : '해설 보기'}</span>
               <span>${state.explanationVisible && state.explanationVisible[currentQuiz.id] ? '▲' : '▼'}</span>
            </button>
            
            ${state.explanationVisible && state.explanationVisible[currentQuiz.id] ? `
              <div class="explanation-area">
                  <!-- h3 removed as per request for simple styling -->
                  <p>${currentQuiz.explanation.text}</p>
              </div>
            ` : ''}
        </div>
      ` : ''}
    `;

    // Render Options
    renderOptions(currentQuiz, state, isChecked);

    // Event Bindings
    bindInlineEvents(currentQuiz, state, isChecked);

    // 포커스 복원 (빈칸 채우기)
    if (focusedInputInfo && currentQuiz.type === 'blank' && !isChecked) {
      const inputElements = document.querySelectorAll('.inline-input');
      const targetInput = Array.from(inputElements).find(input => 
        parseInt(input.dataset.index) === focusedInputInfo.index
      );
      if (targetInput) {
        targetInput.focus();
        // cursor position 복원
        if (targetInput.setSelectionRange) {
          const cursorPos = Math.min(focusedInputInfo.cursorPosition, targetInput.value.length);
          targetInput.setSelectionRange(cursorPos, cursorPos);
        }
      }
    }

    // Bind Explanation Toggle
    if (isChecked) {
      document.getElementById('btn-toggle-expl')?.addEventListener('click', () => {
        store.toggleExplanation(currentQuiz.id);
      });
    }

    // Render Footer Buttons
    const footer = document.querySelector('.quiz-footer');
    let btnText = '정답 확인';
    let btnAction = 'check';
    let isDisabled = !hasAnsweredCurrent;

    if (isChecked) {
      if (state.isLast) {
        btnText = '퀴즈 완료';
        btnAction = 'finish';
      } else {
        btnText = '다음';
        btnAction = 'next';
      }
      isDisabled = false;
    }

    // Prev Button
    const prevBtnHTML = state.currentIndex > 0 ? `<button class="btn-secondary" id="btn-prev">이전</button>` : '';

    footer.innerHTML = `
      ${prevBtnHTML}
      <button class="btn-primary" id="btn-action" ${isDisabled ? 'disabled' : ''}>${btnText}</button>
    `;

    // Bind Footer Events
    document.getElementById('btn-action')?.addEventListener('click', () => {
      if (btnAction === 'check') {
        store.submitAnswer();

        // Show Result Overlay
        const currentState = store.getState();
        const currentId = currentState.currentQuiz.id;
        const result = currentState.quizStatus[currentId];

        if (result === 'correct' || result === 'wrong') {
          showResultOverlay(result === 'correct');
        }

      } else if (btnAction === 'next') {
        store.nextQuiz();
      } else if (btnAction === 'finish') {
        alert('모든 퀴즈를 완료했습니다! 수고하셨습니다.');
      }
    });

    document.getElementById('btn-prev')?.addEventListener('click', () => {
      store.prevQuiz();
    });

  } catch (e) {
    console.error('Error during render:', e);
  }
}

function showResultOverlay(isCorrect) {
  const backdrop = document.createElement('div');
  backdrop.className = 'overlay-backdrop';

  const overlay = document.createElement('div');
  overlay.className = `result-overlay ${isCorrect ? 'correct' : 'wrong'}`;

  overlay.innerHTML = `
        <div class="result-icon">${isCorrect ? 'O' : 'X'}</div>
        <div class="result-text">${isCorrect ? '정답입니다!' : '오답입니다'}</div>
    `;

  document.body.appendChild(backdrop);
  document.body.appendChild(overlay);

  setTimeout(() => {
    backdrop.remove();
    overlay.remove();
  }, 2000);
}

function getQuizTypeLabel(type) {
  const map = {
    choice: '정답 고르기',
    blank: '빈칸 채우기',
    select: '선택하기',
    ox: '맞아요 틀려요',
    box: '박스 채우기'
  };
  return map[type] || type.toUpperCase();
}

function processPassageContent(quiz, state, isResultView) {
  let content = quiz.passage.content;
  const answers = state.userAnswers[quiz.id] || [];

  return content.replace(/\{(\d+)\}/g, (match, index) => {
    const idx = parseInt(index, 10);
    const val = Array.isArray(answers) ? (answers[idx] || '') : (idx === 0 ? answers : '');

    // Validation Logic
    let validationClass = '';
    if (isResultView) {
      let isCorrect = false;
      const correctAns = quiz.answer; // Array or String

      if (quiz.type === 'blank') {
        const correctText = correctAns[idx] || correctAns[0]; // Handle array or single string answer
        // Simple case-insensitive check
        if (val && correctText && val.trim().toLowerCase() === correctText.toLowerCase()) {
          isCorrect = true;
        }
      } else if (quiz.type === 'select') {
        const correctId = correctAns[idx] || correctAns[0];
        if (val === correctId) isCorrect = true;
      } else if (quiz.type === 'box') {
        const correctId = correctAns[idx];
        if (val === correctId) isCorrect = true;
      }

      validationClass = isCorrect ? 'correct' : 'wrong';
    }

    if (quiz.type === 'blank') {
      return `<input type="text" class="inline-input ${validationClass}" data-index="${idx}" value="${val}" ${isResultView ? 'disabled' : ''} placeholder="빈칸" />`;
    }
    else if (quiz.type === 'select') {
      const options = quiz.options.map(opt =>
        `<option value="${opt.id}" ${val === opt.id ? 'selected' : ''}>${opt.text}</option>`
      ).join('');
      return `
        <select class="inline-select ${validationClass}" data-index="${idx}" ${isResultView ? 'disabled' : ''}>
           <option value="" disabled ${!val ? 'selected' : ''}>빈칸</option>
           ${options}
        </select>
      `;
    }
    else if (quiz.type === 'box') {
      const displayVal = val ? (quiz.options.find(o => o.id === val)?.text || val) : '';
      const filledClass = val ? 'filled' : '';
      // Only apply validation class if there is a value
      const finalClass = val ? `${filledClass} ${validationClass}` : filledClass;

      return `<div class="inline-box ${finalClass}" data-index="${idx}">${displayVal}</div>`;
    }
    return match;
  });
}

function renderOptions(quiz, state, isResultView) {
  const container = document.getElementById('options-area');
  if (!container) return;

  const userAnswer = state.userAnswers[quiz.id];

  if (quiz.type === 'choice') {
    container.innerHTML = quiz.options.map(opt => {
      const isSelected = Array.isArray(userAnswer) && userAnswer.includes(opt.id);
      let className = 'option-item';
      if (isSelected) className += ' selected';

      if (isResultView) {
        if (quiz.answer.includes(opt.id)) {
          className += ' correct';
        } else if (isSelected) className += ' wrong';
        return `<div class="${className}">${opt.text}</div>`;
      }

      return `
        <button class="${className}" data-value="${opt.id}">
          <div class="check-circle ${isSelected ? 'checked' : ''}"></div>
          ${opt.text}
        </button>
      `;
    }).join('');

    if (!isResultView) {
      container.childNodes.forEach(node => {
        if (node.tagName === 'BUTTON') {
          node.addEventListener('click', (e) => {
            const val = e.currentTarget.dataset.value;
            let newAnswer = userAnswer ? [...userAnswer] : [];
            if (newAnswer.includes(val)) {
              newAnswer = newAnswer.filter(v => v !== val);
            } else {
              newAnswer.push(val);
            }
            store.setAnswer(newAnswer);
          });
        }
      });
    }
  }
  else if (quiz.type === 'ox') {
    const isO = userAnswer === 'O';
    const isX = userAnswer === 'X';

    container.innerHTML = `
        <div class="ox-container">
           <button class="ox-btn ${isO ? 'selected' : ''} ${isResultView && quiz.answer[0] === 'O' ? 'correct' : (isResultView && isO && quiz.answer[0] !== 'O' ? 'wrong' : '')}" data-value="O">
             <div class="ox-mark">O</div>
             <span>맞아요</span>
           </button>
           <button class="ox-btn ${isX ? 'selected' : ''} ${isResultView && quiz.answer[0] === 'X' ? 'correct' : (isResultView && isX && quiz.answer[0] !== 'X' ? 'wrong' : '')}" data-value="X">
             <div class="ox-mark">X</div>
             <span>틀려요</span>
           </button>
        </div>
     `;

    if (!isResultView) {
      container.querySelectorAll('.ox-btn').forEach(btn => {
        btn.addEventListener('click', () => store.setAnswer(btn.dataset.value));
      });
    }
  }
  else if (quiz.type === 'box') {
    const currentAnswers = userAnswer || [];
    container.innerHTML = `
      <div class="box-options-label">보기에서 선택하세요:</div>
      <div class="box-options-grid">
        ${quiz.options.map(opt => {
      const isUsed = currentAnswers.includes(opt.id);
      return `<button class="box-chip ${isUsed ? 'used' : ''}" data-value="${opt.id}" ${isResultView ? 'disabled' : ''}>${opt.text}</button>`;
    }).join('')}
      </div>
      </div>
    `;

    if (!isResultView) {
      container.querySelectorAll('.box-chip').forEach(btn => {
        btn.addEventListener('click', (e) => {
          if (e.target.classList.contains('used')) return;
          const slotsCount = (quiz.passage.content.match(/\{\d+\}/g) || []).length;
          let newAnswers = [...currentAnswers];
          if (newAnswers.length < slotsCount) {
            newAnswers.push(btn.dataset.value);
            store.setAnswer(newAnswers);
          }
        });
      });
      // Reset button listener removed

      document.querySelectorAll('.inline-box').forEach(box => {
        box.addEventListener('click', (e) => {
          const idx = parseInt(e.target.dataset.index);
          let newAnswers = [...currentAnswers];
          if (newAnswers[idx]) {
            newAnswers.splice(idx, 1);
            store.setAnswer(newAnswers);
          }
        });
      });
    }
  }
}

function bindInlineEvents(quiz, state, isResultView) {
  if (isResultView) return;

  if (quiz.type === 'blank') {
    document.querySelectorAll('.inline-input').forEach(input => {
      // 입력값에 따라 크기 자동 조정 함수
      const adjustInputSize = (inputEl) => {
        // 입력값의 길이에 따라 크기 조정 (최소 2글자, 최대 15글자)
        const length = Math.max(2, Math.min(15, inputEl.value.length || 2));
        inputEl.style.width = `${length * 0.8 + 1}em`;
      };
      
      // 초기 크기 설정
      adjustInputSize(input);
      
      input.addEventListener('input', (e) => {
        const idx = parseInt(e.target.dataset.index);
        let current = Array.isArray(state.userAnswers[quiz.id]) ? [...state.userAnswers[quiz.id]] : (state.userAnswers[quiz.id] ? [state.userAnswers[quiz.id]] : []);
        current[idx] = e.target.value;
        store.setAnswer(current);
        
        // 입력값에 따라 크기 조정
        adjustInputSize(e.target);
      });
    });
  } else if (quiz.type === 'select') {
    document.querySelectorAll('.inline-select').forEach(sel => {
      sel.addEventListener('change', (e) => {
        const idx = parseInt(e.target.dataset.index);
        let current = Array.isArray(state.userAnswers[quiz.id]) ? [...state.userAnswers[quiz.id]] : [];
        current[idx] = e.target.value;
        store.setAnswer(current);
      });
    });
  }
}

// Subscribe and Initial Render
if (store) {
  store.subscribe(render);
  render();
}
