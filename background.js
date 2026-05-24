chrome.alarms.create("tracker", {periodInMinutes: 1});

chrome.alarms.onAlarm.addListener((alarm) => {
    if(alarm.name == "tracker") {
        chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
            if(tabs.length === 0) return;
            
            const currentTab = tabs[0];
            if(!currentTab.url || currentTab.url.startsWith('chrome://')) return;
            
            const url = new URL(currentTab.url);
            const domain = url.hostname.replace('www.', '').toLowerCase();

            chrome.storage.local.get(['trackedSites'], (result) => {
                const sites = result.trackedSites || {};

                if(sites[domain]) {
                    sites[domain].spent += 1;
                    chrome.storage.local.set({trackedSites: sites});

                    if(sites[domain].spent >= sites[domain].limit) {
                        chrome.tabs.update(currentTab.id, {
                            url: chrome.runtime.getURL("blocked.html")
                        });
                    }
                }
            });
        });
    }
});

chrome.tabs.onUpdated.addListener((tabID, changeInfo, tab) => {
    if(changeInfo.url) {
        if(changeInfo.url.startsWith('chrome://')) return;

        const url = new URL(changeInfo.url);
        const domain = url.hostname.replace('www.', '').toLowerCase();

        chrome.storage.local.get(['trackedSites'], (result) => {
            const sites = result.trackedSites || {};
            
            if(sites[domain] && sites[domain].spent >= sites[domain].limit) {
                chrome.tabs.update(tabID, {
                    url: chrome.runtime.getURL("blocked.html")
                });
            }
        });
    }
});