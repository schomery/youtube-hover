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

var youtube = {
  play: (id, x = 0, y = 0) => {
    iframe = document.createElement('iframe');
    iframe.setAttribute('width', config.width);
    iframe.setAttribute('height', config.width * 180 / 320);
    iframe.setAttribute('src', `https://www.youtube.com/embed/${id}?autoplay=1`);
    if (config.mode === 1) { // center of screen
      iframe.setAttribute('style', `
        position: fixed;
        left: calc(50% - ${config.width / 2 - config['center-x']}px);
        top: calc(50% - ${config.width * 180 / 320 / 2 - config['center-y']}px);
      `);
    }
    else {
      iframe.setAttribute('style', `
        position: absolute;
        left: ${x}px;
        top: ${y}px;
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
      if (
        href.indexOf('youtube.com/attribution_link?a=') !== -1 ||
        href.indexOf('youtube.com/watch?v=') !== -1 ||
        href.indexOf('//youtu.be/') !== -1
      ) {
        let id;
        if (href.indexOf('youtube.com/watch?v=') !== -1) {
          id = href.match(/v\=([^\&]+)/);
        }
        else if (href.indexOf('//youtu.be/') !== -1) {
          id = href.match(/\.be\/([^\&]+)/);
        }
        else if (href.indexOf('youtube.com/attribution_link?a=') !== -1) {
          id = decodeURIComponent(href).match(/v\=([^\&]+)/);
        }

        if (id && id.length) {
          window.setTimeout((link) => {
            let activeLink = [...document.querySelectorAll(':hover')].pop();
            if (link === activeLink) {
              let rect = link.getBoundingClientRect();
              youtube.play(
                id[1],
                Math.min(
                  rect.left + document.body.scrollLeft + document.documentElement.scrollLeft + config['relative-x'],
                  document.documentElement.scrollWidth - config.width
                ),
                Math.min(
                  rect.top + rect.height + document.body.scrollTop + document.documentElement.scrollTop + config['relative-y'],
                  document.documentElement.scrollHeight - config.width * 180 / 320
                )
              );
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

chrome.runtime.sendMessage({
  cmd: 'settings'
}, (prefs) => config = Object.assign(config, prefs));
