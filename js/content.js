function block() {
  // Stop the original page from loading. This needs to happen as soon as
  // possible to avoid flickering.
  window.stop();

  chrome.runtime.sendMessage({ subject: "blockingHtml" }, function(html) {
    // Replace document content with blocking template.
    document.all[0].innerHTML = html;

    // Start the countdown
    chrome.storage.sync.get(defaultOptions, function(items) {
      var waitTime = items.waitTime;
      document.getElementById('timer').innerHTML = waitTime;

      var timer = setInterval(function() {
        if (waitTime <= 0) {
          clearInterval(timer);

          // Notify background page to unblock domain
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

// Everytime a new page loads, extension checks whether domain should be blocked
// with the background page. If that is true, the page loading is stopped,
// whole HTML page is swapped with blocking page, which then waits for the
// specified period of time. Afterwards the original page reloaded, and background
// page is instructed to not block the tab for a while.
chrome.runtime.sendMessage({ subject: "blocked" }, function(response) {
  if (response === true) {
    block();
  }
});
