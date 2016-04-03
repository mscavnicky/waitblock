// Local copy of extension options
var options = defaultOptions;
// Hash of times in milliseconds when particular domain was blocked.
var unblockTimes = {};
// The list of preloaded unsplash image links
var imageList = [];

// Determine whether specific hostname is currently blocked. Domain is blocked
// if it is in the blocklist and was not recently unblocked.
function blocked(message, sender) {
  if (options.waitTime === '0')
    return false;

  var domain =  _.find(blockedDomains(), function (domain) {
    return urlToHostname(sender.tab.url).endsWith(domain);
  });

  if (_.isUndefined(domain))
    return false;

  var unblockTime = unblockTimes[domain];
  if (_.isUndefined(unblockTime))
    return true;

  // Site is blocked again when the it was unblocked for too long.
  var blocked = Date.now() - unblockTime > options.blockTime * 60 * 1000

  // Given that the website is blocked, we may need to show the remaining time.
  if (blocked === false) {
    updateRemainingTime(sender);
  }

  return blocked;
}

function unblock(message, sender) {
  var domain =  _.find(blockedDomains(), function (domain) {
    return urlToHostname(sender.tab.url).endsWith(domain);
  });

  unblockTimes[domain] = Date.now();

  updateRemainingTime(sender);
}

function updateRemainingTime(sender) {
  var domain =  _.find(blockedDomains(), function (domain) {
    return urlToHostname(sender.tab.url).endsWith(domain);
  });

  var timer = setInterval(function() {
    var remainingMillis = (options.blockTime * 1000 * 60) - (Date.now() - unblockTimes[domain]);
    var remainingSeconds = Math.floor(remainingMillis / 1000);
    var remainingMinutes = Math.floor(remainingSeconds / 60);

    if (remainingMinutes < 0) {
      clearInterval(timer);
      chrome.tabs.reload(sender.tab.id);
      return;
    }

    var text = remainingSeconds > 59 ? remainingMinutes + "m" : remainingSeconds + "s";
    chrome.browserAction.setBadgeText({ text: text, tabId: sender.tab.id });
  }, 1000);
}

function urlToHostname(url) {
  var parser = document.createElement('a');
  parser.href = url;
  return parser.hostname;
}

function blockedDomains(blocklist) {
  if (options.blocklist.trim().length === 0)
    return [];

  // Some users separate domains by newline, even though comma is specified.
  return _.map(options.blocklist.split(/,|\n/), function(str) {
    return str.trim();
  });
}

function loadImageList() {
  var request = new XMLHttpRequest();
  request.onreadystatechange = function() {
    if (request.readyState == 4 && request.status == 200) {
      imageList = JSON.parse(request.response);
    }
  };
  request.open("GET", "https://unsplash.it/list", true);
  request.send();
}

function randomImageId() {
  var dayNumber = new Date().getTime() / (1000 * 60 * 60 * 24);

  // This is a fallback in case image list was not loaded yet.
  if (_.isEmpty(imageList)) {
    return 0;
  } else {
    // To prevent change of image when imageList grows, we se the amount
    // of maximum images on Unsplash to 950. There 974 of them at the moment
    // of writing.
    var randomIndex = (99991 * Math.floor(dayNumber)) % 950;
    return imageList[randomIndex].id;
  }
}

function blockingHtml() {
  var request = new XMLHttpRequest();
  request.open("GET", chrome.extension.getURL("index.html"), false);
  request.send();

  if (request.status === 200) {
    var imageId = randomImageId();
    var html = request.responseText.replace(/{{imageId}}/g, imageId);
    return html;
  } else {
    return "There might be an issue with WaitBlock.";
  }
}

loadImageList();

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
  sendResponse({
    'blocked': blocked,
    'unblock': unblock,
    'blockingHtml': blockingHtml
  }[message.subject](message, sender));
});
