'use strict';

var iframe;
var config = {
  'x-offset': 0,
  'y-offset': 0,
  'delay': 100,
  'width': 500
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
    iframe.setAttribute('style', `
      left: ${x}px;
      top: ${y}px;
    `);
    iframe.setAttribute('class', 'ihvyoutube');
    window.setTimeout(() => {
      document.body.appendChild(iframe);
      window.setTimeout(() => iframe.style.opacity = 1, 0);
    }, config.delay);
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
          let rect = link.getBoundingClientRect();
          youtube.play(
            id[1],
            rect.left + document.body.scrollLeft + document.documentElement.scrollLeft + config['offset-x'],
            rect.top + rect.height + document.body.scrollTop + document.documentElement.scrollTop + config['offset-y']
          );
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
