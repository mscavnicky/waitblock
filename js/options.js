function saveOptions() {
  options = {
    waitTime: $('waitTime').value,
    blockTime: $('blockTime').value,
    blocklist: $('blocklist').value,
    whitelist: $('whitelist').value,
    background: $('background').value
  };

  chrome.storage.sync.set(options, function() {
    $('flash').textContent = 'Options saved.';
    setTimeout(function() { $('flash').textContent = ''; }, 2500);
  });
}

function restoreOptions() {
  chrome.storage.sync.get(defaultOptions, function(items) {
    $('waitTime').value = items.waitTime;
    $('blockTime').value = items.blockTime;
    $('blocklist').value = items.blocklist;
    $('whitelist').value = items.whitelist;
    $('background').value = items.background;

    // Setting value does not trigger click oninput event.
    $('waitTimeOutput').value = humanizeTime(items.waitTime);
    $('blockTimeOutput').value = humanizeTime(items.blockTime * 60);
  });
}

// Convenience function slightly (different from the jQuery one).
function $(id) {
  return document.getElementById(id);
}

function humanizeTime(seconds) {
  var str = "";
  if (seconds > 59) {
    str += Math.floor(seconds / 60) + " minutes ";
    seconds = seconds % 60;
  }
  // For 0 seconds we want to display '0 seconds'
  if (str == "" || seconds > 0) {
    str += seconds + " seconds";
  }
  return str;
}

$('waitTime').addEventListener('input', function() {
  $('waitTimeOutput').value = humanizeTime($('waitTime').value);
});

$('blockTime').addEventListener('input', function() {
  $('blockTimeOutput').value = humanizeTime($('blockTime').value * 60);
});

$('saveOptions').addEventListener('click', saveOptions);

document.addEventListener('DOMContentLoaded', restoreOptions);
