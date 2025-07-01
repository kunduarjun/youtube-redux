browser.tabs.onUpdated.addListener((tabId, changeInfo) => {
  
  if (changeInfo.url && changeInfo.url.includes('youtube.com/watch')) {
    
    browser.tabs.executeScript(tabId, {
      file: 'youtube-redux.js'
    })
    
    .catch(err => console.log("Injection failed:", err));
  }
});
