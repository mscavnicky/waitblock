// Local copy of extension options
var options = defaultOptions;
// Hash of times in milliseconds when particular domain was blocked.
var unblockTimes = {};

// Default URL for the background image. Should always load.
DEFAULT_IMAGE_URL = 'https://source.unsplash.com/collection/323879/1440x900/daily';

// Cached URL or the last displayed image.
var imageUrl = DEFAULT_IMAGE_URL;

// Determine whether specific hostname is currently blocked. Domain is blocked
// if it is in the blocklist and was not recently unblocked.
function blocked(message, sender) {
  if (options.waitTime === '0')
    return false;

  var domain = blockedDomain(sender.tab.url);
  if (_.isUndefined(domain))
    return false;

  var unblockTime = unblockTimes[domain];
  if (_.isUndefined(unblockTime))
    return true;

  // Site is blocked again when the it was unblocked for too long.
  return Date.now() - unblockTime > options.blockTime * 60 * 1000;
}

function unblock(message, sender) {
  var domain = blockedDomain(sender.tab.url);
  unblockTimes[domain] = Date.now();
}

function blockedDomain(url) {
  var hostname = urlToHostname(url);
  var blocklist = parseDomains(options.blocklist);
  var whitelist = parseDomains(options.whitelist);

  return _.find(blocklist, function (domain) {
    return hostname.endsWith(domain) && !_.any(whitelist, function(subdomain) {
      return hostname.endsWith(subdomain);
    });
  });
}

function urlToHostname(url) {
  var parser = document.createElement('a');
  parser.href = url;
  return parser.hostname;
}

function parseDomains(blocklist) {
  if (blocklist.trim().length === 0)
    return [];

  // Some users separate domains by newline, even though comma is specified.
  return _.map(blocklist.split(/,|\n/), function(str) {
    return str.trim();
  });
}

function blockingHtml() {
  refreshImageUrl();

  var request = new XMLHttpRequest();
  request.open('GET', chrome.extension.getURL("index.html"), false);
  request.send();

  if (request.status !== 200) {
    return "There might be an issue with WaitBlock.";
  }

  return request.responseText.replace(/{{imageUrl}}/g, imageUrl);
}

function hasCustomBackground() {
  var userBackgrounds = window.options.background.split(',');
  return userBackgrounds.length > 0 && userBackgrounds[0] != "";
}

function randomUserBackground() {
  var userBackgrounds = window.options.background.split(',');
  var randomUserBackground = userBackgrounds[Math.floor(Math.random()*userBackgrounds.length)]
  return randomUserBackground;
}

// The default image URL we are currently using, redirects to the actual URL
// of the actual image. This is slow and destroys user experience. Therefore we
// do cache the URL of the actual image in a global variable.
function refreshImageUrl() {
  if (hasCustomBackground()) {
    imageUrl = randomUserBackground();
  } else {
    var request = new XMLHttpRequest();
    request.onreadystatechange = function() {
      if (request.readyState === XMLHttpRequest.DONE && request.status === 200) {
        imageUrl = request.responseURL;
      }
    };
    request.open('GET', imageUrl)
    request.send();
  }
}

// Fetch image URL on startup to speed up the first image load.
refreshImageUrl();

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

// Currently active tab ID where the counter is being decreased.
var activeTabId = null;
var activeWindowId = null;

function isActivated(message, sender) {
  if (activeWindowId === null || activeTabId === null)
    return false;
  return sender.tab.windowId === activeWindowId && sender.tab.id === activeTabId;
}

chrome.tabs.onActivated.addListener(function(activeInfo) {
  activeTabId = activeInfo.tabId;
});

chrome.windows.onFocusChanged.addListener(function(windowId) {
  if (windowId === chrome.windows.WINDOW_ID_NONE) {
    activeTabId = null;
    activeWindowId = null;
  } else {
    activeWindowId = windowId;
    // Changing window, does not fire chrome.tabs.onActivated, so one needs to
    // fetch the active tab ID manually.
    chrome.tabs.query({ currentWindow: true, active: true }, function(tabs) {
      activeTabId = tabs[0].id;
    });
  }
});

// Initialize active window on extension startup.
chrome.windows.getCurrent(function(window) {
  activeWindowId = window.id;
});

// Initialize active tab on extension startup.
chrome.tabs.query({ currentWindow: true, active: true }, function(tabs) {
  activeTabId = tabs[0].id;
});

chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
  sendResponse({
    'blocked': blocked,
    'unblock': unblock,
    'blockingHtml': blockingHtml,
    'isActivated': isActivated
  }[message.subject](message, sender));
});
