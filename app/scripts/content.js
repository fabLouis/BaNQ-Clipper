'use strict';

$(document).ready(function() {
	// console.log('document');

	var loans = [];
	for (var i = 1 ; i <= 10 ; i++) {
		var loadDiv = $('#item_P'+i);
		if (!_.isUndefined(loadDiv.html())) {
			// console.log('loadDiv '+loadDiv.html());
			var allListDataCells = loadDiv.find('.LoanBrowseFieldDataCell');
			var loan = {};
			loan.title	 = allListDataCells[0].innerText;
			loan.number = allListDataCells[1].innerText;
			loan.at = allListDataCells[2].innerText;
			loan.date = allListDataCells[3].innerText;
			loan.due = allListDataCells[4].innerText.substring(0,10);
			// console.log('loan '+i+' - '+JSON.stringify(loan));
			loans.push(loan);
		}
	}

	if (!_.isEmpty(loans)) {
		// console.log('loans - '+JSON.stringify(loans));
		chrome.storage.sync.set({loans: loans});
		// chrome.runtime.sendMessage({ loans: loans }, function(response) {});
	}

});
