// Listener for extension install/update
browser.runtime.onInstalled.addListener((details) => {
    console.log(`YouTube Redux ${details.reason} v${details.version}`); 
});

// Runs on full page load
browser.webNavigation.onCompleted.addListener(
    (details) => {
        if (details.url.includes('youtube.com/watch')) {
            browser.tabs.executeScript(details.tabId, {
                file: '/youtube-redux.js'
            }).catch(err => console.log("Full Load Injection error: ", err));
        }
    },
    { url: [{ hostContains: "youtube.com", pathContains: "/watch" }] }
);

// Runs on SPA Navigation (with DOM-ready delay)
browser.webNavigation.onHistoryStateUpdated.addListener(
    (details) => {
        if (details.url.includes('youtube.com/watch')) {
            setTimeout(() => { 
                details.url.includes('youtube.com/watch') && 
                browser.tabs.executeScript(details.tabId, {
                    file: '/youtube-redux.js'
                }).catch(err => console.log("SPA Injection error: ", err));
            }, 300);
        }
    },
    { url: [{ hostContains: "youtube.com", pathContains: "/watch" }] }
);
