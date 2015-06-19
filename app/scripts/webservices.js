
var WebServices = function() {

	var REQUEST_TYPE_GET = 'GET';
	var REQUEST_TYPE_POST = 'POST';
	var REQUEST_TYPE_DELETE = 'DELETE';
	var CONTENT_TYPE_JSON = 'application/json; charset=utf-8';
	var TIMEZONE = 'UTC';

	var LOCATION = 'BAnQ - Bibliothèque et Archives nationales du Québec, Boulevard de Maisonneuve Est, Montreal, QC, Canada';

	this.getCalendarList = function(callbackSuccess, callbackError) {
		console.log('WS - getCalendarList()');
		ajaxRequest(REQUEST_TYPE_GET, CONTENT_TYPE_JSON, 'users/me/calendarList', null, null, callbackSuccess, callbackError);
	};
	this.insertEvent = function(calendarId, title, number, dateDue, callbackSuccess, callbackError) {
		console.log('WS - insertEvent()');
		var eventDate = Util.banqDateToEventDate(dateDue, false);
		var bodyParameters = {
		 "summary": SUMMARY_PREFIX + " " + title,
		 "description": generateDescription(number),
		 "start": { "date": eventDate, "timeZone": TIMEZONE },
		 "end": { "date": eventDate, "timeZone": TIMEZONE },
		 "location": LOCATION
		};
		ajaxRequest(REQUEST_TYPE_POST, CONTENT_TYPE_JSON, 'calendars/' + calendarId + '/events', bodyParameters, null, callbackSuccess, callbackError);
	};
	this.deleteEvent = function(calendarId, event, callbackSuccess, callbackError) {
		console.log('WS - deleteEvent()');
		ajaxRequest(REQUEST_TYPE_DELETE, CONTENT_TYPE_JSON, 'calendars/' + calendarId + '/events/' + event.id, null, event, callbackSuccess, callbackError);
	};
	this.getEvent = function(calendarId, loan, callbackSuccess, callbackError) {
		var timeMin = Util.getCurrentDate(true);
		var queryParam = '?q='+SUMMARY_PREFIX+ '+' + loan.number+ '&timeMin=' + timeMin;
		console.log('WS - getEvent() - queryParam:'+queryParam);
		ajaxRequest(REQUEST_TYPE_GET, CONTENT_TYPE_JSON, 'calendars/' + calendarId + '/events' + queryParam, null, loan, callbackSuccess, callbackError);
	};
	this.getNextEvents = function(calendarId, callbackSuccess, callbackError) {
		console.log('WS - getNextEvents()');
		var timeMin = Util.getCurrentDate(true);
		var queryParam = '?q='+SUMMARY_PREFIX + '&timeMin=' + timeMin;
		console.log('WS - getNextEvents() - queryParam:'+queryParam);
		ajaxRequest(REQUEST_TYPE_GET, CONTENT_TYPE_JSON, 'calendars/' + calendarId + '/events' + queryParam, null, null, callbackSuccess, callbackError);
	};

	/**
	* GENERIC AJAX FUNCTION.
	*/
	function ajaxRequest(requestType, contentType, serviceName, bodyParameters, callbackData, callbackSuccess, callbackError) {
		
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
				if (callbackSuccess) {
					if (_.isNull(callbackData)) {
						callbackData = bodyParameters;
					}
					callbackSuccess(result, callbackData);
				}
			}
		});
	}
	function getBearer() {
		return 'Bearer ' + _token;
	}
	function generateDescription(documentNumber) {
		var desc = chrome.i18n.getMessage("descriptionRenew") + 'https://iris.banq.qc.ca/alswww2.dll/APS_ZONES?fn=MyZone' + '\n\n';
		desc += chrome.i18n.getMessage("descriptionDocument") + documentNumber + '\n\n';
		desc += chrome.i18n.getMessage("descriptionEnd");
		return desc;
	}
	
};	