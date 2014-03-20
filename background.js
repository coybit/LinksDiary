
var linkDiaryKey = 'linkDiaryQueue';

console.log('I am here!');

/*
 var oauth = ChromeExOAuth.initBackgroundPage({
 'request_url': 'https://api.twitter.com/oauth/request_token',
 'authorize_url': 'https://api.twitter.com/oauth/authorize',
 'access_url': 'https://api.twitter.com/oauth/access_token',
 'consumer_key': '-',
 'consumer_secret': '-',
 'scope': 'https://docs.google.com/feeds/',
 'app_name': 'My Google Docs Extension'
 });

 oauth.authorize(function() {
 // ... Ready to fetch private data ...
 console.log('DONE')
 });
 */

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
                category: info.categoryID,
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

            var categories = [
                {text:'Development',id:'Development'},
                {text:'Design',id:'Design'},
                {text:'Marketing',id:'Marketing'},
                {text:'Fun',id:'Fun'},
                {text:'Other',id:'Other'}
            ]

            getView('popup.html').initPopup(
                arrayOfTabs[0].title,
                arrayOfTabs[0].favIconUrl,
                categories
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

    this.openLogin = function() {

        chrome.storage.sync.get('linkDiaryUser', function(result) {

            var user = result.linkDiaryUser;

            if( ! user ){
                // Generate a token and saveit
                user = {};
                user.token = 'ateststreag'.hashCode(); // ToDo: Generate Secure Token
                chrome.storage.sync.set( { 'linkDiaryUser': user } );
            }
            else if(user.serverToken) {
                console.log('You already are logged in');
                return;
            }

            // redirect for authentication
            var loginURL = chrome.extension.getURL('login.html?' + user.token );
            chrome.tabs.create( { url: loginURL });

            // Frequency check for login state
            isLoggedIn( user.token );
        });

        var startTime = new Date();

        function isLoggedIn(userToken) {
            $.get('http://localhost:3000/auth/twitter/state?clientToken=' + userToken)
                .done( function(res) {

                    var waitTime = (new Date().getTime() - startTime.getTime())/1000;

                    console.log(res);

                    if( res.state === 'pending' ) {
                        if( waitTime < 180 )
                            setTimeout( function(){
                                isLoggedIn(userToken)
                            }, 5000 );
                        else
                            console.log('Timeout');
                    }
                    else {
                        // Save server side Token
                        console.log('Your are logged in');
                        chrome.storage.sync.get('linkDiaryUser', function(result) {
                            result.linkDiaryUser.serverToken = res.serverToken;
                            chrome.storage.sync.set( { 'linkDiaryUser': result.linkDiaryUser } );
                        });
                    }
                })
        }
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

    this.LoadFromServer = function(callback) {
        //var  loadUrl = 'http://localhost:3000/links/darchin/coybit';
        var  loadUrl = 'http://linksDiary.herokuapp.com/links/darchin/coybit';

        $.get(loadUrl).done( function(serverQueue){
            chrome.storage.sync.set({'linkDiaryQueue':serverQueue.links});
            callback();
        });
    }

    this.SaveAllToServer = function(callback) {
        chrome.tabs.query({active: true, currentWindow: true}, function(arrayOfTabs) {

            chrome.storage.sync.get('linkDiaryQueue', function(results) {

                var queue = results.linkDiaryQueue || [];
                //var  saveUrl = 'http://localhost:3000/links/darchin/coybit';
                var  saveUrl = 'http://linksDiary.herokuapp.com//links/darchin/coybit';
                var responsCount = 0;

                for( var i=0; i<queue.length; i++ ){
                    $.post(saveUrl, {link: queue[i] }).done( function(){
                        responsCount++;
                        if( responsCount==queue.length)
                            callback();
                    });
                }
            });
        });

    }

};

var linkDiary = new LinkDiary();

linkDiary.SaveAllToServer( function() {
    linkDiary.LoadFromServer( function() {
        linkDiary.initBadgetText();
    })
});

linkDiary.openLogin();

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
