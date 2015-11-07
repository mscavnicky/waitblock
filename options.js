function saveOptions() {
  options = {
    waitTime: $('waitTime').value,
    blockTime: $('blockTime').value,
    blocklist: $('blocklist').value
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

    // Setting value does not trigger click oninput event.
    $('waitTimeOutput').value = items.waitTime;
    $('blockTimeOutput').value = items.blockTime;
  });
}

// Convenience function slightly (different from the jQuery one).
function $(id) {
  return document.getElementById(id);
}

$('waitTime').addEventListener('input', function() {
  $('waitTimeOutput').value = $('waitTime').value;
});

$('blockTime').addEventListener('input', function() {
  $('blockTimeOutput').value = $('blockTime').value;
});

$('saveOptions').addEventListener('click', saveOptions);

document.addEventListener('DOMContentLoaded', restoreOptions);
