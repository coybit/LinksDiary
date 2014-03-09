function addClickHandler(e) {
    chrome.extension.sendMessage({directive: "popup-addButton-click"}, function(response) {
        this.close(); // close the popup when the background finishes processing request
    });
}

function shareClickHandler(e) {
    chrome.extension.sendMessage({directive: "popup-panelButton-click"}, function(response) {
        this.close(); // close the popup when the background finishes processing request
    });
}

function emailClickHandler(e) {
    chrome.extension.sendMessage({directive: "popup-emailButton-click"}, function(response) {
        this.close(); // close the popup when the background finishes processing request
    });
}

function clearClickHandler(e) {
    chrome.extension.sendMessage({directive: "popup-clearButton-click"}, function(response) {
        this.close(); // close the popup when the background finishes processing request
    });
}

document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('addButton').addEventListener('click', addClickHandler);
    document.getElementById('panelButton').addEventListener('click', shareClickHandler);
    document.getElementById('clearButton').addEventListener('click', clearClickHandler);
    document.getElementById('emailButton').addEventListener('click', emailClickHandler);

    chrome.extension.sendMessage({directive: "popup-open"}, function(response) {});
})

/*****  Called from background.js *****/
function getDescription() {
  return document.getElementById('description').value;
}

function setTitle(newTitle) {
  console.log(newTitle);
  document.getElementById('title').innerText = newTitle;
}