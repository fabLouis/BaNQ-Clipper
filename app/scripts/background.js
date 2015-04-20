'use strict';

// When the extension is installed or upgraded ...
chrome.runtime.onInstalled.addListener(function() {
  // Replace all rules ...
  chrome.declarativeContent.onPageChanged.removeRules(undefined, function() {
    // With a new rule ...
    chrome.declarativeContent.onPageChanged.addRules([
      {
        // That fires when a page's URL contains a 'g' ...
        conditions: [
          new chrome.declarativeContent.PageStateMatcher({
            pageUrl: { urlContains: 'iris.banq.qc.ca' }
          })
        ],
        // And shows the extension's page action.
        actions: [ new chrome.declarativeContent.ShowPageAction() ]
      }
    ]);
  });
});

// chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab){
//     if(changeInfo && changeInfo.status == "complete"){
//         chrome.tabs.executeScript(tabId, {file: "bower_components/jquery/dist/jquery.min.js"}, function(){
//             chrome.tabs.executeScript(tabId, {file: "scripts/content.js"});
//         });
//     }
//     if (tab.url.indexOf('iris.banq.qc.ca') > -1) {
// 	    // Show icon for page action in the current tab.
// 	    chrome.pageAction.show(tabId);
// 	  }
// });

// chrome.runtime.onMessage.addListener(
//   function(req, sender, sendResponse) {
//   if (req.loans) {
//   	sendResponse({result: "catch it"});
//     var loans = req.loans;
//     console.log('loans '+loans.length);
//     $( "h1" ).append(loans.length);
//   }
// });


// console.log('\'Allo \'Allo! Event Page for Page Action');
