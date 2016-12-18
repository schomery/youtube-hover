'use strict';

var iframe;

var youtube = {
  play: (id, x = 0, y = 0) => {
    if (iframe) {
      return;
    }
    iframe = document.createElement('iframe');
    iframe.setAttribute('width', 500);
    iframe.setAttribute('height', 500 * 180 / 320);
    //iframe.setAttribute('src', `https://www.youtube.com/embed/${id}?autoplay=1`);
    iframe.setAttribute('style', `
      left: ${x}px;
      top: ${y}px;
    `);
    iframe.setAttribute('class', 'ihvyoutube');
    document.body.appendChild(iframe);
  }
};

document.addEventListener('mouseover', e => {
  let target = e.target;
  if (target) {
    let link = target.closest('a');
    if (link) {
      let href = link.href;
      if (href && href.indexOf('youtube.com/watch?v=') !== -1) {
        let id = href.match(/v\=([^\&]+)/);
        if (id && id.length) {
          let rect = link.getBoundingClientRect();
          youtube.play(
            id[1],
            rect.left + document.body.scrollLeft + document.documentElement.scrollLeft + 0,
            rect.top + rect.height + document.body.scrollTop + document.documentElement.scrollTop + 0
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
