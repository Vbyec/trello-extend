(function () {
  chrome.storage.sync.get({ fullWidthCard: false }, function (result) {
    document.querySelector('body').classList.toggle('full-width-card', result.fullWidthCard);
  });

  chrome.storage.onChanged.addListener(function (changes) {
    if (changes.hasOwnProperty('fullWidthCard')) {
      document.querySelector('body').classList.toggle('full-width-card', changes.fullWidthCard.newValue);
    }
  });

})();
