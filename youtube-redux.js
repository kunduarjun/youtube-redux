(function() {    
    // Initial console log 
    console.debug("YouTube Redux initialized at: ", new Date().toISOString()); 

    // Speed warning with dismiss option 
    const showSpeedWarning = () => {
        if (localStorage.getItem('ytReduxHideSpeedWarning')) return;

        const video = document.querySelector('video');
        if (video?.playbackRate > 1.5) {
            requestAnimationFrame(() => {
                const warning = document.createElement('div');
                warning.innerHTML = `<span>Tip: 1x speed gives smoothest transitions</span>
                <button aria-label="Dismiss speed warning"
                style="margin-left: 8px; background: transparent; border: none; color: #606060; font-size: 16px; cursor: pointer; padding: 0 4px;" tabindex="0">x</button>`;
                warning.style.cssText = `position: fixed; bottom: 20px; right: 20px; padding: 8px 20px; background: #ffeb3b; color: #000; 
                z-index: 9999; border-radius: 4px; 
                font-family: YouTube Noto, Roboto, Arial; font-size: 14px; box-shadow: 0 2px 5px rgba(0,0,0,0.2); 
                opacity: 0; transition: opacity 0.5s; display: flex; align-items: center;`; 

                const dismissButton = warning.querySelector('button');
                dismissButton.onclick = () => {
                    localStorage.setItem('ytReduxHideSpeedWarning', 'true');
                    warning.style.opacity = '0';
                    setTimeout(() => warning.remove(), 500);
                };

                // Keyboard support
                dismissButton.onkeydown = (e) => {
                    if (e.key === "Enter" || e.key === " ") {
                        dismissButton.click();
                    }
                };

                document.body.appendChild(warning);
                setTimeout(() => warning.style.opacity = '1', 1000);
                setTimeout(() => { warning.style.opacity = '0'; setTimeout(() => warning.remove(), 500); }, 8000); 
            });
        } 
    }; 

    // Initialize after DOM settles 
    setTimeout(showSpeedWarning, 1500); 

    // Prevent multiple script executions 
    if (window.youtubeReduxInitialized) return;
    window.youtubeReduxInitialized = true;

    // Constants
    const AD_SELECTORS = '.ytp-ad-player-overlay, .ad-showing';
    const POLLING_INTERVAL = 300000; 

    // Transitional/Ad state detection
    let isInAdTransition = false;
    const observers = {
        sidebar: null,
        belowVideo: null
    };

    // Detect YouTube's video transtions
    document.addEventListener('yt-navigate-start', () => {
        isInAdTransition = true;
        console.log("Optimizing for video transition…");
    });

    document.addEventListener('yt-navigate-finish', () => {
        isInAdTransition = false;
        initializeCleanup(); // Restore full functionality
    });

    function checkForAd() {
        // Double exclamation marks to convert any value to a strict boolean 
        return !!document.querySelector(AD_SELECTORS);
    }

    // Identify selectors (tag names) of sections to be removed 
    const elementsConfig = {
        rightSidebar: [
            { selector: 'ytd-player-legacy-desktop-watch-ads-renderer', description: 'Advertisement(s)'}, 
            { selector: 'ytd-engagement-panel-section-list-renderer', description: 'Sponsorship(s)'}, 
            { selector: 'ytd-watch-next-secondary-results-renderer', description: 'Recommended Reels/Videos'} 
        ],

        belowVideo: [
            { selector: 'ytd-comments', description: 'Comments Section' },
            { selector: 'ytd-merch-shelf-renderer', description: 'Merchandise Shelf'}
        ],

        endOfQueue: [
            { selector: '.html5-endscreen', description: 'End-of-queue recommendations' }
        ]
    };


    // Function that waits for elements to exist  
    function waitForElement(selector, callback, attempts = 20) {
        const element = document.querySelector(selector);
        // If element exists (if the querySelector finds the specified selector in the document)
        if (element) {
            // Call the specified callback function on the element
            callback(element);
        } else if (attempts > 0) {
            // Otherwise, wait for the element to load on the document… 
            setTimeout(() => waitForElement(selector, callback, attempts - 1), 100);
        } else {
            console.warn(`Timeout waiting for ${selector}`); 
        }
    }


    // Removal function with error handling 
    const removalStats = {};
    const firstMissLogged = new Set();
    function removeElements(container, elements) {
        // Skip non-ad elements during transitions to avoid layout thrashing 
        const targets = (isInAdTransition || checkForAd()) ? elements.filter(e => e.selector === 'ytd-player-legacy-desktop-watch-ads-renderer') : elements; 
        targets.forEach(({selector, description}) => {
            try {
                const element = container.querySelector(selector) || document.querySelector(selector);
                if (element) {
                    // Optimized removal during critical moments 
                    if (isInAdTransition || checkForAd()) {
                        element.style.display = 'none';
                        setTimeout(() => element.remove(), 0);
                    } else {
                        element.remove();
                    }
                    removalStats[description] = (removalStats[description] || 0 ) + 1;
                    console.log(`Successfully removed ${description} (Total: ${removalStats[description]})`);
                    firstMissLogged.delete(description);
                } else if (!firstMissLogged.has(description)) {
                    console.log(`First check missed: ${description}`);
                    firstMissLogged.add(description); 
                }
            } catch (error) {
                console.log(`Error removing ${description}:`, error);
            }
        });
    }


    // Main execution flow
    function initializeCleanup() {

        // Cleanup existing resources
        observers.sidebar?.disconnect();
        observers.belowVideo?.disconnect();
        observers.endscreen?.disconnect(); 
        clearInterval(window.youtubeReduxInterval); 

        if (isInAdTransition || checkForAd()) { removeElements(document, elementsConfig.rightSidebar); return; } 

        // Process right sidebar
        waitForElement('#secondary', (sidebar) => {
            removeElements(sidebar, elementsConfig.rightSidebar);
            observers.sidebar = new MutationObserver(() => { 
                if (!isInAdTransition && !checkForAd()) { 
                    removeElements(sidebar, elementsConfig.rightSidebar); 
                }
             }).observe(sidebar, { childList: true, subtree: true }); 
        }); 

        // Process below video content
        waitForElement('#below', (belowContainer) => {
            removeElements(belowContainer, elementsConfig.belowVideo); 
            observers.belowVideo = new MutationObserver(() => {
                if (!isInAdTransition && !checkForAd()) {
                    removeElements(belowContainer, elementsConfig.belowVideo);
                }
            }).observe(belowContainer, { childList: true, subtree: true }); 
        });

        // Process recommended videos that display at the end of the final video on the queue
        waitForElement('.html5-endscreen', (endscreen) => {
            observers.endscreen = new MutationObserver(() => {
                removeElements(document, elementsConfig.endOfQueue);
            }).observe(endscreen.parentElement, { childList: true });
            // Initial Removal
            removeElements(document, elementsConfig.endOfQueue); 
        }); 

        // Fallback CSS injection for stubborn elements
        const styleElement = document.createElement('style');
        styleElement.id = 'yt-redux-styles'; 
        styleElement.textContent = `ytd-player-legacy-desktop-watch-ads-renderer, ytd-engagement-panel-section-list-renderer { 
        visibility: hidden !important; height: 0 !important; margin: 0 !important; }
        ytd-watch-next-secondary-results-renderer, ytd-comments, ytd-merch-shelf-renderer, .html5-endscreen { 
        display: none !important; }
        .ytp-endscreen-content {
        visibility: hidden !important; }`; 
        document.head.append(styleElement); 

        // Periodic check for reoccuring elements (every 5 minutes) 
        window.youtubeReduxInterval = setInterval(() => { 
            if (!isInAdTransition && !checkForAd()) {
                console.debug(`[${new Date().toISOString()}] Running periodic cleanup…`); 
                removeElements(document, elementsConfig.rightSidebar);
                removeElements(document, elementsConfig.belowVideo);
            }
        }, POLLING_INTERVAL);
    }


    // Start the cleanup process
    new MutationObserver(() => { if (!isInAdTransition && !checkForAd()) initializeCleanup(); }).observe(document.body, { childList: true, subtree: true });
    initializeCleanup();
})(); 