function saveOptions() {
  options = {
    waitTime: document.getElementById('waitTime').value,
    blockTime: document.getElementById('blockTime').value,
    blocklist: document.getElementById('blocklist').value
  };

  chrome.storage.sync.set(options, function() {
    document.getElementById('flash').textContent = 'Options saved.';
    setTimeout(function() {
      document.getElementById('flash').textContent = '';
    }, 2500);
  });
}

function restoreOptions() {
  defaultOptions = {
    waitTime: 30,
    blockTime: 5,
    blocklist: 'facebook.com'
  };

  chrome.storage.sync.get(defaultOptions, function(items) {
    document.getElementById('waitTime').value = items.waitTime;
    document.getElementById('blockTime').value = items.blockTime;
    document.getElementById('blocklist').value = items.blocklist;

    document.getElementById('waitTimeOutput').value = items.waitTime;
    document.getElementById('blockTimeOutput').value = items.blockTime;
  });
}

document.getElementById('waitTime').addEventListener('input', function() {
  var value = document.getElementById('waitTime').value;
  document.getElementById('waitTimeOutput').value = value;
});

document.getElementById('blockTime').addEventListener('input', function() {
  var value = document.getElementById('blockTime').value;
  document.getElementById('blockTimeOutput').value = value;
});

document.getElementById('saveOptions').addEventListener('click', saveOptions);

document.addEventListener('DOMContentLoaded', restoreOptions);
