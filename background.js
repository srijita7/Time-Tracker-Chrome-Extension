const tabTimeObjectKey = "tabTimeObject";
const lastActiveTabKey = "lastActiveTab";
chrome.runtime.onInstalled.addListener(function () {
    chrome.declarativeContent.onPageChanged.removeRules(undefined, function () {
        chrome.declarativeContent.onPageChanged.addRules([{
            conditions: [new chrome.declarativeContent.PageStateMatcher({
                pageUrl: {},
            })
            ],
            actions: [new chrome.declarativeContent.ShowAction()]
        }]);
    });
});

chrome.windows.onFocusChanged.addListener(function (windowId) {
    if (windowId == chrome.windows.WINDOW_ID_NONE) {
        processTabChange(false);
    }
    else {
        processTabChange(true);
    }
});
function processTabChange(isWindowActive) {
    chrome.tabs.query({ 'active': true }, function (tabs) {
        console.log("isWindowActive : " + isWindowActive);
        console.log(tabs);
        if (tabs.length > 0 && tabs[0] != null) {
            let currentTab = tabs[0];
            let url = currentTab.url;
            let title = currentTab.title;
            let hostName = url;
            try {
                let urlObject = new URL(url);
                hostName = urlObject.hostname;
            }
            catch (e) {
                console.log('could not construct url from' + currentTab.url + ' error: ' + e);
            }
            chrome.storage.local.get([tabTimeObjectKey, lastActiveTabKey], function (result) {
                let lastActiveTabString = result[lastActiveTabKey];
                let tabTimeObjectString = result[tabTimeObjectKey];
                console.log("background.js, get result");
                console.log(result);
                console.log("Last Active tab String : "+lastActiveTabString);
                console.log("Tab time Object string : "+tabTimeObjectString);
                tabTimeObject = {};
                if (tabTimeObjectString != null)
                    tabTimeObject = JSON.parse(tabTimeObjectString);
                lastActiveTab = {};
                if (lastActiveTabString != null) {
                    lastActiveTab = JSON.parse(lastActiveTabString);
                }
                console.log("tabTimeObject : "+JSON.stringify(tabTimeObject));
                console.log("lastActiveTab : "+JSON.stringify(lastActiveTab));
                if (lastActiveTab.hasOwnProperty("url") && lastActiveTab.hasOwnProperty("lastDateVal")) {
                    let lastUrl = lastActiveTab["url"];
                    let currentDateVal_ = Date.now();
                    let passedSeconds = (currentDateVal_ - lastActiveTab["lastDateVal"]) * 0.001;
                    if (tabTimeObject.hasOwnProperty(lastUrl)) {
                        let lastUrlObjectInfo = tabTimeObject[lastUrl];
                        if (lastUrlObjectInfo.hasOwnProperty("trackedSeconds")) {
                            lastUrlObjectInfo["trackedSeconds"] = lastUrlObjectInfo["trackedSeconds"] + passedSeconds;
                        }
                        else {
                            lastUrlObjectInfo["trackedSeconds"] = passedSeconds;
                        }
                        lastUrlObjectInfo["trackedSeconds"] = currentDateVal_;
                    }
                    else {
                        let newUrlInfo = { url: lastUrl, trackedSeconds: passedSeconds, lastDateVal: currentDateVal_ };
                        tabTimeObject[lastUrl] = newUrlInfo;
                        console.log("New URL Info : " + JSON.stringify(newUrlInfo));
                    }
                }
                let currentDateValue = Date.now();
                let lastTabInfo = { "url": hostName, "lastDateVal": currentDateValue };
                if (!isWindowActive) {
                    lastTabInfo = {};
                }
                let newLastTabObject = {};
                newLastTabObject[lastActiveTabKey] = JSON.stringify(lastTabInfo);
                chrome.storage.local.set(newLastTabObject, function () {
                    console.log("lastActiveTab stored : " + hostName);
                    const tabTimesObjectString = JSON.stringify(tabTimeObject);
                    let newTabTimesObject = {};
                    newTabTimesObject[tabTimeObjectKey] = tabTimesObjectString;
                    chrome.storage.local.set(newTabTimesObject, function () {

                    });
                });
            });
        }
    });
}
function onTabTrack(activeInfo) {
    let tabId = activeInfo.tabId;
    let windowId = activeInfo.windowId;
    processTabChange(true);
}
chrome.tabs.onActivated.addListener(onTabTrack);