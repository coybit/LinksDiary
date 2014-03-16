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

function setListBody(queue) {

	$('#listbody').html('')

    for( var i=0; i<queue.length;i++){


        var favicon = $('<img>').addClass('itemFavIcon').attr('src',queue[i].favIcon);
        var seperator = $('<span>|</span>').css('margin','0 1em');
		var dateLabel = $('<div>').addClass('itemDate').text(queue[i].date);
        var host = $('<div>').addClass('itemHost').text( parseUri(queue[i].url).host );
        var category = queue[i].category ? $('<div>').addClass('category').text( queue[i].category ) : '';

        var clipboard = $('<a>').addClass('itemCopy').text('Copy');

        var name = $('<a>')
            .addClass('itemTitle')
            .attr('href',queue[i].url)
            .text(queue[i].title)

        var title = $('<div>')
            .append(favicon)
            .append(name)
            .append(category)

		var header = $('<div>').addClass('itemHeader')
            .append( title )
            .append( dateLabel )
            .append( seperator )
            .append( host )
            .append( seperator )
            .append( clipboard );

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

        $('#emailButton').click(function(){
            chrome.extension.sendMessage({directive: "panel-email-items" } );
        })

        $('#clearButton').click( function() {
            chrome.extension.sendMessage({directive: "panel-clearButton-click"});
        });
	}
  //document.getElementById('listbody').innerHTML = listBody;

    $(".itemCopy").click(function(){
        var title = $(this).parent().find('.itemTitle');
        var txt = '*' + title.text().trim() + '*  (' + title.attr('href') + ')';

        prompt ("Copy link, then click OK.", txt);
    });
}

document.addEventListener('DOMContentLoaded', function () {
	
   	chrome.extension.sendMessage({directive: "panel-open"}, function(response) {});

})
