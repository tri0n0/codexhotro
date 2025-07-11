document.addEventListener('DOMContentLoaded', () => {
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

    let userName = localStorage.getItem('userName') || ''; // Load user name from local storage

    // Helper function to get module titles for dynamic header
    const moduleTitles = {
        'home': 'Mastering Python Programming!',
        'module1': 'Getting Started',
        'module2': 'Loops & Functions',
        'module3': 'Binary & ASCII',
        'labs': 'Labs & Challenges',
        'about': 'About This Course'
    };

    // Function to update the header text dynamically
    const updateHeader = (activeModuleId) => {
        let message = '';
        if (userName) {
            const progress = JSON.parse(localStorage.getItem('courseProgress')) || {};
            const moduleStatus = progress[activeModuleId];
            const moduleTitle = moduleTitles[activeModuleId] || 'Your Python Journey';

            if (moduleStatus === 'unlocked' || (activeModuleId !== 'home' && progress[`${activeModuleId}`] === 'complete')) {
                // If a module is unlocked (by quiz) or generally marked complete
                if (activeModuleId === 'labs') {
                    message = `🥳 Awesome, ${userName}! You've unlocked the Challenges! Let's build!`;
                } else if (activeModuleId === 'about') {
                     message = `Hello, ${userName}! Ready to learn about the course?`;
                } else {
                    message = `🌟 Fantastic, ${userName}! You've mastered ${moduleTitle}!`;
                }
            } else if (activeModuleId === 'home') {
                 message = `Welcome back, ${userName}! Let's dive deeper! 🚀`;
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
    const hideLoadingOverlay = () => {
        loadingOverlay.classList.add('hidden');
        loadingOverlay.addEventListener('transitionend', () => {
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
        }, { once: true });
    };

    // Prevent scrolling during loading
    document.body.style.overflow = 'hidden';

    // Set a timeout to hide the loading overlay.
    setTimeout(() => {
        hideLoadingOverlay();
    }, 2500); // 2.5 seconds, matching CSS animation duration
    // --- END OF LOADING SCREEN LOGIC ---

    // --- START OF NAME INPUT MODAL LOGIC ---
    const showNameInputModal = () => {
        nameInputModal.classList.add('active');
        document.body.style.overflow = 'hidden'; // Prevent background scrolling
        userNameInput.focus(); // Focus on the input field
    };

    const hideNameInputModal = () => {
        nameInputModal.classList.remove('active');
        document.body.style.overflow = ''; // Restore scrolling
    };

    const saveUserName = () => {
        const inputName = userNameInput.value.trim();
        if (inputName) {
            userName = inputName;
            localStorage.setItem('userName', userName);
            hideNameInputModal();
            initializeCourse(); // Proceed to initialize the course after name is saved
        } else {
            alert("Please enter your name to start your Python adventure!");
            userNameInput.focus();
        }
    };

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
    // Function to adjust the layout based on header height
    const adjustLayout = () => {
        if (header && leftPanel && window.innerWidth > 900) {
            const headerHeight = header.offsetHeight;
            document.body.style.paddingTop = `${headerHeight}px`;
            leftPanel.style.top = `${headerHeight}px`;
            leftPanel.style.height = `calc(100vh - ${headerHeight}px)`;
        } else {
            document.body.style.paddingTop = '0';
            leftPanel.style.top = 'auto';
            leftPanel.style.height = 'auto';
        }
    };

    window.addEventListener('resize', adjustLayout);
    // --- END OF DYNAMIC LAYOUT ADJUSTMENTS ---

    // Function to show a specific module and update header
    const showModule = (targetId) => {
        moduleSections.forEach(section => {
            section.classList.remove('active');
        });
        const targetModule = document.getElementById(targetId);
        if (targetModule) {
            targetModule.classList.add('active');
            const moduleDisplayArea = document.querySelector('.module-display-area');
            if (moduleDisplayArea) {
                moduleDisplayArea.scrollTop = 0;
            }
        }
        updateHeader(targetId); // Update header when module changes
    };

    // Handle navigation clicks
    navLinks.forEach(link => {
        link.addEventListener('click', (event) => {
            event.preventDefault();

            const targetId = link.dataset.target;

            if (link.classList.contains('locked') && targetId !== 'home' && targetId !== 'about') {
                alert(`Oops, ${userName || 'friend'}! Module ${moduleTitles[targetId]} is locked. Complete the previous module's quiz to unlock it!`);
                return;
            }

            navLinks.forEach(nav => nav.classList.remove('active'));
            link.classList.add('active');

            showModule(targetId);
        });
    });

    // Handle "Continue to Module 1" button on the home page
    if (continueButton) {
        continueButton.addEventListener('click', () => {
            showModule('module1');
            navLinks.forEach(nav => nav.classList.remove('active'));
            document.getElementById('nav-module1').classList.add('active');
        });
    }

    // Load progress from localStorage and update UI
    const loadProgress = () => {
        const progress = JSON.parse(localStorage.getItem('courseProgress')) || {};
        for (const module in progress) {
            const statusElement = document.getElementById(`progress-${module}`);
            if (statusElement) {
                if (progress[module] === 'complete' || progress[module] === 'unlocked') {
                    statusElement.classList.add('complete');
                } else {
                    statusElement.classList.remove('complete');
                }
            }

            if (moduleUnlockQuestions[module] && progress[module] === 'unlocked') {
                const nextModuleNavId = moduleUnlockQuestions[module].nextModuleNavId;
                const nextNavLink = document.getElementById(`nav-${nextModuleNavId}`);
                if (nextNavLink) {
                    nextNavLink.classList.remove('locked');
                }
            }
        }
    };

    // Save progress to localStorage
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

    // Mark lesson/assignment complete function (accessible globally via window)
    window.markComplete = (lessonId) => {
        const statusElement = document.getElementById(`${lessonId}-status`);
        if (statusElement) {
            statusElement.textContent = 'Complete! 🎉'; // Add emoji
            statusElement.classList.add('complete');
            saveProgress(lessonId, 'complete');
        }
        checkModuleCompletion();
    };

    // Function to check if all lessons in a module are complete
    const checkModuleCompletion = () => {
        const moduleLessons = {
            'module1': ['lesson1-1', 'lesson1-2', 'assignment1-1', 'lesson1-3', 'lesson1-4', 'lesson1-5', 'lesson1-6', 'lesson1-7', 'lesson1-8', 'lesson1-9', 'lesson1-10'],
            'module2': ['lesson2-1', 'lesson2-2', 'lesson2-3', 'assignment2-1', 'lesson2-4', 'lesson2-5', 'lesson2-6', 'lesson2-7', 'lesson2-8'],
            'module3': ['lesson3-1', 'lesson3-2', 'lesson3-3', 'lesson3-4', 'lesson3-5', 'assignment3-1', 'lesson3-6'],
            'labs': ['lab1-completion', 'lab2-completion', 'lab3-completion', 'lab4-completion']
        };

        const progress = JSON.parse(localStorage.getItem('courseProgress')) || {};

        for (const moduleId in moduleLessons) {
            const allLessonsComplete = moduleLessons[moduleId].every(lessonId => progress[lessonId] === 'complete');

            if (progress[moduleId] !== 'unlocked') { // Only update if not already unlocked by quiz
                if (allLessonsComplete) {
                    saveProgress(moduleId, 'complete');
                } else {
                    saveProgress(moduleId, 'incomplete');
                }
            }
        }
    };

    // Toggle solution display (accessible globally via window)
    window.toggleSolution = (solutionId) => {
        const solutionElement = document.getElementById(solutionId);
        if (solutionElement) {
            const currentDisplay = window.getComputedStyle(solutionElement).display;
            solutionElement.style.display = currentDisplay === 'block' ? 'none' : 'block';
        }
    };

    // Toggle lab details display (accessible globally via window)
    window.showLabDetails = (labId) => {
        const labDetailsElement = document.getElementById(`${labId}-details`);
        if (labDetailsElement) {
            const currentDisplay = window.getComputedStyle(labDetailsElement).display;
            labDetailsElement.style.display = currentDisplay === 'block' ? 'none' : 'block';
        }
    };

    // Unlock logic for series of questions (accessible globally via window)
    window.checkUnlock = (currentModuleId) => {
        const moduleInfo = moduleUnlockQuestions[currentModuleId];
        const statusElement = document.getElementById(`${currentModuleId}-unlock-status`);
        let allCorrect = true;

        if (!moduleInfo) {
            statusElement.textContent = 'Error: Module unlock data not found.';
            statusElement.classList.remove('success');
            statusElement.classList.add('unlock-status');
            return;
        }

        moduleInfo.questions.forEach(q => {
            const inputElement = document.getElementById(q.id);
            if (inputElement) {
                const enteredAnswer = inputElement.value.trim().toUpperCase();
                if (enteredAnswer !== q.answer) {
                    allCorrect = false;
                    inputElement.style.backgroundColor = '#ffdddd'; // Indicate incorrect
                } else {
                    inputElement.style.backgroundColor = '#ddffdd'; // Indicate correct
                }
            } else {
                console.warn(`Input element with ID ${q.id} not found for module ${currentModuleId}`);
                allCorrect = false;
            }
        });

        if (allCorrect) {
            statusElement.textContent = `🥳 Amazing, ${userName}! All answers correct. Module Unlocked!`;
            statusElement.classList.remove('unlock-status');
            statusElement.classList.add('success');

            const nextModuleNavId = moduleInfo.nextModuleNavId;
            const nextNavLink = document.getElementById(`nav-${nextModuleNavId}`);
            if (nextNavLink) {
                nextNavLink.classList.remove('locked');
            }
            saveProgress(currentModuleId, 'unlocked'); // Mark the current module as 'unlocked'

            // Briefly show success, then navigate and clear quiz
            setTimeout(() => {
                showModule(nextModuleNavId); // Navigate to the newly unlocked module
                navLinks.forEach(nav => nav.classList.remove('active'));
                if (nextNavLink) {
                    nextNavLink.classList.add('active');
                }
                // Reset quiz inputs and status message
                moduleInfo.questions.forEach(q => {
                    const input = document.getElementById(q.id);
                    if (input) {
                        input.value = '';
                        input.style.backgroundColor = '';
                    }
                });
                statusElement.textContent = '';
            }, 1500);
        } else {
            statusElement.textContent = `Oops, ${userName || 'friend'}! Some answers are incorrect. Please review and try again. 🤔`;
            statusElement.classList.remove('success');
            statusElement.classList.add('unlock-status');
        }
    };

    // Main initialization function called after loading/name input
    const initializeCourse = () => {
        adjustLayout(); // Ensure layout is correct
        loadProgress(); // Load all saved progress
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

        showModule(moduleToShow); // Show the determined module
        document.getElementById(`nav-${moduleToShow}`).classList.add('active'); // Set its nav link active
    };

    // Save the last active module when a link is clicked
    navLinks.forEach(link => {
        link.addEventListener('click', (event) => {
            const targetId = link.dataset.target;
            if (!link.classList.contains('locked') || targetId === 'home' || targetId === 'about') {
                 localStorage.setItem('lastActiveModule', targetId);
            }
        });
    });

    // Save last active module on refresh or close (beforeunload)
    window.addEventListener('beforeunload', () => {
        const activeModule = document.querySelector('.module-section.active');
        if (activeModule) {
            localStorage.setItem('lastActiveModule', activeModule.id);
        }
    });

});