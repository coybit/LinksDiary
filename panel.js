function setListBody(queue) {

	$('#listbody').html('')

	for( var i=0; i<queue.length;i++){

		var link = $('<a>').attr('href', queue[i].url).text(queue[i].url);
		var dateLabel = $('<span>').addClass('date').text(queue[i].date);
		var item = $('<div>').addClass('item');
		var header = $('<div>').addClass('itemHeader').text( queue[i].title ).append( dateLabel );
		var body = $('<div>').addClass('itemBody').text( queue[i].description );
		var footer = $('<div>').addClass('itemFooter').html( link );

		header.append( $('<button>')
			.text('Remove')
			.attr('hashcode',queue[i].hashedURL)
			.click(function(e) {

				var hashedURL = $(e.target).attr('hashcode');

				chrome.extension.sendMessage({directive: "panel-remove-item", hashedURL: hashedURL }, function(response) {
					document.location.reload(true);
				});

			}) );

		header.append( $('<button>')
			.text('Edit')
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
							$('.itemBody').attr('contenteditable','false').css('background-color','');
						}
					}

					return function(e) {
						// Save last text
						var currentText = b.text();

						// Go to edit mode
						b.attr('contenteditable','true').css('background-color','#fff');
						h.find('button').css('display','none').addClass('hidden');
						header.append( $('<button>').text('OK').addClass('editorButton').click( exitEditMode(h,b,currentText,hash,true) ) );
						header.append( $('<button>').text('Cancel').addClass('editorButton').click( exitEditMode(h,b,currentText,hash,false) ) );
					}

				})(header,body,queue[i].hashedURL)
			));

		item.append( header ).append( body ).append( footer );

		$('#listbody').append( item );
	}
  //document.getElementById('listbody').innerHTML = listBody;
}

document.addEventListener('DOMContentLoaded', function () {
	
   	chrome.extension.sendMessage({directive: "panel-open"}, function(response) {});

})
