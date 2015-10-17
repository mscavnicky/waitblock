var isUnblocked = false;

var message = {
  subject: "isUnblocked",
  location: window.location.hostname
};

chrome.runtime.sendMessage(message, function(response) {
  console.log("isUnblocked returned " + response);
  isUnblocked = response;

  if (!isUnblocked) {
    console.log("Stopping page load.")
    window.stop();

    setTimeout(function() {
      chrome.runtime.sendMessage({
        subject: "unblock",
        location: window.location.hostname
      });

      setTimeout(function() { 
        window.location.reload()
      }, 3000);
    }, 3000);  
  }
});