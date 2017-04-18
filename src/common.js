'use strict';

chrome.runtime.onMessage.addListener((request, sender, response) => {
  if (request.cmd === 'history') {
    chrome.history.addUrl({
      url: request.url
    });
  }
  else if (request.cmd === 'find-id') {
    let req = new XMLHttpRequest();
    req.open('GET', request.url);
    req.responseType = 'document';
    req.onload = () => {
      try {
        response(req.response.querySelector('[itemprop="videoId"]').content);
      }
      catch (e) {
        response();
      }
    };
    req.onerror = () => response();
    req.send();
    return true;
  }
  else if (request.cmd === 'is-mute') {
    response(sender.tab.audible);
  }
});

// FAQs & Feedback
chrome.storage.local.get('version', prefs => {
  let version = chrome.runtime.getManifest().version;
  let isFirefox = navigator.userAgent.indexOf('Firefox') !== -1;
  if (isFirefox ? !prefs.version : prefs.version !== version) {
    chrome.storage.local.set({version}, () => {
      chrome.tabs.create({
        url: 'http://add0n.com/youtube-hover.html?version=' + version +
          '&type=' + (prefs.version ? ('upgrade&p=' + prefs.version) : 'install')
      });
    });
  }
});
(function () {
  let {name, version} = chrome.runtime.getManifest();
  chrome.runtime.setUninstallURL('http://add0n.com/feedback.html?name=' + name + '&version=' + version);
})();
