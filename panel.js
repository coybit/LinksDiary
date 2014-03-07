function setListBody(queue) {

	$('#listbody').html('')

	for( var i=0; i<queue.length;i++){

		var dateLabel = $('<span>').addClass('date').text(queue[i].date);
		var item = $('<div>').addClass('item');
		var header = $('<div>').addClass('itemHeader').text( queue[i].title ).append( dateLabel );
		var body = $('<div>').addClass('itemBody').text( queue[i].description );
		var footer = $('<div>').addClass('itemFooter').text( queue[i].url  );

		header.append( $('<button>')
			.text('Remove')
			.attr('id',queue[i].hashedURL) )
			.click(function(e) {

				var hashedURL = $(e.target).attr('id');
				
				chrome.extension.sendMessage({directive: "panel-remove-item", hashedURL: hashedURL }, function(response) {
					document.location.reload(true);
				});

			});

		item.append( header ).append( body ).append( footer );

		$('#listbody').append( item );
	}
  //document.getElementById('listbody').innerHTML = listBody;
}

document.addEventListener('DOMContentLoaded', function () {
	
   	chrome.extension.sendMessage({directive: "panel-open"}, function(response) {});

})
