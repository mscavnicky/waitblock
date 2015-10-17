var spinBlock = {}

function isUnblocked(tabId, location) {
  console.log("SpinBlock: " + JSON.stringify(spinBlock));
  return spinBlock[tabId] === location;
}

function unblock(tabId, location) {
  spinBlock[tabId] = location;
}

chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
  if (message.subject === "isUnblocked") {
    console.log("Received isUnblocked message for tab " + sender.tab.id);
    sendResponse(isUnblocked(sender.tab.id, message.location));
  } else if (message.subject === "unblock") {
    console.log("Received unblock message for tab " + sender.tab.id);
    unblock(sender.tab.id, message.location)
  }
});