var isUnblocked = false;

var message = {
  subject: "isUnblocked",
  location: window.location.hostname
};

chrome.runtime.sendMessage(message, function(response) {
  console.log("isUnblocked returned " + response);
  isUnblocked = response;

  if (!isUnblocked) {
    var body = document.createElement("body");
    document.documentElement.appendChild(body);
    document.body.innerHTML = '<div id="stop"><img src="http://robinberzinmd.com/wp-content/uploads/2014/05/mac-air-iphone-wood-table-pic-2-16x9.jpg"/></div>'; 

    console.log("Stopping page load.");
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