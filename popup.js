var delIconSrc = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAABQUlEQVRoQ+1YQYrCUAxNrHvXdaNHcCmOBxAV9Ah6A48yN9AjODAFD2DBpUfQjd3q3hLpQnAQ/In9n+Lwum3yk/fy8j4t04c//OH9EwBUPUFM4F9NIBv2ZlSrLV+CElnFSTr3BdybhFTN37v2CEINIBv3xRdrmnPi362qN1VQURAANLQ/xGACRsIqC1fvQGUdOgqbAYReZq3277gAwLe0MAEXo9gBB0OQECTkYgAS+ssALrKSinlKhwu5GMVFBheCC4X9vQIXggu5GIALwYXgQi+3ADbqMpFs1D8TU8MV99Z7kWOcpG1LrvmD5jT6WjPzxFJEGysiP80knWrjizgzgGzQbVNU33ufgtCF8msn3uwOQQEUhxcgJIq+mahDzC1LwadYkaMQ7TnPF9bm35pAqWYDJJslFKCHUkcCQCn6PCTfAON2qzHz/DbaAAAAAElFTkSuQmCC';
var status = document.getElementById('status');
var groups = [];
var savedFileEntry, fileDisplayPath;

document.addEventListener('DOMContentLoaded', function () {
  init();
  var nameInput = document.getElementById('name');
  var saveButton = document.getElementById('save');
  saveButton.addEventListener('click', setupSaveEvent, false);
  var exportButton = document.getElementById('export');
  exportButton.addEventListener('click', setupExportEvent, false);
  var importButton = document.getElementById('import');
  importButton.addEventListener('click', setupImportEvent, false);
  var fileInput = document.getElementById('fileInput');
  fileInput.addEventListener('change', setupFileSelectEvent, false);
}, false);

function init() {
  chrome.storage.sync.get(['groups'], function (items) {
    if (!items.groups) return;
    for (var index = 1; index <= items.groups; index++) {
      (function (index) {
        var groupIndex = ['group' + index];
        chrome.storage.sync.get(groupIndex, function (items) {
          if (!items[groupIndex]) return
          var group = JSON.parse(items[groupIndex]);
          groups.push(group);
          updateList(group);
        });
      })(index);
    }
  });
}

function setupSaveEvent() {
  chrome.tabs.query({
    currentWindow: true,
    pinned: false
  }, function (tabs) {
    tabs = tabs.filter(function (tab) {
      return tab.url.indexOf('chrome://') === -1;
    }).map(tab => {
      return { url: tab.url };
    });
    if (!tabs.length > 0) return;
    var groupIndex = 'group' + (groups.length + 1);
    var obj = {
      index: groupIndex,
      name: nameInput.value,
      tabs: tabs
    };
    groups.push(obj);
    updateList(obj);
    chrome.storage.sync.set({ 'groups': JSON.stringify(groups.length) }, function (err) {
      if (err) return console.log('err', err);
      let obj2 = {};
      obj2[groupIndex] = JSON.stringify(obj);
      chrome.storage.sync.set(obj2, function (err2) {
        if (err2) return console.log('err2', err2);
        alert('Group saved');
        nameInput.value = '';
      });
    });
  });
}

function updateList(group) {
  var groupsElement = document.getElementById('groups');
  var newLI = document.createElement('li');
  var newGroup = document.createElement('span');
  var newImg = document.createElement('img');
  var newIcon = document.createElement('div');
  newIcon.className = 'delicon ripple';
  newImg.width = '24';
  newImg.height = '24';
  newImg.src = delIconSrc;
  newGroup.innerText = group.name;
  newGroup.className = 'groupText ripple';
  newLI.appendChild(newGroup);
  newIcon.appendChild(newImg);
  newLI.appendChild(newIcon);
  setupClickEvent(newLI, group);
  setupDeleteEvent(newLI, newIcon, group);
  groupsElement.appendChild(newLI);
}

function download(filename, text) {
  var pom = document.createElement('a');
  pom.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
  pom.setAttribute('download', filename);

  if (document.createEvent) {
    var event = document.createEvent('MouseEvents');
    event.initEvent('click', true, true);
    pom.dispatchEvent(event);
  }
  else {
    pom.click();
  }
}

function setupExportEvent() {
  download('tabs.txt', JSON.stringify(groups));
}

function clearFileInput(ctrl) {
  try {
    ctrl.value = null;
  } catch (ex) { }
  if (ctrl.value) {
    ctrl.parentNode.replaceChild(ctrl.cloneNode(true), ctrl);
  }
}

function upload(e) {
  var contents = JSON.parse(e.target.result);
  for (var index = 0; index < contents.length; index++) {
    (function (index) {
      var groupIndex = 'group' + (groups.length + 1);
      var obj = {
        index: groupIndex,
        name: contents[index].name,
        tabs: contents[index].tabs
      };
      groups.push(obj);
      updateList(obj);
      chrome.storage.sync.set({ 'groups': JSON.stringify(groups.length) }, function (err) {
        if (err) return console.log('err', err);
        let obj2 = {};
        obj2[groupIndex] = JSON.stringify(obj);
        chrome.storage.sync.set(obj2, function (err2) {
          if (err2) return console.log('err2', err2);
          if (contents.length === (index + 1)) {
            alert('Import Successful!');
            var fileInput = document.getElementById('fileInput');
            clearFileInput(fileInput);
          }
        });
      });
    })(index);
  }
}

function setupFileSelectEvent(evt) {
  var file = evt.target.files[0];
  console.log('file', file);
  if (!file) return
  var reader = new FileReader();
  reader.onload = upload;
  reader.readAsText(file);
}

function setupImportEvent(evt) {
  var fileInput = document.getElementById('fileInput');
  fileInput.click();
}

function setupClickEvent(element, data) {
  (function (data) {
    element.addEventListener('click', function () {
      data.tabs.forEach(function (tab, index) {
        chrome.tabs.create({
          url: tab.url,
          active: false,
        });
      })
    }, false);
  })(data);
}

function setupDeleteEvent(parent, element, data) {
  (function (parent, data) {
    element.addEventListener('click', function (event) {
      event.stopPropagation();
      chrome.storage.sync.remove(data.index, function (err) {
        if (err) return console.log('err', err);
        alert('Group Removed');
        parent.remove();
      });
    }, false);
  })(parent, data);
}