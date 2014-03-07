function addClickHandler(e) {
    chrome.extension.sendMessage({directive: "popup-addButton-click"}, function(response) {
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
    document.getElementById('clearButton').addEventListener('click', clearClickHandler);
})

/*****  Called from background.js *****/
function getDescription() {
  return document.getElementById('description').value;
}