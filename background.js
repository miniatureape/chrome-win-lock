let winStatus = {};

chrome.runtime.onInstalled.addListener(() => {
  chrome.action.setIcon({path: {'16': 'unlocked.png'}});
  winStatus = {};
});

chrome.action.onClicked.addListener((tab) => {
    console.log('toggling window lock on', tab.windowId);
    if (winStatus[tab.windowId]) {
        console.log('win status was', winStatus[tab.windowId]);
        winStatus[tab.windowId] = !winStatus[tab.windowId];
        console.log('win status is', winStatus[tab.windowId]);
    } else {
        winStatus[tab.windowId] = true;
    }
    let icon = winStatus[tab.windowId] ? 'locked.png' : 'unlocked.png';
    chrome.tabs.query({ currentWindow: true },
      function(tabs) {
        console.log('setting tab icon to ', icon);
        tabs.forEach((tab) => chrome.action.setIcon({ tabId: tab.id, path: icon }));
    });
});

chrome.tabs.onCreated.addListener((tab) => {
    let icon;
    console.log('tab was created', winStatus);

    if (Object.keys(winStatus).length === 0) {
        console.log('there is no win status state', winStatus);
    }

    if (winStatus[tab.windowId]) {
        console.log('tab was created on locked window');
        chrome.windows.getAll((windows) => {
            let win;
            for (let i = 0; i < windows.length; i++) {
                win = windows[i];
                console.log('checking window', win.id, winStatus[win.id]);
                if (!winStatus[win.id]) {
                    console.log('window is unlocked', win.id);
                    chrome.windows.update(win.id, {focused: true})
                    chrome.tabs.move(tab.id, {windowId: win.id, index: -1});
                    chrome.tabs.update(tab.id, {active: true, highlighted: true})
                    break;
                }
            }
        });
    }
    chrome.action.setIcon({ tabId: tab.id, path: 'unlocked.png' });
});
