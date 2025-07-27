document.addEventListener('DOMContentLoaded', () => {
    // DOM Element References
    const navLinks = document.querySelectorAll('.left-panel nav ul li a');
    const moduleSections = document.querySelectorAll('.module-section');
    const continueButton = document.getElementById('continueToModule1');
    const loadingOverlay = document.getElementById('loading-overlay');
    const nameInputModal = document.getElementById('name-input-modal');
    const userNameInput = document.getElementById('userNameInput');
    const saveNameBtn = document.getElementById('saveNameBtn');
    const dynamicHeaderText = document.getElementById('dynamic-header-text');
    const header = document.querySelector('header');
    const leftPanel = document.querySelector('.left-panel');

    // Load user name from local storage, default to empty string
    let userName = localStorage.getItem('userName') || '';

    // Helper function to get module titles for dynamic header
    const moduleTitles = {
        'home': 'Mastering Python Programming!',
        'module1': 'Getting Started',
        'module2': 'Loops & Functions',
        'module3': 'Binary & ASCII',
        'labs': 'Labs & Challenges',
        'about': 'About This Course'
    };

    // Define animation durations as constants for clarity
    const LOADING_OVERLAY_DURATION = 2500; // milliseconds
    const UNLOCK_SUCCESS_TIMEOUT = 1500; // milliseconds

    /**
     * Updates the main header text dynamically based on the active module and user's name.
     * @param {string} activeModuleId - The ID of the currently active module.
     */
    const updateHeader = (activeModuleId) => {
        let message = '';
        if (userName) {
            const progress = JSON.parse(localStorage.getItem('courseProgress')) || {};
            const moduleStatus = progress[activeModuleId];
            const moduleTitle = moduleTitles[activeModuleId] || 'Your Python Journey';

            if (activeModuleId === 'home') {
                message = `Welcome back, ${userName}! Let's dive deeper! 🚀`;
            } else if (activeModuleId === 'about') {
                message = `Hello, ${userName}! Ready to learn about the course?`;
            } else if (moduleStatus === 'unlocked' || progress[`${activeModuleId}`] === 'complete') {
                // If a module is unlocked (by quiz) or generally marked complete
                if (activeModuleId === 'labs') {
                    message = `🥳 Awesome, ${userName}! You've unlocked the Challenges! Let's build!`;
                } else {
                    message = `🌟 Fantastic, ${userName}! You've mastered ${moduleTitle}!`;
                }
            } else {
                // If module is active but not yet completed/unlocked
                message = `Keep going, ${userName}! You're currently in ${moduleTitle}. 💪`;
            }
        } else {
            // Default message if no user name is set
            message = 'Welcome to Mastering Python Programming!';
        }
        dynamicHeaderText.textContent = message;
    };

    // --- START OF LOADING SCREEN LOGIC ---
    /**
     * Hides the loading overlay with a transition and then removes it from the DOM.
     * After hiding, it checks whether to show the name input modal or initialize the course.
     */
    const hideLoadingOverlay = () => {
        loadingOverlay.classList.add('hidden');
        loadingOverlay.addEventListener('transitionend', () => {
            // Ensure the overlay is removed only after its transition completes
            if (loadingOverlay.parentNode) {
                loadingOverlay.remove();
            }
            document.body.style.overflow = ''; // Restore default scroll behavior

            // After loading, check if we need to ask for the name
            if (!userName) {
                showNameInputModal();
            } else {
                initializeCourse(); // If name exists, proceed to initialize the course
            }
        }, { once: true }); // Use { once: true } to automatically remove the listener after it fires
    };

    // Prevent scrolling during loading to ensure a smooth splash screen
    document.body.style.overflow = 'hidden';

    // Set a timeout to hide the loading overlay after a specified duration
    setTimeout(() => {
        hideLoadingOverlay();
    }, LOADING_OVERLAY_DURATION);
    // --- END OF LOADING SCREEN LOGIC ---

    // --- START OF NAME INPUT MODAL LOGIC ---
    /**
     * Displays the name input modal and prevents background scrolling.
     */
    const showNameInputModal = () => {
        nameInputModal.classList.add('active');
        document.body.style.overflow = 'hidden'; // Prevent background scrolling
        userNameInput.focus(); // Focus on the input field for immediate typing
    };

    /**
     * Hides the name input modal and restores background scrolling.
     */
    const hideNameInputModal = () => {
        nameInputModal.classList.remove('active');
        document.body.style.overflow = ''; // Restore scrolling
    };

    /**
     * Saves the user's name from the input field to local storage.
     * Validates input and then hides the modal, proceeding to course initialization.
     */
    const saveUserName = () => {
        const inputName = userNameInput.value.trim();
        if (inputName) {
            userName = inputName;
            localStorage.setItem('userName', userName);
            hideNameInputModal();
            initializeCourse(); // Proceed to initialize the course after name is saved
        } else {
            // Using a simple alert for now, consider a custom modal for better UX
            alert("Please enter your name to start your Python adventure!");
            userNameInput.focus(); // Keep focus on the input if empty
        }
    };

    // Event listeners for the name input modal
    saveNameBtn.addEventListener('click', saveUserName);
    userNameInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            saveUserName();
        }
    });
    // --- END OF NAME INPUT MODAL LOGIC ---

    // Define the unlock questions and answers for each module
    const moduleUnlockQuestions = {
        'module1': {
            nextModuleNavId: 'module2',
            questions: [
                { id: 'm1q1', answer: 'PRINT' },
                { id: 'm1q2', answer: 'DEBUGGING' },
                { id: 'm1q3', answer: 'INTEGER' }
            ]
        },
        'module2': {
            nextModuleNavId: 'module3',
            questions: [
                { id: 'm2q1', answer: 'DEF' },
                { id: 'm2q2', answer: 'FOR' },
                { id: 'm2q3', answer: 'LAMBDA' }
            ]
        },
        'module3': {
            nextModuleNavId: 'labs',
            questions: [
                { id: 'm3q1', answer: '2' }, // Changed 'BINARY' to '2' as it's more specific for "base"
                { id: 'm3q2', answer: 'ORD' },
                { id: 'm3q3', answer: '8' }
            ]
        }
    };

    // --- START OF DYNAMIC LAYOUT ADJUSTMENTS ---
    /**
     * Adjusts the layout (body padding, left panel top/height) based on header height
     * for a fixed header and sidebar on larger screens.
     */
    const adjustLayout = () => {
        if (header && leftPanel && window.innerWidth > 900) {
            const headerHeight = header.offsetHeight;
            document.body.style.paddingTop = `${headerHeight}px`; // Push body content down
            leftPanel.style.top = `${headerHeight}px`; // Position sidebar below header
            leftPanel.style.height = `calc(100vh - ${headerHeight}px)`; // Make sidebar fill remaining height
        } else {
            // Reset styles for smaller screens where header/sidebar are relative
            document.body.style.paddingTop = '0';
            leftPanel.style.top = 'auto';
            leftPanel.style.height = 'auto';
        }
    };

    // Listen for window resize to re-adjust layout
    window.addEventListener('resize', adjustLayout);
    // --- END OF DYNAMIC LAYOUT ADJUSTMENTS ---

    /**
     * Deactivates the 'active' class from all navigation links.
     */
    const deactivateAllNavLinks = () => {
        navLinks.forEach(nav => nav.classList.remove('active'));
    };

    /**
     * Hides all module sections and then displays the target module.
     * Scrolls the module display area to the top.
     * @param {string} targetId - The ID of the module section to display.
     */
    const showModule = (targetId) => {
        moduleSections.forEach(section => {
            section.classList.remove('active');
        });
        const targetModule = document.getElementById(targetId);
        if (targetModule) {
            targetModule.classList.add('active');
            const moduleDisplayArea = document.querySelector('.module-display-area');
            if (moduleDisplayArea) {
                moduleDisplayArea.scrollTop = 0; // Scroll to top of the module content
            }
        }
        updateHeader(targetId); // Update header when module changes
    };

    // Handle navigation clicks using event delegation
    navLinks.forEach(link => {
        link.addEventListener('click', (event) => {
            event.preventDefault(); // Prevent default link behavior (page reload)

            const targetId = link.dataset.target; // Get the target module ID from data-target attribute

            // Prevent navigation to locked modules (except Home and About)
            if (link.classList.contains('locked') && targetId !== 'home' && targetId !== 'about') {
                alert(`Oops, ${userName || 'friend'}! Module ${moduleTitles[targetId]} is locked. Complete the previous module's quiz to unlock it!`);
                return; // Stop execution if module is locked
            }

            deactivateAllNavLinks(); // Deactivate all other nav links
            link.classList.add('active'); // Activate the clicked link

            showModule(targetId); // Show the corresponding module
            localStorage.setItem('lastActiveModule', targetId); // Save last active module
        });
    });

    // Handle "Continue to Module 1" button on the home page
    if (continueButton) {
        continueButton.addEventListener('click', () => {
            showModule('module1'); // Show Module 1
            deactivateAllNavLinks(); // Deactivate all nav links
            document.getElementById('nav-module1').classList.add('active'); // Activate Module 1 nav link
            localStorage.setItem('lastActiveModule', 'module1'); // Save Module 1 as last active
        });
    }

    /**
     * Loads course progress from local storage and updates the UI accordingly.
     * This includes module progress indicators and unlocking navigation links.
     */
    const loadProgress = () => {
        const progress = JSON.parse(localStorage.getItem('courseProgress')) || {};

        // Update module progress indicators in the left panel
        for (const module in progress) {
            const statusElement = document.getElementById(`progress-${module}`);
            if (statusElement) {
                if (progress[module] === 'complete' || progress[module] === 'unlocked') {
                    statusElement.classList.add('complete');
                } else {
                    statusElement.classList.remove('complete');
                }
            }
        }

        // Unlock navigation links for modules that are marked 'unlocked' by quiz
        for (const moduleId in moduleUnlockQuestions) {
            if (progress[moduleId] === 'unlocked') {
                const nextModuleNavId = moduleUnlockQuestions[moduleId].nextModuleNavId;
                const nextNavLink = document.getElementById(`nav-${nextModuleNavId}`);
                if (nextNavLink) {
                    nextNavLink.classList.remove('locked'); // Remove 'locked' class from nav link
                }
            }
        }

        // Update individual lesson/lab completion statuses
        document.querySelectorAll('.completion-status').forEach(statusElement => {
            const lessonId = statusElement.id.replace('-status', ''); // Extract lesson ID
            if (progress[lessonId] === 'complete') {
                statusElement.textContent = 'Complete! 🎉';
                statusElement.classList.add('complete');
            } else {
                statusElement.textContent = 'Incomplete';
                statusElement.classList.remove('complete');
            }
        });
    };

    /**
     * Saves progress for a specific item (lesson, lab, or module) to local storage.
     * Then reloads the progress to update the UI.
     * @param {string} id - The ID of the item to save progress for.
     * @param {string} status - The status to set ('complete', 'incomplete', 'unlocked').
     */
    const saveProgress = (id, status) => {
        const progress = JSON.parse(localStorage.getItem('courseProgress')) || {};
        progress[id] = status;
        localStorage.setItem('courseProgress', JSON.stringify(progress));
        loadProgress(); // Reload progress to update indicators and unlock links immediately
        // When progress changes, also update the header based on the currently active module
        const activeModule = document.querySelector('.module-section.active');
        if (activeModule) {
            updateHeader(activeModule.id);
        }
    };

    // Attach event listeners for "Mark as Complete" buttons using data-lesson-id
    document.querySelectorAll('.mark-complete-button').forEach(button => {
        button.addEventListener('click', (event) => {
            const lessonId = event.target.dataset.lessonId; // Get lesson ID from data attribute
            saveProgress(lessonId, 'complete'); // Directly save progress
            checkModuleCompletion(); // Re-check module completion after marking a lesson
        });
    });

    // Attach event listeners for "Show Solution" buttons using data-solution-target
    document.querySelectorAll('.solution-button').forEach(button => {
        button.addEventListener('click', (event) => {
            const solutionId = event.target.dataset.solutionTarget; // Get solution ID from data attribute
            const solutionElement = document.getElementById(solutionId);
            if (solutionElement) {
                // Toggle display style between 'block' and 'none'
                const currentDisplay = window.getComputedStyle(solutionElement).display;
                solutionElement.style.display = currentDisplay === 'block' ? 'none' : 'block';
            }
        });
    });

    // Attach event listeners for "Show Lab Details" buttons using data-lab-target
    document.querySelectorAll('.lab-button').forEach(button => {
        button.addEventListener('click', (event) => {
            const labId = event.target.dataset.labTarget; // Get lab ID from data attribute
            const labDetailsElement = document.getElementById(`${labId}-details`);
            if (labDetailsElement) {
                // Toggle display style between 'block' and 'none'
                const currentDisplay = window.getComputedStyle(labDetailsElement).display;
                labDetailsElement.style.display = currentDisplay === 'block' ? 'none' : 'block';
            }
        });
    });

    /**
     * Checks if all lessons within each module are complete and updates the module's status.
     * This is separate from the quiz-based 'unlocked' status.
     */
    const checkModuleCompletion = () => {
        const moduleLessons = {
            'module1': ['lesson1-1', 'lesson1-2', 'assignment1-1', 'lesson1-3', 'lesson1-4', 'lesson1-5', 'lesson1-6', 'lesson1-7', 'lesson1-8', 'lesson1-9', 'lesson1-10'],
            'module2': ['lesson2-1', 'lesson2-2', 'lesson2-3', 'assignment2-1', 'lesson2-4', 'lesson2-5', 'lesson2-6', 'lesson2-7', 'lesson2-8'],
            'module3': ['lesson3-1', 'lesson3-2', 'lesson3-3', 'lesson3-4', 'lesson3-5', 'assignment3-1', 'lesson3-6'],
            'labs': ['lab1-completion', 'lab2-completion', 'lab3-completion', 'lab4-completion']
        };

        const progress = JSON.parse(localStorage.getItem('courseProgress')) || {};

        for (const moduleId in moduleLessons) {
            // Only consider checking for 'complete' if the module hasn't been 'unlocked' by the quiz
            if (progress[moduleId] !== 'unlocked') {
                const allLessonsComplete = moduleLessons[moduleId].every(lessonId => progress[lessonId] === 'complete');
                if (allLessonsComplete) {
                    saveProgress(moduleId, 'complete');
                } else {
                    // Only mark as incomplete if it's not already complete
                    if (progress[moduleId] !== 'complete') {
                        saveProgress(moduleId, 'incomplete');
                    }
                }
            }
        }
    };

    // Attach event listeners for "Unlock Module" quiz buttons using data-module-target
    document.querySelectorAll('.unlock-module-button').forEach(button => {
        button.addEventListener('click', (event) => {
            const currentModuleId = event.target.dataset.moduleTarget; // Get current module ID from data attribute
            const moduleInfo = moduleUnlockQuestions[currentModuleId];
            const statusElement = document.getElementById(`${currentModuleId}-unlock-status`);
            let allCorrect = true;

            if (!moduleInfo) {
                statusElement.textContent = 'Error: Module unlock data not found.';
                statusElement.classList.remove('success');
                statusElement.classList.add('unlock-status'); // Ensure red text for errors
                return;
            }

            // Check each question's answer
            moduleInfo.questions.forEach(q => {
                const inputElement = document.getElementById(q.id);
                if (inputElement) {
                    const enteredAnswer = inputElement.value.trim().toUpperCase();
                    if (enteredAnswer !== q.answer) {
                        allCorrect = false;
                        inputElement.classList.remove('correct-answer');
                        inputElement.classList.add('incorrect-answer'); // Use CSS class for incorrect
                    } else {
                        inputElement.classList.remove('incorrect-answer');
                        inputElement.classList.add('correct-answer'); // Use CSS class for correct
                    }
                } else {
                    console.warn(`Input element with ID ${q.id} not found for module ${currentModuleId}`);
                    allCorrect = false; // Treat as incorrect if input element is missing
                }
            });

            if (allCorrect) {
                statusElement.textContent = `🥳 Amazing, ${userName}! All answers correct. Module Unlocked!`;
                statusElement.classList.remove('unlock-status');
                statusElement.classList.add('success'); // Apply success styling

                const nextModuleNavId = moduleInfo.nextModuleNavId;
                const nextNavLink = document.getElementById(`nav-${nextModuleNavId}`);
                if (nextNavLink) {
                    nextNavLink.classList.remove('locked'); // Unlock the next module's navigation link
                }
                saveProgress(currentModuleId, 'unlocked'); // Mark the current module as 'unlocked'

                // Briefly show success message, then navigate and clear quiz inputs
                setTimeout(() => {
                    showModule(nextModuleNavId); // Navigate to the newly unlocked module
                    deactivateAllNavLinks(); // Deactivate all nav links
                    if (nextNavLink) {
                        nextNavLink.classList.add('active'); // Activate the new module's nav link
                    }
                    // Reset quiz inputs and status message
                    moduleInfo.questions.forEach(q => {
                        const input = document.getElementById(q.id);
                        if (input) {
                            input.value = ''; // Clear input field
                            input.classList.remove('correct-answer', 'incorrect-answer'); // Remove feedback classes
                        }
                    });
                    statusElement.textContent = ''; // Clear status message
                    statusElement.classList.remove('success'); // Remove success class
                }, UNLOCK_SUCCESS_TIMEOUT);
            } else {
                statusElement.textContent = `Oops, ${userName || 'friend'}! Some answers are incorrect. Please review and try again. 🤔`;
                statusElement.classList.remove('success');
                statusElement.classList.add('unlock-status'); // Apply error styling
            }
        });
    });

    /**
     * Main initialization function called after the loading overlay hides or name is entered.
     * Sets up initial layout, loads progress, and displays the appropriate module.
     */
    const initializeCourse = () => {
        adjustLayout(); // Ensure layout is correct based on screen size and header height
        loadProgress(); // Load all saved progress from local storage
        checkModuleCompletion(); // Ensure module completion statuses are up to date

        // Determine which module to show initially
        // Prioritize last active module if available and valid
        const lastActiveModuleId = localStorage.getItem('lastActiveModule') || 'home';
        let moduleToShow = lastActiveModuleId;

        // Ensure the last active module is actually accessible (not locked)
        const lastActiveNavLink = document.getElementById(`nav-${lastActiveModuleId}`);
        if (lastActiveNavLink && lastActiveNavLink.classList.contains('locked')) {
            moduleToShow = 'home'; // Fallback to home if the last active module is now locked
        }

        showModule(moduleToShow); // Display the determined module
        // Set the active class on the correct navigation link based on moduleToShow
        const activeNavLinkElement = document.getElementById(`nav-${moduleToShow}`);
        if (activeNavLinkElement) {
            deactivateAllNavLinks(); // Deactivate all first
            activeNavLinkElement.classList.add('active'); // Then activate the correct one
        } else {
             // Fallback for an unexpected state, ensure home is active if none match
             document.getElementById('nav-home').classList.add('active');
        }
    };

    // Save the last active module when the user navigates away or closes the tab
    window.addEventListener('beforeunload', () => {
        const activeModule = document.querySelector('.module-section.active');
        if (activeModule) {
            localStorage.setItem('lastActiveModule', activeModule.id);
        }
    });

    // The call to initializeCourse is now inside hideLoadingOverlay()
    // and saveUserName(), ensuring it runs only after initial setup.
});
