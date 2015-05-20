'use strict';

var _loans, _calendarSelect, _loanSync = 0;
var _webServices = new WebServices();

$(document).ready(function() {
  console.log('document ready');
  $("#authorizedDiv").hide();

  // init i18n
  $('[i18n-content]').each(function(index, element){
        element.innerHTML = chrome.i18n.getMessage($(this).attr('i18n-content'));
    });

  chrome.storage.sync.get("loans", function(data){
    _loans = data["loans"];
  });

  GAuth.getToken();

 }) 
.on('click', '#googleAuthButton', function() {
  console.log('#googleAuthButton');
  GAuth.getAuthToken();
});

function start() {
  if (!_.isUndefined(_token)) {
    $("#googleAuthButton").hide();
    initUserCalendarSelect();
  } else {
    $("#googleAuthButton").show();
    $("#authorizedDiv").hide();

  }
}

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
      initLoansList();
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


function initLoansList() {
  $('#loansListUl').empty();
  if (!_.isUndefined(_loans)) {
    for (var i = 0; i < _loans.length; i++) { 
      var loanItem = _loans[i];
      if (!_.isNull(loanItem)) {
        // FOR EACH LOAN FROM PAGE
        getEvent(loanItem);
      }
    }
  } else {
    $('#loansListUl').append('<li class="collection-item">'+chrome.i18n.getMessage("noLoan")+'</li>');
  }
}

function getEvent(loanItem) {
  _webServices.getEvent(_calendarSelect, loanItem,
    function(result, loan) {
      if (_.isEqual(result.items.length, 1)) { // event exists
        var htmlContent = '<li class="collection-item avatar" id="'+loan.number+'"><i class="mdi-notification-event-available circle blue darken-2"></i><span class="truncate"><b>' + loan.title 
        + '</b></span><p>'+loan.number+'<br>'+loan.due+' - <i>'+Util.getDayLeft(loan.due)+' '+chrome.i18n.getMessage("daysLeft")+'</i></p>';
        var item = result.items[0];
        // check if it's the same date (Renewloan case)
        var banqDate = Util.banqDateToEventDate(loan.due, false);
        if (_.isEqual(item.start.date, banqDate) && _.isEqual(item.end.date, banqDate)) {
          htmlContent += '<a href="'+item.htmlLink+'" target="_blank" class="secondary-content"><i class="tiny mdi-action-open-in-browser"></i></a>';
        } else {
          _webServices.deleteEvent(_calendarSelect, item.id,
            function(result) {
              insertEvent(loan);
            },
            function (xOptions, textStatus) {
              insertEvent(loan);
            }
          );
        }
      } else { // event not exists
        insertEvent(loan);
      }
      if (!_.isUndefined(htmlContent)) { 
        $("#authorizedDiv").show();
        $('#loansListUl').append(htmlContent + '</li>');
        _loanSync++;
        if (_.isEqual(_loanSync, _loans.length)) {
          // TODO: ordering ?!
          $(".progress").hide();
        }
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
  _webServices.insertEvent(_calendarSelect, loan.title, loan.number, loan.due, function(result) {
    console.log('insertEvent - added: '+loan.title);
    // Materialize.toast(chrome.i18n.getMessage("eventAdded") + loan.title, 4000);
    sendNotification(loan);
    getEvent(loan);
    $('#loansListUl li').filter('#'+loan.number).remove();
  });
}

function sendNotification(loan) {
  var options = {
    type: "basic",
    title: chrome.i18n.getMessage("appName"),
    message: chrome.i18n.getMessage("eventAdded") + '\n' +loan.title,
    iconUrl: "images/icon-48.png"
  }
  chrome.notifications.create(null, options);
}

