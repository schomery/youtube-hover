'use strict';

chrome.runtime.onMessage.addListener((request, sender, response) => {
  if (request.cmd === 'settings') {
    chrome.storage.local.get({
      'relative-x': 0,
      'relative-y': 0,
      'center-x': 0,
      'center-y': 0,
      'width': 500,
      'delay': 1000,
      'mode': 0,
      'strike': true,
      'history': true
    }, prefs => response(prefs));

    return true;
  }
  else if (request.cmd === 'history') {
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
