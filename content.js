function block() {
  //Stop the original page from loading.
  window.stop();

  // Replace document content with blocking template.
  $.ajax({
    url: chrome.extension.getURL('template.html'),
    async: false,
    success: function(html) {
      document.all[0].innerHTML = html;
    }
  });

  chrome.storage.sync.get('waitTime', function(items) {
    var waitTime = items.waitTime;
    document.getElementById('timer').innerHTML = waitTime;

    var timer = setInterval(function() {
      if (waitTime === 0) {
        clearInterval(timer);
        unblock();
      } else {
         document.getElementById('timer').innerHTML = waitTime;
         waitTime -= 1;
      }
    }, 1000);
  });
}

function unblock() {
  chrome.runtime.sendMessage({
    subject: "unblock",
    hostname: window.location.hostname
  });

  window.location.reload();
}


var message = {
  subject: "blocked",
  hostname: window.location.hostname
};

chrome.runtime.sendMessage(message, function(response) {
  if (response === true) {
    block();
  }
});
