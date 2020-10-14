(function () {
  const cardNumObserver = new MutationObserver(onCardNumMutate);

  chrome.storage.sync.get({ showCardCount: true }, function (result) {
    if (result.showCardCount) {
      start();
    }
  });

  function start() {
    afterBoardLoaded()
      .then(content => {
        showCardsCountForAllColumns();
        startObserveCardsCountBlock();
        watchNewColumnsCreated(content);
      });
  }

  function onCardNumMutate(mutations) {
    mutations.forEach(mutation => mutation.target.classList.contains('hide') && showCardsCount(mutation.target));
  }

  function watchNewColumnsCreated(board) {
    const observer = new MutationObserver(function (mutations) {
      if (mutations.find(mutation => doesMutationAddNodeWithClass(mutation, 'js-list list-wrapper'))) {
        startObserveCardsCountBlock();
        showCardsCountForAllColumns();
      }
    });

    observer.observe(board, {
      childList: true,
      subtree: true,
    })
  }

  function startObserveCardsCountBlock() {
    document.querySelectorAll('.js-num-cards')
      .forEach(node => cardNumObserver.observe(node, {
        attributes: true,
        attributeFilter: ['class']
      }));
  }

  function afterBoardLoaded() {
    return new Promise(resolve => {
      if (document.querySelector('board-wrapper')) {
        resolve(document.querySelector('board-wrapper'));
      } else {
        const observer = new MutationObserver(function (mutations) {
          mutations.forEach(mutation => {
            if (doesMutationAddNodeWithClass(mutation, 'board-wrapper')) {
              resolve(Array.from(mutation.addedNodes).find(node => node.nodeType === Node.ELEMENT_NODE && node.className === 'board-wrapper'));
              observer.disconnect()
            }
          })
        });
        observer.observe(document, {
          childList: true,
          subtree: true,
        });
      }
    });
  }

  function showCardsCountForAllColumns() {
    document.querySelectorAll('.js-num-cards').forEach(showCardsCount);
  }

  function showCardsCount(node) {
    node.classList.remove('hide');
  }

  function doesMutationAddNodeWithClass(mutation, className) {
    return mutation.type === 'childList' && mutation.addedNodes.length && Array.from(mutation.addedNodes).find(node => node.nodeType === Node.ELEMENT_NODE && node.className === className)
  }
})();


