'use strict';

chrome.runtime.onMessage.addListener((request, sender, response) => {
  if (request === 'settings') {
    chrome.storage.local.get({
      'offset-x': 0,
      'offset-y': 0,
      'width': 500,
      'delay': 100,
      'mode': 0
    }, prefs => response(prefs));

    return true;
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
