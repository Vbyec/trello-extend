(function () {
  start();

  function start() {
    detectCheckList(onCheckListDetected);
  }

  function detectCheckList(callback) {
    const observer = new MutationObserver(function (mutations) {
      mutations.forEach(mutation => {
        if (doesMutationAddNodeWithClass(mutation, 'checklist')) {
          Array.from(mutation.addedNodes)
            .filter(node => node.nodeType === Node.ELEMENT_NODE && node.classList.contains('checklist'))
            .forEach(node => callback(node));
        }
      })
    });
    observer.observe(document, {
      childList: true,
      subtree: true,
    });
  }

  function onCheckListDetected(container) {
    addButton(container.querySelector('.window-module-title-options'), 'Numerate', function (reNumerate = false) {
      numerateCheckList(container, reNumerate);
    })
  }

  async function numerateCheckList(container, reNumerate) {
    const items = container.querySelectorAll('.checklist-item');
    for (const index in items) {
      if (items.hasOwnProperty(index)) {
        await updateCheckListValue(items[index], index, reNumerate);
      }
    }
  }

  function updateCheckListValue(item, index, reNumerate = false) {
    return new Promise(resolve => {
      let text = item.querySelector('.checklist-item-details-text').textContent;
      item.querySelector('.checklist-item-details-text').click();
      setTimeout(() => {
        if (reNumerate) {
          text = removeNumerationFromText(text);
        }

        if (!isAlreadyNumerated(text)) {
          item.querySelector('textarea').value = addNumerationToText(text, index);
          item.querySelector('.js-save-edit').click();
          setTimeout(() => resolve(), 500);
        } else {
          item.querySelector('.js-cancel-edit').click();
          setTimeout(() => resolve(), 0);
        }
      }, 0);
    });
  }

  function isAlreadyNumerated(text) {
    return text.trim().match(/^\d+\)\s/);
  }

  function removeNumerationFromText(text) {
    return text.trim().replace(/^\d+\)\s/, '');
  }

  function addNumerationToText(text, index) {
    const numeration = parseInt(index, 10) + 1;
    return `${numeration}) ${text}`;
  }

  function doesMutationAddNodeWithClass(mutation, className) {
    return mutation.type === 'childList' && mutation.addedNodes.length && Array.from(mutation.addedNodes).find(node => node.nodeType === Node.ELEMENT_NODE && node.classList.contains(className))
  }

  function addButton(node, text, clickCallback) {
    const item = document.createElement('a');
    item.className = 'nch-button hide-on-edit';
    item.style.margin = '0 0 0 8px';
    item.innerHTML = `${text}`;
    item.href = '#';
    item.onclick = function (e) {
      e.preventDefault();
      e.stopPropagation();
      clickCallback(e.altKey);
      return false
    }
    node.appendChild(item);
    return item;
  }

})();
