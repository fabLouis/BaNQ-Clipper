
var WebServices = function() {

	var REQUEST_TYPE_GET = 'GET';
	var REQUEST_TYPE_POST = 'POST';
	var CONTENT_TYPE_JSON = 'application/json; charset=utf-8';
	var TIMEZONE = 'UTC';
	var SUMMARY_PREFIX = 'BAnQ';
	var DATE_FORMAT_BANQ = 'DD/MM/YYYY';
	var DATE_FORMAT_GOOGLE = 'YYYY-MM-DD';
	var DESCRIPTION_MSG = '(please do not change the event summary)';
	var LOCATION = 'BAnQ - Bibliothèque et Archives nationales du Québec, Boulevard de Maisonneuve Est, Montreal, QC, Canada';

	this.getCalendarList = function(callbackSuccess, callbackError) {
		console.log('WS - getCalendarList()');
		ajaxRequest(REQUEST_TYPE_GET, CONTENT_TYPE_JSON, 'users/me/calendarList', null, callbackSuccess, callbackError);
	};
	this.insertEvent = function(id, title, number, dateDue, dayBefore, callbackSuccess, callbackError) {
		console.log('WS - insertEvent()');
		var dayDelta = 0;
		if (dayBefore) {
			dayDelta = -1;
		}
		var eventDate = banqDateToEventDate(dateDue, false, dayDelta);
		var bodyParameters = {
		 "summary": SUMMARY_PREFIX + ": " + title,
		 "description": "doc. " + number + "\n\n" + DESCRIPTION_MSG,
		 "start": { "date": eventDate, "timeZone": TIMEZONE },
		 "end": { "date": eventDate, "timeZone": TIMEZONE },
		 "location": LOCATION
		};
		ajaxRequest(REQUEST_TYPE_POST, CONTENT_TYPE_JSON, 'calendars/' + id + '/events', bodyParameters, callbackSuccess, callbackError);
	};
	this.getEvent = function(id, loan, dayBefore, callbackSuccess, callbackError) {
		console.log('WS - getEvent()');
		var dayDelta = 0;
		if (dayBefore) {
			dayDelta = -1;
		}
		var timeMin = banqDateToEventDate(loan.due, true, dayDelta);
		var timeMax = banqDateToEventDate(loan.due, true, dayDelta + 1);
		var queryParam = '?q='+SUMMARY_PREFIX+ '+' + loan.number + '&timeMin=' + timeMin + '&timeMax=' + timeMax;
		console.log('WS - getEvent() - queryParam:'+queryParam);
		ajaxRequest(REQUEST_TYPE_GET, CONTENT_TYPE_JSON, 'calendars/' + id + '/events' + queryParam, loan, callbackSuccess, callbackError);
	};
	this.getNextEvents = function(id, loan, callbackSuccess, callbackError) {
		console.log('WS - getNextEvents()');
		var timeMin = getCurrentDate(true);
		var queryParam = '?singleEvents=true&orderBy=startTime&q='+SUMMARY_PREFIX + '&timeMin=' + timeMin;
		console.log('WS - getNextEvents() - queryParam:'+queryParam);
		ajaxRequest(REQUEST_TYPE_GET, CONTENT_TYPE_JSON, 'calendars/' + id + '/events' + queryParam, loan, callbackSuccess, callbackError);
	};

	/**
	* GENERIC AJAX FUNCTION.
	*/
	function ajaxRequest(requestType, contentType, serviceName, bodyParameters, callbackSuccess, callbackError) {
		
		var url = 'https://www.googleapis.com/calendar/v3/' + serviceName;
		var headers = {
			'Authorization': getBearer()
		};
		var data = null;
		if (bodyParameters != null) {
			data = JSON.stringify(bodyParameters);
		}

		$.ajax({
			url: url,
			type: requestType,
			contentType: contentType,
			data: data,
			//dataType: DATA_TYPE_JSON,
			headers: headers,
			error: function(xOptions, textStatus, errorThrown) {
				// TODO
				if (callbackError) {
					callbackError(xOptions, textStatus);
				}
			},
			success: function(result, status, xhr) {
				// TODO
				if (callbackSuccess) {
					callbackSuccess(result, bodyParameters);
				}
			}
		});
	}
	function getBearer() {
		return 'Bearer ' + _token;
	}
	/*
	 * @banqDate Date from BAnQ with DD/MM/YYYY format 
	 * @isCompleteDatetime true it's complete datetime with HH:mm Z
	 * @daysToAdd Number of days to add
	 * 
	 * Returns formatted date from DD/MM/YYYY to YYYY-MM-DD (HH:mm Z)
	 */
	function banqDateToEventDate(banqDate, isCompleteDatetime, daysToAdd) {
		var m = moment(banqDate, DATE_FORMAT_BANQ);
		if (daysToAdd) {
			m.add(daysToAdd, "days");
		}
		var formattedDate = m.format(DATE_FORMAT_GOOGLE).toString();
		if (isCompleteDatetime) {
			formattedDate += 'T00%3A00%3A00.000Z';
		}
		console.log('banqDateToEventDate() '+formattedDate);
		return formattedDate;
	}
	function getCurrentDate(isCompleteDatetime) {
		var formattedDate = moment().format(DATE_FORMAT_GOOGLE).toString();
		if (isCompleteDatetime) {
			formattedDate += 'T00%3A00%3A00.000Z';
		}
		console.log('getCurrentDate() '+formattedDate);
		return formattedDate;
	}
};	