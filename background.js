// 

var linkDiaryKey = 'linkDiaryQueue';

console.log('I am here!');

String.prototype.hashCode = function(){
    var hash = 0;
    if (this.length == 0) return hash;
    for (i = 0; i < this.length; i++) {
        char = this.charCodeAt(i);
        hash = ((hash<<5)-hash)+char;
        hash = hash & hash; // Convert to 32bit integer
    }
    return hash;
}


var LinkDiary = function() {

    var storageKey = 'linkdiary';

    this.addToQueue = function() {

        // Find active tab and save it
        chrome.tabs.query({active: true, currentWindow: true}, function(arrayOfTabs) {

            var activeTab = arrayOfTabs[0];
            var info = getView('popup.html').getInfo();

            var tab = {
                date: (new Date()).toDateString(),
                title: activeTab.title,
                url: activeTab.url,
                description: info.description,
                group: info.groupID,
                favIcon: activeTab.favIconUrl,
                hashedURL: activeTab.url.hashCode()
            };

            console.log(tab);

            saveWebPage(tab);

        });
    }

    this.initBadgetText = function() {

        chrome.storage.sync.get('linkDiaryQueue', function(results) {

            var queue = results.linkDiaryQueue || [];
            chrome.browserAction.setBadgeText({'text':queue.length.toString()});

        });
    }

    this.clearQueue = function() {
        // Clear queue
        chrome.browserAction.setBadgeText({'text':'0'});
        chrome.storage.sync.remove('linkDiaryQueue');
    }

    this.editItemInQueue = function(linkHashCode, newDescription) {

        chrome.storage.sync.get('linkDiaryQueue', function(results) {

            var queue = results.linkDiaryQueue || [];
            var newQueue = [];

            // Check wheter it is new or not
            for( var i=0; i<queue.length; i++ ) {

                console.log(i,queue[i].hashedURL, linkHashCode);

                if( queue[i].hashedURL == linkHashCode )
                    queue[i].description = newDescription;

                newQueue.push( queue[i] );
            }

            // Increase badge number
            chrome.browserAction.setBadgeText({'text':newQueue.length.toString()});

            // Save web page in queue
            chrome.storage.sync.set({'linkDiaryQueue':newQueue});
        });
    }

    this.removeFromQueue = function(linkHashCode) {

        chrome.storage.sync.get('linkDiaryQueue', function(results) {

            var queue = results.linkDiaryQueue || [];
            var newQueue = [];

            // Check wheter it is new or not
            for( var i=0; i<queue.length; i++ ) {

                console.log(i,queue[i].hashedURL, linkHashCode);

                if( queue[i].hashedURL != linkHashCode )
                    newQueue.push( queue[i] );
            }

            // Increase badge number
            chrome.browserAction.setBadgeText({'text':newQueue.length.toString()});

            // Save web page in queue
            chrome.storage.sync.set({'linkDiaryQueue':newQueue});
        });
    }

    function generateLinksList( encodeForEmail, callback ) {
        chrome.storage.sync.get('linkDiaryQueue', function(results) {

            var queue = results.linkDiaryQueue || [];
            var body = '';
            var nl = encodeForEmail ? '%0D%0A' : '<br>';

            for( var i=0; i<queue.length; i++ ){

                var title = queue[i].title;
                var date = queue[i].date;
                var url = queue[i].url;
                var description = queue[i].description;

                var head = encodeURIComponent((i+1) + ') ' + title + ' (' + date + ' )');
                var moreInfo = description + nl + ( encodeForEmail ? encodeURIComponent(url) : url );
                var editButtons = encodeForEmail ? '' : ("<a class='delete' href='"  + queue[i].hashedURL + "'>remove</a>") + nl;

                body += head + nl + moreInfo + nl + editButtons + nl;
            }

            callback( body );

        });
    }

    this.emailIt = function() {

        // Create a mailto link and open it
        chrome.storage.sync.get('linkDiaryQueue', function(results) {

            generateLinksList( true, function(body) {

                var email = [
                    'mailto:email@echoecho.com?',
                    'subject=LinksDiary - ' + (new Date()).toDateString(),
                    '&body=' + body
                ].join('');

                window.open(email,'_newtab');

            })

        });
    }

    this.fillPopupInfo = function() {

        chrome.tabs.query({active: true, currentWindow: true}, function(arrayOfTabs) {

            var groups = [
                {text:'Development',id:'Development'},
                {text:'Design',id:'Design'},
                {text:'Marketing',id:'Marketing'}
            ]

            getView('popup.html').initPopup(
                arrayOfTabs[0].title,
                arrayOfTabs[0].favIconUrl,
                groups
            );

        });

    }

    this.fillPanelInfo = function() {

        chrome.tabs.query({active: true, currentWindow: true}, function(arrayOfTabs) {

            chrome.storage.sync.get('linkDiaryQueue', function(results) {

                var queue = results.linkDiaryQueue || [];
                getView('panel.html').setListBody( queue );

            });

        });

    }

    this.openPanel = function() {
        var panelURL = chrome.extension.getURL('panel.html');
        chrome.tabs.create( { url : panelURL}  );
    }

    function getView(viewFilename) {

        var popupView = chrome.extension.getURL(viewFilename);
        var views = chrome.extension.getViews();

        for (var i = 0; i < views.length; i++) {
            var view = views[i];

            if( view.location.href == popupView ) {
                return view;
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


/**** Event handler of Popup window ****/
chrome.extension.onMessage.addListener(
    function(request, sender, sendResponse) {
        switch (request.directive) {

            case "panel-open":
                linkDiary.fillPanelInfo();
                sendResponse({}); // sending back empty response to sender
                break;

            case "panel-remove-item":
                linkDiary.removeFromQueue( request.hashedURL );
                sendResponse({}); // sending back empty response to sender
                break;

            case "panel-email-items":
                linkDiary.emailIt();
                sendResponse({}); // sending back empty response to sender
                break;

            case "panel-edit-item":
                linkDiary.editItemInQueue( request.hashedURL, request.newDescription );
                sendResponse({}); // sending back empty response to sender
                break;

            case "popup-open":
                linkDiary.fillPopupInfo();
                sendResponse({}); // sending back empty response to sender
                break;

            case "popup-addButton-click":
                linkDiary.addToQueue();
                sendResponse({}); // sending back empty response to sender
                break;

            case "popup-panelButton-click":
                linkDiary.openPanel();
                sendResponse({}); // sending back empty response to sender
                break;

            case "popup-emailButton-click":
                linkDiary.emailIt();
                sendResponse({}); // sending back empty response to sender
                break;

            case "panel-clearButton-click":
            case "popup-clearButton-click":
                linkDiary.clearQueue();
                sendResponse({}); // sending back empty response to sender
                break;

            default:
                // helps debug when request directive doesn't match
                alert("Unmatched request of '" + request + "' from script to background.js from " + sender);
        }
    }
);

chrome.browserAction.onClicked.addListener(function() {
    linkDiary.addToQueue();
});

/**** Context Menu ****/
chrome.contextMenus.create({
    "title": "Open Panel",
    "contexts": ["all"],
    "onclick": function(info, tab) {

        linkDiary.openPanel();

    }
});

chrome.contextMenus.create({
    "title": "Email Links",
    "contexts": ["all"],
    "onclick": function(info, tab) {

        linkDiary.emailIt();

    }
});


chrome.contextMenus.create({
    "title": "Remove All Links",
    "contexts": ["all"],
    "onclick": function(info, tab) {

        linkDiary.clearQueue();

    }
});
