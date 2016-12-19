'use strict';

var iframe;
var config = {
  'x-offset': 0,
  'y-offset': 0,
  'delay': 100,
  'width': 500,
  'mode': 0
};

var youtube = {
  play: (id, x = 0, y = 0) => {
    if (iframe) {
      return;
    }
    iframe = document.createElement('iframe');
    iframe.setAttribute('width', config.width);
    iframe.setAttribute('height', config.width * 180 / 320);
    iframe.setAttribute('src', `https://www.youtube.com/embed/${id}?autoplay=1`);
    if (config.mode === 1) { // center of screen
      iframe.setAttribute('style', `
        position: fixed;
        left: calc(50% - ${config.width / 2}px);
        top: calc(50% - ${config.width * 180 / 320 / 2}px);
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
    window.setTimeout(() => {
      document.body.appendChild(iframe);
      window.setTimeout(() => iframe.style.opacity = 1, 0);
    }, 0);
  }
};

document.addEventListener('mouseover', e => {
  let target = e.target;
  if (target) {
    let link = target.closest('a');
    if (link) {
      let href = link.href;
      if (!href) {
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
                  rect.left + document.body.scrollLeft + document.documentElement.scrollLeft + config['offset-x'],
                  document.documentElement.scrollWidth - rect.width - config.width
                ),
                Math.min(
                  rect.top + rect.height + document.body.scrollTop + document.documentElement.scrollTop + config['offset-y'],
                  document.documentElement.scrollHeight - rect.height - config.width * 180 / 320
                )
              );
            }
          }, config.delay, link);
        }
      }
    }
  }
});
document.addEventListener('click', () => {
  if (iframe) {
    document.body.removeChild(iframe);
    iframe = null;
  }
});

chrome.runtime.sendMessage('settings', (prefs) => config = prefs);
