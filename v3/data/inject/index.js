'use strict';

let iframe;
let container;
const config = {
  'relative-x': 0,
  'relative-y': 0,
  'center-x': 0,
  'center-y': 0,
  'delay': 1000,
  'width': 500,
  'mode': 0,
  'strike': true,
  'history': false,
  'scroll': true,
  'smooth': true,
  'dark': false,
  'youtube': false,
  'origin': 'youtube.com'
};
chrome.storage.onChanged.addListener(prefs => {
  Object.keys(prefs).forEach(name => {
    config[name] = prefs[name].newValue;
  });
});

const smoothScroll = (() => {
  let timeLapsed = 0;
  let id;
  let sx;
  let sy;
  let dx;
  let dy;
  let callback;

  const easingPattern = time => (time < 0.5) ?
    (8 * time * time * time * time) :
    (1 - 8 * (--time) * time * time * time);

  function step() {
    timeLapsed += 16;
    const percentage = timeLapsed / 400;
    if (percentage > 1) {
      window.scrollTo(sx + dx, sy + dy);
      return callback();
    }
    window.scrollTo(
      Math.floor(sx + (dx * easingPattern(percentage))),
      Math.floor(sy + (dy * easingPattern(percentage)))
    );
    id = window.setTimeout(step, 16);
  }

  return function(x, y, c) {
    window.clearTimeout(id);
    callback = c;
    timeLapsed = 0;
    sx = document.body.scrollLeft + document.documentElement.scrollLeft;
    sy = document.body.scrollTop + document.documentElement.scrollTop;
    dx = Math.max(0, x - sx);
    dy = Math.max(0, y - sy);
    if (dx === 0 && dy === 0) {
      return c();
    }
    step();
  };
})();


let closeBlocked = false;

const youtube = {
  play: (id, rect, shared) => {
    // https://github.com/schomery/youtube-hover/issues/15
    let time = (id.split(/[?&]t=/)[1] || '0').split('&')[0];
    const tmp = /(?:(\d+)h)?(?:(\d+)m)?(\d+)s/.exec(time);
    if (tmp && tmp.length && tmp[3]) {
      time = Number(tmp[3]) + Number(tmp[2] || 0) * 60 + Number(tmp[1] || 0) * 60 * 60;
    }
    // cleaning id; https://github.com/schomery/youtube-hover/issues/12
    id = id.split('&')[0].split('?')[0];
    //
    container = document.createElement('div');
    container.setAttribute('class', 'ihvyoutube-container');

    // Move Handle
    const move = document.createElement('div');
    move.setAttribute('class', 'ihvyoutube-move');
    move.innerHTML = `<svg viewBox="0 0 24 24"><path d="M10 9h4V6h3l-5-5-5 5h3v3zm-1 1H6V7l-5 5 5 5v-3h3v-4zm14 2l-5-5v3h-3v4h3v3l5-5zm-9 3h-4v3H7l5 5 5-5h-3v-3z"></path></svg>`;
    move.addEventListener('mousedown', e => {
      e.preventDefault();
      container.classList.add('dragging');
      const startX = e.clientX;
      const startY = e.clientY;
      const rect = container.getBoundingClientRect();
      let left = rect.left;
      let top = rect.top;

      const style = window.getComputedStyle(container);
      if (style.position !== 'fixed') {
        left += window.scrollX;
        top += window.scrollY;
      }

      const overlay = document.createElement('div');
      overlay.classList.add('ihvyoutube-overlay', 'move');
      document.body.appendChild(overlay);

      function onMouseMove(e) {
        container.style.left = (left + e.clientX - startX) + 'px';
        container.style.top = (top + e.clientY - startY) + 'px';
      }
      function onMouseUp(e) {
        container.classList.remove('dragging');
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', onMouseUp);
        overlay.remove();
        closeBlocked = true;
        setTimeout(() => closeBlocked = false, 300);
      }
      document.addEventListener('mousemove', onMouseMove);
      document.addEventListener('mouseup', onMouseUp);
    });
    container.appendChild(move);

    // Resize Handle
    const resize = document.createElement('div');
    resize.setAttribute('class', 'ihvyoutube-resize');
    resize.innerHTML = '<svg viewBox="0 0 24 24"><path d="M22 22H6L22 6V22Z"></path></svg>'; // Triangle corner
    resize.addEventListener('mousedown', e => {
      e.preventDefault();
      container.classList.add('dragging');
      const startX = e.clientX;
      const startY = e.clientY;
      const startWidth = container.offsetWidth;
      const startHeight = container.offsetHeight;

      const overlay = document.createElement('div');
      overlay.onclick = e => e.stopPropagation();
      overlay.classList.add('ihvyoutube-overlay', 'resize');
      document.body.appendChild(overlay);

      function onMouseMove(e) {
        container.style.width = (startWidth + e.clientX - startX) + 'px';
        container.style.height = (startHeight + e.clientY - startY) + 'px';
      }
      function onMouseUp() {
        container.classList.remove('dragging');
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', onMouseUp);
        overlay.remove();
        closeBlocked = true;
        setTimeout(() => closeBlocked = false, 300);
      }
      document.addEventListener('mousemove', onMouseMove);
      document.addEventListener('mouseup', onMouseUp);
    });
    container.appendChild(resize);

    iframe = Object.assign(document.createElement('iframe'), {
      width: '100%', // Fill container
      height: '100%', // Fill container
      sandbox: 'allow-scripts allow-same-origin allow-presentation allow-popups',
      // unload the gif loader when player is loaded
      onload: () => {
        window.setTimeout(() => {
          if (container) {
            container.dataset.loaded = true;
          }
        }, 10000);
      }
    });
    iframe.setAttribute('allowFullScreen', '');
    iframe.setAttribute('referrerpolicy', 'cross-origin-with-strict-origin');
    container.appendChild(iframe);

    function play() {
      const origin = config.origin || 'youtube.com';

      if (shared) {
        chrome.runtime.sendMessage({
          cmd: 'find-id',
          url: 'https://www.youtube.com/shared?ci=' + id
        }, id => {
          if (id) {
            const href = `https://www.${origin}/embed/${id}?fs=1&autoplay=1&enablejsapi=1&start=${time}`;
            iframe.setAttribute('src', href);
          }
          else {
            container.dataset.error = true;
          }
        });
      }
      else {
        iframe.setAttribute('src', `https://www.${origin}/embed/${id}?fs=1&autoplay=1&enablejsapi=1&start=${time}`);
      }
    }

    if (config.mode === 1) { // center of screen
      container.setAttribute('style', `
        position: fixed;
        width: ${config.width}px;
        height: ${config.width * 180 / 320}px;
        left: calc(50% - ${config.width / 2 - config['center-x']}px);
        top: calc(50% - ${config.width * 180 / 320 / 2 - config['center-y']}px);
      `);
      play();
    }
    else {
      const x1 = Math.max(0, rect.left + document.body.scrollLeft +
        document.documentElement.scrollLeft + config['relative-x']);
      const y1 = Math.max(0, rect.top + rect.height + document.body.scrollTop +
        document.documentElement.scrollTop + config['relative-y']);
      const x2 = x1 + config.width;
      const y2 = y1 + config.width * 180 / 320;
      const vw = Math.max(
        document.documentElement.scrollWidth,
        document.body.scrollWidth
      );
      const vh = Math.max(
        document.documentElement.scrollHeight,
        document.body.scrollHeight
      );

      let left = x1;
      let top = y1;
      if (x2 > vw - 10) {
        left = vw - config.width - 10;
      }
      if (y2 > vh - 10) {
        top = vh - config.width * 180 / 320 - 10;
      }
      if (config.scroll) {
        const x = Math.max(
          document.body.scrollLeft,
          left + config.width - document.documentElement.clientWidth + 10
        );
        const y = Math.max(
          document.body.scrollTop,
          top + config.width * 180 / 320 - document.documentElement.clientHeight + 10
        );
        if (config.smooth) {
          smoothScroll(x, y, play);
        }
        else {
          window.scrollTo(x, y);
          play();
        }
      }
      else {
        play();
      }

      container.setAttribute('style', `
        position: absolute;
        width: ${config.width}px;
        height: ${config.width * 180 / 320}px;
        left: ${left}px;
        top: ${top}px;
      `);
    }
    container.dataset.dark = config.dark;
    document.body.appendChild(container);
  }
};

