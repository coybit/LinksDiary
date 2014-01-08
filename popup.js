// Copyright (c) 2012 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

var linkDiaryKey = 'linkDiaryQueue';

var linkDiary = {

  storageKey: 'linkdiary',

  putLinkInQueue: function() {

    chrome.tabs.query({active: true, currentWindow: true}, function(arrayOfTabs) {

      var activeTab = arrayOfTabs[0];
      
      var tab = {
        date: (new Date()).toDateString(),
        title: activeTab.title,
        url: activeTab.url,
        favIcon: activeTab.favIcon
      };

      chrome.storage.sync.get('linkDiaryQueue', function(results) {

        var queue = results.linkDiaryQueue || [];

        for( var i=0; i<queue.length; i++ ) {

          if( queue[i].url == tab.url )
            return;

          console.log(queue[i].title);
        }

        queue.push(tab);

        chrome.browserAction.setBadgeText({'text':queue.length.toString()});

        chrome.storage.sync.set({'linkDiaryQueue':queue});
      });
     

    });
  },

  initBadgetText: function() {
    chrome.storage.sync.get('linkDiaryQueue', function(results) {
      var queue = results.linkDiaryQueue || [];
      chrome.browserAction.setBadgeText({'text':queue.length.toString()});
    });
  }
};

// Run our kitten generation script as soon as the document's DOM is ready.
document.addEventListener('DOMContentLoaded', function () {});

linkDiary.initBadgetText();

chrome.browserAction.onClicked.addListener(function() {
  linkDiary.putLinkInQueue();
});

chrome.contextMenus.create({
  "title": "Email Today LinksDiary",
  "contexts": ["all"],
  "onclick": function(info, tab) {

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
});


chrome.contextMenus.create({
  "title": "Reset LinksDiary",
  "contexts": ["all"],
  "onclick": function(info, tab) {

    // Clear queue
    chrome.browserAction.setBadgeText({'text':'0'});
    chrome.storage.sync.remove('linkDiaryQueue');
  }
});
