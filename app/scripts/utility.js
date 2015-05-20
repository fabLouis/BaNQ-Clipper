
var DATE_FORMAT_BANQ = 'DD/MM/YYYY';
var DATE_FORMAT_GOOGLE = 'YYYY-MM-DD';

var Util = Util || {};

/*
 * @banqDate Date from BAnQ with DD/MM/YYYY format 
 * @isCompleteDatetime true it's complete datetime with HH:mm Z
 * @daysToAdd Number of days to add
 * 
 * Returns formatted date from DD/MM/YYYY to YYYY-MM-DD (HH:mm Z)
 */
 Util.banqDateToEventDate = function(banqDate, isCompleteDatetime, daysToAdd) {
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
};

 Util.getCurrentDate = function(isCompleteDatetime) {
	var formattedDate = moment().format(DATE_FORMAT_GOOGLE).toString();
	if (isCompleteDatetime) {
		formattedDate += 'T00%3A00%3A00.000Z';
	}
	console.log('getCurrentDate() '+formattedDate);
	return formattedDate;
};

 Util.getDayLeft = function(banqDate) {
	var b = moment(banqDate, DATE_FORMAT_BANQ);
	var now = moment();
	return parseInt(b.diff(now, 'days', true));
};