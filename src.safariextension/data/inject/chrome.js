/* globals safari */
'use strict';

var chrome = {};
var replies = {};

chrome.runtime = {
  sendMessage: function (data, callback) {
    if (callback) {
      var id = Math.random();
      replies[id] = callback;
      safari.self.tab.dispatchMessage('internal-channel', {
        data: data,
        id: id
      });
    }
    else {
      safari.self.tab.dispatchMessage('internal-channel', {
        data: data
      });
    }
  }
};
safari.self.addEventListener('message', function (e) {
  if (e.name === 'replied') {
    if (e.message.id in replies) {
      replies[e.message.id](e.message.data);
    }
    delete replies[e.message.id];
  }
  else if (e.name === 'storage-channel') {
    chrome.storage.getCallbacks.forEach(function (callback) {
      callback(e.message);
    });
    chrome.storage.getCallbacks = [];
  }
}, false);

chrome.storage = {
  getCallbacks: [],
  local: {
    get: function (obj, callback) {
      chrome.storage.getCallbacks.push(callback);
      safari.self.tab.dispatchMessage('storage-channel', obj);
    }
  },
  onChanged: {
    addListener: function () {}
  }
};
