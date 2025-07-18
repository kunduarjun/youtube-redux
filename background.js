// Listener for extension install/update
browser.runtime.onInstalled.addListener((details) => {
    console.log(`YouTube Redux ${details.reason} v${details.version}`); 
});


// Unified navigation handler for both full loads and SPA navigation
function handleNavigation(details) {
    if (details.includes('youtube.com/watch')) {
        // Use longer delay during transitions (1000ms) vs normal load (300ms)
        // This helps prevent injection during heavy DOM changes
        const delay = details.transitionType === 'link' ? 300 : 1000;

        setTimeout(() => {
            browser.tabs.executeScript(details.tabId, {
                file: '/youtube-redux.js'
            }).catch(err => {
                console.log("Script injection skipped (tab may have closed/navigated): ", err);
            });
        }, delay);
    }
}


browser.webNavigation.onCompleted.addListener(handleNavigation, {
    url: [{ hostContains: "youtube.com", pathContains: "/watch" }]
});


browser.webNavigation.onHistoryStateUpdated.addListener(handleNavigation, {
    url: [{ hostContains: "youtube.com", pathContains: "/watch" }]
});


// Add listener for tab updates to catch manual URL changes
browser.tabs.onUpdated.addListener((tabId, changeInfo) => {
    if (changeInfo.url && changeInfo.url.includes('youtube.com/watch')) {
        handleNavigation({
            tabId: tabId,
            url: changeInfo.url,
            transitionType: "manual" 
        });
    }
}); 