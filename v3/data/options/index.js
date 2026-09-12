'use strict';

const toast = async message => {
  const status = document.getElementById('status');
  status.textContent = message;
  clearTimeout(toast.id);
  await new Promise(resolve => {
    toast.id = setTimeout(resolve, 750);
  });
  status.textContent = '';
};

const restore = async () => {
  // Use default value color = 'red' and likesColor = true.
  const prefs = await chrome.storage.local.get({
    'relative-x': 0,
    'relative-y': 0,
    'center-x': 0,
    'center-y': 0,
    'delay': 1000,
    'width': 500,
    'mode': 0,
    'mute': true,
    'strike': true,
    'history': false,
    'scroll': true,
    'smooth': true,
    'dark': false,
    'origin': 'youtube.com'
  });
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
  document.getElementById('mute').checked = prefs.mute;
  document.getElementById('origin').value = prefs.origin;
};
document.addEventListener('DOMContentLoaded', restore);

document.getElementById('save').onclick = async function save() {
  await chrome.storage.local.set({
    'relative-x': document.getElementById('relative-x').valueAsNumber,
    'relative-y': document.getElementById('relative-y').valueAsNumber,
    'center-x': document.getElementById('center-x').valueAsNumber,
    'center-y': document.getElementById('center-y').valueAsNumber,
    'width': document.getElementById('width').valueAsNumber,
    'delay': document.getElementById('delay').valueAsNumber,
    'mode': document.getElementById('mode').selectedIndex,
    'strike': document.getElementById('strike').checked,
    'history': document.getElementById('history').checked,
    'scroll': document.getElementById('scroll').checked,
    'smooth': document.getElementById('smooth').checked,
    'dark': document.getElementById('dark').checked,
    'mute': document.getElementById('mute').checked,
    'origin': document.getElementById('origin').value
  });
  await toast('Options saved');
  restore();
};

document.getElementById('history').onchange = e => {
  if (e.target.checked === true) {
    chrome.permissions.request({
      permissions: ['history']
    }).catch(e => {
      console.error(e);
      return false;
    }).then(b => {
      if (!b) {
        e.target.checked = false;
      }
    });
  }
  else {
    chrome.permissions.remove({
      permissions: ['history']
    });
  }
};
