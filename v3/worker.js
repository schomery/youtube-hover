'use strict';

chrome.runtime.onMessage.addListener((request, sender, response) => {
  if (request.cmd === 'history') {
    if (chrome.history) {
      chrome.history.addUrl({
        url: request.url
      });
    }
  }
  else if (request.cmd === 'find-id') {
    fetch(request.url).then(r => r.text()).then(content => {
      const match = content.match(/itemprop="videoId"\s+content="([^"]+)"/);
      if (match && match[1]) {
        response(match[1]);
      }
      else {
        response();
      }
    }).catch(() => response());
    return true;
  }
});

/* FAQs & Feedback */
{
  const {management, runtime: {onInstalled, setUninstallURL, getManifest}, storage, tabs} = chrome;
  if (navigator.webdriver !== true) {
    const {homepage_url: page, name, version} = getManifest();
    onInstalled.addListener(({reason, previousVersion}) => {
      management.getSelf(({installType}) => installType === 'normal' && storage.local.get({
        'faqs': true,
        'last-update': 0
      }, prefs => {
        if (reason === 'install' || (prefs.faqs && reason === 'update')) {
          const doUpdate = (Date.now() - prefs['last-update']) / 1000 / 60 / 60 / 24 > 45;
          if (doUpdate && previousVersion !== version) {
            tabs.query({active: true, lastFocusedWindow: true}, tbs => tabs.create({
              url: page + '?version=' + version + (previousVersion ? '&p=' + previousVersion : '') + '&type=' + reason,
              active: reason === 'install',
              ...(tbs && tbs.length && {index: tbs[0].index + 1})
            }));
            storage.local.set({'last-update': Date.now()});
          }
        }
      }));
    });
    setUninstallURL(page + '?rd=feedback&name=' + encodeURIComponent(name) + '&version=' + version);
  }
}
