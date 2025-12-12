export class Navigation {
    constructor(element, store) {
        this.element = element;
        this.store = store;
        this.render();

        this.store.subscribe(() => {
            this.render();
        });
    }

    render() {
        const { quizzes, currentIndex, quizStatus } = this.store.getState();

        this.element.innerHTML = quizzes.map((quiz, index) => {
            const status = quizStatus[quiz.id];
            const isActive = index === currentIndex;
            let className = 'nav-item';

            // Status class (correct/wrong)
            // Note: 'current' status in store is for initialization mainly. 
            // We rely on 'correct'/'wrong' for filled states.
            // If isActive, it overrides color via CSS !important or specific class logic.

            if (status === 'correct' || status === 'wrong') {
                className += ` ${status}`;
            }

            if (isActive) {
                className += ' active';
            } else if (status === 'current') {
                // Logic check: if we moved past it, it's not current.
                // If we moved back to it, it is active.
                // So 'current' status in store might be redundant for visual if we use currentIndex.
                // But let's keep it clean.
            }

            return `
        <button class="${className}" data-index="${index}">
          ${index + 1}
        </button>
      `;
        }).join('');

        // Add click events if needed (optional requirements implies linear flow mostly, but prev button exists)
        // For now, only visual indicator or clickable if completed?
        // User requested "Navigation Area", likely just for status display.
    }
}
