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
