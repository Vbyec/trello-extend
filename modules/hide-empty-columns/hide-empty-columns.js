(function () {
  let intervalId, timeInterval;

  chrome.storage.sync.get({ hideEmptyColumns: false, hideEmptyColumnsInterval: 1 }, function (result) {
    if (result.hideEmptyColumns) {
      timeInterval = result.hideEmptyColumnsInterval;
      start();
    }
  });

  function hideEmptyLists() {
    document
      .querySelectorAll('.js-list.list-wrapper')
      .forEach(node => node.classList.toggle('hide', !node.querySelectorAll('.list-card:not(.hide)').length));
  }

  chrome.storage.onChanged.addListener(function (changes) {
    if (changes.hasOwnProperty('hideEmptyColumns')) {
      if (changes['hideEmptyColumns'].newValue) {
        start();
      } else {
        stop();
      }
    }
  });

  function start() {
    hideEmptyLists();
    intervalId = setInterval(hideEmptyLists, timeInterval * 1000);
  }

  function stop() {
    if (intervalId) {
      clearInterval(intervalId);
      show();
    }
  }

  function show() {
    document
      .querySelectorAll('.js-list.list-wrapper')
      .forEach(node => node.classList.toggle('hide', false));
  }
})();
