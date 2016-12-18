'use strict';

chrome.runtime.onMessage.addListener((request, sender, response) => {
  if (request === 'settings') {
    chrome.storage.local.get({
      'offset-x': 0,
      'offset-y': 0,
      'width': 500,
      'delay': 100
    }, prefs => response(prefs));

    return true;
  }
});
