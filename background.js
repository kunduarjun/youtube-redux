// Runs on full page load
browser.webNavigation.onCompleted.addListener(
    (details) => {
        if (details.url.includes('youtube.com/watch')) {
            browser.tabs.executeScript(details.tabId, {
                file: '/youtube-redux.js'
            }).catch(err => console.log("Injection error: ", err));
        }
    },
    { url: [{ hostContains: "youtube.com", pathContains: "/watch" }] }
);

// Runs on SPA Navigation 
browser.webNavigation.onHistoryStateUpdated.addListener(
    (details) => {
        if (details.url.includes('youtube.com/watch')) {
            setTimeout(() => { 
                browser.tabs.executeScript(details.tabId, {
                    file: '/youtube-redux.js'
                }).catch(err => console.log("Injection error: ", err));
            }, 300);
        }
    },
    { url: [{ hostContains: "youtube.com", pathContains: "/watch" }] }
);
