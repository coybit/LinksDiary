
function parseUri (str) {
    var	o   = parseUri.options,
        m   = o.parser[o.strictMode ? "strict" : "loose"].exec(str),
        uri = {},
        i   = 14;

    while (i--) uri[o.key[i]] = m[i] || "";

    uri[o.q.name] = {};
    uri[o.key[12]].replace(o.q.parser, function ($0, $1, $2) {
        if ($1) uri[o.q.name][$1] = $2;
    });

    return uri;
};

parseUri.options = {
    strictMode: false,
    key: ["source","protocol","authority","userInfo","user","password","host","port","relative","path","directory","file","query","anchor"],
    q:   {
        name:   "queryKey",
        parser: /(?:^|&)([^&=]*)=?([^&]*)/g
    },
    parser: {
        strict: /^(?:([^:\/?#]+):)?(?:\/\/((?:(([^:@]*)(?::([^:@]*))?)?@)?([^:\/?#]*)(?::(\d*))?))?((((?:[^?#\/]*\/)*)([^?#]*))(?:\?([^#]*))?(?:#(.*))?)/,
        loose:  /^(?:(?![^:@]+:[^:@\/]*@)([^:\/?#.]+):)?(?:\/\/)?((?:(([^:@]*)(?::([^:@]*))?)?@)?([^:\/?#]*)(?::(\d*))?)(((\/(?:[^?#](?![^?#\/]*\.[^?#\/.]+(?:[?#]|$)))*\/?)?([^?#\/]*))(?:\?([^#]*))?(?:#(.*))?)/
    }
};

var clip;

function setListBody( queue, isLoggedin ) {

	$('#listbody').html('')

    if( isLoggedin == false ) {
        alert('Please login first')
        return;
    }

    for( var i=0; i<queue.length;i++){


        var favicon = $('<img>').addClass('itemFavIcon').attr('src',queue[i].favIcon);
        var separator = $('<span>|</span>').css('margin','0 1em');
		var dateLabel = $('<div>').addClass('itemDate').text(queue[i].date);
        var host = $('<div>').addClass('itemHost').text( parseUri(queue[i].url).host );
        var clipboard = $('<a>').addClass('itemCopy')
            .text('Copy')
            .attr('title',queue[i].title)
            .attr('url',queue[i].url);
        var tweet = $('<a>').addClass('itemTweet')
            .text('Tweet')
            .attr('href','https://twitter.com/share?url='+ encodeURI(queue[i].url))
            .attr('target','_blank');
        var name = $('<a>')
            .addClass('itemTitle')
            .attr('href',queue[i].url)
            .text(queue[i].title)

        var group = $('<span>').addClass('groupName').text( queue[i].group + '/' + queue[i].category  );

        var title = $('<div>')
            .append(favicon)
            .append(name)
            .append(host)

        var subtitle = $('<div>')
            .append( group )
            .append( separator.clone() )
            .append( dateLabel )
            .append( separator.clone() )
            .append( clipboard )
            .append( tweet );

		var header = $('<div>').addClass('itemHeader')
            .append( title )
            .append( subtitle);

		var body = $('<div>').addClass('itemBody').text( queue[i].description );

		title.append( $('<button>')
            .addClass('glyphicon glyphicon-trash remove')
			.attr('hashcode',queue[i].hashedURL)
			.click(function(e) {

				var hashedURL = $(e.target).attr('hashcode');

				chrome.extension.sendMessage({directive: "panel-remove-item", hashedURL: hashedURL }, function(response) {
					document.location.reload(true);
				});

			}) );

        title.append( $('<button>')
            .addClass('glyphicon glyphicon-pencil')
			.attr('hashcode',queue[i].hashedURL)
			.click( 
				(function(h,b,hash){

					var exitEditMode = function(h,b,c,hash,save) {
						return function() {
							if( save )
								chrome.extension.sendMessage({directive: "panel-edit-item", hashedURL: hash, newDescription: b.text() } );
							else
								 b.text(c);

							// Back UI to Normal mode
							h.find('button.hidden').css('display','inline').removeClass('hidden');
							h.find('.editorButton').remove();
							b.attr('contenteditable','false').css('background-color','');
						}
					}

					return function(e) {
						// Save last text
						var currentText = b.text();

						// Go to edit mode
						b.attr('contenteditable','true').css('background-color','#fff');
						h.find('button').css('display','none').addClass('hidden');
						h.append( $('<button>')
                            .addClass('editorButton glyphicon glyphicon-ok')
                            .click( exitEditMode(h,b,currentText,hash,true) ) );
						h.append( $('<button>')
                            .addClass('editorButton glyphicon glyphicon-remove')
                            .click( exitEditMode(h,b,currentText,hash,false) ) );
					}

				})(title,body,queue[i].hashedURL)
			));

        var item = $('<div>').addClass('item')
            .append( header )
            .append( body )

		$('#listbody').append( item );
	}

    $('#emailButton').click(function(){
        chrome.extension.sendMessage({directive: "panel-email-items" } );
    })

    $('#clearButton').click( function() {
        chrome.extension.sendMessage({directive: "panel-clearButton-click"});
    });

    $('#groupManagerButton').click( function() {
        $("#groupDialog").dialog("open");
    });

    $(".itemCopy").click(function(){
        var txt = '*' + $(this).attr('title') + '*  (' + $(this).attr('url') + ')';

        prompt ("Copy link, then click OK.", txt);
    });

    $("#groupDialog").dialog({autoOpen: false});

    $("#groupDialog #createGroupButton").click( function() {
        createNewGroup( $("#groupDialog #newGroupName").val() );
    });

    $("#groupDialog #joinGroupButton").click( function() {
        joinGroup( $("#groupDialog #joinGroupName").val() );
    });

    $("#groupDialog #inviteGroupButton").click( function() {
        inviteGroup( $("#groupDialog #inviteGroupName").val(), $("#groupDialog #inviteEmail").val() );
    });

    console.log( chromeExOAuth.hasToken() );
}

document.addEventListener('DOMContentLoaded', function () {
	
   	chrome.extension.sendMessage({directive: "panel-open"}, function(response) {});

})

function createNewGroup(groupName) {
    if( groupName != null )
        chrome.extension.sendMessage({directive: "addNewGroup", groupName: groupName});
}

function joinGroup(groupName) {
    if( groupName != null )
        chrome.extension.sendMessage({directive: "joinToGroup", groupName: groupName});
}

function inviteGroup(groupName,email) {
    if( email != null && groupName != null )
        chrome.extension.sendMessage({directive: "inviteToGroup", groupName: groupName, email: email});
}