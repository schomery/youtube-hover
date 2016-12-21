/* globals safari */
'use strict';

var chrome = {};

chrome.runtime = {
  getManifest: function () {
    return {
      version: safari.extension.displayVersion
    };
  },
  onMessage: {
    addListener: function (callback) {
      safari.application.addEventListener('message', function (e) {
        if (e.name === 'internal-channel') {
          callback(e.message.data, {
            tab: e.target
          }, function (data) {
            e.target.page.dispatchMessage('replied', {
              data: data,
              id: e.message.id
            });
          });
        }
        else if (e.name === 'storage-channel') {
          chrome.storage.local.get(e.message, function (obj) {
            e.target.page.dispatchMessage('storage-channel', obj);
          });
        }
      },false);
    }
  }
};

chrome.storage = {
  local: {
    get: function (obj, callback) {
      if (typeof obj === 'string') {
        var tmp1 = {};
        tmp1[obj] = null;
        obj = tmp1;
      }
      var tmp = {};
      for (var name in obj) {
        var val = safari.extension.settings[name];
        tmp[name] = typeof val === 'undefined' ? obj[name] : val;
      }
      callback(tmp);
    },
    set: function (obj, callback) {
      for (var name in obj) {
        safari.extension.settings[name] = obj[name];
      }
      if (callback) {
        callback();
      }
    }
  }
};
safari.extension.settings.addEventListener('change', function (e) {
  if (e.key.indexOf('-to-number') !== -1) {
    safari.extension.settings[e.key.replace('-to-number', '')] = +e.newValue;
  }
}, false);

chrome.tabs = {
  create: function (obj) {
    var tab = safari.application.activeBrowserWindow.openTab();
    tab.url = obj.url;
  }
};

chrome.history = {
  addUrl: function () {}
};
