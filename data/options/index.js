'use strict';

function save () {
  let x = document.getElementById('offset-x').value;
  let y = document.getElementById('offset-y').value;
  let delay = document.getElementById('delay').value;
  let width = document.getElementById('width').value;

  chrome.storage.local.set({
    'offset-x': +x,
    'offset-y': +y,
    'width': +width,
    'delay': +delay
  }, () => {
    let status = document.getElementById('status');
    status.textContent = 'Options saved.';
    setTimeout(() => status.textContent = '', 750);
  });
}

function restore () {
  // Use default value color = 'red' and likesColor = true.
  chrome.storage.local.get({
    'offset-x': 0,
    'offset-y': 0,
    'delay': 100,
    'width': 500
  }, prefs => {
    document.getElementById('offset-x').value = prefs['offset-x'];
    document.getElementById('offset-y').value = prefs['offset-y'];
    document.getElementById('delay').value = prefs.delay;
    document.getElementById('width').value = prefs.width;
  });
}
document.addEventListener('DOMContentLoaded', restore);
document.getElementById('save').addEventListener('click', save);
