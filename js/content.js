function block() {
  // Stop the original page from loading.
  window.stop();

  // Synchronously replace document content with blocking template.
  var request = new XMLHttpRequest();
  request.open("GET", chrome.extension.getURL("index.html"), false);
  request.send();

  if (request.status === 200) {
    var message = { subject: "randomImageId" };
    chrome.runtime.sendMessage(message, function(imageId) {
      var html = request.responseText.replace(/{{imageId}}/g, imageId);
      document.all[0].innerHTML = html;

      // Start the countdown
      chrome.storage.sync.get(defaultOptions, function(items) {
        var waitTime = items.waitTime;
        document.getElementById('timer').innerHTML = waitTime;

        var timer = setInterval(function() {
          if (waitTime <= 0) {
            clearInterval(timer);

            chrome.runtime.sendMessage({ subject: "unblock" }, function(response) {
              window.location.reload();
            });
          } else {
            document.getElementById('timer').innerHTML = waitTime;
            waitTime -= 1;
          }
        }, 1000);
      });
    });
  }
}

// Everytime a new page loads, extension checks whether domain should be blocked
// with the background page. If that is true, the page loading is stopped,
// whole HTML page is swapped with blocking page, which then waits for the
// specified period of time. Afterwards the original page reloaded, and background
// page is instructed to not block the page for a while.
chrome.runtime.sendMessage({ subject: "blocked" }, function(response) {
  if (response === true) {
    block();
  }
});
