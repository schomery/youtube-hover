'use strict';

chrome.runtime.onMessage.addListener(request => {
  if (request.cmd === 'history') {
    chrome.history.addUrl({
      url: request.url
    });
  }
});

chrome.storage.local.get('version', (obj) => {
  let version = chrome.runtime.getManifest().version;
  if (obj.version !== version) {
    window.setTimeout(() => {
      chrome.storage.local.set({version}, () => {
        chrome.tabs.create({
          url: 'http://add0n.com/youtube-hover.html?version=' +
            version + '&type=' +
            (obj.version ? ('upgrade&p=' + obj.version) : 'install')
        });
      });
    }, 3000);
  }
});
