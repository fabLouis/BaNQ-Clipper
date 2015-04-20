'use strict';

var _token, _loans, _dayBefore, _calendarSelect;
var _webServices = new WebServices();

$(document).ready(function() {
  console.log('document ready');

  // init i18n
  $('[i18n-content]').each(function(index, element){
        element.innerHTML = chrome.i18n.getMessage($(this).attr('i18n-content'));
    });

  // if user's token exists
  chrome.storage.sync.get("token", function(data){
      _token = data["token"];
      console.log('token '+_token);
      if (!_.isUndefined(_token)) {
        $("#googleAuthButton").hide();
        $("#authorizedDiv").show();
        initUserCalendarSelect();
      } else {
        $("#googleAuthButton").show();
        $("#authorizedDiv").hide();
      }
  });
  chrome.storage.sync.get("loans", function(data){
    _loans = data["loans"];
    // console.log('loans '+_loans.length);
  });
  chrome.storage.sync.get("dayBefore", function(data){
      _dayBefore = data["dayBefore"];
      console.log('_dayBefore '+_dayBefore);
      $("#dayBeforeCheckbox").prop('checked', _dayBefore);
  });
  chrome.storage.sync.get("calendarSelect", function(data){
      _calendarSelect = data["calendarSelect"];
      console.log('_calendarSelect '+_calendarSelect);
  });

})
.on('click', '#googleAuthButton', function() {
  console.log('#googleAuthButton');
  getAuthToken();
})
.on('change', '#calendarSelect', function() {
  console.log('#calendarSelect - change');
  _calendarSelect = $("#calendarSelect option:selected").val();
  chrome.storage.sync.set({"calendarSelect": _calendarSelect});
  // re-init all lists
  initLoansList(initEventsList());
})
.on('change', '#dayBeforeCheckbox', function() {
  console.log('#dayBeforeCheckbox - change');
  _dayBefore = this.checked;
  chrome.storage.sync.set({"dayBefore": _dayBefore});
});

function initUserCalendarSelect() {
  _webServices.getCalendarList(
    function(result) {
      console.log('getCalendarList - result: '+result.items.length);
      for (var i = 0; i < result.items.length; i++) { 
        var item = result.items[i];
        if (_.isEqual(item.accessRole, "owner") && _.isEqual(item.primary, true)) {
          _calendarSelect = item.id;
        }
      }
      initLoansList(initEventsList());
    },
    function (xOptions, textStatus) {
      console.log('getCalendarList - xOptions: '+xOptions);
      if (_.isEqual(xOptions.status, 401)) { // Unauthorized, token must be refreshed
        $("#googleAuthButton").show();
        $("#authorizedDiv").hide();
      }
    }
  );
}

function initLoansList(callbackEnd) {
  $('#loansListUl').empty();
  for (var i = 0; i < _loans.length; i++) { 
    var loanItem = _loans[i];
    if (!_.isNull(loanItem)) {
      // check if the event is already added to the calendar
      _webServices.getEvent(_calendarSelect, loanItem, _dayBefore,
        function(result, loan) {
          var htmlContent = '<li class="collection-item avatar" id="'+loan.number+'"><i class="mdi-av-my-library-books circle black"></i><span class="truncate"><b>' + loan.title 
            + '</b></span><p>'+loan.number+'<br>'+loan.due+'</p>';
          if (_.isEqual(result.items.length, 1)) {
            console.log('getEvent');
            var item = result.items[0];
            htmlContent += '<a href="'+item.htmlLink+'" target="_blank" class="secondary-content"><i class="tiny mdi-action-open-in-browser"></i></a>';
          } else {
            insertEvent(loan);
          }
          $('#loansListUl').append(htmlContent + '</li>');
          if (callbackEnd) {
            callbackEnd();
          }
        },
        function (xOptions, textStatus) {
          console.log('getEvent - xOptions: '+xOptions);
          chrome.identity.getAuthToken({'interactive': false}, function(token) {
              chrome.identity.removeCachedAuthToken({token:token}, function(){
                  console.log('logout');
              });
          });
        }
      );
    }
  }
}

function initEventsList(loan) {
  $('#eventsListUl').empty();
   _webServices.getNextEvents(_calendarSelect, loan, 
      function(result, loan) {
        if (result.items.length > 0) {
          for (var i = 0; i < result.items.length; i++) { 
            var item = result.items[i];
            var htmlContent = '<li class="collection-item avatar"><i class="mdi-notification-event-available circle blue darken-2"></i><span class="truncate"><b>' + item.summary 
              + '</b></span><p>'+item.start.date+/*'<br>'+item.summary+*/'</p>';
            var htmlLink =  '<a href="'+item.htmlLink+'" target="_blank" class="secondary-content"><i class="tiny mdi-action-open-in-browser"></i></a>';
            $('#eventsListUl').append(htmlContent + htmlLink + '</li>');
            // Add to the associated loan  the event link
            $('#loansListUl li').filter('#'+loan.number).append(htmlLink);
          }
        }
      },
      function (xOptions, textStatus) {
        console.log('getEvent - xOptions: '+xOptions);
      }
    );
}    

function getAuthToken() {
  chrome.identity.getAuthToken({ 'interactive': true }, function(token) {
    // Use the token.
    _token = token;
    console.log('token retrieved: ' + _token);
    chrome.storage.sync.set({token: _token});
    location.reload();
  });
}

function insertEvent(loan) {
  _webServices.insertEvent(_calendarSelect, loan.title, loan.number, loan.due, _dayBefore, function(result) {
    console.log('insertEvent - added: '+loan.title);
    Materialize.toast(chrome.i18n.getMessage("eventAdded") + loan.title, 4000);
    initEventsList(loan);
  });
}

