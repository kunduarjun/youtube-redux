(function() {    
    // Initial console log 
    console.log("YouTube Redux initialized at: ", new Date().toISOString()); 

    // Prevent multiple script executions 
    if (window.youtubeReduxInitialized) return;
    window.youtubeReduxInitialized = true;


    // Identify selectors (tag names) of sections to be removed 
    const elementsConfig = {
        rightSidebar: [
            { selector: 'ytd-player-legacy-desktop-watch-ads-renderer', description: 'Advertisement(s)'}, 
            { selector: 'ytd-engagement-panel-section-list-renderer', description: 'Sponsership(s)'}, 
            { selector: 'ytd-watch-next-secondary-results-renderer', description: 'Recommended Reels/Videos'} 
        ],

        belowVideo: [
            { selector: 'ytd-comments', description: 'Comments Section' },
            { selector: 'ytd-merch-shelf-renderer', description: 'Merchandise Shelf'}
        ]
    };


    // Function that waits for elements to exist  
    function waitForElement(selector, callback, attempts = 50) {
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
    function removeElements(container, elements) {
        elements.forEach(({selector, description}) => {
            try {
                const element = container.querySelector(selector) || document.querySelector(selector);
                if (element) {
                    element.remove();
                    removalStats[description] = (removalStats[description] || 0 ) + 1;
                    console.log(`Successfully removed ${description} (Total: ${removalStats[description]})`);
                } else {
                    console.log(`Not found: ${description}`);
                }
            } catch (error) {
                console.log(`Error removing ${description}:`, error);
            }
        });
    }


    // Main execution flow
    function initializeCleanup() {

        // Prevents multiple observers from existing 
        if (window.youtubeReduxObserver) { window.youtubeReduxObserver.disconnect(); delete window.youtubeReduxObserver; }
        // Prevents multiple timers from existing 
        if (window.youtubeReduxInterval) { clearInterval(window.youtubeReduxInterval); window.youtubeReduxInterval = null; }

        // Process right sidebar
        waitForElement('#secondary', (sidebar) => {
            removeElements(sidebar, elementsConfig.rightSidebar);
            const observer = new MutationObserver(() => { removeElements(sidebar, elementsConfig.rightSidebar); });
            observer.observe(sidebar, { childList: true, subtree: true });
            window.youtubeReduxObserver = observer; 
        }); 

        // Process below video content
        waitForElement('#below', (belowContainer) => {
            removeElements(belowContainer, elementsConfig.belowVideo); 
            const belowObserver = new MutationObserver(() => {removeElements(belowContainer, elementsConfig.belowVideo);});
            belowObserver.observe(belowContainer, { childList: true, subtree: true }); 
        });

        // Fallback CSS injection for stubborn elements
        if (!document.getElementById('yt-redux-styles')) { 
            const styleElement = document.createElement('style');
            styleElement.id = 'yt-redux-styles'; 
            styleElement.textContent = `ytd-player-legacy-desktop-watch-ads-renderer, 
            ytd-engagement-panel-section-list-renderer, 
            ytd-watch-next-secondary-results-renderer, 
            ytd-comments, 
            ytd-merch-shelf-renderer { 
            display: none !important; }`;
            document.head.appendChild(styleElement);
        }

        // Periodic check for reoccuring elements (every 15 seconds) 
        window.youtubeReduxInterval = setInterval(() => {
            removeElements(document, elementsConfig.rightSidebar);
            removeElements(document, elementsConfig.belowVideo);
        }, 15000);
    }


    // Start the cleanup process
    initializeCleanup();
    new MutationObserver(initializeCleanup).observe(document.body, { childList: true, subtree: true });
})(); 