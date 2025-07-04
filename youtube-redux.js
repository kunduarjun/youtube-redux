// Initial console log 
console.log("Running the extension...");


// Identify selectors (tag names) of sections to be removed 
const elementsConfig = {
    rightSidebar: [
        { selector: 'ytd-player-legacy-desktop-watch-ads-renderer', description: 'Advertisement(s)'}, 
        { selector: 'ytd-engagement-panel-section-list-renderer', description: 'Sponshership(s)'}, 
        { selector: 'ytd-watch-next-secondary-results-renderer', description: 'Recommended Reels/Videos'} 
    ],

    belowVideo: [
        { selector: 'ytd-comments', description: 'Comments Section' },
        { selector: 'ytd-merch-shelf-renderer', description: 'Merchandise Shelf'}
    ]
};


// Function that waits for elements to exist  
function waitForElement(selector, callback) {
    const element = document.querySelector(selector);
    if (element) {
        callback(element);
    } else {
        setTimeout(() => waitForElement(selector, callback), 100);
    }
}


// Removal function with error handling 
function removeElements(container, elements) {
    elements.forEach(({selector, description}) => {
        try {
            const element = container.querySelector(selector) || document.querySelector(selector);
            if (element) {
                element.remove();
                console.log(`Successfully removed ${description}`);
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
    // Process right sidebar
    waitForElement('#secondary', (sidebar) => {
        removeElements(sidebar, elementsConfig.rightSidebar);

        // Additional safeguard for dynamic content
        new MutationObserver(() => {removeElements(sidebar, elementsConfig.rightSidebar);}).observe(sidebar, { childList: true, subtree: true }); 
    });

    // Process below video content
    waitForElement('#below', (belowContainer) => {
        removeElements(belowContainer, elementsConfig.belowVideo);

        // Additional safeguard for dynamic content
        new MutationObserver(() => {removeElements(belowContainer, elementsConfig.belowVideo);}).observe(belowContainer, { childList: true, subtree: true });
    });

    // Fallback CSS injection for stubborn elements (AI-Model Recommended…)
    const styleElement = document.createElement('style');
    styleElement.textContent = `ytd-player-legacy-desktop-watch-ads-renderer, 
    ytd-engagement-panel-section-list-renderer, 
    ytd-watch-next-secondary-results-renderer, 
    ytd-comments, 
    ytd-merch-shelf-renderer { 
    display: none !important; }`;
    document.head.appendChild(styleElement);
}


// Start the cleanup process
initializeCleanup();


// Periodic check for reoccuring elements (every 15 seconds) 
setInterval(() => { 
    removeElements(document, elementsConfig.rightSidebar); 
    removeElements(document, elementsConfig.belowVideo); 
}, 15000); 