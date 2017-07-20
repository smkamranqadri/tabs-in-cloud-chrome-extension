var delIconSrc = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAABQUlEQVRoQ+1YQYrCUAxNrHvXdaNHcCmOBxAV9Ah6A48yN9AjODAFD2DBpUfQjd3q3hLpQnAQ/In9n+Lwum3yk/fy8j4t04c//OH9EwBUPUFM4F9NIBv2ZlSrLV+CElnFSTr3BdybhFTN37v2CEINIBv3xRdrmnPi362qN1VQURAANLQ/xGACRsIqC1fvQGUdOgqbAYReZq3277gAwLe0MAEXo9gBB0OQECTkYgAS+ssALrKSinlKhwu5GMVFBheCC4X9vQIXggu5GIALwYXgQi+3ADbqMpFs1D8TU8MV99Z7kWOcpG1LrvmD5jT6WjPzxFJEGysiP80knWrjizgzgGzQbVNU33ufgtCF8msn3uwOQQEUhxcgJIq+mahDzC1LwadYkaMQ7TnPF9bm35pAqWYDJJslFKCHUkcCQCn6PCTfAON2qzHz/DbaAAAAAElFTkSuQmCC';

document.addEventListener('DOMContentLoaded', function () {
  var groups = [];
  chrome.storage.sync.get(['groups'], function (items) {
    // console.log('items', items)
    if (!items.groups) return;
    for (var index = 1; index <= items.groups; index++) {
      (function (index) {
        var groupIndex = ['group' + index];
        chrome.storage.sync.get(groupIndex, function (items) {
          console.log('items', items)
          if (!items[groupIndex]) return
          var group = JSON.parse(items[groupIndex]);
          groups.push(group);
          updateList(group);
        });
      })(index);
    }
  });
  var nameInput = document.getElementById('name');
  var saveButton = document.getElementById('save');
  saveButton.addEventListener('click', function () {
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
      console.log('test')
      var groupIndex = 'group' + (groups.length + 1);
      var obj = {
        index: groupIndex,
        name: nameInput.value,
        tabs: tabs
      };
      console.log('obj', obj)
      groups.push(obj);
      updateList(obj);
      chrome.storage.sync.set({ 'groups': JSON.stringify(groups.length) }, function (err) {
        if (err) return console.log('err', err);
        let obj2 = {};
        obj2[groupIndex] = JSON.stringify(obj);
        console.log('obj2', obj2)
        chrome.storage.sync.set(obj2, function (err2) {
          if (err2) return console.log('err2', err2);
          alert('Group saved');
          nameInput.value = '';
        });
      });
    });
  }, false);
}, false);

function updateList(group) {
  var groupsElement = document.getElementById('groups');
  var newLI = document.createElement('li');
  var newGroup = document.createElement('span');
  var newImg = document.createElement('img');
  var newDiv = document.createElement('dev');
  newDiv.className = 'delicon ripple';
  newImg.width = '24';
  newImg.height = '24';
  newImg.src = delIconSrc;
  newGroup.innerText = group.name;
  newGroup.className = 'groupText ripple';
  newLI.appendChild(newGroup);
  newDiv.appendChild(newImg);
  newLI.appendChild(newDiv);
  setupGroupEvent(newLI, group);
  setupDeleteEvent(newLI, newDiv, group);
  groupsElement.appendChild(newLI);
}

function setupGroupEvent(element, data) {
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
      console.log('data', data);
      // let obj2 = {};
      //   obj2[groupIndex] = JSON.stringify(obj);
      chrome.storage.sync.remove(data.index, function (err2) {
        if (err2) return console.log('err2', err2);
        alert('Group Removed');
        parent.remove();
      });
    }, false);
  })(parent, data);
}