'use strict';

function save () {
  let rx = document.getElementById('relative-x').value;
  let ry = document.getElementById('relative-y').value;
  let cx = document.getElementById('center-x').value;
  let cy = document.getElementById('center-y').value;
  let delay = document.getElementById('delay').value;
  let width = document.getElementById('width').value;
  let mode = document.getElementById('mode').selectedIndex;
  let strike = document.getElementById('strike').checked;
  let history = document.getElementById('history').checked;

  chrome.storage.local.set({
    'relative-x': +rx,
    'relative-y': +ry,
    'center-x': +cx,
    'center-y': +cy,
    'width': +width,
    'delay': +delay,
    'mode': mode,
    'strike': strike,
    'history': history
  }, () => {
    let status = document.getElementById('status');
    status.textContent = 'Options saved.';
    restore();
    setTimeout(() => status.textContent = '', 750);
  });
}

function restore () {
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
    'history': true
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
  });
}
document.addEventListener('DOMContentLoaded', restore);
document.getElementById('save').addEventListener('click', save);
