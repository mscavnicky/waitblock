// Default options
var options = {
  // Time to wait before unblocking the page. In milliseconds.
  waitTime: 30,
  // Time to wait till the page is blocked after unblocking. In milliseconds.
  blockTime: 5,
  // The list of domains to block. Covers subdomains as well.
  blocklist: 'facebook.com'
};

// Hash of times in milliseconds when particular domain was blocked.
var unblockTimes = {};

// Determine whether specific hostname is currently blocked. Domain is blocked
// if it is in the blocklist and was not recently unblocked.
function blocked(message) {
  // Handle special case
  if (options.waitTime === '0')
    return false;

  var domain =  _.find(parsedBlocklist(), function (domain) {
    return message.hostname.endsWith(domain);
  });

  if (_.isUndefined(domain))
    return false;

  var unblockTime = unblockTimes[domain];
  if (_.isUndefined(unblockTime))
    return true;

  // Site is blocked again when the it was unblocked for too long.
  return Date.now() - unblockTime > options.blockTime * 60 * 1000;
}

function unblock(message) {
  var domain =  _.find(parsedBlocklist(), function (domain) {
    return message.hostname.endsWith(domain);
  });

  unblockTimes[domain] = Date.now();
}

function parsedBlocklist(blocklist) {
  if (options.blocklist.trim().length === 0)
    return [];

  return _.map(options.blocklist.split(','), function(str) {
    return str.trim();
  });
}

// Load the options from storage.
chrome.storage.sync.get(options, function(items) {
  _.mapObject(items, function (value, key) {
    options[key] = value;
  });
});

// Listen to changes in options and reload when necesasary
chrome.storage.onChanged.addListener(function(changes) {
  _.mapObject(changes, function(change, key) {
    options[key] = change.newValue;
  });
});

chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
  console.log("Received message " + message.subject);

  sendResponse({
    'blocked': blocked,
    'unblock': unblock
  }[message.subject](message));
});
