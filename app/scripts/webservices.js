
var WebServices = function() {

	var REQUEST_TYPE_GET = 'GET';
	var REQUEST_TYPE_POST = 'POST';
	var REQUEST_TYPE_DELETE = 'DELETE';
	var CONTENT_TYPE_JSON = 'application/json; charset=utf-8';
	var TIMEZONE = 'UTC';
	var SUMMARY_PREFIX = '[BAnQ]';

	var DESCRIPTION_MSG = '(please do not change the event summary)';
	var LOCATION = 'BAnQ - Bibliothèque et Archives nationales du Québec, Boulevard de Maisonneuve Est, Montreal, QC, Canada';

	this.getCalendarList = function(callbackSuccess, callbackError) {
		console.log('WS - getCalendarList()');
		ajaxRequest(REQUEST_TYPE_GET, CONTENT_TYPE_JSON, 'users/me/calendarList', null, callbackSuccess, callbackError);
	};
	this.insertEvent = function(calendarId, title, number, dateDue, callbackSuccess, callbackError) {
		console.log('WS - insertEvent()');
		var eventDate = Util.banqDateToEventDate(dateDue, false);
		var bodyParameters = {
		 "summary": SUMMARY_PREFIX + " " + title,
		 "description": "doc. " + number + "\n\n" + DESCRIPTION_MSG,
		 "start": { "date": eventDate, "timeZone": TIMEZONE },
		 "end": { "date": eventDate, "timeZone": TIMEZONE },
		 "location": LOCATION
		};
		ajaxRequest(REQUEST_TYPE_POST, CONTENT_TYPE_JSON, 'calendars/' + calendarId + '/events', bodyParameters, callbackSuccess, callbackError);
	};
	this.deleteEvent = function(calendarId, eventId, callbackSuccess, callbackError) {
		console.log('WS - deleteEvent()');
		ajaxRequest(REQUEST_TYPE_DELETE, CONTENT_TYPE_JSON, 'calendars/' + calendarId + '/events/' + eventId + '?sendNotifications=true', null, callbackSuccess, callbackError);
	};
	this.getEvent = function(calendarId, loan, callbackSuccess, callbackError) {
		var queryParam = '?q='+SUMMARY_PREFIX+ '+' + loan.number;
		console.log('WS - getEvent() - queryParam:'+queryParam);
		ajaxRequest(REQUEST_TYPE_GET, CONTENT_TYPE_JSON, 'calendars/' + calendarId + '/events' + queryParam, loan, callbackSuccess, callbackError);
	};
	this.getNextEvents = function(calendarId, loan, callbackSuccess, callbackError) {
		console.log('WS - getNextEvents()');
		var timeMin = Util.getCurrentDate(true);
		var queryParam = '?singleEvents=true&orderBy=startTime&q='+SUMMARY_PREFIX + '&timeMin=' + timeMin;
		console.log('WS - getNextEvents() - queryParam:'+queryParam);
		ajaxRequest(REQUEST_TYPE_GET, CONTENT_TYPE_JSON, 'calendars/' + calendarId + '/events' + queryParam, loan, callbackSuccess, callbackError);
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
				if (_.isEqual(xOptions.status, 401)) {
					GAuth.removeCachedAuthToken();
				}
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
	
};	