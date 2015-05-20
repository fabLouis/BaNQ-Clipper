
var _token;

var GAuth = GAuth || {};

GAuth.getToken = function() {
	console.log('GAuth.getToken...');
	chrome.identity.getAuthToken({ interactive: true }, function(authToken) {
	    if (chrome.runtime.lastError) {
	      callback(chrome.runtime.lastError);
	      return;
	    }
	    _token = authToken;
	    start();
    });
};

GAuth.removeCachedAuthToken = function(opt_callback) {
	console.log('GAuth.removeCachedAuthToken...');
	chrome.identity.removeCachedAuthToken({ token: _token }, GAuth.getToken);
};
