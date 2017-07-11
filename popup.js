document.addEventListener('DOMContentLoaded', function () {
  var groups = [];
  chrome.storage.sync.get(['groups'], function (items) {
    if (!items.groups) return
    groups = JSON.parse(items.groups);
    updateList(groups);
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
      });
      var obj = {
        name: nameInput.value,
        tabs: tabs
      };
      groups.push(obj);
      updateList(groups);
      console.log(groups)
      chrome.storage.sync.set({ 'groups': JSON.stringify(groups) }, function () {
        alert('Group saved');
        nameInput.value = '';
      });
    });
  }, false);
}, false);

function updateList(groups) {
  console.log('groups', groups);
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