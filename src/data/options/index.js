'use strict';

function restore() {
  // Use default value color = 'red' and likesColor = true.
  chrome.storage.local.get({
    'relative-x': 0,
    'relative-y': 0,
    'center-x': 0,
    'center-y': 0,
    'delay': 1000,
    'width': 500,
    'mode': 0,
    'strike': true,
    'history': true,
    'scroll': true,
    'smooth': true,
    'dark': false,
    'youtube': false
  }, prefs => {
    document.getElementById('relative-x').value = prefs['relative-x'];
    document.getElementById('relative-y').value = prefs['relative-y'];
    document.getElementById('center-x').value = prefs['center-x'];
    document.getElementById('center-y').value = prefs['center-y'];
    document.getElementById('delay').value = prefs.delay;
    document.getElementById('width').value = prefs.width;
    document.getElementById('mode').selectedIndex = prefs.mode;
    document.getElementById('strike').checked = prefs.strike;
    document.getElementById('history').checked = prefs.history;
    document.getElementById('scroll').checked = prefs.scroll;
    document.getElementById('smooth').checked = prefs.smooth;
    document.getElementById('dark').checked = prefs.dark;
    document.getElementById('youtube').checked = prefs.youtube;
  });
}

function save() {
  const rx = document.getElementById('relative-x').value;
  const ry = document.getElementById('relative-y').value;
  const cx = document.getElementById('center-x').value;
  const cy = document.getElementById('center-y').value;
  const delay = document.getElementById('delay').value;
  const width = document.getElementById('width').value;
  const mode = document.getElementById('mode').selectedIndex;
  const strike = document.getElementById('strike').checked;
  const history = document.getElementById('history').checked;
  const scroll = document.getElementById('scroll').checked;
  const smooth = document.getElementById('smooth').checked;
  const dark = document.getElementById('dark').checked;
  const youtube = document.getElementById('youtube').checked;

  chrome.storage.local.set({
    'relative-x': Number(rx),
    'relative-y': Number(ry),
    'center-x': Number(cx),
    'center-y': Number(cy),
    'width': Number(width),
    'delay': Number(delay),
    'mode': mode,
    'strike': strike,
    'history': history,
    'scroll': scroll,
    'smooth': smooth,
    'dark': dark,
    'youtube': youtube
  }, () => {
    const status = document.getElementById('status');
    status.textContent = 'Options saved.';
    restore();
    setTimeout(() => status.textContent = '', 750);
  });
}

document.addEventListener('DOMContentLoaded', restore);
document.getElementById('save').addEventListener('click', save);
