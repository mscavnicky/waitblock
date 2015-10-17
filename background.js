// Time to wait before unblocking the page. In milliseconds.
var unblockTime = 15000;
// Time to wait till the page is blocked after unblocking. In milliseconds.
var blockTime = 5 * 60 * 1000;

// The list of domains to block. Covers subdomains as well.
var blockedDomains = [
  'facebook.com',
  'idnes.cz',
  'pravda.sk'
];

// Hash of times in milliseconds when particular domain was blocked.
var domainUnblockTimes = {};

// Determine whether specific hostname is currently blocked. Domain is blocked
// if it is in the blocklist and was not recently unblocked.
function blocked(message) {
  var domain =  _.find(blockedDomains, function (domain) {
    return message.hostname.endsWith(domain);
  });

  if (_.isUndefined(domain)) {
    return false;
  }

  var domainUnblockTime = domainUnblockTimes[domain];
  if (_.isUndefined(domainUnblockTime)) {
    return true;
  }
  console.log("Unblock time " + domainUnblockTime);

  // Site is blocked again when the it was unblocked for too long.
  console.log("Time since unblock " + (Date.now() - domainUnblockTime));
  return Date.now() - domainUnblockTime > blockTime;
}

function unblock(message) {
  var domain =  _.find(blockedDomains, function (domain) {
    return message.hostname.endsWith(domain);
  });

  domainUnblockTimes[domain] = Date.now();
}

chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
  console.log("Received message " + message.subject);

  sendResponse({
    'blocked': blocked,
    'unblock': unblock
  }[message.subject](message));
});
