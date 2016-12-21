'use strict';

var iframe;
var config = {
  'relative-x': 0,
  'relative-y': 0,
  'center-x': 0,
  'center-y': 0,
  'delay': 1000,
  'width': 500,
  'mode': 0,
  'strike': true,
  'history': true
};
chrome.storage.local.get(config, prefs => config = prefs);
chrome.storage.onChanged.addListener(prefs => {
  Object.keys(prefs).forEach(name => {
    config[name] = prefs[name].newValue;
  });
});

var youtube = {
  play: (id, rect, shared) => {
    iframe = document.createElement('iframe');
    iframe.setAttribute('width', config.width);
    iframe.setAttribute('height', config.width * 180 / 320);
    if (shared) {
      chrome.runtime.sendMessage({
        cmd: 'find-id',
        url: 'https://www.youtube.com/shared?ci=' + id
      }, id => {
        if (id) {
          iframe.setAttribute('src', `https://www.youtube.com/embed/${id}?autoplay=1`);
        }
        else {
          iframe.dataset.error = true;
        }
      });
    }
    else {
      iframe.setAttribute('src', `https://www.youtube.com/embed/${id}?autoplay=1`);
    }
    if (config.mode === 1) { // center of screen
      iframe.setAttribute('style', `
        position: fixed;
        left: calc(50% - ${config.width / 2 - config['center-x']}px);
        top: calc(50% - ${config.width * 180 / 320 / 2 - config['center-y']}px);
      `);
    }
    else {
      let x1 = Math.max(0, rect.left + document.body.scrollLeft +
        document.documentElement.scrollLeft + config['relative-x']);
      let y1 = Math.max(0, rect.top + rect.height + document.body.scrollTop +
        document.documentElement.scrollTop + config['relative-y']);
      let x2 = x1 + config.width;
      let y2 = y1 + config.width * 180 / 320;
      let vw = document.documentElement.scrollWidth;
      let vh = document.documentElement.scrollHeight;

      let left = x1;
      let top = y1;
      if (x2 > vw - 10) {
        left = vw - config.width - 10;
      }
      if (y2 > vh - 10) {
        top = vh - config.width * 180 / 320 - 10;
      }
      iframe.setAttribute('style', `
        position: absolute;
        left: ${left}px;
        top: ${top}px;
      `);
    }
    iframe.setAttribute('class', 'ihvyoutube');
    document.body.appendChild(iframe);
    window.setTimeout(() => iframe.style.opacity = 1, 0);
  }
};

document.addEventListener('mouseover', e => {
  let target = e.target;
  if (target) {
    let link = target.closest('a');
    if (link) {
      let href = link.href;
      if (!href || iframe) {
        return;
      }
      let shared = false;
      if (
        href.indexOf('youtube.com/shared') !== -1 ||
        href.indexOf('youtube.com/attribution_link') !== -1 ||
        href.indexOf('youtube.com/watch') !== -1 ||
        href.indexOf('//youtu.be/') !== -1
      ) {
        let id;
        if (href.indexOf('youtube.com/watch') !== -1) {
          id = href.match(/v\=([^\&]+)/);
        }
        else if (href.indexOf('//youtu.be/') !== -1) {
          id = href.match(/\.be\/([^\&]+)/);
        }
        else if (href.indexOf('youtube.com/attribution_link') !== -1) {
          id = decodeURIComponent(href).match(/v\=([^\&]+)/);
        }
        else if (href.indexOf('youtube.com/shared') !== -1) {
          shared = true;
          id = href.match(/ci\=([^\&]+)/);
        }

        if (id && id.length) {
          window.setTimeout((link) => {
            let activeLink = [...document.querySelectorAll(':hover')].pop();
            if (link === activeLink) {
              let rect = link.getBoundingClientRect();
              youtube.play(id[1], rect, shared);
              if (config.strike) {
                [...document.querySelectorAll(`a[href="${href}"]`), link].
                  forEach(l => l.style['text-decoration'] = 'line-through');
              }
              if (config.history) {
                chrome.runtime.sendMessage({
                  url: href,
                  cmd: 'history'
                });
              }
            }
          }, config.delay, link);
        }
      }
    }
  }
});
document.addEventListener('click', () => {
  if (iframe) {
    [...document.querySelectorAll('.ihvyoutube')].forEach(f => f.parentNode.removeChild(f));
    iframe = null;
  }
});
