// 

var linkDiaryKey = 'linkDiaryQueue';

var LinkDiary = function() {

  var storageKey = 'linkdiary';

  this.putLinkInQueue = function() {

    chrome.tabs.query({active: true, currentWindow: true}, function(arrayOfTabs) {

      var activeTab = arrayOfTabs[0];
      
      var tab = {
        date: (new Date()).toDateString(),
        title: activeTab.title,
        url: activeTab.url,
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
    
    var head = encodeURIComponent((i+1) + ') ' + title + ' (' + date + ' )');
    var description = encodeURIComponent(url);
    
        body += head + nl + description + nl + nl
      }

      var email = [
      'mailto:email@echoecho.com?',
      'subject=LinksDiary - ' + (new Date()).toDateString(),
      '&body='+ body
      ].join('');
      window.open(email,'_newtab');

    });
  }

  function saveWebPage(webpage) {

      chrome.storage.sync.get('linkDiaryQueue', function(results) {

        var queue = results.linkDiaryQueue || [];

        // Check wheter it is new or not
        for( var i=0; i<queue.length; i++ ) {

          if( queue[i].url == webpage.url )
            return;

          console.log(queue[i].title);
        }

        queue.push(webpage);

        // Increase badge number
        chrome.browserAction.setBadgeText({'text':queue.length.toString()});

        // Save web page in queue
        chrome.storage.sync.set({'linkDiaryQueue':queue});
      });
  }
};

// Run our kitten generation script as soon as the document's DOM is ready.
document.addEventListener('DOMContentLoaded', function () {});

var linkDiary = new LinkDiary();
linkDiary.initBadgetText();

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
