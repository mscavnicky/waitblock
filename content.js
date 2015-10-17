var isUnblocked = false;

var message = {
  subject: "isUnblocked",
  location: window.location.hostname
};

chrome.runtime.sendMessage(message, function(response) {
  console.log("isUnblocked returned " + response);
  isUnblocked = response;

  if (!isUnblocked) {
    // In this stage of page lifecycle body element does 
    // not exist and we need to manually create it.
    var body = document.createElement("body");
    document.documentElement.appendChild(body);

    $.ajax({
      url: chrome.extension.getURL('template.html'),
      success: function(html) {
        document.body.innerHTML = html;
        // Stop the original page from loading
        window.stop();
      }
    });

    setTimeout(function() {
      chrome.runtime.sendMessage({
        subject: "unblock",
        location: window.location.hostname
      });

      window.location.reload()
    }, 5000);
  }
});