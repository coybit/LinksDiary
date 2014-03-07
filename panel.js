function setListBody(listBody) {
  document.getElementById('listbody').innerHTML = listBody;
}

document.addEventListener('DOMContentLoaded', function () {
    chrome.extension.sendMessage({directive: "panel-open"}, function(response) {});
})