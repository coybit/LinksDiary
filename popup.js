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

function loginClickHandler(e) {
    chrome.extension.sendMessage({directive: "login"}, function(response) {
        this.close(); // close the popup when the background finishes processing request
    });
}

function logoutClickHandler(e) {
    chrome.extension.sendMessage({directive: "logout"}, function(response) {
        this.close(); // close the popup when the background finishes processing request
    });
}

document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('addButton').addEventListener('click', addClickHandler);
    document.getElementById('panelButton').addEventListener('click', shareClickHandler);
    document.getElementById('clearButton').addEventListener('click', clearClickHandler);
    document.getElementById('emailButton').addEventListener('click', emailClickHandler);
    document.getElementById('loginButton').addEventListener('click', loginClickHandler);
    document.getElementById('logoutButton').addEventListener('click', logoutClickHandler);

    chrome.extension.sendMessage({directive: "popup-open"}, function(response) {});
})

/*****  Called from background.js *****/
function getInfo() {
    return {
        group:  $('#group').val(),
        categoryID: $('#link-category').val(),
        description: document.getElementById('description').value
    };
}

function initPopup(newTitle,favIconUrl,categories,isLoggedin) {

    if( isLoggedin == false) {
        $('.message').show();
        $('.wrapper').hide();
        return;
    }
    else {
        $('.message').hide();
        $('.wrapper').show();
    }

    document.getElementById('title').innerText =  newTitle;
    document.getElementById('favIcon').src = favIconUrl;

    for(var i=0; i<categories.length;i++) {
        var option = $('<option>').attr('value', categories[i].id).text(categories[i].text);
        $('#link-category').append( option );
    }
}