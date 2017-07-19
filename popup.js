document.addEventListener('DOMContentLoaded', function () {
  var groups = [];
  chrome.storage.sync.get(['groups'], function (items) {
    if (!items.groups) return
    console.log('items.groups', items.groups)
    for (var index = 1; index <= items.groups; index++) {
      (function (index) {
        console.log('index', 'group' + index)
        chrome.storage.sync.get(['group' + index], function (items) {
          console.log('items', items)
          if (!items['group' + index]) return
          // console.log('group', items['group' + index])
          groups.push(JSON.parse(items['group' + index]));
          updateList(groups);
        });
      })(index)
    }
  });
  var saveButton = document.getElementById('save');
  var nameInput = document.getElementById('name');
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
      console.log('tabs', tabs)
      var obj = {
        name: nameInput.value,
        tabs: tabs
      };
      console.log('obj', obj)
      groups.push(obj);
      updateList(groups);
      chrome.storage.sync.set({ 'groups': JSON.stringify(groups.length) }, function (err) {
        if (err) console.log('err', err);
        let obj2 = {};
        obj2['group' + groups.length] = JSON.stringify(obj);
        chrome.storage.sync.set(obj2, function (err2) {
          if (err2) console.log('err2', err2);
          alert('Group saved');
          nameInput.value = '';
        });
      });
    });
  }, false);
}, false);

function updateList(groups) {
  // console.log('groups', groups)
  var groupsElement = document.getElementById("groups");
  while (groupsElement.hasChildNodes()) {
    groupsElement.removeChild(groupsElement.lastChild);
  }
  for (var i = 0; i < groups.length; i++) {
    var newLI = document.createElement("li");
    setupClickEvent(newLI, groups[i]);
    var newGroup = document.createTextNode(groups[i].name);
    newLI.appendChild(newGroup);
    groupsElement.appendChild(newLI);
  }
}

function setupClickEvent(element, data) {
  (function (value) {
    element.addEventListener("click", function () {
      value.tabs.forEach(function (tab, index) {
        chrome.tabs.create({
          url: tab.url,
          active: false,
        });
      })
    }, false);
  })(data);
}