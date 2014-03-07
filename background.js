// 

var linkDiaryKey = 'linkDiaryQueue';

console.log('I am here!');

var LinkDiary = function() {

  var storageKey = 'linkdiary';

  this.putLinkInQueue = function() {

    chrome.tabs.query({active: true, currentWindow: true}, function(arrayOfTabs) {

      var activeTab = arrayOfTabs[0];
      
      var tab = {
        date: (new Date()).toDateString(),
        title: activeTab.title,
        url: activeTab.url,
        description: getMoreInfoFromPopup(),
        favIcon: activeTab.favIcon
      };
     
     saveWebPage(tab);

    });
  }

  this.initBadgetText = function() {
    chrome.storage.sync.get('linkDiaryQueue', function(results) {
      var queue = results.linkDiaryQueue || [];
      chrome.browserAction.setBadgeText({'text':queue.length.toString()});
    });
  }

  this.clear = function() {
    // Clear queue
    chrome.browserAction.setBadgeText({'text':'0'});
    chrome.storage.sync.remove('linkDiaryQueue');
  }

  this.shareIt = function() {
    chrome.storage.sync.get('linkDiaryQueue', function(results) {

      var queue = results.linkDiaryQueue || [];
      var body = '';
      var nl = '%0D%0A';

      for( var i=0; i<queue.length; i++ ){

        var title = queue[i].title;
        var date = queue[i].date;
        var url = queue[i].url;
        var description = queue[i].description;
    
    var head = encodeURIComponent((i+1) + ') ' + title + ' (' + date + ' )');
    var moreInfo = description + nl + encodeURIComponent(url);
    
        body += head + nl + moreInfo + nl + nl
      }

      var email = [
      'mailto:email@echoecho.com?',
      'subject=LinksDiary - ' + (new Date()).toDateString(),
      '&body='+ body
      ].join('');
      window.open(email,'_newtab');

    });
  }

  function getMoreInfoFromPopup() {
    var popupView = chrome.extension.getURL('popup.html');
	var views = chrome.extension.getViews();

	for (var i = 0; i < views.length; i++) {
    	var view = views[i];

    	if( view.location.href == popupView ) {
    		return view.getDescription();
    	}
    }
  }

  function saveWebPage(webpage) {

      chrome.storage.sync.get('linkDiaryQueue', function(results) {

        var queue = results.linkDiaryQueue || [];

        // Check wheter it is new or not
        for( var i=0; i<queue.length; i++ ) {

			console.log(i,queue[i].title, queue[i].url);

          if( queue[i].url == webpage.url )
            return;
        }

        queue.push(webpage);

        // Increase badge number
        chrome.browserAction.setBadgeText({'text':queue.length.toString()});

        // Save web page in queue
        chrome.storage.sync.set({'linkDiaryQueue':queue});
      });
  }
};

var linkDiary = new LinkDiary();
linkDiary.initBadgetText();

// Run our kitten generation script as soon as the document's DOM is ready.
document.addEventListener('DOMContentLoaded', function () {});

// Event handler of Popup window 
chrome.extension.onMessage.addListener(
    function(request, sender, sendResponse) {
        switch (request.directive) {
        case "popup-addButton-click":
            linkDiary.putLinkInQueue();
            sendResponse({}); // sending back empty response to sender
            break;
        case "popup-clearButton-click":
            linkDiary.clear();
            sendResponse({}); // sending back empty response to sender
            break;
        default:
            // helps debug when request directive doesn't match
            alert("Unmatched request of '" + request + "' from script to background.js from " + sender);
        }
    }
);

chrome.browserAction.onClicked.addListener(function() {
  linkDiary.putLinkInQueue();
});

chrome.contextMenus.create({
  "title": "Email Today LinksDiary",
  "contexts": ["all"],
  "onclick": function(info, tab) {

    linkDiary.shareIt();

  }
});


chrome.contextMenus.create({
  "title": "Reset LinksDiary",
  "contexts": ["all"],
  "onclick": function(info, tab) {
  
  linkDiary.clear();

  }
});
