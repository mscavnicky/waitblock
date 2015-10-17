function block() {
  //Stop the original page from loading.
  window.stop();

  // Replace document content with blocking template.
  $.ajax({
    url: chrome.extension.getURL('template.html'),
    success: function(html) {
      document.all[0].innerHTML = html;
    }
  });

  setTimeout(function() {
    chrome.runtime.sendMessage({
      subject: "unblock",
      hostname: window.location.hostname
    });

    window.location.reload();
  }, 30000);
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