let timer;

function mouseover(e) {
  if (timer) {
    timer = window.clearTimeout(timer);
  }
  const target = e.target;
  if (target && target.nodeType === 1) {
    const link = target.closest('a');
    if (link) {
      const href = link.href;
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
          id = href.match(/v=(.+)/);
        }
        else if (href.indexOf('//youtu.be/') !== -1) {
          id = href.match(/\.be\/(.+)/);
        }
        else if (href.indexOf('youtube.com/attribution_link') !== -1) {
          id = decodeURIComponent(href).match(/v=(.+)/);
        }
        else if (href.indexOf('youtube.com/shared') !== -1) {
          shared = true;
          id = href.match(/ci=(.+)/);
        }

        if (id && id.length) {
          timer = window.setTimeout(link => {
            const rect = link.getBoundingClientRect();
            youtube.play(id[1], rect, shared);
            if (config.strike) {
              [...document.querySelectorAll(`a[href="${href}"]`), link]
                .forEach(l => l.style['text-decoration'] = 'line-through');
            }
            if (config.history) {
              chrome.runtime.sendMessage({
                url: href,
                cmd: 'history'
              });
            }
          }, config.delay, link);
        }
      }
    }
  }
}
function click(e) {
  window.clearTimeout(timer);

  if (closeBlocked) {
    return;
  }
  if (container && e.target.closest('.ihvyoutube-container') === null) {
    [...document.querySelectorAll('.ihvyoutube-container')].forEach(f => f.parentNode.removeChild(f));
    container = null;
    iframe = null;
    e.preventDefault();
  }
}
function keydown(e) {
  if (iframe && e.code === 'Escape') {
    document.body.dispatchEvent(new Event('click', {bubbles: true}));
    e.preventDefault();
  }
  /*
  else if (iframe && e.code === 'Space') {
    iframe.contentWindow.postMessage('{"event":"command","func":"stopVideo","args":""}', '*');
  }
  */
}

chrome.storage.local.get(config, prefs => {
  Object.assign(config, prefs);

  if (['www.youtube.com', 'www.youtube-nocookie.com'].includes(document.location.hostname)) {
    if (!config.youtube) {
      return;
    }
    if (window.top !== window) {
      return;
    }
  }

  document.addEventListener('mouseover', mouseover);
  document.addEventListener('click', click);
  document.addEventListener('keydown', keydown);
});
